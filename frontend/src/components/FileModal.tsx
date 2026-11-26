import React, { useEffect, useRef, useState } from "react";
import { Download, Upload, FileCode } from "lucide-react";
import { Modal } from "./Modal";

interface FileModalProps {
  onClose: () => void;
  code: string;
  onLoadCode: (code: string) => void;
}

export const FileModal: React.FC<FileModalProps> = ({
  onClose,
  code,
  onLoadCode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (readerRef.current?.readyState === FileReader.LOADING) readerRef.current.abort();
    };
  }, []);

  const handleExport = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "program.pl";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
    onClose();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isReading) return;

    setError("");
    setIsReading(true);
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      onLoadCode(reader.result);
      onClose();
    };
    reader.onerror = () => {
      setIsReading(false);
      setError("Не удалось открыть файл. Попробуйте выбрать его ещё раз.");
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      title="Работа с файлами .pl"
      description="Экспорт и импорт базы знаний Prolog"
      icon={<FileCode className="size-5" />}
      onClose={onClose}
    >
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={isReading}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-slate-300 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 rounded-xl transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Скачать базу как program.pl
              </div>
              <div className="text-[11px] text-slate-500">Сохранить текущий код на свой компьютер</div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isReading}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-300 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 rounded-xl transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {isReading ? "Читаю файл…" : "Загрузить .pl файл с диска"}
              </div>
              <div className="text-[11px] text-slate-500">Открыть существующий скрипт Prolog в редакторе</div>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pl,.pro,.prolog,.txt"
            onChange={handleImport}
            className="hidden"
          />
          {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        </div>
    </Modal>
  );
};
