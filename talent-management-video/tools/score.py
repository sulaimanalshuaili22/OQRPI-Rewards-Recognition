#!/usr/bin/env python3
"""
Original cinematic score, sound design and final mix for the OQ RPI Talent
Management film.

Benchmarked on the reference corporate track's characteristics (not its
content): harmonic-led (piano + strings + warm pad), light percussion that
sits ~5 dB under the harmony, G major / E minor, 76 BPM with an eighth-note
pulse, a steady brightening build, a proud climax and a soft resolve;
narrator ~12 dB above the music bed; master at -16 LUFS with a tight
loudness range.

Pipeline
  1. Compose every part as MIDI on a bar grid that follows the film's scenes.
  2. Render each stem with FluidSynth + the MuseScore General orchestral bank.
  3. Add numpy-synthesised layers (electronic arpeggio, sub, risers, whooshes,
     impacts) on the scene transitions and key reveals.
  4. Process the narrator (EQ, de-ess, compression, short room).
  5. Duck the music under the narrator, glue, limit and loudness-normalise.

Outputs
  public/audio/soundtrack.mp3    final mix used by the film
  audio-src/stems/*.wav          music stems (for re-mixing)
  src/film/music.json            musical landmarks (bar grid, logo hit frame)

Usage:  python tools/score.py
        python tools/score.py --film src/v5 --work audio-src/v5 --out public/audio/soundtrack-v5.mp3
"""
import argparse
import json
import os
import subprocess
import tempfile

import mido
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("--film", default="src/film", help="folder with script.json + timeline.json; music.json is written there")
ap.add_argument("--work", default="audio-src", help="folder with voice_raw.wav; stems are written here")
ap.add_argument("--out", default="public/audio/soundtrack.mp3")
args = ap.parse_args()
FILM = os.path.join(ROOT, args.film)
WORK = os.path.join(ROOT, args.work)
SF = "/usr/share/sounds/sf3/MuseScore_General_Full.sf3"
SR = 48000
BPM = 76.0
BEAT = 60.0 / BPM
BAR = BEAT * 4
TPB = 480  # MIDI ticks per beat

tl = json.load(open(os.path.join(FILM, "timeline.json")))
# Optional per-film music map (v5); without it the v4 scene names are used.
MUSIC = json.load(open(os.path.join(FILM, "script.json"), encoding="utf-8")).get("music")
FPS = tl["fps"]
TOTAL = tl["durationInFrames"] / FPS
SCENES = [(s["id"], s["start"] / FPS, (s["start"] + s["duration"]) / FPS) for s in tl["scenes"]]
LINES = [(l["scene"], l["start"] / FPS, (l["end"] - 8) / FPS) for l in tl["lines"]]
scene_start = {sid: a for sid, a, b in SCENES}
scene_end = {sid: b for sid, a, b in SCENES}


def scene_at(t):
    for sid, a, b in SCENES:
        if a <= t < b:
            return sid
    return SCENES[-1][0]


def bar_of(t):
    return int(round(t / BAR))


# ---------------------------------------------------------------- landmarks
# The logo hit lands on the first downbeat after the final narrator line.
last_line_end = LINES[-1][2]
LOGO_BAR = int(np.ceil((last_line_end + 0.9) / BAR))
LOGO_T = LOGO_BAR * BAR
CLIMAX_BAR = bar_of(scene_start[MUSIC["climax"] if MUSIC else "connections"])
QUIET_BAR = bar_of(scene_start[MUSIC["reflect"] if MUSIC else "future"])          # "built by people": pull back
OPEN_ID = SCENES[0][0]
RISE_ID = SCENES[1][0] if MUSIC else "ecosystem"     # second scene: first rise accent
DATA_IDS = ("know", "sustain") if MUSIC else ("performance", "platform")
DARK_KEYS = (SCENES[1][1], SCENES[2][1]) if MUSIC else None
HUSH_ID = MUSIC.get("hush") if MUSIC else None
PRIDE_BAR = bar_of(LINES[-2][1]) - 1                 # rebuild into the final lines
END_BAR = int(np.ceil(TOTAL / BAR)) + 1


