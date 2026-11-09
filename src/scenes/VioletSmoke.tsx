import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { beatPulse } from "../beat";
import { Glitch } from "../components/Glitch";
import { CONFIG, sec } from "../config";

const SmokeLayer: React.FC<{
  id: string;
  color: [number, number, number];
  opacity: number;
  dx: number;
  dy: number;
  seed: number;
}> = ({ id, color, opacity, dx, dy, seed }) => {
  const { baseFrequency, octaves } = CONFIG.smoke;
  const [r, g, b] = color;
  return (
    <svg
      width={CONFIG.width}
      height={CONFIG.height}
      style={{ position: "absolute", inset: 0, opacity }}
      viewBox={`0 0 ${CONFIG.width} ${CONFIG.height}`}
    >
      <defs>
        {/* Filter region is pinned to the screen (offset by -dx/-dy) while the noise drifts. */}
        <filter id={id} x={-dx} y={-dy} width={CONFIG.width} height={CONFIG.height} filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={octaves} seed={seed} />
          {/* Fixed colour, alpha driven by the noise: wisps of smoke. */}
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  2.2 0 0 0 -0.85`}
          />
        </filter>
      </defs>
      {/* Translating the filtered group drifts the noise field. */}
      <g transform={`translate(${dx} ${dy})`}>
        <rect x={-dx} y={-dy} width={CONFIG.width} height={CONFIG.height} filter={`url(#${id})`} />
      </g>
    </svg>
  );
};

// 18–25 s: violet accent, drifting smoke, pulsing core.
export const VioletSmoke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const absFrame = frame + sec(CONFIG.scenes.smoke.from);
  const { driftPxPerFrame, violetOpacity, iceOpacity } = CONFIG.smoke;
  const { violet, ice, white, black } = CONFIG.colors;
  const pulse = beatPulse(absFrame, 5);
  const bloom = interpolate(frame, [0, durationInFrames * 0.4], [0, 1], { extrapolateRight: "clamp" });
  const d = frame * driftPxPerFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: black }}>
      <Glitch absFrame={absFrame} every={2}>
        <SmokeLayer id="smokeViolet" color={[0.545, 0, 1]} opacity={violetOpacity * bloom} dx={d * 0.6} dy={-d} seed={3} />
        <SmokeLayer id="smokeIce" color={[0, 1, 1]} opacity={iceOpacity} dx={-d * 0.8} dy={-d * 0.5} seed={11} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${white} 0%, ${ice} 14%, ${violet} 45%, transparent 72%)`,
              filter: "blur(16px)",
              transform: `scale(${0.9 + pulse * 0.3})`,
              opacity: 0.85,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: white, opacity: pulse * 0.08 }} />
      </Glitch>
    </AbsoluteFill>
  );
};
