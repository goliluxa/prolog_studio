export type PrologStatus = 'loading' | 'ready' | 'consulting' | 'querying' | 'answering' | 'error';

export type Theme = 'dark' | 'light';

export interface PrologSubstitution {
  [variable: string]: string;
}

export interface PrologAnswer {
  status: 'success' | 'false' | 'error';
  bindings?: PrologSubstitution;
  rawText?: string;
  error?: string;
}

export type WorkerRequest =
  | { type: 'consult'; code: string }
  | { type: 'query'; goal: string }
  | { type: 'next_answer' }
  | { type: 'find_all'; maxAnswers?: number }
  | { type: 'stop' };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'consult_success'; message: string }
  | { type: 'consult_error'; error: string }
  | { type: 'query_success'; goal: string }
  | { type: 'query_error'; error: string }
  | { type: 'answer'; answer: PrologAnswer; hasMore: boolean }
  | { type: 'no_more_answers' }
  | { type: 'error'; error: string };

export interface ConsoleEntry {
  id: string;
  type: 'query' | 'answer' | 'error' | 'system' | 'false';
  text: string;
  bindings?: PrologSubstitution;
  hasMoreAnswers?: boolean;
  timestamp: number;
}

export interface ExampleProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
  suggestedQueries: string[];
}

