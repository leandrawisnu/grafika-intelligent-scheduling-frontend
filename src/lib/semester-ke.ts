export const SEMESTER_KE_OPTIONS = [
  { value: "1", label: "Ganjil" },
  { value: "2", label: "Genap" },
] as const;

export function labelSemesterKe(value: unknown): string {
  const n = Number(value);
  if (n === 1) return "Ganjil";
  if (n === 2) return "Genap";
  return value == null || value === "" ? "—" : String(value);
}
