# Reels Studio

Projecte per crear reels verticals (1080×1920, 30 fps) amb **Remotion** (React → vídeo) i corbes d'animació de **GSAP**.
Es renderitzen a **GitHub Actions**, així que no cal cap ordinador encès.

## Com funciona
- Cada reel és un fitxer `reels/<nom>.json` (títol, colors, música opcional i llista d'escenes).
- La plantilla visual és `src/Reel.tsx`. Les corbes de GSAP es fan servir via `src/anim.ts` (`tween(frame, inici, durada, "back.out(2)")`).
  No facis servir `gsap.to()` / timelines que corren sols: Remotion renderitza fotograma a fotograma i tot ha de dependre de `useCurrentFrame()`.
- En fer push d'un `reels/*.json`, l'Action `.github/workflows/render.yml` el renderitza i el publica:
  - a la release **`videos`** del repo (enllaç directe a l'MP4, ideal per descarregar des del mòbil),
  - i com a artefacte de la run.

## Quan l'usuari demani un reel nou
1. Crea `reels/<nom-curt-sense-espais>.json` seguint l'esquema de `src/types.ts` (tipus d'escena: `titol`, `punt`, `final`).
   Textos curts: títols ≤ 20 caràcters, subtextos ≤ 60. Durada per escena 2.5–4 s. Total ideal 10–30 s.
2. Si demana un estil/animació que la plantilla no té, amplia `src/Reel.tsx` (nous `tipus`) sense trencar els reels existents.
3. Comprova `npx tsc`. Si hi ha temps, renderitza'l localment: `node scripts/render-all.mjs reels/<nom>.json`
   (en entorns sense descàrrega de Chrome: `BROWSER_EXECUTABLE=/opt/pw-browsers/chromium`).
4. Fes commit i push. Digues a l'usuari que en ~2–4 minuts tindrà l'MP4 a Releases → `videos`.

## Música
Posa l'àudio a `public/` (p. ex. `public/musica.mp3`) i afegeix `"musica": "musica.mp3"` al JSON.
Només música amb drets d'ús (o la biblioteca d'àudio d'Instagram en publicar).

## Skills
A `.claude/skills/` hi ha les skills oficials de Remotion (`remotion-dev/skills`) i de GSAP (`greensock/gsap-skills`).

## Llicència
Remotion és gratuït per a particulars i empreses de fins a 3 persones; empreses més grans necessiten llicència (skill `remotion-license`).
