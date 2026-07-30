# 書き順なぞり練習MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** あ、い、う、え、おを固定順で1画ずつSVGになぞる、幼児向け書き順練習MVPを既存のManabiNoteへ追加する。

**Architecture:** 既存のkana-to-picture問題形式、QuizSessionProvider、履歴保存は変更せず、kana-to-stroke問題形式とstroke-order専用セッションを追加する。問題JSONは表示用SVGパスと判定用checkpoint列を持ち、純粋なstrokeRecognizerが入力点を順序付きで判定する。StrokePracticeProviderが固定5文字の進捗を管理し、StrokeOrderPageとStrokeResultPageが既存のRouter、PageLayout、PrimaryButtonを使って画面を構成する。

**Tech Stack:** React 18, TypeScript, Vite, React Router DOM, SVG, Pointer Events, Vitest, React Testing Library, local CSS

## Global Constraints

- 対象文字はあ、い、う、え、おの5文字だけとし、固定順で練習する。
- 各文字は1画ずつ順番に入力し、画をスキップできないようにする。
- SVG viewBoxは全て 0 0 200 200 とする。
- 問題データは外部画像や外部APIを使わず、JSONとインラインSVGパスで管理する。
- 開始位置、checkpoint列、終点をSVG座標上の許容距離で判定する。
- 失敗しても減点せず、同じ画を再試行できるようにする。
- 結果は画面表示だけとし、書き順練習専用の履歴保存は今回追加しない。
- 既存のkana-to-picture、QuizSessionProvider、履歴画面の動作を壊さない。
- HashRouterを使用し、追加ルートは /stroke-order と /stroke-order/result とする。
- Pointer Eventsのpointer captureを使い、タッチ、マウス、ペンに対応する。
- 外部フォント、外部CSS、外部画像、外部サービス依存を追加しない。
- 実装コードを書く前に、そのコードを検証する失敗テストを作成して実行する。
- 各タスクは関連テスト、型チェック、必要なビルド確認後に個別コミットする。

---

## File Map

### 問題データ境界

- Create: src/features/question-types/kana-to-stroke/model/types.ts
  - StrokePoint、StrokeDefinition、KanaToStrokeQuestionの型だけを定義する。
- Create: src/features/question-types/kana-to-stroke/model/validator.ts
  - unknownのJSONを安全にKanaToStrokeQuestion[]へ変換し、書き順データの構造を検証する。
- Create: src/features/question-types/kana-to-stroke/model/loader.ts
  - strokes.jsonを読み込み、validatorを1回通して返す。
- Create: src/features/question-types/kana-to-stroke/data/strokes.json
  - あ、い、う、え、おの表示用guidePathと判定用checkpointsを持つ。
- Test: src/features/question-types/kana-to-stroke/model/validator.test.ts
- Test: src/features/question-types/kana-to-stroke/model/loader.test.ts

### 判定とセッション

- Create: src/features/question-types/kana-to-stroke/model/strokeRecognizer.ts
  - 入力点列を1画のcheckpoint列と照合する純粋関数を提供する。
- Test: src/features/question-types/kana-to-stroke/model/strokeRecognizer.test.ts
- Create: src/features/stroke-order/model/practiceSession.ts
  - 固定5文字の現在位置、画進捗、試行回数、完了状態を管理する純粋関数を提供する。
- Test: src/features/stroke-order/model/practiceSession.test.ts
- Create: src/features/stroke-order/StrokePracticeProvider.tsx
  - loaderとpracticeSessionをReact Contextへ接続する。
- Test: src/features/stroke-order/StrokePracticeProvider.test.tsx

### 入力UIと画面

- Create: src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx
  - 薄いお手本、完了済みの画、ユーザー入力線をSVGで描画し、Pointer Eventsを処理する。
- Test: src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx
- Modify: src/app/App.tsx
  - StrokePracticeProviderを既存Routerの上位に追加する。
