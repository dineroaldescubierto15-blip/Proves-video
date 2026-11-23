export type Escena = {
  /** "titol" = portada, "punt" = element numerat, "final" = crida a l'acció */
  tipus: "titol" | "punt" | "final";
  text: string;
  subtext?: string;
  /** Número gran que surt a l'esquerra (només per a "punt") */
  numero?: string;
  /** Segons que dura l'escena (per defecte 3) */
  durada?: number;
};

export type ReelProps = {
  titol: string;
  colors?: { fons?: string; fons2?: string; accent?: string; text?: string };
  /** Nom d'un fitxer d'àudio dins de /public (opcional) */
  musica?: string;
  escenes: Escena[];
};

export const FPS = 30;
export const DURADA_PER_DEFECTE = 3;
export const TRANSICIO = 12; // frames de solapament entre escenes

export const segonsEscena = (e: Escena) => e.durada ?? DURADA_PER_DEFECTE;
