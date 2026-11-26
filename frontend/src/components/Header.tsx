import React from "react";
import { Square, RotateCcw, FolderDown, HelpCircle, Sun, Moon, Send } from "lucide-react";
import type { PrologStatus, Theme } from "../types";
import { EXAMPLES } from "../examples";

interface HeaderProps {
  status: PrologStatus;
  theme: Theme;
  onToggleTheme: () => void;
  exampleId: string;
  isBusy: boolean;
  onStop: () => void;
  onReset: () => void;
  onSelectExample: (id: string) => void;
  onOpenHelp: () => void;
  onOpenFileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  theme,
  onToggleTheme,
  exampleId,
  isBusy,
  onStop,
  onReset,
  onSelectExample,
  onOpenHelp,
  onOpenFileModal
}) => {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2 bg-white dark:bg-[#0f1015] border-b border-slate-300 dark:border-white/10 transition-colors">
      {/* Brand & Status Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-400 flex items-center justify-center shadow-md shadow-purple-500/20">
            <span className="font-code font-black text-white text-xs">PR</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Prolog <span className="text-purple-600 dark:text-purple-400 font-normal">Web Studio</span>
              </h1>
              {/* Version Badge */}
              <span
                className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                title="Tau Prolog ISO Engine in Web Worker"
              >
                v1.0.0
              </span>
            </div>
          </div>
        </div>

        {/* Engine Status Badge */}
        <div role="status" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs">
          {status === "ready" && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Готово</span>
            </>
          )}
          {(status === "querying" || status === "answering" || status === "consulting") && (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {status === "consulting" ? "Загрузка базы..." : "Поиск решений..."}
              </span>
            </>
          )}
          {status === "loading" && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">Загрузка ядра...</span>
            </>
          )}
          {status === "error" && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-600 dark:text-rose-400 font-medium">Ошибка</span>
            </>
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {/* Stop Button */}
        <button
          onClick={onStop}
          disabled={status !== "querying" && status !== "answering"}
          className="flex min-h-9 items-center gap-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer disabled:cursor-default disabled:opacity-50"
          title="Прервать бесконечный поиск или цикл (F8)"
        >
          <Square className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 fill-current" />
          <span>Стоп</span>
        </button>

        {/* Reset Session */}
        <button
          onClick={onReset}
          className="flex min-h-9 items-center gap-1.5 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
          title="Перезапустить сеанс Prolog"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сброс</span>
        </button>

        {/* Examples Dropdown */}
        <div className="min-w-0 max-w-full">
          <select
            onChange={(e) => onSelectExample(e.target.value)}
            value={exampleId}
            disabled={isBusy}
            aria-label="Готовые примеры"
            className="min-h-9 max-w-44 truncate text-xs bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 rounded-lg px-2.5 cursor-pointer transition-colors disabled:opacity-50 md:max-w-52 lg:max-w-none"
          >
            <option value="" disabled className="bg-white dark:bg-[#121318] text-slate-900 dark:text-slate-200">
              Готовые примеры...
            </option>
            {EXAMPLES.map(ex => (
              <option key={ex.id} value={ex.id} className="bg-white dark:bg-[#121318] text-slate-900 dark:text-slate-200">
                {ex.title}
              </option>
            ))}
          </select>
        </div>

        {/* File actions */}
        <button
          onClick={onOpenFileModal}
          disabled={isBusy}
          className="flex min-h-9 items-center gap-1.5 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Открыть / сохранить .pl файл"
        >
          <FolderDown className="w-3.5 h-3.5" />
          <span>Файл</span>
        </button>

        {/* Telegram Support Link */}
        <a
          href="https://t.me/goliluha"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 items-center gap-1.5 px-2.5 text-xs font-medium bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20 rounded-lg transition-colors cursor-pointer"
          title="Поддержка и связь с автором в Telegram (@goliluha)"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Поддержка</span>
          <span className="text-xs font-mono">@goliluha</span>
        </a>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="grid size-9 place-items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
          title={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600" />
          )}
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="grid size-9 place-items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Справка по Prolog"
          title="Горячие клавиши и справка по Prolog"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
