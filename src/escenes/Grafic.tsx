import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { Tema, useTema } from "../tema";
import { Colors, EscenaGrafic } from "../types";
import { Etiqueta, Font, Marc, numero, PropsEscena } from "./comu";

let AMPLE = 900;
const ALT = 900;

type G = { e: EscenaGrafic; c: Colors; f: number; destaca: number; t: Tema };

const decimalsDe = (dades: { valor: number }[]) =>
  dades.some((d) => !Number.isInteger(d.valor)) ? 1 : 0;

const Barres: React.FC<G> = ({ e, c, f, destaca, t }) => {
  const max = Math.max(...e.dades.map((d) => d.valor), 0) || 1;
  const n = e.dades.length;
  const gap = 28;
  const amplada = (AMPLE - gap * (n - 1)) / n;
  const dec = decimalsDe(e.dades);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap, height: t.sobri ? ALT - 300 : ALT - 120, width: AMPLE }}>
      {e.dades.map((d, i) => {
        const p = tween(f, 14 + i * 5, 30, "elastic.out(1, 0.75)");
        const pv = tween(f, 14 + i * 5, 30, "power3.out");
        const h = (d.valor / max) * (t.sobri ? ALT - 460 : ALT - 260) * p;
        const dest = i === destaca;
        return (
          <div key={i} style={{ width: amplada, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontSize: amplada > 150 ? 54 : 40,
                fontWeight: 900,
                color: dest ? c.accent : c.text,
                marginBottom: 14,
                opacity: pv,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {numero(d.valor * pv, dec)}
              {e.unitat}
            </div>
            <div
              style={{
                width: "100%",
                height: Math.max(0, h),
                borderRadius: "18px 18px 6px 6px",
                background: dest ? c.accent : t.sobri ? t.grisFosc : `${c.text}40`,
                boxShadow: dest && !t.sobri ? `0 0 60px ${c.accent}88` : undefined,
              }}
            />
            <div
              style={{
                marginTop: 20,
                fontSize: amplada > 150 ? 40 : 30,
                fontWeight: 700,
                color: c.text,
                opacity: 0.8 * tween(f, 10 + i * 5, 14),
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {d.etiqueta}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Linia: React.FC<G> = ({ e, c, f, destaca, t }) => {
  const valors = e.dades.map((d) => d.valor);
  const max = Math.max(...valors);
  const min = Math.min(0, ...valors);
  const W = AMPLE, H = t.sobri ? ALT - 380 : ALT - 240, padX = 50, padY = 90;
  const traç = t.sobri ? c.text : c.accent;
  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, e.dades.length - 1);
  const y = (v: number) => padY + (1 - (v - min) / (max - min || 1)) * (H - padY * 2);
  const punts = e.dades.map((d, i) => [x(i), y(d.valor)] as const);
  const cami = punts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join(" ");
  const area = `${cami} L${x(e.dades.length - 1)} ${H - padY} L${x(0)} ${H - padY} Z`;
  const llarg = punts.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - punts[i - 1][0], p[1] - punts[i - 1][1]) : 0), 0);
  const dibuix = tween(f, 12, 45, "power2.inOut");
  const dec = decimalsDe(e.dades);
  return (
    <svg width={W} height={H + 70} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={traç} stopOpacity={t.sobri ? 0.16 : 0.45} />
          <stop offset="100%" stopColor={traç} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={padX} x2={W - padX} y1={padY + t * (H - padY * 2)} y2={padY + t * (H - padY * 2)} stroke={c.text} strokeOpacity={0.12} strokeWidth={2} />
      ))}
      <path d={area} fill="url(#area)" opacity={tween(f, 40, 20)} />
      <path
        d={cami}
        fill="none"
        stroke={traç}
        strokeWidth={t.sobri ? 9 : 12}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={llarg}
        strokeDashoffset={llarg * (1 - dibuix)}
      />
      {punts.map(([px, py], i) => {
        const aparicio = tween(f, 12 + (45 * i) / Math.max(1, punts.length - 1), 12, "back.out(3)");
        const dest = i === destaca;
        return (
          <g key={i} opacity={aparicio}>
            <circle cx={px} cy={py} r={(dest ? 22 : 13) * aparicio} fill={dest ? c.accent : c.fons} stroke={dest ? c.accent : traç} strokeWidth={7} />
            {(dest || e.dades.length <= 6 || (t.sobri && (i === 0 || i === punts.length - 1))) && (
              <text x={px} y={py - 38} textAnchor="middle" fill={dest ? c.accent : c.text} fontSize={dest ? 54 : 38} fontWeight={900}>
                {numero(e.dades[i].valor, dec)}
                {e.unitat}
              </text>
            )}
            {(e.dades.length <= 7 || i % Math.ceil(e.dades.length / 6) === 0 || i === punts.length - 1) && (
              <text x={px} y={H - padY + 60} textAnchor="middle" fill={c.text} opacity={0.75} fontSize={t.sobri ? 30 : 34} fontWeight={600}>
                {e.dades[i].etiqueta}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const PALETA = (c: Colors, t: Tema) =>
  t.sobri
    ? [c.accent, c.text, t.grisFosc, "#3A3A3A", "#9A9A96", "#1F1F1F"]
    : [c.accent, "#4cc9f0", "#ffc533", "#7bd389", "#b388ff", "#ff8a5b"];

const Donut: React.FC<G> = ({ e, c, f, destaca, t }) => {
  const total = e.dades.reduce((a, d) => a + d.valor, 0) || 1;
  const R = t.sobri ? 230 : 280, G = t.sobri ? 76 : 90, C = 2 * Math.PI * R;
  const p = tween(f, 10, 45, "power3.inOut");
  const colors = PALETA(c, t);
  let acumulat = 0;
  const pc = (e.dades[destaca]?.valor ?? 0) / total;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: R * 2 + G, height: R * 2 + G }}>
        <svg width={R * 2 + G} height={R * 2 + G} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={R + G / 2} cy={R + G / 2} r={R} fill="none" stroke={c.text} strokeOpacity={0.08} strokeWidth={G} />
          {e.dades.map((d, i) => {
            const fr = d.valor / total;
            const inici = acumulat;
            acumulat += fr;
            const visible = Math.max(0, Math.min(fr, p - inici));
            return (
              <circle
                key={i}
                cx={R + G / 2}
                cy={R + G / 2}
                r={R}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={i === destaca ? G + 16 : G}
                strokeDasharray={`${visible * C} ${C}`}
                strokeDashoffset={-inici * C}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 150, fontWeight: 900, color: colors[destaca % colors.length], fontVariantNumeric: "tabular-nums" }}>
            {numero(pc * 100 * tween(f, 10, 45, "power3.out"))}%
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: c.text, opacity: 0.85 }}>{e.dades[destaca]?.etiqueta}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "18px 40px", marginTop: 50, maxWidth: AMPLE }}>
        {e.dades.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 38, fontWeight: 600, color: c.text, opacity: tween(f, 30 + i * 4, 12) }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: colors[i % colors.length] }} />
            {d.etiqueta} · {numero(d.valor, decimalsDe(e.dades))}
            {e.unitat}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Grafic: React.FC<PropsEscena<EscenaGrafic>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const t = useTema();
  AMPLE = t.sobri ? 840 : 900;
  const destaca = Math.min(escena.destaca ?? escena.dades.length - 1, escena.dades.length - 1);
  const props: G = { e: escena, c: colors, f, destaca, t };
  return (
    <Marc durada={durada} zoom={false}>
      {escena.etiqueta && <Etiqueta text={escena.etiqueta} color={colors.accent} />}
      <div style={{ marginBottom: t.sobri ? 50 : 70 }}>
        <TextRic
          text={escena.titol}
          inici={2}
          mida={t.sobri ? (escena.titol.length > 34 ? 64 : 76) : escena.titol.length > 26 ? 70 : 84}
          pes={t.sobri ? 800 : 900}
          color={colors.text}
          accent={colors.accent}
          alineacio={t.alineacio}
        />
      </div>
      {escena.grafic === "barres" && <Barres {...props} />}
      {escena.grafic === "linia" && <Linia {...props} />}
      {escena.grafic === "donut" && <Donut {...props} />}
      {escena.font && <Font text={escena.font} inici={40} color={colors.text} />}
      {escena.nota && <Font text={escena.nota} inici={46} color={colors.text} />}
    </Marc>
  );
};