def section(bar):
    t = bar * BAR
    if bar >= LOGO_BAR:
        return "outro"
    if bar >= PRIDE_BAR:
        return "pride"
    if bar >= QUIET_BAR:
        return "reflect"
    if bar >= CLIMAX_BAR:
        return "climax"
    sid = scene_at(t + 0.01)
    if MUSIC:
        for sec in ("intro", "rise", "momentum"):
            if sid in MUSIC[sec]:
                return sec
        return "innovation"
    if sid == "opening":
        return "intro"
    if sid in ("why", "ecosystem"):
        return "rise"
    if sid in ("performance", "ninebox", "critical", "succession", "leadership"):
        return "momentum"
    return "innovation"


# Energy 0..1 per section (drives velocities and layer entries)
ENERGY = {"intro": 0.35, "rise": 0.5, "momentum": 0.68, "innovation": 0.78,
          "climax": 0.95, "reflect": 0.55, "pride": 1.0, "outro": 0.45}

# ---------------------------------------------------------------- harmony
CH = {
    "G": (43, [55, 59, 62, 67]), "Gsus2": (43, [55, 57, 62, 67]), "Gadd9": (43, [55, 57, 59, 62]),
    "Em": (40, [55, 59, 64, 67]), "Em7": (40, [55, 59, 62, 64]),
    "C": (36, [55, 60, 64, 67]), "Cadd9": (36, [55, 60, 62, 64]), "Cmaj7": (36, [55, 59, 64, 67]),
    "D": (38, [54, 57, 62, 66]), "Dsus4": (38, [55, 57, 62, 67]), "D/F#": (42, [54, 57, 62, 66]),
    "Am7": (45, [55, 60, 64, 67]), "Bm": (47, [54, 59, 62, 66]),
}
PROG = {
    "intro": ["Gsus2", "Cadd9", "Em7", "Dsus4"],
    "rise": ["Em", "C", "G", "D"],
    "momentum": ["Em", "C", "G", "D"],
    "innovation": ["C", "D", "Em", "G"],
    "climax": ["C", "D", "Em", "G"],
    "reflect": ["Cadd9", "Gsus2", "Em7", "Dsus4"],
    "pride": ["C", "D", "Em", "D/F#"],
    "outro": ["G", "Cmaj7", "Gadd9", "Gadd9"],
}


def chord_for(bar):
    sec = section(bar)
    seq = PROG[sec]
    # count bars from the start of this section so phrases begin on the tonic idea
    b0 = bar
    while b0 > 0 and section(b0 - 1) == sec:
        b0 -= 1
    return seq[(bar - b0) % len(seq)], sec


# ---------------------------------------------------------------- MIDI helpers
class Part:
    def __init__(self, program, channel=0, pan=64, cc_vol=100):
        self.program, self.channel, self.pan, self.vol = program, channel, pan, cc_vol
        self.events = []  # (time_s, type, note, vel)

    def note(self, t, dur, note, vel):
        vel = int(max(1, min(127, vel)))
        self.events.append((t, "on", note, vel))
        self.events.append((t + dur, "off", note, 0))

    def cc(self, t, ctrl, val):
        self.events.append((t, "cc", ctrl, int(max(0, min(127, val)))))

    def write(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        tr = mido.MidiTrack()
        mid.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM)))
        if self.channel != 9:
            tr.append(mido.Message("program_change", program=self.program, channel=self.channel))
        tr.append(mido.Message("control_change", control=10, value=self.pan, channel=self.channel))
        tr.append(mido.Message("control_change", control=7, value=self.vol, channel=self.channel))
        tr.append(mido.Message("control_change", control=91, value=0, channel=self.channel))
        tr.append(mido.Message("control_change", control=93, value=0, channel=self.channel))
        order = {"off": 0, "cc": 1, "on": 2}
        evs = sorted(self.events, key=lambda e: (e[0], order[e[1]]))
        last = 0
        for t, typ, a, b in evs:
            tick = int(round(t / BEAT * TPB))
            delta = max(0, tick - last)
            last = max(last, tick)
            if typ == "on":
                tr.append(mido.Message("note_on", note=a, velocity=b, channel=self.channel, time=delta))
            elif typ == "off":
                tr.append(mido.Message("note_off", note=a, velocity=0, channel=self.channel, time=delta))
            else:
                tr.append(mido.Message("control_change", control=a, value=b, channel=self.channel, time=delta))
        mid.save(path)


