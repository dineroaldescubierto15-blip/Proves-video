#!/usr/bin/env python3
"""Genera la veu en off oficial de Capital Sin Filtros ("csf") i la música original per a un reel.

No reimplementa ni modifica la veu: importa `qwen_clone_synth` de generator/reel.py del repositori csf-media
(clonat a --csf, fixat a un commit) i la crida amb els paràmetres bloquejats de voices/VOZ_BLOQUEADA.json,
després de comprovar l'empremta (sha256) del perfil de veu, igual que fa reel.py.

Ús:  python scripts/veu_csf.py reels/<nom>.json --csf csf-media
Escriu public/veu/<nom>/escena-NN.wav, musica.wav i manifest.json (durades). Si el guió no ha canviat, no fa res.
"""
import argparse, hashlib, json, pathlib, subprocess, sys, wave
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
FPS, TRANSICIO, RETARD, MARGE = 30, 12, 0.2, 0.5   # han de coincidir amb src/types.ts
SR = 48000

ap = argparse.ArgumentParser()
ap.add_argument("reel")
ap.add_argument("--csf", help="carpeta del repositori csf-media")
ap.add_argument("--comprova", action="store_true", help="només comprova: surt amb codi 3 si cal generar la veu")
args = ap.parse_args()

reel_path = pathlib.Path(args.reel)
reel = json.loads(reel_path.read_text(encoding="utf-8"))
nom = reel_path.stem
escenes = reel["escenes"]
idx = [i for i, e in enumerate(escenes) if e.get("veu")]
if not idx:
    print(f"{nom}: sense veu, res a fer"); sys.exit(0)

# Paràmetres bloquejats de la veu (voices/VOZ_BLOQUEADA.json de csf-media). Si no tenim el repo (mode --comprova),
# fem servir la còpia de referència per calcular l'empremta.
csf = pathlib.Path(args.csf).resolve() if args.csf else None
if csf:
    lock = json.loads((csf / "voices" / "VOZ_BLOQUEADA.json").read_text(encoding="utf-8"))
    perfil = csf / "voices" / "csf_voz_oficial.pt"
    if hashlib.sha256(perfil.read_bytes()).hexdigest() != lock["perfil_sha256"]:
        sys.exit("VOZ BLOQUEADA: el perfil de veu no coincideix amb l'aprovat.")
else:
    lock = json.loads((ROOT / "scripts" / "veu_csf_bloqueig.json").read_text(encoding="utf-8"))
par = lock["parametros"]
seed = int(reel.get("veuSeed", 0))
musica_seed = int(reel.get("musicaSeed", 1))

sortida = ROOT / "public" / "veu" / nom
empremta = hashlib.sha1(json.dumps(
    {"t": [escenes[i]["veu"] for i in idx], "i": idx, "s": seed, "p": par, "perfil": lock["perfil_sha256"],
     "d": [e.get("durada") for e in escenes], "m": musica_seed, "v": 1},
    ensure_ascii=False).encode()).hexdigest()[:16]
manifest_path = sortida / "manifest.json"
if manifest_path.exists() and json.loads(manifest_path.read_text())["empremta"] == empremta:
    print(f"{nom}: la veu ja està generada ({empremta})"); sys.exit(0)
if args.comprova:
    print(f"{nom}: cal generar la veu"); sys.exit(3)
if not csf:
    sys.exit("Cal --csf per generar la veu")

sys.path.insert(0, str(csf / "generator"))
import reel as csf_reel   # noqa: E402  (generator/reel.py de csf-media, sense canvis)

clips = csf_reel.qwen_clone_synth([escenes[i]["veu"] for i in idx],
                                  par["voice_speed"], seed, par["voice_takes"], par["voice_rate"])
pic = max(float(np.abs(c).max()) for c in clips) or 1.0   # mateixa normalització que reel.py (pic 0,9)

sortida.mkdir(parents=True, exist_ok=True)
for f in sortida.glob("escena-*.wav"):
    f.unlink()

def desa(path, a, canals=1):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(canals); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())

durades, info = [], {}
for e_i, e in enumerate(escenes):
    d = float(e.get("durada") or 3)
    if e_i in idx:
        c = clips[idx.index(e_i)] / pic * 0.9
        fitxer = f"escena-{e_i:02d}.wav"
        desa(sortida / fitxer, c)
        d = max(float(e.get("durada") or 0), len(c) / SR + RETARD + MARGE)
        info[e_i] = {"audio": f"veu/{nom}/{fitxer}", "durada": round(d * FPS) / FPS, "veu_s": round(len(c) / SR, 2)}
    durades.append(round(d * FPS) / FPS)

total = sum(durades) - (len(durades) - 1) * TRANSICIO / FPS
subprocess.run([sys.executable, str(csf / "generator" / "music.py"), f"{total + 0.5:.2f}",
                str(sortida / "musica.wav"), "--seed", str(musica_seed)], check=True)

manifest_path.write_text(json.dumps({"empremta": empremta, "total_s": round(total, 2), "musica": f"veu/{nom}/musica.wav",
                                     "escenes": {str(k): v for k, v in info.items()}}, ensure_ascii=False, indent=1))
print(f"{nom}: veu generada, {total:.1f} s")
