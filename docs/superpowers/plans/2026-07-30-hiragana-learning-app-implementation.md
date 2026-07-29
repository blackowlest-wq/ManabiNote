# ManabiNote ひらがな学習アプリ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 幼児がひらがなを見て正しい絵を3択から選ぶ5問学習を、履歴保存とオフライン対応付きで公開できる状態にする。

**Architecture:** pagesはルーティングと画面接続だけを担当し、学習、履歴、問題形式ごとの処理はfeaturesに分離する。クイズセッションの共通操作はfeatures/quizに置き、問題形式固有のデータ検証・正誤判定・出題UIはfeatures/question-types/kana-to-pictureの内部に閉じ込める。問題形式を追加するときは既存フォルダに混ぜず、新しい問題形式フォルダと型を追加する。

**Tech Stack:** React, TypeScript, Vite, React Router DOM (HashRouter), Vitest, React Testing Library, @vitest/coverage-v8, vite-plugin-pwa, GitHub Actions, Cloudflare Pages

## Global Constraints

- 問題形式: 幼児向け、ひらがなを表示して対応する絵を3択から選ぶ
- 学習単位: 1セッション5問、セッション内の問題重複なし
- 問題データ: JSON、問題形式識別子typeを必須とする
- 履歴: 実施日時、正解数、各問題の正誤をlocalStorageへ保存する
- localStorageキー: manabinote.history.v1
- オフライン: 初回オンラインアクセス後にアプリ本体、問題JSON、ローカル画像を利用可能にする
- 外部依存: 外部API、外部画像、外部フォント、ログイン、データベース、外部AI APIを使用しない
- 音声: MVPでは実装しない。JSONのaudioSrcは将来拡張用の任意項目とする
- ルーティング: HashRouterを使用し、Cloudflare Pages側の追加リライト設定を不要にする
- テスト: statements / branches / functions / lines の全指標を80%以上にする
- カバレッジ対象: src配下のアプリコード。型宣言、テストコード、生成ファイル、エントリーポイントは除外する
- 公開: Cloudflare Pages、ビルドコマンド npm run build、出力ディレクトリ dist、独自ドメインなし
- ソース管理: 実装タスクごとに関連ファイルだけをコミットする

## File Map

### Project and tooling

- package.json: 開発、テスト、カバレッジ、ビルドのスクリプトと依存関係
- package-lock.json: 依存関係の固定
- vite.config.ts: ViteとPWAプラグインの設定
- vitest.config.ts: jsdom、テストセットアップ、カバレッジ閾値の設定
- src/test/setup.ts: Testing Libraryの共通セットアップ
- .github/workflows/ci.yml: 型チェック、テスト、カバレッジ、ビルド
- README.md: ローカル起動、テスト、Cloudflare Pages設定

### Application boundaries

- src/app/App.tsx: アプリ全体のProviderとルーターを接続
- src/app/router.tsx: HashRouterと4画面のルート定義
- src/pages/*: ルート画面の組み立てと画面遷移のみ
- src/features/quiz/model/*: 問題形式に依存しないセッション制御と問題選択
- src/features/quiz/components/*: 進捗表示、回答フィードバック、問題形式の表示境界
- src/features/question-types/types.ts: 問題形式の識別子と共通最小型
- src/features/question-types/kana-to-picture/*: 現在の問題形式のJSON、型、検証、画像選択UI
- src/features/history/model/*: 履歴型とlocalStorageリポジトリ
- src/features/history/components/*: 履歴一覧と空状態
- src/shared/*: 問題形式をまたいで使えるUI、日付、エラーなどの小さな共通部品
- public/images/kana-to-picture/*: 外部参照のないローカルSVG画像

### Testing placement

テストは対象の近くに置く。例:

    src/features/question-types/kana-to-picture/model/validator.test.ts
    src/features/quiz/model/questionSelection.test.ts
    src/features/history/model/historyStorage.test.ts
    src/pages/QuizPage/QuizPage.test.tsx

## Task 1: Viteプロジェクトとテスト基盤を作る

**Files:**

- Create: package.json, package-lock.json, index.html, src/main.tsx, src/App.tsx, src/vite-env.d.ts, tsconfig*.json, vite.config.ts
- Create: vitest.config.ts, src/test/setup.ts, src/App.test.tsx
- Modify: .gitignore

**Interfaces:**

- Produces npm run dev, npm run typecheck, npm run test, npm run test:coverage, npm run build
- Produces a jsdom test environment with @testing-library/jest-dom/vitest loaded for every test

- [ ] **Step 1: Create a temporary Vite scaffold without touching the existing design documents**

Run these commands separately from the repository root:

    npm create vite@latest .scaffold -- --template react-ts
    Get-ChildItem -Force .scaffold | Move-Item -Destination .
    Remove-Item -LiteralPath .scaffold

Keep docs/superpowers/specs/ and docs/superpowers/plans/ intact.

- [ ] **Step 2: Install runtime and test dependencies**

    npm install react-router-dom vite-plugin-pwa
    npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

- [ ] **Step 3: Add scripts and the test configuration**

Set package.json scripts to:

    {
      "scripts": {
        "dev": "vite",
        "build": "tsc -b && vite build",
        "preview": "vite preview",
        "typecheck": "tsc --noEmit",
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
      }
    }

Create vitest.config.ts with jsdom and these coverage rules:

    import { defineConfig } from 'vitest/config';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html', 'lcov'],
          all: true,
          include: ['src/**/*.{ts,tsx}'],
          exclude: [
            'src/**/*.d.ts',
            'src/**/*.test.{ts,tsx}',
            'src/main.tsx',
            'src/test/**'
          ],
          thresholds: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
          }
        }
      }
    });

