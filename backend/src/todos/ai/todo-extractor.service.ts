import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod.js';
import Fuse from 'fuse.js'; 
import { Chunk, IExtractedTodo, TempInterface, TranscriptEntry } from './ai.types';

@Injectable()
export class TodoExtractorService {
  private ExtractedTodo = z.object({
    title: z.string(),
    description: z.string().optional(),
    assigneeName: z.string().optional(),
    dueDate: z.string().optional(),
  });

  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private chunkTranscript(
    content: string,
    chunkLength = 1200,
    chunkEntryOverlap = 2,
  ): Chunk[] {
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length && l !== 'WEBVTT' && !/^\d+$/.test(l));

    const entries: TranscriptEntry[] = [];
    let currentStart = '';
    let currentEnd = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('-->')) {
        const [start, end] = line.split('-->').map((s) => s.trim());
        currentStart = start;
        currentEnd = end;
      } else if (line.includes(':')) {
        const [speaker, ...rest] = line.split(':');
        const text = rest.join(':').trim();
        if (speaker && text) {
          entries.push({
            start: currentStart,
            end: currentEnd,
            speaker: speaker.trim(),
            text,
          });
        }
      }
    }

    // Merge same speaker consecutive lines
    const merged: TranscriptEntry[] = [];
    for (const entry of entries) {
      const last = merged[merged.length - 1];
      if (last && last.speaker === entry.speaker) {
        last.text += ' ' + entry.text;
        last.end = entry.end;
      } else {
        merged.push({ ...entry });
      }
    }

    // Chunk by word count
    const chunks: Chunk[] = [];
    let currentChunk: TranscriptEntry[] = [];
    let wordCount = 0;
    let chunkId = 1;

    const getWordCount = (txt: string) =>
      txt.trim().split(/\s+/).filter(Boolean).length;

    for (const entry of merged) {
      const wc = getWordCount(entry.text);
      if (wordCount + wc > chunkLength && currentChunk.length > 0) {
        chunks.push({
          chunkId,
          startTime: currentChunk[0].start,
          endTime: currentChunk[currentChunk.length - 1].end,
          text: currentChunk
            .map((e) => `${e.speaker}: ${e.text}`)
            .join('\n'),
          wordCount,
        });
        chunkId++;

        const overlap = currentChunk.slice(-chunkEntryOverlap);
        currentChunk = [...overlap];
        wordCount = overlap.reduce(
          (sum, e) => sum + getWordCount(e.text),
          0,
        );
      }

      currentChunk.push(entry);
      wordCount += wc;
    }

    if (currentChunk.length) {
      chunks.push({
        chunkId,
        startTime: currentChunk[0].start,
        endTime: currentChunk[currentChunk.length - 1].end,
        text: currentChunk
          .map((e) => `${e.speaker}: ${e.text}`)
          .join('\n'),
        wordCount,
      });
    }

    return chunks;
  }

  private async aInvokeLLM(chunk: string): Promise<TempInterface[]> {
    try {
      const response = await this.openai.responses.parse({
        model: 'gpt-4o',
        input: [
          {
            role: 'system',
            content:
              'You are a helpful AI meeting assistant that extracts actionable TODO items (title, description, assigneeName, dueDate) from meeting transcript chunks.',
          },
          {
            role: 'user',
            content: `Extract actionable TODOs from this transcript chunk:\n${chunk}`,
          },
        ],
        text: {
          format: zodTextFormat(z.array(this.ExtractedTodo), 'extracted_todos'),
        },
      });

      return response.output_parsed ?? [];
    } catch (err) {
      console.error('LLM call failed:', err);
      return [];
    }
  }

  private mergeTodos(todos: TempInterface[]): TempInterface[] {
    const unique: TempInterface[] = [];
    for (const todo of todos) {
      if (
        todo.title &&
        !unique.some(
          (u) => u.title.toLowerCase() === todo.title.toLowerCase(),
        )
      ) {
        unique.push(todo);
      }
    }
    return unique;
  }

  private fuzzySearch(todos: TempInterface[]): TempInterface[] {
    const fuse = new Fuse(todos, {
      keys: ['title'],
      threshold: 0.3,
    });

    const unique: TempInterface[] = [];
    for (const todo of todos) {
      const dup = fuse.search(todo.title).find(
        (r) =>
          r.item.title !== todo.title &&
          r.score !== undefined &&
          r.score < 0.2,
      );
      if (!dup) unique.push(todo);
    }
    return unique;
  }

  async extractTodos(transcript: string): Promise<IExtractedTodo[]> {
    const chunks = this.chunkTranscript(transcript);

    const results = await Promise.all(
      chunks.map((c) => this.aInvokeLLM(c.text)),
    );

    const todosPerChunk: TempInterface[] = results.flat();

    const mergedTodos = this.mergeTodos(todosPerChunk);
    const finalTodos = this.fuzzySearch(mergedTodos);

    return finalTodos;
  }
}
