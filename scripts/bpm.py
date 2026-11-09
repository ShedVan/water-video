"""Estimate BPM and beat grid of public/water.mp3 (librosa)."""
import json
import sys

import librosa
import numpy as np

path = sys.argv[1] if len(sys.argv) > 1 else "public/water.mp3"
y, sr = librosa.load(path, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
bt = librosa.frames_to_time(beats, sr=sr)
bpm = float(np.atleast_1d(tempo)[0])
print(json.dumps({
    "bpm": round(bpm, 2),
    "medianIbiBpm": round(float(60 / np.median(np.diff(bt))), 2),
    "firstBeatSec": round(float(bt[0]), 3),
    "beatCount": int(len(bt)),
}))