rng = np.random.default_rng(11)


def hum(v, amt=6):
    return v + rng.integers(-amt, amt + 1)


def swing(t, amt=0.008):
    return t + rng.normal(0, amt)


piano = Part(0, 0, pan=58, cc_vol=110)
strings = Part(48, 1, pan=70, cc_vol=100)
cellos = Part(42, 2, pan=52, cc_vol=105)
basses = Part(43, 3, pan=64, cc_vol=100)
pad = Part(89, 4, pan=64, cc_vol=90)
pizz = Part(45, 5, pan=80, cc_vol=95)
horns = Part(60, 6, pan=48, cc_vol=100)
brass = Part(61, 7, pan=76, cc_vol=85)
choir = Part(52, 8, pan=64, cc_vol=90)
timp = Part(47, 10, pan=60, cc_vol=110)
drums = Part(0, 9, pan=64, cc_vol=100)
celesta = Part(8, 11, pan=88, cc_vol=85)

# Horn / string melody for the climax and pride sections (G major).
MOTIF = [  # (beat offset, beats, midi)
    (0, 1.5, 71), (1.5, 0.5, 69), (2, 2, 67),
    (4, 1.5, 64), (5.5, 0.5, 67), (6, 2, 69),
    (8, 1.5, 71), (9.5, 0.5, 74), (10, 2, 76),
    (12, 3, 74), (15, 1, 71),
]

