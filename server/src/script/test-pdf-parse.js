import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import pdfParse from "pdf-parse";

/**
 * Usage:
 *   node scripts/test-pdf-parse.js ./path/to/file.pdf
 *   (defaults to ./some.pdf if no argument provided)
 */

const cliPath = process.argv[2] || "./some.pdf";
const resolvedPath = path.resolve(cliPath);

if (!existsSync(resolvedPath)) {
  console.error(`❌ File not found: ${resolvedPath}`);
  process.exit(1);
}

(async () => {
  try {
    const buffer = await fs.readFile(resolvedPath);
    const result = await pdfParse(buffer);

    console.log("✅ Parsed PDF successfully");
    console.log("Characters extracted:", result.text.length);
    console.log("Pages (if available):", result.numpages ?? "(n/a)");
    console.log("--- Preview (first 500 chars) ---");
    console.log(result.text.slice(0, 500));
  } catch (err) {
    console.error("❌ pdf-parse failed:");
    console.error(err);
    process.exit(2);
  }
})();