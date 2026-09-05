"use client";

import Bubbles from "./Bubbles";

type Mode = "menu" | "pvc" | "online";

export default function Menu({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <main className="shell">
      <Bubbles emojis={["✊", "✋", "✌️", "◆", "△", "○"]} />
      <h1 className="title">NEON RPS</h1>
      <p className="subtitle">Pick · Lock · Dominate</p>

      <div className="mode-grid">
        <button className="mode-card" onClick={() => onSelect("pvc")}>
          <span className="mode-emoji">🎮</span>
          <span className="mode-name">Solo · vs CPU</span>
          <span className="mode-desc">
            Lock in your move, hit GO, and outplay the machine.
          </span>
        </button>

        <button className="mode-card" onClick={() => onSelect("online")}>
          <span className="mode-emoji">⚡</span>
          <span className="mode-name">Online · 1v1</span>
          <span className="mode-desc">
            Spin up a room or drop a code to face a friend in real time.
          </span>
        </button>
      </div>
    </main>
  );
}
