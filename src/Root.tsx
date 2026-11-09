import { Composition } from "remotion";
import { CONFIG } from "./config";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WaterVideo"
      component={Video}
      durationInFrames={CONFIG.durationInFrames}
      fps={CONFIG.fps}
      width={CONFIG.width}
      height={CONFIG.height}
    />
  );
};
