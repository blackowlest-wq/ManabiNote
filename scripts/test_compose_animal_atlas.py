from pathlib import Path
import unittest

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "artwork" / "imagegen" / "animals-v2"
OUTPUT_PATH = ROOT / "public" / "images" / "kana-to-picture" / "atlases" / "animals-01-v2.webp"
SYMBOLS = [
    "ant",
    "bear",
    "bird",
    "butterfly",
    "cat",
    "chick",
    "cow",
    "crab",
    "deer",
    "dog",
    "dolphin",
    "elephant",
    "fish",
    "fox",
    "frog",
    "giraffe",
    "horse",
    "koala",
    "lion",
    "monkey",
    "octopus",
    "owl",
    "panda",
    "polar-bear",
    "rabbit",
    "turtle",
    "cicada",
    "crocodile",
    "pig",
    "mouse",
    "flying-squirrel",
    "snake",
]


class AnimalAtlasCompositionTest(unittest.TestCase):
    def test_all_manifest_symbols_have_source_images(self):
        source_names = {path.stem for path in SOURCE_DIR.glob("*.png")}

        self.assertTrue(set(SYMBOLS).issubset(source_names))

    def test_composed_atlas_is_a_small_6_by_6_webp(self):
        self.assertTrue(OUTPUT_PATH.exists(), f"missing atlas: {OUTPUT_PATH}")

        with Image.open(OUTPUT_PATH) as image:
            self.assertEqual(image.format, "WEBP")
            self.assertEqual(image.size, (1920, 1920))

        self.assertLess(OUTPUT_PATH.stat().st_size, 25 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
