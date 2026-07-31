# ひらがな選択肢イラスト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ひらがな学習アプリ用に、幼児が絵だけで判別できる `neko.svg`、`nekonoko.svg`、`meron.svg` を追加する。

**Architecture:** 既存の `public/images/kana-to-picture/` に、外部依存のない単一SVGを3ファイル追加する。各ファイルは独立したフラットイラストとして、輪郭・塗り・少数の特徴線だけで対象物を表現する。

**Tech Stack:** 手書きSVG XML、PowerShell、既存Viteプロジェクトの静的public assets。

## Global Constraints

- 各イラストは単一ファイルのself-contained SVGとする。
- `viewBox="0 0 256 256"` を使用し、`width` と `height` は指定しない。
- 背景は透明とする。
- 外部画像、base64、JavaScript、不要なmetadata・defs・commentsは使用しない。
- 色数は3〜6色程度に抑える。
- フラットデザイン、太く丸い輪郭、グラデーション・ぼかし・複雑な影なしとする。
- 対象物を中央に大きく置き、上下左右に約10〜15%の余白を残す。
- 文字やラベルは入れない。
- ファイルは `public/images/kana-to-picture/neko.svg`、`nekonoko.svg`、`meron.svg` とする。

---

### Task 1: 成猫イラストを追加

**Files:**
- Create: `public/images/kana-to-picture/neko.svg`

**Interfaces:**
- Consumes: なし。
- Produces: 256×256のviewBox内で全身が見える成猫の静的SVG。

- [ ] **Step 1: Create the SVG asset**

  ルート要素は次の形式にし、猫本体・しっぽ・顔・ひげを太い丸い輪郭で構成する。

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- 猫の形状だけを置く。コメントは最終ファイルに残さない。 -->
  </svg>
  ```

  実装時は、猫の輪郭を濃い線色、体を暖色、耳内や顔のアクセントを補助色に限定し、目・鼻・ひげを小サイズでも認識できる太さにする。猫は上下左右に余白を残し、顔だけのアイコンにならないよう胴体と足を必ず描く。

- [ ] **Step 2: Check the asset syntax**

  Run: `Get-Content -Raw -LiteralPath 'public/images/kana-to-picture/neko.svg' | Test-Xml`

  Expected: XML validation succeeds without output errors.

### Task 2: 親猫と子猫のイラストを追加

**Files:**
- Create: `public/images/kana-to-picture/nekonoko.svg`

**Interfaces:**
- Consumes: なし。`neko.svg` の内容や外部参照は使用しない。
- Produces: 親猫と明確に小さい子猫が並ぶ、独立した静的SVG。

- [ ] **Step 1: Create the SVG asset**

  `viewBox="0 0 256 256"` の中で、親猫を後方または左側、子猫を手前または右側に配置する。子猫は親猫の半分程度の体高にし、丸い顔、大きな目、短いしっぽで幼さを明確にする。親猫と子猫の輪郭を別々に描き、成猫の単純な縮小コピーに見えないよう体形・顔・配色を変える。

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- 親猫と子猫の形状だけを置く。コメントは最終ファイルに残さない。 -->
  </svg>
  ```

- [ ] **Step 2: Check the asset syntax**

  Run: `Get-Content -Raw -LiteralPath 'public/images/kana-to-picture/nekonoko.svg' | Test-Xml`

  Expected: XML validation succeeds without output errors.

### Task 3: メロンイラストを追加

**Files:**
- Create: `public/images/kana-to-picture/meron.svg`

**Interfaces:**
- Consumes: なし。
- Produces: 網目・茎・葉を備えた、メロンと一目で分かる静的SVG。

- [ ] **Step 1: Create the SVG asset**

  楕円形の実を中央に大きく置き、実の上部に茎と葉を加える。網目は太く少数の曲線または交差線で表現し、細かい反復パターンは避ける。輪郭、実、網目、茎・葉の色を3〜6色程度に収める。

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- メロンの形状だけを置く。コメントは最終ファイルに残さない。 -->
  </svg>
  ```

- [ ] **Step 2: Check the asset syntax**

  Run: `Get-Content -Raw -LiteralPath 'public/images/kana-to-picture/meron.svg' | Test-Xml`

  Expected: XML validation succeeds without output errors.

### Task 4: 全SVGの制約検証

**Files:**
- Test: `public/images/kana-to-picture/neko.svg`
- Test: `public/images/kana-to-picture/nekonoko.svg`
- Test: `public/images/kana-to-picture/meron.svg`

**Interfaces:**
- Consumes: Task 1〜3で作成した3ファイル。
- Produces: 制約違反がないことを確認した作業ツリー。

- [ ] **Step 1: Validate required attributes and forbidden content**

  Run:

  ```powershell
  $assetPaths = @(
    'public/images/kana-to-picture/neko.svg',
    'public/images/kana-to-picture/nekonoko.svg',
    'public/images/kana-to-picture/meron.svg'
  )
  foreach ($assetPath in $assetPaths) {
    $svgText = Get-Content -Raw -LiteralPath $assetPath
    if ($svgText -notmatch '<svg\b[^>]*viewBox="0 0 256 256"') { throw "viewBox missing: $assetPath" }
    if ($svgText -match '\b(width|height)=') { throw "size attribute found: $assetPath" }
    if ($svgText -match '<(script|metadata|defs)\b|<!--|data:image|href=|xlink:href=|<text\b') { throw "forbidden content found: $assetPath" }
  }
  ```

  Expected: command completes without throwing an error.

- [ ] **Step 2: Confirm the files are lightweight and correctly named**

  Run: `Get-Item $assetPaths | Select-Object Name,Length`

  Expected: exactly `neko.svg`, `nekonoko.svg`, `meron.svg` are present under `public/images/kana-to-picture/`, with compact file sizes suitable for static delivery.
