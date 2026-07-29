# Task 5 Report — Kana-to-picture question UI and local SVG assets

## Status

DONE. Implemented the kana-to-picture question UI and local SVG assets within the requested boundary.

## Commit

- `e3b12c0f3ceefe83fa55e252170414e55d6d7b5e` — `feat: add kana to picture question UI`.
- `7c6945f03937ea1b22342b1e2feee7f8d61adc04` — `fix: stabilize kana question accessibility tests`.

## Files changed

- Added `src/features/question-types/kana-to-picture/components/KanaQuestion.tsx`.
- Added `src/features/question-types/kana-to-picture/components/PictureChoice.tsx`.
- Added `src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`.
- Added the 15 requested local SVG assets under `public/images/kana-to-picture/`.
- Updated all seeded `imageSrc` values in `src/features/question-types/kana-to-picture/data/questions.json` to the separated local asset folder.
- Registered RTL cleanup in `src/test/setup.ts` and gave each picture button an explicit accessible name.

## Verification

- `cmd.exe /d /c ".\\node_modules\\.bin\\tsc.cmd --noEmit"`: passed with exit code 0.
- JSON/assets structural check: passed; 5 questions, 3 choices per question, 0 invalid JSON paths, 15 SVG assets, and 0 SVGs missing the required viewBox or containing `url(`.
- `npx vitest run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`: passed; 1 file / 3 tests.
- `npm run typecheck`: passed; `tsc --noEmit` exited with code 0.
- `git diff --check`: passed.

## Concerns

- The first focused run exposed duplicated button accessible names and missing RTL cleanup between tests; both were fixed and the focused suite then passed.
- Pre-existing modifications to Task 1 and Task 3 reports were preserved and excluded from the Task 5 commit.
