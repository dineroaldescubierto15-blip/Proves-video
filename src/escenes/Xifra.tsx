import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { EscenaXifra } from "../types";
import { Font, Marc, numero, PropsEscena } from "./comu";

/** Xifra gran que compta des de zero */
export const Xifra: React.FC<PropsEscena<EscenaXifra>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const p = tween(f, 4, 40, "expo.out");
  const pop = tween(f, 0, 24, "back.out(2)");
  const txt = `${escena.prefix ?? ""}${numero(escena.valor * p, escena.decimals ?? 0)}${escena.sufix ?? ""}`;
  return (
    <Marc durada={durada}>
      <div
        style={{
          fontSize: txt.length > 7 ? 200 : 280,
          fontWeight: 900,
          color: colors.accent,
          letterSpacing: -8,
          transform: `scale(${pop})`,
          textShadow: `0 0 80px ${colors.accent}66`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {txt}
      </div>
      <div style={{ marginTop: 30 }}>
        <TextRic text={escena.text} inici={16} mida={72} pes={700} color={colors.text} accent={colors.accent} />
      </div>
      {escena.font && <Font text={escena.font} inici={40} color={colors.text} />}
    </Marc>
  );
};
