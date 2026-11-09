import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG } from "../config";

// Crossfade wrapper: fades in over the first and out over the last transitionFrames.
export const SceneFade: React.FC<{
  fadeIn?: boolean;
  fadeOut?: boolean;
  children: React.ReactNode;
}> = ({ fadeIn = true, fadeOut = true, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = CONFIG.transitionFrames;
  const inOp = fadeIn ? interpolate(frame, [0, t], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const outOp = fadeOut
    ? interpolate(frame, [durationInFrames - t, durationInFrames], [1, 0], { extrapolateLeft: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity: Math.min(inOp, outOp) }}>{children}</AbsoluteFill>;
};
