// Renderitza cada reels/*.json a out/<nom>.mp4
// Ús: node scripts/render-all.mjs            (tots)
//     node scripts/render-all.mjs reels/x.json (només aquests)
// Si existeix public/veu/<nom>/manifest.json (veu en off generada), hi afegeix l'àudio i les durades.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const args = process.argv.slice(2).filter((a) => a.endsWith(".json"));
const fitxers = args.length
  ? args
  : readdirSync("reels").filter((f) => f.endsWith(".json")).map((f) => `reels/${f}`);

mkdirSync("out", { recursive: true });
for (const f of fitxers) {
  const nom = basename(f, ".json");
  const props = JSON.parse(readFileSync(f, "utf8"));
  const manifest = `public/veu/${nom}/manifest.json`;
  if (existsSync(manifest)) {
    const m = JSON.parse(readFileSync(manifest, "utf8"));
    props.escenes = props.escenes.map((e, i) => (m.escenes[i] ? { ...e, ...m.escenes[i] } : e));
    if (!props.musica && m.musica) props.musica = m.musica;
    console.log(`  amb veu en off (${m.total_s} s)`);
  } else if (props.escenes.some((e) => e.veu)) {
    console.log("  ⚠ aquest reel té guió de veu però encara no s'ha generat: es renderitza sense veu");
  }
  const tmp = resolve(`out/${nom}.props.json`);
  writeFileSync(tmp, JSON.stringify(props));
  console.log(`\n▶ Renderitzant ${f} → out/${nom}.mp4`);
  execFileSync(
    "npx",
    ["remotion", "render", "src/index.ts", "Reel", `out/${nom}.mp4`, `--props=${tmp}`, "--codec=h264", "--crf=18",
     ...(process.env.BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.BROWSER_EXECUTABLE}`] : [])],
    { stdio: "inherit" },
  );
}
