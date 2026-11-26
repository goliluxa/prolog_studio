import React from "react";
import { BookOpen, Keyboard, Zap, Send } from "lucide-react";
import { Modal } from "./Modal";

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <Modal
      title="Справка по Prolog Web Studio"
      description="Синтаксис, предикаты и горячие клавиши"
      icon={<Zap className="size-5" />}
      onClose={onClose}
      wide
    >
        {/* Hotkeys */}
        <div className="mb-6">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            <Keyboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Горячие клавиши</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-300 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-300">Загрузить базу знаний</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded text-slate-800 dark:text-slate-300 font-mono">
                Ctrl+Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-300 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-300">Следующее решение (бэктрекинг)</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded text-slate-800 dark:text-slate-300 font-mono">
                ; или Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-300 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-300">Остановить зависший поиск</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded text-slate-800 dark:text-slate-300 font-mono">
                F8
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-300 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-300">История запросов в REPL</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded text-slate-800 dark:text-slate-300 font-mono">
                ↑ / ↓
              </kbd>
            </div>
          </div>
        </div>

        {/* Syntax Cheatsheet */}
        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-300 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-2">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Основы языка Prolog</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Факты:</strong> оканчиваются точкой, например <code className="font-mono text-purple-600 dark:text-purple-300">parent(artem, ilya).</code></li>
            <li><strong>Переменные:</strong> начинаются с заглавной буквы или подчёркивания, например <code className="font-mono text-purple-600 dark:text-purple-300">X, Y, Name, _</code></li>
            <li><strong>Атомы:</strong> начинаются со строчной буквы, например <code className="font-mono text-purple-600 dark:text-purple-300">artem, red, apple</code></li>
            <li><strong>Правила:</strong> форма <code className="font-mono text-purple-600 dark:text-purple-300">Head :- Body.</code> — условие читается как «Head истинно, если Body истинно».</li>
            <li><strong>Запросы:</strong> в консоли задаются цели, например <code className="font-mono text-purple-600 dark:text-purple-300">?- father(X, ilya).</code></li>
            <li><strong>Списки:</strong> <code className="font-mono text-purple-600 dark:text-purple-300">member/2</code> проверяет принадлежность, <code className="font-mono text-purple-600 dark:text-purple-300">append/3</code> соединяет списки, <code className="font-mono text-purple-600 dark:text-purple-300">length/2</code> определяет их длину.</li>
            <li><strong>Бэктрекинг:</strong> клавиша <code className="font-mono text-purple-600 dark:text-purple-300">;</code> заставляет движок искать следующее подходящее решение.</li>
          </ul>
        </div>

        {/* Footer Support Info */}
        <div className="pt-4 border-t border-slate-300 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Версия студии: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">v1.0.0</span> (Tau Prolog ISO Engine)
          </div>
          <a
            href="https://t.me/goliluha"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Поддержка: @goliluha</span>
          </a>
        </div>
    </Modal>
  );
};
