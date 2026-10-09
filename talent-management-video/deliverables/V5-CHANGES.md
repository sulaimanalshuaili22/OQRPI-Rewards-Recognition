# OQ RPI Talent Management film: v5 "The Handover"

v5 is the panel's restructure: one story in four acts, about three minutes, built on real OQ RPI photography and footage instead of a computer-generated world. It responds to `V4-EXPERT-PANEL-REVIEW.md`. v4 is untouched. Its compositions (`TalentManagement`, `TalentManagement-4K`), script, timeline and soundtrack still render exactly as before.

| | |
|---|---|
| **Video** | `deliverables/OQRPI-Talent-Management-v5-1080p.mp4` |
| **Subtitles** | `deliverables/OQRPI-Talent-Management-v5.en.srt` (every narration line) |
| **Narration sheet** | `VOICEOVER-SCRIPT-v5.md` (timecodes for a human narrator) |
| **Running time** | 3:02 (5,460 frames at 30 fps), down from 4:39 |
| **Compositions** | `TalentManagement-v5` (1080p), `TalentManagement-v5-4K` |
| **Source** | `src/v5/` (script, timeline, kit, lights, film) |

## The structure

| Act | Time | What happens |
|---|---|---|
| **I · The stakes** | 0:00–0:37 | Cold open on a control-room operator: *"There are 309 roles in this company that can never be empty. Not for a week. Not for a night."* The title card follows. Then **309 Lights**: one light for every critical role switches on across the real plant at night, and the three questions the business cannot get wrong. |
| **II · The system** | 0:37–2:14 | The programmes appear as four movements instead of ten chapters. **01 KNOW** (نعرف): an honest conversation, 680 reviews, leaders in one room, **43 ready today**. **02 GROW** (نطوّر): MASAR (237), ROBBAN (24, with CCL) and secondments. **03 SECURE** (نضمن): the same night plate returns and **132 of the 309 lights turn OQ orange** (named successors); then nationalization (242 by 2030, the expert stays on as mentor, 99 already named). **04 SUSTAIN** (نحافظ): recognition (1,369), the Command Center live, and **a question asked in Arabic, answered in Arabic**. |
| **III · The proof** | 2:14–2:37 | Continuity, Leadership and National talent, each with its status chip. Then **177**, the critical roles still to cover: "the work ahead". |
| **IV · The handover** | 2:37–end | The music drops almost to silence over a leader pointing a successor the way. Dawn over the plant: *"The future is not built by systems."* Real faces: *"It is built by people."* A clean bilingual end card. |

## Part A defects (from the panel review)

| # | Defect in v4 | v5 |
|---|---|---|
| A1 | Title card illegible under particles | ✅ The title sits on a darkened real plate with no particles, and nothing else is on screen while it shows. |
| A2 | Kinetic words collide and clip | ✅ Removed. Every text block sits inside a 10% safe area (`SX`/`SY` in `src/v5/kit.tsx`). |
| A3–A5 | Labels clipped at the frame edge | ✅ Removed. There are no 3D-anchored labels; all type is laid out in the safe area. |
| A6 | "Smeared" third worker (2:51) | ✅ The plate is cropped to the two engineers. **Correction to the review:** it is a reflection in the glass, present in the original photograph, not an AI artefact. |
| A7 | 9-Box shows "Exit company" / "Exit current role" | ✅ The 9-Box is front-on and readable. Only the "Ready now" cell is lit; no other cell shows a name, count or action. |
| A8 | Title duplicated by caption | ✅ Lines shown as on-screen titles (the three questions; all of Act IV) are not repeated as burned-in captions. The SRT still carries every line. |
| A9 | Particles behind the end-card logo | ✅ The end card has a clean navy background, the logo, *Building tomorrow's talent, together*, and its Arabic. |
| A10 | Data cards at 9–12 px | ✅ The type floor is 32 px body, 26 px bold labels and 24 px source lines. Hero numbers are 110–260 px. One idea per panel. |
| A11 | "A named successor for every role we nationalize" overclaims | ✅ The line is replaced. The film now says **242 roles planned by 2030**, **with each expert staying on as a mentor**, and **99 Omani successors already named**, all shown on screen. |
| A12 | 306 used for two different things | ✅ 306 does not appear in v5. |
| A13 | 45% high-potential headline | ✅ The hero number is **43 ready today**. 306 is not shown. |
| A14 | 237 vs 238 MASAR; 272 places | ✅ v5 shows only **237 MASAR alumni (2023–2025)**. "272 places" is not used. The data-file mismatch itself still needs reconciling by the owner (see sign-off). |

## Transformation plan items

