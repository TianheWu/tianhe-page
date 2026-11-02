import copy
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from update_citations import update


def row(title, count, article="one"):
    return f'<tr class="gsc_a_tr"><td><a class="gsc_a_at" href="/citations?view_op=view_citation&amp;citation_for_view=QW1JtysAAAAJ:{article}">{title}</a></td><td><a class="gsc_a_ac gs_ibl">{count}</a></td></tr>'


class CitationTests(unittest.TestCase):
    def test_parse_counts_zero_and_estimate(self):
        papers = [{"id": "a", "title": "Title A"}, {"id": "b", "title": "Title B"}, {"id": "c", "title": "Title C"}]
        data, matched = update(row("Title A", "1,234*") + row("Title B", "") + row("Title C", "0"), papers, {}, "2026-11-03T00:00:00+00:00")
        self.assertEqual(matched, 3)
        self.assertEqual(data["publications"]["a"]["count"], 1234)
        self.assertTrue(data["publications"]["a"]["estimated"])
        self.assertEqual(data["publications"]["b"]["count"], 0)
        self.assertEqual(data["publications"]["c"]["count"], 0)
        self.assertIn("&citation_for_view", data["publications"]["a"]["url"])

    def test_blocked_response_does_not_modify_cache(self):
        previous = {"publications": {"a": {"count": 15, "updated_at": "2026-11-01"}}}
        saved = copy.deepcopy(previous)
        with self.assertRaises(ValueError):
            update("<html>Please verify you are human</html>", [{"id": "a", "title": "Title A"}], previous, "now")
        self.assertEqual(previous, saved)

    def test_partial_match_retains_old_count_and_date(self):
        old = {"count": 7, "updated_at": "2026-11-01"}
        data, matched = update(row("Title A", "3"), [{"id": "a", "title": "Title A"}, {"id": "b", "title": "Title B"}], {"publications": {"b": old}}, "2026-11-03")
        self.assertEqual(matched, 1)
        self.assertEqual(data["publications"]["b"], old)

    def test_duplicate_titles_are_not_silently_assigned(self):
        with self.assertRaises(ValueError):
            update(row("Title A", "3", "one") + row("Title A", "99", "two"), [{"id": "a", "title": "Title A"}], {}, "now")

    def test_invalid_count_does_not_become_zero(self):
        with self.assertRaises(ValueError):
            update(row("Title A", "unavailable"), [{"id": "a", "title": "Title A"}], {}, "now")

    def test_explicit_title_alias(self):
        data, matched = update(row("Qwen-Image-Flash: Rethinking the Training Recipe for Few-Step Distillation", "5"), [{"id": "qwenimageflash", "title": "Qwen-Image-Flash: Beyond Objective Design"}], {}, "now")
        self.assertEqual(matched, 1)
        self.assertEqual(data["publications"]["qwenimageflash"]["count"], 5)


if __name__ == "__main__":
    unittest.main()
