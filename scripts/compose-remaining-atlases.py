from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CELL_SIZE = 320
GRID_COLUMNS = 6
MAX_BYTES = 25 * 1024 * 1024
BACKGROUND = (252, 232, 218)

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


def _source_paths(source_dir: Path, symbols: Iterable[str]) -> list[Path]:
    paths = [source_dir / f"{symbol}.png" for symbol in symbols]
    missing = [path.name for path in paths if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing source images: {', '.join(missing)}")
    return paths


def compose_atlas(category: str, spec: dict) -> Path:
    symbols = spec["symbols"]
    grid_rows = max(5, (len(symbols) + GRID_COLUMNS - 1) // GRID_COLUMNS)
    if len(symbols) > GRID_COLUMNS * grid_rows:
        raise ValueError(f"{category} symbols do not fit in the configured atlas grid")

    paths = _source_paths(spec["source_dir"], symbols)
    output_path = spec["output_path"]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas = Image.new(
        "RGB",
        (CELL_SIZE * GRID_COLUMNS, CELL_SIZE * grid_rows),
        BACKGROUND,
    )

    for index, source_path in enumerate(paths):
        with Image.open(source_path) as source:
            tile = ImageOps.contain(source.convert("RGB"), (CELL_SIZE, CELL_SIZE), Image.Resampling.LANCZOS)
            x = (index % GRID_COLUMNS) * CELL_SIZE + (CELL_SIZE - tile.width) // 2
            y = (index // GRID_COLUMNS) * CELL_SIZE + (CELL_SIZE - tile.height) // 2
            canvas.paste(tile, (x, y))

    canvas.save(output_path, format="WEBP", quality=92, method=6)
    size = output_path.stat().st_size
    if size >= MAX_BYTES:
        raise ValueError(f"{category} atlas exceeds 25MB: {size} bytes")
    return output_path


if __name__ == "__main__":
    for category, spec in ATLAS_SPECS.items():
        atlas_path = compose_atlas(category, spec)
        print(f"Created {atlas_path} ({atlas_path.stat().st_size} bytes)")
