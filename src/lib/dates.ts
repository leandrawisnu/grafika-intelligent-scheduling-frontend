import { parseDate, type DateValue } from "@internationalized/date";
import { format, isValid, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

/** API / form value: YYYY-MM-DD */
export function parseApiDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  const trimmed = String(value).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  const d = parseISO(trimmed);
  return isValid(d) ? d : undefined;
}

export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateId(value: string | undefined | null, fallback = "—"): string {
  const d = parseApiDate(value);
  if (!d) return value ? String(value).slice(0, 10) : fallback;
  return format(d, "d MMM yyyy", { locale: localeId });
}

/** Normalisasi respons API (ISO datetime) ke YYYY-MM-DD */
export function normalizeApiDateField(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, 10);
}

/** `YYYY-MM-DD` → react-aria `DateValue` */
export function apiDateToDateValue(value: string | null | undefined): DateValue | null {
  const normalized = normalizeApiDateField(value);
  if (!normalized) return null;
  try {
    return parseDate(normalized);
  } catch {
    return null;
  }
}

export function dateValueToApiDate(value: DateValue | null | undefined): string {
  if (!value) return "";
  const month = String(value.month).padStart(2, "0");
  const day = String(value.day).padStart(2, "0");
  return `${value.year}-${month}-${day}`;
}
