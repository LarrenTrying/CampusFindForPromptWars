import React from "react";
import { cn } from "@/lib/utils";

interface AttributeBadgeProps {
  label: string;
  value?: string | string[] | null;
  icon?: React.ReactNode;
  variant?: "default" | "brand" | "color" | "mark" | "condition";
  className?: string;
}

export const AttributeBadge: React.FC<AttributeBadgeProps> = ({
  label,
  value,
  icon,
  variant = "default",
  className,
}) => {
  if (!value) return null;

  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  if (!displayValue || displayValue === "null" || displayValue === "Unknown") return null;

  const variantStyles = {
    default: "bg-slate-800/80 text-slate-300 border-slate-700/50",
    brand: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    mark: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    condition: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      title={`${label}: ${displayValue}`}
    >
      {icon && <span className="opacity-75">{icon}</span>}
      <span className="opacity-60">{label}:</span>
      <span className="font-semibold">{displayValue}</span>
    </span>
  );
};
