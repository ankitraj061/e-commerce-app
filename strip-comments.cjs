/**
 * strip-comments.cjs
 * Removes all single-line (//), multi-line (/* *\/), and JSDoc (/** *\/) comments
 * from every .ts / .tsx file in backend/src and frontend (excluding node_modules,
 * .next, dist). Preserves strings and template literals — strip-comments parses
 * the source correctly so URLs like "http://..." are untouched.
 */

const fs   = require("fs");
const path = require("path");
const strip = require("strip-comments");

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "prisma"]);
const FILE_RE   = /\.(ts|tsx)$/;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, files);
    } else if (FILE_RE.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const roots = [
  path.join(__dirname, "backend/src"),
  path.join(__dirname, "frontend"),
];

let total = 0;

for (const root of roots) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, "utf8");

    const stripped = strip(original, {
      language: "javascript", // handles TS/TSX syntax (same comment rules)
      preserveNewlines: false,
    });

    // Collapse 3+ consecutive blank lines down to one blank line
    const cleaned = stripped.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

    if (cleaned !== original) {
      fs.writeFileSync(file, cleaned, "utf8");
      const rel = path.relative(__dirname, file);
      console.log(`  ✓  ${rel}`);
      total++;
    }
  }
}

console.log(`\nDone — ${total} file(s) updated.`);
