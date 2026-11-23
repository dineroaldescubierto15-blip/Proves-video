# Reels Studio

Projecte per crear reels verticals (1080×1920, 30 fps) amb **Remotion** (React → vídeo) i corbes d'animació de **GSAP**.
Es renderitzen a **GitHub Actions**, així que no cal cap ordinador encès.

## Com funciona
- Cada reel és un fitxer `reels/<nom>.json` (títol, colors, música opcional i llista d'escenes).
- La composició és `src/Reel.tsx`; cada tipus d'escena viu a `src/escenes/`, el personatge a `src/components/Personatge.tsx`. Les corbes de GSAP es fan servir via `src/anim.ts` (`tween(frame, inici, durada, "back.out(2)")`).
  No facis servir `gsap.to()` / timelines que corren sols: Remotion renderitza fotograma a fotograma i tot ha de dependre de `useCurrentFrame()`.
- En fer push d'un `reels/*.json`, l'Action `.github/workflows/render.yml` el renderitza i el publica:
  - a la release **`videos`** del repo (enllaç directe a l'MP4, ideal per descarregar des del mòbil),
  - i com a artefacte de la run.

## Quan l'usuari demani un reel nou
1. Crea `reels/<nom-curt-sense-espais>.json` seguint l'esquema de `src/types.ts` (mira `reels/demo-pro.json` com a model).
   Tipus d'escena:
   - `titol`, `punt` (amb `numero`), `final` → text gran animat lletra a lletra.
   - `personatge` → mascota animada amb bombolla. `expressio`: content|sorpres|pensatiu|preocupat|enfadat; `accio`: parla|saluda|assenyala|celebra|pensa|quiet; `personatge`: {color, accessori: cap|ulleres|corbata|ulleres+corbata}.
   - `noticia` → targeta amb `titular`, `font` (mitjà), `data`, `etiqueta`, `url` (es mostra el domini com a cita), `imatge` i `credit` opcionals.
   - `grafic` → `grafic`: barres|linia|donut, `titol`, `dades` [{etiqueta, valor}], `unitat`, `destaca` (índex), `font`.
   - `xifra` → número gran que compta (`valor`, `prefix`, `sufix`, `decimals`, `text`, `font`).
   - `imatge` → foto a pantalla completa amb `text` i `credit`.
   Opcions globals: `marca` (el @usuari a dalt), `presentador` (mascota petita a la cantonada en escenes de text/gràfic).
   Posa `**paraula**` per ressaltar-la amb marcador.
   Textos curts: títols ≤ 30 caràcters, subtextos ≤ 60, bombolles ≤ 70. Durada per escena 3–4.5 s. Total ideal 20–45 s.
   Per donar credibilitat: acompanya cada afirmació amb una `noticia`, `grafic` o `xifra` i omple sempre el camp `font`.
   **No inventis dades ni notícies com si fossin reals**: fes servir les dades que doni l'usuari o fonts públiques que puguis verificar, i cita-les.
2. Si demana un estil/animació que la plantilla no té, amplia `src/Reel.tsx` (nous `tipus`) sense trencar els reels existents.
3. Comprova `npx tsc`. Si hi ha temps, renderitza'l localment: `node scripts/render-all.mjs reels/<nom>.json`
   (en entorns sense descàrrega de Chrome: `BROWSER_EXECUTABLE=/opt/pw-browsers/chromium`).
4. Fes commit i push. Digues a l'usuari que en ~2–4 minuts tindrà l'MP4 a Releases → `videos`.

## Estil CSF i veu oficial
- `"estil": "csf"` aplica el manual de marca de Capital Sin Filtros: fons #0A0A0A, text #F5F5F2, daurat #F4C542 només per
  a la xifra/paraula clau (`**...**`), Inter, text a l'esquerra, zona segura (y 260–1480, x 90–930), logo "CSF", sense
  emojis ni personatges ni fotos. Posa `"marca": "CSF"` i `"avisLegal": "Contenido informativo, no es asesoramiento financiero."`.
  Les regles de contingut (to, públic, guió, captions) són a `CLAUDE.md` de csf-media: segueix-les.
- Cada escena pot portar `"veu"`: el guió de la veu en off (castellà, números en lletres, frases curtes; 110–160 paraules
  per a 35–55 s). En fer push, l'Action genera la veu oficial "csf" cridant, sense modificar-la, la funció de
  csf-media (`scripts/veu_csf.py`, versió fixada a `CSF_MEDIA_REF` del workflow), la desa a `public/veu/<nom>/`
  i renderitza el vídeo amb veu i música original. Tarda ~15–20 min per reel. La durada de cada escena s'ajusta a la veu.
- **Veu bloquejada**: no canviïs paràmetres, perfil ni codi de la veu. Només es permet `"veuSeed"` per repetir una presa.
- Escena 1: el ganxo complet abans de 2,5 s (és la portada) i durada ≥ 3,2 s.
- Captions a `textos/<nom>.txt` amb el format de CSF.

## Notícies reals
- Busca-les amb WebSearch i obre l'article per comprovar què diu de veritat. Mai no t'inventis un titular.
- A `titular` posa el titular original o un resum fidel i curt; a `font` el nom del mitjà, a `data` la data de publicació i a `url` l'enllaç.
- Les xifres de gràfics i `xifra` han de sortir d'aquestes fonts (o d'organismes oficials) i s'han de citar al camp `font`.
- No facis servir la foto de l'article (té drets): busca'n una de lliure amb l'script d'imatges.

## Imatges
**Cerca automàtica:** `NODE_USE_ENV_PROXY=1 node scripts/imatge.mjs "consulta en anglès" [--font openverse|pexels|unsplash] [--nom nom] [--horitzontal]`
retorna `{imatge, credit}`: copia'ls al JSON (`imatge` + `credit`) i queda anotat a `public/imatges/CREDITS.md`.
Openverse no necessita clau; Pexels i Unsplash llegeixen `PEXELS_API_KEY` i `UNSPLASH_ACCESS_KEY` de l'entorn.

També es poden pujar a mà a `public/imatges/` i referenciar com `"imatges/nom.jpg"`, o fes servir una URL https directa a la imatge.
Fes servir imatges pròpies, amb llicència lliure (Unsplash, Pexels, Wikimedia) o captures citant la font. Si la URL no existeix el render falla.

## Música
Posa l'àudio a `public/` (p. ex. `public/musica.mp3`) i afegeix `"musica": "musica.mp3"` al JSON.
Només música amb drets d'ús (o la biblioteca d'àudio d'Instagram en publicar).

## Skills
A `.claude/skills/` hi ha les skills oficials de Remotion (`remotion-dev/skills`) i de GSAP (`greensock/gsap-skills`).

## Llicència
Remotion és gratuït per a particulars i empreses de fins a 3 persones; empreses més grans necessiten llicència (skill `remotion-license`).
