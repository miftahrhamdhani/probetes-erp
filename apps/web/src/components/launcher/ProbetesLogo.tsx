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
  md: "text-xl",
  lg: "text-2xl"
};

const markSize: Record<NonNullable<ProbetesLogoProps["variant"]>, CSSProperties> = {
  header: { width: 36, height: 36, maxWidth: 36, maxHeight: 36 },
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
    <div className={cn("flex min-w-0 items-center gap-3", className)} aria-label="Probetes ERP">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden text-white drop-shadow-[0_10px_24px_rgba(227,6,19,0.24)]",
          markClassName
        )}
        style={markSize[variant]}
      >
        <svg
          aria-hidden="true"
          className="block h-full max-h-full w-full max-w-full object-contain"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 72 80"
        >
          <path
            d="M11 13.5C18.7 9.4 27.3 7.2 36 7.2s17.3 2.2 25 6.3v25.1c0 16.9-9.6 27.6-25 36.4C20.6 66.2 11 55.5 11 38.6V13.5Z"
            fill="#ed1c24"
          />
          <path
            d="M36 7.2c8.7 0 17.3 2.2 25 6.3v25.1C61 55.5 51.4 66.2 36 75V7.2Z"
            fill="#d80e18"
            opacity="0.42"
          />
          <path
            d="M18.2 18.6C23.8 15.9 29.9 14.5 36 14.5s12.2 1.4 17.8 4.1v20.1c0 12.3-6.4 20.2-17.8 27.2-11.4-7-17.8-14.9-17.8-27.2V18.6Z"
            fill="#f51f2b"
            opacity="0.55"
          />
          <text
            dominantBaseline="middle"
            fill="white"
            fontFamily="var(--font-inter), Inter, Arial, sans-serif"
            fontSize="46"
            fontWeight="900"
            letterSpacing="-5"
            textAnchor="middle"
            x="36"
            y="34"
          >
            P
          </text>
          <path
            d="M18 54.8c13.8 1.6 26.2-1.9 38.2-11.1-8.4 12.4-21.5 20-37.6 20.7 3.7-2.1 6.6-5.1 8.6-8.8-3 .1-6.1-.1-9.2-.8Z"
            fill="white"
          />
        </svg>
      </div>

      {showText ? (
        <div
          className={cn(
            "flex min-w-0 items-baseline gap-2 truncate font-extrabold tracking-tight",
            textSizeClass[textSize]
          )}
        >
          <span className="truncate text-brand-red">PROBETES</span>
          <span className="font-semibold text-slate-800">ERP</span>
        </div>
      ) : null}
    </div>
  );
}
