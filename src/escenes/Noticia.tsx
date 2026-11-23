import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { tween } from "../anim";
import { TextRic } from "../components/TextRic";
import { font, SANS, SERIF } from "../estil";
import { EscenaNoticia } from "../types";
import { Marc, PropsEscena } from "./comu";

/** Targeta de notícia genèrica (no imita cap mitjà concret) */
export const Noticia: React.FC<PropsEscena<EscenaNoticia>> = ({ escena, colors, durada }) => {
  const f = useCurrentFrame();
  const targeta = tween(f, 0, 26, "power4.out");
  const imatgeZoom = 1.12 - 0.12 * tween(f, 0, durada, "none");
  const etiqueta = tween(f, 14, 14, "back.out(2)");

  return (
    <Marc durada={durada} padding={70} zoom={false}>
      <div
        style={{
          width: 940,
          background: "#fbfaf7",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - targeta) * 500}px) rotate(${(1 - targeta) * -6}deg)`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "30px 44px",
            borderBottom: "2px solid #e6e3dc",
            fontFamily: SANS,
          }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 44, color: "#14141f" }}>{escena.font}</div>
          {escena.data && <div style={{ fontSize: 32, color: "#6b6b76", fontWeight: 500 }}>{escena.data}</div>}
        </div>
        {escena.imatge && (
          <div style={{ width: "100%", height: 530, overflow: "hidden", background: "#ddd" }}>
            <Img
              src={font(escena.imatge)}
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${imatgeZoom})` }}
            />
          </div>
        )}
        <div style={{ padding: "40px 44px 54px" }}>
          <div
            style={{
              display: "inline-block",
              background: colors.accent,
              color: "#fff",
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: 3,
              padding: "10px 20px",
              borderRadius: 8,
              marginBottom: 28,
              transform: `scale(${etiqueta})`,
              transformOrigin: "0 50%",
            }}
          >
            {escena.etiqueta ?? "NOTÍCIA"}
          </div>
          <TextRic
            text={escena.titular}
            inici={18}
            mida={escena.titular.length > 70 ? 58 : 68}
            pes={900}
            familia={SERIF}
            color="#14141f"
            accent={`${colors.accent}66`}
            alineacio="left"
            lletraALletra={false}
          />
        </div>
      </div>
    </Marc>
  );
};
