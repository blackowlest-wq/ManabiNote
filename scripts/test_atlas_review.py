import json
import re
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "scripts" / "generate-atlas-review.py"
OUTPUT = ROOT / "public" / "kana-to-picture-atlas-review.html"
MANIFEST = ROOT / "src" / "features" / "question-types" / "kana-to-picture" / "data" / "image-atlas-manifest.json"


class AtlasReviewPageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(GENERATOR)], cwd=ROOT, check=True)
        cls.html = OUTPUT.read_text(encoding="utf-8")
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_has_four_sections_and_all_manifest_symbols(self):
        self.assertEqual(self.html.count('class="review-section"'), 4)
        self.assertEqual(self.html.count('class="review-card'), sum(len(atlas["symbols"]) for atlas in self.manifest["atlases"]))

        for atlas in self.manifest["atlases"]:
            for symbol in atlas["symbols"]:
                self.assertIn(f'data-symbol-id="{symbol}"', self.html)

    def test_does_not_preserve_old_aliases_or_duplicate_image_names(self):
        self.assertNotIn("むし", self.html)
        self.assertNotIn("へやのいす", self.html)
        self.assertNotIn("ろーるけーき", self.html)
        self.assertNotIn("のみもの", self.html)
        self.assertNotIn("みかん", self.html)
        self.assertNotIn("おくとぱす", self.html)
        self.assertNotIn("えほん", self.html)
        self.assertNotIn('class="review-card multiple"', self.html)

    def test_uses_only_the_four_raster_atlases(self):
        sources = set(re.findall(r"""/images/kana-to-picture/atlases/[^"']+\.webp""", self.html))

        self.assertEqual(
            sources,
            {
                "/images/kana-to-picture/atlases/animals-01-v2.webp",
                "/images/kana-to-picture/atlases/food-01-v2.webp",
                "/images/kana-to-picture/atlases/objects-01-v2.webp",
                "/images/kana-to-picture/atlases/nature-01-v2.webp",
            },
        )
        self.assertNotRegex(self.html, r"/images/kana-to-picture/atlases/[^\"']+\.svg")


if __name__ == "__main__":
    unittest.main()
