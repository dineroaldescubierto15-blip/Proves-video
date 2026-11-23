import { Composition } from "remotion";
import { Reel } from "./Reel";
import { FPS, ReelProps, TRANSICIO, segonsEscena } from "./types";
import exemple from "../reels/exemple.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={exemple as ReelProps}
      calculateMetadata={({ props }) => {
        const total = props.escenes.reduce(
          (acc, e) => acc + Math.round(segonsEscena(e) * FPS),
          0,
        );
        // les escenes se solapen TRANSICIO frames entre elles
        const solapament = Math.max(0, props.escenes.length - 1) * TRANSICIO;
        return { durationInFrames: Math.max(1, total - solapament) };
      }}
    />
  );
};
