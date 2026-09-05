"use client";

import { THEMES } from "@/lib/themes";

export default function ThemePicker({
  themeId,
  onChange,
  disabled,
}: {
  themeId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="section-label">Choose your arena</div>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`theme-chip ${t.id === themeId ? "active" : ""}`}
            disabled={disabled}
            onClick={() => onChange(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </>
  );
}
