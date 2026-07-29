# ManabiNote ひらがな学習アプリ設計仕様

## 1. 文書情報

- 作成日: 2026-07-30
- 対象: 幼児向け・ひらがな学習MVP
- 状態: 設計承認済み、実装前

## 2. 目的

幼児が、表示されたひらがなに対応する絵を3択から選びながら、ひらがなを学べる知育アプリを作る。
1回の学習は5問とし、学習結果を端末内に保存して、後から確認できるようにする。

運用コストを抑えるため、バックエンド、データベース、ログイン、外部AI API、独自ドメインは使用しない。

## 3. 技術・運用要件

- フロントエンド: React + TypeScript + Vite
- 問題データ: JSON
- 履歴保存: localStorage
- オフライン対応: PWA
- 公開先: Cloudflare Pages
- ソース管理: GitHub
- 認証: なし
- データベース: なし
- 外部AI API: なし
- 独自ドメイン: 使用しない
- 読み上げ音声: MVPでは実装せず、将来追加できる構造だけ用意する

## 4. MVPの範囲

### 含める機能

- ホーム画面
- ひらがなを1文字表示し、対応する絵を3択から選ぶ問題
- 1セッション5問
- セッション内の問題重複防止
- 回答直後の正誤表示
- 結果画面での正解数と各問題の正誤表示
- 学習履歴画面
- 実施日時、正解数、各問題の正誤の保存と表示
- PWAとしてのオフライン学習
- Vitestによるテストと80%以上のカバレッジ計測

### 含めない機能

- ログイン・ユーザー管理
- サーバー保存・同期
- 管理画面
- 外部API連携
- 読み上げ音声
- 書き取り、書き順判定
- 複雑なゲーム要素、ランキング、課金

## 5. 画面構成と遷移

画面は機能別に分離する。

```text
ホーム
  ├─ 学習開始 → 問題
  └─ 履歴を見る → 履歴

問題（全5問）
  ├─ 回答 → 正誤表示 → 次の問題
  └─ 5問終了 → 結果

結果
  ├─ もう一度学習 → 問題
  └─ 履歴を見る → 履歴
```

ルーティングには`HashRouter`を使用し、Cloudflare Pages側の追加リライト設定なしで再読み込みできるようにする。

## 6. フォルダ構成

```text
src/
├─ app/
│  └─ router.tsx
├─ pages/
│  ├─ HomePage/
│  ├─ QuizPage/
│  ├─ ResultPage/
│  └─ HistoryPage/
├─ features/
│  ├─ quiz/
│  │  ├─ model/
│  │  │  ├─ quizSession.ts
│  │  │  └─ questionSelection.ts
│  │  └─ components/
│  ├─ question-types/
│  │  └─ kana-to-picture/
│  │     ├─ data/
│  │     │  └─ questions.json
│  │     ├─ model/
│  │     │  ├─ types.ts
│  │     │  ├─ validator.ts
│  │     │  └─ engine.ts
│  │     ├─ components/
│  │     │  ├─ KanaQuestion.tsx
│  │     │  └─ PictureChoice.tsx
│  │     └─ model.test.ts
│  └─ history/
│     ├─ model/
│     │  ├─ historyStorage.ts
│     │  └─ historyTypes.ts
│     └─ components/
├─ shared/
│  ├─ components/
│  ├─ lib/
│  └─ types/
└─ assets/
```

`pages`はルート画面と画面間の接続を担当し、業務ロジックは`features`に置く。
問題形式に固有のデータ、型、検証、出題ロジック、UIは`features/question-types/<形式名>`の中に閉じ込める。

将来、絵からひらがなを選ぶ形式や音を聞いてひらがなを選ぶ形式を追加する場合も、既存の`kana-to-picture`へ混在させず、別の問題形式フォルダを追加する。

## 7. 問題形式とデータモデル

すべての問題データは`type`を持つ判別可能なデータとして扱う。

```json
{
  "type": "kana-to-picture",
  "id": "hiragana-a",
  "kana": "あ",
  "choices": [
    {
      "id": "apple",
      "label": "りんご",
      "imageSrc": "/images/apple.png"
    },
    {
      "id": "ant",
      "label": "あり",
      "imageSrc": "/images/ant.png"
    },
    {
      "id": "umbrella",
      "label": "かさ",
      "imageSrc": "/images/umbrella.png"
    }
  ],
  "correctChoiceId": "apple",
  "audioSrc": null
}
```

