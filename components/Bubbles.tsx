"use client";

import { useMemo } from "react";

// A playful layer of emoji that float up the screen.
// Positions/timings are randomized once per theme so it feels lively.
export default function Bubbles({ emojis }: { emojis: string[] }) {
  const items = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => {
      const emoji = emojis[i % emojis.length];
      const size = 16 + Math.round(Math.random() * 18); // 16–34px
      const x = Math.round(Math.random() * 100); // vw %
      const dur = 18 + Math.round(Math.random() * 14); // 18–32s
      const delay = -Math.round(Math.random() * 32); // stagger, already mid-flight
      return { emoji, size, x, dur, delay, key: i };
    });
  }, [emojis]);

  return (
    <div className="bubbles" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.key}
          style={
            {
              ["--size" as string]: `${it.size}px`,
              ["--x" as string]: `${it.x}%`,
              ["--dur" as string]: `${it.dur}s`,
              ["--delay" as string]: `${it.delay}s`,
            } as React.CSSProperties
          }
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
