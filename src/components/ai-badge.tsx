import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiBadge({
  className,
  children = "AI",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-component="GIS/AiBadge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-ai px-2 py-0.5 text-[11px] font-medium tracking-wide text-ai-foreground",
        className
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      {children}
    </span>
  );
}
