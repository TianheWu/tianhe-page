Personal research homepage of Tianhe Wu: https://tianhewu.github.io/tianhe-page/

Buildless HTML, CSS, and JavaScript, compatible with the existing GitHub Pages deployment. The original homepage was based on [Jon Barron's academic website](https://jonbarron.info/).

## Preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. The page also works directly from `index.html`, including its embedded citation snapshot. All publications remain readable when JavaScript is disabled.

## Edit content

- Biography, news, experience, and education: `index.html`.
- Appearance and fixed desktop layout: `stylesheet.css`.
- Publications: `data/publications.json`, then run `python3 scripts/render_publications.py`.
- Portrait: `images/profile/photo.jpg` (the supplied waterfront photo).
- Keep publication IDs stable: citation records and direct paper links use them.

The renderer owns only the block between `publications:start` and `publications:end`. It preserves the rest of the page. Author strings may contain trusted `<strong>` / `<sup>` markup.

## Proportional layout

The page keeps one 1280px desktop canvas with 1120px of content. `layout.js` fits that canvas proportionally to the available layout viewport, capped at its original size on larger screens. Text, images, spacing, and columns scale together without breakpoint-driven rearrangement or horizontal overflow. CSS `zoom` also scales document height, so expanding news or switching publication filters does not leave a blank tail. The script runs before visible content and responds to window/viewport width changes. Mobile pinch-to-zoom remains available because fitting uses the layout viewport rather than the visual viewport. Print disables the fit and uses a separate layout.

## Google Scholar citations

`data/citations.json` stores real counts from [the public Scholar profile](https://scholar.google.com/citations?user=QW1JtysAAAAJ&hl=en). Every record includes its source article URL and last successful retrieval time. Counts are refreshed daily, not live on every visitor request.

```bash
python3 scripts/update_citations.py
python3 scripts/render_publications.py
python3 -m unittest discover -s tests
```

The workflow `.github/workflows/update-citations.yml` runs once daily at 06:23 Asia/Shanghai (22:23 UTC) and supports manual runs from GitHub Actions. It commits only the citation cache and regenerated publication block to `master`. It uses the repository's built-in `GITHUB_TOKEN`; no API key or paid service is needed. Repository rules must allow this workflow to write to `master`. If Actions is disabled, scheduled updates will not run; GitHub may also disable scheduled workflows after extended repository inactivity.

Google Scholar can block automated requests and [does not offer bulk access](https://scholar.google.com/intl/en/scholar/help.html). The updater makes one request per run, fails visibly on blocked/malformed responses, and preserves previous counts. It never turns an unmatched paper or a failed request into a zero. A blank citation cell in a successfully parsed Scholar article row represents zero citations. Papers are matched by normalized exact titles; two explicitly documented title aliases cover Scholar's Qwen-Image-Flash title and DP2O-SR formatting. Ambiguous matches preserve the previous record. Each paper retains its own timestamp; data older than seven days is labeled cached.

The page embeds the last verified counts in HTML and refreshes them from the JSON cache. On `tianhewu.github.io`, it also reads the public raw GitHub cache because commits made by `GITHUB_TOKEN` do not trigger another Pages build. Local previews never request the production cache. Future custom domains should be added to the production-host condition in `site.js`.

To import a public profile saved manually as HTML, run `python3 scripts/update_citations.py --html /path/to/profile.html`, then rerender. No alternate citation provider is presented as Google Scholar.