Create src/test/setup.ts:

    import '@testing-library/jest-dom/vitest';

- [ ] **Step 4: Replace the Vite placeholder with a smoke-testable root component**

Create a minimal App that renders the text ManabiNote and a test:

    import { render, screen } from '@testing-library/react';
    import { describe, expect, it } from 'vitest';
    import App from './App';

    describe('App', () => {
      it('renders the application name', () => {
        render(<App />);
        expect(screen.getByText('ManabiNote')).toBeInTheDocument();
      });
    });

- [ ] **Step 5: Verify the clean baseline**

Run:

    npm run typecheck
    npm run test
    npm run build

Expected: all commands succeed.

- [ ] **Step 6: Commit the project foundation**

    git add package.json package-lock.json index.html src vite.config.ts vitest.config.ts tsconfig*.json .gitignore
    git commit -m "chore: scaffold react vite app and test setup"

## Task 2: 問題形式の型、JSON、検証を実装する

**Files:**

- Create: src/features/question-types/types.ts
- Create: src/features/question-types/kana-to-picture/model/types.ts
- Create: src/features/question-types/kana-to-picture/model/validator.ts
- Create: src/features/question-types/kana-to-picture/model/loader.ts
- Create: src/features/question-types/kana-to-picture/data/questions.json
- Test: src/features/question-types/kana-to-picture/model/validator.test.ts
- Test: src/features/question-types/kana-to-picture/model/loader.test.ts

**Interfaces:**

- QuestionType = 'kana-to-picture'
- BaseQuestion = { type: QuestionType; id: string }
- PictureChoice = { id: string; label: string; imageSrc: string }
- KanaToPictureQuestion = BaseQuestion & { kana: string; choices: PictureChoice[]; correctChoiceId: string; audioSrc?: string | null }
- validateKanaToPictureQuestions(raw: unknown): KanaToPictureQuestion[]
- loadKanaToPictureQuestions(): KanaToPictureQuestion[]
- Invalid data throws QuestionDataError with a user-safe message and a machine-readable code

- [ ] **Step 1: Write failing validator tests for the accepted schema**

Cover valid data, fewer than three choices, more than three choices, duplicate question IDs, duplicate choice IDs, missing correct choice, unsupported type, and non-array input:

    import { describe, expect, it } from 'vitest';
    import { QuestionDataError, validateKanaToPictureQuestions } from './validator';

    const validQuestion = {
      type: 'kana-to-picture',
      id: 'hiragana-a',
      kana: 'あ',
      choices: [
        { id: 'apple', label: 'りんご', imageSrc: '/images/apple.svg' },
        { id: 'ant', label: 'あり', imageSrc: '/images/ant.svg' },
        { id: 'umbrella', label: 'かさ', imageSrc: '/images/umbrella.svg' }
      ],
      correctChoiceId: 'apple',
      audioSrc: null
    };

    describe('validateKanaToPictureQuestions', () => {
      it('returns typed questions for valid data', () => {
        const result = validateKanaToPictureQuestions([validQuestion]);
        expect(result[0].type).toBe('kana-to-picture');
        expect(result[0].choices).toHaveLength(3);
      });

      it('rejects a question unless it has exactly three choices', () => {
        expect(() => validateKanaToPictureQuestions([
          { ...validQuestion, choices: validQuestion.choices.slice(0, 2) }
        ])).toThrow(QuestionDataError);
      });
    });

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: npx vitest run src/features/question-types/kana-to-picture/model/validator.test.ts

