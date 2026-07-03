import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface ProbetesLogoProps {
  showText?: boolean;
  markClassName?: string;
  className?: string;
  textSize?: "sm" | "md" | "lg";
  variant?: "header" | "module" | "hero";
}

const textSizeClass = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl"
};

const markSize: Record<NonNullable<ProbetesLogoProps["variant"]>, CSSProperties> = {
  header: { width: 34, height: 34, maxWidth: 34, maxHeight: 34 },
  module: { width: 48, height: 48, maxWidth: 52, maxHeight: 52 },
  hero: { width: 180, height: 200, maxWidth: 220, maxHeight: 220 }
};

export function ProbetesLogo({
  showText = true,
  markClassName,
  className,
  textSize = "md",
  variant = "header"
}: ProbetesLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)} aria-label="Probetes CRM">
      <img
        alt=""
        className={cn("shrink-0 object-contain", markClassName)}
        draggable={false}
        src="/brand/probetes-mark.png"
        style={markSize[variant]}
      />

      {showText ? (
        <div
          className={cn(
            "flex min-w-0 items-baseline gap-1.5 truncate font-extrabold tracking-[-0.02em] sm:gap-2",
            textSizeClass[textSize]
          )}
        >
          <span className="truncate text-brand-red">PROBETES</span>
          <span className="font-extrabold text-[#111827]">CRM</span>
        </div>
      ) : null}
    </div>
  );
}