`audioSrc`は将来の音声対応用の任意項目であり、MVPでは読み上げ処理を行わない。

問題データの検証では、次を確認する。

- `type`が対応済みの問題形式である
- 問題IDが重複していない
- 1問題あたりの選択肢が3個である
- 選択肢IDが重複していない
- `correctChoiceId`が選択肢に存在する
- セッションに必要な問題数が5問以上ある

## 8. 出題・回答・履歴のデータフロー

1. ホーム画面から学習を開始する。
2. 選択中の`questionType`に対応するJSONを読み込む。
3. 検証済みの問題から重複なしで5問を選ぶ。
4. 問題画面で1問ずつ表示する。
5. 回答後、正誤を表示し、次の問題へ進む。
6. 5問終了時に結果を作成する。
7. 結果画面表示後、履歴をlocalStorageへ保存する。

未完了のセッションは履歴に保存しない。

## 9. 履歴データ

```json
{
  "id": "session-...",
  "questionType": "kana-to-picture",
  "startedAt": "2026-07-30T10:00:00.000Z",
  "score": 4,
  "total": 5,
  "answers": [
    {
      "questionType": "kana-to-picture",
      "questionId": "hiragana-a",
      "kana": "あ",
      "selectedChoiceId": "apple",
      "correctChoiceId": "apple",
      "isCorrect": true
    }
  ]
}
```

保存キーは`manabinote.history.v1`とする。
履歴には、実施日時、正解数、各問題の正誤を保存する。問題形式を保存することで、将来形式が増えても履歴を混在させない。

## 10. エラー処理

- JSONが壊れている場合は、問題画面ではなく読み込みエラー画面を表示する
- 問題数が5問未満の場合は、学習を開始できないようにする
- localStorageが利用できない場合も、現在の学習は継続可能にする
- 履歴データが壊れている場合は、履歴を空として扱い、アプリ自体は利用可能にする
- 回答中に画面を離れた場合、そのセッションは保存しない

エラー内容は、幼児や保護者が理解しやすい平易な日本語で表示する。

## 11. PWAとオフライン動作

- `vite-plugin-pwa`を使用する
- アプリ本体、問題JSON、ローカル画像をキャッシュする
- 初回オンラインアクセス後はオフラインでも学習できるようにする
- 外部API、外部画像、外部フォントには依存しない
- 問題データ更新後は、次回オンライン起動時にキャッシュを更新する
- インストール導線はブラウザ標準UIに任せる

## 12. テストとカバレッジ

テストにはVitestとReact Testing Libraryを使用し、`@vitest/coverage-v8`で計測する。

```text
npm run test
npm run test:coverage
```

カバレッジの基準は、次の全項目で80%以上とする。

- statements
- branches
- functions
- lines

80%未満の場合はテストコマンドを失敗扱いにする。
カバレッジ対象は`src`配下のアプリコードとし、型宣言、テストコード、生成ファイルは除外する。

主なテスト対象は次の通り。

- 問題形式ごとのデータ検証と出題ロジック
- 5問選出と重複防止
- 正誤判定
- localStorageの保存・読み込み・破損データ処理
- 問題、結果、履歴の主要画面
- 問題形式ごとのUIが他形式のデータを読み込まないこと

## 13. CIと公開

GitHub Actionsで次を実行する。

1. 依存関係のインストール
2. TypeScript型チェック
3. テスト
4. カバレッジ計測と80%閾値確認
5. Vite本番ビルド

Cloudflare Pagesの公開設定は、Viteの標準構成に合わせる。

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- 独自ドメインは設定しない

## 14. 完了条件

- 幼児がホーム画面から5問の学習を完了できる
- 各問題で3つの絵から1つを選択できる
- 結果画面に正解数と各問題の正誤が表示される
- 履歴画面で実施日時、正解数、各問題の正誤を確認できる
- 初回オンラインアクセス後、オフラインで学習できる
- 問題形式ごとにコード・データ・テストが分離されている
- TypeScript型チェック、テスト、ビルドが成功する
- カバレッジが全指標80%以上である
