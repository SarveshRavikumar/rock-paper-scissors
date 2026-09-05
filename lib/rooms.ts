import { type Move, type PlayerSlot, judge } from "./themes";

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

// In-memory store. Persists while the serverless instance is warm.
// Good enough for a live match; not durable across cold starts.
const g = globalThis as unknown as { __rpsRooms?: Map<string, Room> };
const rooms: Map<string, Room> = g.__rpsRooms ?? new Map();
g.__rpsRooms = rooms;

const ROOM_TTL_MS = 1000 * 60 * 30; // 30 minutes idle

function sweep() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.updatedAt > ROOM_TTL_MS) rooms.delete(code);
  }
}

export function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

export function makeToken(): string {
  return (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  );
}

export function createRoom(themeId: string): { room: Room; token: string } {
  sweep();
  const code = makeCode();
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
  rooms.set(code, room);
  return { room, token };
}

export function joinRoom(
  code: string
): { room: Room; token: string; slot: PlayerSlot } | { error: string } {
  sweep();
  const room = rooms.get(code.toUpperCase());
  if (!room) return { error: "Room not found" };
  if (room.players.p2) return { error: "Room is full" };
  const token = makeToken();
  room.players.p2 = { id: token, move: null, ready: false, score: 0 };
  room.updatedAt = Date.now();
  return { room, token, slot: "p2" };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

function slotForToken(room: Room, token: string): PlayerSlot | null {
  if (room.players.p1?.id === token) return "p1";
  if (room.players.p2?.id === token) return "p2";
  return null;
}

export function submitMove(
  code: string,
  token: string,
  move: Move
): { room: Room } | { error: string } {
  const room = getRoom(code);
  if (!room) return { error: "Room not found" };
  const slot = slotForToken(room, token);
  if (!slot) return { error: "You are not in this room" };
  const player = room.players[slot]!;
  player.move = move;
  player.ready = true;
  room.updatedAt = Date.now();
  resolveIfReady(room);
  return { room };
}

export function resetRound(code: string): { room: Room } | { error: string } {
  const room = getRoom(code);
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
  room.updatedAt = Date.now();
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
  room.updatedAt = Date.now();
}

// A public view of the room. Reveals opponent moves only after both are ready.
export function publicRoom(room: Room, viewerToken: string) {
  const viewerSlot = slotForToken(room, viewerToken);
  const bothReady =
    !!room.players.p1?.ready && !!room.players.p2?.ready;

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
