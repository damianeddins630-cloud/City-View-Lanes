"use client";

import { WHY_CARDS } from "@/lib/site";

export default function InteractiveCards() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {WHY_CARDS.map((card, index) => (
        <article
          key={card.title}
          className="feature-card panel p-5"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="feature-glow" />
          <h3 className="font-display relative z-10 text-2xl tracking-[0.04em] text-[var(--navy)]">
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
