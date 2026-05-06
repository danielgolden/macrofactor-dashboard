"use client";
import { useState, useRef } from "react";
import type { Food } from "@/lib/types";

interface Props {
  onImported: (foods: Food[]) => void;
}

export function ImportButton({ onImported }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onImported(data.foods);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label = {
    idle: "↑ Importar datos",
    loading: "Importando…",
    done: "✓ Importado",
    error: "✗ Error",
  }[status];

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "loading"}
        style={{
          padding: "7px 14px",
          fontSize: 11,
          border: "1px solid #a8702c",
          background: status === "done" ? "#4a7c2a" : status === "error" ? "#a83c2a" : "transparent",
          color: status === "idle" ? "#a8702c" : "#faf6ed",
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: 0.5,
          textTransform: "uppercase",
          transition: "all 0.2s",
        }}
      >
        {label}
      </button>
    </>
  );
}
