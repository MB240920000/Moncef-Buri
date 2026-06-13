import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const baseInput =
  "w-full bg-surface-2 border border-border-light rounded-lg px-3 py-2 text-[13px] text-text placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={baseInput} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} resize-none`} rows={3} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={baseInput} {...props} />;
}
