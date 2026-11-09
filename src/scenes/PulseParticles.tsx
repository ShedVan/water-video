import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { beatPulse } from "../beat";
import { Glitch } from "../components/Glitch";
import { CONFIG, sec } from "../config";

// 3–10 s: bubbles/particles rising through deep water, pulsing on every beat.
export const PulseParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const absFrame = frame + sec(CONFIG.scenes.particles.from);
  const { count, minSize, maxSize, riseSpeed, pulseScale, pulseDecayFrames } = CONFIG.particles;
  const { ice, white, deepBlue, black } = CONFIG.colors;
  const pulse = beatPulse(absFrame, pulseDecayFrames);
  const H = CONFIG.height + 100;

  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(ellipse at 50% 55%, ${deepBlue} 0%, ${black} 75%)` }}
    >
      <Glitch absFrame={absFrame}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 520,
              height: 520,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ice}55 0%, ${deepBlue}00 70%)`,
              transform: `scale(${1 + pulse * 0.25})`,
              filter: "blur(20px)",
            }}
          />
        </AbsoluteFill>
        {new Array(count).fill(0).map((_, i) => {
          const r = (k: string) => random(`p-${i}-${k}`);
          const size = interpolate(r("s"), [0, 1], [minSize, maxSize]);
          const speed = interpolate(r("v"), [0, 1], [riseSpeed[0], riseSpeed[1]]);
          const y = (((r("y") * H - frame * speed) % H) + H) % H - 50;
          const x = r("x") * CONFIG.width + Math.sin(frame / 20 + r("ph") * 6.28) * 18;
          const scale = 1 + pulse * pulseScale * r("p");
          const color = r("c") > 0.8 ? white : ice;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: 0.35 + r("o") * 0.5 + pulse * 0.2,
                transform: `scale(${scale})`,
                boxShadow: `0 0 ${size * 1.5}px ${color}`,
              }}
            />
          );
        })}
      </Glitch>
    </AbsoluteFill>
  );
};