- Modify: src/app/router.tsx
  - 書き順練習と結果のルートを追加する。
- Modify: src/pages/HomePage/HomePage.tsx
  - 書き順練習の導線を追加する。
- Modify: src/pages/HomePage/HomePage.test.tsx
  - 書き順練習の開始と遷移を検証する。
- Create: src/pages/StrokeOrderPage/StrokeOrderPage.tsx
- Test: src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx
- Create: src/pages/StrokeResultPage/StrokeResultPage.tsx
- Test: src/pages/StrokeResultPage/StrokeResultPage.test.tsx
- Modify: src/styles/global.css
  - 書き順練習のSVG、入力線、進捗、通知、結果のスタイルを追加する。

## Task 1: 書き順問題の型、JSON、validator、loaderを作る

**Files:**

- Create: src/features/question-types/kana-to-stroke/model/types.ts
- Create: src/features/question-types/kana-to-stroke/model/validator.ts
- Create: src/features/question-types/kana-to-stroke/model/loader.ts
- Create: src/features/question-types/kana-to-stroke/data/strokes.json
- Test: src/features/question-types/kana-to-stroke/model/validator.test.ts
- Test: src/features/question-types/kana-to-stroke/model/loader.test.ts

**Interfaces:**

- Question type: 'kana-to-stroke'
- StrokePoint = { x: number; y: number }
- StrokeDefinition = { order: number; guidePath: string; checkpoints: readonly StrokePoint[] }
- KanaToStrokeQuestion = { type: 'kana-to-stroke'; id: string; kana: 'あ' | 'い' | 'う' | 'え' | 'お'; viewBox: '0 0 200 200'; strokes: readonly StrokeDefinition[] }
- validateStrokeQuestions(raw: unknown): KanaToStrokeQuestion[]
- loadStrokeQuestions(): KanaToStrokeQuestion[]
- StrokeDataError extends Error with code: 'INVALID_STROKE_DATA'

- [ ] **Step 1: Write the failing type and validator tests**

  Create a valid question fixture with two strokes and tests for:

  - valid records return typed data
  - non-array input is rejected
  - unsupported type is rejected
  - duplicate IDs are rejected
  - the target set is not exactly あ、い、う、え、お
  - a question with no strokes is rejected
  - non-contiguous order values are rejected
  - guidePath is required
  - fewer than two checkpoints are rejected
  - checkpoint coordinates outside 0..200 are rejected

  The public test shape is:

      expect(validateStrokeQuestions([validQuestion])).toEqual([
        expect.objectContaining({ type: 'kana-to-stroke', kana: 'あ' }),
      ])

      expect(() => validateStrokeQuestions('broken')).toThrow(StrokeDataError)

- [ ] **Step 2: Run the validator test and confirm the expected RED failure**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/model/validator.test.ts

  Expected: FAIL because the new module and error class do not exist. If the test has a TypeScript or fixture error instead, fix the test before writing production code.

- [ ] **Step 3: Implement the minimal runtime validator and types**

  Define the exact types above. Implement record checks without a direct cast:

  - reject null, arrays, missing strings, and non-numeric coordinates
  - require exactly five question records
  - require each of the five kana once
  - require each question to use viewBox 0 0 200 200
  - require order values 1..strokes.length
  - require each checkpoint coordinate to be finite and within 0..200
  - throw StrokeDataError with the safe message 問題データを読み込めませんでした。

- [ ] **Step 4: Run the validator tests and confirm GREEN**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/model/validator.test.ts

  Expected: all validator tests pass.

- [ ] **Step 5: Add the five-character JSON and loader tests**

  Add strokes.json with one record for each of あ、い、う、え、お. Use viewBox 0 0 200 200. Each guidePath must be a visible path in that viewBox, and each checkpoint list must follow the displayed path from start to end.

  Create loader.ts that imports the JSON, invokes validateStrokeQuestions once, and returns the validated array. Test that:

  - the loader returns exactly five questions
  - the returned kana order is あ、い、う、え、お
  - every question has at least one stroke
  - every stroke has a non-empty guidePath and at least two checkpoints

