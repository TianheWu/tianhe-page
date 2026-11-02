#!/usr/bin/env python3
"""Render publication data to static, searchable HTML; no client framework needed."""
from html import escape
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
START, END = "<!-- publications:start -->", "<!-- publications:end -->"


def render():
    papers = json.loads((ROOT / "data/publications.json").read_text())
    cache_path = ROOT / "data/citations.json"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    citations = cache.get("publications", {})
    articles = []
    for index, paper in enumerate(papers):
        group = "selected" if index < 3 else "reports" if index < 8 else "other"
        links = "".join(f'<a href="{escape(link["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(link["label"])} <span aria-hidden="true">↗</span></a>' for link in paper["links"])
        entry = citations.get(paper["id"], {})
        url = entry.get("url", "https://scholar.google.com/scholar?q=" + quote('"' + paper["title"] + '"'))
        count = entry.get("count")
        label = f'Cited by {count:,}' + ('*' if entry.get('estimated') else '') if isinstance(count, int) else "View citations"
        updated = entry.get("updated_at", "")
        date = datetime.fromisoformat(updated).astimezone(timezone(timedelta(hours=8))).strftime('%d %b %Y') if updated else ''
        title = f'Google Scholar · updated {date}' if updated else "View this paper on Google Scholar"
        articles.append(f'''        <article class="paper" id="paper-{paper['id']}" data-group="{group}">
          <a class="paper-figure" href="{escape(paper['links'][0]['url'], quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="Read {escape(paper['title'], quote=True)}">
            <img src="{paper['image']}" alt="Research figure for {escape(paper['title'], quote=True)}" loading="lazy" decoding="async" width="600" height="360">
          </a>
          <div class="paper-content">
            <div class="paper-meta"><span>{escape(paper['venue'])}</span>{'<span class="paper-distinction">Selected work</span>' if index < 3 else ''}</div>
            <h3><a href="{escape(paper['links'][0]['url'], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(paper['title'])}</a></h3>
            <p class="paper-authors">{paper['authors']}</p>
            <p class="paper-summary">{escape(paper['summary'])}</p>
            <div class="paper-bottom"><div class="paper-links">{links}</div><a class="citation" data-citation="{paper['id']}" data-updated="{updated}" href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer" title="{escape(title, quote=True)}">{label} <span aria-hidden="true">↗</span></a></div>
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
