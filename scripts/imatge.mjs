// Busca una imatge amb llicència lliure i la deixa a punt per al reel.
//
// Ús:  node scripts/imatge.mjs "consulta en anglès" [--font openverse|pexels|unsplash] [--nom nom-fitxer] [--horitzontal]
//
// Fonts:
//   openverse (per defecte, sense clau): imatges CC que permeten ús comercial i modificació
//             (inclou Wikimedia Commons, Flickr...). Cal citar l'autor.
//   pexels    (cal PEXELS_API_KEY): llicència Pexels, ús lliure. Es cita igualment per cortesia.
//   unsplash  (cal UNSPLASH_ACCESS_KEY): llicència Unsplash. Segons les seves normes la imatge
//             s'enllaça (no es descarrega) i s'ha de citar autor + Unsplash.
//
// Escriu el resultat per pantalla en JSON: {"imatge": "...", "credit": "..."}
// i afegeix una línia a public/imatges/CREDITS.md.
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opcio = (nom) => {
  const i = args.indexOf(`--${nom}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const consulta = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--font") && !args[i - 1]?.startsWith("--nom"));
if (!consulta) {
  console.error('Ús: node scripts/imatge.mjs "consulta" [--font openverse|pexels|unsplash] [--nom nom]');
  process.exit(1);
}
const fontTriada = opcio("font") ?? "openverse";
const vertical = !args.includes("--horitzontal");
const nom =
  opcio("nom") ??
  consulta.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const UA = { "User-Agent": "reels-studio/1.0 (image search script)" };

const json = async (url, headers = {}, intents = 3) => {
  for (let i = 1; ; i++) {
    const r = await fetch(url, { headers: { ...UA, ...headers } });
    if (r.ok) return r.json();
    if (i >= intents || r.status < 500) throw new Error(`${r.status} ${r.statusText} — ${url}`);
    await new Promise((ok) => setTimeout(ok, 2000 * i));
  }
};

/** Prova les URLs en ordre i desa la primera que funcioni */
const descarrega = async (urls, ext = "jpg") => {
  mkdirSync("public/imatges", { recursive: true });
  for (const url of [urls].flat()) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (!r?.ok) continue;
    const fitxer = `imatges/${nom}.${ext}`;
    writeFileSync(`public/${fitxer}`, Buffer.from(await r.arrayBuffer()));
    return fitxer;
  }
  return null;
};

const fonts = {
  async openverse() {
    const q = new URLSearchParams({
      q: consulta,
      license_type: "commercial,modification",
      page_size: "20",
      mature: "false",
      ...(vertical ? { aspect_ratio: "tall" } : {}),
    });
    let d = await json(`https://api.openverse.org/v1/images/?${q}`);
    if (!d.results?.length && vertical) {
      q.delete("aspect_ratio");
      d = await json(`https://api.openverse.org/v1/images/?${q}`);
    }
    const candidats = [...(d.results ?? [])].sort((a, b) => ((b.width ?? 0) >= 1000) - ((a.width ?? 0) >= 1000));
    if (!candidats.length) throw new Error("Cap resultat a Openverse");
    for (const r of candidats.slice(0, 8)) {
      // la miniatura a mida completa d'Openverse evita els límits d'alguns servidors d'origen
      const imatge = await descarrega([
        `https://api.openverse.org/v1/images/${r.id}/thumb/?full_size=true&compressed=false`,
        r.url,
      ]);
      if (!imatge) continue;
      const llicencia = `CC ${r.license.toUpperCase()} ${r.license_version ?? ""}`
        .trim()
        .replace(/^CC PDM.*/, "Domini públic")
        .replace(/^CC CC0.*/, "CC0");
      return {
        imatge,
        credit: `${r.creator ?? "Autor desconegut"} · ${llicencia} · ${r.source ?? r.provider}`,
        origen: r.foreign_landing_url,
      };
    }
    throw new Error("No s'ha pogut descarregar cap resultat d'Openverse");
  },
  async pexels() {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error("Falta PEXELS_API_KEY a l'entorn");
    const q = new URLSearchParams({ query: consulta, per_page: "5", orientation: vertical ? "portrait" : "landscape" });
    const d = await json(`https://api.pexels.com/v1/search?${q}`, { Authorization: key });
    const r = d.photos?.[0];
    if (!r) throw new Error("Cap resultat a Pexels");
    return {
      imatge: await descarrega(vertical ? r.src.portrait : r.src.large2x),
      credit: `${r.photographer} · Pexels`,
      origen: r.url,
    };
  },
  async unsplash() {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error("Falta UNSPLASH_ACCESS_KEY a l'entorn");
    const h = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };
    const q = new URLSearchParams({ query: consulta, per_page: "5", orientation: vertical ? "portrait" : "landscape", content_filter: "high" });
    const d = await json(`https://api.unsplash.com/search/photos?${q}`, h);
    const r = d.results?.[0];
    if (!r) throw new Error("Cap resultat a Unsplash");
    // Normes d'Unsplash: avisar de la "descàrrega" i enllaçar la imatge directament
    await fetch(r.links.download_location, { headers: { ...UA, ...h } }).catch(() => {});
    return {
      imatge: `${r.urls.raw}&w=1080&h=1920&fit=crop&q=80&fm=jpg`,
      credit: `${r.user.name} · Unsplash`,
      origen: `${r.links.html}?utm_source=reels_studio&utm_medium=referral`,
    };
  },
};

if (!fonts[fontTriada]) throw new Error(`Font desconeguda: ${fontTriada}`);
const res = await fonts[fontTriada]();
const creditsPath = "public/imatges/CREDITS.md";
if (!existsSync(creditsPath)) writeFileSync(creditsPath, "# Crèdits de les imatges\n\n");
appendFileSync(creditsPath, `- \`${res.imatge}\` — ${res.credit} — ${res.origen}\n`);
console.log(JSON.stringify({ imatge: res.imatge, credit: res.credit, origen: res.origen }, null, 2));
