# Task 7 Report — child-friendly layout and accessibility foundation

## Status

Implemented and committed. The shared layout, primary action button, global responsive/accessibility styles, and existing-page integration are complete without changing quiz, routing, or history domain behavior.

## Commit hash(es)

The Task 7 implementation commit was created with the required message:

```text
style: add child friendly accessible layout
```

- `ea9527bfcfd4690af1e954212326bdba362b72f8` — `style: add child friendly accessible layout`
- `096370529ecbb64f578c282f46a1c28566eef5e7` — `fix: make build compatible with es2020`
- `c8588f3e73823a89d21ab2ee11019b739d931fba` — `fix: improve focus ring contrast`

## Files changed

- Added `src/shared/components/PageLayout.tsx` and focused tests.
- Added `src/shared/components/PrimaryButton.tsx` and focused tests.
- Added `src/styles/global.css` with local, responsive, high-contrast styles, visible focus rings, and 44px-or-larger action targets.
- Integrated `PageLayout` into Home, Quiz, Result, and History pages.
- Integrated `PrimaryButton` into the Home and Quiz primary actions.
- Moved kana/choice and feedback presentation styles from inline/component CSS into global CSS.
- Preserved the existing feedback text and icons (`正解！`/`不正解。`, ✅/❌).

## TDD evidence

- RED: `npx vitest run src/shared/components` failed during collection because `PageLayout` and `PrimaryButton` did not exist.
- GREEN: the focused suite passed with a bounded worker configuration: 2 files, 3 tests passed.

## Verification

| Command | Result |
| --- | --- |
| `npx vitest run src/shared/components --pool=threads --no-file-parallelism --maxWorkers=1 --minWorkers=1` | PASS — 2 files, 3 tests |
| `npm run typecheck` | PASS |
| `npx vitest run src/pages src/features/quiz/components src/features/question-types/kana-to-picture/components --pool=threads --no-file-parallelism --maxWorkers=1 --minWorkers=1` | PASS — 6 files, 11 tests |
| `npm run build` | PASS after the compatibility fix; clean Vite build generated `dist/` |

## Concerns

The build-target compatibility issue found during Task 7 verification was fixed in `0963705`: `.at()` calls now use ES2020-compatible indexing and `audioSrc` is explicitly narrowed before object spread. The clean build passed and generated local `dist/` output.

The review finding about focus contrast was fixed in `c8588f3` by changing the focus outline to the darker `#0f172a`; shared tests and typecheck pass.

The default Vitest invocation also remains slow to terminate in this environment after printing successful results; the bounded single-worker invocation exits cleanly and was used for final focused verification.