Expected: FAIL because the validator module and error class do not exist.

- [ ] **Step 3: Implement the runtime validator and loader**

Implement QuestionDataError and validate every item before casting. Do not use a direct as KanaToPictureQuestion cast without checking fields. loader.ts imports the JSON, calls the validator once, and returns the validated array.

Seed questions.json with five distinct questions for あ, い, う, え, and お. Each question must have exactly three choices and use the local image paths listed in Task 5.

- [ ] **Step 4: Add loader tests for malformed imported data and valid seed data**

The loader test must assert that the real JSON returns at least five questions and every returned question has three choices.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run: npx vitest run src/features/question-types/kana-to-picture/model/validator.test.ts src/features/question-types/kana-to-picture/model/loader.test.ts

Expected: PASS.

- [ ] **Step 6: Commit the problem data boundary**

    git add src/features/question-types
    git commit -m "feat: add kana to picture question data validation"

## Task 3: 5問選出とクイズセッションモデルを実装する

**Files:**

- Create: src/features/quiz/model/questionSelection.ts
- Create: src/features/quiz/model/quizSession.ts
- Test: src/features/quiz/model/questionSelection.test.ts
- Test: src/features/quiz/model/quizSession.test.ts

**Interfaces:**

- selectUniqueQuestions<T extends { id: string }>(questions: readonly T[], count: number, random?: () => number): T[]
- createQuizSession(questions: readonly KanaToPictureQuestion[], now?: () => Date, random?: () => number): QuizSession
- recordAnswer(session: QuizSession, selectedChoiceId: string): QuizSession
- isSessionComplete(session: QuizSession): boolean
- QuizSession contains id, questionType, questions, currentIndex, answers, and ISO startedAt
- Each answer contains questionType, questionId, kana, selectedChoiceId, correctChoiceId, and isCorrect

- [ ] **Step 1: Write failing selection tests**

Test deterministic random selection, five-question output, no duplicate IDs, and insufficient input:

    import { describe, expect, it } from 'vitest';
    import { selectUniqueQuestions } from './questionSelection';

    describe('selectUniqueQuestions', () => {
      it('returns the requested number without duplicate ids', () => {
        const questions = Array.from({ length: 6 }, (_, index) => ({ id: 'q-' + index }));
        const selected = selectUniqueQuestions(questions, 5, () => 0.1);
        expect(selected).toHaveLength(5);
        expect(new Set(selected.map((question) => question.id)).size).toBe(5);
      });

      it('throws when fewer questions are available than requested', () => {
        expect(() => selectUniqueQuestions([{ id: 'q-1' }], 5)).toThrow('5問');
      });
    });

- [ ] **Step 2: Run the selection tests and verify they fail**

Run: npx vitest run src/features/quiz/model/questionSelection.test.ts

Expected: FAIL because the selection function does not exist.

- [ ] **Step 3: Implement Fisher-Yates selection with injectable randomness**

Copy the input before shuffling, use the injected random function for deterministic tests, reject negative or zero counts, reject insufficient questions, and return exactly count items.

- [ ] **Step 4: Write failing session tests**

Define a local question fixture with exactly three choices, then create five copies with unique IDs for session tests. Cover session creation, a correct answer, an incorrect answer, advancing the current index, completion after five answers, and rejection of a second answer for the same question.

    it('records the selected choice and correctness', () => {
      const questions = Array.from({ length: 5 }, (_, index) => ({ ...question, id: 'q-' + index }));
      const session = createQuizSession(questions, () => new Date('2026-07-30T10:00:00.000Z'), () => 0);
      const answered = recordAnswer(session, 'apple');
      expect(answered.answers[0]).toMatchObject({
        questionId: 'q-0',
        selectedChoiceId: 'apple',
        correctChoiceId: 'apple',
        isCorrect: true
      });
      expect(answered.currentIndex).toBe(1);
    });