- [ ] **Step 6: Run the focused data tests and commit**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/model/validator.test.ts src/features/question-types/kana-to-stroke/model/loader.test.ts

  Expected: all focused tests pass.

  Commit:

      git add src/features/question-types/kana-to-stroke
      git commit -m "feat: add kana stroke order question data"

## Task 2: 1画のなぞり判定を実装する

**Files:**

- Create: src/features/question-types/kana-to-stroke/model/strokeRecognizer.ts
- Test: src/features/question-types/kana-to-stroke/model/strokeRecognizer.test.ts

**Interfaces:**

- StrokeRecognitionReason = 'accepted' | 'start-too-far' | 'off-path' | 'incomplete'
- StrokeRecognitionResult = { accepted: boolean; reason: StrokeRecognitionReason; progress: number }
- StrokeRecognitionOptions = { startTolerance: number; checkpointTolerance: number; endTolerance: number; minInputPoints: number }
- DEFAULT_STROKE_RECOGNITION_OPTIONS = { startTolerance: 26, checkpointTolerance: 28, endTolerance: 30, minInputPoints: 2 }
- recognizeStroke(inputPoints: readonly StrokePoint[], stroke: StrokeDefinition, options?: Partial<StrokeRecognitionOptions>): StrokeRecognitionResult

- [ ] **Step 1: Write the failing recognizer tests**

  Use a simple fixture whose checkpoints are (20,20), (60,60), (100,100). Test one behavior per test:

  - input starting at the first checkpoint and visiting all checkpoints is accepted
  - input starting too far from the first checkpoint returns start-too-far
  - a point farther than checkpointTolerance from the guide polyline returns off-path
  - input that stops before the last checkpoint returns incomplete
  - fewer than minInputPoints returns incomplete
  - progress is between 0 and 1 and reaches 1 only when the final checkpoint is reached
  - the default tolerances can be overridden in a test

  Use real arrays of StrokePoint; do not mock the recognizer’s own geometry helpers.

- [ ] **Step 2: Run the recognizer test and confirm RED**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/model/strokeRecognizer.test.ts

  Expected: FAIL because recognizeStroke does not exist.

- [ ] **Step 3: Implement the minimal pure geometry algorithm**

  Implement:

  - Euclidean point distance
  - point-to-segment distance
  - distance to the guide polyline formed by consecutive checkpoints
  - ordered checkpoint progress: an input point can advance only the next checkpoint, never a previous one
  - start check before progress tracking
  - off-path check for every input point
  - final checkpoint and end tolerance check on pointerup input

  The function must not access DOM, React state, Date, or browser APIs. It must return a result instead of throwing for invalid user input. An invalid empty stroke definition is a data error handled by the validator, not by this function.

- [ ] **Step 4: Run the recognizer tests and commit**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/model/strokeRecognizer.test.ts

  Expected: all recognizer tests pass.

  Commit:

      git add src/features/question-types/kana-to-stroke/model/strokeRecognizer.ts src/features/question-types/kana-to-stroke/model/strokeRecognizer.test.ts
      git commit -m "feat: add stroke tracing recognition"

## Task 3: 固定5文字のセッションモデルとProviderを実装する

**Files:**

- Create: src/features/stroke-order/model/practiceSession.ts
- Test: src/features/stroke-order/model/practiceSession.test.ts
- Create: src/features/stroke-order/StrokePracticeProvider.tsx
- Test: src/features/stroke-order/StrokePracticeProvider.test.tsx

**Interfaces:**

