// Hapus cache build Next.js (.next) supaya dev server selalu mulai bersih.
// Dipanggil oleh skrip "clean" / "dev:clean" di package.json.
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "..", ".next");

try {
  rmSync(target, { recursive: true, force: true });
  console.log("Cache .next dibersihkan.");
} catch (err) {
  console.warn("Lewati pembersihan .next:", err.message);
}