for bar in range(END_BAR):
    t0 = bar * BAR
    if t0 > TOTAL + BAR:
        break
    name, sec = chord_for(bar)
    e = ENERGY[sec]
    bass, tones = CH[name]

    # Warm pad: always present; carries the bed.
    for n in tones[:3]:
        pad.note(t0, BAR + 0.15, n, 55 + 30 * e)

    # Piano: intro = sparse high motif; later = flowing eighth-note arpeggio.
    if sec in ("intro", "reflect"):
        arp = [tones[0] + 12, tones[2] + 12, tones[1] + 12, tones[3] + 12]
        for i, beat in enumerate((0, 1.5, 2.5, 3.5)):
            piano.note(swing(t0 + beat * BEAT), BEAT * 1.8, arp[i % 4], hum(52 + 20 * e))
        if bar % 2 == 0:
            piano.note(t0, BAR * 1.9, bass + 12, hum(48))
    elif sec == "outro":
        if bar == LOGO_BAR:
            for n in [43, 55] + tones:
                piano.note(t0, BAR * 2.5, n, 92)
        else:
            for i, n in enumerate([tones[0] + 12, tones[1] + 12, tones[2] + 12, tones[3] + 12]):
                piano.note(t0 + i * BEAT * 0.75, BAR * 1.5, n, hum(44 - 6 * (bar - LOGO_BAR)))
    else:
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for i in range(8):
            n = tones[pattern[i]] + (12 if i in (3, 6) else 0)
            accent = 10 if i % 4 == 0 else 0
            piano.note(swing(t0 + i * BEAT / 2), BEAT * 0.9, n, hum(48 + 34 * e + accent))
        piano.note(t0, BAR, bass + 12, hum(50 + 30 * e))

    # Strings: enter in the rise; swell per bar until the climax, then sustained.
    if sec != "intro":
        sv = 50 + 55 * e
        for n in tones:
            strings.note(t0, BAR + 0.05, n + (12 if sec in ("climax", "pride") else 0), sv)
        strings.cc(t0, 11, 60 + 40 * e)
        strings.cc(t0 + BAR * 0.5, 11, 80 + 47 * e)
        strings.cc(t0 + BAR * 0.95, 11, 64 + 40 * e)
    # Celli: long notes from the rise, driving eighths in momentum onwards.
    if sec in ("rise", "reflect", "outro"):
        cellos.note(t0, BAR, bass + 12, 60 + 40 * e)
    elif sec in ("momentum", "innovation", "climax", "pride"):
        for i in range(8):
            cellos.note(t0 + i * BEAT / 2, BEAT / 2 * 0.85, bass + 12, hum(58 + 40 * e + (12 if i % 2 == 0 else 0)))
    # Contrabass root
    if sec not in ("intro",):
        basses.note(t0, BAR, bass, 70 + 40 * e)
    elif bar % 2 == 0:
        basses.note(t0, BAR * 2, bass, 55)

    # Pizzicato ostinato for momentum/innovation (light, rhythmic).
    if sec in ("momentum", "innovation"):
        figure = [tones[0] + 12, tones[2] + 12, tones[1] + 12, tones[2] + 12]
        for i in range(8):
            if i in (0, 3, 4, 6):
                pizz.note(t0 + i * BEAT / 2, BEAT / 2, figure[i % 4], hum(60 + 30 * e))

    # Celesta sparkle: intro curiosity and innovation shimmer.
    if sec in ("intro", "innovation") and bar % 2 == 1:
        for i, n in enumerate([tones[3] + 12, tones[2] + 24, tones[1] + 24]):
            celesta.note(t0 + (2 + i * 0.5) * BEAT, BEAT * 2, n, hum(46))

    # Horns + brass + choir: the climax and pride.
    if sec in ("climax", "pride"):
        phrase_bar = (bar - (CLIMAX_BAR if sec == "climax" else PRIDE_BAR)) % 4
        for ob, beats, n in MOTIF:
            if int(ob // 4) == phrase_bar:
                horns.note(t0 + (ob % 4) * BEAT, beats * BEAT * 0.98, n - 12, 78 + 40 * e)
        for n in tones[:3]:
            choir.note(t0, BAR, n, 55 + 45 * e)
        if sec == "pride" or phrase_bar in (2, 3):
            for n in (tones[0] - 12, tones[2] - 12):
                brass.note(t0, BAR, n, 55 + 45 * e)
    if sec == "outro" and bar == LOGO_BAR:
        for n in tones[:3]:
            choir.note(t0, BAR * 2.2, n, 96)
            horns.note(t0, BAR * 2, n - 12, 100)
            brass.note(t0, BAR * 1.5, n - 12, 90)

    # Percussion: light and supportive (sits under the harmony).
    if sec in ("momentum", "innovation", "climax", "pride"):
        for i in (0, 2):
            drums.note(t0 + i * BEAT, 0.3, 36, hum(58 + 40 * e))       # kick
        if sec != "momentum" or bar % 2:
            drums.note(t0 + 3.5 * BEAT, 0.2, 36, hum(48 + 30 * e))
        for i in (1, 3):
            drums.note(t0 + i * BEAT, 0.2, 37, hum(34 + 30 * e))       # rim
        for i in range(16 if sec in ("innovation", "climax", "pride") else 8):
            step = BEAT / 4 if sec in ("innovation", "climax", "pride") else BEAT / 2
            drums.note(swing(t0 + i * step, 0.004), 0.1, 70, hum(30 + 30 * e + (10 if i % 2 == 0 else 0)))  # maracas
    if sec == "rise" and scene_at(t0) == RISE_ID:
        drums.note(t0, 0.3, 36, 70)
        drums.note(t0 + 2 * BEAT, 0.3, 36, 62)
    # Timpani: climax downbeats and pride rolls.
    if sec in ("climax", "pride") and bar % 2 == 0:
        timp.note(t0, BEAT * 2, 43, 95)
    if bar == LOGO_BAR - 1:
        for i in range(16):
            timp.note(t0 + 2 * BEAT + i * BEAT / 8, BEAT / 8, 43, 40 + i * 5)
    if bar == LOGO_BAR:
        timp.note(t0, BEAT * 4, 43, 120)
        drums.note(t0, 2, 49, 100)  # crash
        drums.note(t0, 0.5, 36, 120)
    # Fills into each new section
    if section(bar + 1) != sec and sec in ("momentum", "innovation", "climax"):
        for i, n in enumerate((45, 43, 41, 41)):
            drums.note(t0 + (3 + i * 0.25) * BEAT, 0.2, n, 60 + i * 10)

parts = {
    "piano": piano, "strings": strings, "cellos": cellos, "basses": basses, "pad": pad,
    "pizz": pizz, "horns": horns, "brass": brass, "choir": choir, "timpani": timp,
    "drums": drums, "celesta": celesta,
}

N = int((TOTAL + 1) * SR)
stem_dir = os.path.join(WORK, "stems")
os.makedirs(stem_dir, exist_ok=True)


def render(name, part):
    with tempfile.TemporaryDirectory() as tmp:
        mpath = os.path.join(tmp, f"{name}.mid")
        wpath = os.path.join(tmp, f"{name}.wav")
        part.write(mpath)
        subprocess.run(["fluidsynth", "-ni", "-q", "-R", "0", "-C", "0", "-g", "0.6",
                        "-r", str(SR), "-F", wpath, SF, mpath],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        y, sr = sf.read(wpath, always_2d=True)
        assert sr == SR
    out = np.zeros((N, 2))
    n = min(N, len(y))
    out[:n] = y[:n]
    return out


print("rendering stems…")
stems = {name: render(name, p) for name, p in parts.items()}


# ---------------------------------------------------------------- synthesised layers
def t_axis(n):
    return np.arange(n) / SR


def place(buf, t, sig, gain=1.0):
    i0 = int(t * SR)
    if i0 >= len(buf) or i0 < 0:
        return
    n = min(len(sig), len(buf) - i0)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], 1)
    buf[i0:i0 + n] += sig[:n] * gain


