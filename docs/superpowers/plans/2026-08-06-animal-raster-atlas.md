# Animal Raster Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 30 high-quality animal illustrations from the supplied reference style, preserve the existing SVG atlas, compose a project-bound raster atlas under 25MB, and integrate it into the kana picture-question UI with four choices per question.

**Architecture:** Keep the existing four-atlas manifest and SVG rendering for food, objects, and nature. Add a raster-grid atlas variant for animals, with fixed 320px cells in a 6×5 WebP sheet and row-major symbol placement. The existing `animals-01.svg` remains untouched as the rollback/reference asset; the manifest points animal questions to the new WebP only after the asset and rendering tests pass.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, built-in `image_gen`, Python Pillow for local image normalization/composition, WebP raster atlas.

## Global Constraints

- Preserve `public/images/kana-to-picture/atlases/animals-01.svg`; never overwrite or delete it.
- Generate each of the 30 animal illustrations individually, using the attached cat image as a style reference, then inspect and selectively regenerate weak outputs.
- Compose the final animal atlas as `public/images/kana-to-picture/atlases/animals-01-v2.webp` with a 6×6 row-major grid, 320×320px cells, and a file size below 25MB.
- Keep the three non-animal SVG atlases unchanged.
- Every question must contain exactly four choices: one correct choice and three incorrect choices.
- Incorrect readings must not begin with the question kana; all 100 correct readings remain unique.
- All 32 animal symbols must be referenced by at least one question choice.
- Preserve the approved noun policy: remove descriptive phrases such as `ねこのこ`, while retaining familiar one-word compounds such as `しろくま`; use the current canonical-name table for the reviewed bank.

---

### Task 1: Generate and normalize the 30 animal source illustrations

**Files:**
- Create: `artwork/imagegen/animals-v2/*.png` as reviewable source outputs for all 30 manifest symbols
- Create: `artwork/imagegen/animals-v2/README.md` with the shared prompt and symbol order
- Preserve: `public/images/kana-to-picture/atlases/animals-01.svg`

**Interfaces:**
- Consumes: attached cat reference image as style reference
- Produces: one square source image per manifest symbol, with a stable filename matching the symbol ID

