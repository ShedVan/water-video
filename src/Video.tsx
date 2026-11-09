import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Captions } from "./Captions";
import { SceneFade } from "./components/SceneFade";
import { CONFIG, sec } from "./config";
import { BlobDissolve } from "./scenes/BlobDissolve";
import { Collapse } from "./scenes/Collapse";
import { LiquidMorph } from "./scenes/LiquidMorph";
import { PulseParticles } from "./scenes/PulseParticles";
import { VioletSmoke } from "./scenes/VioletSmoke";

const { scenes, transitionFrames: T, durationInFrames } = CONFIG;

// Each scene runs T frames past its end so it crossfades into the next one.
const timeline = [
  { name: "Blob", from: sec(scenes.blob.from), to: sec(scenes.blob.to) + T, Comp: BlobDissolve },
  { name: "Particles", from: sec(scenes.particles.from), to: sec(scenes.particles.to) + T, Comp: PulseParticles },
  { name: "Liquid", from: sec(scenes.liquid.from), to: sec(scenes.liquid.to) + T, Comp: LiquidMorph },
  { name: "Smoke", from: sec(scenes.smoke.from), to: sec(scenes.smoke.to) + T, Comp: VioletSmoke },
  { name: "Collapse", from: sec(scenes.collapse.from), to: durationInFrames, Comp: Collapse },
];

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.colors.black }}>
      <Audio src={staticFile(CONFIG.audioSrc)} />
      {timeline.map(({ name, from, to, Comp }, i) => (
        <Sequence key={name} name={name} from={from} durationInFrames={to - from}>
          <SceneFade fadeIn={i > 0} fadeOut={i < timeline.length - 1}>
            <Comp />
          </SceneFade>
        </Sequence>
      ))}
      {/* Static scanlines + vignette overlay (no CSS animation). */}
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
      <Sequence name="Captions">
        <Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