def lp(sig, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), sig, axis=0)


def hp(sig, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), sig, axis=0)


def midi_hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def whoosh(dur=1.6, peak=0.55, bright=6000):
    n = int(dur * SR)
    t = t_axis(n)
    noise = rng.standard_normal((n, 2))
    env = np.exp(-((t / dur - peak) ** 2) / 0.035)
    # sweep a band-pass by mixing low and high passes across time
    lo = lp(noise, 600)
    hi = hp(lp(noise, bright), 1500)
    mix = lo * (1 - t / dur)[:, None] + hi * (t / dur)[:, None]
    pan = np.stack([0.5 + 0.5 * np.cos(np.pi * t / dur), 0.5 + 0.5 * np.sin(np.pi * t / dur)], 1)
    return mix * env[:, None] * pan * 0.9


def boom(dur=3.5):
    n = int(dur * SR)
    t = t_axis(n)
    f = 34 + 70 * np.exp(-t * 7)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5)
    rumble = lp(rng.standard_normal(n), 140) * np.exp(-t * 2.4) * 2.2
    return body + rumble


def riser(dur=4.0):
    n = int(dur * SR)
    t = t_axis(n)
    noise = rng.standard_normal((n, 2))
    sweep = hp(noise, 400)
    sweep = lp(sweep, 7000)
    env = (t / dur) ** 2.5
    tone = np.sin(2 * np.pi * np.cumsum(120 + 500 * (t / dur) ** 2) / SR)
    return (sweep * 0.7 + tone[:, None] * 0.25) * env[:, None]


def shimmer(dur=3.0, base=79):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for k, d in enumerate((0, 7, 12, 16, 19)):
        sig += np.sin(2 * np.pi * midi_hz(base + d) * t + k) * np.exp(-t * (1.2 + 0.3 * k))
    env = np.minimum(1, t / 0.05)
    return np.stack([sig, np.roll(sig, int(0.013 * SR))], 1) * env[:, None] * 0.12


def blip(f=1800, dur=0.09):
    n = int(dur * SR)
    t = t_axis(n)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 60) * 0.2


def electro_arp():
    """Light electronic 16th arpeggio for the innovation & climax sections."""
    out = np.zeros((N, 2))
    for bar in range(END_BAR):
        name, sec = chord_for(bar)
        if sec not in ("innovation", "climax", "pride"):
            continue
        e = ENERGY[sec]
        bass, tones = CH[name]
        seq = [tones[0] + 24, tones[2] + 12, tones[1] + 24, tones[3] + 12]
        for s in range(16):
            n = int(BEAT / 4 * 1.6 * SR)
            t = t_axis(n)
            f = midi_hz(seq[s % 4])
            saw = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 7))
            env = np.exp(-t * 14)
            note = lp(saw * env, 2600 + 2400 * e) * (0.05 + 0.04 * e) * (1.0 if s % 4 == 0 else 0.7)
            st = bar * BAR + s * BEAT / 4
            pan = 0.5 + 0.35 * np.sin(s * 0.8)
            place(out, st, np.stack([note * (1 - pan), note * pan], 1))
            # dotted-eighth delay
            place(out, st + BEAT * 0.75, np.stack([note * pan, note * (1 - pan)], 1), 0.35)
    return out


