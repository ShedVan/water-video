import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEAT_FRAMES, beatInfo, beatPulse } from "../beat";
import { Glitch } from "../components/Glitch";
import { CONFIG, sec } from "../config";

// 25 s – end: inward-flowing vortex compressing into a point; final collapse, flash, black.
export const Collapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const absFrame = frame + sec(CONFIG.scenes.collapse.from);
  const { finalSec, flashFrames, particleCount, maxRadius, inflowPxPerFrame, ringLifeBeats, breathingAmp, violetMix } =
    CONFIG.collapse;
  const { ice, violet, white, black, deepBlue } = CONFIG.colors;

  const finalStart = durationInFrames - sec(finalSec);
  const collapse = interpolate(frame, [finalStart, durationInFrames - flashFrames * 3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const flashAt = durationInFrames - flashFrames * 3;
  const flash = interpolate(frame, [flashAt, flashAt + 1, flashAt + flashFrames], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blackout = frame >= flashAt + flashFrames;

  const pulse = beatPulse(absFrame, 5);
  const breathing = 1 - breathingAmp + Math.sin(absFrame / (BEAT_FRAMES * 8) * Math.PI * 2) * breathingAmp;
  const mix = interpolate(frame, [0, durationInFrames], [violetMix[0], violetMix[1]]);
  // Spin direction flips every 16 bars to vary the long section.
  const { index } = beatInfo(absFrame);
  const spinDir = Math.floor(Math.max(index, 0) / 64) % 2 === 0 ? 1 : -1;

  const cx = CONFIG.width / 2;
  const cy = CONFIG.height / 2;

  if (blackout) return <AbsoluteFill style={{ backgroundColor: black }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: black }}>
      <Glitch absFrame={absFrame}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${interpolateColors(mix, [0, 1], [deepBlue, "#1a0033"])} 0%, ${black} 60%)`,
            opacity: collapse,
          }}
        />
        <AbsoluteFill style={{ transform: `scale(${collapse * breathing})`, transformOrigin: "50% 50%" }}>
          <svg width={CONFIG.width} height={CONFIG.height}>
            {/* Rings born on each beat at the rim and shrinking into the centre. */}
            {new Array(ringLifeBeats).fill(0).map((_, k) => {
              const b = index - k;
              if (b < 0) return null;
              const age = absFrame - (CONFIG.beatOffsetSec * CONFIG.fps + b * BEAT_FRAMES);
              const t = age / (ringLifeBeats * BEAT_FRAMES);
              const r = interpolate(t, [0, 1], [maxRadius * 0.9, 4], { easing: Easing.in(Easing.quad) });
              const color = random(`ring-${b}`) < mix ? violet : ice;
              return (
                <circle key={b} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2 + (1 - t) * 4} opacity={0.15 + t * 0.6} />
              );
            })}
            {/* Spiral particles: radius wraps, so the flow into the centre never ends. */}
            {new Array(particleCount).fill(0).map((_, i) => {
              const rnd = (k: string) => random(`cp-${i}-${k}`);
              const speed = inflowPxPerFrame * (0.5 + rnd("v"));
              const r = (((rnd("r") * maxRadius - absFrame * speed) % maxRadius) + maxRadius) % maxRadius;
              const angle = rnd("a") * Math.PI * 2 + spinDir * (absFrame * 0.01 + 60 / (r + 40));
              const near = interpolate(r, [0, 120, maxRadius * 0.8, maxRadius], [0, 1, 1, 0]);
              const color = rnd("c") < mix ? violet : rnd("w") > 0.85 ? white : ice;
              return (
                <circle
                  key={i}
                  cx={cx + Math.cos(angle) * r}
                  cy={cy + Math.sin(angle) * r * 1.35}
                  r={(1.5 + rnd("s") * 5) * (1 + pulse * 0.8)}
                  fill={color}
                  opacity={near * (0.5 + pulse * 0.5)}
                />
              );
            })}
          </svg>
          {/* The point everything collapses into. */}
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${white} 0%, ${ice} 30%, ${violet} 60%, transparent 75%)`,
                transform: `scale(${1 + pulse * 1.2})`,
                boxShadow: `0 0 ${60 + pulse * 80}px ${ice}`,
              }}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      </Glitch>
      <AbsoluteFill style={{ backgroundColor: white, opacity: flash }} />
    </AbsoluteFill>
  );
};
