#!/usr/bin/env python3
"""Render publication data to static, searchable HTML; no client framework needed."""
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START, END = "<!-- publications:start -->", "<!-- publications:end -->"


def render():
    papers = json.loads((ROOT / "data/publications.json").read_text())
    articles = []
    for index, paper in enumerate(papers):
        group = "selected" if index < 3 else "reports" if index < 8 else "other"
        venue_class = "paper-venue is-preprint" if paper["venue"].startswith("Preprint") else "paper-venue"
        links = "".join(f'<a href="{escape(link["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(link["label"])} <span aria-hidden="true">↗</span></a>' for link in paper["links"])
        articles.append(f'''        <article class="paper" id="paper-{paper['id']}" data-group="{group}">
          <a class="paper-figure" href="{escape(paper['links'][0]['url'], quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="Read {escape(paper['title'], quote=True)}">
            <img src="{paper['image']}" alt="Research figure for {escape(paper['title'], quote=True)}" loading="lazy" decoding="async" width="600" height="360">
          </a>
          <div class="paper-content">
            <div class="paper-meta"><span class="{venue_class}">{escape(paper['venue'])}</span>{'<span class="paper-distinction">Selected work</span>' if index < 3 else ''}</div>
            <h3><a href="{escape(paper['links'][0]['url'], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(paper['title'])}</a></h3>
            <p class="paper-authors">{paper['authors']}</p>
            <p class="paper-summary">{escape(paper['summary'])}</p>
            <div class="paper-links">{links}</div>
          </div>
        </article>''')
    path = ROOT / "index.html"
    source = path.read_text()
    before, rest = source.split(START)
    _, after = rest.split(END)
    path.write_text(before + START + "\n" + "\n".join(articles) + "\n        " + END + after)
    print(f"Rendered {len(papers)} publications")


if __name__ == "__main__":
    render()
