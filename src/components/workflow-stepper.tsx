"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/prototype-types";

export function WorkflowStepper({ steps }: { steps: WorkflowStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-1">
          {index > 0 ? (
            <span className="mx-1 h-px w-4 bg-border sm:w-6" aria-hidden />
          ) : null}
          <Link
            href={step.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              step.status === "done" && "bg-secondary text-secondary-foreground",
              step.status === "current" && "bg-ai text-ai-foreground",
              step.status === "todo" && "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {step.status === "done" ? <Check className="size-3" aria-hidden /> : (
              <span className="tabular-nums">{index + 1}</span>
            )}
            {step.label}
          </Link>
        </li>
      ))}
    </ol>
  );
}
