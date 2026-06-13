import type { ReactNode } from "react";

const variants: Record<string, string> = {
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  info: "bg-info/15 text-info border-info/30",
  accent: "bg-accent/15 text-indigo-300 border-accent/30",
  success: "bg-success/15 text-green-400 border-success/30",
  warning: "bg-warning/15 text-amber-400 border-warning/30",
  danger: "bg-danger/15 text-red-400 border-danger/30",
};

export default function Badge({
  children,
  color = "slate",
  dot,
}: {
  children: ReactNode;
  color?: keyof typeof variants;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium ${variants[color]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function colorForBgClass(bgClass: string): keyof typeof variants {
  if (bgClass.includes("info")) return "info";
  if (bgClass.includes("accent")) return "accent";
  if (bgClass.includes("success")) return "success";
  if (bgClass.includes("warning")) return "warning";
  if (bgClass.includes("danger")) return "danger";
  return "slate";
}
