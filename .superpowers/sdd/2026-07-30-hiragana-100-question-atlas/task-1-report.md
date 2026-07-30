# Task 1 Implementation Report

## Summary

Implemented Task 1 for the hiragana 100-question atlas migration in the existing worktree. Added the multi-atlas manifest model and validation, changed `PictureChoice` data from `imageSrc` to `image`, and updated question validation to verify atlas/symbol references while preserving the existing hiragana-start regex validation, reading-match validation, and duplicate ID checks.

## Changed files

- `src/features/question-types/kana-to-picture/data/image-atlas-manifest.json`
- `src/features/question-types/kana-to-picture/model/imageAtlas.ts`
- `src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`
- `src/features/question-types/kana-to-picture/model/types.ts`
- `src/features/question-types/kana-to-picture/model/validator.ts`
- `src/features/question-types/kana-to-picture/model/validator.test.ts`
- `src/features/question-types/kana-to-picture/model/loader.ts`
- `src/features/question-types/kana-to-picture/components/PictureChoice.tsx`
- `src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`
- `.superpowers/sdd/2026-07-30-hiragana-100-question-atlas/task-1-report.md`

## TDD record

1. Added failing tests in `imageAtlas.test.ts` and rewrote `validator.test.ts` around `PictureChoice.image`.
2. Ran:
   - `npm run test -- --run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`
3. Observed expected RED:
   - import resolution failure for `./imageAtlas` because `imageAtlas.ts` did not exist yet.
4. Implemented the minimal atlas manifest loader/resolver and validator changes.
5. Ran focused GREEN verification:
   - `npm run test -- --run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts`
   - Result: 2 test files passed, 26 tests passed, 0 failed.

## Additional verification

- Ran `npm run typecheck`
- Result: passed with exit code 0

## Self-review

- Kept the existing kana-prefix regex validation by preserving `startsWithKana`.
- Kept existing reading equality rules for the correct answer and exclusion rules for incorrect answers.
- Kept duplicate question ID and duplicate choice ID validation.
- Added atlas manifest validation for duplicate atlas IDs and duplicate symbols within a single atlas.
- Kept manifest lookup internals encapsulated inside the loader/resolver path; no lookup `Map` is exposed in the public types.
- Did not modify `questions.json`.

## Concerns

- `questions.json` still uses the pre-atlas shape and is intentionally untouched for Task 1, so the full loader/runtime path will remain incomplete until Task 2 updates fixtures/data.
- `PictureChoice.tsx` was adjusted only enough to keep TypeScript green without implementing atlas rendering behavior early; image rendering integration is still pending follow-up tasks.
- There were pre-existing unrelated modifications in:
  - `.superpowers/sdd/2026-07-30-hiragana-learning-app-implementation/task-1-report.md`
  - `.superpowers/sdd/2026-07-30-hiragana-learning-app-implementation/task-3-report.md`
  These were preserved and left unstaged.

## Round 1 fix: PictureChoice regression

### Issue

Review identified a load-bearing regression: `PictureChoice` still read the removed `imageSrc` field, so rendered `<img>` elements had no usable `src`.

### Fix

- Added a regression-focused component test in `src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx` that fails when the image source is empty or undefined-derived.
- Added `resolvePictureImageSrc` in `src/features/question-types/kana-to-picture/model/imageAtlas.ts`.
- Added `src/features/question-types/kana-to-picture/components/SpriteImage.tsx` as a minimal atlas-backed rendering path.
- Updated `PictureChoice.tsx` to render `SpriteImage` from `choice.image` instead of reading removed `imageSrc`.
- The current implementation validates atlas/symbol references through the manifest and returns a valid inline SVG data URL until later tasks provide the real atlas asset pipeline.

### Commands and results

1. RED verification:
   - `npm run test -- --run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`
   - Result: failed as expected with `expected null to be truthy` on the new image `src` assertion.

2. GREEN verification:
   - `npm run test -- --run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts`
   - Result: 3 files passed, 30 tests passed, 0 failed.

3. Typecheck:
   - `npm run typecheck`
   - Result: passed with exit code 0.

### Round 1 concerns

- The current `SpriteImage` path intentionally uses an inline SVG data URL placeholder derived from the validated manifest metadata. This keeps the UI functional now and preserves a narrow seam for Task 2+ to switch to real atlas assets without changing question data again.
