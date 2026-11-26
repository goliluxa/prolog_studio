import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { CodeEditor } from "./components/CodeEditor";
import { ReplConsole } from "./components/ReplConsole";
import { HelpModal } from "./components/HelpModal";
import { FileModal } from "./components/FileModal";
import type { ConsoleEntry, PrologStatus, Theme } from "./types";
import { prologEngine } from "./services/prolog-engine";
import { EXAMPLES } from "./examples";

const STORAGE_KEY = "prolog_studio_saved_code_v1";
const THEME_STORAGE_KEY = "prolog_theme";

export const App: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? EXAMPLES[0].code;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  });

  const [status, setStatus] = useState<PrologStatus>("loading");
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [hasMoreAnswers, setHasMoreAnswers] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "console">("editor");
  const currentCode = useRef(code);
  const workerStarted = useRef(false);
  const isBusy = status === "loading" || status === "consulting" || status === "querying" || status === "answering";
  const canConsult = !isBusy;

  // Manage Dark / Light Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleCodeChange = (newCode: string) => {
    currentCode.current = newCode;
    setCode(newCode);
    localStorage.setItem(STORAGE_KEY, newCode);
  };

  const addConsoleEntry = useCallback((entry: Omit<ConsoleEntry, "id" | "timestamp">) => {
    setEntries((prev) => [
      ...prev,
      {
        ...entry,
        id: Math.random().toString(36).substring(2),
        timestamp: Date.now()
      }
    ]);
  }, []);

  // Subscribe to Engine events
  useEffect(() => {
    const unsubStatus = prologEngine.onStatusChange((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus === "loading") workerStarted.current = false;
      if (
        nextStatus === "loading" || nextStatus === "consulting" ||
        nextStatus === "querying" || nextStatus === "error"
      ) {
        setHasMoreAnswers(false);
      }
      if (nextStatus === "ready" && !workerStarted.current) {
        workerStarted.current = true;
        prologEngine.consult(currentCode.current);
      }
    });

    const unsubLog = prologEngine.onLog((logType, message) => {
      addConsoleEntry({ type: logType, text: message });
    });

    const unsubAnswer = prologEngine.onAnswer((answer, hasMore) => {
      setHasMoreAnswers(hasMore);
      if (answer.status === "success") {
        addConsoleEntry({
          type: "answer",
          text: answer.rawText || "true.",
          bindings: answer.bindings,
          hasMoreAnswers: hasMore
        });
      } else if (answer.status === "false") {
        addConsoleEntry({ type: "false", text: "false." });
      } else if (answer.status === "error") {
        addConsoleEntry({ type: "error", text: "error: " + (answer.error || "unknown error") });
      }
    });

    return () => {
      unsubStatus();
      unsubLog();
      unsubAnswer();
    };
  }, [addConsoleEntry]);

  const handleConsult = useCallback(() => {
    if (!canConsult) return;
    addConsoleEntry({ type: "system", text: "% Загрузка программы в базу знаний..." });
    prologEngine.consult(currentCode.current);
    setMobileTab("console");
  }, [addConsoleEntry, canConsult]);

  const handleQuery = (goal: string) => {
    if (!goal.trim() || status !== "ready") return;
    addConsoleEntry({ type: "query", text: goal });
    prologEngine.query(goal);
  };

  const handleNextAnswer = () => {
    if (status === "ready" && hasMoreAnswers) prologEngine.nextAnswer();
  };

  const handleStop = () => {
    prologEngine.stop();
    setHasMoreAnswers(false);
  };

  const handleReset = () => {
    prologEngine.restart();
    setHasMoreAnswers(false);
  };

  const handleClear = () => {
    setEntries([]);
    setHasMoreAnswers(false);
  };

  const handleSelectExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (ex && canConsult) {
      handleCodeChange(ex.code);
      addConsoleEntry({ type: "system", text: "% Загружен пример: «" + ex.title + "». Компилирую базу..." });
      prologEngine.consult(ex.code);
    }
  };

  // Global keyboard shortcuts (F8 stop, Ctrl+Enter consult)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || isHelpOpen || isFileModalOpen) return;
      if (e.key === "F8") {
        e.preventDefault();
        if (status === "querying" || status === "answering") prologEngine.stop();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleConsult();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleConsult, isFileModalOpen, isHelpOpen, status]);

  const activeExample = EXAMPLES.find((example) => example.code === code);

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-slate-100 dark:bg-[#0a0a0c] text-slate-900 dark:text-[#e4e7eb] transition-colors">
      <Header
        status={status}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        exampleId={activeExample?.id ?? ""}
        isBusy={isBusy}
        onStop={handleStop}
        onReset={handleReset}
        onSelectExample={handleSelectExample}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenFileModal={() => setIsFileModalOpen(true)}
      />

      {/* Mobile Tab Switcher */}
      <div role="group" aria-label="Рабочие области" className="flex gap-1 md:hidden px-3 py-1.5 bg-slate-200 dark:bg-[#0d0e12] border-b border-slate-300 dark:border-white/5 transition-colors">
        <button
          onClick={() => setMobileTab("editor")}
          aria-pressed={mobileTab === "editor"}
          aria-controls="editor-pane"
          className={"flex-1 min-h-10 text-xs font-medium rounded-md transition-colors " + (
            mobileTab === "editor"
              ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          База знаний .pl
        </button>
        <button
          onClick={() => setMobileTab("console")}
          aria-pressed={mobileTab === "console"}
          aria-controls="console-pane"
          className={"flex-1 min-h-10 text-xs font-medium rounded-md transition-colors " + (
            mobileTab === "console"
              ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          Консоль запросов ?-
        </button>
      </div>

      {/* Main Dual-Pane Workspace (Strict Grid 50/50) */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 p-3 gap-3 overflow-hidden w-full">
        {/* Left Pane: Code Editor */}
        <section
          id="editor-pane"
          aria-label="Редактор базы знаний"
          className={"h-full min-h-0 min-w-0 flex-col " + (
            mobileTab === "editor" ? "flex" : "hidden md:flex"
          )}
        >
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            onConsult={handleConsult}
            canConsult={canConsult}
            isConsulting={status === "consulting"}
          />
        </section>

        {/* Right Pane: Query REPL */}
        <section
          id="console-pane"
          aria-label="Консоль запросов"
          className={"h-full min-h-0 min-w-0 flex-col " + (
            mobileTab === "console" ? "flex" : "hidden md:flex"
          )}
        >
          <ReplConsole
            entries={entries}
            onQuery={handleQuery}
            onNextAnswer={handleNextAnswer}
            onClear={handleClear}
            status={status}
            hasMoreAnswers={hasMoreAnswers}
            suggestedQueries={activeExample?.suggestedQueries}
          />
        </section>
      </main>

      {/* Modals */}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      {isFileModalOpen && (
        <FileModal
          onClose={() => setIsFileModalOpen(false)}
          code={code}
          onLoadCode={(newCode) => {
            handleCodeChange(newCode);
            setMobileTab("editor");
            prologEngine.consult(newCode);
          }}
        />
      )}
    </div>
  );
};

export default App;
