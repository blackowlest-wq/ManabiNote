import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { ReadingComprehensionQuestion } from './types'

type ReadingComprehensionSource = {
  id: string
  difficulty: GameDifficulty
  passage: string
  prompt: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly ReadingComprehensionSource[] = [
  { id: 'reading-apple', difficulty: 'easy', passage: 'りんごは あかいです。', prompt: 'りんごは なんいろ？', answer: 'あか', choices: ['あか', 'あお', 'きいろ', 'しろ'] },
  { id: 'reading-cat', difficulty: 'easy', passage: 'ねこが いすで ねています。', prompt: 'ねこは どこで ねていますか？', answer: 'いす', choices: ['いす', 'つくえ', 'ベッド', 'そと'] },
  { id: 'reading-water', difficulty: 'easy', passage: 'たろうくんは みずを のみました。', prompt: 'なにを のみましたか？', answer: 'みず', choices: ['みず', 'ぎゅうにゅう', 'おちゃ', 'ジュース'] },
  { id: 'reading-bird', difficulty: 'easy', passage: 'とりが そらを とんでいます。', prompt: 'とりは どこを とんでいますか？', answer: 'そら', choices: ['そら', 'うみ', 'みち', 'へや'] },
  { id: 'reading-three-apples', difficulty: 'easy', passage: 'みきさんは りんごを 3こ もちました。', prompt: 'りんごは なんこ？', answer: '3こ', choices: ['1こ', '2こ', '3こ', '4こ'] },
  { id: 'reading-dog', difficulty: 'easy', passage: 'いぬが こうえんを はしっています。', prompt: 'はしっているのは だれ？', answer: 'いぬ', choices: ['いぬ', 'ねこ', 'うさぎ', 'とり'] },
  { id: 'reading-father', difficulty: 'easy', passage: 'おとうさんは ほんを よんでいます。', prompt: 'おとうさんは なにを していますか？', answer: 'ほんを よんでいる', choices: ['ほんを よんでいる', 'えを かいている', 'うたっている', 'ねている'] },
  { id: 'reading-breakfast', difficulty: 'normal', passage: 'あさ、みきさんは パンを たべました。そのあと がっこうへ いきました。', prompt: 'あさ、なにを たべましたか？', answer: 'パン', choices: ['パン', 'ごはん', 'りんご', 'たまご'] },
  { id: 'reading-ball', difficulty: 'normal', passage: 'ゆいさんは おとうとと こうえんへ いきました。ふたりで ボールあそびを しました。', prompt: 'だれと こうえんへ いきましたか？', answer: 'おとうと', choices: ['おとうと', 'おねえさん', 'おかあさん', 'ともだち'] },
  { id: 'reading-umbrella', difficulty: 'normal', passage: 'そとは あめです。けんくんは きいろい かさを さして でかけました。', prompt: 'かさは なんいろ？', answer: 'きいろ', choices: ['きいろ', 'あか', 'あお', 'みどり'] },
  { id: 'reading-zoo', difficulty: 'normal', passage: 'どうぶつえんで ぞうと きりんを みました。ながい くびの きりんが いちばん すきでした。', prompt: 'いちばん すきだった どうぶつは？', answer: 'きりん', choices: ['きりん', 'ぞう', 'ライオン', 'さる'] },
  { id: 'reading-curry', difficulty: 'normal', passage: 'おかあさんは にんじんと じゃがいもを かいました。ばんごはんに カレーを つくります。', prompt: 'ばんごはんに なにを つくりますか？', answer: 'カレー', choices: ['カレー', 'うどん', 'サラダ', 'おにぎり'] },
  { id: 'reading-library', difficulty: 'normal', passage: 'あやさんは としょかんで ものがたりを かりました。ねるまえに その ほんを よみました。', prompt: 'いつ ほんを よみましたか？', answer: 'ねるまえ', choices: ['ねるまえ', 'あさおきて', 'ひるごはんのあと', 'がっこうで'] },
  { id: 'reading-sunflower', difficulty: 'normal', passage: 'にわに ひまわりの たねを まきました。まいあさ じょうろで みずを やります。', prompt: 'まいあさ なにを しますか？', answer: 'みずを やる', choices: ['みずを やる', 'はなを つむ', 'たねを たべる', 'つちを はこぶ'] },
  { id: 'reading-trip', difficulty: 'hard', passage: 'あしたは えんそくです。てんきよほうは あめなので、ゆうきくんは かさを かばんに いれました。', prompt: 'どうして かさを いれましたか？', answer: 'あめが ふりそうだから', choices: ['あめが ふりそうだから', 'ひが つよそうだから', 'にもつが すくないから', 'かさが こわれたから'] },
  { id: 'reading-morning-order', difficulty: 'hard', passage: 'まいさんは 7じに おきました。かおを あらってから あさごはんを たべ、8じに いえを でました。', prompt: 'あさごはんの まえに なにを しましたか？', answer: 'かおを あらった', choices: ['かおを あらった', 'いえを でた', 'ほんを よんだ', 'ふくを あらった'] },
  { id: 'reading-ice', difficulty: 'hard', passage: 'あつい ひに アイスを かいました。こうえんに ついたとき、アイスは やわらかく なっていました。', prompt: 'アイスが やわらかく なったのは なぜ？', answer: 'あつかったから', choices: ['あつかったから', 'さむかったから', 'あめが ふったから', 'かぜが ふいたから'] },
  { id: 'reading-tomato', difficulty: 'hard', passage: 'はるに トマトの なえを うえました。まいにち みずを やると、なつに あかい みが なりました。', prompt: 'そだった やさいは なに？', answer: 'トマト', choices: ['トマト', 'にんじん', 'きゅうり', 'じゃがいも'] },
  { id: 'reading-bus', difficulty: 'hard', passage: 'えきまで あるく よていでしたが、あめが つよく なりました。そこで、バスに のって えきへ いきました。', prompt: 'どうして バスに のりましたか？', answer: 'あめが つよく なったから', choices: ['あめが つよく なったから', 'みちに まよったから', 'くつを わすれたから', 'バスが きらいだから'] },
  { id: 'reading-pencil', difficulty: 'hard', passage: 'けんくんは えんぴつを さがしました。つくえと かばんには ありません。さいごに いすの したで みつけました。', prompt: 'えんぴつは どこに ありましたか？', answer: 'いすの した', choices: ['いすの した', 'つくえの うえ', 'かばんの なか', 'ほんだなの うえ'] },
  { id: 'reading-closed-library', difficulty: 'hard', passage: 'さきさんは としょかんへ いきましたが、おやすみでした。となりの こうえんへ いき、もっていた ほんを よみました。', prompt: 'どこで ほんを よみましたか？', answer: 'こうえん', choices: ['こうえん', 'としょかん', 'がっこう', 'いえ'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createReadingComprehensionQuestions(
  difficulty: GameDifficulty = 'normal',
  random: () => number = Math.random,
): ReadingComprehensionQuestion[] {
  return QUESTION_SOURCES.filter((source) => source.difficulty === difficulty).map((source) => {
    if (!source.passage || !source.prompt || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((choice, index) => ({
      id: `${source.id}-choice-${index}`,
      text: choice,
    }))
    const correctChoice = choices.find((choice) => choice.text === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      passage: source.passage,
      prompt: source.prompt,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
