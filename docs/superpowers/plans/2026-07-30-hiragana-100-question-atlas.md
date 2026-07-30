# ひらがな100問・複数画像アトラス Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 100問のひらがな絵選択問題を、複数SVGアトラス・PWAオフライン対応・履歴全件削除付きで提供する。

**Architecture:** `kana-to-picture`内に画像アトラスの型・マニフェストloader・SVG表示コンポーネントを追加し、問題JSONは`{ atlasId, symbolId }`で画像を参照する。問題loaderはマニフェストと問題JSONを一緒に検証し、quiz sessionは既存どおり100問から5問を選ぶ。履歴削除はhistory storageの`clearHistory`とHistoryPageの確認ダイアログに分離する。

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, vite-plugin-pwa, JSON, inline SVG `<use>`, localStorage.

## Global Constraints

- 問題データはJSONで`src/features/question-types/kana-to-picture/data/`に置く。
- 問題形式固有のコード・データ・画像は`src/features/question-types/kana-to-picture/`に閉じ込める。
- 1セッションの出題数は5問のままにする。
- 語頭判定はエスケープ済み正規表現`^<kana>`で行う。
- 「ん」「を」は現在の語頭絵選択形式の対象外とし、44音を対象にする。
- 外部API、外部画像、外部フォント、データベース、ログインは追加しない。
- 履歴削除は`manabinote.history.v1`だけを削除する。
- Statements、Branches、Functions、Linesのカバレッジは各80%以上にする。
- 変更は関連ファイルだけをコミットし、既存の作業記録変更はステージしない。

---

### Task 1: 画像アトラスの型とマニフェスト検証

**Files:**
- Create: `src/features/question-types/kana-to-picture/data/image-atlas-manifest.json`
- Create: `src/features/question-types/kana-to-picture/model/imageAtlas.ts`
- Modify: `src/features/question-types/kana-to-picture/model/types.ts`
- Modify: `src/features/question-types/kana-to-picture/model/validator.ts`
- Test: `src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`
- Test: `src/features/question-types/kana-to-picture/model/validator.test.ts`

**Interfaces:**
- `PictureImageRef = { atlasId: string; symbolId: string }`
- `ImageAtlas = { id: string; src: string; symbols: string[] }`
- `ImageAtlasManifest = { atlases: ImageAtlas[] }`
- `loadImageAtlasManifest(): ImageAtlasManifest`
- `resolveImageAtlas(ref: PictureImageRef, manifest?: ImageAtlasManifest): ImageAtlas`
- `PictureChoice.image: PictureImageRef`

- [ ] **Step 1: Write failing manifest tests**

  `imageAtlas.test.ts`に、正常なマニフェストを読み込めること、重複するアトラスIDを拒否すること、同じアトラス内の重複シンボルを拒否すること、未知のアトラスまたはシンボルを`QuestionDataError`で拒否することを追加する。

- [ ] **Step 2: Run manifest tests and confirm expected failure**

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`

  Expected: `imageAtlas.ts`のexportがないためテストが失敗する。

- [ ] **Step 3: Implement manifest types and loader**

  `imageAtlas.ts`でJSONをimportし、`isRecord`相当のガードで`atlases`, `id`, `src`, `symbols`を検証する。`resolveImageAtlas`はIDとシンボルを検索し、見つからなければ既存の`QuestionDataError`を投げる。検索用の内部Mapはloader内で作成し、呼び出し側にMapを露出しない。

- [ ] **Step 4: Update question validation to use image references**

  `PictureChoice`の`imageSrc`を`image`へ置き換え、`validateChoice`で画像参照を検証する。問題validatorはマニフェストを受け取れる形にし、loaderから同じマニフェストを渡す。既存のreading一致、正規表現による誤答排除、ID重複検証は維持する。

- [ ] **Step 5: Run focused tests**

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts`

  Expected: manifest and choice reference tests pass; old question fixtures will be updated in Task 2 before the full suite.

- [ ] **Step 6: Commit the atlas model**

  ```bash
  git add src/features/question-types/kana-to-picture/data/image-atlas-manifest.json src/features/question-types/kana-to-picture/model/imageAtlas.ts src/features/question-types/kana-to-picture/model/types.ts src/features/question-types/kana-to-picture/model/validator.ts src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts
  git commit -m "feat: add multi-atlas image references"
  ```

### Task 2: SVGアトラス表示とオフライン対象

**Files:**
- Create: `public/images/kana-to-picture/atlases/animals-01.svg`
- Create: `public/images/kana-to-picture/atlases/food-01.svg`
- Create: `public/images/kana-to-picture/atlases/objects-01.svg`
- Create: `public/images/kana-to-picture/atlases/nature-01.svg`
- Create: `src/features/question-types/kana-to-picture/components/SpriteImage.tsx`
- Modify: `src/features/question-types/kana-to-picture/components/PictureChoice.tsx`
- Test: `src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx`
- Modify: `vite.config.ts`
- Modify: `src/pwa.test.ts`