- [ ] **Step 5: Run the session tests and verify they fail**

Run: npx vitest run src/features/quiz/model/quizSession.test.ts

Expected: FAIL because the session functions do not exist.

- [ ] **Step 6: Implement the pure session transitions**

Use selectUniqueQuestions(questions, 5, random) during creation. recordAnswer must read the current KanaToPictureQuestion, calculate isCorrect from correctChoiceId, append exactly one answer, and increment currentIndex. It must throw when the session is already complete or the current question has already been answered.

- [ ] **Step 7: Run the focused model tests**

Run: npx vitest run src/features/quiz/model/questionSelection.test.ts src/features/quiz/model/quizSession.test.ts

Expected: PASS.

- [ ] **Step 8: Commit the quiz domain model**

    git add src/features/quiz/model
    git commit -m "feat: add five question quiz session model"

## Task 4: localStorage履歴リポジトリを実装する

**Files:**

- Create: src/features/history/model/historyTypes.ts
- Create: src/features/history/model/historyStorage.ts
- Test: src/features/history/model/historyStorage.test.ts

**Interfaces:**

- HistoryRecord contains id, questionType, startedAt, score, total, and answers
- loadHistory(storage?: Storage): HistoryRecord[]
- appendHistory(record: HistoryRecord, storage?: Storage): StorageWriteResult
- StorageWriteResult = { ok: true } | { ok: false; reason: 'unavailable' | 'quota' }
- The default key is exactly manabinote.history.v1

- [ ] **Step 1: Write failing storage tests**

Define a local makeHistory helper that returns a valid HistoryRecord with five answer entries. Test empty storage, append and reload, newest-first ordering, malformed JSON, malformed record shape, unavailable storage, and quota failure.

    import { beforeEach, describe, expect, it } from 'vitest';
    import { appendHistory, loadHistory } from './historyStorage';

    describe('historyStorage', () => {
      beforeEach(() => localStorage.clear());

      it('stores and reloads records newest first', () => {
        const first = makeHistory('2026-07-30T09:00:00.000Z');
        const second = makeHistory('2026-07-30T10:00:00.000Z');
        expect(appendHistory(first).ok).toBe(true);
        expect(appendHistory(second).ok).toBe(true);
        expect(loadHistory().map((record) => record.id)).toEqual([second.id, first.id]);
      });

      it('returns an empty list for malformed saved data', () => {
        localStorage.setItem('manabinote.history.v1', '{broken');
        expect(loadHistory()).toEqual([]);
      });
    });

- [ ] **Step 2: Run storage tests and verify they fail**

Run: npx vitest run src/features/history/model/historyStorage.test.ts

Expected: FAIL because the storage module does not exist.

- [ ] **Step 3: Implement safe parsing and writing**

Inject Storage in tests, default to window.localStorage in the browser, parse and validate the stored array before returning it, catch SecurityError and QuotaExceededError, and never allow malformed history to crash the app. Append records newest first and keep the stored list bounded to the latest 50 records to prevent unbounded local growth.

- [ ] **Step 4: Run storage tests and verify they pass**

Run: npx vitest run src/features/history/model/historyStorage.test.ts

Expected: PASS.

- [ ] **Step 5: Commit the history repository**

    git add src/features/history/model
    git commit -m "feat: persist quiz history in local storage"

## Task 5: 問題形式固有のUIとローカル画像を作る

**Files:**

- Create: src/features/question-types/kana-to-picture/components/KanaQuestion.tsx
- Create: src/features/question-types/kana-to-picture/components/PictureChoice.tsx
- Create: src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx
- Create: public/images/kana-to-picture/apple.svg
- Create: public/images/kana-to-picture/ant.svg
- Create: public/images/kana-to-picture/umbrella.svg
- Create: public/images/kana-to-picture/dog.svg
- Create: public/images/kana-to-picture/strawberry.svg
- Create: public/images/kana-to-picture/rabbit.svg
- Create: public/images/kana-to-picture/sea.svg
- Create: public/images/kana-to-picture/pencil.svg
- Create: public/images/kana-to-picture/shrimp.svg
- Create: public/images/kana-to-picture/rice-ball.svg
- Create: public/images/kana-to-picture/ghost.svg

**Interfaces:**

