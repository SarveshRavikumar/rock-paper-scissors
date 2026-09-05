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
import ThemePicker from "./ThemePicker";
import Bubbles from "./Bubbles";

export default function PvCGame({ onExit }: { onExit: () => void }) {
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [selected, setSelected] = useState<Move | null>(null);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [cpuMove, setCpuMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [shaking, setShaking] = useState(false);
  const [score, setScore] = useState({ you: 0, cpu: 0 });

  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const themeVars = {
    ["--accent" as string]: theme.accent,
    ["--accent2" as string]: theme.accent2,
    ["--bg" as string]: theme.bg,
  } as React.CSSProperties;

  function go() {
    if (shaking || !selected) return;
    const cpu = MOVES[Math.floor(Math.random() * MOVES.length)];
    setShaking(true);
    setResult(null);
    setPlayerMove(selected);
    setCpuMove(cpu);

    window.setTimeout(() => {
      const r = judge(selected, cpu);
      setResult(r);
      setShaking(false);
      setScore((s) => ({
        you: s.you + (r === "win" ? 1 : 0),
        cpu: s.cpu + (r === "lose" ? 1 : 0),
      }));
    }, 550);
  }

  function nextRound() {
    setSelected(null);
    setPlayerMove(null);
    setCpuMove(null);
    setResult(null);
  }

  function resetMatch() {
    nextRound();
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

  const roundOver = result !== null && !shaking;

  return (
    <main className="shell" style={themeVars}>
      <Bubbles emojis={theme.bubbles} />
      <div className="topbar">
        <button className="ghost-btn" onClick={onExit}>
          ← Menu
        </button>
        <span className="mode-tag">Player vs Computer</span>
      </div>

      <h1 className="title">NEON RPS</h1>

      <ThemePicker themeId={themeId} onChange={setThemeId} disabled={shaking} />
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
            {playerMove
              ? theme.moves[playerMove].emoji
              : selected
              ? theme.moves[selected].emoji
              : "❔"}
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

      <div className="section-label">
        {roundOver ? "Round complete" : "Select your move"}
      </div>
      <div className="moves">
        {MOVES.map((m) => (
          <button
            key={m}
            className={`move-btn ${selected === m ? "picked" : ""}`}
            disabled={shaking || roundOver}
            onClick={() => setSelected(m)}
          >
            <span className="e">{theme.moves[m].emoji}</span>
            <span className="l">{theme.moves[m].label}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        {!roundOver ? (
          <button
            className="go-btn"
            disabled={!selected || shaking}
            onClick={go}
          >
            GO
          </button>
        ) : (
          <button className="go-btn" onClick={nextRound}>
            Next round
          </button>
        )}
        <button className="ghost-btn" onClick={resetMatch}>
          Reset match
        </button>
      </div>
    </main>
  );
}