**Interfaces:**
- `SpriteImageProps = { image: PictureImageRef; alt: string }`
- `SpriteImage` renders one `<svg>` with one external `<use>` reference.

- [ ] **Step 1: Write failing SpriteImage test**

  Render a known `animals-01` reference and assert that the SVG has `role="img"`, the provided accessible label, and a `<use href="/images/kana-to-picture/atlases/animals-01.svg#dog">` element. Render through `PictureChoice` as an integration assertion.

- [ ] **Step 2: Run the test and confirm it fails**

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx`

  Expected: `SpriteImage` is not defined and the current `<img>` markup does not contain a `<use>` element.

- [ ] **Step 3: Add four categorized SVG atlases**

  Add a root `<svg>` containing `<symbol id="..." viewBox="0 0 160 160">` entries. Use the existing flat illustration style and keep each symbol self-contained. Assign all 100 vocabulary symbols to exactly one atlas and keep the manifest symbol lists synchronized.

- [ ] **Step 4: Implement SpriteImage and migrate PictureChoice**

  `SpriteImage` resolves the atlas source through `loadImageAtlasManifest()` and builds the fragment URL. `PictureChoice` passes `choice.image` and `choice.label`; remove the old `imageSrc` dependency while preserving `aria-label`, selected state, disabled state, and the 160×160 intrinsic layout.

- [ ] **Step 5: Make PWA precache rules explicit for multiple atlases**

  Add `images/kana-to-picture/atlases/**/*.{svg,png,jpg,jpeg,webp}` to the Workbox glob patterns. Extend `src/pwa.test.ts` to read the manifest and assert every atlas source path appears in `dist/sw.js`, and assert that no external URL is precached.

- [ ] **Step 6: Run focused UI and PWA tests after a production build**

  Run: `npm run typecheck`

  Run: `npm run build`

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx`

  Run: `npm run test:pwa`

  Expected: the SVG use references render, the build contains all four atlas files, and the PWA test finds all four paths.

- [ ] **Step 7: Commit the atlas assets and component**

  ```bash
  git add public/images/kana-to-picture/atlases src/features/question-types/kana-to-picture/components/SpriteImage.tsx src/features/question-types/kana-to-picture/components/PictureChoice.tsx src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx vite.config.ts src/pwa.test.ts
  git commit -m "feat: render choices from split svg atlases"
  ```

### Task 3: 100問の問題JSONとloader契約

**Files:**
- Modify: `src/features/question-types/kana-to-picture/data/questions.json`
- Modify: `src/features/question-types/kana-to-picture/model/loader.ts`
- Modify: `src/features/question-types/kana-to-picture/model/loader.test.ts`
- Modify: `src/features/question-types/kana-to-picture/model/validator.test.ts`
- Modify: `src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`
- Modify: `src/features/quiz/QuizSessionProvider.test.tsx`
- Modify: `src/features/quiz/model/quizSession.test.ts`
- Modify: `src/pages/QuizPage/QuizPage.test.tsx`
- Modify: `src/pages/ResultPage/ResultPage.test.tsx`

**Interfaces:**
- `loadKanaToPictureQuestions(): KanaToPictureQuestion[]` returns exactly the validated JSON pool.
- `questions.json` contains 100 unique question IDs and 100 unique correct readings.

- [ ] **Step 1: Add failing loader count and distribution assertions**

  Extend `loader.test.ts` with assertions for `questions.length === 100`, every choice count equals 3, every question uses one of the 44 allowed initial kana, each allowed kana occurs at least twice, and correct readings are unique.

