import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic, textPla } from "../components/TextRic";
import { useTema } from "../tema";
import { EscenaFinal, EscenaPunt, EscenaTitol } from "../types";
import { Etiqueta, Font, Marc, PropsEscena, Subtext } from "./comu";

type P = PropsEscena<EscenaTitol | EscenaPunt | EscenaFinal> & { avisLegal?: string };

export const Basica: React.FC<P> = ({ escena, colors, durada, avisLegal }) => {
  const f = useCurrentFrame();
  const tema = useTema();
  const llargada = textPla(escena.text).length;
  const numeroP = tween(f, 2, 26, tema.sobri ? "back.out(1.4)" : "elastic.out(1, 0.45)");

  // mida del títol: a l'estil csf, h1 = 104 px (h2 = 84 px si és llarg)
  const mida = tema.sobri
    ? llargada > 60 ? 76 : llargada > 34 ? 84 : 104
    : escena.tipus === "titol" ? (llargada > 18 ? 120 : 150) : llargada > 14 ? 110 : 130;
  const paraules = textPla(escena.text).split(" ").length;
  const iniciText = escena.etiqueta ? 4 : 2;
  const iniciSub = tema.sobri ? iniciText + paraules * 2 + 6 : 8 + llargada * 1.4;

  return (
    <Marc durada={durada}>
      {escena.etiqueta && <Etiqueta text={escena.etiqueta} color={colors.accent} />}
      {escena.tipus === "punt" && escena.numero && (
        <div
          style={{
            width: tema.sobri ? 160 : 260,
            height: tema.sobri ? 160 : 260,
            borderRadius: 999,
            background: colors.accent,
            color: colors.fons,
            fontSize: tema.sobri ? 100 : 170,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: tema.sobri ? 50 : 70,
            transform: `scale(${numeroP}) rotate(${tema.sobri ? 0 : (1 - numeroP) * -90}deg)`,
            boxShadow: tema.sobri ? undefined : `0 0 120px ${colors.accent}88`,
          }}
        >
          {escena.numero}
        </div>
      )}
      <TextRic
        text={escena.text}
        inici={escena.tipus === "punt" && !tema.sobri ? 10 : iniciText}
        mida={mida}
        pes={tema.sobri ? 800 : 900}
        color={escena.tipus === "final" && !tema.sobri ? colors.accent : colors.text}
        accent={colors.accent}
        alineacio={tema.alineacio}
      />
      {escena.subtext && <Subtext text={escena.subtext} inici={iniciSub} color={colors.text} />}
      {escena.nota && <Font text={escena.nota} inici={iniciSub + 8} color={colors.text} />}
      {escena.tipus === "final" && avisLegal && (
        <div
          style={{
            position: "absolute",
            left: tema.padding[3],
            right: tema.padding[1],
            bottom: tema.sobri ? 470 : 140,
            fontSize: 28,
            color: tema.grisFosc,
            textAlign: tema.alineacio,
            opacity: tween(f, iniciSub + 10, 15),
          }}
        >
          {avisLegal}
        </div>
      )}
    </Marc>
  );
};
