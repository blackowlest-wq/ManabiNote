import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { KanjiReadingQuestion } from './types'

type KanjiReadingSource = {
  id: string
  kanji: string
  word: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly KanjiReadingSource[] = [
  { id: 'kanji-one', kanji: '一', word: '一つ', answer: 'ひとつ', choices: ['ひとつ', 'ふたつ', 'みっつ', 'よっつ'] },
  { id: 'kanji-right', kanji: '右', word: '右', answer: 'みぎ', choices: ['みぎ', 'ひだり', 'うえ', 'した'] },
  { id: 'kanji-ame', kanji: '雨', word: '雨', answer: 'あめ', choices: ['あめ', 'そら', 'くも', 'かぜ'] },
  { id: 'kanji-yen', kanji: '円', word: '十円', answer: 'じゅうえん', choices: ['じゅうえん', 'ひゃくえん', 'せんえん', 'おかね'] },
  { id: 'kanji-king', kanji: '王', word: '王さま', answer: 'おうさま', choices: ['おうさま', 'おとこ', 'せんせい', 'こども'] },
  { id: 'kanji-sound', kanji: '音', word: '音', answer: 'おと', choices: ['おと', 'こえ', 'うた', 'はなし'] },
  { id: 'kanji-down', kanji: '下', word: '下', answer: 'した', choices: ['した', 'うえ', 'なか', 'みぎ'] },
  { id: 'kanji-fire', kanji: '火', word: '火', answer: 'ひ', choices: ['ひ', 'みず', 'つち', 'き'] },
  { id: 'kanji-hana', kanji: '花', word: '花', answer: 'はな', choices: ['はな', 'くさ', 'き', 'もり'] },
  { id: 'kanji-shell', kanji: '貝', word: '貝', answer: 'かい', choices: ['かい', 'いし', 'たま', 'いと'] },
  { id: 'kanji-learn', kanji: '学', word: '学ぶ', answer: 'まなぶ', choices: ['まなぶ', 'やすむ', 'みる', 'たつ'] },
  { id: 'kanji-spirit', kanji: '気', word: '天気', answer: 'てんき', choices: ['てんき', 'あめ', 'そら', 'ゆうやけ'] },
  { id: 'kanji-nine', kanji: '九', word: '九つ', answer: 'ここのつ', choices: ['ここのつ', 'いつつ', 'ななつ', 'やっつ'] },
  { id: 'kanji-rest', kanji: '休', word: '休み', answer: 'やすみ', choices: ['やすみ', 'はやい', 'でる', 'はいる'] },
  { id: 'kanji-ball', kanji: '玉', word: '玉', answer: 'たま', choices: ['たま', 'いし', 'かい', 'えん'] },
  { id: 'kanji-gold', kanji: '金', word: 'お金', answer: 'おかね', choices: ['おかね', 'たま', 'ひゃくえん', 'ほん'] },
  { id: 'kanji-sora', kanji: '空', word: '空', answer: 'そら', choices: ['そら', 'あめ', 'やま', 'かわ'] },
  { id: 'kanji-tsuki', kanji: '月', word: '月', answer: 'つき', choices: ['つき', 'ひ', 'そら', 'ゆうやけ'] },
  { id: 'kanji-inu', kanji: '犬', word: '犬', answer: 'いぬ', choices: ['いぬ', 'むし', 'ひと', 'こども'] },
  { id: 'kanji-see', kanji: '見', word: '見る', answer: 'みる', choices: ['みる', 'でる', 'はいる', 'たつ'] },
  { id: 'kanji-five', kanji: '五', word: '五つ', answer: 'いつつ', choices: ['いつつ', 'ここのつ', 'ななつ', 'むっつ'] },
  { id: 'kanji-kuchi', kanji: '口', word: '口', answer: 'くち', choices: ['くち', 'みみ', 'め', 'て'] },
  { id: 'kanji-school', kanji: '校', word: '学校', answer: 'がっこう', choices: ['がっこう', 'せんせい', 'もじ', 'ほん'] },
  { id: 'kanji-left', kanji: '左', word: '左', answer: 'ひだり', choices: ['ひだり', 'みぎ', 'うえ', 'した'] },
  { id: 'kanji-three', kanji: '三', word: '三つ', answer: 'みっつ', choices: ['みっつ', 'ふたつ', 'よっつ', 'むっつ'] },
  { id: 'kanji-yama', kanji: '山', word: '山', answer: 'やま', choices: ['やま', 'かわ', 'もり', 'はやし'] },
  { id: 'kanji-child', kanji: '子', word: '子ども', answer: 'こども', choices: ['こども', 'おんなのひと', 'おとこのひと', 'せんせい'] },
  { id: 'kanji-four', kanji: '四', word: '四つ', answer: 'よっつ', choices: ['よっつ', 'みっつ', 'いつつ', 'ななつ'] },
  { id: 'kanji-thread', kanji: '糸', word: '糸', answer: 'いと', choices: ['いと', 'たけ', 'き', 'くさ'] },
  { id: 'kanji-character', kanji: '字', word: '文字', answer: 'もじ', choices: ['もじ', 'ぶん', 'ほん', 'なまえ'] },
  { id: 'kanji-mimi', kanji: '耳', word: '耳', answer: 'みみ', choices: ['みみ', 'め', 'くち', 'て'] },
  { id: 'kanji-seven', kanji: '七', word: '七つ', answer: 'ななつ', choices: ['ななつ', 'いつつ', 'やっつ', 'ここのつ'] },
  { id: 'kanji-car', kanji: '車', word: '車', answer: 'くるま', choices: ['くるま', 'むら', 'まち', 'はやし'] },
  { id: 'kanji-te', kanji: '手', word: '手', answer: 'て', choices: ['て', 'め', 'みみ', 'あし'] },
  { id: 'kanji-ten', kanji: '十', word: '十', answer: 'じゅう', choices: ['じゅう', 'ひゃく', 'せん', 'えん'] },
  { id: 'kanji-exit', kanji: '出', word: '出る', answer: 'でる', choices: ['でる', 'はいる', 'みる', 'たつ'] },
  { id: 'kanji-woman', kanji: '女', word: '女の人', answer: 'おんなのひと', choices: ['おんなのひと', 'おとこのひと', 'こども', 'せんせい'] },
  { id: 'kanji-small', kanji: '小', word: '小さい', answer: 'ちいさい', choices: ['ちいさい', 'おおきい', 'はやい', 'ただしい'] },
  { id: 'kanji-up', kanji: '上', word: '上', answer: 'うえ', choices: ['うえ', 'した', 'なか', 'みぎ'] },
  { id: 'kanji-forest', kanji: '森', word: '森', answer: 'もり', choices: ['もり', 'はやし', 'やま', 'むら'] },
  { id: 'kanji-person', kanji: '人', word: '人', answer: 'ひと', choices: ['ひと', 'こども', 'おとこ', 'おんな'] },
  { id: 'kanji-mizu', kanji: '水', word: '水', answer: 'みず', choices: ['みず', 'ひ', 'あめ', 'かわ'] },
  { id: 'kanji-correct', kanji: '正', word: '正しい', answer: 'ただしい', choices: ['ただしい', 'はやい', 'おおきい', 'ちいさい'] },
  { id: 'kanji-life', kanji: '生', word: '生きもの', answer: 'いきもの', choices: ['いきもの', 'こども', 'むし', 'いぬ'] },
  { id: 'kanji-blue', kanji: '青', word: '青', answer: 'あお', choices: ['あお', 'あか', 'しろ', 'くろ'] },
  { id: 'kanji-evening', kanji: '夕', word: '夕やけ', answer: 'ゆうやけ', choices: ['ゆうやけ', 'あめ', 'そら', 'てんき'] },
  { id: 'kanji-stone', kanji: '石', word: '石', answer: 'いし', choices: ['いし', 'たま', 'かい', 'つち'] },
  { id: 'kanji-red', kanji: '赤', word: '赤', answer: 'あか', choices: ['あか', 'あお', 'しろ', 'くろ'] },
  { id: 'kanji-thousand', kanji: '千', word: '千円', answer: 'せんえん', choices: ['せんえん', 'ひゃくえん', 'じゅうえん', 'おかね'] },
  { id: 'kanji-kawa', kanji: '川', word: '川', answer: 'かわ', choices: ['かわ', 'やま', 'みず', 'うみ'] },
  { id: 'kanji-ahead', kanji: '先', word: '先生', answer: 'せんせい', choices: ['せんせい', 'がっこう', 'こども', 'おうさま'] },
  { id: 'kanji-early', kanji: '早', word: '早い', answer: 'はやい', choices: ['はやい', 'ただしい', 'ちいさい', 'おおきい'] },
  { id: 'kanji-grass', kanji: '草', word: '草', answer: 'くさ', choices: ['くさ', 'はな', 'き', 'たけ'] },
  { id: 'kanji-foot', kanji: '足', word: '足', answer: 'あし', choices: ['あし', 'て', 'みみ', 'め'] },
  { id: 'kanji-village', kanji: '村', word: '村', answer: 'むら', choices: ['むら', 'まち', 'はやし', 'もり'] },
  { id: 'kanji-big', kanji: '大', word: '大きい', answer: 'おおきい', choices: ['おおきい', 'ちいさい', 'はやい', 'ただしい'] },
  { id: 'kanji-man', kanji: '男', word: '男の人', answer: 'おとこのひと', choices: ['おとこのひと', 'おんなのひと', 'こども', 'せんせい'] },
  { id: 'kanji-bamboo', kanji: '竹', word: '竹', answer: 'たけ', choices: ['たけ', 'き', 'くさ', 'いと'] },
  { id: 'kanji-inside', kanji: '中', word: '中', answer: 'なか', choices: ['なか', 'うえ', 'した', 'みぎ'] },
  { id: 'kanji-insect', kanji: '虫', word: '虫', answer: 'むし', choices: ['むし', 'いぬ', 'かい', 'ひと'] },
  { id: 'kanji-town', kanji: '町', word: '町', answer: 'まち', choices: ['まち', 'むら', 'はやし', 'もり'] },
  { id: 'kanji-sky', kanji: '天', word: '天の川', answer: 'あまのかわ', choices: ['あまのかわ', 'てんき', 'そら', 'かわ'] },
  { id: 'kanji-rice-field', kanji: '田', word: '田んぼ', answer: 'たんぼ', choices: ['たんぼ', 'むら', 'まち', 'はやし'] },
  { id: 'kanji-soil', kanji: '土', word: '土', answer: 'つち', choices: ['つち', 'いし', 'たんぼ', 'みず'] },
  { id: 'kanji-two', kanji: '二', word: '二つ', answer: 'ふたつ', choices: ['ふたつ', 'ひとつ', 'みっつ', 'よっつ'] },
  { id: 'kanji-hi', kanji: '日', word: '日なた', answer: 'ひなた', choices: ['ひなた', 'つき', 'そら', 'ゆうやけ'] },
  { id: 'kanji-enter', kanji: '入', word: '入る', answer: 'はいる', choices: ['はいる', 'でる', 'みる', 'たつ'] },
  { id: 'kanji-year', kanji: '年', word: '一年', answer: 'いちねん', choices: ['いちねん', 'せんえん', 'ひゃくえん', 'じゅう'] },
  { id: 'kanji-white', kanji: '白', word: '白', answer: 'しろ', choices: ['しろ', 'あか', 'あお', 'くろ'] },
  { id: 'kanji-eight', kanji: '八', word: '八つ', answer: 'やっつ', choices: ['やっつ', 'ななつ', 'ここのつ', 'むっつ'] },
  { id: 'kanji-hundred', kanji: '百', word: '百円', answer: 'ひゃくえん', choices: ['ひゃくえん', 'じゅうえん', 'せんえん', 'おかね'] },
  { id: 'kanji-sentence', kanji: '文', word: '文', answer: 'ぶん', choices: ['ぶん', 'もじ', 'ほん', 'なまえ'] },
  { id: 'kanji-ki', kanji: '木', word: '木', answer: 'き', choices: ['き', 'たけ', 'くさ', 'いと'] },
  { id: 'kanji-book', kanji: '本', word: '本', answer: 'ほん', choices: ['ほん', 'ぶん', 'もじ', 'なまえ'] },
  { id: 'kanji-name', kanji: '名', word: '名前', answer: 'なまえ', choices: ['なまえ', 'もじ', 'ほん', 'ぶん'] },
  { id: 'kanji-me', kanji: '目', word: '目', answer: 'め', choices: ['め', 'みみ', 'くち', 'て'] },
  { id: 'kanji-stand', kanji: '立', word: '立つ', answer: 'たつ', choices: ['たつ', 'みる', 'でる', 'はいる'] },
  { id: 'kanji-power', kanji: '力', word: '力', answer: 'ちから', choices: ['ちから', 'て', 'あし', 'からだ'] },
  { id: 'kanji-woods', kanji: '林', word: '林', answer: 'はやし', choices: ['はやし', 'もり', 'むら', 'まち'] },
  { id: 'kanji-six', kanji: '六', word: '六つ', answer: 'むっつ', choices: ['むっつ', 'よっつ', 'いつつ', 'ななつ'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createKanjiReadingQuestions(random: () => number = Math.random): KanjiReadingQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (source.kanji.length !== 1 || !source.word.includes(source.kanji) || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((reading, index) => ({
      id: `${source.id}-choice-${index}`,
      reading,
    }))
    const correctChoice = choices.find((choice) => choice.reading === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      kanji: source.kanji,
      word: source.word,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
