"use client";

import { useState, useRef, type DragEvent } from "react";
import {
  CheckIcon,
  Loader2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";

import type { Food } from "@/lib/types";

interface Props {
  onImported: (foods: Food[]) => void;
}

export function ImportDropzone({ onImported }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg(null);
      }, 8000);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const label = {
    idle: "Click or drag your file here",
    loading: "Importing…",
    done: "Imported!",
    error: "Error — try again",
  }[status];

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : status === "done"
              ? "border-primary/50 bg-primary/5"
              : status === "error"
                ? "border-destructive/50 bg-destructive/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <div
          className={`flex size-14 items-center justify-center rounded-full transition-colors ${
            status === "done"
              ? "bg-primary text-primary-foreground"
              : status === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
          }`}
        >
          {status === "loading" ? (
            <Loader2Icon className="size-7 animate-spin" />
          ) : status === "done" ? (
            <CheckIcon className="size-7" />
          ) : status === "error" ? (
            <XIcon className="size-7" />
          ) : (
            <UploadCloudIcon className="size-7" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Supports .xlsx and .csv exports from MacroFactor
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
