"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImportDropzone } from "@/components/ImportDropzone";
import type { Food } from "@/lib/types";

interface Props {
  /** Controls whether the modal is shown. */
  open: boolean;
  /** Called when real data is imported — the parent closes the modal. */
  onImported: (foods: Food[]) => void;
}

const STEPS = [
  {
    image: "/images/onboarding/step1-more-tab.png",
    title: "Open MacroFactor",
    body: "In the MacroFactor app, open the More tab and tap Data Export.",
  },
  {
    image: "/images/onboarding/step2-quick-export.png",
    title: "Choose Quick Export",
    body: "Tap Quick Export. Make sure “Include MacroFactor Workouts Data” is unchecked — we only need the nutrition data.",
  },
  {
    image: "/images/onboarding/step3-exported-file.png",
    title: "Save the file",
    body: "Export the file and save it to your device, or use AirDrop / email / cloud drive to send it to the device you're using this dashboard on.",
  },
] as const;

export function OnboardingModal({ open, onImported }: Props) {
  const [step, setStep] = useState(0);
  const totalSteps = STEPS.length + 1; // 3 image steps + 1 import step

  const isLastStep = step === totalSteps - 1;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Import your data to get started.
          </DialogTitle>
          <DialogDescription>
            Here&apos;s how to export from MacroFactor and import it here. It takes
            about a minute.
          </DialogDescription>
        </DialogHeader>

        {/* Step content — fixed height so the modal doesn't jump between steps */}
        <div className="min-h-[22rem]">
          {isLastStep ? (
            <div className="flex h-full flex-col gap-4 py-2">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tabular-nums">
                  {STEPS.length + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-sm font-medium">Import your data</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Drop the file you just exported from MacroFactor below, or
                    click to browse. The blur clears and your real dashboard
                    appears.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 min-h-0">
                <ImportDropzone onImported={onImported} />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col gap-3">
              {/* Step number + title + description */}
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tabular-nums">
                  {step + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-sm font-medium">
                    {STEPS[step].title}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {STEPS[step].body}
                  </p>
                </div>
              </div>

              {/* Step image */}
              <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                <Image
                  src={STEPS[step].image}
                  alt={STEPS[step].title}
                  width={300}
                  height={400}
                  className="mx-auto max-h-64 w-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation + progress dots */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeftIcon className="size-4" />
            Back
          </Button>

          {/* Progress dots — active is wider */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {!isLastStep ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
