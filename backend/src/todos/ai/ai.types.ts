export interface TempInterface {
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate?: string;
}

export interface IExtractedTodo {
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate?: string;
}

export interface TranscriptEntry {
  start: string;
  end: string;
  speaker: string;
  text: string;
}

export interface Chunk {
  chunkId: number;
  startTime: string;
  endTime: string;
  text: string;
  wordCount: number;
}
