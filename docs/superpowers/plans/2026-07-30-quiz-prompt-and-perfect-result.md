# ひらがな問題文・回答後表示・全問正解演出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 問題の指示文を明確にし、回答確定後だけ正誤を表示し、5問全問正解時だけCSS演出を表示する。

**Architecture:** `KanaQuestion`に問題指示文を追加し、回答状態は既存の`QuizPage`と`lastAnswer`を使う。全問正解演出は`ResultPage`から独立した`PerfectResultCelebration`コンポーネントとして描画し、正解判定と装飾を分離する。星・紙吹雪はCSSだけで表現する。

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, CSS, React Router.

## Global Constraints

- 問題文は`「{kana}」から はじまる ことばを えらぼう`形式にする。
- 絵を選択しただけでは正誤・正解の回答結果テキストを表示しない。
- `回答する`を押した後だけ既存の回答フィードバックと`次の問題`を表示する。
- 全問正解条件は`score === result.questions.length`とする。
- 全問正解でない場合は特別演出のDOMを描画しない。
- 演出は外部素材、外部フォント、効果音、追加npmパッケージを使用しないCSS-onlyとする。
- `prefers-reduced-motion: reduce`では星・紙吹雪のアニメーションを停止する。
- 問題データ、履歴保存形式、PWA設定、1セッション5問、正規表現検証は変更しない。
- カバレッジのStatements / Branches / Functions / Linesは各80%以上を維持する。
- 既存の作業記録変更はステージしない。

---

### Task 1: 問題指示文の表示

**Files:**
- Modify: `src/features/question-types/kana-to-picture/components/KanaQuestion.tsx`
- Test: `src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing `KanaQuestionProps` and `question.kana`.
- Produces: accessible instruction text `「{question.kana}」から はじまる ことばを えらぼう` between the kana heading and picture choices.

- [ ] **Step 1: Write the failing test**

Add this assertion to the existing `あ` fixture test:

```typescript
expect(screen.getByText('「あ」から はじまる ことばを えらぼう')).toBeInTheDocument()
```

- [ ] **Step 2: Run the focused test and confirm it fails**

```bash
npm run test -- --run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx
```

Expected: the new text assertion fails because `KanaQuestion` currently renders only the kana heading and choices.

- [ ] **Step 3: Implement the minimal UI change**

Render this paragraph immediately after the kana heading and before the choices:

```tsx
<p className="kana-question__instruction">
  「{question.kana}」から はじまる ことばを えらぼう
</p>
```

Add only the CSS needed for readable spacing and mobile wrapping. Do not change choice state or answer behavior.

- [ ] **Step 4: Verify and commit**

Run the focused test and `npm run typecheck`, then commit:

```bash
git add src/features/question-types/kana-to-picture/components/KanaQuestion.tsx src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx src/styles/global.css
git commit -m "feat: clarify kana question instructions"
```

### Task 2: 回答確定後だけフィードバックを表示する回帰テスト

**Files:**
- Modify: `src/pages/QuizPage/QuizPage.test.tsx`
- Modify only if the test exposes a regression: `src/pages/QuizPage/QuizPage.tsx`

**Interfaces:**
- Consumes: existing `pendingChoiceId`, `lastAnswer`, `answer()`, and `AnswerFeedback` flow.
- Produces: tests proving selection is not answer submission and result text appears only after `回答する`.

- [ ] **Step 1: Strengthen the behavior test**

After clicking a picture but before clicking `回答する`, assert both feedback messages are absent and the answer button is enabled:

```typescript
await user.click(screen.getByRole('button', { name: 'りんご' }))
expect(screen.queryByText('正解！')).not.toBeInTheDocument()
expect(screen.queryByText('不正解。')).not.toBeInTheDocument()
expect(screen.getByRole('button', { name: '回答する' })).toBeEnabled()
await user.click(screen.getByRole('button', { name: '回答する' }))
expect(screen.getByText('正解！')).toBeInTheDocument()
```

Keep the existing assertion that a different picture can be selected before submission.

- [ ] **Step 2: Run and verify the focused test**

```bash
npm run test -- --run src/pages/QuizPage/QuizPage.test.tsx
```

The current two-step implementation should pass. If it does not, change only the minimal state transition needed to keep picture taps as selection and `回答する` as submission.

- [ ] **Step 3: Run related tests and commit**

```bash
npm run test -- --run src/pages/QuizPage/QuizPage.test.tsx src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx
git add src/pages/QuizPage/QuizPage.test.tsx src/pages/QuizPage/QuizPage.tsx
git commit -m "test: preserve feedback after answer confirmation"
```

### Task 3: 全問正解のCSS演出

**Files:**
- Create: `src/pages/ResultPage/PerfectResultCelebration.tsx`
- Test: `src/pages/ResultPage/PerfectResultCelebration.test.tsx`
- Modify: `src/pages/ResultPage/ResultPage.tsx`
- Modify: `src/pages/ResultPage/ResultPage.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `PerfectResultCelebration` with no props, rendering a status message and decorative star/confetti elements.
- Consumes: `ResultPage`'s computed `score` and `result.questions.length` only for the all-correct conditional.

