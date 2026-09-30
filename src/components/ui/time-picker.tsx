"use client";

import { Clock } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Button as RacButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { cx } from "@/lib/utils/cx";

const ROW = 40;
const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const PERIODS = ["AM", "PM"] as const;

type Period = (typeof PERIODS)[number];

export function clockParts(value: string): { hour: string; minute: string } | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
  };
}

/** API time `HH:MM` or `HH:MM:SS` → `HH:MM`. Kosong jika tidak valid. */
export function normalizeClock(value: unknown): string {
  const parts = clockParts(value == null ? "" : String(value));
  if (!parts) return "";
  return `${parts.hour}:${parts.minute}`;
}

/** Nilai yang disimpan ke kolom TIME. */
export function clockForApi(value: unknown): string {
  const clock = normalizeClock(value);
  return clock ? `${clock}:00` : "";
}

function toWheel(value: string): { hour: string; minute: string; period: Period } {
  const parts = clockParts(value) ?? { hour: "07", minute: "00" };
  const hour24 = Number(parts.hour);
  return {
    hour: String(hour24 % 12 || 12),
    minute: parts.minute,
    period: hour24 >= 12 ? "PM" : "AM",
  };
}

function to24Hour(hour12: string, period: Period): string {
  const hour = Number(hour12) % 12;
  return String(period === "PM" ? hour + 12 : hour).padStart(2, "0");
}

function pickerTitle(label: string): string {
  const name = label.trim().toLowerCase();
  if (name === "mulai") return "Pilih waktu mulai";
  if (name === "selesai") return "Pilih waktu selesai";
  return label.trim() ? `Pilih ${name}` : "Pilih waktu";
}

function WheelColumn({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ignoreScroll = useRef(true);
  const [offset, setOffset] = useState(() => Math.max(0, items.indexOf(value)) * ROW);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const index = Math.max(0, items.indexOf(value));
    ignoreScroll.current = true;
    list.scrollTop = index * ROW;
    setOffset(index * ROW);
    const frame = requestAnimationFrame(() => {
      ignoreScroll.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [items, value]);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;

    const commit = () => {
      if (ignoreScroll.current) return;
      const index = Math.min(items.length - 1, Math.max(0, Math.round(list.scrollTop / ROW)));
      const next = items[index];
      if (next && next !== value) onChange(next);
    };

    list.addEventListener("scrollend", commit);
    return () => list.removeEventListener("scrollend", commit);
  }, [items, onChange, value]);

  const move = (direction: -1 | 1) => {
    const index = Math.max(0, items.indexOf(value));
    const next = items[Math.min(items.length - 1, Math.max(0, index + direction))];
    if (next && next !== value) onChange(next);
  };

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      className="h-[200px] flex-1 overflow-y-auto overscroll-contain py-[80px] [scrollbar-width:none] snap-y snap-mandatory focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      onScroll={(event) => {
        if (ignoreScroll.current) return;
        setOffset(event.currentTarget.scrollTop);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {items.map((item, index) => {
        const distance = Math.abs(index * ROW - offset) / ROW;
        const selected = distance < 0.5;
        return (
          <button
            key={item}
            type="button"
            role="option"
            aria-selected={selected}
            className={cn(
              "flex h-10 w-full snap-center items-center justify-center text-base tabular-nums",
              selected ? "font-semibold text-foreground" : "font-normal text-muted-foreground/45",
            )}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih waktu",
  "aria-label": ariaLabel = "Pilih waktu",
}: {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const clock = normalizeClock(value ?? "");
  const wheel = toWheel(clock);
  const title = pickerTitle(ariaLabel);

  const commit = (hour: string, minute: string, period: Period) => {
    onChange(`${to24Hour(hour, period)}:${minute}`);
  };

  return (
    <AriaDialogTrigger
      onOpenChange={(open) => {
        if (open && !clock) onChange("07:00");
      }}
    >
      <RacButton
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "flex h-10 w-full min-w-0 items-center gap-2 rounded-full border border-input bg-transparent px-5 text-left text-sm outline-none transition-colors",
          "hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/40",
          "data-pressed:border-ring data-pressed:ring-1 data-pressed:ring-ring/40",
          !clock && "text-muted-foreground",
        )}
      >
        <Clock className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate tabular-nums">{clock || placeholder}</span>
      </RacButton>
      <AriaPopover
        offset={8}
        placement="bottom start"
        shouldFlip
        containerPadding={12}
        className={({ isEntering, isExiting }) =>
          cx(
            "z-[200] w-[220px] origin-(--trigger-anchor-point) will-change-transform",
            isEntering &&
              "duration-150 ease-out animate-in fade-in placement-bottom:slide-in-from-top-0.5",
            isExiting &&
              "duration-100 ease-in animate-out fade-out placement-bottom:slide-out-to-top-0.5",
          )
        }
      >
        <AriaDialog className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground shadow-md outline-none">
          <p className="px-4 pt-3 pb-1 text-sm font-medium">{title}</p>
          <div className="relative px-2 pb-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-10 -translate-y-1/2 border-y border-border"
            />
            <div className="flex [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_72%,transparent)]">
              <WheelColumn
                label="Jam"
                items={HOURS}
                value={wheel.hour}
                onChange={(hour) => commit(hour, wheel.minute, wheel.period)}
              />
              <WheelColumn
                label="Menit"
                items={MINUTES}
                value={wheel.minute}
                onChange={(minute) => commit(wheel.hour, minute, wheel.period)}
              />
              <WheelColumn
                label="AM atau PM"
                items={PERIODS}
                value={wheel.period}
                onChange={(period) => commit(wheel.hour, wheel.minute, period as Period)}
              />
            </div>
          </div>
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
}
