"use client";

import { useMemo, useState } from "react";
import {
  THEMES,
  MOVES,
  judge,
  getTheme,
  type Move,
  type Result,
} from "@/lib/themes";

export default function Home() {
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [cpuMove, setCpuMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [shaking, setShaking] = useState(false);
  const [score, setScore] = useState({ you: 0, cpu: 0 });

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  const themeVars = {
    // apply theme colors + background as CSS variables on the shell
    ["--accent" as string]: theme.accent,
    ["--accent2" as string]: theme.accent2,
    ["--bg" as string]: theme.bg,
  } as React.CSSProperties;

  function play(move: Move) {
    if (shaking) return;
    const cpu = MOVES[Math.floor(Math.random() * MOVES.length)];

    // "shake" phase before revealing
    setShaking(true);
    setResult(null);
    setPlayerMove(move);
    setCpuMove(cpu);

    window.setTimeout(() => {
      const r = judge(move, cpu);
      setResult(r);
      setShaking(false);
      setScore((s) => ({
        you: s.you + (r === "win" ? 1 : 0),
        cpu: s.cpu + (r === "lose" ? 1 : 0),
      }));
    }, 550);
  }

  function reset() {
    setPlayerMove(null);
    setCpuMove(null);
    setResult(null);
    setScore({ you: 0, cpu: 0 });
  }

  const verdictText =
    result === "win"
      ? "VICTORY"
      : result === "lose"
      ? "DEFEAT"
      : result === "draw"
      ? "STANDOFF"
      : "";

  return (
    <main className="shell" style={themeVars}>
      <h1 className="title">NEON RPS</h1>
      <p className="subtitle">Rock · Paper · Scissors — reimagined</p>

      <div className="section-label">Choose your arena</div>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`theme-chip ${t.id === themeId ? "active" : ""}`}
            onClick={() => {
              setThemeId(t.id);
              setPlayerMove(null);
              setCpuMove(null);
              setResult(null);
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <p className="tagline">“{theme.tagline}”</p>

      <div className="scoreboard">
        <div className="score-box you">
          <div className="k">You</div>
          <div className="v">{score.you}</div>
        </div>
        <div className="score-box cpu">
          <div className="k">CPU</div>
          <div className="v">{score.cpu}</div>
        </div>
      </div>

      <div className="arena">
        <div className="hand you">
          <div className={`disc ${shaking ? "shake" : ""}`}>
            {playerMove ? theme.moves[playerMove].emoji : "❔"}
          </div>
          <div className="who">You</div>
        </div>
        <div className="vs">VS</div>
        <div className="hand cpu">
          <div className={`disc ${shaking ? "shake" : ""}`}>
            {cpuMove && !shaking ? theme.moves[cpuMove].emoji : "❔"}
          </div>
          <div className="who">CPU</div>
        </div>
      </div>

      <div className={`verdict ${result ?? ""}`}>{verdictText}</div>

      <div className="moves">
        {MOVES.map((m) => (
          <button
            key={m}
            className="move-btn"
            disabled={shaking}
            onClick={() => play(m)}
          >
            <span className="e">{theme.moves[m].emoji}</span>
            <span className="l">{theme.moves[m].label}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        <button className="ghost-btn" onClick={reset}>
          Reset match
        </button>
      </div>

      <p className="footer">Built with Next.js · Deploy-ready for Vercel</p>
    </main>
  );
}
