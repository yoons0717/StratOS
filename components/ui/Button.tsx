import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const VARIANTS = {
  primary:
    "bg-neon font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30",
  ghost:
    "border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white",
  danger:
    "bg-red-600 font-bold text-white transition-opacity hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30",
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`min-h-[44px] rounded font-mono text-sm ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
