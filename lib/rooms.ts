import { type Move, type PlayerSlot, judge } from "./themes";
import { kvGet, kvSet } from "./store";

export type { PlayerSlot };

export interface RoomPlayer {
  id: string; // secret token identifying the player
  move: Move | null;
  ready: boolean; // pressed GO with a move locked
  score: number;
}

export interface Room {
  code: string;
  themeId: string;
  players: Record<PlayerSlot, RoomPlayer | null>;
  round: number;
  // results are computed once both players are ready
  lastResult: {
    round: number;
    p1Move: Move;
    p2Move: Move;
    // outcome from p1's perspective
    outcome: "p1" | "p2" | "draw";
  } | null;
  createdAt: number;
  updatedAt: number;
}

const ROOM_TTL_SECONDS = 60 * 30; // 30 minutes idle
const KEY = (code: string) => `rps:room:${code.toUpperCase()}`;

async function loadRoom(code: string): Promise<Room | null> {
  const raw = await kvGet(KEY(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Room;
  } catch {
    return null;
  }
}

async function saveRoom(room: Room): Promise<void> {
  room.updatedAt = Date.now();
  await kvSet(KEY(room.code), JSON.stringify(room), ROOM_TTL_SECONDS);
}

export function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function makeToken(): string {
  return (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  );
}

export async function createRoom(
  themeId: string
): Promise<{ room: Room; token: string }> {
  // Find an unused code (collisions are rare with 32^4 space).
  let code = makeCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await loadRoom(code);
    if (!existing) break;
    code = makeCode();
  }

  const token = makeToken();
  const room: Room = {
    code,
    themeId,
    players: {
      p1: { id: token, move: null, ready: false, score: 0 },
      p2: null,
    },
    round: 1,
    lastResult: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveRoom(room);
  return { room, token };
}

export async function joinRoom(
  code: string
): Promise<
  { room: Room; token: string; slot: PlayerSlot } | { error: string }
> {
  const room = await loadRoom(code);
  if (!room) return { error: "Room not found" };
  if (room.players.p2) return { error: "Room is full" };
  const token = makeToken();
  room.players.p2 = { id: token, move: null, ready: false, score: 0 };
  await saveRoom(room);
  return { room, token, slot: "p2" };
}

export async function getRoom(code: string): Promise<Room | null> {
  return loadRoom(code);
}

function slotForToken(room: Room, token: string): PlayerSlot | null {
  if (room.players.p1?.id === token) return "p1";
  if (room.players.p2?.id === token) return "p2";
  return null;
}

export async function submitMove(
  code: string,
  token: string,
  move: Move
): Promise<{ room: Room } | { error: string }> {
  const room = await loadRoom(code);
  if (!room) return { error: "Room not found" };
  const slot = slotForToken(room, token);
  if (!slot) return { error: "You are not in this room" };
  const player = room.players[slot]!;
  player.move = move;
  player.ready = true;
  resolveIfReady(room);
  await saveRoom(room);
  return { room };
}

export async function resetRound(
  code: string
): Promise<{ room: Room } | { error: string }> {
  const room = await loadRoom(code);
  if (!room) return { error: "Room not found" };
  room.round += 1;
  room.lastResult = null;
  if (room.players.p1) {
    room.players.p1.move = null;
    room.players.p1.ready = false;
  }
  if (room.players.p2) {
    room.players.p2.move = null;
    room.players.p2.ready = false;
  }
  await saveRoom(room);
  return { room };
}

function resolveIfReady(room: Room) {
  const { p1, p2 } = room.players;
  if (!p1 || !p2) return;
  if (!p1.ready || !p2.ready || !p1.move || !p2.move) return;
  if (room.lastResult && room.lastResult.round === room.round) return;

  const res = judge(p1.move, p2.move); // from p1's view
  const outcome: "p1" | "p2" | "draw" =
    res === "win" ? "p1" : res === "lose" ? "p2" : "draw";
  if (outcome === "p1") p1.score += 1;
  if (outcome === "p2") p2.score += 1;

  room.lastResult = {
    round: room.round,
    p1Move: p1.move,
    p2Move: p2.move,
    outcome,
  };
}

// A public view of the room. Reveals opponent moves only after both are ready.
export function publicRoom(room: Room, viewerToken: string) {
  const viewerSlot = slotForToken(room, viewerToken);
  const bothReady = !!room.players.p1?.ready && !!room.players.p2?.ready;

  function view(slot: PlayerSlot) {
    const p = room.players[slot];
    if (!p) return null;
    const isViewer = slot === viewerSlot;
    return {
      connected: true,
      ready: p.ready,
      score: p.score,
      // hide the actual move from the opponent until both locked in
      move: isViewer || bothReady ? p.move : null,
    };
  }

  return {
    code: room.code,
    themeId: room.themeId,
    round: room.round,
    viewerSlot,
    bothReady,
    players: { p1: view("p1"), p2: view("p2") },
    lastResult: bothReady ? room.lastResult : null,
  };
}