- PictureChoiceProps = { choice: PictureChoice; selected: boolean; disabled: boolean; onSelect: (choiceId: string) => void }
- KanaQuestionProps = { question: KanaToPictureQuestion; selectedChoiceId: string | null; disabled: boolean; onSelect: (choiceId: string) => void }
- KanaQuestion renders one large kana and exactly three accessible image buttons

- [ ] **Step 1: Write failing component tests**

Define a local valid kana-to-picture question fixture with three choices. Test that the kana is visible, three choices are rendered with labels and image alt text, selecting a choice calls the callback with the choice ID, and disabled choices do not call it.

    it('renders three choices and reports the selected choice id', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<KanaQuestion question={question} selectedChoiceId={null} disabled={false} onSelect={onSelect} />);
      expect(screen.getByRole('heading', { name: 'あ' })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(3);
      await user.click(screen.getByRole('button', { name: /りんご/ }));
      expect(onSelect).toHaveBeenCalledWith('apple');
    });

- [ ] **Step 2: Run the component test and verify it fails**

Run: npx vitest run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Create self-contained local SVG illustrations**

Each SVG must have viewBox="0 0 160 160", use only inline shapes and fills, contain no external URL, and remain readable on a light card background. Use the labels from the JSON as the accessible name; do not put critical text only inside the SVG.

- [ ] **Step 4: Implement the choice and question components**

Use native button elements, aria-pressed for the selected choice, disabled after an answer, visible focus styles, and img alt={choice.label}. Do not import another question type into this folder.

- [ ] **Step 5: Run the component test and verify it passes**

Run: npx vitest run src/features/question-types/kana-to-picture/components/KanaQuestion.test.tsx

Expected: PASS.

- [ ] **Step 6: Commit the question-type UI and assets**

    git add src/features/question-types/kana-to-picture/components public/images/kana-to-picture
    git commit -m "feat: add kana to picture question UI"

## Task 6: 画面、ルーティング、学習フローを接続する

**Files:**

- Create: src/app/App.tsx, src/app/router.tsx
- Create: src/features/quiz/QuizSessionProvider.tsx
- Create: src/features/quiz/components/QuizProgress.tsx
- Create: src/features/quiz/components/AnswerFeedback.tsx
- Create: src/features/quiz/components/QuizProgress.test.tsx
- Create: src/pages/HomePage/HomePage.tsx, src/pages/HomePage/HomePage.test.tsx
- Create: src/pages/QuizPage/QuizPage.tsx, src/pages/QuizPage/QuizPage.test.tsx
- Create: src/pages/ResultPage/ResultPage.tsx, src/pages/ResultPage/ResultPage.test.tsx
- Create: src/pages/HistoryPage/HistoryPage.tsx, src/pages/HistoryPage/HistoryPage.test.tsx
- Modify: src/main.tsx, src/App.test.tsx

**Interfaces:**

- Routes: /, /quiz, /result, /history
- QuizSessionProvider exposes session, startSession(), answer(choiceId), and result
- QuizSessionProvider accepts an optional initialSession prop for deterministic page tests; production routes omit it
- HomePage calls startSession then navigates to /quiz
- QuizPage renders the current kana-to-picture question, progress, and feedback
- ResultPage reads the completed result from context, saves it exactly once, and renders the score and answer review
- HistoryPage calls loadHistory() and renders newest-first records or a plain empty state

- [ ] **Step 1: Write failing page tests for the route-level behavior**

