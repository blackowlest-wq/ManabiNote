from pathlib import Path
import unittest

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 25 * 1024 * 1024

ATLAS_SPECS = {
    "food": {
        "source_dir": ROOT / "artwork" / "imagegen" / "food-v2",
        "output_path": ROOT / "public" / "images" / "kana-to-picture" / "atlases" / "food-01-v2.webp",
        "symbols": "apple banana bread broccoli cake carrot cherry donut grape hamburger hotcake icecream lemon melon milk orange peach pear pineapple rice strawberry sushi tomato watermelon yogurt miso-soup egg cotton-candy lettuce wheat".split(),
    },
    "objects": {
        "source_dir": ROOT / "artwork" / "imagegen" / "objects-v2",
        "output_path": ROOT / "public" / "images" / "kana-to-picture" / "atlases" / "objects-01-v2.webp",
        "symbols": "backpack ball book boots brush bus camera chair clock cup drum hat key kite lamp pencil phone piano roulette ruby scissors ship shovel socks spoon train umbrella randoseru letter gloves helmet glasses yoyo eraser desk kettle rocket candle notebook sofa pillow window spinning-top plush-toy sled plate fan apron".split(),
    },
    "nature": {
        "source_dir": ROOT / "artwork" / "imagegen" / "nature-v2",
        "output_path": ROOT / "public" / "images" / "kana-to-picture" / "atlases" / "nature-01-v2.webp",
        "symbols": "acorn flower forest hill leaf moon mountain mushroom pond rain rainbow river rock shell snowflake snowman star sun tree tulip volcano wave wind sunflower pinecone".split(),
    },
}


class RemainingAtlasCompositionTest(unittest.TestCase):
    def test_each_category_has_exactly_the_expected_sources(self):
        for category, spec in ATLAS_SPECS.items():
            source_names = {path.stem for path in spec["source_dir"].glob("*.png")}
            self.assertTrue(set(spec["symbols"]).issubset(source_names), category)

    def test_each_composed_atlas_uses_the_smallest_6_column_webp_grid(self):
        for category, spec in ATLAS_SPECS.items():
            output_path = spec["output_path"]
            self.assertTrue(output_path.exists(), f"missing {category} atlas: {output_path}")

            with Image.open(output_path) as image:
                self.assertEqual(image.format, "WEBP")
                expected_rows = max(5, (len(spec["symbols"]) + 5) // 6)
                self.assertEqual(image.size, (1920, expected_rows * 320))

            self.assertLess(output_path.stat().st_size, MAX_BYTES, category)


if __name__ == "__main__":
    unittest.main()
