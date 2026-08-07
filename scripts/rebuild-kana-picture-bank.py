from __future__ import annotations

import json
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_PATH = ROOT / "src" / "features" / "question-types" / "kana-to-picture" / "data" / "questions.json"
MANIFEST_PATH = ROOT / "src" / "features" / "question-types" / "kana-to-picture" / "data" / "image-atlas-manifest.json"


def entry(atlas_id: str, symbol_id: str, reading: str) -> dict:
    return {
        "atlasId": atlas_id,
        "symbolId": symbol_id,
        "label": reading,
        "reading": reading,
    }


# Each symbol has one canonical classroom name.  Descriptive aliases from the
# previous bank are deliberately not included, so an image cannot carry two
# competing readings.
CANONICAL_ENTRIES = [
    *[
        entry("animals-01", symbol, reading)
        for symbol, reading in [
            ("ant", "あり"),
            ("bear", "くま"),
            ("bird", "とり"),
            ("butterfly", "ちょうちょ"),
            ("cat", "ねこ"),
            ("chick", "ひよこ"),
            ("cow", "うし"),
            ("crab", "かに"),
            ("deer", "しか"),
            ("dog", "いぬ"),
            ("dolphin", "いるか"),
            ("elephant", "ぞう"),
            ("fish", "さかな"),
            ("fox", "きつね"),
            ("frog", "かえる"),
            ("giraffe", "きりん"),
            ("horse", "うま"),
            ("koala", "こあら"),
            ("lion", "らいおん"),
            ("monkey", "さる"),
            ("octopus", "たこ"),
            ("owl", "ふくろう"),
            ("panda", "ぱんだ"),
            ("polar-bear", "しろくま"),
            ("rabbit", "うさぎ"),
            ("turtle", "かめ"),
            ("cicada", "せみ"),
            ("crocodile", "わに"),
            ("pig", "ぶた"),
            ("mouse", "ねずみ"),
            ("flying-squirrel", "むささび"),
            ("snake", "へび"),
        ]
    ],
    *[
        entry("food-01", symbol, reading)
        for symbol, reading in [
            ("apple", "りんご"),
            ("banana", "ばなな"),
            ("bread", "ぱん"),
            ("broccoli", "ぶろっこりー"),
            ("cake", "けーき"),
            ("carrot", "にんじん"),
            ("cherry", "さくらんぼ"),
            ("donut", "どーなつ"),
            ("grape", "ぶどう"),
            ("hamburger", "はんばーがー"),
            ("hotcake", "ほっとけーき"),
            ("icecream", "あいすくりーむ"),
            ("lemon", "れもん"),
            ("melon", "めろん"),
            ("milk", "みるく"),
            ("orange", "おれんじ"),
            ("miso-soup", "みそしる"),
            ("peach", "もも"),
            ("pear", "なし"),
            ("pineapple", "ぱいなっぷる"),
            ("rice", "ごはん"),
            ("strawberry", "いちご"),
            ("sushi", "すし"),
            ("tomato", "とまと"),
            ("watermelon", "すいか"),
            ("yogurt", "よーぐると"),
            ("egg", "たまご"),
            ("cotton-candy", "わたあめ"),
            ("lettuce", "れたす"),
            ("wheat", "むぎ"),
        ]
    ],
    *[
        entry("objects-01", symbol, reading)
        for symbol, reading in [
            ("backpack", "りっくさっく"),
            ("ball", "ぼーる"),
            ("book", "ほん"),
            ("boots", "ながぐつ"),
            ("brush", "ぶらし"),
            ("bus", "のりもの"),
            ("camera", "かめら"),
            ("chair", "いす"),
            ("clock", "とけい"),
            ("cup", "こっぷ"),
            ("drum", "たいこ"),
            ("hat", "ぼうし"),
            ("key", "かぎ"),
            ("kite", "たこ"),
            ("lamp", "らいと"),
            ("pencil", "えんぴつ"),
            ("phone", "すまーとふぉん"),
            ("piano", "ぴあの"),
            ("roulette", "るーれっと"),
            ("ruby", "るびー"),
            ("scissors", "はさみ"),
            ("ship", "ふね"),
            ("shovel", "すこっぷ"),
            ("socks", "くつした"),
            ("spoon", "すぷーん"),
            ("train", "きしゃ"),
            ("umbrella", "かさ"),
            ("randoseru", "らんどせる"),
            ("letter", "てがみ"),
            ("gloves", "てぶくろ"),
            ("helmet", "へるめっと"),
            ("glasses", "めがね"),
            ("yoyo", "よーよー"),
            ("eraser", "けしごむ"),
            ("desk", "つくえ"),
            ("kettle", "やかん"),
            ("rocket", "ろけっと"),
            ("candle", "ろうそく"),
            ("notebook", "のーと"),
            ("sofa", "そふぁ"),
            ("pillow", "まくら"),
            ("window", "まど"),
            ("spinning-top", "こま"),
            ("plush-toy", "ぬいぐるみ"),
            ("sled", "そり"),
            ("plate", "おさら"),
            ("fan", "せんす"),
            ("apron", "えぷろん"),
        ]
    ],
    *[
        entry("nature-01", symbol, reading)
        for symbol, reading in [
            ("acorn", "どんぐり"),
            ("flower", "はな"),
            ("forest", "もり"),
            ("hill", "おか"),
            ("leaf", "はっぱ"),
            ("moon", "つき"),
            ("mountain", "やま"),
            ("mushroom", "きのこ"),
            ("pond", "ぬま"),
            ("rain", "あめ"),
            ("rainbow", "にじ"),
            ("river", "かわ"),
            ("rock", "いし"),
            ("shell", "かい"),
            ("snowflake", "ゆき"),
            ("snowman", "ゆきだるま"),
            ("star", "ほし"),
            ("sun", "たいよう"),
            ("tree", "き"),
            ("tulip", "ちゅーりっぷ"),
            ("volcano", "かざん"),
            ("wave", "なみ"),
            ("wind", "かぜ"),
            ("sunflower", "ひまわり"),
            ("pinecone", "まつぼっくり"),
        ]
    ],
]


