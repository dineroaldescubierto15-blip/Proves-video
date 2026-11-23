import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { useTema } from "../tema";
import { EscenaXifra } from "../types";
import { Etiqueta, Font, Marc, numero, PropsEscena } from "./comu";

/** Xifra gran que compta des de zero */
export const Xifra: React.FC<PropsEscena<EscenaXifra>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const t = useTema();
  const p = tween(f, 4, 40, "expo.out");
  const pop = tween(f, 0, 24, "back.out(2)");
  const txt = `${escena.prefix ?? ""}${numero(escena.valor * p, escena.decimals ?? 0)}${escena.sufix ?? ""}`;
  return (
    <Marc durada={durada}>
      {escena.etiqueta && <Etiqueta text={escena.etiqueta} color={colors.accent} />}
      <div
        style={{
          fontSize: t.sobri ? (txt.length > 7 ? 150 : 176) : txt.length > 7 ? 200 : 280,
          fontWeight: t.sobri ? 800 : 900,
          color: colors.accent,
          letterSpacing: t.sobri ? "-0.05em" : -8,
          lineHeight: 1,
          whiteSpace: "nowrap",
          transform: `scale(${t.sobri ? 0.9 + 0.1 * pop : pop})`,
          transformOrigin: t.sobri ? "left center" : "center",
          opacity: t.sobri ? pop : 1,
          textShadow: t.sobri ? undefined : `0 0 80px ${colors.accent}66`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {txt}
      </div>
      <div style={{ marginTop: 30 }}>
        <TextRic text={escena.text} inici={16} mida={t.sobri ? 56 : 72} pes={t.sobri ? 600 : 700} color={colors.text} accent={colors.accent} alineacio={t.alineacio} />
      </div>
      {escena.nota && <Font text={escena.nota} inici={36} color={colors.text} />}
      {escena.font && <Font text={escena.font} inici={40} color={colors.text} />}
    </Marc>
  );
};
