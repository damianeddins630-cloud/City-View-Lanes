"use client";

import { useRef, type MouseEvent } from "react";
import { WHY_CARDS } from "@/lib/site";

export default function SpotlightCards() {
  const gridRef = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const grid = gridRef.current;
    if (!grid) return;
    for (const card of grid.querySelectorAll<HTMLElement>("[data-spot]")) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--spot-x", `${x}px`);
      card.style.setProperty("--spot-y", `${y}px`);
    }
  }

  return (
    <div
      ref={gridRef}
      onMouseMove={onMove}
      className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {WHY_CARDS.map((card, index) => (
        <article
          key={card.title}
          data-spot
          className="spotlight-card feature-card panel p-5"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="feature-glow" />
          <p className="relative z-10 text-[0.7rem] font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            0{index + 1}
          </p>
          <h3 className="font-display relative z-10 mt-2 text-2xl tracking-[0.04em] text-white">
            {card.title}
          </h3>
          <p className="relative z-10 mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {card.copy}
          </p>
        </article>
      ))}
    </div>
  );
}
