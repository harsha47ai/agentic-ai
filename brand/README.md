# Brand — "learn with harsha"

Slide theme used by every episode deck, derived from the Video Call Kit design.

- Wordmark: `learn with harsha` + orange square, lowercase, Geist 600, tight letter-spacing
- Type: **Geist** (sans) · **IBM Plex Mono** (code, kickers, footers). Install both for the decks to render as designed: https://vercel.com/font · https://fonts.google.com/specimen/IBM+Plex+Mono
- Colours: orange `#FF5700` · ink `#1C1C1C` · grey `#6B7280` / `#919191` · line `#E5E5E5` · black `#111111`
- Motifs: faint 64 px grid; 3×3 square block with one orange square
- Slides: black cover and closing, white content slides, code on `#111111`

`theme.js` is the pptxgenjs helper (`make(pres)` → cover / light / closing / card / code …). Regenerate a deck with `node episodes/<ep>/slides/build.js` once you drop the episode script next to it.
