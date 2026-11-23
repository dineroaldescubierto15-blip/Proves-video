import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { tween } from "./anim";
import { Escena, FPS, ReelProps, TRANSICIO, segonsEscena } from "./types";

const FONT =
  "'Inter', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

type Colors = Required<NonNullable<ReelProps["colors"]>>;
const COLORS_PER_DEFECTE: Colors = {
  fons: "#0b0b14",
  fons2: "#24123a",
  accent: "#ff3d71",
  text: "#ffffff",
};

/** Text que entra lletra a lletra amb un rebot (corba "back.out" de GSAP) */
const TextLletraALletra: React.FC<{
  text: string;
  inici?: number;
  mida: number;
  color: string;
  pes?: number;
}> = ({ text, inici = 0, mida, color, pes = 900 }) => {
  const frame = useCurrentFrame();
  const paraules = text.split(" ");
  let i = 0;
  return (
    <div
      style={{
        fontSize: mida,
        fontWeight: pes,
        color,
        lineHeight: 1.05,
        letterSpacing: -mida * 0.02,
        textAlign: "center",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: mida * 0.28,
      }}
    >
      {paraules.map((paraula, pi) => (
        <span key={pi} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
          {[...paraula].map((lletra, li) => {
            const p = tween(frame, inici + i++ * 1.6, 14, "back.out(2.2)");
            return (
              <span
                key={li}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * mida * 0.6}px) scale(${0.6 + 0.4 * p})`,
                }}
              >
                {lletra}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

const Subtext: React.FC<{ text: string; inici: number; color: string }> = ({
  text,
  inici,
  color,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, inici, 20, "power3.out");
  return (
    <div
      style={{
        marginTop: 48,
        fontSize: 52,
        fontWeight: 500,
        color,
        opacity: 0.85 * p,
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

const EscenaView: React.FC<{ escena: Escena; colors: Colors; durada: number }> = ({
  escena,
  colors,
  durada,
}) => {
  const frame = useCurrentFrame();
  // entrada i sortida de l'escena
  const entrada = tween(frame, 0, TRANSICIO, "power2.out");
  const sortida = tween(frame, durada - TRANSICIO, TRANSICIO, "power2.in");
  const opacitat = entrada * (1 - sortida);
  const zoom = 1 + 0.04 * (frame / durada); // lleuger "Ken Burns"

  const numeroP = tween(frame, 2, 26, "elastic.out(1, 0.45)");
  const llargadaText = [...escena.text].length;
  const midaText =
    escena.tipus === "titol" ? (llargadaText > 18 ? 120 : 150) : llargadaText > 14 ? 110 : 130;
  const iniciSubtext = 8 + llargadaText * 1.6;

  return (
    <AbsoluteFill
      style={{
        opacity: opacitat,
        transform: `scale(${zoom}) translateY(${(1 - entrada) * 60}px)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 90,
        fontFamily: FONT,
      }}
    >
      {escena.tipus === "punt" && escena.numero && (
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 999,
            background: colors.accent,
            color: colors.fons,
            fontSize: 170,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 70,
            transform: `scale(${numeroP}) rotate(${(1 - numeroP) * -90}deg)`,
            boxShadow: `0 0 120px ${colors.accent}88`,
          }}
        >
          {escena.numero}
        </div>
      )}
      <TextLletraALletra
        text={escena.text}
        inici={escena.tipus === "punt" ? 10 : 4}
        mida={midaText}
        color={escena.tipus === "final" ? colors.accent : colors.text}
      />
      {escena.subtext && (
        <Subtext text={escena.subtext} inici={iniciSubtext} color={colors.text} />
      )}
    </AbsoluteFill>
  );
};

const Fons: React.FC<{ colors: Colors }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const x = 30 + 40 * Math.sin(t * Math.PI * 2);
  const y = 30 + 30 * Math.cos(t * Math.PI * 2);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${colors.fons2} 0%, ${colors.fons} 60%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${colors.accent}22 0%, transparent 45%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const BarraProgres: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 14,
        width: `${(frame / durationInFrames) * 100}%`,
        background: color,
      }}
    />
  );
};

export const Reel: React.FC<ReelProps> = ({ colors, escenes, musica }) => {
  const c: Colors = { ...COLORS_PER_DEFECTE, ...colors };
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: c.fons }}>
      <Fons colors={c} />
      {escenes.map((escena, i) => {
        const durada = Math.round(segonsEscena(escena) * FPS);
        const from = cursor;
        cursor += durada - TRANSICIO;
        return (
          <Sequence key={i} from={from} durationInFrames={durada}>
            <EscenaView escena={escena} colors={c} durada={durada} />
          </Sequence>
        );
      })}
      <BarraProgres color={c.accent} />
      {musica ? <Audio src={staticFile(musica)} volume={0.8} /> : null}
    </AbsoluteFill>
  );
};
