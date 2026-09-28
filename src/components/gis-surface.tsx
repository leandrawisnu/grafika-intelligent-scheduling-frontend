import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function GisPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("gis-panel", className)}>{children}</div>;
}

export function GisSectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function GisStatTile({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  className,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "ai" | "danger";
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn("gis-stat-tile", className)}
      data-tone={tone === "ai" ? "ai" : undefined}
    >
      <dt
        className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          tone === "ai" && "text-ai",
          tone === "danger" && "text-destructive"
        )}
      >
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
          tone === "danger" && "text-destructive",
          valueClassName
        )}
      >
        {value}
      </dd>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
