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
    default: "bg-[#FBEFEF] text-plum-900 border-[#F5CBCB]",
    brand: "bg-[#C5B3D3]/40 text-plum-950 border-[#C5B3D3]",
    color: "bg-[#FFE2E2] text-plum-900 border-[#F5CBCB]",
    mark: "bg-[#F5CBCB]/60 text-plum-950 border-[#F5CBCB]",
    condition: "bg-emerald-100 text-emerald-900 border-emerald-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors shadow-sm",
        variantStyles[variant],
        className
      )}
      title={`${label}: ${displayValue}`}
    >
      {icon && <span className="opacity-75">{icon}</span>}
      <span className="opacity-60">{label}:</span>
      <span className="font-bold">{displayValue}</span>
    </span>
  );
};
