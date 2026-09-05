"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import PvCGame from "@/components/PvCGame";
import OnlineGame from "@/components/OnlineGame";

type Mode = "menu" | "pvc" | "online";

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu");

  return (
    <>
      {mode === "menu" && <Menu onSelect={setMode} />}
      {mode === "pvc" && <PvCGame onExit={() => setMode("menu")} />}
      {mode === "online" && <OnlineGame onExit={() => setMode("menu")} />}
    </>
  );
}
