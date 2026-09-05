export type Move = "rock" | "paper" | "scissors";
export type PlayerSlot = "p1" | "p2";

export interface ThemeMove {
  emoji: string;
  label: string;
}

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  accent: string; // primary neon color
  accent2: string; // secondary neon color
  bg: string; // background gradient
  bubbles: string[]; // emoji that float up in the background
  moves: Record<Move, ThemeMove>;
}

export const THEMES: Theme[] = [
  {
    id: "military",
    name: "Military",
    tagline: "Combat protocol engaged",
    accent: "#3dff9e",
    accent2: "#c6ff3c",
    bg: "radial-gradient(120% 120% at 20% 0%, #12291c 0%, #0b1a12 45%, #060d09 100%)",
    bubbles: ["🎖️", "🪖", "△", "◆"],
    moves: {
      rock: { emoji: "💣", label: "Grenade" },
      paper: { emoji: "📋", label: "Orders" },
      scissors: { emoji: "🔪", label: "Bayonet" },
    },
  },
  {
    id: "halloween",
    name: "Halloween",
    tagline: "Trick, treat, or terminate",
    accent: "#ff8a1e",
    accent2: "#a45cff",
    bg: "radial-gradient(120% 120% at 80% 0%, #2a1533 0%, #180c22 45%, #0b0612 100%)",
    bubbles: ["🎃", "🕸️", "🕷️", "◆"],
    moves: {
      rock: { emoji: "🎃", label: "Pumpkin" },
      paper: { emoji: "👻", label: "Ghost" },
      scissors: { emoji: "🦇", label: "Bat" },
    },
  },
  {
    id: "asian",
    name: "Asian",
    tagline: "Balance of the dragon",
    accent: "#ff4d6d",
    accent2: "#ffcf33",
    bg: "radial-gradient(120% 120% at 50% 0%, #331018 0%, #1f0a10 45%, #0f0508 100%)",
    bubbles: ["🐉", "🏮", "花", "◆"],
    moves: {
      rock: { emoji: "🏮", label: "Lantern" },
      paper: { emoji: "🎏", label: "Koi Flag" },
      scissors: { emoji: "🐉", label: "Dragon" },
    },
  },
  {
    id: "tribal",
    name: "Tribal",
    tagline: "Ancestral spirits awaken",
    accent: "#ffb02e",
    accent2: "#ff5a1f",
    bg: "radial-gradient(120% 120% at 30% 0%, #2e1a0c 0%, #1b0f06 45%, #0d0703 100%)",
    bubbles: ["🔥", "🪶", "△", "◆"],
    moves: {
      rock: { emoji: "🗿", label: "Idol" },
      paper: { emoji: "🪶", label: "Feather" },
      scissors: { emoji: "🪓", label: "Axe" },
    },
  },
  {
    id: "jungle",
    name: "Jungle",
    tagline: "Survival of the wildest",
    accent: "#4dff5a",
    accent2: "#00e5ff",
    bg: "radial-gradient(120% 120% at 65% 0%, #0d2a1e 0%, #081a13 45%, #040d09 100%)",
    bubbles: ["🌴", "🐍", "🌿", "◆"],
    moves: {
      rock: { emoji: "🥥", label: "Coconut" },
      paper: { emoji: "🍃", label: "Leaf" },
      scissors: { emoji: "🐍", label: "Snake" },
    },
  },
  {
    id: "party",
    name: "Party",
    tagline: "Let the confetti fly",
    accent: "#ff4ecd",
    accent2: "#26e0ff",
    bg: "radial-gradient(120% 120% at 50% 0%, #2a1230 0%, #170a1e 45%, #0b0511 100%)",
    bubbles: ["🎉", "🎊", "◆", "△"],
    moves: {
      rock: { emoji: "🎈", label: "Balloon" },
      paper: { emoji: "🎉", label: "Confetti" },
      scissors: { emoji: "🎊", label: "Popper" },
    },
  },
  {
    id: "disco",
    name: "Disco",
    tagline: "Dance floor domination",
    accent: "#b34dff",
    accent2: "#2ef0ff",
    bg: "radial-gradient(120% 120% at 40% 0%, #1c1140 0%, #100a26 45%, #070412 100%)",
    bubbles: ["🪩", "🎵", "◆", "△"],
    moves: {
      rock: { emoji: "🪩", label: "Disco Ball" },
      paper: { emoji: "🎶", label: "Groove" },
      scissors: { emoji: "🕺", label: "Dancer" },
    },
  },
];

export const MOVES: Move[] = ["rock", "paper", "scissors"];

// Standard RPS rules: key beats value
const BEATS: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export type Result = "win" | "lose" | "draw";

export function judge(player: Move, cpu: Move): Result {
  if (player === cpu) return "draw";
  return BEATS[player] === cpu ? "win" : "lose";
}

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
