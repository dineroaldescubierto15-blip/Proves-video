import React from "react";
import { useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { Personatge } from "../components/Personatge";
import { textPla } from "../components/TextRic";
import { SANS } from "../estil";
import { EscenaPersonatge } from "../types";
import { Marc, PropsEscena } from "./comu";

/** Personatge que diu una frase dins d'una bombolla (text tipus màquina d'escriure) */
export const PersonatgeEscena: React.FC<PropsEscena<EscenaPersonatge>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const bombolla = tween(f, 10, 18, "back.out(1.8)");
  const pla = textPla(escena.text);
  const vel = 1.6; // lletres per frame
  const fiText = 22 + pla.length / vel;
  const visibles = Math.floor(Math.max(0, f - 22) * vel);
  const mida = pla.length > 70 ? 54 : pla.length > 40 ? 62 : 72;

  // mostra el text sencer per mantenir l'alçada, però amaga les lletres no escrites
  let comptador = 0;
  const parts = escena.text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) => {
    const destacat = t.startsWith("**");
    const net = destacat ? t.slice(2, -2) : t;
    return (
      <span key={i} style={destacat ? { color: colors.accent, fontWeight: 900 } : undefined}>
        {[...net].map((ll, j) => {
          const vis = comptador++ < visibles;
          return (
            <span key={j} style={{ opacity: vis ? 1 : 0 }}>
              {ll}
            </span>
          );
        })}
      </span>
    );
  });

  return (
    <Marc durada={durada} justify="flex-end" padding={60} zoom={false}>
      <div
        style={{
          position: "relative",
          background: "#ffffff",
          color: "#14141f",
          borderRadius: 48,
          padding: "50px 60px",
          maxWidth: 900,
          fontFamily: SANS,
          fontSize: mida,
          fontWeight: 700,
          lineHeight: 1.25,
          textAlign: "center",
          transform: `scale(${bombolla})`,
          transformOrigin: "50% 100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          marginBottom: 40,
        }}
      >
        {parts}
        <div
          style={{
            position: "absolute",
            bottom: -38,
            left: "50%",
            marginLeft: -30,
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderTop: "44px solid #ffffff",
          }}
        />
      </div>
      <Personatge
        amplada={620}
        expressio={escena.expressio}
        accio={escena.accio ?? "parla"}
        config={escena.personatge}
        parlaDes={22}
        parlaFins={fiText}
      />
    </Marc>
  );
};
