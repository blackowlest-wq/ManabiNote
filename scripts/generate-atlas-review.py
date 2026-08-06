from collections import defaultdict
from html import escape
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "src" / "features" / "question-types" / "kana-to-picture" / "data" / "image-atlas-manifest.json"
QUESTIONS_PATH = ROOT / "src" / "features" / "question-types" / "kana-to-picture" / "data" / "questions.json"
OUTPUT_PATH = ROOT / "public" / "kana-to-picture-atlas-review.html"
CARD_SIZE = 160

CATEGORY_NAMES = {
    "animals-01": "動物",
    "food-01": "食べ物",
    "objects-01": "もの",
    "nature-01": "自然",
}


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _collect_aliases(questions: list[dict]) -> dict[tuple[str, str], list[tuple[str, str]]]:
    aliases: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)

    for question in questions:
        for choice in question["choices"]:
            image = choice["image"]
            key = (image["atlasId"], image["symbolId"])
            pair = (choice["label"], choice["reading"])
            if pair not in aliases[key]:
                aliases[key].append(pair)

    return aliases


def _validate_and_build_cards(manifest: dict, aliases: dict[tuple[str, str], list[tuple[str, str]]]):
    sections = []

    for atlas in manifest["atlases"]:
        if atlas.get("format") != "raster-grid":
            raise ValueError(f"Review page requires raster-grid atlas: {atlas['id']}")

        source = atlas["src"]
        source_path = ROOT / "public" / source.lstrip("/")
        if not source.endswith(".webp") or not source_path.is_file():
            raise FileNotFoundError(f"Missing raster atlas: {source}")

        columns = atlas["columns"]
        rows = atlas["rows"]
        background_size = f"{CARD_SIZE * columns}px {CARD_SIZE * rows}px"
        cards = []

        for index, symbol in enumerate(atlas["symbols"]):
            key = (atlas["id"], symbol)
            symbol_aliases = aliases.get(key, [])
            if not symbol_aliases:
                raise ValueError(f"No question name found for {atlas['id']}:{symbol}")

            column = index % columns
            row = index // columns
            cards.append(
                {
                    "atlas_id": atlas["id"],
                    "symbol": symbol,
                    "source": source,
                    "position": f"{row + 1}行 {column + 1}列",
                    "background_size": background_size,
                    "background_position": f"-{column * CARD_SIZE}px -{row * CARD_SIZE}px",
                    "aliases": symbol_aliases,
                }
            )

        sections.append(
            {
                "atlas_id": atlas["id"],
                "name": CATEGORY_NAMES.get(atlas["id"], atlas["id"]),
                "cards": cards,
            }
        )

    return sections


def _render_aliases(aliases: list[tuple[str, str]]) -> str:
    rendered = []
    for label, reading in aliases:
        rendered.append(
            '<li class="alias">'
            f'<span class="label">{escape(label)}</span>'
            f'<span class="reading">読み: {escape(reading)}</span>'
            "</li>"
        )
    return "".join(rendered)


def _render_card(card: dict) -> str:
    aliases = card["aliases"]
    multiple_class = " multiple" if len(aliases) > 1 else ""
    first_label = aliases[0][0]
    style = (
        f"background-image: url('{escape(card['source'], quote=True)}'); "
        f"background-size: {card['background_size']}; "
        f"background-position: {card['background_position']};"
    )

    return (
        f'<article class="review-card{multiple_class}" '
        f'data-atlas-id="{escape(card["atlas_id"], quote=True)}" '
        f'data-symbol-id="{escape(card["symbol"], quote=True)}">'
        f'<div class="sprite" role="img" aria-label="{escape(first_label, quote=True)}の画像" style="{escape(style, quote=True)}"></div>'
        f'<div class="card-meta"><span>{escape(card["position"])}</span>'
        f'<code>{escape(card["symbol"])}</code></div>'
        f'<ul class="aliases" aria-label="問題中の呼び名">{_render_aliases(aliases)}</ul>'
        f'{"<p class=\"warning\">複数表記</p>" if len(aliases) > 1 else ""}'
        "</article>"
    )


def _render_html(sections: list[dict]) -> str:
    rendered_sections = []
    total_cards = sum(len(section["cards"]) for section in sections)

    for section in sections:
        rendered_sections.append(
            f'<section class="review-section" data-category="{escape(section["atlas_id"], quote=True)}">'
            f'<h2>{escape(section["name"])} <small>{len(section["cards"])}枚</small></h2>'
            f'<div class="review-grid">{"".join(_render_card(card) for card in section["cards"])}</div>'
            "</section>"
        )

    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>かなと絵の紐づけ確認</title>
  <style>
    :root {{
      color: #38251f;
      background: #fff8f3;
      font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; padding: 24px; }}
    main {{ max-width: 1400px; margin: 0 auto; }}
    h1 {{ margin: 0 0 8px; font-size: clamp(1.5rem, 3vw, 2.25rem); }}
    .intro {{ margin: 0 0 28px; color: #6f554b; line-height: 1.7; }}
    .review-section {{ margin: 0 0 36px; }}
    h2 {{ display: flex; align-items: baseline; gap: 10px; margin: 0 0 12px; font-size: 1.45rem; }}
    h2 small {{ color: #9a7668; font-size: .85rem; font-weight: 400; }}
    .review-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }}
    .review-card {{ min-width: 0; padding: 10px; border: 1px solid #ecd6ca; border-radius: 14px; background: #fff; box-shadow: 0 2px 8px #6c3b2412; }}
    .review-card.multiple {{ border-color: #e1a05e; box-shadow: 0 0 0 2px #e1a05e33; }}
    .sprite {{ width: 160px; height: 160px; margin: 0 auto 8px; background-repeat: no-repeat; }}
    .card-meta {{ display: flex; justify-content: space-between; gap: 8px; color: #8a685c; font-size: .78rem; }}
    code {{ color: #5c4035; font-size: .78rem; }}
    .aliases {{ display: grid; gap: 5px; margin: 8px 0 0; padding: 0; list-style: none; }}
    .alias {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }}
    .label {{ font-size: 1.05rem; font-weight: 700; }}
    .reading {{ color: #795c50; font-size: .8rem; }}
    .warning {{ margin: 8px 0 0; color: #a65a16; font-size: .75rem; font-weight: 700; }}
    @media (max-width: 520px) {{ body {{ padding: 14px; }} .review-grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} .sprite {{ width: 140px; height: 140px; transform: scale(.875); transform-origin: top left; margin-bottom: -14px; }} }}
  </style>
</head>
<body>
  <main>
    <h1>かなと絵の紐づけ確認</h1>
    <p class="intro">全{total_cards}枚を、アトラスの並び順に表示しています。オレンジ色のカードは、問題中で同じ画像に複数の呼び名が使われています。</p>
    {''.join(rendered_sections)}
  </main>
</body>
</html>
'''


def generate_atlas_review() -> str:
    manifest = _read_json(MANIFEST_PATH)
    questions = _read_json(QUESTIONS_PATH)
    aliases = _collect_aliases(questions)
    sections = _validate_and_build_cards(manifest, aliases)
    return _render_html(sections)


if __name__ == "__main__":
    html = generate_atlas_review()
    OUTPUT_PATH.write_text(html, encoding="utf-8")
    print(f"Created {OUTPUT_PATH} ({len(html.encode('utf-8'))} bytes)")
