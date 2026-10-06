#!/usr/bin/env python3
"""
Procedural cinematic score for the OQ RPI Talent Management film.

Generates a deterministic ~3:18 stereo soundtrack in three movements that
follow the film's structure:

  I   Curiosity & inspiration        0:00 - 0:50   (scenes 1-3)
  II  Progressive transformation     0:50 - 2:39   (scenes 4-13)
  III Leadership & future climax     2:39 - 3:18   (scene 14, logo hit at 3:10.7)

Layers: sustained pads, string-like swells, sub bass, cinematic drums (kick,
taiko hits, sub booms), electronic arpeggio, risers and impact hits on the
key cuts. Written with numpy only so it runs anywhere.

Usage:  python3 tools/make-music.py public/audio/music.wav
"""
import math
import sys
import wave

import numpy as np

SR = 44100
BPM = 80.0
BEAT = 60.0 / BPM          # 0.75 s
BAR = BEAT * 4             # 3.0 s
TOTAL = 198.0              # seconds (5930 frames @ 30 fps = 197.67 s)
N = int(TOTAL * SR)

rng = np.random.default_rng(7)

# Film landmarks (seconds), from the scene durations in src/.
SCENE_STARTS = [0, 460, 950, 1490, 1860, 2230, 2600, 3000, 3370, 3680, 3990, 4300, 4760, 5240]
SCENE_STARTS = [f / 30 for f in SCENE_STARTS]
ECOSYSTEM = SCENE_STARTS[2]      # 31.7
MOVEMENT_2 = SCENE_STARTS[3]     # 49.7
CONNECT = SCENE_STARTS[12]       # 158.7
FINALE = SCENE_STARTS[13]        # 174.7
LOGO_HIT = FINALE + 480 / 30     # 190.7
END_FADE = 193.5

L = np.zeros(N, dtype=np.float64)
R = np.zeros(N, dtype=np.float64)


def t_axis(n):
    return np.arange(n) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(buf_l, buf_r, start, sig_l, sig_r=None):
    if sig_r is None:
        sig_r = sig_l
    i0 = int(start * SR)
    if i0 >= N or i0 < 0:
        return
    n = min(len(sig_l), N - i0)
    buf_l[i0:i0 + n] += sig_l[:n]
    buf_r[i0:i0 + n] += sig_r[:n]


def adsr(n, a, d, s, r, total):
    t = t_axis(n)
    env = np.ones(n)
    env = np.where(t < a, t / max(a, 1e-4), env)
    dec = np.clip((t - a) / max(d, 1e-4), 0, 1)
    env = np.where((t >= a) & (t < a + d), 1 - (1 - s) * dec, env)
    env = np.where(t >= a + d, s, env)
    rel_start = total - r
    rel = np.clip((t - rel_start) / max(r, 1e-4), 0, 1)
    env = np.where(t >= rel_start, env * (1 - rel), env)
    return env


def lowpass(sig, cutoff):
    spec = np.fft.rfft(sig)
    freqs = np.fft.rfftfreq(len(sig), 1 / SR)
    gain = 1 / (1 + (freqs / cutoff) ** 4)
    return np.fft.irfft(spec * gain, n=len(sig))


def pad_note(freq, dur, amp, cutoff=1400, detune=0.004):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for k, d in enumerate([-detune, 0, detune]):
        f = freq * (1 + d)
        for h in range(1, 9):
            sig += np.sin(2 * np.pi * f * h * t + k) / h
    sig = lowpass(sig, cutoff)
    env = adsr(n, min(2.5, dur * 0.4), 0.5, 0.85, min(2.5, dur * 0.35), dur)
    return sig * env * amp / 8


def string_note(freq, dur, amp, swell=True):
    n = int(dur * SR)
    t = t_axis(n)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 1.5, 0, 1)
    sig = np.zeros(n)
    for h, g in [(1, 1), (2, 0.5), (3, 0.3), (4, 0.18), (5, 0.1), (6, 0.06)]:
        sig += g * np.sin(2 * np.pi * freq * h * t * vib)
    sig = lowpass(sig, 3200)
    if swell:
        env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8
    else:
        env = adsr(n, 0.4, 0.2, 0.9, 0.6, dur)
    return sig * env * amp / 2.1