- PracticeStatus = 'active' | 'character-complete' | 'complete'
- PracticeSession = { id: string; questions: readonly KanaToStrokeQuestion[]; currentQuestionIndex: number; currentStrokeIndex: number; attempts: readonly number[]; status: PracticeStatus; startedAt: string }
- createPracticeSession(questions: readonly KanaToStrokeQuestion[], now?: () => Date): PracticeSession
- recordStrokeFailure(session: PracticeSession): PracticeSession
- recordStrokeSuccess(session: PracticeSession): PracticeSession
- advanceCharacter(session: PracticeSession): PracticeSession
- getCurrentQuestion(session: PracticeSession): KanaToStrokeQuestion | null
- isPracticeComplete(session: PracticeSession): boolean

- Provider context:

      type StrokePracticeContextValue = {
        session: PracticeSession | null
        error: Error | null
        startPractice: () => boolean
        recordFailure: () => void
        recordSuccess: () => void
        nextCharacter: () => void
      }

  Export StrokePracticeProvider and useStrokePractice().

- [ ] **Step 1: Write the failing pure-session tests**

  Test:

  - createPracticeSession starts at question index 0, stroke index 0, status active, and attempts [0,0,0,0,0]
  - getCurrentQuestion returns あ first
  - recordStrokeFailure increments attempts for あ but keeps both indices unchanged
  - recordStrokeSuccess advances the current stroke and increments attempts
  - completing the last stroke sets character-complete without changing the character index
  - advanceCharacter moves from あ to い and resets stroke index to 0
  - advancing after お sets complete
  - complete sessions cannot record another success or failure
  - createPracticeSession rejects a question list that is not the fixed five-character sequence

- [ ] **Step 2: Run the session tests and confirm RED**

  Run:

      npx vitest run src/features/stroke-order/model/practiceSession.test.ts

  Expected: FAIL because the session module does not exist.

- [ ] **Step 3: Implement the pure session transitions**

  Use immutable object and array copies. Define the transition rules:

  - create requires exactly five questions in kana order あいうえお
  - recordStrokeFailure increments attempts[currentQuestionIndex] and leaves currentStrokeIndex unchanged
  - recordStrokeSuccess increments attempts[currentQuestionIndex]; if another stroke exists, increment currentStrokeIndex; otherwise set status character-complete
  - advanceCharacter is valid only for character-complete; move to the next character or set complete after お
  - all invalid transitions throw a plain Error with a child-safe Japanese message

- [ ] **Step 4: Run the pure-session tests and confirm GREEN**

  Run:

      npx vitest run src/features/stroke-order/model/practiceSession.test.ts

  Expected: all session model tests pass.

- [ ] **Step 5: Write failing Provider tests**

  Render a test consumer inside StrokePracticeProvider. Test:

  - startPractice loads the real five-question JSON and creates an active session
  - startPractice clears a previous session and error
  - loader failure produces an error and no session
  - recordFailure and recordSuccess update the session through the provider
  - useStrokePractice outside the provider throws the documented context error

  Mock only the loader boundary for the loader-failure test; use real practiceSession functions.

- [ ] **Step 6: Run Provider tests and confirm RED**

  Run:

      npx vitest run src/features/stroke-order/StrokePracticeProvider.test.tsx

  Expected: FAIL because the Provider does not exist.

- [ ] **Step 7: Implement the Provider and run its tests**

  Implement startPractice with loadStrokeQuestions and createPracticeSession. Catch unknown causes as Error objects with the safe fallback message 書き順練習を開始できませんでした。 Expose immutable transitions through the context value.

  Run:

      npx vitest run src/features/stroke-order/model/practiceSession.test.ts src/features/stroke-order/StrokePracticeProvider.test.tsx

  Expected: all focused tests pass.

- [ ] **Step 8: Commit the session boundary**

      git add src/features/stroke-order
      git commit -m "feat: add stroke practice session state"

## Task 4: SVGお手本とPointer Events入力コンポーネントを実装する

**Files:**

- Create: src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx
- Test: src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx

**Interfaces:**

