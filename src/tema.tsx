import React, { createContext, useContext } from "react";

/**
 * Estil visual del reel.
 * - "vibrant": l'estil per defecte de la plantilla (degradats, rebots, text centrat).
 * - "csf": manual de marca de Capital Sin Filtros (fons #0A0A0A, Inter, daurat només per a la xifra/paraula clau,
 *   text alineat a l'esquerra, zona segura d'Instagram, animacions sòbries, sense emojis ni personatges).
 */
export type NomEstil = "vibrant" | "csf";

export type Tema = {
  nom: NomEstil;
  sobri: boolean;
  alineacio: "center" | "left";
  /** padding: dalt, dreta, baix, esquerra (zona segura) */
  padding: [number, number, number, number];
  gris: string;
  grisFosc: string;
  contrast: string;
};

export const TEMES: Record<NomEstil, Tema> = {
  vibrant: {
    nom: "vibrant",
    sobri: false,
    alineacio: "center",
    padding: [90, 90, 90, 90],
    gris: "#CFCFCA",
    grisFosc: "#6F6F6F",
    contrast: "#fbfaf7",
  },
  csf: {
    nom: "csf",
    sobri: true,
    alineacio: "left",
    // Contingut entre y=260..1480 i x=90..930
    padding: [300, 150, 440, 90],
    gris: "#CFCFCA",
    grisFosc: "#6F6F6F",
    contrast: "#E7E7E3",
  },
};

const Ctx = createContext<Tema>(TEMES.vibrant);
export const ProveidorTema: React.FC<{ estil?: NomEstil; children: React.ReactNode }> = ({ estil, children }) => (
  <Ctx.Provider value={TEMES[estil ?? "vibrant"]}>{children}</Ctx.Provider>
);
export const useTema = () => useContext(Ctx);
