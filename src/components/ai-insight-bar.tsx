import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiBadge } from "@/components/ai-badge";

export function AiInsightBar({
  title,
  detail,
  meta,
  className,
  children,
}: {
  title: string;
  detail?: string;
  meta?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-component="GIS/InsightBar"
      data-auto-layout="true"
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-card)] border border-primary/15 bg-ai-muted px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-ai text-ai-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AiBadge />
            <p className="font-medium text-foreground">{title}</p>
          </div>
          {detail ? <p className="mt-0.5 text-sm text-foreground/80">{detail}</p> : null}
          {meta ? <p className="mt-0.5 text-xs text-foreground/60">{meta}</p> : null}
        </div>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
