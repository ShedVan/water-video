import { Caption, createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CONFIG } from "./config";

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fontSize, bottom, activeColor, inactiveColor, fontFamily, popInFrames } = CONFIG.captions;
  const absoluteMs = page.startMs + (frame / fps) * 1000;
  const pop = spring({ frame, fps, durationInFrames: popInFrames, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          bottom,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily,
          fontSize,
          fontWeight: 800,
          lineHeight: 1.15,
          whiteSpace: "pre-wrap",
          textShadow: "0 4px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,1)",
          transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: pop,
        }}
      >
        {page.tokens.map((token) => {
          const active = token.fromMs <= absoluteMs && token.toMs > absoluteMs;
          return (
            <span
              key={token.fromMs}
              style={{
                color: active ? activeColor : inactiveColor,
                textShadow: active
                  ? `0 0 24px ${activeColor}, 0 4px 18px rgba(0,0,0,0.9)`
                  : undefined,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));

  const load = useCallback(async () => {
    try {
      const res = await fetch(staticFile(CONFIG.captionsSrc));
      setCaptions((await res.json()) as Caption[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: CONFIG.captions.combineTokensWithinMilliseconds,
      breakOnSilenceAfterMilliseconds: CONFIG.captions.breakOnSilenceAfterMilliseconds,
    }).pages;
  }, [captions]);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const lastWordEnd = page.tokens[page.tokens.length - 1]?.toMs ?? page.startMs;
        const pageEnd = Math.min(page.startMs + page.durationMs, lastWordEnd + CONFIG.captions.holdAfterLastWordMs);
        const endMs = next ? Math.min(next.startMs, pageEnd) : pageEnd;
        const durationInFrames = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
