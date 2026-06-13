import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-gradient-to-br from-accent to-accent-2 text-white hover:opacity-90 shadow-lg shadow-accent/20",
  secondary: "bg-surface-2 text-text border border-border-light hover:bg-surface-2/70",
  ghost: "text-text-muted hover:text-text hover:bg-surface-2",
  danger: "bg-danger/15 text-red-400 border border-danger/30 hover:bg-danger/25",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-[12px] gap-1.5",
  md: "px-4 py-2 text-[13px] gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
