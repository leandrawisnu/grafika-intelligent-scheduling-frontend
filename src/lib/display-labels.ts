export type DisplayNamed = {
  id?: string;
  nama?: string;
  nama_lengkap?: string;
  kode?: string;
};

export function normalizeId(id: unknown): string {
  return String(id ?? "").trim().toLowerCase();
}

export function pascalFromSnake(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Nested relation from API (`tahun_ajaran` or legacy `TahunAjaran`). */
export function nestedRelation<T extends DisplayNamed>(
  row: Record<string, unknown>,
  nestedKey: string,
): T | undefined {
  const snake = row[nestedKey];
  if (snake && typeof snake === "object") return snake as T;
  const pascal = row[pascalFromSnake(nestedKey)];
  if (pascal && typeof pascal === "object") return pascal as T;
  return undefined;
}

export function displayName(entity: DisplayNamed | undefined): string | undefined {
  if (!entity) return undefined;
  return entity.nama ?? entity.nama_lengkap ?? entity.kode;
}

/** Resolve FK column label: nested object → options → catalog. Never returns raw UUID. */
export function resolveFkLabel(
  row: Record<string, unknown>,
  fkKey: string,
  catalog?: DisplayNamed[],
  options?: { value: string; label: string }[],
): string {
  const nestedKey = fkKey.replace(/_id$/, "");
  const nested = nestedRelation<DisplayNamed>(row, nestedKey);
  const fromNested = displayName(nested);
  if (fromNested) return fromNested;

  const fkId = row[fkKey] ?? nested?.id;
  const normId = normalizeId(fkId);
  if (!normId) return "—";

  const fromOptions = options?.find((o) => normalizeId(o.value) === normId)?.label;
  if (fromOptions) return fromOptions;

  const fromCatalog = catalog?.find((e) => normalizeId(e.id) === normId);
  const fromCatalogLabel = displayName(fromCatalog);
  if (fromCatalogLabel) return fromCatalogLabel;

  return "—";
}
