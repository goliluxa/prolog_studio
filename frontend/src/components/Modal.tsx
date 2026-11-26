import { useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  description: string;
  icon: ReactNode;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, description, icon, wide, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`fixed inset-0 m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} max-h-[calc(100dvh-2rem)] overflow-auto rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-[#121318] dark:text-white sm:p-6`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть окно"
        className="absolute right-4 top-4 grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <X className="size-5" />
      </button>
      <div className="mb-5 flex items-center gap-3 pr-12">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300">
          {icon}
        </div>
        <div>
          <h2 id={titleId} className="text-base font-bold">{title}</h2>
          <p id={descriptionId} className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </dialog>
  );
}
