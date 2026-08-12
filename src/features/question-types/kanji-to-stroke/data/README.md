# 漢字の書き順ガイドデータ

`strokes.json` の字形輪郭、ガイド線、チェックポイントは、[AnimCJK](https://github.com/parsimonhi/animCJK) の日本語漢字SVGから、練習画面の `0 0 200 200` 座標へ変換したものです。字形輪郭と書き順線を同じSVGから生成しています。

対象は、小学校1年生で学習する漢字80字です。再生成する場合は、プロジェクトルートで `node scripts/generate-kanji-stroke-data.mjs` を実行します。

AnimCJKのSVGには、漢字の各画の輪郭と書き順を示す中央値線が含まれています。ライセンスと出典の詳細は、[AnimCJKのライセンス記載](https://github.com/parsimonhi/animCJK/blob/master/licenses/COPYING.txt)を参照してください。
