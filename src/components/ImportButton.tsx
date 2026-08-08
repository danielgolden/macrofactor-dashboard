"use client";
import { useState, useRef } from "react";
import { CheckIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Food } from "@/lib/types";

interface Props {
  onImported: (foods: Food[]) => void;
}

export function ImportButton({ onImported }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("loading");
    setErrorMsg(null);
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
      const msg = e instanceof Error ? e.message : String(e);
      console.error(e);
      setErrorMsg(msg);
      setStatus("error");
      setTimeout(() => { setStatus("idle"); setErrorMsg(null); }, 8000);
    }
  };

  const label = {
    idle: "Importar datos",
    loading: "Importando…",
    done: "Importado",
    error: "Error",
  }[status];

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <Button
        variant={status === "done" ? "default" : status === "error" ? "destructive" : "outline"}
        size="sm"
        disabled={status === "loading"}
        onClick={() => inputRef.current?.click()}
      >
        {status === "loading" ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : status === "done" ? (
          <CheckIcon className="size-4" />
        ) : status === "error" ? (
          <XIcon className="size-4" />
        ) : (
          <UploadIcon className="size-4" />
        )}
        {label}
      </Button>
      {errorMsg && (
        <p className="max-w-60 text-right text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
