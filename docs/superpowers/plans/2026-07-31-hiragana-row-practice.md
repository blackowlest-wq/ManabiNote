# 基本ひらがな行別書き順練習 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基本ひらがな46文字を行単位で選び、1回最大5文字の短い書き順練習として提供する。

**Architecture:** かなモデルに11行の定義と46文字の固定順を追加し、データローダーが行IDから問題を抽出する。Providerは選択行だけでセッションを作り、練習画面のセッションなし状態を行選択UIに変更する。AnimCJKの中央値線を変換する開発用スクリプトで `strokes.json` を生成し、既存のSVGなぞりコンポーネントと判定ロジックは再利用する。

**Tech Stack:** React, TypeScript, SVG, JSON, Node.js, Vitest, Testing Library, Vite

## Global Constraints

- 基本ひらがな46文字のみを対象にし、濁音、半濁音、拗音、外来音は含めない
- あ行、か行、さ行、た行、な行、は行、ま行、や行、ら行、わ行、んの行グループを使う
- 1回のセッションは選択した行だけで、最大5文字にする
- 既存の書き順判定、失敗後ヒント、モバイル操作抑止、静的PWA構成を維持する
- AnimCJKの `svgsJaKana/<Unicode>.svg` をデータ生成元として記録する

## File Map

- Create: `src/features/question-types/kana-to-stroke/model/kanaRows.ts` — 行ID、表示名、行内かな順、46文字の固定順
- Modify: `src/features/question-types/kana-to-stroke/model/types.ts` — 46文字unionと行ID型
- Modify: `src/features/question-types/kana-to-stroke/model/loader.ts` — 行別問題抽出
- Modify: `src/features/question-types/kana-to-stroke/model/validator.ts` — 46文字データの検証
- Modify: `src/features/question-types/kana-to-stroke/model/*.test.ts` — 46文字・行別データのテスト
- Create: `scripts/generate-kana-stroke-data.mjs` — AnimCJK SVGからJSONへ変換する開発用スクリプト
- Modify: `src/features/question-types/kana-to-stroke/data/strokes.json` — 基本46文字のガイドデータ
- Modify: `src/features/question-types/kana-to-stroke/data/README.md` — 対象文字と生成元を更新
- Modify: `src/features/stroke-order/model/practiceSession.ts` — 行IDを持つ可変長セッション
- Modify: `src/features/stroke-order/StrokePracticeProvider.tsx` — 行別セッション開始
- Modify: `src/features/stroke-order/*.test.tsx` — 行別開始と再練習のテスト
- Modify: `src/pages/HomePage/HomePage.tsx` — 書き順練習画面へ遷移して行選択を表示
- Modify: `src/pages/HomePage/HomePage.test.tsx` — 行選択前の遷移を検証
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.tsx` — 行選択UIと行別開始
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx` — 行選択、短い行、進捗を検証
- Modify: `src/pages/StrokeResultPage/StrokeResultPage.tsx` — 行名・文字数に応じた結果と再練習
- Modify: `src/pages/StrokeResultPage/StrokeResultPage.test.tsx` — 行別結果を検証
- Modify: `src/styles/global.css` — 行選択ボタンの縦配置と選択状態

### Task 1: 46文字の行モデルとテスト

**Interfaces:**
- `STROKE_ROWS` は `{ id: StrokeRowId; label: string; kana: readonly StrokeKana[] }` の配列
- `STROKE_KANA` は基本46文字を五十音順に並べた固定配列
- `getStrokeRow(rowId: StrokeRowId)` は行定義を返す

- [ ] **Step 1: Write the failing model tests**

  `kanaRows.test.ts` に、行IDの順序、各行のかな配列、全46文字が重複なく含まれることを追加する。`loader.test.ts` に全46問の読み込みと `loadStrokeQuestionsForRow('ka')` が `['か','き','く','け','こ']` を返す期待値を追加する。

- [ ] **Step 2: Run the focused tests and verify RED**

  ```text
  node node_modules/vitest/vitest.mjs run src/features/question-types/kana-to-stroke/model/kanaRows.test.ts src/features/question-types/kana-to-stroke/model/loader.test.ts
  ```

  Expected: 行定義・行別ローダー・46文字の期待値が未実装または現行5文字データのため失敗する。

- [ ] **Step 3: Implement the row model and loader contract**

  `kanaRows.ts` に次の行を定義する。

  ```ts
  { id: 'a', label: 'あ行', kana: ['あ', 'い', 'う', 'え', 'お'] }
  { id: 'ka', label: 'か行', kana: ['か', 'き', 'く', 'け', 'こ'] }
  { id: 'sa', label: 'さ行', kana: ['さ', 'し', 'す', 'せ', 'そ'] }
  { id: 'ta', label: 'た行', kana: ['た', 'ち', 'つ', 'て', 'と'] }
  { id: 'na', label: 'な行', kana: ['な', 'に', 'ぬ', 'ね', 'の'] }
  { id: 'ha', label: 'は行', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'] }
  { id: 'ma', label: 'ま行', kana: ['ま', 'み', 'む', 'め', 'も'] }
  { id: 'ya', label: 'や行', kana: ['や', 'ゆ', 'よ'] }
  { id: 'ra', label: 'ら行', kana: ['ら', 'り', 'る', 'れ', 'ろ'] }
  { id: 'wa', label: 'わ行', kana: ['わ', 'を'] }
  { id: 'n', label: 'ん', kana: ['ん'] }
  ```

  `loadStrokeQuestionsForRow` は行定義のかな順で、検証済み問題を返す。

