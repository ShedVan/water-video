import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG } from "../config";

// 0–3 s: abstract ice-blue blob revealed through a pixel dissolve. No text.
export const BlobDissolve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pixelSize, dissolveStartSec, dissolveEndSec, radius, wobblePct, blurPx } = CONFIG.blob;
  const { ice, deepBlue, white } = CONFIG.colors;

  const grow = spring({ frame, fps, config: { damping: 14, mass: 1.4 } });
  const dissolve = interpolate(frame, [dissolveStartSec * fps, dissolveEndSec * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const w = (phase: number) => 50 + Math.sin(frame / 9 + phase) * wobblePct;
  const radiusShape = `${w(0)}% ${100 - w(1)}% ${w(2)}% ${100 - w(3)}% / ${w(4)}% ${w(5)}% ${100 - w(6)}% ${100 - w(7)}%`;

  const cols = Math.ceil(CONFIG.width / pixelSize);
  const rows = Math.ceil(CONFIG.height / pixelSize);

  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.colors.black }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: radius * 2,
            height: radius * 2.3,
            borderRadius: radiusShape,
            background: `radial-gradient(circle at 40% 35%, ${white} 0%, ${ice} 18%, ${deepBlue} 62%, transparent 78%)`,
            filter: `blur(${blurPx}px)`,
            transform: `scale(${0.4 + grow * 0.6}) rotate(${frame * 0.8}deg)`,
          }}
        />
      </AbsoluteFill>
      {/* Black pixel grid; each cell disappears once the dissolve passes its random threshold. */}
      <AbsoluteFill>
        {new Array(cols * rows).fill(0).map((_, i) => {
          const threshold = random(`px-${i}`);
          if (threshold < dissolve) return null;
          const edge = threshold - dissolve < 0.06;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (i % cols) * pixelSize,
                top: Math.floor(i / cols) * pixelSize,
                width: pixelSize,
                height: pixelSize,
                backgroundColor: edge ? deepBlue : CONFIG.colors.black,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
