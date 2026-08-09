"use client";

import {
  DownloadIcon,
  FileUpIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportButton } from "@/components/ImportButton";
import type { Food } from "@/lib/types";

interface Props {
  /** Controls whether the modal is shown. */
  open: boolean;
  /** Called when real data is imported — the parent closes the modal. */
  onImported: (foods: Food[]) => void;
}

const STEPS = [
  {
    icon: MoreHorizontalIcon,
    title: "Open MacroFactor",
    body: "In the MacroFactor app, open the More tab and tap Data Export.",
  },
  {
    icon: DownloadIcon,
    title: "Export your data",
    body: "Choose a range — all-time gives the richest history — and tap Export. A .xlsx or .csv file is generated (.xlsx recommended).",
  },
  {
    icon: ShareIcon,
    title: "Save / share the file",
    body: "Save the exported file to your device, or use your phone's share sheet (AirDrop, email, cloud drive) to send it to the device you're using this dashboard on.",
  },
  {
    icon: FileUpIcon,
    title: "Import here",
    body: "Click Import data below and pick the file you just exported. The blur clears and your real dashboard appears.",
  },
] as const;

export function OnboardingModal({ open, onImported }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Get your MacroFactor data in
          </DialogTitle>
          <DialogDescription>
            Here&apos;s how to export from MacroFactor and import it here. It takes
            about a minute.
          </DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col items-center gap-1.5 pt-1">
          <ImportButton onImported={onImported} />
          <p className="text-[11px] text-muted-foreground">
            Supports .xlsx and .csv exports from MacroFactor.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
