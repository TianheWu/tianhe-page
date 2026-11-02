#!/usr/bin/env python3
"""Refresh a small public Scholar profile; preserve cached data on any failure."""
import argparse
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PROFILE = "https://scholar.google.com/citations?user=QW1JtysAAAAJ&hl=en&pagesize=100"
# Explicit aliases only: never fuzzy-match different publications.
ALIASES = {
    "qwenimageflash": ["Qwen-Image-Flash: Rethinking the Training Recipe for Few-Step Distillation"],
    "dpposr": ["DP O-SR: Direct Perceptual Preference Optimization for Real-World Image Super-Resolution"],
}


def normalize(value):
    return "".join(c for c in unicodedata.normalize("NFKC", value).casefold() if c.isalnum())


class ScholarParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.row = None
        self.field = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "tr" and "gsc_a_tr" in classes:
            self.row = {"title": "", "count": "", "url": "", "has_count": False}
        if self.row is None:
            return
        if tag == "a" and "gsc_a_at" in classes:
            self.field = "title"
            self.row["url"] = urljoin(PROFILE, attrs.get("href", ""))
        elif tag == "a" and "gsc_a_ac" in classes:
            self.field = "count"
            self.row["has_count"] = True

    def handle_data(self, data):
        if self.row is not None and self.field:
            self.row[self.field] += data

    def handle_endtag(self, tag):
        if tag == "a":
            self.field = None
        if tag == "tr" and self.row is not None:
            if self.row["title"] and self.row["has_count"]:
                raw = self.row.pop("count").strip().replace(",", "")
                if raw and not re.fullmatch(r"\d+\*?", raw):
                    raise ValueError("Unrecognized citation count; cache retained")
                self.row["count"] = int(raw.rstrip("*") or "0")
                self.row["estimated"] = raw.endswith("*")
                self.rows.append(self.row)
            self.row = None
            self.field = None


def update(source, publications, previous, timestamp):
    parser = ScholarParser()
    parser.feed(source)
    if not parser.rows:
        raise ValueError("Scholar returned no article rows (possibly blocked); cache retained")
    by_title = {}
    for row in parser.rows:
        by_title.setdefault(normalize(row["title"]), []).append(row)
    entries = dict(previous.get("publications", {}))
    matched = 0
    for paper in publications:
        matches = []
        for title in [paper["title"], *ALIASES.get(paper["id"], [])]:
            matches.extend(by_title.get(normalize(title), []))
        if len(matches) != 1:
            print("Unmatched or ambiguous; retaining cache:", paper["id"])
            continue
        row = matches[0]
        entries[paper["id"]] = {
            "count": row["count"], "estimated": row["estimated"],
            "url": row["url"], "scholar_title": row["title"], "updated_at": timestamp,
        }
        matched += 1
    if not matched:
        raise ValueError("No publications matched; cache retained")
    return {"source": "Google Scholar", "profile": PROFILE,
            "updated_at": timestamp, "publications": entries}, matched


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", type=Path, help="Import an already retrieved profile HTML file")
    args = parser.parse_args()
    cache = ROOT / "data/citations.json"
    previous = json.loads(cache.read_text()) if cache.exists() else {}
    publications = json.loads((ROOT / "data/publications.json").read_text())
    if args.html:
        source = args.html.read_text()
    else:
        request = Request(PROFILE, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9"})
        # One request per run. Do not retry challenges or bypass access restrictions.
        with urlopen(request, timeout=30) as response:
            source = response.read().decode("utf-8")
    timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    result, matched = update(source, publications, previous, timestamp)
    temporary = cache.with_suffix(".tmp")
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(cache)
    print(f"Updated {matched}/{len(publications)} publications from Google Scholar")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Citation refresh failed: {error}", file=sys.stderr)
        sys.exit(1)