def sub_note(freq, dur, amp):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    env = adsr(n, 0.05, 0.1, 0.9, 0.3, dur)
    return sig * env * amp


def pluck(freq, dur, amp):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2 * t) + 0.15 * np.sin(2 * np.pi * freq * 3 * t)
    env = np.exp(-t * 9)
    return sig * env * amp


def kick(amp=1.0, dur=0.6):
    n = int(dur * SR)
    t = t_axis(n)
    f = 42 + 110 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(phase) * np.exp(-t * 7)
    click = rng.standard_normal(n) * np.exp(-t * 400) * 0.3
    return (sig + click) * amp


def taiko(amp=1.0, dur=1.2):
    n = int(dur * SR)
    t = t_axis(n)
    f = 70 + 90 * np.exp(-t * 18)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * 4.5)
    skin = lowpass(rng.standard_normal(n), 900) * np.exp(-t * 14) * 0.8
    return (body + skin) * amp


def boom(amp=1.0, dur=3.0):
    n = int(dur * SR)
    t = t_axis(n)
    f = 38 + 60 * np.exp(-t * 6)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * 1.6)
    rumble = lowpass(rng.standard_normal(n), 160) * np.exp(-t * 2.2) * 1.5
    return (body + rumble) * amp


def hat(amp=0.1, dur=0.08):
    n = int(dur * SR)
    t = t_axis(n)
    sig = rng.standard_normal(n) * np.exp(-t * 90)
    sig = sig - lowpass(sig, 6000)
    return sig * amp


def riser(dur, amp):
    n = int(dur * SR)
    t = t_axis(n)
    noise = rng.standard_normal(n)
    spec = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec *= 1 / (1 + (freqs / 2500) ** 2)
    noise = np.fft.irfft(spec, n=n)
    env = (t / dur) ** 2.2
    tone = np.sin(2 * np.pi * (80 + 400 * (t / dur) ** 2) * t) * 0.5
    return (noise * 0.9 + tone) * env * amp


def impact(amp=1.0):
    n = int(4.0 * SR)
    t = t_axis(n)
    b = boom(1.0, 4.0)
    shimmer = np.zeros(n)
    for f in [880, 1320, 1760, 2640]:
        shimmer += np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) / 4
    return (b + shimmer * 0.25) * amp


def stereo(sig, width=0.6, seed=0):
    d = int(0.012 * SR)
    l = np.concatenate([sig, np.zeros(d)])
    r = np.concatenate([np.zeros(d), sig])
    mid = (l + r) / 2
    side = (l - r) / 2 * width
    if seed % 2:
        return mid + side, mid - side
    return mid - side, mid + side


# D minor film progression (i - VI - III - VII), one chord per bar.
PROG = [[62, 65, 69], [58, 62, 65], [65, 69, 72], [60, 64, 67]]
ROOTS = [50, 46, 41, 48]
# Lift for the climax: D major (I - V - vi - IV).
PROG_MAJ = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]
ROOTS_MAJ = [50, 45, 47, 43]


def movement_gain(t):
    if t < 6:
        return 0.35 * t / 6
    if t < ECOSYSTEM:
        return 0.35 + 0.25 * (t - 6) / (ECOSYSTEM - 6)
    if t < MOVEMENT_2:
        return 0.6 + 0.15 * (t - ECOSYSTEM) / (MOVEMENT_2 - ECOSYSTEM)
    if t < CONNECT:
        return 0.75 + 0.15 * (t - MOVEMENT_2) / (CONNECT - MOVEMENT_2)
    if t < LOGO_HIT:
        return 0.9 + 0.1 * (t - CONNECT) / (LOGO_HIT - CONNECT)
    return 1.0


