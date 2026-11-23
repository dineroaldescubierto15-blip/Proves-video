# 🎬 Reels Studio

Reels animats escrits en codi amb [Remotion](https://github.com/remotion-dev/remotion) + corbes de [GSAP](https://gsap.com), renderitzats automàticament a GitHub Actions.

## Crear un reel (des del mòbil, sense PC)
**Opció A – amb Claude:** obre aquest repo a [claude.ai/code](https://claude.ai/code) i demana, per exemple:
> Fes-me un reel de 15 segons amb 3 consells per estalviar a final de mes, colors verds.

Claude crea `reels/<nom>.json`, fa push i GitHub el renderitza.

**Opció B – a mà:** a GitHub, copia `reels/exemple.json` amb un altre nom, canvia els textos i fes *Commit*.

**El vídeo:** en 2–4 min el tens a **Releases → `videos`** (enllaç directe a l'MP4) o a **Actions → última run → Artifacts**.
També pots llançar-ho a mà: *Actions → Renderitza reels → Run workflow*.

## Què pot sortir al reel
| Tipus | Què és |
|---|---|
| `titol`, `punt`, `final` | Text gran que entra lletra a lletra, amb número rodó als punts |
| `personatge` | Mascota animada (parla, saluda, assenyala, celebra, pensa) amb bombolla de text |
| `noticia` | Targeta de notícia amb mitjà, data, foto i titular |
| `grafic` | Gràfic animat de **barres**, **línia** o **donut**, amb la font de les dades |
| `xifra` | Número gran que compta des de 0 (`+43,6%`) |
| `imatge` | Foto a pantalla completa amb zoom suau i peu de foto |

A més: `marca` (el teu @ a dalt), `presentador` (mascota petita a la cantonada) i `**paraules**` ressaltades amb marcador.
Exemple complet: [`reels/demo-pro.json`](reels/demo-pro.json).

## Format bàsic del JSON
```json
{
  "titol": "Nom intern",
  "colors": { "fons": "#0b0b14", "fons2": "#24123a", "accent": "#ff3d71", "text": "#ffffff" },
  "musica": "musica.mp3",
  "escenes": [
    { "tipus": "titol", "text": "Títol gran", "subtext": "frase curta", "durada": 3 },
    { "tipus": "punt", "numero": "1", "text": "Primer punt", "subtext": "explicació" },
    { "tipus": "final", "text": "Segueix-me!", "subtext": "crida a l'acció" }
  ]
}
```
`musica` és opcional (fitxer dins de `public/`). `durada` en segons (per defecte 3).

## En local (opcional)
```bash
npm install
npm run studio   # previsualització interactiva
npm run render   # renderitza tots els reels a out/
```
