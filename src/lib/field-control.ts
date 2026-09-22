import { cn } from "@/lib/utils";

/** Shared look for text inputs, selects, and date triggers in forms. */
export const fieldControlClass = cn(
  "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm font-normal shadow-none outline-none transition-colors",
  "hover:bg-muted/40",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
  "data-pressed:border-ring data-pressed:bg-muted/50 data-pressed:ring-3 data-pressed:ring-ring/50",
  "dark:bg-input/30 dark:hover:bg-input/50",
);
