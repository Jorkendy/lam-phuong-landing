import { FEATURES } from "@/app/feature-flags";

export const FILTER_KEYS = [
  "job_types",
  "job_categories",
  "product_groups",
  "locations",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

const FIELD_BY_KEY: Record<FilterKey, string> = {
  job_types: "Loại công việc",
  job_categories: "Danh mục công việc",
  product_groups: "Nhóm sản phẩm",
  locations: "Khu vực",
};

export const JOB_LIST_FIELDS = [
  "Tiêu đề",
  "Mô tả công việc",
  "Khu vực",
  "Slug",
  "Hạn chót nhận",
] as const;

export function jobListFieldsQuery(): string {
  return JOB_LIST_FIELDS.map(
    (f) => `fields%5B%5D=${encodeURIComponent(f)}`,
  ).join("&");
}

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

type ParamsLike =
  | URLSearchParams
  | { [key: string]: string | string[] | undefined };

function readParam(params: ParamsLike, key: string): string | undefined {
  if (typeof (params as URLSearchParams).get === "function") {
    return (params as URLSearchParams).get(key) ?? undefined;
  }
  const raw = (params as Record<string, string | string[] | undefined>)[key];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export function buildJobsFilterFormula(params: ParamsLike): string {
  const groups: string[] = [`{Status}="Approved"`];

  if (FEATURES.DEADLINE_FILTER) {
    groups.push(
      `OR(NOT({Hạn chót nhận}), IS_AFTER({Hạn chót nhận}, DATEADD(TODAY(), -1, 'days')))`,
    );
  }

  for (const key of FILTER_KEYS) {
    const raw = readParam(params, key);
    if (!raw) continue;
    const values = raw.split("|").filter(Boolean);
    if (values.length === 0) continue;
    const field = FIELD_BY_KEY[key];
    const ors = values.map((v) => {
      const escaped = escapeFormulaString(v);
      return `FIND("|${escaped}|", "|" & ARRAYJOIN({${field}}, "|") & "|")`;
    });
    groups.push(ors.length === 1 ? ors[0] : `OR(${ors.join(", ")})`);
  }

  return groups.length === 1 ? groups[0] : `AND(${groups.join(", ")})`;
}
