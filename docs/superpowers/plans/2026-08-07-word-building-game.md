# 絵からことばをつくるゲーム Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** 既存の絵と読みを再利用し、絵を見てひらがなと長音記号の文字タイルを順番に選ぶ5問の独立ゲームを追加する。

**Architecture:** src/features/word-builder/ に問題変換、純粋なセッション状態遷移、Providerを分離する。UIは /word-builder と /word-builder/result の2ページに分け、画像表示は既存の SpriteImage を再利用する。既存のかなクイズProviderや履歴保存には接続しない。

**Tech Stack:** React 18, TypeScript, React Router 6, Vitest, Testing Library, Vite

## Global Constraints

- 1プレイは重複なしの5問とする。
- 既存の loadKanaToPictureQuestions() が返す正解画像と reading を利用し、新しい画像や問題の二重管理を作らない。
- 文字は読みをUnicode上の文字単位で分割し、ひらがなと長音記号「ー」を扱う。
- 同じ文字が複数ある場合、判定はタイルIDではなく文字列の並びで行う。
- 間違った回答は次の問題へ進めず、同じ問題で取り消して再挑戦できるようにする。
- 履歴保存、音声、ドラッグ＆ドロップ、バックエンドは実装しない。
- 既存のかなクイズと書き順練習のテスト・動作を壊さない。

---

### Task 1: ゲーム問題とタイルの純粋モデルを追加

**Files:**
- Create: src/features/word-builder/model/types.ts
- Create: src/features/word-builder/model/wordBuilderQuestion.ts
- Test: src/features/word-builder/model/wordBuilderQuestion.test.ts

**Interfaces:**
- Consumes: KanaToPictureQuestion and PictureImageRef.
- Produces: WordBuilderQuestion, WordTile, adaptWordBuilderQuestions(), createWordTiles().

- [ ] **Step 1: Write the failing tests**

テストファイル内に、最小の KanaToPictureQuestion と WordBuilderQuestion を作る `makeKanaQuestion()` / `makeWordQuestion()` ヘルパーを定義する。

~~~ts
it('uses the correct choice image and reading', () => {
  const result = adaptWordBuilderQuestions([makeKanaQuestion('りんご')])

  expect(result).toEqual([{
    id: 'q-りんご',
    reading: 'りんご',
    image: { atlasId: 'food-01', symbolId: 'apple' },
  }])
})

it('creates one tile per character including ー', () => {
  const question = makeWordQuestion('けーき')
  const tiles = createWordTiles(question, () => 0.999)

  expect(tiles).toHaveLength(3)
  expect(tiles.map((tile) => tile.character).sort()).toEqual(['き', 'け', 'ー'])
  expect(new Set(tiles.map((tile) => tile.id)).size).toBe(3)
})