- [ ] **Step 1: Create the source directory without touching the legacy atlas**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'artwork/imagegen/animals-v2' | Out-Null
Get-FileHash 'public/images/kana-to-picture/atlases/animals-01.svg' -Algorithm SHA256
```

Record the hash in the task notes and use it after implementation to confirm the legacy asset is unchanged.

- [ ] **Step 2: Generate each animal with the built-in image generator**

Use one built-in `image_gen` call per symbol. Use the attached image as `Image 1: style reference` and use this shared prompt shape, replacing only `<animal>`:

```text
Use case: illustration-story
Asset type: children's hiragana learning picture-card atlas cell
Primary request: a single cute full-body <animal> illustration for a Japanese preschool learning app
Input images: Image 1 is a style reference; match its friendly rounded character design, thick dark outline, soft pastel colors, simple face, and gentle expression without copying the exact cat.
Scene/backdrop: a simple, clean, warm light background suitable for a square picture card; no scenery
Subject: exactly one clearly recognizable <animal>, centered and fully visible with generous padding
Style/medium: polished cute children's illustration, smooth rounded shapes, subtle soft shading, consistent line weight
Composition/framing: square, front or slight three-quarter view, subject occupies about 70 percent of the canvas
Lighting/mood: soft and cheerful
Color palette: pastel but species-appropriate; keep the animal easy for a preschool child to identify
Text (verbatim): ""
Constraints: no text, no letters, no numbers, no logo, no watermark, no extra animals, no props, no cropped ears, paws, fins, or tail
Avoid: photorealism, complex background, scary expression, clutter, anatomy errors, duplicate limbs
```

Use the symbol order from `image-atlas-manifest.json`: ant, bear, bird, butterfly, cat, chick, cow, crab, deer, dog, dolphin, elephant, fish, fox, frog, giraffe, horse, koala, lion, monkey, octopus, owl, panda, polar-bear, rabbit, turtle, cicada, crocodile, pig, mouse.

- [ ] **Step 3: Inspect all 30 outputs and regenerate only failures**

Check each output for exact species recognition, full-body visibility, consistent padding, clean edges, no text, and visual compatibility with the supplied reference. Regenerate only the failed symbol with a targeted prompt such as `make the ears and long trunk unmistakably elephant-like; preserve the same cute pastel picture-card style and square framing`.

- [ ] **Step 4: Write the source manifest notes**

Create `artwork/imagegen/animals-v2/README.md` containing the final symbol order, the shared prompt, the date, and a short note for any regenerated symbol. Do not include generated source images in the public PWA path.

- [ ] **Step 5: Verify the legacy SVG is byte-for-byte unchanged**

Run:

```powershell
Get-FileHash 'public/images/kana-to-picture/atlases/animals-01.svg' -Algorithm SHA256
```

Expected: the hash matches the value recorded in Step 1.

### Task 2: Compose the project-bound WebP atlas

**Files:**
- Create: `scripts/compose-animal-atlas.py`
- Create: `public/images/kana-to-picture/atlases/animals-01-v2.webp`
- Test: `scripts/test_compose_animal_atlas.py`

**Interfaces:**
- Consumes: `artwork/imagegen/animals-v2/*.png`
- Produces: a 1,920×1,600px WebP with 6 columns, 5 rows, and 320px cells; all 30 cells contain an animal

- [ ] **Step 1: Add a failing composition check**

The Python `unittest` check must assert that the output exists, has the expected dimensions, is WebP, is smaller than 25MB, and that all 30 source filenames are consumed exactly once.

- [ ] **Step 2: Run the check and confirm it fails before the composer exists**

Run:

```powershell
python -m unittest scripts/test_compose_animal_atlas.py
```

Expected: FAIL because the composer and final atlas do not exist yet.

- [ ] **Step 3: Implement the deterministic composer**

Use Pillow to resize each source image into a 320×320 cell using contain behavior, place cells row-major by the manifest symbol order, and export WebP at a quality that keeps the file comfortably below 25MB. The script must fail with a clear error if a source symbol is missing or if the output exceeds 25MB.

- [ ] **Step 4: Run the composer and its check**

Run:

```powershell
python scripts/compose-animal-atlas.py
python -m unittest scripts/test_compose_animal_atlas.py
```

Expected: PASS; the output is present at `public/images/kana-to-picture/atlases/animals-01-v2.webp` and is below 25MB.

- [ ] **Step 5: Visually inspect the atlas**

Open the generated WebP and confirm that every cell contains the intended species and no cell is cropped. If any source is wrong, regenerate that source and rerun the composer.

### Task 3: Add raster-grid atlas metadata and rendering

**Files:**
- Modify: `src/features/question-types/kana-to-picture/data/image-atlas-manifest.json`
- Modify: `src/features/question-types/kana-to-picture/model/imageAtlas.ts`
- Modify: `src/features/question-types/kana-to-picture/components/SpriteImage.tsx`
- Test: `src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`
- Test: `src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx`

**Interfaces:**
- Consumes: `ImageAtlas` metadata with `format: 'svg-symbol' | 'raster-grid'`; raster metadata includes `columns`, `rows`, and `cellSize`
- Produces: `resolveImageAtlas` validation and a `SpriteImage` that renders an accessible cropped raster cell for animal refs while preserving the existing SVG `<use>` path for other atlases

- [ ] **Step 1: Write failing manifest and component tests**

Add tests asserting that the animal manifest resolves to `/images/kana-to-picture/atlases/animals-01-v2.webp`, has 6 columns, 5 rows, and a 320px cell size; the existing food/object/nature entries remain SVG atlases. Add a `SpriteImage` test that expects a role `img` element with the new WebP URL and a background position derived from a known symbol index, while the existing dog SVG test continues to expect `<use>`.

- [ ] **Step 2: Run the focused tests and confirm the new expectations fail**

Run:

```powershell
npm test -- --run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx
```

Expected: FAIL for the new raster expectations.

- [ ] **Step 3: Extend the manifest model and validator**

Add a discriminated atlas format. Validate that raster atlases have positive integer columns, rows, and cell size, that `symbols.length <= columns * rows`, and that existing SVG entries continue to validate without raster fields. Point only `animals-01` at the new WebP and retain all 30 symbol IDs in the existing order.

- [ ] **Step 4: Implement raster rendering without changing accessibility**

For `raster-grid`, render a square `div` or equivalent role `img` with `aria-label`, `background-image`, `background-size`, and `background-position` based on the symbol index. Keep the current external SVG `<use>` rendering for SVG atlases. Preserve the `width` and `height` props and avoid exposing decorative blank grid cells.

- [ ] **Step 5: Run the focused tests and confirm they pass**

Run the same focused test command from Step 2. Expected: PASS.

### Task 4: Expand the question contract to four choices

**Files:**
- Modify: `src/features/question-types/kana-to-picture/model/validator.ts`
- Test: `src/features/question-types/kana-to-picture/model/validator.test.ts`
- Test: `src/features/question-types/kana-to-picture/model/loader.test.ts`
- Test: `src/features/question-types/kana-to-picture/model/loader.bank-contract.test.ts`

**Interfaces:**
- Consumes: raw question JSON with exactly four choices
- Produces: typed `KanaToPictureQuestion` values with one correct choice and three validated distractors

- [ ] **Step 1: Change fixtures and add failing four-choice assertions**

Update the unit fixture to contain four choices, change the valid length assertion to 4, and replace the three-choice rejection cases with two-choice and five-choice rejection cases. Update the loader contract fixture to generate one correct plus three distractors and assert every loaded question has four unique choice IDs.

- [ ] **Step 2: Run focused validator tests and confirm the old contract fails**

Run:

```powershell
npm test -- --run src/features/question-types/kana-to-picture/model/validator.test.ts src/features/question-types/kana-to-picture/model/loader.test.ts src/features/question-types/kana-to-picture/model/loader.bank-contract.test.ts
```

Expected: FAIL until the validator and fixtures agree on four choices.

- [ ] **Step 3: Update the validator to require exactly four choices**

Change only the cardinality check from 3 to 4; keep the existing correct-reading and distractor-prefix rules unchanged. Keep duplicate choice-ID and image-reference validation intact.

- [ ] **Step 4: Run focused tests and confirm they pass**

Run the same focused command. Expected: PASS for the updated contract tests.

### Task 5: Update the 100-question bank and animal coverage

**Files:**
- Modify: `src/features/question-types/kana-to-picture/data/questions.json`
- Modify: `src/features/question-types/kana-to-picture/model/loader.test.ts`
- Test: `src/features/question-types/kana-to-picture/model/loader.bank-contract.test.ts`
- Test: `src/features/question-types/kana-to-picture/model/loader.test.ts`

**Interfaces:**
- Consumes: the 30-symbol animal manifest and four-choice validator
- Produces: 100 valid questions, each with four choices, with all animal symbols referenced at least once

- [ ] **Step 1: Add a failing animal-coverage test**

Load the bank, collect `animals-01` symbol IDs from every choice, and assert that the set contains all 30 manifest symbols. Also assert that each question has exactly four choices and that the normalized labels are used.

- [ ] **Step 2: Run the focused loader test and confirm it fails**

Run:

```powershell
npm test -- --run src/features/question-types/kana-to-picture/model/loader.test.ts
```

Expected: FAIL because the existing bank has three choices and omits animal symbols required by the expanded manifest.

- [ ] **Step 3: Add the fourth distractor to all 100 questions**

Preserve each question's correct choice and three existing distractors, adding one fourth distractor with a unique choice ID. Choose the new reading so it does not start with the question kana and avoid duplicate image references within a question. Include all newly required animal readings in the bank so every manifest symbol is referenced. Normalize the approved animal labels without changing question readings that are already valid.

- [ ] **Step 4: Run the focused loader test and confirm it passes**

Run the same command from Step 2. Expected: PASS for 100 questions, four choices, unique correct readings, valid distractor prefixes, and complete animal coverage.

### Task 6: Update PWA/build coverage and run the full verification suite

**Files:**
- Modify: `src/pwa.test.ts`
- Modify: `vite.config.ts` to explicitly include the new WebP atlas alongside the existing atlas assets
- Modify: `src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx` and `KanaQuestion.test.tsx` if four-choice rendering assertions need updating

**Interfaces:**
- Consumes: the new WebP atlas and updated manifest
- Produces: production output with the WebP atlas precached and no regression in SVG atlas behavior

- [ ] **Step 1: Add a failing PWA assertion for the new WebP**

After building, assert that `animals-01-v2.webp` exists in `dist` and that its path appears in `sw.js`. Keep the existing assertions for the legacy SVG assets and the other three atlases.

- [ ] **Step 2: Run the PWA test and confirm the new assertion fails before build/config changes**

Run:

```powershell
npm run build
npm run test:pwa
```

Expected: FAIL if the new WebP is not yet included in the service-worker precache assertions.

- [ ] **Step 3: Update the PWA asset configuration and tests**

Ensure the new WebP is included by the existing `images/**/*.{svg,png,jpg,jpeg,webp}` glob and referenced by the manifest. Update the PWA test to count the actual SVG question images without treating the new atlas as a legacy SVG, and assert that the WebP path is precached.

- [ ] **Step 4: Run all required checks**

Run:

```powershell
npm run typecheck
npm test
npm run build
npm run test:pwa
```

Expected: all commands exit successfully; the old SVG remains unchanged; the WebP is below 25MB; all 100 questions load with four choices; and all 30 animal symbols are used.

- [ ] **Step 5: Commit the implementation as a coherent change**

Run:

```powershell
git add artwork/imagegen/animals-v2 public/images/kana-to-picture/atlases/animals-01-v2.webp scripts src/features/question-types/kana-to-picture src/pwa.test.ts vite.config.ts
git commit -m "feat: add generated animal raster atlas"
```
