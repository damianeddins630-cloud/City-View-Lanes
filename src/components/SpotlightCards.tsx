"use client";

import { useRef, type MouseEvent } from "react";
import EditableText from "@/components/EditableText";

type Card = { title: string; copy: string };

export default function SpotlightCards({ cards }: { cards: Card[] }) {
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
      {cards.map((card, index) => (
        <article
          key={`${card.title}-${index}`}
          data-spot
          className="spotlight-card feature-card panel p-5"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="feature-glow" />
          <p className="relative z-10 text-[0.7rem] font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            0{index + 1}
          </p>
          <EditableText
            path={`home.whyCards.${index}.title`}
            value={card.title}
            as="h3"
            className="font-display relative z-10 mt-2 text-2xl tracking-[0.04em] text-[var(--ink)]"
          />
          <EditableText
            path={`home.whyCards.${index}.copy`}
            value={card.copy}
            as="p"
            multiline
            className="relative z-10 mt-3 text-sm leading-relaxed text-[var(--muted)]"
          />
        </article>
      ))}
    </div>
  );
}