bars = int(math.ceil(TOTAL / BAR))
for b in range(bars):
    t0 = b * BAR
    if t0 >= TOTAL:
        break
    g = movement_gain(t0)
    climax = t0 >= CONNECT
    chord = (PROG_MAJ if climax else PROG)[b % 4]
    root = (ROOTS_MAJ if climax else ROOTS)[b % 4]

    for i, nnum in enumerate(chord):
        sig = pad_note(midi(nnum - 12), BAR + 0.8, 0.18 * g, cutoff=900 + 900 * g)
        add(L, R, t0, *stereo(sig, 0.7, i))

    if t0 >= 12:
        add(L, R, t0, sub_note(midi(root - 12), BAR, 0.22 * g))

    if t0 >= ECOSYSTEM:
        for i, nnum in enumerate(chord):
            sig = string_note(midi(nnum), BAR, 0.14 * g, swell=not climax)
            add(L, R, t0, *stereo(sig, 0.8, i + 1))
        if climax:
            sig = string_note(midi(chord[0] + 12), BAR, 0.08 * g, swell=False)
            add(L, R, t0, *stereo(sig, 0.5, 3))

    if t0 >= ECOSYSTEM:
        for beat in (0, 2):
            add(L, R, t0 + beat * BEAT, kick(0.55 * g))
    if t0 >= MOVEMENT_2:
        for beat in (1, 3):
            add(L, R, t0 + beat * BEAT, *stereo(taiko(0.45 * g), 0.5, beat))
        if b % 4 == 0:
            add(L, R, t0, boom(0.5 * g))
        for e in range(8):
            add(L, R, t0 + e * BEAT / 2 + (0.02 if e % 2 else 0),
                *stereo(hat(0.06 * g + (0.03 if e % 2 == 0 else 0)), 0.9, e))

    if t0 >= MOVEMENT_2:
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for s in range(16):
            nnum = chord[pattern[s % 8]] + (12 if s % 4 == 3 else 0)
            amp = 0.07 * g * (1.0 if s % 4 == 0 else 0.7)
            add(L, R, t0 + s * BEAT / 4, *stereo(pluck(midi(nnum + 12), 0.5, amp), 0.9, s))

# Risers and impacts on landmark cuts.
add(L, R, ECOSYSTEM - 4.0, *stereo(riser(4.0, 0.35), 0.8, 1))
add(L, R, ECOSYSTEM, impact(0.7))
add(L, R, MOVEMENT_2 - 3.0, *stereo(riser(3.0, 0.3), 0.8, 2))
add(L, R, MOVEMENT_2, boom(0.6))
for s in SCENE_STARTS[4:12]:
    add(L, R, s, boom(0.28, 2.0))
add(L, R, CONNECT - 5.0, *stereo(riser(5.0, 0.45), 0.8, 3))
add(L, R, CONNECT, impact(0.9))
add(L, R, FINALE - 2.0, *stereo(riser(2.0, 0.3), 0.8, 4))
add(L, R, FINALE, boom(0.5))
add(L, R, LOGO_HIT - 3.0, *stereo(riser(3.0, 0.5), 0.8, 5))
add(L, R, LOGO_HIT, impact(1.2))

# Opening: a single bright "particle" tone that seeds the score.
t = t_axis(int(6 * SR))
seed_tone = (np.sin(2 * np.pi * midi(86) * t) * np.exp(-t * 0.9) * 0.12
             + np.sin(2 * np.pi * midi(74) * t) * np.exp(-t * 0.6) * 0.08)
add(L, R, 1.0, *stereo(seed_tone, 0.9, 1))

t = t_axis(N)
fade = np.where(t > END_FADE, np.clip(1 - (t - END_FADE) / (TOTAL - END_FADE), 0, 1) ** 1.5, 1.0)
L *= fade
R *= fade


def soft(x):
    return np.tanh(x * 1.1) / np.tanh(1.1)


peak = max(np.abs(L).max(), np.abs(R).max())
L = soft(L / peak * 0.9)
R = soft(R / peak * 0.9)
peak = max(np.abs(L).max(), np.abs(R).max())
L *= 0.95 / peak
R *= 0.95 / peak

pcm = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
path = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", path, f"{TOTAL:.1f}s")
