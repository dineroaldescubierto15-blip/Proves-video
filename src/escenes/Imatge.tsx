import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { font, SANS } from "../estil";
import { EscenaImatge } from "../types";
import { PropsEscena } from "./comu";

/** Imatge a pantalla completa amb efecte Ken Burns i peu de foto */
export const Imatge: React.FC<PropsEscena<EscenaImatge>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const entrada = tween(f, 0, 12, "power2.out");
  const sortida = tween(f, durada - 12, 12, "power2.in");
  const p = tween(f, 0, durada, "none");
  return (
    <AbsoluteFill style={{ opacity: entrada * (1 - sortida), fontFamily: SANS }}>
      <Img
        src={font(escena.imatge)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.05 + 0.12 * p}) translate(${-20 * p}px, ${-12 * p}px)`,
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)" }}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 80px 260px" }}>
        {escena.text && (
          <TextRic text={escena.text} inici={8} mida={88} color="#fff" accent={colors.accent} alineacio="left" />
        )}
        {escena.credit && (
          <div style={{ marginTop: 30, color: "#fff", opacity: 0.65 * tween(f, 20, 15), fontSize: 30 }}>
            📷 {escena.credit}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
