import gsap from "gsap";
import { interpolate } from "remotion";

/**
 * Corbes de GSAP fetes servir de manera determinista: en lloc de deixar que
 * GSAP animi pel seu compte (cosa que no és compatible amb el render per
 * fotogrames), li demanem només la corba i la calculem a cada frame.
 */
const cache = new Map<string, (p: number) => number>();
export const ease = (nom: string) => {
  if (!cache.has(nom)) cache.set(nom, gsap.parseEase(nom) as (p: number) => number);
  return cache.get(nom)!;
};

/** Progrés 0→1 entre dos frames amb una corba de GSAP */
export const tween = (frame: number, inici: number, durada: number, corba = "power3.out") => {
  const p = interpolate(frame, [inici, inici + durada], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return ease(corba)(p);
};
