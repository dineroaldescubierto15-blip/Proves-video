import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { staticFile } from "remotion";
import { Colors } from "./types";

export const { fontFamily: SANS } = loadInter("normal", {
  weights: ["400", "500", "700", "900"],
  subsets: ["latin", "latin-ext"],
});
export const { fontFamily: SERIF } = loadSerif("normal", {
  weights: ["700", "900"],
  subsets: ["latin", "latin-ext"],
});

export const COLORS_PER_DEFECTE: Colors = {
  fons: "#0b0b14",
  fons2: "#24123a",
  accent: "#ff3d71",
  text: "#ffffff",
};

/** Accepta una URL https o un fitxer dins de /public */
export const font = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));
