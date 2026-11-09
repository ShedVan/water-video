"""Local Whisper transcription -> Remotion Caption[] JSON.

ДЕФОЛТ: lyrics-transcriber has no local Whisper backend (only RunPod/AudioShake
cloud providers, which need API keys), so we run Whisper locally via faster-whisper.

Usage: python scripts/transcribe.py public/water.mp3 public/water-captions.json [raw.json]
"""
import dataclasses
import json
import re
import sys

import librosa
from faster_whisper import WhisperModel

audio, out_path = sys.argv[1], sys.argv[2]
raw_path = sys.argv[3] if len(sys.argv) > 3 else None

# Decode with librosa: faster-whisper's PyAV decoder is incompatible with recent av releases.
samples, _ = librosa.load(audio, sr=16000, mono=True)

model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    samples,
    language="ru",  # ДЕФОЛТ: Russian-language track
    word_timestamps=True,
    vad_filter=False,  # VAD tends to drop sung vocals over music
    condition_on_previous_text=False,
    beam_size=5,
)

# ДЕФОЛТ: drop well-known Whisper hallucinations (subtitle-credit lines on silence/outros).
HALLUCINATION = re.compile(r"субтитр|DimaTorzok|редактор|продолжение следует", re.IGNORECASE)

captions, raw = [], []
for seg in segments:
    if HALLUCINATION.search(seg.text):
        print(f"dropped hallucination {seg.start:.1f}-{seg.end:.1f}: {seg.text.strip()}")
        continue
    raw.append({"start": seg.start, "end": seg.end, "text": seg.text,
                "words": [dataclasses.asdict(w) for w in (seg.words or [])]})
    for w in seg.words or []:
        word = w.word.strip()
        if not word:
            continue
        start_ms = round(w.start * 1000)
        captions.append({
            # Leading space is required so createTikTokStyleCaptions keeps words apart.
            "text": " " + word,
            "startMs": start_ms,
            "endMs": max(round(w.end * 1000), start_ms + 1),
            "timestampMs": round((w.start + w.end) / 2 * 1000),
            "confidence": round(float(w.probability), 4),
        })

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(captions, f, ensure_ascii=False, indent=2)
if raw_path:
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump({"language": info.language, "segments": raw}, f, ensure_ascii=False, indent=2)
print(f"language={info.language} p={info.language_probability:.2f} words={len(captions)}")
