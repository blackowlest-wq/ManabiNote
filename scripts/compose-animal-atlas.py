from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


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
CELL_SIZE = 320
GRID_COLUMNS = 6
GRID_ROWS = 6
MAX_BYTES = 25 * 1024 * 1024
BACKGROUND = (252, 232, 218)


def _source_paths(source_dir: Path, symbols: Iterable[str]) -> list[Path]:
    paths = [source_dir / f"{symbol}.png" for symbol in symbols]
    missing = [path.name for path in paths if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing animal source images: {', '.join(missing)}")
    return paths


def compose_atlas(source_dir: Path = SOURCE_DIR, output_path: Path = OUTPUT_PATH) -> Path:
    if len(SYMBOLS) > GRID_COLUMNS * GRID_ROWS:
        raise ValueError("Animal symbols do not fit in the configured atlas grid")

    paths = _source_paths(source_dir, SYMBOLS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas = Image.new(
        "RGB",
        (CELL_SIZE * GRID_COLUMNS, CELL_SIZE * GRID_ROWS),
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
        raise ValueError(f"Animal atlas exceeds 25MB: {size} bytes")
    return output_path


if __name__ == "__main__":
    atlas_path = compose_atlas()
    print(f"Created {atlas_path} ({atlas_path.stat().st_size} bytes)")