it('keeps duplicate characters as separate tiles', () => {
  const tiles = createWordTiles(makeWordQuestion('ばなな'), () => 0.999)

  expect(tiles.filter((tile) => tile.character === 'な')).toHaveLength(2)
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/features/word-builder/model/wordBuilderQuestion.test.ts

Expected: FAIL because the model files and exports do not exist.

- [ ] **Step 3: Write the minimal implementation**

Define WordBuilderQuestion as { id: string; reading: string; image: PictureImageRef } and WordTile as { id: string; character: string }. Implement adaptWordBuilderQuestions() by finding each question's correctChoiceId, then returning its reading and image. Throw a user-facing data error when the correct choice is missing. Implement createWordTiles() with Array.from(reading), stable per-position IDs, and an in-place Fisher-Yates shuffle on a new array.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: npm test -- src/features/word-builder/model/wordBuilderQuestion.test.ts

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/features/word-builder/model
git commit -m "feat: add word builder question model"
~~~

### Task 2: セッション状態遷移と重複文字判定を追加

**Files:**
- Create: src/features/word-builder/model/wordBuilderSession.ts
- Test: src/features/word-builder/model/wordBuilderSession.test.ts

**Interfaces:**
- Consumes: WordBuilderQuestion, WordTile, createWordTiles(), and existing selectUniqueQuestions().
- Produces: WordBuilderSession, createWordBuilderSession(), selectTile(), undoLastTile(), submitWord(), nextWord(), isWordBuilderComplete().

- [ ] **Step 1: Write the failing tests**

テストファイル内に、固定時刻、1問のセッションを作る `createSessionFor()`、文字からタイルIDを引く `tileIdFor()`、1文字を除いて選択する `selectAllExceptFirst()` のヘルパーを定義する。

~~~ts
it('creates five unique questions and initializes the first tile set', () => {
  const session = createWordBuilderSession(makeQuestions(6), fixedNow, () => 0.999)

  expect(session.questions).toHaveLength(5)
  expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
  expect(session.currentIndex).toBe(0)
  expect(session.selectedTileIds).toEqual([])
  expect(session.feedback).toBe('none')
})

it('accepts either duplicate tile when the character sequence is correct', () => {
  const session = createSessionFor('ばなな')
  const bananaTiles = session.tiles.filter((tile) => tile.character === 'な')
  let selected = selectTile(session, tileIdFor(session, 'ば'))
  selected = selectTile(selected, bananaTiles[1].id)
  selected = selectTile(selected, bananaTiles[0].id)

  expect(submitWord(selected).feedback).toBe('correct')
})

it('keeps the same question after an incorrect submission and undo resets feedback', () => {
  const session = createSessionFor('りんご')
  const submitted = submitWord(selectAllExceptFirst(session))

  expect(submitted.feedback).toBe('incorrect')
  expect(submitted.currentIndex).toBe(0)

  const undone = undoLastTile(submitted)
  expect(undone.selectedTileIds).toHaveLength(submitted.selectedTileIds.length - 1)
  expect(undone.feedback).toBe('none')
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/features/word-builder/model/wordBuilderSession.test.ts

Expected: FAIL because the session model is not defined.

- [ ] **Step 3: Write the minimal implementation**

Define WordBuilderSession with id, questions, currentIndex, tiles, selectedTileIds, feedback: 'none' | 'incorrect' | 'correct', and startedAt. createWordBuilderSession() selects five unique questions and creates the first shuffled tile set. selectTile() appends only an unselected valid tile. undoLastTile() removes the last selected ID and clears feedback. submitWord() requires the selected count to equal Array.from(question.reading).length, maps selected IDs to characters, and compares the joined string to question.reading; it must never compare tile IDs. nextWord() advances only from correct and creates the next tile set. isWordBuilderComplete() returns true once currentIndex === questions.length.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: npm test -- src/features/word-builder/model/wordBuilderSession.test.ts

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/features/word-builder/model/wordBuilderSession.ts src/features/word-builder/model/wordBuilderSession.test.ts
git commit -m "feat: add word builder session state"
~~~

### Task 3: Providerと問題UIを追加

**Files:**
- Create: src/features/word-builder/WordBuilderSessionProvider.tsx
- Create: src/features/word-builder/components/WordBuilderQuestion.tsx
- Create: src/features/word-builder/components/WordBuilderQuestion.test.tsx
- Create: src/features/word-builder/components/WordBuilderFeedback.tsx

**Interfaces:**
- Consumes: session model functions and existing SpriteImage.
- Produces: WordBuilderSessionProvider, useWordBuilderSession(), and a presentational WordBuilderQuestion.

- [ ] **Step 1: Write the failing component tests**

テストファイル内に、`props` として固定問題、タイル、モックコールバックを用意する。モックはコンポーネントから渡された引数を確認するためだけに使う。

~~~tsx
it('calls select when a tile is pressed and exposes undo', async () => {
  const user = userEvent.setup()
  render(<WordBuilderQuestion {...props} selectedTileIds={[]} />)

  await user.click(screen.getByRole('button', { name: 'り' }))
  expect(props.onSelect).toHaveBeenCalledWith('tile-ri')
  expect(screen.getByRole('button', { name: 'もどす' })).toBeEnabled()
})

it('shows できた only when all characters are selected', () => {
  const { rerender } = render(<WordBuilderQuestion {...props} selectedTileIds={['tile-ri']} />)
  expect(screen.queryByRole('button', { name: 'できた！' })).not.toBeInTheDocument()

  rerender(<WordBuilderQuestion {...props} selectedTileIds={['tile-ri', 'tile-n', 'tile-go']} />)
  expect(screen.getByRole('button', { name: 'できた！' })).toBeEnabled()
})

it('shows retry feedback while leaving the selected sequence visible', () => {
  render(<WordBuilderQuestion {...props} selectedTileIds={['tile-go']} feedback="incorrect" />)

  expect(screen.getByText('もういちど')).toBeInTheDocument()
  expect(screen.getByText('ご')).toBeInTheDocument()
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/features/word-builder/components/WordBuilderQuestion.test.tsx

Expected: FAIL because the provider and component do not exist.

- [ ] **Step 3: Write the minimal implementation**

Make WordBuilderQuestion render a labelled region containing a large SpriteImage, the selected characters, available character buttons, もどす, and できた！. Use standard button elements and keep the selected sequence in the order of selectedTileIds. The submit button is enabled only when the selected character count matches Array.from(question.reading).length. Make WordBuilderFeedback render もういちど for incorrect and a success message for correct.

Make WordBuilderSessionProvider load existing questions in startSession(), adapt them, create a session, and expose session, error, startSession, selectTile, undoLastTile, submitWord, and nextWord. Accept initialSession?: WordBuilderSession for deterministic tests and convert thrown errors to Error state.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: npm test -- src/features/word-builder/components/WordBuilderQuestion.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/features/word-builder/WordBuilderSessionProvider.tsx src/features/word-builder/components
git commit -m "feat: add word builder question controls"
~~~

### Task 4: ゲームページ・結果ページ・ルーティングを追加

**Files:**
- Create: src/pages/WordBuilderPage/WordBuilderPage.tsx
- Create: src/pages/WordBuilderPage/WordBuilderPage.test.tsx
- Create: src/pages/WordBuilderResultPage/WordBuilderResultPage.tsx
- Create: src/pages/WordBuilderResultPage/WordBuilderResultPage.test.tsx
- Modify: src/app/App.tsx
- Modify: src/app/router.tsx
- Modify: src/pages/HomePage/HomePage.tsx
- Modify: src/pages/HomePage/HomePage.test.tsx

**Interfaces:**
- Consumes: useWordBuilderSession(), WordBuilderQuestion, PageLayout, PrimaryButton, and useNavigate().
- Produces: routes /word-builder and /word-builder/result, plus a home link.

- [ ] **Step 1: Write the failing page and navigation tests**

~~~tsx
it('shows progress, picture, tiles, and disabled undo at the start', () => {
  render(<WordBuilderPage />, { wrapper: testWrapper })

  expect(screen.getByText('1 / 5')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'もどす' })).toBeDisabled()
})

it('adds the independent game link on the home page', () => {
  render(<HomePage />, { wrapper: MemoryRouter })
  expect(screen.getByRole('link', { name: 'ことばをつくろう' })).toHaveAttribute('href', '#/word-builder')
})

it('shows a completion result after the fifth word', async () => {
  const user = userEvent.setup()
  render(<WordBuilderPage />, { wrapper: testWrapper })

  await completeCurrentWord(user)
  await user.click(screen.getByRole('button', { name: 'つぎへ' }))
  await completeCurrentWord(user)
  await user.click(screen.getByRole('button', { name: 'つぎへ' }))
  await completeCurrentWord(user)
  await user.click(screen.getByRole('button', { name: 'つぎへ' }))
  await completeCurrentWord(user)
  await user.click(screen.getByRole('button', { name: 'つぎへ' }))
  await completeCurrentWord(user)
  await user.click(screen.getByRole('button', { name: 'つぎへ' }))

  expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
})
~~~

Use a memory router and an injected initial session in the final test so it verifies the page transition without depending on randomness.

テストファイル内に `TestWordBuilderProvider`、`testWrapper`、現在の読みの全タイルを選択する `completeCurrentWord()` を定義する。結果遷移テストでは `/word-builder` と `/word-builder/result` の両方を `Routes` に登録した `MemoryRouter` を使う。

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: npm test -- src/pages/WordBuilderPage/WordBuilderPage.test.tsx src/pages/WordBuilderResultPage/WordBuilderResultPage.test.tsx src/pages/HomePage/HomePage.test.tsx

Expected: FAIL because the new routes, pages, provider, and home link do not exist.

- [ ] **Step 3: Write the minimal implementation**

Add WordBuilderSessionProvider as a sibling of the existing providers in App. Register both routes in AppRouter. Add a ことばをつくろう link to HomePage without changing existing start handlers.

WordBuilderPage shows a start message when there is no session; otherwise it shows QuizProgress-style progress, the current image/question, and a つぎへ button after a correct submission. Navigate to /word-builder/result after the fifth correct word. WordBuilderResultPage shows 5もん できたね！, a もういちど link, and a home link only when the session is complete; otherwise it shows a safe start message.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: npm test -- src/pages/WordBuilderPage/WordBuilderPage.test.tsx src/pages/WordBuilderResultPage/WordBuilderResultPage.test.tsx src/pages/HomePage/HomePage.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/app/App.tsx src/app/router.tsx src/pages/HomePage src/pages/WordBuilderPage src/pages/WordBuilderResultPage
git commit -m "feat: add word builder routes"
~~~

### Task 5: レイアウトとアクセシビリティを仕上げる

**Files:**
- Modify: src/styles/global.css
- Modify: src/pages/WordBuilderPage/WordBuilderPage.test.tsx

**Interfaces:**
- Consumes: class names from the word-builder components.
- Produces: responsive, touch-friendly layout using the existing color and focus conventions.

- [ ] **Step 1: Write the failing semantic assertions**

~~~tsx
it('labels the word builder region and selected sequence', () => {
  render(<WordBuilderPage />, { wrapper: testWrapper })

  expect(screen.getByRole('region', { name: 'ことばをつくる問題' })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'えらんだ文字' })).toBeInTheDocument()
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: npm test -- src/pages/WordBuilderPage/WordBuilderPage.test.tsx

Expected: FAIL until the semantic labels are added.

- [ ] **Step 3: Write the minimal implementation**

Add focused .word-builder-* selectors: a centered column no wider than 28rem, a white image card, large wrapping character buttons, a selected sequence with clear gaps, disabled undo styling, and distinct retry/success feedback. Reuse SpriteImage and standard buttons. Add a small-screen layout and a reduced-motion rule if any feedback animation is introduced. Do not alter unrelated quiz or stroke-order selectors.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: npm test -- src/pages/WordBuilderPage/WordBuilderPage.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/styles/global.css src/pages/WordBuilderPage/WordBuilderPage.test.tsx
git commit -m "feat: style word builder game"
~~~

### Task 6: 全体検証と計画の最終レビュー

**Files:**
- Modify: docs/superpowers/plans/2026-08-07-word-building-game.md only to mark completed checklist items after implementation.

- [ ] **Step 1: Run typecheck and all tests**

Run: npm run typecheck and npm test.

Expected: both PASS with no TypeScript errors.

- [ ] **Step 2: Run the production build and PWA tests**

Run: npm run build and npm run test:pwa.

Expected: both PASS; existing image precache remains valid.

- [ ] **Step 3: Review the diff against the specification**

Verify there are no new image files, no history writes, no changes to the existing quiz session contract, and no comparison by tile IDs. Verify the home link, independent routes, five-question flow, retry behavior, duplicate-character rule, and result screen.

- [ ] **Step 4: Run repository hygiene checks**

Run: git diff --check and git status --short.

Expected: no whitespace errors; unrelated .codex-remote-attachments/ remains untouched.

- [ ] **Step 5: Commit only plan checklist updates if needed**

~~~bash
git add docs/superpowers/plans/2026-08-07-word-building-game.md
git commit -m "docs: complete word builder implementation plan"
~~~