| Review item | v5 | Notes |
|---|---|---|
| 3:00 hero cut | ✅ | 3:02 |
| Four movements instead of ten chapters | ✅ | Know · Grow · Secure · Sustain |
| Specific opening line | ✅ | "There are 309 roles in this company that can never be empty." |
| Cut the 36-word Command Center list sentence and the repeat cycle walk | ✅ | The ecosystem is now *shown* once, as a live Command Center with six numbers. |
| Replace both CG-refinery sections with real footage | ✅ | v5 has no 3D world at all. Every background is OQ RPI photography or footage. |
| Retire the DNA helix, particle clouds and Tron grid | ✅ | None remain. |
| The OQ stripes as the single motion signature | ✅ | Orange, silver and turquoise stripes wipe every scene change and close the end card. |
| "309 Lights" signature moment | ✅ | The lights sit on the real night photograph. Positions are illustrative; the count is real. 132 turn orange in Act II. |
| "Ask it in Arabic" | ✅ | كم عدد القادة الجاهزين اليوم؟ → ٤٣ قائدًا جاهزون اليوم، وفق مراجعة المواهب ٢٠٢٦, with an English gloss on screen. |
| Silence before the closing line | ✅ | `score.py` now has a "hush" (`music.hush` in `src/v5/script.json`). The music falls to about −24 dB for the handover picture and returns under the line. There is no impact on that cut. |
| Hero number "43 ready today" | ✅ | |
| Name the work ahead (132/309 framed as a plan) | ✅ | "The remaining 177 critical roles are the work ahead." **Needs sign-off.** |
| Bilingual titles and end card | ✅ | Movement names and the end-card line are in Arabic. **Needs native-speaker review.** |
| Captions as a separate SRT | ✅ | `tools/srt.py`. Captions are also balanced and never overlap. |
| LED-safe layout (10% margins) | ✅ | |
| Leave-behind detail moved off screen | ✅ | Bench depth, programme pathway and the yearly roadmap role cards are no longer in the film. |
| Professional human narrator | ❌ Not possible here | The narrator is still the Kokoro synthetic voice. `VOICEOVER-SCRIPT-v5.md` is ready for a recording session. Swapping in a human read is a re-mix and a re-render (steps in that file). **This is the largest remaining quality gap.** |
| Licensed or recorded score | ❌ Not possible here | Still the procedurally composed score (General MIDI soundfont). The stems and the hush are ready for a licensed track to be cut to the same landmarks (`src/v5/music.json`). |
| CEO / VP on camera (8–12 s) | ❌ Needs a shoot | No placeholder is rendered. The natural slot is between Act III and Act IV. |
| A real, consenting protagonist; the mentor–successor pair; the calibration room; "The Two Hands" | ❌ Needs a shoot | v5 uses the closest real photographs: two engineers planning over a tablet ("we plan every handover") and a leader pointing a successor the way (the handover). |
| Outcome metrics with targets (internal fill rate, high-potential retention, coverage target) | ❌ Needs data | Not in the Command Center data used by the film. No figure was invented. |
| Arabic narration version | ❌ Needs a human Arabic narrator | The timecodes are the same as the English version. |
| 90 s opener, 30 s loop, 4K master | ◻ Not rendered | `TalentManagement-v5-4K` exists. Shorter cuts need an editorial decision on what to drop. |

## What v5 deliberately does not show

- No "illustrative employee" journey. The film follows a role and real groups of people, not an invented individual.
- No 9-Box action notes, low-box counts or category names.
- No secondment count (9 is small at board level). The film shows where people go instead.
- Not every programme detail. The film proves the system with six numbers and leaves the detail to the Command Center.

## Technical

| Check | Result |
|---|---|
| Narration | Kokoro, same voice blend and lexicon as v4. Numbers are given to the voice as words. Speech is 70% of the running time (v4: 76%). |
| Voice over music | 12.4 dB during speech |
| Loudness | Integrated −15.9 LUFS (target −16), LRA 4.5 LU, true peak −2.6 dBTP (limit −1) |
| Type check and lint | Both pass (`tsc --noEmit`, `eslint src/v5`). |
| Render | 1080p on CPU (no WebGL in v5), about 18½ (master), then a two-pass encode to 92 MB minutes on 4 cores. |
| Frame review | The whole film was reviewed at 2.5 s intervals, and 17 key frames at full resolution. This review found and fixed a stacking bug that hid the end-card text and dimmed the title card. |
| Transcript check | Not run: the speech-recognition model download is blocked by this environment's network policy. Every number is spelled out in the voice script. |

## Needs confirmation by OQ RPI before showing

1. **The new script** (all of it, especially the cold open, "The remaining 177 critical roles are the work ahead", and "with each expert staying on as a mentor", which v4 showed on the roadmap cards but never said aloud).
2. **Showing 132 of 309 and the 177 gap** to the intended audience, internal and external.
3. **Arabic copy**: نعرف · نطوّر · نضمن · نحافظ, the Talent Assistant question and answer, and نبني مواهب الغد، معًا. These need native-speaker and Corporate Communications review.
4. **The Talent Assistant exchange** is a re-creation of the kind of answer the assistant gives, not a screen recording. Replace it with a real capture if possible.
5. **Status chips**: ROBBAN 2026 is IN PLACE (the cohort ran 4–8 Oct 2026, after the 30 Sep data date). MASAR is DELIVERED. The 242 plan is PLAN. 99 named successors are IN PLACE.
6. **Data-file reconciliation**: `masar.alumni` 237 vs `masarPlaces` 238, and the yearly participation total vs 272 places. Neither is shown, but fix them before the data is reused.
7. **Secondment hosts** shown: OQ SAOC, OQ8, OPAL, Council of Ministers, Oman Vision 2040.
8. **Photo consent** for every person on screen, and **brand-guideline compliance** (unchanged from v4).
