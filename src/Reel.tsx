import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { tween } from "./anim";
import { Personatge } from "./components/Personatge";
import { Basica } from "./escenes/Basiques";
import { Cronologia } from "./escenes/Cronologia";
import { Grafic } from "./escenes/Grafic";
import { Imatge } from "./escenes/Imatge";
import { Noticia } from "./escenes/Noticia";
import { PersonatgeEscena } from "./escenes/PersonatgeEscena";
import { Xifra } from "./escenes/Xifra";
import { COLORS_PER_DEFECTE, SANS } from "./estil";
import { ProveidorTema, useTema } from "./tema";
import { Accio, Colors, Escena, Expressio, FPS, ReelProps, TRANSICIO, VEU_RETARD, segonsEscena } from "./types";

const EscenaView: React.FC<{ escena: Escena; colors: Colors; durada: number; avisLegal?: string }> = ({
  escena,
  colors,
  durada,
  avisLegal,
}) => {
  const p = { colors, durada };
  switch (escena.tipus) {
    case "cronologia":
      return <Cronologia escena={escena} {...p} />;
    case "personatge":
      return <PersonatgeEscena escena={escena} {...p} />;
    case "noticia":
      return <Noticia escena={escena} {...p} />;
    case "grafic":
      return <Grafic escena={escena} {...p} />;
    case "xifra":
      return <Xifra escena={escena} {...p} />;
    case "imatge":
      return <Imatge escena={escena} {...p} />;
    default:
      return <Basica escena={escena} {...p} avisLegal={avisLegal} />;
  }
};

const Fons: React.FC<{ colors: Colors }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const tema = useTema();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const x = 30 + 40 * Math.sin(t * Math.PI * 2);
  const y = 30 + 30 * Math.cos(t * Math.PI * 2);
  if (tema.sobri) return <AbsoluteFill style={{ background: colors.fons }} />;
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${colors.fons2} 0%, ${colors.fons} 60%)` }}
    >
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at ${100 - x}% ${100 - y}%, ${colors.accent}22 0%, transparent 45%)` }}
      />
      {/* gra subtil perquè el fons no sembli pla */}
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage: `radial-gradient(${colors.text} 1px, transparent 1px)`,
          backgroundSize: "6px 6px",
        }}
      />
    </AbsoluteFill>
  );
};

const BarraProgres: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const tema = useTema();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: tema.sobri ? 10 : 14,
        width: `${(frame / durationInFrames) * 100}%`,
        background: color,
      }}
    />
  );
};

const Marca: React.FC<{ text: string; color: string; accent: string }> = ({ text, color, accent }) => {
  const tema = useTema();
  if (tema.sobri)
    return (
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 90,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 40,
          color: accent,
          letterSpacing: "0.02em",
        }}
      >
        {text}
      </div>
    );
  return (
  <div
    style={{
      position: "absolute",
      top: 70,
      width: "100%",
      textAlign: "center",
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: 34,
      color,
      opacity: 0.7,
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
  );
};

const CSF_COLORS: Colors = { fons: "#0A0A0A", fons2: "#0A0A0A", accent: "#F4C542", text: "#F5F5F2" };

/** Escenes on el presentador de la cantonada no surt (ja hi ha prou contingut) */
const SENSE_PRESENTADOR = new Set<Escena["tipus"]>(["personatge", "imatge", "noticia"]);
const ACCIO_PRESENTADOR: Partial<Record<Escena["tipus"], [Accio, Expressio]>> = {
  titol: ["saluda", "content"],
  punt: ["parla", "content"],
  grafic: ["assenyala", "pensatiu"],
  xifra: ["parla", "sorpres"],
  final: ["celebra", "content"],
};

type Tram = { escena: Escena; from: number; durada: number };

const Presentador: React.FC<{ trams: Tram[]; config: ReelProps["presentador"] }> = ({ trams, config }) => {
  const f = useCurrentFrame();
  const actual = [...trams].reverse().find((t) => f >= t.from) ?? trams[0];
  const amagat = SENSE_PRESENTADOR.has(actual.escena.tipus);
  // entra/surt en canviar entre escenes amb i sense presentador
  const relatiu = f - actual.from;
  const anterior = trams[trams.indexOf(actual) - 1];
  const anteriorAmagat = anterior ? SENSE_PRESENTADOR.has(anterior.escena.tipus) : true;
  let visible = amagat ? 0 : 1;
  if (!amagat && anteriorAmagat) visible = tween(relatiu, 0, 20, "back.out(1.5)");
  if (amagat && anterior && !anteriorAmagat) visible = 1 - tween(relatiu, 0, 12, "power2.in");
  if (visible <= 0.001) return null;
  const [accio, expressio] = ACCIO_PRESENTADOR[actual.escena.tipus] ?? ["parla", "content"];
  return (
    <div
      style={{
        position: "absolute",
        right: 110,
        bottom: 40,
        transform: `translateY(${(1 - visible) * 400}px)`,
      }}
    >
      <Sequence from={actual.from} layout="none">
        <Personatge amplada={260} accio={accio} expressio={expressio} config={config} entrada={false} />
      </Sequence>
    </div>
  );
};

export const Reel: React.FC<ReelProps> = (props) => (
  <ProveidorTema estil={props.estil}>
    <ReelInterior {...props} />
  </ProveidorTema>
);

const ReelInterior: React.FC<ReelProps> = ({ colors, escenes, musica, presentador, marca, avisLegal }) => {
  const tema = useTema();
  // A l'estil csf els colors de marca són fixos (no es barregen amb els de l'exemple per defecte)
  const c: Colors = tema.sobri ? CSF_COLORS : { ...COLORS_PER_DEFECTE, ...colors };
  let cursor = 0;
  const trams: Tram[] = escenes.map((escena) => {
    const durada = Math.round(segonsEscena(escena) * FPS);
    const t = { escena, from: cursor, durada };
    cursor += durada - TRANSICIO;
    return t;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: c.fons }}>
      <Fons colors={c} />
      {trams.map((t, i) => (
        <Sequence key={i} from={t.from} durationInFrames={t.durada}>
          <EscenaView escena={t.escena} colors={c} durada={t.durada} avisLegal={i === trams.length - 1 ? avisLegal : undefined} />
        </Sequence>
      ))}
      {trams.map((t, i) =>
        t.escena.audio ? (
          <Sequence key={`veu-${i}`} from={t.from + Math.round(VEU_RETARD * FPS)} layout="none">
            <Audio src={staticFile(t.escena.audio)} />
          </Sequence>
        ) : null,
      )}
      {presentador && presentador.mostrar !== false && <Presentador trams={trams} config={presentador} />}
      {marca && <Marca text={marca} color={c.text} accent={c.accent} />}
      <BarraProgres color={c.accent} />
      {musica ? <Audio src={staticFile(musica)} volume={trams.some((t) => t.escena.audio) ? 0.22 : 0.8} /> : null}
    </AbsoluteFill>
  );
};
