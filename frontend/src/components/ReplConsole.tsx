import React, { useRef, useEffect, useState } from "react";
import { Terminal, Trash2, ArrowDown, CornerDownLeft, Copy, Check, StepForward } from "lucide-react";
import type { ConsoleEntry, PrologStatus } from "../types";

interface ReplConsoleProps {
  entries: ConsoleEntry[];
  onQuery: (goal: string) => void;
  onNextAnswer: () => void;
  onClear: () => void;
  status: PrologStatus;
  hasMoreAnswers: boolean;
  suggestedQueries?: string[];
}

export const ReplConsole: React.FC<ReplConsoleProps> = ({
  entries,
  onQuery,
  onNextAnswer,
  onClear,
  status,
  hasMoreAnswers,
  suggestedQueries = []
}) => {
  const [input, setInput] = useState<string>("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const canQuery = status === "ready";

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
    setIsAtBottom(true);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 30);
  };

  useEffect(() => {
    if (isAtBottom) {
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }
  }, [entries, isAtBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canQuery) return;
    let trimmed = input.trim();
    if (!trimmed) {
      if (hasMoreAnswers) {
        onNextAnswer();
      }
      return;
    }

    if (trimmed.startsWith("?-")) {
      trimmed = trimmed.substring(2).trim();
    }
    if (!trimmed) return;
    if (!trimmed.endsWith(".")) {
      trimmed += ".";
    }

    onQuery(trimmed);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === ";" && canQuery && hasMoreAnswers && !input.trim()) {
      e.preventDefault();
      onNextAnswer();
    }
  };

  const copyOutput = async () => {
    const text = entries.map(e => e.text).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0d0e12] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Console Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-[#121318] border-b border-slate-300 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Консоль запросов ?-
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onNextAnswer}
            disabled={!canQuery || !hasMoreAnswers}
            className="flex min-h-8 items-center gap-1 px-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors cursor-pointer disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-600 dark:disabled:bg-white/5 dark:disabled:text-slate-400"
            title="Получить следующее решение (клавиша ; или Enter в строке запроса)"
          >
            <StepForward className="w-3.5 h-3.5 fill-current" />
            <span>Следующее решение (;)</span>
          </button>

          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-purple-600 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 rounded-md transition-colors cursor-pointer"
            >
              <ArrowDown className="w-3 h-3" />
              <span>В конец</span>
            </button>
          )}

          <button
            onClick={copyOutput}
            disabled={entries.length === 0}
            aria-label="Скопировать вывод консоли"
            title="Скопировать вывод консоли"
            className="grid size-8 place-items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {copyStatus === "success" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              onClear();
              setCopyStatus("idle");
            }}
            aria-label="Очистить консоль"
            disabled={entries.length === 0 || (status !== "ready" && status !== "error")}
            title="Очистить консоль"
            className="grid size-8 place-items-center text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Queries Chips */}
      {suggestedQueries.length > 0 && (
        <div role="group" aria-label="Примеры запросов" className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-slate-100/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
          {suggestedQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => onQuery(q)}
              disabled={!canQuery}
              className="min-h-7 max-w-full wrap-anywhere px-2 py-1 text-left text-xs font-mono rounded bg-white dark:bg-black/30 text-purple-700 dark:text-purple-300 border border-slate-300 dark:border-white/10 hover:border-purple-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              ?- {q}
            </button>
          ))}
        </div>
      )}

      {/* Output Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Вывод Prolog"
        className="min-h-0 flex-1 p-3 overflow-auto font-code text-[13px] leading-5 space-y-1.5 bg-slate-50/50 dark:bg-transparent transition-colors"
      >
        {entries.length === 0 ? (
          <div className="text-slate-600 dark:text-slate-400">
            {status === "loading" || status === "consulting"
              ? "Загружаю базу знаний…"
              : "Задайте цель Prolog в строке ввода ?-."}
          </div>
        ) : (
          entries.map((entry) => {
            if (entry.type === "query") {
              return (
                <div key={entry.id} className="text-purple-700 dark:text-purple-300 flex items-start gap-2 font-bold pt-1">
                  <span className="text-purple-500 dark:text-purple-400 select-none font-bold">?-</span>
                  <span className="min-w-0 whitespace-pre-wrap wrap-anywhere">{entry.text}</span>
                </div>
              );
            }
            if (entry.type === "answer") {
              return (
                <div key={entry.id} className="text-slate-950 dark:text-emerald-300 pl-4 whitespace-pre-wrap break-words font-semibold">
                  {entry.text}
                </div>
              );
            }
            if (entry.type === "false") {
              return (
                <div key={entry.id} className="text-rose-600 dark:text-rose-400 pl-4 font-bold">
                  false.
                </div>
              );
            }
            if (entry.type === "error") {
              return (
                <div key={entry.id} className="text-rose-700 dark:text-rose-400 whitespace-pre-wrap break-words font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {entry.text}
                </div>
              );
            }
            return (
              <div key={entry.id} className="text-slate-500 dark:text-slate-400 italic whitespace-pre-wrap break-words">
                {entry.text}
              </div>
            );
          })
        )}
      </div>

      {/* Command Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-[#090a0d] border-t border-slate-300 dark:border-white/10 transition-colors">
        <span className="text-purple-600 dark:text-purple-400 font-code font-bold select-none pl-2">?-</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Цель Prolog"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          placeholder={status === "error" ? "Исправьте и загрузите базу знаний" : "Например, father(X, ilya)."}
          className="min-w-0 min-h-10 flex-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-transparent text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg px-3 py-1.5 font-code text-[13px] focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!canQuery || (!input.trim() && !hasMoreAnswers)}
          aria-label="Выполнить запрос"
          className="grid size-10 shrink-0 place-items-center text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 transition-colors cursor-pointer"
          title="Выполнить запрос (Enter)"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
      <span role="status" className={copyStatus === "error" ? "px-3 py-1 text-xs text-rose-700 dark:text-rose-300" : "sr-only"}>
        {copyStatus === "success" && "Вывод скопирован"}
        {copyStatus === "error" && "Не удалось скопировать вывод"}
      </span>
    </div>
  );
};
