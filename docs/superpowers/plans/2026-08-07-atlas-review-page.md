# Atlas Review Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a generated standalone HTML page that lets a person compare every atlas image with every name and reading currently used by the question bank.

**Architecture:** A Python generator reads the existing atlas manifest and question JSON, collects all labels/readings per `(atlasId, symbolId)`, and writes a static page under `public/`. The page reuses the four WebP atlases with CSS background crops, so no image copies or application route changes are needed.

**Tech Stack:** Python 3, Pillow-independent standard library, static HTML/CSS, existing WebP atlases.

## Global Constraints

- Keep the learning UI unchanged.
- Display all 107 manifest symbols in manifest order.
- Preserve every unique label/reading pair found in the question bank, including multiple aliases for one image.
- Use only the four existing `*-01-v2.webp` atlas files.
- Add no dependencies.

---

### Task 1: Add the review-page generator and its failing test

**Files:**
- Create: `scripts/generate-atlas-review.py`
- Create: `scripts/test_atlas_review.py`
- Create: `public/kana-to-picture-atlas-review.html`

**Interfaces:**
- `generate_atlas_review()` reads the manifest and questions and returns the generated HTML string.
- Running `python scripts/generate-atlas-review.py` writes `public/kana-to-picture-atlas-review.html`.

- [ ] **Step 1: Write the failing test**

Test the generated page for exactly 4 category sections, every current manifest card, every manifest symbol ID, all four WebP atlas sources, and the absence of the retired duplicate aliases.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `python -m unittest scripts/test_atlas_review.py`

Expected: FAIL because the generator and review page do not exist.

- [ ] **Step 3: Implement the generator**

Load `src/features/question-types/kana-to-picture/data/image-atlas-manifest.json` and `questions.json`. Collect unique `(label, reading)` pairs for each symbol. Generate one card per symbol with a `160px` crop, `background-size: 960px 800px`, row-major `background-position`, image `aria-label`, symbol ID, position, and all aliases. Add responsive CSS and a short usage note.

- [ ] **Step 4: Generate the page and run the test**

Run:

```powershell
python scripts/generate-atlas-review.py
python -m unittest scripts/test_atlas_review.py
```

Expected: PASS; the page exists and all 107 cards are represented.

### Task 2: Verify the standalone artifact

**Files:**
- Verify: `public/kana-to-picture-atlas-review.html`

- [ ] **Step 1: Check the generated file and source images**

Confirm the output references only `/images/kana-to-picture/atlases/*-01-v2.webp`, contains no SVG atlas references, and all four WebP files exist.

- [ ] **Step 2: Run existing regression checks**

Run:

```powershell
python -m unittest scripts/test_atlas_review.py scripts/test_compose_animal_atlas.py scripts/test_remaining_atlas_composition.py
& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit
```

Expected: all Python checks and TypeScript validation pass.
