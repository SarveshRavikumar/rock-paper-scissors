"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  THEMES,
  MOVES,
  getTheme,
  type Move,
  type PlayerSlot,
} from "@/lib/themes";
import ThemePicker from "./ThemePicker";
import Bubbles from "./Bubbles";

interface PublicPlayer {
  connected: boolean;
  ready: boolean;
  score: number;
  move: Move | null;
}

interface PublicRoom {
  code: string;
  themeId: string;
  round: number;
  viewerSlot: PlayerSlot | null;
  bothReady: boolean;
  players: { p1: PublicPlayer | null; p2: PublicPlayer | null };
  lastResult: {
    round: number;
    p1Move: Move;
    p2Move: Move;
    outcome: "p1" | "p2" | "draw";
  } | null;
}

type Phase = "lobby" | "playing";

export default function OnlineGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [selected, setSelected] = useState<Move | null>(null);

  const pollRef = useRef<number | null>(null);

  const theme = useMemo(
    () => getTheme(room?.themeId ?? themeId),
    [room?.themeId, themeId]
  );
  const themeVars = {
    ["--accent" as string]: theme.accent,
    ["--accent2" as string]: theme.accent2,
    ["--bg" as string]: theme.bg,
  } as React.CSSProperties;

  const poll = useCallback(async () => {
    if (!room?.code) return;
    try {
      const res = await fetch(
        `/api/room?code=${encodeURIComponent(room.code)}&token=${encodeURIComponent(
          token ?? ""
        )}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.room) setRoom(data.room);
    } catch {
      /* transient network error, keep polling */
    }
  }, [room?.code, token]);

  // Poll while in a room.
  useEffect(() => {
    if (phase !== "playing" || !room?.code) return;
    pollRef.current = window.setInterval(poll, 1200);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [phase, room?.code, poll]);

  // Clear local selection when a new round starts.
  useEffect(() => {
    if (room && !room.bothReady) {
      const me = room.viewerSlot ? room.players[room.viewerSlot] : null;
      if (me && !me.ready) setSelected(null);
    }
  }, [room?.round, room?.bothReady]);

  async function api(body: Record<string, unknown>) {
    const res = await fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data;
  }

  async function createRoom() {
    setBusy(true);
    setError(null);
    try {
      const data = await api({ action: "create", themeId });
      setToken(data.token);
      setRoom(data.room);
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!joinCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await api({ action: "join", code: joinCode.trim().toUpperCase() });
      setToken(data.token);
      setRoom(data.room);
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setBusy(false);
    }
  }

  async function lockMove() {
    if (!room || !token || !selected) return;
    setBusy(true);
    try {
      const data = await api({
        action: "move",
        code: room.code,
        token,
        move: selected,
      });
      setRoom(data.room);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit move");
    } finally {
      setBusy(false);
    }
  }

  async function nextRound() {
    if (!room || !token) return;
    setBusy(true);
    try {
      const data = await api({ action: "next", code: room.code, token });
      setRoom(data.room);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start next round");
    } finally {
      setBusy(false);
    }
  }

  function leave() {
    if (pollRef.current) window.clearInterval(pollRef.current);
    setPhase("lobby");
    setRoom(null);
    setToken(null);
    setSelected(null);
    setError(null);
  }

  // ---- Lobby view ----
  if (phase === "lobby") {
    return (
      <main className="shell" style={themeVars}>
        <Bubbles emojis={theme.bubbles} />
        <div className="topbar">
          <button className="ghost-btn" onClick={onExit}>
            ← Menu
          </button>
          <span className="mode-tag">Online · Player vs Player</span>
        </div>

        <h1 className="title">NEON RPS</h1>

        <ThemePicker themeId={themeId} onChange={setThemeId} />
        <p className="tagline">“{theme.tagline}”</p>

        <div className="lobby">
          <div className="lobby-card">
            <h3>Create a room</h3>
            <p className="muted">
              Start a match with your selected theme and share the code.
            </p>
            <button className="go-btn" disabled={busy} onClick={createRoom}>
              Create room
            </button>
          </div>

          <div className="lobby-divider">or</div>

          <div className="lobby-card">
            <h3>Join a room</h3>
            <input
              className="code-input"
              placeholder="ENTER CODE"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              className="go-btn"
              disabled={busy || joinCode.trim().length < 4}
              onClick={joinRoom}
            >
              Join
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
      </main>
    );
  }

  // ---- Playing view ----
  const me = room?.viewerSlot ? room.players[room.viewerSlot] : null;
  const oppSlot: PlayerSlot | null =
    room?.viewerSlot === "p1" ? "p2" : room?.viewerSlot === "p2" ? "p1" : null;
  const opp = oppSlot && room ? room.players[oppSlot] : null;
  const opponentConnected = !!opp?.connected;

  const bothReady = !!room?.bothReady;
  let verdict = "";
  let verdictClass = "";
  if (bothReady && room?.lastResult && room.viewerSlot) {
    const o = room.lastResult.outcome;
    if (o === "draw") {
      verdict = "STANDOFF";
      verdictClass = "draw";
    } else if (o === room.viewerSlot) {
      verdict = "VICTORY";
      verdictClass = "win";
    } else {
      verdict = "DEFEAT";
      verdictClass = "lose";
    }
  }

  const myMoveEmoji = me?.move
    ? theme.moves[me.move].emoji
    : selected
    ? theme.moves[selected].emoji
    : "❔";
  const oppMoveEmoji =
    bothReady && opp?.move ? theme.moves[opp.move].emoji : "❔";

  const iAmReady = !!me?.ready;

  return (
    <main className="shell" style={themeVars}>
      <Bubbles emojis={theme.bubbles} />
      <div className="topbar">
        <button className="ghost-btn" onClick={leave}>
          ← Leave
        </button>
        <span className="mode-tag">Online · Player vs Player</span>
      </div>

      <h1 className="title">NEON RPS</h1>

      <div className="roominfo">
        <div className="room-code">
          Room <strong>{room?.code}</strong>
        </div>
        <div className={`conn ${opponentConnected ? "on" : "off"}`}>
          {opponentConnected
            ? "Opponent connected"
            : "Waiting for opponent…"}
        </div>
        <div className="round-no">Round {room?.round}</div>
      </div>

      <p className="tagline">“{theme.tagline}”</p>

      <div className="scoreboard">
        <div className="score-box you">
          <div className="k">You</div>
          <div className="v">{me?.score ?? 0}</div>
        </div>
        <div className="score-box cpu">
          <div className="k">Opponent</div>
          <div className="v">{opp?.score ?? 0}</div>
        </div>
      </div>

      <div className="arena">
        <div className="hand you">
          <div className="disc">{myMoveEmoji}</div>
          <div className="who">You {iAmReady ? "✓" : ""}</div>
        </div>
        <div className="vs">VS</div>
        <div className="hand cpu">
          <div className="disc">{oppMoveEmoji}</div>
          <div className="who">
            Opponent {opp?.ready ? "✓" : ""}
          </div>
        </div>
      </div>

      <div className={`verdict ${verdictClass}`}>{verdict}</div>

      {!bothReady && (
        <>
          <div className="section-label">
            {iAmReady ? "Locked in — waiting for opponent…" : "Select your move"}
          </div>
          <div className="moves">
            {MOVES.map((m) => (
              <button
                key={m}
                className={`move-btn ${selected === m ? "picked" : ""}`}
                disabled={iAmReady || busy}
                onClick={() => setSelected(m)}
              >
                <span className="e">{theme.moves[m].emoji}</span>
                <span className="l">{theme.moves[m].label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="controls">
        {!bothReady ? (
          <button
            className="go-btn"
            disabled={!selected || iAmReady || busy || !opponentConnected}
            onClick={lockMove}
          >
            {iAmReady ? "Waiting…" : "GO"}
          </button>
        ) : (
          <button className="go-btn" disabled={busy} onClick={nextRound}>
            Next round
          </button>
        )}
      </div>

      {!opponentConnected && (
        <p className="hint">
          Share code <strong>{room?.code}</strong> with a friend so they can
          join.
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
