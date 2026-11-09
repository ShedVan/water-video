// All animation parameters for the "WATER" video live here.
export const CONFIG = {
  fps: 30,
  width: 1080,
  height: 1920,
  // ДЕФОЛТ: ffprobe reports 124.97 s for public/water.mp3 -> floor(124.97 * 30)
  durationInFrames: 3749,
  audioSrc: "water.mp3",
  captionsSrc: "water-captions.json",

  // Measured with scripts/bpm.py (librosa beat_track): 152 BPM, first beat at 0.07 s.
  bpm: 152,
  beatOffsetSec: 0.07,

  colors: {
    black: "#000000",
    deepBlue: "#001133",
    ice: "#00FFFF",
    white: "#FFFFFF",
    violet: "#8B00FF",
  },

  // Scene boundaries in seconds; the last scene runs to the end of the track.
  scenes: {
    blob: { from: 0, to: 3 },
    particles: { from: 3, to: 10 },
    liquid: { from: 10, to: 18 },
    smoke: { from: 18, to: 25 },
    collapse: { from: 25 },
  },
  // Crossfade overlap between neighbouring scenes ("текучие переходы").
  transitionFrames: 14,

  glitch: {
    shiftPx: [2, 3] as const,
    frames: 3,
    bandCount: 3,
    rgbSplitPx: 3,
  },

  blob: {
    pixelSize: 40,
    dissolveStartSec: 0.2,
    dissolveEndSec: 2.4,
    radius: 360,
    wobblePct: 14,
    blurPx: 28,
  },

  particles: {
    count: 140,
    minSize: 4,
    maxSize: 18,
    riseSpeed: [0.6, 2.4] as const,
    pulseScale: 0.9,
    pulseDecayFrames: 5,
  },

  liquid: {
    baseFrequency: [0.004, 0.011] as const,
    displacement: [30, 150] as const,
    beatDisplacement: 60,
    gooBlur: 40,
    rippleBeats: 4,
    rippleMaxRadius: 1100,
    blobCount: 5,
  },

  smoke: {
    baseFrequency: 0.0045,
    octaves: 4,
    driftPxPerFrame: 1.6,
    violetOpacity: 0.9,
    iceOpacity: 0.35,
  },

  collapse: {
    // ДЕФОЛТ: the brief puts the collapse at "25 s – end" (~100 s), so the scene is a
    // continuous inward-flowing vortex and the final collapse to a point happens in the
    // last `finalSec` seconds.
    finalSec: 4,
    flashFrames: 4,
    particleCount: 170,
    maxRadius: 1000,
    inflowPxPerFrame: 3.2,
    ringLifeBeats: 4,
    breathingAmp: 0.06,
    // Violet weight grows over the second half of the track.
    violetMix: [0.35, 0.85] as const,
  },

  captions: {
    combineTokensWithinMilliseconds: 1200,
    // ДЕФОЛТ: start a new page after 1 s of silence and hide a page 600 ms after its
    // last word, so lines don't linger through instrumental gaps.
    breakOnSilenceAfterMilliseconds: 1000,
    holdAfterLastWordMs: 600,
    fontSize: 72,
    bottom: 200,
    activeColor: "#00FFFF",
    inactiveColor: "#FFFFFF",
    fontFamily: "'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif", // ДЕФОЛТ: system sans-serif stack
    popInFrames: 6,
  },
};

export const sec = (s: number) => Math.round(s * CONFIG.fps);
