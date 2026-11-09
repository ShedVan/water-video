import { CONFIG } from "./config";

export const BEAT_FRAMES = (CONFIG.fps * 60) / CONFIG.bpm;

// Position of an absolute frame on the beat grid.
export const beatInfo = (absFrame: number) => {
  const t = absFrame - CONFIG.beatOffsetSec * CONFIG.fps;
  const index = Math.floor(t / BEAT_FRAMES);
  const since = t - index * BEAT_FRAMES;
  return { index, since };
};

// 1 on the beat, exponentially decaying until the next one.
export const beatPulse = (absFrame: number, decayFrames: number) => {
  const { index, since } = beatInfo(absFrame);
  if (index < 0) return 0;
  return Math.exp(-since / decayFrames);
};
