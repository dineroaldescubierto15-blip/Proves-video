// Renderitza cada reels/*.json a out/<nom>.mp4
// Ús: node scripts/render-all.mjs            (tots)
//     node scripts/render-all.mjs reels/x.json (només aquests)
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const args = process.argv.slice(2).filter((a) => a.endsWith(".json"));
const fitxers = args.length
  ? args
  : readdirSync("reels").filter((f) => f.endsWith(".json")).map((f) => `reels/${f}`);

mkdirSync("out", { recursive: true });
for (const f of fitxers) {
  const nom = basename(f, ".json");
  console.log(`\n▶ Renderitzant ${f} → out/${nom}.mp4`);
  execFileSync(
    "npx",
    ["remotion", "render", "src/index.ts", "Reel", `out/${nom}.mp4`, `--props=${resolve(f)}`, "--codec=h264", "--crf=18",
     ...(process.env.BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.BROWSER_EXECUTABLE}`] : [])],
    { stdio: "inherit" },
  );
}