- [ ] **Step 1: Write the failing component test**

Create a test that renders `<PerfectResultCelebration />` and expects a status containing `ぜんもんせいかい！`, plus `data-testid="perfect-result-stars"` and `data-testid="perfect-result-confetti"`. It must fail because the component does not exist.

- [ ] **Step 2: Implement the minimal celebration component**

Render a wrapper with `role="status"`, the exact message `ぜんもんせいかい！`, and two decorative children with `aria-hidden="true"` and the stable test IDs. Keep score calculation out of this component.

- [ ] **Step 3: Add CSS animation and reduced-motion handling**

Add readable result styling, a bounded set of star/confetti decoration elements, and animations. Include:

```css
@media (prefers-reduced-motion: reduce) {
  .perfect-result__star,
  .perfect-result__confetti {
    animation: none;
  }
}
```

Ensure the result remains readable at a 375px-wide viewport.

- [ ] **Step 4: Add ResultPage conditional tests and wire the component**

Use a 5/5 completed session fixture and assert the status/test IDs exist. Keep the existing 4/5 fixture and assert they are absent. In `ResultPage`, calculate:

```typescript
const score = result.answers.filter((answer) => answer.isCorrect).length
const isPerfect = score === result.questions.length
```

Render `{isPerfect && <PerfectResultCelebration />}` near the score without changing history saving or result links.

- [ ] **Step 5: Run focused tests and typecheck**

```bash
npm run test -- --run src/pages/ResultPage/PerfectResultCelebration.test.tsx src/pages/ResultPage/ResultPage.test.tsx
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/ResultPage/PerfectResultCelebration.tsx src/pages/ResultPage/PerfectResultCelebration.test.tsx src/pages/ResultPage/ResultPage.tsx src/pages/ResultPage/ResultPage.test.tsx src/styles/global.css
git commit -m "feat: celebrate perfect hiragana results"
```

### Task 4: 全体検証

**Files:**
- Test: all existing `src/**/*.test.ts` and `src/**/*.test.tsx`

- [ ] **Step 1: Run typecheck and all tests**

```bash
npm run typecheck
npm run test
```

Expected: all tests pass, including prompt, answer-confirmation, result, history, and 100-question tests.

- [ ] **Step 2: Run coverage**

```bash
npm run test:coverage
```

Expected: Statements, Branches, Functions, and Lines each remain at least 80%.

- [ ] **Step 3: Build and verify PWA**

```bash
npm run build
npm run test:pwa
```

Expected: production build and offline precache tests pass; no new PWA assets are required for the CSS-only celebration.

- [ ] **Step 4: Review final status**

```bash
git diff --check
git status --short
git log -5 --oneline
```

Confirm only intended files are changed and existing unrelated report modifications remain unstaged.
