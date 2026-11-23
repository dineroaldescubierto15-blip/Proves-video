/**
 * Esquema dels fitxers reels/*.json.
 * Als textos, posa una paraula entre **dobles asteriscs** per ressaltar-la amb un marcador.
 */

export type Expressio = "content" | "sorpres" | "pensatiu" | "preocupat" | "enfadat";
export type Accio = "parla" | "saluda" | "assenyala" | "celebra" | "pensa" | "quiet";

export type PersonatgeConfig = {
  /** Color del cos (per defecte groc) */
  color?: string;
  accessori?: "cap" | "ulleres" | "corbata" | "ulleres+corbata";
};

type Base = {
  /** Segons que dura l'escena (per defecte 3) */
  durada?: number;
};

export type EscenaTitol = Base & { tipus: "titol"; text: string; subtext?: string };
export type EscenaPunt = Base & {
  tipus: "punt";
  numero?: string;
  text: string;
  subtext?: string;
};
export type EscenaFinal = Base & { tipus: "final"; text: string; subtext?: string };

/** Personatge animat que diu una frase dins d'una bombolla */
export type EscenaPersonatge = Base & {
  tipus: "personatge";
  text: string;
  expressio?: Expressio;
  accio?: Accio;
  personatge?: PersonatgeConfig;
};

/** Targeta de notícia: titular + font + data + imatge opcional */
export type EscenaNoticia = Base & {
  tipus: "noticia";
  titular: string;
  /** Nom del mitjà o de la font (p. ex. "Diari X", "INE", "BCE") */
  font: string;
  data?: string;
  /** Fitxer dins de /public (p. ex. "imatges/foto.jpg") o URL https */
  imatge?: string;
  /** Etiqueta superior. Per defecte "NOTÍCIA" */
  etiqueta?: string;
};

export type Dada = { etiqueta: string; valor: number };

/** Gràfic animat */
export type EscenaGrafic = Base & {
  tipus: "grafic";
  grafic: "barres" | "linia" | "donut";
  titol: string;
  dades: Dada[];
  /** Text darrere del valor: "%", "€", "M€"... */
  unitat?: string;
  /** Índex (0, 1, 2...) de la dada a destacar amb el color d'accent. Per defecte l'última */
  destaca?: number;
  /** Font de les dades, es mostra a sota: "Font: INE, 2025" */
  font?: string;
};

/** Xifra gran que compta des de 0 */
export type EscenaXifra = Base & {
  tipus: "xifra";
  valor: number;
  prefix?: string;
  sufix?: string;
  decimals?: number;
  text: string;
  font?: string;
};

/** Imatge a pantalla completa amb moviment suau i peu de foto */
export type EscenaImatge = Base & {
  tipus: "imatge";
  imatge: string;
  text?: string;
  /** Crèdit de la foto */
  credit?: string;
};

export type Escena =
  | EscenaTitol
  | EscenaPunt
  | EscenaFinal
  | EscenaPersonatge
  | EscenaNoticia
  | EscenaGrafic
  | EscenaXifra
  | EscenaImatge;

export type Colors = { fons: string; fons2: string; accent: string; text: string };

export type ReelProps = {
  titol: string;
  colors?: Partial<Colors>;
  /** Nom d'un fitxer d'àudio dins de /public (opcional) */
  musica?: string;
  /** Personatge petit que presenta el reel des d'una cantonada (opcional) */
  presentador?: PersonatgeConfig & { mostrar?: boolean };
  /** Text fix a dalt (p. ex. el teu @usuari) */
  marca?: string;
  escenes: Escena[];
};

export const FPS = 30;
export const DURADA_PER_DEFECTE = 3;
export const TRANSICIO = 12; // frames de solapament entre escenes

export const segonsEscena = (e: Escena) => e.durada ?? DURADA_PER_DEFECTE;