- StrokeCanvasProps = {
    question: KanaToStrokeQuestion;
    currentStrokeIndex: number;
    completedStrokeIndexes: readonly number[];
    disabled?: boolean;
    onStrokeResult: (result: StrokeRecognitionResult) => void;
  }
- StrokeCanvas renders an SVG with viewBox 0 0 200 200, visible guide paths, completed paths, the active input path, and a start-direction hint.

- [ ] **Step 1: Write the failing component tests**

  Render a two-stroke question fixture and test:

  - the SVG has viewBox 0 0 200 200
  - the current guide path is visible with a guide class
  - completed stroke paths are visible and the current stroke is not marked completed
  - pointerdown near the first checkpoint, pointermove through all checkpoints, and pointerup calls onStrokeResult with accepted true
  - pointerdown far from the start and pointerup calls onStrokeResult with accepted false
  - pointercancel calls onStrokeResult with accepted false and clears the input path
  - disabled prevents pointer handling

  Mock getBoundingClientRect only to provide a non-zero SVG rectangle; use actual pointer events and the real recognizeStroke implementation.

- [ ] **Step 2: Run the component test and confirm RED**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx

  Expected: FAIL because StrokeCanvas does not exist.

- [ ] **Step 3: Implement the minimal SVG and pointer handling**

  Implement:

  - an SVG ref and client-to-viewBox coordinate conversion using the rendered bounding rectangle
  - pointer capture on pointerdown
  - a local input point array and generated user path using M/L commands
  - guidePath for every stroke, with only the current stroke emphasized
  - completed stroke classes for prior strokes
  - recognizeStroke on pointerup and pointercancel
  - reset of local input points after reporting the result
  - data attributes or classes that make guide, completed, input, and hint states testable

  Do not put session state, navigation, or localStorage logic into this component.

- [ ] **Step 4: Run the component tests and commit**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx

  Expected: all component tests pass.

  Commit:

      git add src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx
      git commit -m "feat: add SVG stroke tracing canvas"

## Task 5: 練習画面、結果画面、Router、ホーム導線を接続する

**Files:**

- Modify: src/app/App.tsx
- Modify: src/app/router.tsx
- Modify: src/pages/HomePage/HomePage.tsx
- Modify: src/pages/HomePage/HomePage.test.tsx
- Create: src/pages/StrokeOrderPage/StrokeOrderPage.tsx
- Test: src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx
- Create: src/pages/StrokeResultPage/StrokeResultPage.tsx
- Test: src/pages/StrokeResultPage/StrokeResultPage.test.tsx

**Interfaces:**

- App wraps AppRouter with StrokePracticeProvider.
- AppRouter adds /stroke-order and /stroke-order/result.
- HomePage renders a button named 書き順れんしゅう; clicking it calls startPractice and navigates to /stroke-order.
- StrokeOrderPage shows:
  - a page heading
  - 1 / 5 character progress
  - the current kana
  - 1 / N stroke progress
  - StrokeCanvas
  - a retry/status message after a failed stroke
  - つぎの文字へ after the final stroke of a character
  - けっかを見る after the final stroke of お
- StrokeResultPage shows the completed character list, retry button, and home link.

- [ ] **Step 1: Write failing home and page tests**

  Add tests for:

  - HomePage renders the new button
  - clicking the new button starts the practice and navigates to /stroke-order
  - StrokeOrderPage without a session shows a start button and home link
  - StrokeOrderPage with a fixed initial session displays あ, 1 / 5, and 1画目
  - an accepted StrokeCanvas result records success and advances the displayed stroke
  - a rejected result displays the retry message and does not advance the stroke
  - after a character-complete session, つぎの文字へ advances to い
  - after a complete session, けっかを見る navigates to /stroke-order/result
  - StrokeResultPage without a complete session shows a recoverable message and home link
  - StrokeResultPage with a complete session lists あ, い, う, え, お and has a retry button

  Use a test-only Provider wrapper with a fixed PracticeSession where needed. Mock only StrokeCanvas in page tests to report accepted/rejected results through a real callback; keep the page, Provider, and session transitions real.

