"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides } from "../config/heroSlides";

const slideCount = heroSlides.length;
const swipeThreshold = 50;

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const goToPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + slideCount) % slideCount);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slideCount);
  }, []);

  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };

  const handleDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;

    const deltaX = clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(deltaX) < swipeThreshold) return;
    if (deltaX < 0) goToNext();
    else goToPrevious();
  };

  useEffect(() => {
    const timer = window.setInterval(goToNext, 5000);

    return () => window.clearInterval(timer);
  }, [goToNext]);

  const activeSlide = heroSlides[activeIndex] ?? heroSlides[0];

  return (
    <div
      className="relative h-[220px] w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-slate-50 shadow-soft sm:h-[280px] md:h-[320px] lg:h-[390px] xl:h-[420px]"
      onMouseDown={(event) => handleDragStart(event.clientX)}
      onMouseLeave={() => {
        dragStartX.current = null;
      }}
      onMouseUp={(event) => handleDragEnd(event.clientX)}
      onTouchEnd={(event) => handleDragEnd(event.changedTouches[0]?.clientX ?? 0)}
      onTouchStart={(event) => handleDragStart(event.changedTouches[0]?.clientX ?? 0)}
    >
      <Image
        alt={`${activeSlide.title} hero banner`}
        className="h-full w-full object-contain"
        draggable={false}
        fill
        priority
        sizes="100vw"
        src={activeSlide.src}
      />

      <button
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm transition hover:bg-white"
        onClick={goToPrevious}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        type="button"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-900 shadow-sm transition hover:bg-white"
        onClick={goToNext}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        type="button"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/55 px-2 py-1 shadow-sm backdrop-blur-sm">
        {heroSlides.map((slide, index) => (
          <button
            aria-label={`Tampilkan slide ${slide.title}`}
            className={`size-1.5 rounded-full transition ${
              index === activeIndex ? "w-4 bg-brand-red" : "bg-slate-400/60 hover:bg-slate-500/80"
            }`}
            key={slide.title}
            onClick={() => setActiveIndex(index)}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
