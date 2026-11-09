import React from "react";
import { AbsoluteFill, random } from "remotion";
import { beatInfo } from "../beat";
import { CONFIG } from "../config";

// Beat-synced 2–3 px horizontal shift with RGB split and noise bands.
export const Glitch: React.FC<{
  absFrame: number;
  every?: number;
  children: React.ReactNode;
}> = ({ absFrame, every = 1, children }) => {
  const { index, since } = beatInfo(absFrame);
  const { shiftPx, frames, bandCount, rgbSplitPx } = CONFIG.glitch;
  const active = index >= 0 && index % every === 0 && since < frames;

  const dir = random(`dir-${index}-${Math.floor(since)}`) > 0.5 ? 1 : -1;
  const amount = random(`amt-${index}`) > 0.5 ? shiftPx[1] : shiftPx[0];
  const shift = active ? dir * amount : 0;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${shift}px)`,
        filter: active
          ? `drop-shadow(${rgbSplitPx}px 0 0 rgba(255,0,80,0.55)) drop-shadow(${-rgbSplitPx}px 0 0 rgba(0,255,255,0.55))`
          : undefined,
      }}
    >
      {children}
      {active
        ? new Array(bandCount).fill(0).map((_, i) => {
            const seed = `band-${index}-${i}-${Math.floor(since)}`;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (random(seed + "x") - 0.5) * 60,
                  top: random(seed + "y") * CONFIG.height,
                  width: CONFIG.width + 60,
                  height: 2 + random(seed + "h") * 26,
                  background: i % 2 ? CONFIG.colors.ice : CONFIG.colors.white,
                  opacity: 0.18 + random(seed + "o") * 0.3,
                  mixBlendMode: "screen",
                }}
              />
            );
          })
        : null}
    </AbsoluteFill>
  );
};