- [ ] **Step 2: Run focused page tests and confirm RED**

  Run:

      npx vitest run src/pages/HomePage/HomePage.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx src/pages/StrokeResultPage/StrokeResultPage.test.tsx

  Expected: FAIL because the new routes, pages, and Provider wiring do not exist.

- [ ] **Step 3: Implement Provider wiring and routes**

  Add StrokePracticeProvider around AppRouter without changing QuizSessionProvider behavior. Add routes after the existing quiz routes:

      <Route path="/stroke-order" element={<StrokeOrderPage />} />
      <Route path="/stroke-order/result" element={<StrokeResultPage />} />

  Add the HomePage button as a separate action from 学習をはじめる. Its handler must navigate only when startPractice returns true.

- [ ] **Step 4: Implement StrokeOrderPage**

  Read the Provider context, derive the current question and current stroke, and render the progress text. Pass completed indexes from 0 through currentStrokeIndex - 1 to StrokeCanvas.

  On StrokeCanvas result:

  - accepted: call recordSuccess and clear the failure message
  - rejected: call recordFailure and set the failure message

  When status is character-complete, render つぎの文字へ. On the last character render けっかを見る and navigate after nextCharacter changes the status to complete. When no session exists, render a start button that calls startPractice without requiring a route change.

- [ ] **Step 5: Implement StrokeResultPage**

  Render only a completed session as a result. Show the fixed kana list and attempts for each character. The retry button calls startPractice and navigates to /stroke-order. The home link uses the existing Link component. Do not append to the existing quiz history storage.

- [ ] **Step 6: Run focused page tests and commit**

  Run:

      npx vitest run src/pages/HomePage/HomePage.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx src/pages/StrokeResultPage/StrokeResultPage.test.tsx

  Expected: all focused page tests pass.

  Commit:

      git add src/app/App.tsx src/app/router.tsx src/pages/HomePage/HomePage.tsx src/pages/HomePage/HomePage.test.tsx src/pages/StrokeOrderPage src/pages/StrokeResultPage
      git commit -m "feat: connect stroke practice pages"

## Task 6: 幼児向け表示、通知、結果スタイルを整える

**Files:**

- Modify: src/styles/global.css
- Modify: src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx
- Modify: src/pages/StrokeOrderPage/StrokeOrderPage.tsx
- Modify: src/pages/StrokeResultPage/StrokeResultPage.tsx

**Interfaces:**

- Use local CSS classes with the stroke-order prefix.
- The SVG guide must be visually lighter than the input path.
- Success and failure messages must be distinguishable by text and icon, not color alone.
- Input and navigation controls must keep visible focus styles and comfortable touch targets.
- Add aria-live="polite" to dynamic retry and progress messages.

- [ ] **Step 1: Add failing assertions to existing page/component tests**

  Assert:

  - the current kana is exposed as a heading
  - progress text is readable without inspecting classes
  - the retry message has role status or aria-live
  - the SVG contains a start hint label
  - the result heading and character list are accessible

- [ ] **Step 2: Run the focused tests and confirm the assertions fail**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx src/pages/StrokeResultPage/StrokeResultPage.test.tsx

  Expected: the new accessibility/style assertions fail because the attributes and classes are not yet present.

- [ ] **Step 3: Implement the local visual system**

  Add CSS for:

  - .stroke-order-page and progress layout
  - .stroke-canvas with a responsive square SVG no smaller than the 320px page constraint
  - .stroke-guide with a light dashed or translucent stroke
  - .stroke-guide--active, .stroke-guide--completed, and .stroke-input
  - .stroke-hint with a visible start dot and arrow
  - .stroke-feedback, .stroke-feedback--success, and .stroke-feedback--retry
  - result character list and large navigation controls

  Preserve the existing global styles and use prefers-reduced-motion for any optional animation. Do not introduce a remote font or CSS import.

