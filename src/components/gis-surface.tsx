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
  tone = "default",
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "ai";
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn("gis-stat-tile", className)}
      data-tone={tone === "ai" ? "ai" : undefined}
    >
      <dt
        className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          tone === "ai" && "text-ai"
        )}
      >
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        {label}
      </dt>
      <dd className="mt-1 font-medium tabular-nums">{value}</dd>
    </div>
  );
}
