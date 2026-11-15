import { PrologStatus, PrologAnswer, WorkerResponse } from '../types';

export class PrologEngine {
  private worker: Worker | null = null;
  private status: PrologStatus = 'loading';
  private onStatusChangeCallbacks: ((status: PrologStatus) => void)[] = [];
  private onAnswerCallbacks: ((answer: PrologAnswer, hasMore: boolean) => void)[] = [];
  private onLogCallbacks: ((type: 'system' | 'error' | 'false', message: string) => void)[] = [];
  private onQuerySuccessCallbacks: ((goal: string) => void)[] = [];

  constructor() {
    this.spawnWorker();
  }

  private spawnWorker() {
    if (this.worker) {
      this.worker.terminate();
    }
    this.setStatus('loading');

    this.worker = new Worker(new URL('../worker/prolog.worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'ready') {
        this.setStatus('ready');
      } else if (data.type === 'consult_success') {
        this.setStatus('ready');
        this.onLogCallbacks.forEach(cb => cb('system', data.message));
      } else if (data.type === 'consult_error') {
        this.setStatus('error');
        this.onLogCallbacks.forEach(cb => cb('error', data.error));
      } else if (data.type === 'query_success') {
        this.setStatus('answering');
        this.onQuerySuccessCallbacks.forEach(cb => cb(data.goal));
      } else if (data.type === 'query_error') {
        this.setStatus('ready');
        this.onLogCallbacks.forEach(cb => cb('error', data.error));
      } else if (data.type === 'answer') {
        this.onAnswerCallbacks.forEach(cb => cb(data.answer, data.hasMore));
        if (!data.hasMore) {
          this.setStatus('ready');
        }
      } else if (data.type === 'no_more_answers') {
        this.setStatus('ready');
        this.onLogCallbacks.forEach(cb => cb('false', 'false.'));
      } else if (data.type === 'error') {
        this.setStatus('error');
        this.onLogCallbacks.forEach(cb => cb('error', data.error));
      }
    };

    this.worker.onerror = (err) => {
      this.setStatus('error');
      this.onLogCallbacks.forEach(cb => cb('error', `Worker Exception: ${err.message}`));
    };
  }

  public getStatus(): PrologStatus {
    return this.status;
  }

  private setStatus(newStatus: PrologStatus) {
    this.status = newStatus;
    this.onStatusChangeCallbacks.forEach(cb => cb(newStatus));
  }

  public onStatusChange(cb: (status: PrologStatus) => void): () => void {
    this.onStatusChangeCallbacks.push(cb);
    cb(this.status);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== cb);
    };
  }

  public onAnswer(cb: (answer: PrologAnswer, hasMore: boolean) => void): () => void {
    this.onAnswerCallbacks.push(cb);
    return () => {
      this.onAnswerCallbacks = this.onAnswerCallbacks.filter(c => c !== cb);
    };
  }

  public onLog(cb: (type: 'system' | 'error' | 'false', message: string) => void): () => void {
    this.onLogCallbacks.push(cb);
    return () => {
      this.onLogCallbacks = this.onLogCallbacks.filter(c => c !== cb);
    };
  }

  public onQuerySuccess(cb: (goal: string) => void): () => void {
    this.onQuerySuccessCallbacks.push(cb);
    return () => {
      this.onQuerySuccessCallbacks = this.onQuerySuccessCallbacks.filter(c => c !== cb);
    };
  }

  public consult(code: string) {
    this.setStatus('consulting');
    this.worker?.postMessage({ type: 'consult', code });
  }

  public query(goal: string) {
    this.setStatus('querying');
    this.worker?.postMessage({ type: 'query', goal });
  }

  public nextAnswer() {
    this.setStatus('answering');
    this.worker?.postMessage({ type: 'next_answer' });
  }

  public findAll(maxAnswers = 100) {
    this.setStatus('answering');
    this.worker?.postMessage({ type: 'find_all', maxAnswers });
  }

  public stop() {
    this.onLogCallbacks.forEach(cb => cb('system', 'Выполнение прервано пользователем'));
    this.worker?.postMessage({ type: 'stop' });
    this.setStatus('ready');
  }

  public restart() {
    this.onLogCallbacks.forEach(cb => cb('system', 'Сеанс Prolog перезапущен'));
    this.spawnWorker();
  }
}

export const prologEngine = new PrologEngine();

