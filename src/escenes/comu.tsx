import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { SANS } from "../estil";
import { Colors } from "../types";

export type PropsEscena<T> = { escena: T; colors: Colors; durada: number };

/** Contenidor comú: centra el contingut i fa l'entrada/sortida de l'escena */
export const Marc: React.FC<{
  durada: number;
  children: React.ReactNode;
  padding?: number;
  justify?: React.CSSProperties["justifyContent"];
  zoom?: boolean;
}> = ({ durada, children, padding = 90, justify = "center", zoom = true }) => {
  const f = useCurrentFrame();
  const entrada = tween(f, 0, 12, "power2.out");
  const sortida = tween(f, durada - 12, 12, "power2.in");
  return (
    <AbsoluteFill
      style={{
        opacity: entrada * (1 - sortida),
        transform: `scale(${zoom ? 1 + 0.035 * (f / durada) : 1}) translateY(${(1 - entrada) * 60 - sortida * 40}px)`,
        justifyContent: justify,
        alignItems: "center",
        padding,
        fontFamily: SANS,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Text secundari que puja suaument */
export const Subtext: React.FC<{ text: string; inici: number; color: string; mida?: number }> = ({
  text,
  inici,
  color,
  mida = 52,
}) => {
  const f = useCurrentFrame();
  const p = tween(f, inici, 20, "power3.out");
  return (
    <div
      style={{
        marginTop: 44,
        fontSize: mida,
        fontWeight: 500,
        color,
        opacity: 0.88 * p,
        transform: `translateY(${(1 - p) * 40}px)`,
        textAlign: "center",
        lineHeight: 1.3,
        maxWidth: 900,
      }}
    >
      {text}
    </div>
  );
};

/** Línia de font/crèdit (dona credibilitat als gràfics i dades) */
export const Font: React.FC<{ text: string; inici: number; color: string }> = ({ text, inici, color }) => {
  const f = useCurrentFrame();
  const p = tween(f, inici, 16);
  return (
    <div
      style={{
        marginTop: 36,
        fontSize: 34,
        fontWeight: 500,
        color,
        opacity: 0.6 * p,
        letterSpacing: 0.5,
      }}
    >
      {text}
    </div>
  );
};

/** Format de números a l'estil català: 1.234,5 */
export const numero = (v: number, decimals = 0) =>
  v.toLocaleString("ca-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