Test home navigation, quiz rendering, one-answer lockout, feedback and next-question transition, result score, result history save-once behavior, direct result access without a session, and empty history. Define the test-only TestQuizProvider wrapper in the page test file; it renders QuizSessionProvider with initialSession set to createQuizSession(makeFiveQuestions(), fixedClock, () => 0) and wraps the page in MemoryRouter. Define makeFiveQuestions as a local fixture helper that returns five valid kana-to-picture questions with unique IDs.

    it('locks the answer buttons and shows feedback after one selection', async () => {
      const user = userEvent.setup();
      render(<QuizPage />, { wrapper: TestQuizProvider });
      await user.click(screen.getByRole('button', { name: /りんご/ }));
      expect(screen.getByText('正解！')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toContainEqual(expect.objectContaining({ disabled: true }));
      expect(screen.getByRole('button', { name: '次の問題' })).toBeInTheDocument();
    });

- [ ] **Step 2: Run focused page tests and verify they fail**

Run: npx vitest run src/pages src/features/quiz/components

Expected: FAIL because the provider, routes, pages, and components do not exist.

- [ ] **Step 3: Implement the quiz provider around the pure session model**

Load and validate kana-to-picture questions inside startSession, create a five-question session, expose immutable state transitions, and expose a typed error state when loading or validation fails. Keep the provider independent from HistoryPage.

- [ ] **Step 4: Implement the router and home page**

Use HashRouter with the four routes. The home page must provide a large 学習をはじめる button and a 履歴を見る link. Starting a new session must replace any previous in-memory session.

- [ ] **Step 5: Implement the quiz page and feedback**

Render the question-specific KanaQuestion, a 1 / 5 style progress indicator, and feedback after the first selection. Disable all choice buttons after selection. Show the correct choice label when the answer is wrong. The 次の問題 button advances the pure session; after question five it navigates to /result.

- [ ] **Step 6: Implement result and history pages**

On first render of ResultPage, convert the completed session to HistoryRecord and call appendHistory once using a ref guard. Show the score as 4 / 5 and list every answer with the kana and correct/incorrect state. If no result exists in context, show a recoverable message with a link to home. HistoryPage must never throw when storage is unavailable or malformed.

- [ ] **Step 7: Run page tests and the full test suite**

    npx vitest run src/pages src/features/quiz/components
    npm run test
    npm run typecheck

Expected: all commands pass.

- [ ] **Step 8: Commit the connected learning flow**

    git add src/app src/features/quiz src/pages src/main.tsx src/App.test.tsx
    git commit -m "feat: connect quiz result and history pages"

## Task 7: 幼児向けレイアウトとアクセシビリティを整える

**Files:**

- Create: src/styles/global.css
- Create: src/shared/components/PageLayout.tsx
- Create: src/shared/components/PageLayout.test.tsx
- Create: src/shared/components/PrimaryButton.tsx
- Create: src/shared/components/PrimaryButton.test.tsx
- Modify: src/app/App.tsx, src/pages/*, src/features/quiz/components/*, src/features/question-types/kana-to-picture/components/*

**Interfaces:**

- PageLayoutProps = { title: string; children: ReactNode }
- PrimaryButtonProps extends native button props and keeps a visible focus ring

- [ ] **Step 1: Write failing shared-component tests**

Assert that page titles are headings, buttons expose their accessible names, disabled state is preserved, and keyboard focus is visible through a stable class or attribute.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: npx vitest run src/shared/components

Expected: FAIL because the shared components and stylesheet do not exist.

- [ ] **Step 3: Implement the visual system**

Use local CSS only. Make kana text large, choice cards at least 44px high, tap targets comfortably larger than the minimum, colors high contrast, and layout usable from 320px width upward. Do not use remote fonts or remote CSS. Keep the correct and incorrect feedback distinguishable by text and icon, not color alone.

- [ ] **Step 4: Run tests and build**

    npx vitest run src/shared/components
    npm run typecheck
    npm run build

Expected: all commands pass.

- [ ] **Step 5: Commit the child-friendly UI foundation**

    git add src/styles src/shared src/app/App.tsx src/pages src/features/quiz/components src/features/question-types/kana-to-picture/components
    git commit -m "style: add child friendly accessible layout"

## Task 8: PWAとオフラインキャッシュを設定する

**Files:**

- Modify: vite.config.ts
- Modify: src/main.tsx
- Create: public/favicon.svg
- Create: public/icon-192.svg
- Create: public/icon-512.svg
- Create: src/pwa.test.ts

**Interfaces:**

- Build output contains a web manifest and service worker
- Manifest name is ManabiNote and start URL is /
- The service worker precaches built app assets and local images

- [ ] **Step 1: Write a build-level PWA assertion**

Add a Node/Vitest test that runs after build in the verification task and asserts dist/manifest.webmanifest and dist/sw.js exist. Keep this test skipped during ordinary unit-test runs unless dist exists, so it does not make local TDD depend on a prior build.

- [ ] **Step 2: Configure VitePWA**

Use registerType: autoUpdate, a manifest with the app name, short name, description, theme color, background color, display standalone, and icons that are local files. Configure the generated precache glob so all built files originating from public/images/ are included. Do not configure runtime fetches to external origins.

- [ ] **Step 3: Register the generated service worker**

Register the service worker from src/main.tsx using the plugin’s generated registration helper. Keep application startup functional when service-worker registration is unavailable.

- [ ] **Step 4: Run the PWA build verification**

    npm run build
    Test-Path dist/manifest.webmanifest
    Test-Path dist/sw.js

Expected: both paths exist and the build succeeds.

- [ ] **Step 5: Commit the PWA configuration**

    git add vite.config.ts src/main.tsx public/favicon.svg public/icon-192.svg public/icon-512.svg src/pwa.test.ts
    git commit -m "feat: enable offline pwa caching"

## Task 9: CI、README、カバレッジ閾値を仕上げる

**Files:**

- Create: .github/workflows/ci.yml
- Modify: README.md, vitest.config.ts, package.json

**Interfaces:**

- CI runs on pushes and pull requests
- CI fails on type errors, test failures, coverage below 80%, or build failures
- README documents npm install, npm run dev, npm run test, npm run test:coverage, and Cloudflare Pages build settings

- [ ] **Step 1: Run coverage before adding CI and record uncovered branches**

Run: npm run test:coverage

Use the text and HTML reports to identify uncovered application branches. Add tests to the owning feature folder; do not lower thresholds or exclude business logic to make the number pass.

- [ ] **Step 2: Add the GitHub Actions workflow**

Create .github/workflows/ci.yml with Node LTS setup, npm ci, npm run typecheck, npm run test:coverage, and npm run build. Use the repository’s package-lock.json for deterministic installation.

- [ ] **Step 3: Document local development and deployment**

README must include:

    npm install
    npm run dev
    npm run test
    npm run test:coverage
    npm run build

Document Cloudflare Pages as:

    Build command: npm run build
    Output directory: dist

State that the app has no login, backend, database, external AI API, or custom domain.

- [ ] **Step 4: Run the complete local gate**

    npm ci
    npm run typecheck
    npm run test:coverage
    npm run build

Expected: all commands pass and all four coverage metrics are at least 80%.

- [ ] **Step 5: Commit CI and project documentation**

    git add .github/workflows/ci.yml README.md package.json package-lock.json vitest.config.ts
    git commit -m "ci: enforce tests coverage and production build"

## Task 10: 最終検証と受け入れ確認

**Files:**

- Modify only files required by verification findings
- Test: all existing test files and the production build

- [ ] **Step 1: Verify the automated gates**

    npm run typecheck
    npm run test:coverage
    npm run build
    git status --short

Expected: typecheck, tests, coverage, and build pass; git status contains only intentionally uncommitted changes or is clean.

- [ ] **Step 2: Verify the primary user journey locally**

Run npm run dev, open the displayed local URL, and verify:

1. Home shows 学習をはじめる and 履歴を見る.
2. Starting a session shows one kana and exactly three image choices.
3. Selecting one choice disables further choices and shows text feedback.
4. 次の問題 reaches question five without duplicate question IDs.
5. Result shows score / 5 and all five answer states.
6. Refreshing the history page shows the newly saved record.
7. Opening result without an active session shows a recoverable message.

- [ ] **Step 3: Verify offline behavior with the production preview**

Run npm run preview, load the app once online, use browser developer tools to switch the network to Offline, reload, and complete a five-question session. Confirm that the questions and local images still render.

- [ ] **Step 4: Inspect the problem-type boundary**

Confirm that files under kana-to-picture do not import from a future problem-type folder, and that common quiz/history code does not hard-code picture labels or image filenames. Any new question type must have its own data, model, components, and tests folder.

- [ ] **Step 5: Commit only verification fixes**

If verification required changes, run the affected focused tests first. Confirm with git diff --name-only that every modified tracked file is a verification fix, then stage the tracked fixes and commit with:

    git diff --name-only
    git add -u
    git commit -m "test: complete manabinote acceptance verification"

## Plan Self-Review

- Spec coverage: the plan covers the React/Vite stack, JSON questions, three choices, five-question sessions, history fields, localStorage key, PWA caching, HashRouter, Cloudflare Pages, GitHub Actions, no backend/auth/API, future question-type separation, and the 80% coverage threshold.
- Placeholder scan: there are no TODO, TBD, or unresolved implementation choices in the task steps.
- Type consistency: QuestionType, KanaToPictureQuestion, QuizSession, HistoryRecord, and storage function names are defined before the tasks that consume them.
- Scope: the plan creates one working MVP subsystem and keeps future problem forms as an extension boundary rather than implementing unrelated forms now.