print("sound design…")
fx = np.zeros((N, 2))
for i, (sid, a, b) in enumerate(SCENES):
    if i == 0:
        continue
    if sid == HUSH_ID:
        # the handover: no impact, the room goes quiet
        place(fx, a + 0.4, shimmer(4.0, 86), 0.45)
        continue
    place(fx, a - 0.95, whoosh(1.7), 0.32)
    place(fx, a, boom(2.5)[:, None] * np.array([[1, 1]]), 0.16)
# Opening: particle birth + network burst
place(fx, 0.6, shimmer(5.0, 86), 0.9)
place(fx, scene_start[OPEN_ID] + 2.6, riser(1.6), 0.35)
place(fx, scene_start[OPEN_ID] + 4.2, boom(4.0)[:, None] * np.array([[1, 1]]), 0.38)
place(fx, scene_start[OPEN_ID] + 4.2, shimmer(4.0, 79), 0.8)
# Ecosystem reveal, climax, logo
for t, g in ((scene_start[RISE_ID], 0.32), (CLIMAX_BAR * BAR, 0.45)):
    place(fx, t - 4.0, riser(4.0), g)
    place(fx, t, boom(4.0)[:, None] * np.array([[1, 1]]), g + 0.08)
place(fx, LOGO_T - 5.0, riser(5.0), 0.5)
place(fx, LOGO_T, boom(5.0)[:, None] * np.array([[1, 1]]), 0.7)
place(fx, LOGO_T, shimmer(6.0, 79), 1.3)
# Data blips in the analytics-heavy scenes (very low level)
for sid in DATA_IDS:
    a = scene_start[sid]
    for k in range(10):
        place(fx, a + 2.0 + k * 0.9 + rng.random() * 0.3, blip(1400 + 300 * (k % 4)), 0.25)

arp = electro_arp()


# ---------------------------------------------------------------- reverb
def make_ir(seconds, predelay=0.02, damp=4500, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = t_axis(n)
    ir = r.standard_normal((n, 2)) * np.exp(-t * 6.9 / seconds)[:, None]
    ir = lp(ir, damp)
    # a few early reflections
    for d, g in ((0.011, 0.5), (0.019, 0.35), (0.027, 0.3), (0.041, 0.2)):
        k = int(d * SR)
        ir[k, 0] += g
        ir[k + 37, 1] += g * 0.9
    pd = np.zeros((int(predelay * SR), 2))
    ir = np.concatenate([pd, ir])
    return ir / np.sqrt((ir ** 2).sum())


hall = make_ir(2.8, 0.025, 5200, 3)


def reverb(x, ir, wet):
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet * 0.5) + y * wet


def db(x):
    return 10 ** (x / 20)


# Bus levels and sends (harmony-led; percussion ~5 dB under)
LEVEL = {"piano": -4, "strings": -3, "cellos": -5, "basses": -7, "pad": -7, "pizz": -4,
         "horns": -4, "brass": -9, "choir": -9, "timpani": -6, "drums": -9, "celesta": -3}
SEND = {"piano": 0.35, "strings": 0.45, "cellos": 0.3, "basses": 0.15, "pad": 0.4, "pizz": 0.3,
        "horns": 0.45, "brass": 0.4, "choir": 0.55, "timpani": 0.35, "drums": 0.18, "celesta": 0.6}

print("mixing music…")
music = np.zeros((N, 2))
for name, y in stems.items():
    y = hp(y, 35)
    if name in ("pad", "choir"):
        y = lp(y, 7000)
    y = reverb(y, hall, SEND[name]) * db(LEVEL[name])
    sf.write(os.path.join(stem_dir, f"{name}.wav"), y.astype(np.float32), SR)
    music += y
music += reverb(arp, hall, 0.3) * db(-6)
music += reverb(fx, hall, 0.25) * db(-3)

