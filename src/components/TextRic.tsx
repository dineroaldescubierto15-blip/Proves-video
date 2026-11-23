import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { useTema } from "../tema";

/** Divideix "text amb **paraula** destacada" en trossos */
const trossos = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t) =>
    t.startsWith("**") ? { text: t.slice(2, -2), destacat: true } : { text: t, destacat: false },
  );

export const textPla = (text: string) => text.replace(/\*\*/g, "");

type Segment = { text: string; destacat: boolean };
/** Llista de paraules; cada paraula pot tenir trossos destacats i no destacats ("**manda**." → manda + .) */
export const paraules = (text: string): Segment[][] => {
  const out: Segment[][] = [];
  let enganxa = false;
  for (const tros of trossos(text)) {
    const parts = tros.text.split(/( +)/);
    for (const part of parts) {
      if (part === "") continue;
      if (/^ +$/.test(part)) {
        enganxa = false;
        continue;
      }
      if (enganxa && out.length) out[out.length - 1].push({ text: part, destacat: tros.destacat });
      else out.push([{ text: part, destacat: tros.destacat }]);
      enganxa = true;
    }
  }
  return out;
};

/**
 * Text que entra lletra a lletra (corba "back.out" de GSAP).
 * Les paraules entre **...** reben un subratllat de marcador animat.
 */
export const TextRic: React.FC<{
  text: string;
  inici?: number;
  mida: number;
  color: string;
  accent: string;
  pes?: number;
  familia?: string;
  alineacio?: "center" | "left";
  lletraALletra?: boolean;
}> = ({
  text,
  inici = 0,
  mida,
  color,
  accent,
  pes = 900,
  familia,
  alineacio = "center",
  lletraALletra = true,
}) => {
  const frame = useCurrentFrame();
  const tema = useTema();
  if (tema.sobri) {
    return (
      <TextSobri text={text} inici={inici} mida={mida} color={color} accent={accent} pes={pes} alineacio={alineacio} />
    );
  }
  let i = 0;
  const totalLletres = textPla(text).length;
  const fiLletres = inici + totalLletres * 1.4 + 10;

  return (
    <div
      style={{
        fontSize: mida,
        fontWeight: pes,
        fontFamily: familia,
        color,
        lineHeight: 1.12,
        letterSpacing: -mida * 0.015,
        textAlign: alineacio,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: alineacio === "center" ? "center" : "flex-start",
        columnGap: mida * 0.26,
        rowGap: mida * 0.08,
      }}
    >
      {trossos(text).flatMap((tros, ti) =>
        tros.text
          .split(" ")
          .filter(Boolean)
          .map((paraula, pi) => {
            const marcador = tween(frame, fiLletres + ti * 4, 16, "power2.inOut");
            return (
              <span
                key={`${ti}-${pi}`}
                style={{
                  display: "inline-flex",
                  whiteSpace: "nowrap",
                  position: "relative",
                  padding: tros.destacat ? `0 ${mida * 0.06}px` : undefined,
                }}
              >
                {tros.destacat && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: mida * 0.06,
                      height: mida * 0.42,
                      width: `${marcador * 100}%`,
                      background: accent,
                      borderRadius: mida * 0.08,
                      opacity: 0.9,
                      zIndex: 0,
                    }}
                  />
                )}
                {[...paraula].map((lletra, li) => {
                  const p = lletraALletra
                    ? tween(frame, inici + i++ * 1.4, 14, "back.out(2.2)")
                    : tween(frame, inici, 18, "power3.out");
                  return (
                    <span
                      key={li}
                      style={{
                        display: "inline-block",
                        position: "relative",
                        zIndex: 1,
                        opacity: Math.min(1, p * 1.5),
                        transform: `translateY(${(1 - p) * mida * 0.5}px) scale(${0.7 + 0.3 * p})`,
                      }}
                    >
                      {lletra}
                    </span>
                  );
                })}
              </span>
            );
          }),
      )}
    </div>
  );
};

/**
 * Versió sòbria (estil csf): paraula a paraula, puja i apareix (corba power3.out),
 * i les paraules **destacades** es pinten en daurat.
 */
const TextSobri: React.FC<{
  text: string;
  inici: number;
  mida: number;
  color: string;
  accent: string;
  pes: number;
  alineacio: "center" | "left";
}> = ({ text, inici, mida, color, accent, pes, alineacio }) => {
  const frame = useCurrentFrame();
  let n = 0;
  return (
    <div
      style={{
        fontSize: mida,
        fontWeight: pes,
        color,
        lineHeight: 1.06,
        letterSpacing: `${-0.035 * mida}px`,
        textAlign: alineacio,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: alineacio === "center" ? "center" : "flex-start",
        columnGap: mida * 0.24,
      }}
    >
      {paraules(text).map((segs, pi) => {
        const p = tween(frame, inici + n++ * 2, 15, "power3.out");
        return (
          <span
            key={pi}
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              opacity: p,
              transform: `translateY(${(1 - p) * 50}px)`,
            }}
          >
            {segs.map((sg, si) => (
              <span key={si} style={{ color: sg.destacat ? accent : color }}>
                {sg.text}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
};
