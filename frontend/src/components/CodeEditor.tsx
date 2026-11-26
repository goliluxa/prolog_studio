import React, { useRef, useMemo, useState } from "react";
import { Play, Copy, Check, FileCode } from "lucide-react";

const PROLOG_TOKENS = /(%[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|('(?:''|\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*")|\b([A-Z_][\w]*)\b|\b(\d+(?:\.\d+)?)\b|\b([a-z][\w]*)(?=\s*\()|(:-|-->|\?-|\\\+|\\=|=\.\.|[!;|])/g;
const TOKEN_CLASSES = [
  "text-slate-500 dark:text-slate-400",
  "text-emerald-700 dark:text-emerald-300",
  "text-sky-700 dark:text-sky-300",
  "text-amber-700 dark:text-amber-300",
  "text-violet-700 dark:text-violet-300",
  "text-rose-700 dark:text-rose-300",
];

function highlightProlog(code: string) {
  const parts: React.ReactNode[] = [];
  let position = 0;
  for (const match of code.matchAll(PROLOG_TOKENS)) {
    const start = match.index;
    parts.push(code.slice(position, start));
    const tokenClass = TOKEN_CLASSES[match.slice(1).findIndex(Boolean)];
    parts.push(<span key={start} className={tokenClass}>{match[0]}</span>);
    position = start + match[0].length;
  }
  parts.push(code.slice(position));
  return parts;
}

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onConsult: () => void;
  canConsult: boolean;
  isConsulting: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onConsult,
  isConsulting,
  canConsult
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const releaseTab = useRef(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const lines = useMemo(() => code.split("\n"), [code]);
  const highlightedCode = useMemo(() => highlightProlog(code), [code]);

  const handleScroll = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = textarea.scrollTop;
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      releaseTab.current = true;
      return;
    }
    const allowTab = releaseTab.current;
    releaseTab.current = false;
    if (e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return;

    if (e.key === "Tab") {
      if (allowTab || e.shiftKey) return;
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      onChange(code.substring(0, start) + "  " + code.substring(end));
      requestAnimationFrame(() => textarea.setSelectionRange(start + 2, start + 2));
      return;
    }

    // Auto-closing brackets
    const pairs: { [k: string]: string } = { "(": ")", "[": "]", "{": "}" };
    if (pairs[e.key]) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = code.substring(start, end);
      const nextCode = code.substring(0, start) + e.key + selected + pairs[e.key] + code.substring(end);
      onChange(nextCode);
      requestAnimationFrame(() => textarea.setSelectionRange(start + 1, end + 1));
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0d0e12] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-[#121318] border-b border-slate-300 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            База знаний .pl
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {lines.length} стр.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            title="Скопировать базу знаний"
            className="flex min-h-8 items-center gap-1.5 px-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            {copyStatus === "success" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Копировать</span>
          </button>

          <button
            onClick={onConsult}
            disabled={!canConsult}
            className="flex min-h-8 items-center gap-1.5 px-3 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
            title="Скомпилировать базу знаний в сессию (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isConsulting ? "Загрузка…" : "Загрузить код"}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content: Line Numbers + Textarea */}
      <div className="flex flex-1 relative overflow-hidden font-code text-[13px] leading-[22px]">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-10 shrink-0 py-3 px-2 bg-slate-50 dark:bg-[#090a0d] border-r border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 font-medium text-right select-none overflow-hidden transition-colors"
        >
          {lines.map((_, i) => (
            <div key={i} className="h-[22px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative min-w-0 flex-1">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div ref={highlightRef} className="editor-code-layer text-slate-950 dark:text-slate-100">
              {highlightedCode}
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              onChange(e.target.value);
              setCopyStatus("idle");
            }}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            aria-label="Код базы знаний Prolog"
            aria-describedby="editor-shortcuts"
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="% Напишите факты и правила на Prolog…"
            className="editor-code-layer absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-slate-900 placeholder-slate-500 selection:bg-purple-500/25 selection:text-transparent dark:caret-white dark:placeholder-slate-400"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-1.5 bg-slate-100 dark:bg-[#0a0a0c] border-t border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <span id="editor-shortcuts">Ctrl+Enter — загрузить · Esc, Tab — выйти из редактора</span>
        <span role="status">
          {copyStatus === "success" && "Код скопирован"}
          {copyStatus === "error" && "Не удалось скопировать код"}
        </span>
      </div>
    </div>
  );
};
