export type Move = "rock" | "paper" | "scissors";

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
  moves: Record<Move, ThemeMove>;
}

export const THEMES: Theme[] = [
  {
    id: "military",
    name: "Military",
    tagline: "Combat protocol engaged",
    accent: "#00ff88",
    accent2: "#7cff00",
    bg: "radial-gradient(circle at 30% 20%, #142e1a 0%, #0a1410 60%, #050805 100%)",
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
    accent: "#ff7a00",
    accent2: "#a020f0",
    bg: "radial-gradient(circle at 70% 20%, #2a1633 0%, #150a1c 60%, #08040c 100%)",
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
    accent: "#ff2d55",
    accent2: "#ffd60a",
    bg: "radial-gradient(circle at 50% 15%, #33131b 0%, #1c0a10 60%, #0c0406 100%)",
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
    accent: "#ffb703",
    accent2: "#fb5607",
    bg: "radial-gradient(circle at 40% 25%, #2e1c0a 0%, #1a1006 60%, #0b0703 100%)",
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
    accent: "#39ff14",
    accent2: "#00e0ff",
    bg: "radial-gradient(circle at 60% 20%, #0c2e1a 0%, #071a10 60%, #030d07 100%)",
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
    accent2: "#ffe600",
    bg: "radial-gradient(circle at 50% 20%, #331433 0%, #1c0a1c 60%, #0c040c 100%)",
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
    accent: "#b026ff",
    accent2: "#00f0ff",
    bg: "radial-gradient(circle at 45% 20%, #1e1140 0%, #100a24 60%, #06040f 100%)",
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
