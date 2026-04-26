#!/usr/bin/env node
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const SRC_DIR = "public/images/_original";
const OUT_DIR = "public/images";

const SKIP = new Set(["icons.svg", "icon-evelop.png", "icon-animation.gif"]);

const PNG_OPTS = { quality: 80, compressionLevel: 9, palette: true };

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const entries = await readdir(SRC_DIR);

let totalIn = 0;
let totalOut = 0;
const results = [];

for (const name of entries) {
  if (SKIP.has(name)) continue;
  const inPath = join(SRC_DIR, name);
  const inStat = await stat(inPath);
  if (!inStat.isFile()) continue;
  totalIn += inStat.size;

  const lower = name.toLowerCase();
  let outName = name;
  let outPath = join(OUT_DIR, outName);

  try {
    if (name === "bg-vector.svg") {
      outName = "bg-vector.webp";
      outPath = join(OUT_DIR, outName);
      await sharp(inPath, { density: 120 })
        .resize({ width: 1806, withoutEnlargement: true })
        .webp({ quality: 75, effort: 6 })
        .toFile(outPath);
    } else if (lower.endsWith(".png")) {
      await sharp(inPath).png(PNG_OPTS).toFile(outPath);
    } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      await sharp(inPath).jpeg({ quality: 82, mozjpeg: true }).toFile(outPath);
    } else {
      continue;
    }

    const outStat = await stat(outPath);
    totalOut += outStat.size;
    results.push({
      name: outName,
      original: name,
      in: inStat.size,
      out: outStat.size,
      ratio: outStat.size / inStat.size,
    });
  } catch (err) {
    console.error(`Failed ${name}:`, err.message);
  }
}

results.sort((a, b) => b.in - a.in);
for (const r of results) {
  const pct = ((1 - r.ratio) * 100).toFixed(1);
  const rename = r.original !== r.name ? ` (renamed from ${r.original})` : "";
  console.log(
    `${r.name.padEnd(26)} ${fmtBytes(r.in).padStart(10)} → ${fmtBytes(r.out).padStart(10)}  -${pct}%${rename}`,
  );
}

console.log("─".repeat(70));
console.log(
  `TOTAL: ${fmtBytes(totalIn)} → ${fmtBytes(totalOut)}  -${((1 - totalOut / totalIn) * 100).toFixed(1)}%`,
);