# The bank keeps the original 44-kana distribution.  The correct entries are
# deliberately listed per displayed kana so names such as ぶた and ごはん
# are not forced into the wrong question.
CORRECT_SYMBOLS_BY_KANA = {
    "あ": ["ant", "rain", "icecream"],
    "い": ["dog", "chair", "strawberry"],
    "う": ["cow", "rabbit", "horse"],
    "え": ["pencil", "apron"],
    "お": ["orange", "hill", "plate"],
    "か": ["umbrella", "turtle", "crab"],
    "き": ["fox", "train", "giraffe"],
    "く": ["bear", "socks"],
    "け": ["cake", "eraser"],
    "こ": ["koala", "cup", "spinning-top"],
    "さ": ["fish", "cherry", "monkey"],
    "し": ["deer", "polar-bear"],
    "す": ["watermelon", "phone"],
    "せ": ["cicada", "fan"],
    "そ": ["sled", "sofa"],
    "た": ["kite", "drum", "sun"],
    "ち": ["butterfly", "tulip"],
    "つ": ["moon", "desk"],
    "て": ["gloves", "letter"],
    "と": ["bird", "clock"],
    "な": ["pear", "boots", "wave"],
    "に": ["carrot", "rainbow"],
    "ぬ": ["pond", "plush-toy"],
    "ね": ["cat", "mouse"],
    "の": ["bus", "notebook"],
    "は": ["flower", "scissors", "leaf"],
    "ひ": ["chick", "sunflower"],
    "ふ": ["ship", "owl"],
    "へ": ["helmet", "snake"],
    "ほ": ["star", "hotcake"],
    "ま": ["pillow", "pinecone", "window"],
    "み": ["miso-soup", "milk"],
    "む": ["flying-squirrel", "wheat"],
    "め": ["melon", "glasses"],
    "も": ["peach", "forest"],
    "や": ["mountain", "kettle"],
    "ゆ": ["snowman", "snowflake"],
    "よ": ["yogurt", "yoyo"],
    "ら": ["lamp", "randoseru"],
    "り": ["apple", "backpack"],
    "る": ["ruby", "roulette"],
    "れ": ["lemon", "lettuce"],
    "ろ": ["rocket", "candle"],
    "わ": ["cotton-candy", "crocodile"],
}


def _read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _manifest_symbols(manifest: dict) -> list[str]:
    return [symbol for atlas in manifest["atlases"] for symbol in atlas["symbols"]]


