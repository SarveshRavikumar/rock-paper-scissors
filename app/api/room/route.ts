import { NextRequest, NextResponse } from "next/server";
import {
  createRoom,
  joinRoom,
  getRoom,
  submitMove,
  resetRound,
  publicRoom,
} from "@/lib/rooms";
import { MOVES, type Move } from "@/lib/themes";

// Keep this on the Node.js runtime so the in-memory Map persists per instance.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isMove(v: unknown): v is Move {
  return typeof v === "string" && (MOVES as string[]).includes(v);
}

// GET /api/room?code=ABCD&token=xxx  -> poll room state
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json({ room: publicRoom(room, token) });
}

// POST /api/room  { action, ... }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;

  if (action === "create") {
    const themeId = typeof body.themeId === "string" ? body.themeId : "military";
    const { room, token } = createRoom(themeId);
    return NextResponse.json({
      token,
      slot: "p1",
      room: publicRoom(room, token),
    });
  }

  if (action === "join") {
    const code = typeof body.code === "string" ? body.code : "";
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    const res = joinRoom(code);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({
      token: res.token,
      slot: res.slot,
      room: publicRoom(res.room, res.token),
    });
  }

  if (action === "move") {
    const code = typeof body.code === "string" ? body.code : "";
    const token = typeof body.token === "string" ? body.token : "";
    const move = body.move;
    if (!code || !token) return NextResponse.json({ error: "Missing code/token" }, { status: 400 });
    if (!isMove(move)) return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    const res = submitMove(code, token, move);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ room: publicRoom(res.room, token) });
  }

  if (action === "next") {
    const code = typeof body.code === "string" ? body.code : "";
    const token = typeof body.token === "string" ? body.token : "";
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    const res = resetRound(code);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ room: publicRoom(res.room, token) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
