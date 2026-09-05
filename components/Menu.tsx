"use client";

type Mode = "menu" | "pvc" | "online";

export default function Menu({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <main className="shell">
      <h1 className="title">NEON RPS</h1>
      <p className="subtitle">Rock · Paper · Scissors — reimagined</p>

      <div className="mode-grid">
        <button className="mode-card" onClick={() => onSelect("pvc")}>
          <span className="mode-emoji">🤖</span>
          <span className="mode-name">Player vs Computer</span>
          <span className="mode-desc">
            Pick a move, press GO, and outsmart the CPU.
          </span>
        </button>

        <button className="mode-card" onClick={() => onSelect("online")}>
          <span className="mode-emoji">🌐</span>
          <span className="mode-name">Online: Player vs Player</span>
          <span className="mode-desc">
            Create a room or join with a code. Battle a friend in real time.
          </span>
        </button>
      </div>

      <p className="footer">Built with Next.js · Deploy-ready for Vercel</p>
    </main>
  );
}
