# Recording & Embedding Demo GIFs  
_Quick recipe for turning a macOS screen‑capture into a lightweight looping GIF for your README._

---

## 1 — Record the screencast (macOS)

1. Press **⌘ ⇧ 5** to open the capture toolbar.
2. Click **Record Selected Portion** (third icon).
3. Drag to draw the capture box around the browser window or UI area you want to showcase.
4. Click **Record** (or hit **Return**) to start.
5. Perform the demo—aim for **≤ 20 seconds**.
6. Stop recording via the menu‑bar ● icon or **⌘ ⌃ Esc**.  macOS saves `screencast.mov` to **~/Downloads** by default.

> **Tip** Keep the mouse still between actions; this helps the next step drop redundant frames.

---

## 2 — (Optional) Trim the clip

QuickTime Player → **⌘ T** → save as `screencap.mov`, **or** run:

```bash
ffmpeg -ss 3 -to 13 -i screencast.mov -c copy screencap.mov
```

---

## 3 — Convert MOV → optimised GIF

Install the tools once (Homebrew):

```bash
brew install ffmpeg gifsicle
```

Then run the two‑pass conversion (replace filenames if needed):

```bash
cd ~/Downloads

# pass 1 — build a palette & drop duplicate frames
ffmpeg -i screencap.mov \
       -vf "mpdecimate,fps=12,scale=720:-1:flags=lanczos,palettegen" \
       -y palette.png

# pass 2 — encode the GIF using that palette
ffmpeg -i screencap.mov -i palette.png \
       -lavfi "mpdecimate,fps=12,scale=720:-1:flags=lanczos [v]; [v][1:v] paletteuse" \
       -loop 0 -y screencap.gif
```

Finish with a lossless squeeze:

```bash
gifsicle -O3 --colors 256 screencap.gif -o screencap-opt.gif
```

### Why these flags?
| Filter / flag | Purpose |
|---------------|---------|
| `mpdecimate`  | Removes near‑identical frames so only the *interesting* ones remain |
| `fps=12`      | Half the framerate of cinema but still smooth for UI demos |
| `scale=720:-1`| Resizes to 720 px wide, preserving aspect ratio (use 600 px if you need an even smaller file) |
| `palettegen / paletteuse` | Two‑pass trick—best 256 colours, crisp gradients |
| `-loop 0`     | Makes the GIF loop forever |

---

## 4 — Embed in your README

```markdown
![DomSwitch demo](docs/screencap-opt.gif)
```

For high‑DPI viewers add a high‑res MP4:

```markdown
[Watch crisp MP4](docs/screencap.mp4)
```

---

## 5 — Housekeeping cheatsheet

| Recommendation | Reason |
|----------------|--------|
| Keep runtime **≤ 20 s** | Faster encoding and playback |
| Aim for **≤ 5 MB** GIF  | GitHub READMEs load quickly |
| Hide the macOS cursor when idle | Reduces visual noise |
| Record at "Retina" scaling | Crisper text without bloating dimensions |

---

### One‑click alternatives

* **Kap.app** – record → export optimised GIF / MP4 / WebM.
* **Gifski** – drag‑and‑drop UI that wraps `ffmpeg` + palette magic.
* **ScreenToGif** (Windows) – similar all‑in‑one tool if you ever switch platforms.

---

Happy screencasting!  Commit your new `demo.gif`, push, and let everyone see your extension in action.

