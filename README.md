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

## Research reel image credits

The WebP covers in `images/reel/` are cropped from the associated papers. For image-quality work, the photographs are images under assessment. Each linked paper includes the full figure, caption, and experimental context.

| Cover | Image in the paper | Source |
| --- | --- | --- |
| Prune to Expand | Hikers at a mountain lake, generated with the enhanced prompt | [Fig. 1](https://arxiv.org/pdf/2611.27229v1#page=1) |
| VisualQuality-R1 | Concert photograph used for quality scoring and description | [Fig. 1](https://arxiv.org/pdf/2505.14460#page=1) |
| A-FINE | Flowers from the SRIQA-Bench comparison interface | [Fig. 9](https://arxiv.org/pdf/2503.11221#page=14) |
| Assessor360 | Panoramic beach scene used as the assessment input | [Fig. 2](https://arxiv.org/pdf/2305.10983#page=4) |
| Tool-IQA | Low-light waterfront example from the visibility comparison | [Fig. 1](https://arxiv.org/pdf/2606.16082#page=2) |
| Qwen-Image-Bench | Sailing ship example from the benchmark overview | [Fig. 1](https://arxiv.org/pdf/2605.28091#page=3) |
| S2L-PO | Standard GRPO and small-to-large rollout diagrams | [Fig. 1](https://arxiv.org/pdf/2605.30789#page=2) |
| ME-IQA | Underwater dolphin image from the model comparison | [Fig. 1](https://arxiv.org/pdf/2603.20785#page=2) |
| Mix-GRM | Ablation charts for aggregation scale and principle selection | [Fig. 4](https://arxiv.org/pdf/2603.01571v1#page=8) |
| Perceptual Optimization and Assessment | Cat-eye detail from the super-resolution comparison | [Fig. 2](https://arxiv.org/pdf/2509.20878#page=2) |
| MLLMs for Image Quality Assessment | Butterfly from the visual-attribute examples | [Fig. 1](https://arxiv.org/pdf/2403.10854#page=1) |
| AHIQ | Parrot input from the model overview | [Fig. 2](https://arxiv.org/pdf/2204.10485#page=3) |
| MANIQA | Chair photograph and a spatial weighting map | [Fig. 8](https://arxiv.org/pdf/2204.08958#page=8) |
| Qwen-Image-Layered 1.5 | Summer poster with its six transparent layers, rearranged from the opening figure | [Fig. 1](https://aclanthology.org/2026.emnlp-main.2409.pdf#page=1) |
| Qwen-Image-Flash | Seagull being fed at the shore from the four-step showcase | [Fig. 1](https://arxiv.org/pdf/2606.03746#page=1) |
| DP-DMD | Colorful building from the four-step generation results | [Fig. D](https://arxiv.org/pdf/2602.03139#page=19) |
| Qwen-Image-2.0-RL | Lighthouse generated using a pairwise aesthetic reward | [Fig. 2](https://arxiv.org/pdf/2606.27608#page=4) |
| Qwen-Image-Agent | Cars on an exhibition stand from the generation showcase | [Fig. 1](https://arxiv.org/pdf/2606.26907#page=1) |
| Qwen-RobotWorld | Robotic hand from the opening illustration | [Page 1](https://arxiv.org/pdf/2606.17030#page=1) |
| Qwen-Image-VAE-2.0 | Bald eagle generated by SiT using the VAE | [Fig. 4](https://arxiv.org/pdf/2605.13565#page=11) |
| Qwen-Image-2.0 | Tiger from the photorealistic generation showcase | [Fig. 2](https://arxiv.org/pdf/2605.10730#page=2) |
| Hybrid Forcing | Swimmer frame from the five-second video generated by Hybrid Forcing | [Fig. 3](https://arxiv.org/pdf/2604.10103#page=12) |
| DP2O-SR | Dragonfly from the DP²O-FLUX restoration comparison | [Fig. 6](https://arxiv.org/pdf/2510.18851#page=10) |