- [ ] **Step 2: Run loader tests and confirm they fail**

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/model/loader.test.ts`

  Expected: the current five-question JSON fails the count and distribution assertions.

- [ ] **Step 3: Replace the five-question JSON with 100 explicit records**

  Use two records for each of these 44 initial kana: `あ い う え お`, `か き く け こ`, `さ し す せ そ`, `た ち つ て と`, `な に ぬ ね の`, `は ひ ふ へ ほ`, `ま み む め も`, `や ゆ よ`, `ら り る れ ろ`, `わ`. Add one extra record for each of `あ い う お か き こ さ た な は ま`. Use distinct child-friendly words and atlas symbols for each correct reading.

- [ ] **Step 4: Generate explicit distractors that pass the shared regex rule**

  For each question, include exactly two choices whose readings begin with a different allowed kana. Do not add a question-specific exception. Keep `correctChoiceId` aligned with the choice whose `reading` equals the question `reading`.

- [ ] **Step 5: Update all typed test fixtures to use image references**

  Replace every `imageSrc` fixture with `{ atlasId: 'animals-01', symbolId: 'dog' }` or another manifest entry. Keep synthetic tests small and use valid readings for fixtures that pass through the loader.

- [ ] **Step 6: Run loader and full question tests**

  Run: `npm run test -- --run src/features/question-types/kana-to-picture/model/loader.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`

  Expected: 100-question count, distribution, uniqueness, atlas references, and regex validation all pass.

- [ ] **Step 7: Commit the 100-question data**

  ```bash
  git add src/features/question-types/kana-to-picture/data/questions.json src/features/question-types/kana-to-picture/model/loader.ts src/features/question-types/kana-to-picture/model/loader.test.ts src/features/question-types/kana-to-picture/model/validator.test.ts src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx src/features/quiz/QuizSessionProvider.test.tsx src/features/quiz/model/quizSession.test.ts src/pages/QuizPage/QuizPage.test.tsx src/pages/ResultPage/ResultPage.test.tsx
  git commit -m "feat: expand hiragana question bank to 100"
  ```

### Task 4: 履歴の全件削除

**Files:**
- Modify: `src/features/history/model/historyStorage.ts`
- Modify: `src/features/history/model/historyStorage.test.ts`
- Modify: `src/pages/HistoryPage/HistoryPage.tsx`
- Modify: `src/pages/HistoryPage/HistoryPage.test.tsx`

**Interfaces:**
- `clearHistory(storage?: Storage): StorageWriteResult`
- `HistoryPage` manages loaded history, confirmation state, and delete failure state locally.

- [ ] **Step 1: Write failing storage deletion tests**

  Add a test that writes both `manabinote.history.v1` and `other.key`, calls `clearHistory(storage)`, expects `{ ok: true }`, expects `loadHistory(storage)` to be empty, and expects `other.key` to remain. Add a test for a storage whose `removeItem` throws and expect `{ ok: false, reason: 'unavailable' }`.

- [ ] **Step 2: Run storage tests and confirm they fail**

  Run: `npm run test -- --run src/features/history/model/historyStorage.test.ts`

  Expected: `clearHistory` is not exported.

- [ ] **Step 3: Implement clearHistory**

  In `historyStorage.ts`, return unavailable when storage is absent. Otherwise call `storage.removeItem(HISTORY_KEY)` inside `try/catch`, return `{ ok: true }` on success, and return `{ ok: false, reason: 'unavailable' }` on exception. Do not call `storage.clear()`.

- [ ] **Step 4: Add failing HistoryPage interaction tests**

  Seed one valid record using `appendHistory`. Assert the page shows `履歴をすべて削除`. Click it and assert a dialog with `削除する` and `キャンセル`. Click `キャンセル` and assert the record remains. Open again, click `削除する`, and assert `まだ学習履歴がありません` appears and the delete button disappears. Add a failure fixture whose storage deletion fails only if the page is made injectable; otherwise cover the storage failure at the unit level.

- [ ] **Step 5: Implement the confirmation dialog**

  Use a local `confirmOpen` state. Render a semantic `role="dialog"` with `aria-modal="true"` and explicit buttons. On confirm, call `clearHistory()`, update state to `[]` only when it returns `ok: true`, and show a `role="alert"` message when it fails. Keep the home link available in both empty and non-empty states.

- [ ] **Step 6: Run history tests**

  Run: `npm run test -- --run src/features/history/model/historyStorage.test.ts src/pages/HistoryPage/HistoryPage.test.tsx`

  Expected: storage deletion and cancel/confirm UI behavior pass.

- [ ] **Step 7: Commit history deletion**

  ```bash
  git add src/features/history/model/historyStorage.ts src/features/history/model/historyStorage.test.ts src/pages/HistoryPage/HistoryPage.tsx src/pages/HistoryPage/HistoryPage.test.tsx
  git commit -m "feat: add history clear action"
  ```

### Task 5: 全体検証と手動確認

**Files:**
- Modify: `README.md` (only if command or data structure documentation is stale)
- Test: all existing `src/**/*.test.ts` and `src/**/*.test.tsx`

- [ ] **Step 1: Run type checking**

  Run: `npm run typecheck`

  Expected: TypeScript exits with code 0.

- [ ] **Step 2: Run the complete unit test suite**

  Run: `npm run test`

  Expected: all test files pass, including 100-question loader tests and history deletion tests.

- [ ] **Step 3: Run coverage and inspect all four thresholds**

  Run: `npm run test:coverage`

  Expected: Statements, Branches, Functions, and Lines each report at least 80%.

- [ ] **Step 4: Build and verify PWA output**

  Run: `npm run build`

  Run: `npm run test:pwa`

  Expected: `dist/index.html`, `dist/manifest.webmanifest`, `dist/sw.js`, all four atlas files, and all problem images are present and precached.

- [ ] **Step 5: Manually verify the mobile flow**

  At a 375×667 viewport, start a quiz, confirm that three choices and `回答する` remain usable without an initial vertical scroll, select and change a choice before answering, and complete a five-question session. Open history, confirm one record appears, cancel the clear dialog once, then confirm deletion and verify the empty state.

- [ ] **Step 6: Review the final diff and status**

  Run: `git diff --check`

  Run: `git status --short`

  Confirm only intended implementation files are staged/committed and existing `.superpowers/sdd/.../task-1-report.md` and `task-3-report.md` changes remain untouched.
