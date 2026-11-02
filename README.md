Personal research homepage of Tianhe Wu: https://tianhewu.github.io/tianhe-page/

Buildless HTML, CSS, and JavaScript, compatible with the existing GitHub Pages deployment. The original homepage was based on [Jon Barron's academic website](https://jonbarron.info/).

## Preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. The page also works directly from `index.html`. All publications remain readable when JavaScript is disabled.

## Edit content

- Biography, news, experience, and education: `index.html`.
- Appearance and fixed desktop layout: `stylesheet.css`.
- Publications: `data/publications.json`, then run `python3 scripts/render_publications.py`.
- Portrait: `images/profile/photo.jpg` (the supplied waterfront photo).
- Keep publication IDs stable: direct paper links use them.

The renderer owns only the block between `publications:start` and `publications:end`. It preserves the rest of the page. Author strings may contain trusted `<strong>` / `<sup>` markup.

## Proportional layout

The page keeps one 1280px desktop canvas with 1120px of content. `layout.js` fits that canvas proportionally to the available layout viewport, capped at its original size on larger screens. Text, images, spacing, and columns scale together without breakpoint-driven rearrangement or horizontal overflow. CSS `zoom` also scales document height, so expanding news or switching publication filters does not leave a blank tail. The script runs before visible content and responds to window/viewport width changes. Mobile pinch-to-zoom remains available because fitting uses the layout viewport rather than the visual viewport. Print disables the fit and uses a separate layout.

## Typography and Scholar links

The desktop layout uses 17px body text, 23px paper titles, 16px paper summaries, and 14px author and resource links. All typography scales with the existing proportional layout.

Google Scholar profile links remain available in the introduction and research header. Per-paper citation counts and the automated refresh workflow have been removed because Scholar blocked refresh requests; the page does not display cached or stale counts.