- [ ] **Step 4: Run focused tests, typecheck, and commit**

  Run:

      npx vitest run src/features/question-types/kana-to-stroke/components/StrokeCanvas.test.tsx src/pages/StrokeOrderPage/StrokeOrderPage.test.tsx src/pages/StrokeResultPage/StrokeResultPage.test.tsx
      npm run typecheck

  Expected: focused tests and typecheck pass.

  Commit:

      git add src/styles/global.css src/features/question-types/kana-to-stroke/components/StrokeCanvas.tsx src/pages/StrokeOrderPage/StrokeOrderPage.tsx src/pages/StrokeResultPage/StrokeResultPage.tsx
      git commit -m "style: add child friendly stroke practice UI"

## Task 7: 全体検証と受け入れ確認

**Files:**

- Modify only files required by failed verification checks.
- Test: all existing and new tests.

- [ ] **Step 1: Run the complete automated gate**

  Run:

      npm run typecheck
      npm run test
      npm run test:coverage
      npm run build

  Expected: all commands pass, and existing plus new tests are green. Coverage must meet the repository's configured threshold without excluding stroke-order business logic.

- [ ] **Step 2: Fix only verification findings using TDD**

  For each failure, add or update the smallest failing test first, run the focused test to observe RED, make one implementation change, and rerun the focused test before the full gate. Do not combine unrelated cleanup with verification fixes.

- [ ] **Step 3: Verify route and static asset boundaries**

  Confirm:

  - existing /, /quiz, /result, and /history routes still render
  - /stroke-order and /stroke-order/result work through HashRouter
  - no new external URL appears in stroke-order source or data
  - the five JSON records are bundled by the Vite build
  - the PWA build still produces its manifest and service worker

- [ ] **Step 4: Run the final acceptance tests**

  Run:

      npm run test:pwa
      git diff --check
      git status --short --branch

  Expected: PWA assertions pass, no whitespace errors exist, and only intentionally uncommitted verification changes remain.

- [ ] **Step 5: Commit any final verification fixes**

  If Step 2 produced fixes, run:

      git add -u
      git commit -m "test: verify stroke order practice acceptance"

  If no fixes were needed, do not create an empty commit.

## Plan Self-Review

### Spec coverage

- Five fixed kana and fixed order are implemented by Task 1 data validation and Task 3 session creation.
- One stroke at a time and no skipping are implemented by Task 2 ordered checkpoint recognition and Task 3 transitions.
- SVG guide, Pointer Events, pointer capture, and input path are implemented by Task 4.
- Success, retry, no penalty, hints, and aria-live feedback are covered by Tasks 4 and 6.
- Home, practice, result, and direct-access recovery are covered by Task 5.
- Existing quiz/history isolation is preserved by the File Map and Task 5 Provider wiring.
- No history persistence, external services, audio, or full kana expansion are explicitly excluded in Global Constraints and Task 5.
- Typecheck, unit tests, coverage, build, PWA, and static boundary checks are covered by Task 7.

### Placeholder scan

The plan contains no unfinished placeholder markers. Every task names exact files, interfaces, test commands, expected failures, and commit boundaries.

### Type consistency

KanaToStrokeQuestion, StrokeDefinition, StrokePoint, and StrokeRecognitionResult are defined before their consumers. PracticeSession transitions consume only KanaToStrokeQuestion and return PracticeSession. StrokeCanvas reports StrokeRecognitionResult to StrokeOrderPage, which maps accepted and rejected results to the Provider's recordSuccess and recordFailure actions.

### Scope check

The plan covers one independently testable subsystem: a five-character stroke-order practice flow. It does not expand the existing quiz model or history model, and it introduces no unrelated refactoring or dependencies.
