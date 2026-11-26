import './tau-browser-environment';

// @ts-ignore
import pl from 'tau-prolog';
// @ts-ignore
import loaderLists from 'tau-prolog/modules/lists';
// @ts-ignore
import loaderRandom from 'tau-prolog/modules/random';
// @ts-ignore
import loaderStatistics from 'tau-prolog/modules/statistics';

import type { WorkerRequest, WorkerResponse } from '../types';

loaderLists(pl);
loaderRandom(pl);
loaderStatistics(pl);

const textProgram = { script: false, file: false, url: false };
let session = pl.create(10000);

session.consult(':- use_module(library(lists)).', {
  ...textProgram,
  success: () => {
    self.postMessage({ type: 'ready' } as WorkerResponse);
  },
  error: () => {
    self.postMessage({ type: 'ready' } as WorkerResponse);
  }
});

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const data = e.data;
  if (!data) return;

  if (data.type === 'consult') {
    session = pl.create(10000);
    const fullCode = ':- use_module(library(lists)).\n' + data.code;
    session.consult(fullCode, {
      ...textProgram,
      success: () => {
        self.postMessage({
          type: 'consult_success',
          message: 'База знаний успешно скомпилирована'
        } as WorkerResponse);
      },
      error: (err: any) => {
        const msg = pl.format_answer(err) || (err ? err.toString() : 'Ошибка синтаксиса');
        self.postMessage({
          type: 'consult_error',
          error: msg
        } as WorkerResponse);
      }
    });
  } else if (data.type === 'query') {
    let goal = data.goal.trim();
    if (goal.startsWith('?-')) goal = goal.substring(2).trim();
    if (!goal.endsWith('.')) goal += '.';

    session.query(goal, {
      success: () => {
        self.postMessage({ type: 'query_success', goal } as WorkerResponse);
        getNextAnswer();
      },
      error: (err: any) => {
        const msg = pl.format_answer(err) || (err ? err.toString() : 'Ошибка запроса');
        self.postMessage({ type: 'query_error', error: msg } as WorkerResponse);
      }
    });
  } else if (data.type === 'next_answer') {
    getNextAnswer();
  } else if (data.type === 'find_all') {
    const max = data.maxAnswers || 100;
    let count = 0;
    const collect = () => {
      session.answer((answer: any) => {
        if (answer === null) {
          reportLimitExceeded();
        } else if (answer === false || count >= max) {
          self.postMessage({ type: 'no_more_answers' } as WorkerResponse);
        } else if (pl.type.is_error(answer)) {
          const errText = pl.format_answer(answer) || String(answer);
          self.postMessage({
            type: 'answer',
            answer: { status: 'error', error: errText },
            hasMore: false
          } as WorkerResponse);
        } else {
          count++;
          const formatted = pl.format_answer(answer);
          const bindings: Record<string, string> = {};
          if (answer.links) {
            for (const [k, v] of Object.entries(answer.links)) {
              bindings[k] = v ? v.toString() : '';
            }
          }
          self.postMessage({
            type: 'answer',
            answer: { status: 'success', bindings, rawText: formatted },
            hasMore: true
          } as WorkerResponse);
          collect();
        }
      });
    };
    collect();
  } else if (data.type === 'stop') {
    session = pl.create(10000);
    self.postMessage({ type: 'no_more_answers' } as WorkerResponse);
  }
};

function getNextAnswer() {
  session.answer((answer: any) => {
    if (answer === null) {
      reportLimitExceeded();
    } else if (answer === false) {
      self.postMessage({ type: 'no_more_answers' } as WorkerResponse);
    } else if (pl.type.is_error(answer)) {
      const errText = pl.format_answer(answer) || String(answer);
      self.postMessage({
        type: 'answer',
        answer: { status: 'error', error: errText },
        hasMore: false
      } as WorkerResponse);
    } else {
      const formatted = pl.format_answer(answer);
      const bindings: Record<string, string> = {};
      if (answer.links) {
        for (const [k, v] of Object.entries(answer.links)) {
          bindings[k] = v ? v.toString() : '';
        }
      }
      self.postMessage({
        type: 'answer',
        answer: { status: 'success', bindings, rawText: formatted },
        hasMore: true
      } as WorkerResponse);
    }
  });
}

function reportLimitExceeded() {
  self.postMessage({
    type: 'answer',
    answer: { status: 'error', error: 'Превышен предел вычислений Prolog' },
    hasMore: false
  } satisfies WorkerResponse);
}
