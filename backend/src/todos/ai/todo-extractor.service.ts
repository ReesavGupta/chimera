import { Injectable } from '@nestjs/common';

export interface ExtractedTodo {
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate?: string;
}

@Injectable()
export class TodoExtractorService {
  async extractTodos(transcript: string): Promise<ExtractedTodo[]> {
    // TODO: Replace with AI integration
    // For now, return empty array or some mocked data for testing
    return [];
  }
}