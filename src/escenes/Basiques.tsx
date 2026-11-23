import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic, textPla } from "../components/TextRic";
import { EscenaFinal, EscenaPunt, EscenaTitol } from "../types";
import { Marc, PropsEscena, Subtext } from "./comu";

type P = PropsEscena<EscenaTitol | EscenaPunt | EscenaFinal>;

export const Basica: React.FC<P> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const llargada = textPla(escena.text).length;
  const mida = escena.tipus === "titol" ? (llargada > 18 ? 120 : 150) : llargada > 14 ? 110 : 130;
  const numeroP = tween(f, 2, 26, "elastic.out(1, 0.45)");
  return (
    <Marc durada={durada}>
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
      <TextRic
        text={escena.text}
        inici={escena.tipus === "punt" ? 10 : 4}
        mida={mida}
        color={escena.tipus === "final" ? colors.accent : colors.text}
        accent={colors.accent}
      />
      {escena.subtext && <Subtext text={escena.subtext} inici={8 + llargada * 1.4} color={colors.text} />}
    </Marc>
  );
};
