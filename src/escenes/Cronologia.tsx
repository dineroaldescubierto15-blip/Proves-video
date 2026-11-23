import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { useTema } from "../tema";
import { EscenaCronologia } from "../types";
import { Etiqueta, Font, Marc, PropsEscena } from "./comu";

/** Línia de temps vertical: cada fet apareix un darrere l'altre al llarg de l'escena */
export const Cronologia: React.FC<PropsEscena<EscenaCronologia>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const tema = useTema();
  const n = escena.fets.length;
  const inici = escena.titol ? 12 : 4;
  // reparteix les aparicions en el 65 % inicial de l'escena (acompanya la veu)
  const pas = Math.max(8, (durada * 0.65 - inici) / Math.max(1, n));
  const linia = tween(f, inici, pas * n, "none");
  return (
    <Marc durada={durada}>
      {escena.etiqueta && <Etiqueta text={escena.etiqueta} color={colors.accent} />}
      {escena.titol && (
        <div style={{ marginBottom: 56 }}>
          <TextRic text={escena.titol} inici={2} mida={tema.sobri ? 76 : 84} pes={800} color={colors.text} accent={colors.accent} alineacio={tema.alineacio} />
        </div>
      )}
      <div style={{ position: "relative", paddingLeft: 64, width: tema.sobri ? 840 : 900 }}>
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 18,
            width: 6,
            height: `calc(${linia * 100}% - 36px)`,
            background: tema.grisFosc,
            borderRadius: 3,
          }}
        />
        {escena.fets.map((fet, i) => {
          const p = tween(f, inici + i * pas, 14, "power3.out");
          const color = fet.destacat ? colors.accent : colors.text;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                marginBottom: i === n - 1 ? 0 : 46,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -64,
                  top: 10,
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  background: fet.destacat ? colors.accent : colors.fons,
                  border: `6px solid ${fet.destacat ? colors.accent : colors.text}`,
                  transform: `scale(${tween(f, inici + i * pas, 14, "back.out(2)")})`,
                }}
              />
              <div style={{ fontSize: 36, fontWeight: 700, color: colors.accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {fet.data}
              </div>
              <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.22, color, marginTop: 6 }}>{fet.text}</div>
            </div>
          );
        })}
      </div>
      {escena.nota && <Font text={escena.nota} inici={inici + pas * n} color={colors.text} />}
    </Marc>
  );
};
