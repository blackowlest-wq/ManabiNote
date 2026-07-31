# 失敗後の書き順色表示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 書く前の現在画を薄いお手本線で表示し、最初の失敗後にだけオレンジ色の書き順と開始ヒントを表示する。

**Architecture:** `StrokeOrderPage` の `feedback === 'retry'` を `showFailureHint` として `StrokeCanvas` に渡す。`StrokeCanvas` はこの状態が真のときだけ現在画へ `stroke-guide--active` を付与し、開始マークと矢印にも同じ状態を使う。完了画の青色表示、認識処理、レイアウトは変更しない。

**Tech Stack:** React, TypeScript, SVG, Vitest, Testing Library, Vite

## Global Constraints

- 対象は「あ、い、う、え、お」の既存の書き順練習MVPに限定する
- 静的フロントエンド構成を維持し、外部サービス依存を追加しない
- モバイルのタッチスクロール抑止、判定ロジック、SVGデータ、レイアウトを変更しない
- 「文字を なぞろう」は初期表示から常に表示する

## File Map

- Modify: `src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx` — 失敗後だけ現在画を色付きにする表示条件とprop名
- Modify: `src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx` — 初期・失敗後のガイド色を検証
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.tsx` — `showFailureHint` を渡す
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx` — ページからの状態受け渡しを検証

### Task 1: 失敗後の色表示を実装

**Files:**
- Modify: `src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx`
- Modify: `src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx`
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx`
- Modify: `src/pages/StrokeOrderPage/StrokeOrderPage.tsx`

**Interfaces:**
- `StrokeCanvasProps.showFailureHint?: boolean` は初期値 `false` とし、失敗後の現在画の色付き表示・開始マーク・矢印を制御する
- `StrokeOrderPage` は `feedback === 'retry'` を `showFailureHint` に渡す

- [ ] **Step 1: Write the failing tests**

  `StrokeCanvas.test.tsx` の初期表示テストで、現在画に `stroke-guide--active` が付かないことを確認し、失敗後テストで `showFailureHint` を指定した現在画にだけ `stroke-guide--active` が付くことを確認する。`StrokeOrderPage.test.tsx` のmock propも `showFailureHint` に変更し、失敗時に `shown`、成功時に `hidden` になることを確認する。

- [ ] **Step 2: Run focused tests to verify they fail**

  Run:

  ```text
  npm test -- src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx
  ```

  Expected: 初期表示で `stroke-guide--active` が付いているため、色表示の期待値が失敗する。

- [ ] **Step 3: Write the minimal implementation**

  `StrokeCanvas` のpropを `showFailureHint` に変更し、ガイドのclassNameを次の条件で組み立てる。

  ```tsx
  showFailureHint && isActive ? 'stroke-guide--active' : ''
  ```

  ページ側では次を渡す。

  ```tsx
  showFailureHint={feedback === 'retry'}
  ```

- [ ] **Step 4: Run focused tests to verify they pass**

  Run the same focused Vitest command and expect both test files to pass.

- [ ] **Step 5: Run the full verification suite**

  ```text
  npm test
  npm run typecheck
  npm run build -- --emptyOutDir=false
  npm run test:pwa
  ```

- [ ] **Step 6: Commit the implementation**

  ```text
  git add src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx
  git commit -m "fix: reveal stroke guide colors after failure"
  ```
