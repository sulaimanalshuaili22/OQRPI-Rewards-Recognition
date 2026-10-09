# OQ RPI Talent Management, v5 "The Handover": narration script and timing sheet

**Running time:** 3:02.0 at 30 fps. The picture is cut to these timecodes.

**Delivery:** a human documentary read: calm, certain, warm. Let the numbers land; do not sell them.
Two moments need silence around them and must not be rushed:

- the cold open ("Not for a week. Not for a night."), and
- Act IV: the music drops away for about four seconds before "The future is not built by systems.", and the read
  should leave a full beat before "It is built by people."

**Numbers are read as words:** 309 "three hundred and nine", 680 "six hundred and eighty", 43 "forty-three",
237 "two hundred and thirty-seven", 24 "twenty-four", 132 "one hundred and thirty-two", 242 "two hundred and forty-two",
99 "ninety-nine", 1,369 "one thousand, three hundred and sixty-nine", 177 "one hundred and seventy-seven",
2023 "twenty twenty-three", 2030 "twenty thirty".

**Pronunciation (no exceptions):**
- **OQ RPI**: one smooth company name, "Oh-Q R-P-I", stress on the final **I**.
- **ROBBAN**: "ROH-bahn". **MASAR**: "Ma-SAAR".

| Scene | Starts | Ends | Line |
|---|---|---|---|
| I · The stakes | 0:03.2 | 0:07.8 | There are 309 roles in this company that can never be empty. |
| I · The stakes | 0:08.5 | 0:11.5 | Not for a week. Not for a night. |
| I · 309 lights | 0:16.3 | 0:19.6 | Each one keeps this plant safe, running and performing. |
| I · 309 lights | 0:20.5 | 0:28.1 | Talent Management at OQ RPI exists to answer three questions the business cannot afford to get wrong. |
| I · 309 lights | 0:28.7 | 0:35.1 | Which roles matter most? Who is ready to take them? And what must we build before we need it? |
| II · Know | 0:39.5 | 0:45.3 | It starts with an honest conversation: 680 performance reviews this year. |
| II · Know | 0:45.9 | 0:50.7 | Then, once a year, our leaders sit in one room and decide who will lead us next. |
| II · Know | 0:51.3 | 0:53.7 | Today, 43 are ready to step up. |
| II · Grow | 0:58.3 | 0:59.5 | Then we build them. |
| II · Grow | 1:00.0 | 1:10.5 | 237 leaders through MASAR since 2023. 24 more in ROBBAN this October, with the Center for Creative Leadership. |
| II · Grow | 1:11.1 | 1:16.5 | And secondments across OQ and national institutions bring new capability home. |
| II · Secure | 1:19.7 | 1:21.8 | And we plan every handover. |
| II · Secure | 1:22.4 | 1:34.5 | 132 of our 309 critical roles already have a named successor. Named is not the same as ready: readiness is confirmed in the Talent Review. |
| II · Secure | 1:35.3 | 1:46.0 | By 2030, 242 roles held today by international experts are planned to be led by Omanis, with each expert staying on as a mentor. |
| II · Secure | 1:46.5 | 1:50.2 | 99 Omani successors are already named. |
| II · Sustain | 1:53.6 | 2:01.7 | When people go above and beyond, we notice: 1,369 recognitions in eight months. |
| II · Sustain | 2:02.5 | 2:07.5 | All of it lives in one place, the Talent Command Center, live for every leader. |
| II · Sustain | 2:08.1 | 2:11.8 | Ask it a question, in English or in Arabic, and it answers. |
| III · The proof | 2:15.8 | 2:19.2 | This is the capability OQ RPI is building. |
| III · The proof | 2:19.8 | 2:28.7 | Continuity for the roles that matter most. Leaders ready before they are needed. And Omani talent at the heart of the business. |
| III · The proof | 2:29.6 | 2:34.6 | The remaining 177 critical roles are the work ahead. |
| IV · The handover | 2:40.8 | 2:43.2 | The future is not built by systems. |
| IV · The handover | 2:44.3 | 2:45.8 | It is built by people. |
| IV · The handover | 2:47.8 | 2:53.0 | OQ RPI Talent Management. Building tomorrow's talent, together. |

## Recording a human narrator

1. Record each line wild, then lay the takes against the starts above in `audio-src/v5/voice_raw.wav` (48 kHz mono).
2. Adjust the `start`/`end` frames in `src/v5/timeline.json` to the new read if a line runs longer.
3. Re-mix: `.venv/bin/python tools/score.py --film src/v5 --work audio-src/v5 --out public/audio/soundtrack-v5.mp3`.
4. Re-render `TalentManagement-v5`. Captions and the SRT (`tools/srt.py`) follow the timeline.

## Arabic narration

An Arabic voice version needs a human Arabic narrator and a native-speaker review of the on-screen Arabic
(movement names, the Talent Assistant exchange, the end-card line). Record against the same timecodes.
