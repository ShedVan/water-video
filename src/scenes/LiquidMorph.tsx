import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT_FRAMES, beatInfo, beatPulse } from "../beat";
import { CONFIG, sec } from "../config";

// 10–18 s: gooey liquid blobs morphing under turbulence; background darkens; beat ripples.
export const LiquidMorph: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const absFrame = frame + sec(CONFIG.scenes.liquid.from);
  const { baseFrequency, displacement, beatDisplacement, gooBlur, rippleBeats, rippleMaxRadius, blobCount } =
    CONFIG.liquid;
  const { ice, white, deepBlue, black } = CONFIG.colors;

  const progress = frame / durationInFrames;
  const pulse = beatPulse(absFrame, 6);
  const freq = interpolate(progress, [0, 1], [baseFrequency[0], baseFrequency[1]]);
  const disp = interpolate(progress, [0, 1], [displacement[0], displacement[1]]) + pulse * beatDisplacement;
  const bg = interpolateColors(progress, [0, 1], [deepBlue, black]);

  const cx = CONFIG.width / 2;
  const cy = CONFIG.height / 2;
  const { index } = beatInfo(absFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg width={CONFIG.width} height={CONFIG.height} viewBox={`0 0 ${CONFIG.width} ${CONFIG.height}`}>
        <defs>
          <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooBlur} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -11" result="goo" />
            <feTurbulence type="turbulence" baseFrequency={freq} numOctaves={2} seed={7} result="noise" />
            <feDisplacementMap in="goo" in2="noise" scale={disp} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="liquidFill" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor={white} />
            <stop offset="35%" stopColor={ice} />
            <stop offset="100%" stopColor={deepBlue} />
          </radialGradient>
        </defs>

        {/* Ripples: one ring per recent beat, expanding and fading. */}
        {new Array(rippleBeats).fill(0).map((_, k) => {
          const b = index - k;
          if (b < 0) return null;
          const age = absFrame - (CONFIG.beatOffsetSec * CONFIG.fps + b * BEAT_FRAMES);
          const life = rippleBeats * BEAT_FRAMES;
          const r = interpolate(age, [0, life], [80, rippleMaxRadius]);
          const op = interpolate(age, [0, life], [0.55, 0], { extrapolateRight: "clamp" });
          return <circle key={b} cx={cx} cy={cy} r={r} fill="none" stroke={ice} strokeWidth={3} opacity={op} />;
        })}

        <g filter="url(#liquid)">
          {new Array(blobCount).fill(0).map((_, i) => {
            const r = (k: string) => random(`lq-${i}-${k}`);
            const orbit = 120 + r("o") * 260;
            const a = frame * (0.02 + r("s") * 0.03) + r("a") * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(a) * orbit * (1 - progress * 0.4)}
                cy={cy + Math.sin(a * 1.3) * orbit * 1.4 * (1 - progress * 0.4)}
                r={(110 + r("r") * 120) * (1 + pulse * 0.12)}
                fill="url(#liquidFill)"
              />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