def _correct_positions(question_ids: list[str]) -> dict[str, int]:
    if len(set(question_ids)) != len(question_ids):
        raise ValueError("question IDs must be unique before assigning correct positions")

    # Assign a balanced position sequence after a stable hash sort.  This keeps
    # the distribution reproducible without making the answer position follow a
    # visible 1-2-3-4 pattern in the question order.
    ordered_ids = sorted(
        question_ids,
        key=lambda question_id: (zlib.crc32(question_id.encode("utf-8")), question_id),
    )
    positions = {
        question_id: (index % 4) + 1
        for index, question_id in enumerate(ordered_ids)
    }
    counts = [list(positions.values()).count(position) for position in range(1, 5)]
    if max(counts) > len(question_ids) * 0.4:
        raise ValueError(f"correct position distribution exceeds 40 percent: {counts}")
    return positions


def _build_questions(old_questions: list[dict], manifest: dict) -> list[dict]:
    entries_by_symbol = {item["symbolId"]: item for item in CANONICAL_ENTRIES}
    if len(entries_by_symbol) != len(CANONICAL_ENTRIES):
        raise ValueError("canonical entries must not define the same image symbol more than once")
    manifest_symbols = _manifest_symbols(manifest)
    if set(entries_by_symbol) != set(manifest_symbols):
        missing = sorted(set(manifest_symbols) - set(entries_by_symbol))
        extra = sorted(set(entries_by_symbol) - set(manifest_symbols))
        raise ValueError(f"canonical/manifest mismatch; missing={missing}, extra={extra}")

    queues = {kana: list(symbols) for kana, symbols in CORRECT_SYMBOLS_BY_KANA.items()}
    usage = {symbol: 0 for symbol in manifest_symbols}
    correct_positions = _correct_positions([question["id"] for question in old_questions])
    questions = []

    for old_question in old_questions:
        kana = old_question["kana"]
        if not queues.get(kana):
            raise ValueError(f"no correct entry left for kana {kana}")
        correct_symbol = queues[kana].pop(0)
        correct = entries_by_symbol[correct_symbol]

        candidates = [
            entries_by_symbol[symbol]
            for symbol in manifest_symbols
            if symbol != correct_symbol and not entries_by_symbol[symbol]["reading"].startswith(kana)
        ]
        candidates.sort(key=lambda item: (usage[item["symbolId"]], manifest_symbols.index(item["symbolId"])))
        distractors = []
        used_heads = {correct["reading"][0]}
        used_readings = {correct["reading"]}
        for candidate in candidates:
            head = candidate["reading"][0]
            if head in used_heads or candidate["reading"] in used_readings:
                continue
            distractors.append(candidate)
            used_heads.add(head)
            used_readings.add(candidate["reading"])
            if len(distractors) == 3:
                break

        if len(distractors) != 3:
            raise ValueError(f"could not find three distinct distractor heads for {old_question['id']}")

        correct_position = correct_positions[old_question["id"]]
        choices = []
        distractor_index = 0
        for position in range(1, 5):
            if position == correct_position:
                choices.append(correct)
            else:
                choices.append(distractors[distractor_index])
                distractor_index += 1

        for choice in choices:
            usage[choice["symbolId"]] += 1

        questions.append(
            {
                "type": "kana-to-picture",
                "id": old_question["id"],
                "kana": kana,
                "reading": correct["reading"],
                "choices": [
                    {
                        "id": f"{old_question['id']}-choice-{index}",
                        "label": choice["label"],
                        "reading": choice["reading"],
                        "image": {
                            "atlasId": choice["atlasId"],
                            "symbolId": choice["symbolId"],
                        },
                    }
                    for index, choice in enumerate(choices, start=1)
                ],
                "correctChoiceId": f"{old_question['id']}-choice-{correct_position}",
                "audioSrc": None,
            }
        )

    if any(queues.values()):
        raise ValueError(f"unused correct entries: {queues}")
    if any(count == 0 for count in usage.values()):
        raise ValueError(f"unused manifest symbols: {[symbol for symbol, count in usage.items() if count == 0]}")

    return questions


def main() -> None:
    questions = _read(QUESTIONS_PATH)
    manifest = _read(MANIFEST_PATH)
    rebuilt = _build_questions(questions, manifest)
    QUESTIONS_PATH.write_text(json.dumps(rebuilt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Rebuilt {len(rebuilt)} questions")


if __name__ == "__main__":
    main()
