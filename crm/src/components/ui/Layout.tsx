import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-text-muted text-[13px] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-xl ${className}`}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-text-muted font-medium">{label}</p>
          <p className="font-display text-2xl font-semibold mt-1.5">{value}</p>
          {sub && <p className="text-[12px] text-text-dim mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 text-[12px] font-medium ${trend.positive ? "text-success" : "text-danger"}`}>
          {trend.positive ? "▲" : "▼"} {trend.value}
        </div>
      )}
    </Card>
  );
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
      {subtitle && <p className="text-text-muted text-[13px] mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