- [ ] **Step 4: Run focused model tests and verify GREEN**

  Run the same command from Step 2. Expect all row/model tests to pass after the data contract is updated.

### Task 2: AnimCJKから46文字データを生成

**Interfaces:**
- `node scripts/generate-kana-stroke-data.mjs` はネットワーク上のAnimCJK SVGを読み込み、`src/features/question-types/kana-to-stroke/data/strokes.json` を生成する
- 各strokeは `order`、`guidePath`、2点以上の`checkpoints`を持つ

- [ ] **Step 1: Write the data contract test**

  既存のloader/validatorテストを46文字向けに変更し、全問のstroke数が1以上、全strokeのcheckpoint数が2以上、座標が `0..200` に収まることを検証する。

- [ ] **Step 2: Run the data test and verify RED**

  ```text
  node node_modules/vitest/vitest.mjs run src/features/question-types/kana-to-stroke/model/loader.test.ts src/features/question-types/kana-to-stroke/model/validator.test.ts
  ```

  Expected: 現行データが5問しかないため、46問の固定順テストが失敗する。

- [ ] **Step 3: Add the generator and generate the JSON**

  スクリプトは `https://raw.githubusercontent.com/parsimonhi/animCJK/master/svgsJaKana/<codePoint>.svg` を取得し、`clip-path` 付き中央値pathをstroke順に1つずつ採用する。1024座標を200座標へ `200 / 1024` で縮小し、点列を `M ... L ...` のガイド線とcheckpointへ変換する。重複する分岐pathは同じstroke順の最初のpathだけを使う。

- [ ] **Step 4: Run the generator and data tests**

  ```text
  node scripts/generate-kana-stroke-data.mjs
  node node_modules/vitest/vitest.mjs run src/features/question-types/kana-to-stroke/model/loader.test.ts src/features/question-types/kana-to-stroke/model/validator.test.ts
  ```

  Expected: 46問が読み込まれ、全strokeのデータ契約テストが通る。

- [ ] **Step 5: Update the data attribution README**

  `README.md` に基本46文字の対象とAnimCJKの `svgsJaKana`、LGPLの出典を記載する。

### Task 3: 行別PracticeSessionとProvider

**Interfaces:**
- `PracticeSession.rowId: StrokeRowId` を保持する
- `createPracticeSession(questions, rowId, now)` は選択行の問題だけを受け入れる
- `startPractice(rowId)` は行別セッションを作成する

- [ ] **Step 1: Write failing session/provider tests**

  か行を開始すると先頭が「か」になり、問題数が5になること、や行を開始すると問題数が3になること、セッションの`rowId`が保持されることを追加する。

- [ ] **Step 2: Run session/provider tests and verify RED**

  ```text
  node node_modules/vitest/vitest.mjs run src/features/stroke-order/model/practiceSession.test.ts src/features/stroke-order/StrokePracticeProvider.test.tsx
  ```

- [ ] **Step 3: Generalize session validation and provider start**

  `PracticeSession` に `rowId` を追加し、固定5問の検証を選択行のかな配列との一致検証へ変更する。Providerは `loadStrokeQuestionsForRow(rowId)` の結果でセッションを作成する。

- [ ] **Step 4: Run session/provider tests and verify GREEN**

  Run the same command from Step 2 and expect row-specific session tests to pass.

### Task 4: 行選択画面と結果画面

**Interfaces:**
- `/stroke-order` のセッションなし状態は、`aria-pressed` 付きの行ボタンと開始ボタンを表示する
- `HomePage` の書き順ボタンは `/stroke-order` へ移動する
- `StrokeResultPage` は `session.rowId` の行名と実際の文字数を表示し、同じ行を再練習する

- [ ] **Step 1: Write failing page tests**

  行選択画面で「か行」を選んで開始すると「か」「1 / 5」が表示されること、や行では「1 / 3」になること、結果画面が「か行」と文字数を表示することを追加する。

- [ ] **Step 2: Run page tests and verify RED**

  ```text
  node node_modules/vitest/vitest.mjs run src/pages/HomePage/HomePage.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx src/pages/StrokeResultPage/StrokeResultPage.test.tsx
  ```

- [ ] **Step 3: Implement row selection and dynamic result copy**

  行選択UIを縦並びで追加し、選択行IDを `startPractice` に渡す。ResultPageの固定文言を行名・`questions.length`から組み立てる。CSSは既存のPrimaryButtonの視認性を保ち、選択中の行を明確にする。

- [ ] **Step 4: Run page tests and verify GREEN**

  Run the same command from Step 2 and expect all page tests to pass.

### Task 5: 全体検証とコミット

- [ ] **Step 1: Run full tests**

  ```text
  node node_modules/vitest/vitest.mjs run
  node node_modules/typescript/bin/tsc --noEmit
  node node_modules/typescript/bin/tsc -b
  node node_modules/vite/bin/vite.js build --emptyOutDir=false
  node node_modules/vitest/vitest.mjs run --config vitest.pwa.config.ts
  ```

- [ ] **Step 2: Review generated data and diff**

  `git diff --check`、46文字のJSON件数、行順、READMEの出典、不要な生成物の混入を確認する。

- [ ] **Step 3: Commit the implementation**

  ```text
  git add src scripts docs
  git commit -m "feat: add row-based hiragana stroke practice"
  ```
