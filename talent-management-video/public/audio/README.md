# Audio assets

Drop the finished tracks in this folder and pass their file names as composition props:

| File | Prop | Notes |
|------|------|-------|
| `music.mp3` | `musicFile` | Cinematic soundtrack. Automatically faded in over 2 s and out over the last 6 s. See the music brief in `../../VOICEOVER-SCRIPT.md`. |
| `voiceover.mp3` | `voiceFile` | Narrator track recorded against the timing sheet. |

Example render with both tracks and the on-screen narration captions turned off:

```bash
npx remotion render TalentManagement out/talent-management.mp4 \
  --props='{"musicFile":"music.mp3","voiceFile":"voiceover.mp3","subtitles":false}'
```

Leave a prop empty (`""`) to render without that track.
