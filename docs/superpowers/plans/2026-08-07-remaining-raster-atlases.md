# 残り3分類ラスターアトラス実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 食べ物・もの・自然の77イラストを画像生成して分類別WebPへ合成し、問題用アトラスをラスター画像へ統一した後、4つの旧アトラスSVGだけを削除する。

**Architecture:** 動物版で確立した320pxセル、6列×5行、行優先のWebPアトラス方式を残り3分類へ適用する。分類ごとの個別PNGは`artwork/imagegen/`に保存し、分類別の合成スクリプトと検証テストを追加する。アプリ側は既存の`raster-grid`モデルと`SpriteImage`を再利用し、マニフェストの4分類をすべてWebP参照に変更する。

**Tech Stack:** React 18, TypeScript, Vite, Vitest, built-in `image_gen`, Python Pillow, WebP raster atlas.

## Global Constraints

- 生成対象は食べ物25種、もの27種、自然25種の合計77シンボルとする。
- 各分類は6列×5行、セル320×320px、キャンバス1,920×1,600pxとする。
- 各WebPファイルは25MB未満とする。
- 既存の4択問題データと単純な呼び名は変更しない。
- 問題用アトラスの4つのSVGだけを削除し、他用途のSVGは残す。
- 画像生成元PNGは差し替え用としてワークツリーに残す。

---

### Task 1: 生成元の一覧と失敗テストを準備する

**Files:**
- Create: `scripts/test_remaining_atlas_composition.py`
- Create: `artwork/imagegen/food-v2/README.md`
- Create: `artwork/imagegen/objects-v2/README.md`
- Create: `artwork/imagegen/nature-v2/README.md`

**Interfaces:**
- Consumes: `image-atlas-manifest.json`のfood/objects/natureシンボル順
- Produces: 3分類の期待シンボル集合と合成後アトラスの検証条件

- [ ] **Step 1: 3分類のシンボル順を読み取り、期待値を固定する**

`image-atlas-manifest.json`の順序をそのまま、food 25、objects 27、nature 25の定数としてテストに記述する。各分類のソースPNG集合が期待集合と一致し、合成WebPが存在し、WebP形式・1,920×1,600px・25MB未満であることを検証する。

- [ ] **Step 2: 検証テストを実行してREDを確認する**

Run:

```powershell
python -m unittest scripts/test_remaining_atlas_composition.py
```

Expected: FAIL because the three source directories and output WebP files do not exist yet.

- [ ] **Step 3: 生成元READMEに共通条件と順序を記録する**

各READMEに、猫画像をスタイル参考にしたこと、かわいらしい幼児向けタッチ、中央配置、単一対象、文字なし、2026-08-07の生成日、分類内の行優先順を記録する。

### Task 2: 残り77画像を個別生成・確認する

**Files:**
- Create: `artwork/imagegen/food-v2/*.png`
- Create: `artwork/imagegen/objects-v2/*.png`
- Create: `artwork/imagegen/nature-v2/*.png`

**Interfaces:**
- Consumes: `artwork/imagegen/animals-v2/cat.png`をスタイル参考にするbuilt-in `image_gen`
- Produces: マニフェストのsymbolIdと同名の77個の正方形PNG

- [ ] **Step 1: 食べ物25種を1枚ずつ生成する**

各対象を「一目で判別できる単一の食べ物」として、暖色系の淡い背景、太い濃茶アウトライン、丸みのある形、文字・ロゴ・透かし・余分な対象なしで生成する。生成物を`artwork/imagegen/food-v2/<symbolId>.png`へコピーする。

- [ ] **Step 2: もの27種を1枚ずつ生成する**

各対象を「一目で判別できる単一のもの」として、同じ構図・背景・線・色調で生成する。生成物を`artwork/imagegen/objects-v2/<symbolId>.png`へコピーする。

- [ ] **Step 3: 自然25種を1枚ずつ生成する**

各対象を「一目で判別できる単一の自然物」として、同じ構図・背景・線・色調で生成する。生成物を`artwork/imagegen/nature-v2/<symbolId>.png`へコピーする。

- [ ] **Step 4: 生成元を分類別に目視確認する**

各分類の画像が正しい対象か、全体が切れていないか、文字や不要な対象がないか、動物版と同じかわいらしいタッチかを確認する。不適切な画像だけを対象指定付きで再生成する。

### Task 3: 3分類のWebPを合成する

**Files:**
- Create: `scripts/compose-remaining-atlases.py`
- Modify: `scripts/test_remaining_atlas_composition.py`
- Create: `public/images/kana-to-picture/atlases/food-01-v2.webp`
- Create: `public/images/kana-to-picture/atlases/objects-01-v2.webp`
- Create: `public/images/kana-to-picture/atlases/nature-01-v2.webp`

**Interfaces:**
- Consumes: 3分類のPNGディレクトリとマニフェスト順
- Produces: 3つの1,920×1,600px WebP、320pxセル、行優先配置

- [ ] **Step 1: 分類別の合成設定を追加する**

`compose-remaining-atlases.py`に分類ID、入力ディレクトリ、出力パス、シンボル順、6列、5行、320pxセル、25MB上限を定義する。Pillowの`ImageOps.contain`で各画像をセル内に収め、空きセルは背景色だけにする。

