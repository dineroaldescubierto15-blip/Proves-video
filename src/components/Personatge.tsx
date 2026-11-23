import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { Accio, Expressio, PersonatgeConfig } from "../types";

/** Aclareix/enfosqueix un color hex */
const to = (hex: string, k: number) => {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k))));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `rgb(${r},${g},${b})`;
};

/**
 * Mascota original dibuixada en SVG i animada fotograma a fotograma.
 * viewBox 400×520. Tot depèn de useCurrentFrame(), així el render és determinista.
 */
export const Personatge: React.FC<{
  expressio?: Expressio;
  accio?: Accio;
  config?: PersonatgeConfig;
  /** Frame (relatiu) en què comença a parlar / deixa de parlar */
  parlaDes?: number;
  parlaFins?: number;
  entrada?: boolean;
  amplada: number;
}> = ({
  expressio = "content",
  accio = "parla",
  config = {},
  parlaDes = 8,
  parlaFins = 99999,
  entrada = true,
  amplada,
}) => {
  const f = useCurrentFrame();
  const color = config.color ?? "#ffc533";
  const fosc = to(color, -0.25);
  const clar = to(color, 0.45);
  const acc = config.accessori ?? "";

  // entrada amb rebot elàstic (squash & stretch)
  const e = entrada ? tween(f, 0, 30, "elastic.out(1, 0.5)") : 1;
  const salt = accio === "celebra" ? Math.abs(Math.sin(f * 0.25)) * 26 : 0;
  const respira = Math.sin(f * 0.12) * 5;
  const sx = 1 + (1 - e) * 0.25 + Math.sin(f * 0.12) * 0.01;
  const sy = e - Math.sin(f * 0.12) * 0.01;

  // parpelleig cada ~3 s
  const cicle = (f + 17) % 95;
  const ulls = cicle < 3 ? 0.1 : cicle < 6 ? 0.5 : 1;

  // mirada
  const miraX = accio === "assenyala" ? 8 : accio === "pensa" ? -6 : Math.sin(f * 0.05) * 4;
  const miraY = accio === "pensa" ? -10 : accio === "assenyala" ? -6 : 0;

  // boca
  const parlant = (accio === "parla" || accio === "assenyala" || accio === "saluda") && f >= parlaDes && f <= parlaFins;
  const obertura = parlant
    ? Math.max(0, Math.sin(f * 0.9) * 0.6 + Math.sin(f * 0.37 + 1) * 0.4) * 26 + 4
    : 0;

  // braços: angle (graus) de l'esquerre i del dret (0 = penjant)
  let bE = 15 + Math.sin(f * 0.12) * 4;
  let bD = -15 - Math.sin(f * 0.12) * 4;
  if (accio === "parla") {
    bE = 25 + Math.sin(f * 0.18) * 14;
    bD = -35 - Math.sin(f * 0.15 + 1) * 20;
  } else if (accio === "saluda") {
    bD = -150 + Math.sin(f * 0.45) * 22;
  } else if (accio === "assenyala") {
    bD = -125 + Math.sin(f * 0.1) * 3;
  } else if (accio === "celebra") {
    bE = 150 + Math.sin(f * 0.5) * 12;
    bD = -150 - Math.sin(f * 0.5) * 12;
  } else if (accio === "pensa") {
    bD = -140;
  }
  const brac = tween(f, 6, 18, "back.out(1.6)");
  bE *= brac;
  bD *= brac;

  // celles
  const cella = {
    content: { y: -6, a: 0 },
    sorpres: { y: -22, a: 0 },
    pensatiu: { y: -8, a: 10 },
    preocupat: { y: -10, a: -16 },
    enfadat: { y: 0, a: 20 },
  }[expressio];

  const Brac: React.FC<{ x: number; angle: number; costat: 1 | -1 }> = ({ x, angle, costat }) => (
    <g transform={`translate(${x} 300) rotate(${angle})`}>
      <path
        d={`M0 0 Q ${costat * 14} 60 ${costat * 4} 110`}
        stroke={fosc}
        strokeWidth={26}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={costat * 4} cy={114} r={22} fill={color} stroke={fosc} strokeWidth={6} />
      {accio === "assenyala" && costat === -1 && (
        <rect x={-10} y={120} width={14} height={34} rx={7} fill={color} stroke={fosc} strokeWidth={5} />
      )}
    </g>
  );

  const ull = (cx: number) => (
    <g transform={`translate(${cx} 230) scale(1 ${ulls})`}>
      <ellipse cx={0} cy={0} rx={34} ry={expressio === "sorpres" ? 42 : 38} fill="#fff" stroke={fosc} strokeWidth={5} />
      <circle cx={miraX} cy={miraY} r={expressio === "sorpres" ? 14 : 18} fill="#1d1d2b" />
      <circle cx={miraX + 7} cy={miraY - 7} r={6} fill="#fff" />
    </g>
  );

  let boca: React.ReactNode;
  if (parlant) {
    boca = <ellipse cx={200} cy={318} rx={30 - obertura * 0.25} ry={obertura / 2 + 3} fill="#5a1630" stroke={fosc} strokeWidth={5} />;
  } else if (expressio === "sorpres") {
    boca = <ellipse cx={200} cy={322} rx={18} ry={22} fill="#5a1630" stroke={fosc} strokeWidth={5} />;
  } else if (expressio === "preocupat" || expressio === "enfadat") {
    boca = <path d="M165 330 Q200 300 235 330" stroke="#1d1d2b" strokeWidth={8} strokeLinecap="round" fill="none" />;
  } else if (expressio === "pensatiu") {
    boca = <path d="M175 320 Q200 326 228 312" stroke="#1d1d2b" strokeWidth={8} strokeLinecap="round" fill="none" />;
  } else {
    boca = <path d="M160 305 Q200 350 240 305 Z" fill="#5a1630" stroke={fosc} strokeWidth={5} strokeLinejoin="round" />;
  }

  return (
    <svg
      viewBox="0 0 400 520"
      width={amplada}
      height={(amplada * 520) / 400}
      style={{ overflow: "visible" }}
    >
      {/* ombra */}
      <ellipse cx={200} cy={505} rx={120 - salt * 1.2} ry={14} fill="#000" opacity={0.25} />
      <g transform={`translate(0 ${-salt + respira}) translate(200 500) scale(${sx} ${sy}) translate(-200 -500)`}>
        {/* peus */}
        <ellipse cx={150} cy={482} rx={42} ry={20} fill={fosc} />
        <ellipse cx={250} cy={482} rx={42} ry={20} fill={fosc} />
        {/* braços darrere del cos */}
        <Brac x={78} angle={bE} costat={1} />
        <Brac x={322} angle={bD} costat={-1} />
        {/* cos */}
        <path
          d="M200 70 C 320 70 350 180 350 300 C 350 420 290 475 200 475 C 110 475 50 420 50 300 C 50 180 80 70 200 70 Z"
          fill={color}
          stroke={fosc}
          strokeWidth={8}
        />
        <ellipse cx={200} cy={390} rx={100} ry={70} fill={clar} opacity={0.6} />
        <ellipse cx={140} cy={130} rx={30} ry={16} fill="#fff" opacity={0.35} transform="rotate(-25 140 130)" />
        {/* galtes */}
        <circle cx={115} cy={290} r={20} fill="#ff6f91" opacity={0.45} />
        <circle cx={285} cy={290} r={20} fill="#ff6f91" opacity={0.45} />
        {ull(150)}
        {ull(250)}
        {/* celles */}
        <g stroke="#1d1d2b" strokeWidth={9} strokeLinecap="round">
          <line x1={125} y1={180 + cella.y} x2={175} y2={180 + cella.y} transform={`rotate(${cella.a} 150 ${180 + cella.y})`} />
          <line x1={225} y1={180 + cella.y} x2={275} y2={180 + cella.y} transform={`rotate(${-cella.a} 250 ${180 + cella.y})`} />
        </g>
        {acc.includes("ulleres") && (
          <g fill="none" stroke="#1d1d2b" strokeWidth={8}>
            <circle cx={150} cy={230} r={46} />
            <circle cx={250} cy={230} r={46} />
            <line x1={196} y1={226} x2={204} y2={226} />
          </g>
        )}
        {boca}
        {acc.includes("corbata") && (
          <g>
            <path d="M185 372 L215 372 L208 388 L192 388 Z" fill="#c8102e" />
            <path d="M192 388 L208 388 L220 450 L200 468 L180 450 Z" fill="#e0263f" />
          </g>
        )}
        {acc === "cap" && (
          <g>
            <path d="M110 110 Q200 10 290 110 Z" fill="#2b2d42" />
            <rect x={90} y={100} width={220} height={20} rx={10} fill="#2b2d42" />
          </g>
        )}
        {accio === "pensa" && (
          <g fill="#fff" opacity={tween(f, 10, 15)}>
            <circle cx={340} cy={90} r={10} />
            <circle cx={365} cy={55} r={15} />
            <circle cx={395} cy={10} r={22} />
          </g>
        )}
      </g>
    </svg>
  );
};
