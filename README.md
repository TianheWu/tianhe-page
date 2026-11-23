Personal research homepage of Tianhe Wu: https://tianhewu.github.io/tianhe-page/

Buildless HTML, CSS, and JavaScript, compatible with the existing GitHub Pages deployment. The original homepage was based on [Jon Barron's academic website](https://jonbarron.info/).

## Preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. The page also works directly from `index.html`. All publications remain readable when JavaScript is disabled.

## Edit content

- Biography, news, projects, experience, and education: `index.html`.
- Appearance and proportional page layout: `stylesheet.css`.
- Curved research gallery: `research-reel.js` and `research-reel.css`. The gallery reads the rendered paper metadata. Each record has a category, a short title, and a WebP cover in `images/reel/<id>.webp`. Array order defines each collection’s sequence.
- Publications: `data/publications.json`, then run `python3 scripts/render_publications.py`.
- Portrait: `images/profile/photo.jpg` (the supplied waterfront photo).
- Keep publication IDs stable: direct paper links use them.

The renderer owns only the block between `publications:start` and `publications:end`. It preserves the rest of the page. Author strings may contain trusted `<strong>` / `<sup>` markup.

## Projects

The Projects section sits between News and the publication index. The Seedream 5.5 entry pairs an official benchmark on the left with generated examples on the right, with the project name and [official project link](https://seed.bytedance.com/seedream5_5) above them. It does not include personal contribution text. The benchmark is reproduced unchanged from the [official technical blog](https://seed.bytedance.com/en/blog/more-realistic-images-more-stable-editing-across-100-rounds-introducing-seedream-5-5), with its original labels and values. Clicking it opens the full-resolution chart.

The three generation examples in `images/projects/seedream5_5/` are web-sized JPEG copies of official showcase images, displayed without cropping. Original AI labels are retained, and the gallery credits ByteDance Seed and links to its showcase. Sources:

- `street-colors.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-008-cfc4e0dc-l.webp
- `street-portrait.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-009-a2c2dca4-l.webp
- `evening-bistro.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/bdeh7uhpsuht/sd55-010-ac6278fc-l.webp
- `quality-benchmark.jpg`: https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/4xfa4mw8m342o.jpg

## Proportional layout

The page keeps one 1280px desktop canvas with 1120px of content. `layout.js` fits that canvas proportionally to the available layout viewport, capped at its original size on larger screens. The biography, projects, and publication index scale together. The research gallery has its own responsive controls. CSS `zoom` also scales document height, so expanding news or switching publication filters does not leave a blank tail. The script runs before visible content and responds to window/viewport width changes. Mobile pinch-to-zoom remains available because fitting uses the layout viewport rather than the visual viewport. Print disables the fit and uses a separate layout.

## Typography and Scholar links

The desktop layout uses 17px body text, 23px paper titles, 16px paper summaries, and 14px author and resource links. The publication index uses the proportional page layout. Below 760px, the filmstrip uses viewport-sized text and touch controls.

Google Scholar profile links remain available in the introduction and research header. Per-paper citation counts and the automated refresh workflow have been removed because Scholar blocked refresh requests; the page does not display cached or stale counts.

## Publication figures

The publication index uses the source file listed in each record’s `image` field in `data/publications.json`. The research reel uses the same full composition in `images/reel/<id>.webp`. To update a reel cover, export the entire source image to WebP at up to 1280 pixels wide, retaining its aspect ratio, margins, annotations, and transparency.

Prune to Expand uses the author-supplied six-pair comparison in `images/prune-to-expand/teaser.png`. Each pair shows an original prompt on the left and its enhanced version on the right. [Prune to Expand, Figure 1](https://arxiv.org/pdf/2611.27229v1#page=1)

Qwen-Image-Layered 1.5 shares one WebP file between the index and the reel. The poster and its six separated layers come from the opening figure. [Qwen-Image-Layered 1.5, Figure 1](https://aclanthology.org/2026.emnlp-main.2409.pdf#page=1)
