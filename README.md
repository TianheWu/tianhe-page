Personal research homepage of Tianhe Wu: https://tianhewu.github.io/tianhe-page/

Buildless HTML, CSS, and JavaScript, compatible with the existing GitHub Pages deployment. The original homepage was based on [Jon Barron's academic website](https://jonbarron.info/).

## Preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. The page also works directly from `index.html`. All publications remain readable when JavaScript is disabled.

## Edit content

- Biography, news, projects, experience, and education: `index.html`.
- Appearance and fixed desktop layout: `stylesheet.css`.
- Publications: `data/publications.json`, then run `python3 scripts/render_publications.py`.
- Portrait: `images/profile/photo.jpg` (the supplied waterfront photo).
- Keep publication IDs stable: direct paper links use them.

The renderer owns only the block between `publications:start` and `publications:end`. It preserves the rest of the page. Author strings may contain trusted `<strong>` / `<sup>` markup.

## Projects

The Projects section sits between News and Research. The Seedream 5.5 entry pairs an official benchmark on the left with generated examples on the right, with the project name and [official project link](https://seed.bytedance.com/seedream5_5) above them. It does not include personal contribution text. The benchmark is reproduced unchanged from the [official technical blog](https://seed.bytedance.com/en/blog/more-realistic-images-more-stable-editing-across-100-rounds-introducing-seedream-5-5), with its original labels and values. Clicking it opens the full-resolution chart.

The three generation examples in `images/projects/seedream5_5/` are web-sized JPEG copies of official showcase images, displayed without cropping. Original AI labels are retained, and the gallery credits ByteDance Seed and links to its showcase. Sources:

- `street-colors.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-008-cfc4e0dc-l.webp
- `street-portrait.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-009-a2c2dca4-l.webp
- `evening-bistro.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-010-ac6278fc-l.webp
- `quality-benchmark.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/4xfa4mw8m342o.jpg

## Proportional layout

The page keeps one 1280px desktop canvas with 1120px of content. `layout.js` fits that canvas proportionally to the available layout viewport, capped at its original size on larger screens. Text, images, spacing, and columns scale together without breakpoint-driven rearrangement or horizontal overflow. CSS `zoom` also scales document height, so expanding news or switching publication filters does not leave a blank tail. The script runs before visible content and responds to window/viewport width changes. Mobile pinch-to-zoom remains available because fitting uses the layout viewport rather than the visual viewport. Print disables the fit and uses a separate layout.

## Typography and Scholar links

The desktop layout uses 17px body text, 23px paper titles, 16px paper summaries, and 14px author and resource links. All typography scales with the existing proportional layout.

Google Scholar profile links remain available in the introduction and research header. Per-paper citation counts and the automated refresh workflow have been removed because Scholar blocked refresh requests; the page does not display cached or stale counts.