# Brightness arc (as the reference): darker and intimate at the start, opening
# up through the build, fully bright at the climax, settling warm at the end.
t = t_axis(N)
dark = lp(music, 2200, order=2)
climax_t = CLIMAX_BAR * BAR
dk = DARK_KEYS or (scene_start["why"], scene_start["performance"])
w_dark = np.interp(t, [0, dk[0], dk[1], climax_t, LOGO_T, LOGO_T + 4, TOTAL],
                   [0.75, 0.6, 0.35, 0.0, 0.0, 0.35, 0.65])
music = music * (1 - w_dark)[:, None] + dark * w_dark[:, None]

# Opening fade-in and tail fade-out
music *= np.clip(t / 1.2, 0, 1)[:, None]
music *= np.clip((TOTAL + 0.5 - t) / 4.0, 0, 1)[:, None]

# Hush: the music drops almost to silence through the handover picture and
# comes back, soft, under the first line of that scene.
if HUSH_ID:
    h0 = scene_start[HUSH_ID] + 0.3
    h1 = next(a for sid, a, b in LINES if sid == HUSH_ID) - 0.15
    hush = np.interp(t, [h0 - 0.8, h0 + 0.6, h1 - 0.5, h1 + 1.2], [1.0, 0.06, 0.06, 1.0])
    music *= hush[:, None]

# ---------------------------------------------------------------- narrator
print("processing narrator…")
vpath = os.path.join(WORK, "voice_raw.wav")
vproc = os.path.join(WORK, "voice_processed.wav")
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", vpath, "-af",
    "highpass=f=70,"
    "equalizer=f=115:t=q:w=1.1:g=2.5,"
    "equalizer=f=320:t=q:w=1.4:g=-2.5,"
    "equalizer=f=3000:t=q:w=1.2:g=1.2,"
    "equalizer=f=7500:t=q:w=1.0:g=-1.0,"
    "deesser=i=0.35:m=0.5:f=0.5,"
    "acompressor=threshold=-21dB:ratio=3:attack=6:release=120:makeup=3,"
    "alimiter=limit=0.9",
    "-ar", str(SR), "-ac", "1", vproc,
], check=True)
voice, _ = sf.read(vproc)
voice = voice[:N] if len(voice) >= N else np.pad(voice, (0, N - len(voice)))
room = make_ir(0.45, 0.008, 6500, 9)
voice2 = np.stack([voice, voice], 1)
voice2 = reverb(voice2, room, 0.12)

# ---------------------------------------------------------------- ducking
env = np.sqrt(np.convolve(voice ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same"))
active = (env > 0.02).astype(float)
# attack 120 ms, release 650 ms
g = np.zeros_like(active)
a_c = np.exp(-1 / (0.12 * SR))
r_c = np.exp(-1 / (0.65 * SR))
state = 0.0
for i in range(0, len(active), 32):  # block-wise for speed
    target = active[i]
    c = a_c if target > state else r_c
    state = target + (state - target) * (c ** 32)
    g[i:i + 32] = state
duck = db(-5.0 * g)
music_ducked = music * duck[:, None]

# ---------------------------------------------------------------- master
mix = music_ducked * db(6.0) + voice2 * db(3.5)
spk = g > 0.9
v_rms = np.sqrt(np.mean((voice2 * db(3.5))[spk] ** 2))
m_rms = np.sqrt(np.mean((music_ducked * db(6.0))[spk] ** 2))
print(f"voice over music during speech: {20 * np.log10(v_rms / m_rms):.1f} dB")
# gentle glue: soft-knee saturation then normalise
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4)
mix_path = os.path.join(WORK, "mix_pre.wav")
sf.write(mix_path, mix.astype(np.float32), SR)

out_mp3 = os.path.join(ROOT, args.out)
subprocess.run([
    "ffmpeg", "-y", "-v", "error", "-i", mix_path, "-af",
    "loudnorm=I=-16:TP=-1.2:LRA=7", "-ar", str(SR), "-b:a", "256k", out_mp3,
], check=True)
music_json = {
    "bpm": BPM,
    "barFrames": BAR * FPS,
    "logoHitFrame": round(LOGO_T * FPS),
    "climaxFrame": round(CLIMAX_BAR * BAR * FPS),
}
json.dump(music_json, open(os.path.join(FILM, "music.json"), "w"), indent=2)
print("wrote", out_mp3, music_json)
