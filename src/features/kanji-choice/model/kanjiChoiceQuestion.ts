import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { KanjiChoiceQuestion } from './types'

type KanjiChoiceSource = {
  id: string
  reading: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly KanjiChoiceSource[] = [
  { id: 'kanji-choice-one', reading: 'いち', answer: '一', choices: ['一', '二', '三', '四'] },
  { id: 'kanji-choice-right', reading: 'みぎ', answer: '右', choices: ['右', '左', '上', '下'] },
  { id: 'kanji-choice-ame', reading: 'あめ', answer: '雨', choices: ['雨', '空', '水', '川'] },
  { id: 'kanji-choice-yen', reading: 'えん', answer: '円', choices: ['円', '王', '玉', '金'] },
  { id: 'kanji-choice-king', reading: 'おう', answer: '王', choices: ['王', '円', '音', '人'] },
  { id: 'kanji-choice-sound', reading: 'おと', answer: '音', choices: ['音', '口', '耳', '目'] },
  { id: 'kanji-choice-down', reading: 'した', answer: '下', choices: ['下', '上', '中', '右'] },
  { id: 'kanji-choice-fire', reading: 'ひ', answer: '火', choices: ['火', '水', '土', '木'] },
  { id: 'kanji-choice-hana', reading: 'はな', answer: '花', choices: ['花', '草', '木', '森'] },
  { id: 'kanji-choice-shell', reading: 'かい', answer: '貝', choices: ['貝', '石', '玉', '糸'] },
  { id: 'kanji-choice-learn', reading: 'がく', answer: '学', choices: ['学', '校', '字', '文'] },
  { id: 'kanji-choice-spirit', reading: 'き', answer: '気', choices: ['気', '天', '空', '音'] },
  { id: 'kanji-choice-nine', reading: 'きゅう', answer: '九', choices: ['九', '五', '七', '八'] },
  { id: 'kanji-choice-rest', reading: 'やすむ', answer: '休', choices: ['休', '早', '正', '生'] },
  { id: 'kanji-choice-ball', reading: 'たま', answer: '玉', choices: ['玉', '石', '貝', '円'] },
  { id: 'kanji-choice-gold', reading: 'かね', answer: '金', choices: ['金', '玉', '円', '百'] },
  { id: 'kanji-choice-sora', reading: 'そら', answer: '空', choices: ['空', '雨', '天', '夕'] },
  { id: 'kanji-choice-tsuki', reading: 'つき', answer: '月', choices: ['月', '日', '空', '夕'] },
  { id: 'kanji-choice-inu', reading: 'いぬ', answer: '犬', choices: ['犬', '虫', '男', '人'] },
  { id: 'kanji-choice-see', reading: 'みる', answer: '見', choices: ['見', '出', '入', '立'] },
  { id: 'kanji-choice-five', reading: 'ご', answer: '五', choices: ['五', '九', '七', '六'] },
  { id: 'kanji-choice-kuchi', reading: 'くち', answer: '口', choices: ['口', '耳', '目', '手'] },
  { id: 'kanji-choice-school', reading: 'こう', answer: '校', choices: ['校', '学', '字', '文'] },
  { id: 'kanji-choice-left', reading: 'ひだり', answer: '左', choices: ['左', '右', '上', '下'] },
  { id: 'kanji-choice-three', reading: 'さん', answer: '三', choices: ['三', '二', '四', '六'] },
  { id: 'kanji-choice-yama', reading: 'やま', answer: '山', choices: ['山', '川', '森', '林'] },
  { id: 'kanji-choice-child', reading: 'こ', answer: '子', choices: ['子', '女', '男', '人'] },
  { id: 'kanji-choice-four', reading: 'よん', answer: '四', choices: ['四', '三', '五', '七'] },
  { id: 'kanji-choice-thread', reading: 'いと', answer: '糸', choices: ['糸', '竹', '木', '草'] },
  { id: 'kanji-choice-character', reading: 'じ', answer: '字', choices: ['字', '文', '本', '名'] },
  { id: 'kanji-choice-mimi', reading: 'みみ', answer: '耳', choices: ['耳', '目', '口', '手'] },
  { id: 'kanji-choice-seven', reading: 'なな', answer: '七', choices: ['七', '五', '八', '九'] },
  { id: 'kanji-choice-car', reading: 'くるま', answer: '車', choices: ['車', '村', '町', '林'] },
  { id: 'kanji-choice-te', reading: 'て', answer: '手', choices: ['手', '目', '耳', '足'] },
  { id: 'kanji-choice-ten', reading: 'じゅう', answer: '十', choices: ['十', '百', '千', '円'] },
  { id: 'kanji-choice-exit', reading: 'でる', answer: '出', choices: ['出', '入', '見', '立'] },
  { id: 'kanji-choice-woman', reading: 'おんな', answer: '女', choices: ['女', '男', '子', '人'] },
  { id: 'kanji-choice-small', reading: 'ちいさい', answer: '小', choices: ['小', '大', '早', '正'] },
  { id: 'kanji-choice-up', reading: 'うえ', answer: '上', choices: ['上', '下', '中', '右'] },
  { id: 'kanji-choice-forest', reading: 'もり', answer: '森', choices: ['森', '林', '山', '村'] },
  { id: 'kanji-choice-person', reading: 'ひと', answer: '人', choices: ['人', '子', '男', '女'] },
  { id: 'kanji-choice-mizu', reading: 'みず', answer: '水', choices: ['水', '火', '雨', '川'] },
  { id: 'kanji-choice-correct', reading: 'ただしい', answer: '正', choices: ['正', '早', '大', '小'] },
  { id: 'kanji-choice-life', reading: 'いきる', answer: '生', choices: ['生', '見', '出', '立'] },
  { id: 'kanji-choice-blue', reading: 'あお', answer: '青', choices: ['青', '赤', '白', '夕'] },
  { id: 'kanji-choice-evening', reading: 'ゆう', answer: '夕', choices: ['夕', '月', '日', '空'] },
  { id: 'kanji-choice-stone', reading: 'いし', answer: '石', choices: ['石', '玉', '貝', '土'] },
  { id: 'kanji-choice-red', reading: 'あか', answer: '赤', choices: ['赤', '青', '白', '夕'] },
  { id: 'kanji-choice-thousand', reading: 'せん', answer: '千', choices: ['千', '百', '十', '円'] },
  { id: 'kanji-choice-kawa', reading: 'かわ', answer: '川', choices: ['川', '山', '水', '雨'] },
  { id: 'kanji-choice-ahead', reading: 'せん', answer: '先', choices: ['先', '年', '天', '本'] },
  { id: 'kanji-choice-early', reading: 'はやい', answer: '早', choices: ['早', '正', '小', '大'] },
  { id: 'kanji-choice-grass', reading: 'くさ', answer: '草', choices: ['草', '花', '木', '竹'] },
  { id: 'kanji-choice-foot', reading: 'あし', answer: '足', choices: ['足', '手', '耳', '目'] },
  { id: 'kanji-choice-village', reading: 'むら', answer: '村', choices: ['村', '町', '林', '森'] },
  { id: 'kanji-choice-big', reading: 'おおきい', answer: '大', choices: ['大', '小', '早', '正'] },
  { id: 'kanji-choice-man', reading: 'おとこ', answer: '男', choices: ['男', '女', '子', '人'] },
  { id: 'kanji-choice-bamboo', reading: 'たけ', answer: '竹', choices: ['竹', '木', '草', '糸'] },
  { id: 'kanji-choice-inside', reading: 'なか', answer: '中', choices: ['中', '上', '下', '右'] },
  { id: 'kanji-choice-insect', reading: 'むし', answer: '虫', choices: ['虫', '犬', '貝', '人'] },
  { id: 'kanji-choice-town', reading: 'まち', answer: '町', choices: ['町', '村', '林', '森'] },
  { id: 'kanji-choice-sky', reading: 'てん', answer: '天', choices: ['天', '気', '空', '夕'] },
  { id: 'kanji-choice-rice-field', reading: 'た', answer: '田', choices: ['田', '土', '村', '川'] },
  { id: 'kanji-choice-soil', reading: 'つち', answer: '土', choices: ['土', '石', '田', '水'] },
  { id: 'kanji-choice-two', reading: 'に', answer: '二', choices: ['二', '一', '三', '四'] },
  { id: 'kanji-choice-hi', reading: 'ひ', answer: '日', choices: ['日', '月', '空', '夕'] },
  { id: 'kanji-choice-enter', reading: 'はいる', answer: '入', choices: ['入', '出', '見', '立'] },
  { id: 'kanji-choice-year', reading: 'ねん', answer: '年', choices: ['年', '先', '天', '本'] },
  { id: 'kanji-choice-white', reading: 'しろ', answer: '白', choices: ['白', '赤', '青', '夕'] },
  { id: 'kanji-choice-eight', reading: 'はち', answer: '八', choices: ['八', '七', '九', '六'] },
  { id: 'kanji-choice-hundred', reading: 'ひゃく', answer: '百', choices: ['百', '十', '千', '円'] },
  { id: 'kanji-choice-sentence', reading: 'ぶん', answer: '文', choices: ['文', '字', '本', '名'] },
  { id: 'kanji-choice-ki', reading: 'き', answer: '木', choices: ['木', '竹', '草', '糸'] },
  { id: 'kanji-choice-book', reading: 'ほん', answer: '本', choices: ['本', '文', '字', '名'] },
  { id: 'kanji-choice-name', reading: 'な', answer: '名', choices: ['名', '本', '文', '字'] },
  { id: 'kanji-choice-me', reading: 'め', answer: '目', choices: ['目', '耳', '口', '手'] },
  { id: 'kanji-choice-stand', reading: 'たつ', answer: '立', choices: ['立', '見', '出', '入'] },
  { id: 'kanji-choice-power', reading: 'ちから', answer: '力', choices: ['力', '手', '足', '人'] },
  { id: 'kanji-choice-woods', reading: 'はやし', answer: '林', choices: ['林', '森', '村', '町'] },
  { id: 'kanji-choice-six', reading: 'ろく', answer: '六', choices: ['六', '四', '五', '七'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createKanjiChoiceQuestions(random: () => number = Math.random): KanjiChoiceQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (!source.reading || source.answer.length !== 1 || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((kanji, index) => ({
      id: `${source.id}-choice-${index}`,
      kanji,
    }))
    const correctChoice = choices.find((choice) => choice.kanji === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      reading: source.reading,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