- [ ] **Step 2: 合成と検証を実行する**

Run:

```powershell
python scripts/compose-remaining-atlases.py
python -m unittest scripts/test_remaining_atlas_composition.py
```

Expected: PASS for all three WebP files, including dimensions, format, source coverage, and size limit.

- [ ] **Step 3: 3つの合成画像を目視確認する**

各セルの対象、切れ、余白、色調を確認する。問題があれば該当PNGだけを再生成し、合成と検証を再実行する。

### Task 4: マニフェスト・テストを4分類ラスターへ更新する

**Files:**
- Modify: `src/features/question-types/kana-to-picture/data/image-atlas-manifest.json`
- Modify: `src/features/question-types/kana-to-picture/model/imageAtlas.test.ts`
- Modify: `src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx`
- Modify: `src/features/question-types/kana-to-picture/model/loader.test.ts`
- Modify: `src/pwa.test.ts`

**Interfaces:**
- Consumes: 4つのWebPアトラスと既存の`raster-grid`表示処理
- Produces: 4分類のマニフェスト解決、セル位置、問題参照、PWA資産の検証

- [ ] **Step 1: 4分類のラスター期待値をテストへ追加する**

動物・食べ物・もの・自然について、WebP URL、`raster-grid`、6列、5行、320pxセルを検証する。食べ物の既存SVG`<use>`テストは、既知のシンボルのWebP背景位置を検証するテストへ変更し、SVGフォールバック自体は合成マニフェスト外のテストデータで維持する。

- [ ] **Step 2: 問題バンクの全分類カバレッジを検証する**

全問題の選択肢からatlasIdごとのsymbolIdを収集し、4分類のマニフェストシンボル集合と一致することをテストする。問題数、4択、正解読み、誤答語頭の既存検証は維持する。

- [ ] **Step 3: PWAテストをWebP4枚とSVG削除に合わせる**

4つのWebPが`dist`に存在し、Service Workerへ含まれることを検証する。問題用アトラスSVGが`public`と`dist`に残っていないことを検証する。

- [ ] **Step 4: 重点テストをREDで確認する**

Run:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'node_modules\vitest\vitest.mjs' run src/features/question-types/kana-to-picture/model/imageAtlas.test.ts src/features/question-types/kana-to-picture/components/SpriteImage.test.tsx src/features/question-types/kana-to-picture/model/loader.test.ts
```

Expected: FAIL because the manifest still points three classifications to SVG and the new WebP assets are not yet referenced.

- [ ] **Step 5: マニフェストを4分類ラスターへ変更してGREENを確認する**

動物を含む全4エントリを`raster-grid`へ変更し、3つの新WebP URLと各シンボル順を記述する。重点テストを再実行し、PASSを確認する。

### Task 5: 旧アトラスSVGを削除する

**Files:**
- Delete: `public/images/kana-to-picture/atlases/animals-01.svg`
- Delete: `public/images/kana-to-picture/atlases/food-01.svg`
- Delete: `public/images/kana-to-picture/atlases/objects-01.svg`
- Delete: `public/images/kana-to-picture/atlases/nature-01.svg`

**Interfaces:**
- Consumes: 検証済みの4つのWebPマニフェスト参照
- Produces: 問題用アトラスからSVGを除いたpublic資産

- [ ] **Step 1: 削除前にWebP参照と生成物を確認する**

4つのWebPが存在し、マニフェストの全参照がWebPであることを確認する。問題バンクの全画像参照がマニフェストで解決できることを確認する。

- [ ] **Step 2: 問題用アトラスSVGだけを削除する**

上記4ファイルを明示的なパスで削除する。削除後、`public/images/kana-to-picture/atlases`に4つの`*-01-v2.webp`だけが問題用アトラスとして残ることを確認する。

### Task 6: 全検証と作業記録を完了する

**Files:**
- Modify: `docs/superpowers/specs/2026-08-07-remaining-raster-atlases-design.md`
- Modify: `docs/superpowers/plans/2026-08-07-remaining-raster-atlases.md`

**Interfaces:**
- Consumes: 4分類のWebP、更新済みマニフェスト、削除済みSVG
- Produces: 再実行可能な合成テストと検証済みの作業記録

- [ ] **Step 1: 型チェックと全テストを実行する**

Run:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' --noEmit
& 'C:\Program Files\nodejs\node.exe' 'node_modules\vitest\vitest.mjs' run
python -m unittest scripts/test_remaining_atlas_composition.py scripts/test_compose_animal_atlas.py
git diff --check
```

Expected: all commands pass.

- [ ] **Step 2: 本番ビルドとPWAテストを実行する**

Run:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'node_modules\typescript\bin\tsc' -b
& 'C:\Program Files\nodejs\node.exe' 'node_modules\vite\bin\vite.js' build
& 'C:\Program Files\nodejs\node.exe' 'node_modules\vitest\vitest.mjs' run --config vitest.pwa.config.ts
```

Expected: production assets contain all four WebP files and no problem-atlas SVG. If the existing `workbox-build` dependency failure recurs, record it without claiming the PWA check passed.

- [ ] **Step 3: 完了記録を更新する**

仕様書と計画書へ生成数、各WebPサイズ、全テスト結果、SVG削除結果、PWA環境結果を記録する。
