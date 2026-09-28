"use client";

import type { DateValue } from "@internationalized/date";
import { DatePicker as UntitledDatePicker } from "@/components/application/date-picker/date-picker";
import { apiDateToDateValue, dateValueToApiDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  size?: "sm" | "md";
  align?: "start" | "center" | "end";
  "aria-label"?: string;
};

export function DatePicker({
  value,
  onChange,
  onValueChange,
  disabled,
  className,
  min,
  max,
  size = "sm",
  "aria-label": ariaLabel = "Pilih tanggal",
  name,
}: DatePickerProps) {
  const dateValue = apiDateToDateValue(value ?? "");
  const minValue = apiDateToDateValue(min) ?? undefined;
  const maxValue = apiDateToDateValue(max) ?? undefined;

  const emit = (next: DateValue | null) => {
    const api = dateValueToApiDate(next);
    onValueChange?.(api);
    onChange?.(api);
  };

  return (
    <div
      className={cn(
        "w-full [&_[data-slot=field-trigger]]:w-full [&_[data-slot=group]]:w-full",
        className,
      )}
    >
      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}
      <UntitledDatePicker
        aria-label={ariaLabel}
        isDisabled={disabled}
        value={dateValue}
        minValue={minValue}
        maxValue={maxValue}
        onChange={emit}
      />
    </div>
  );
}
