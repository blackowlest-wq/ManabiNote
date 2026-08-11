import type { GameId } from '../features/clear-progress/model/gameIds'

export type GameMenuItem = {
  id: GameId
  to: string
  label: string
  description: string
}

export type GameCategory = {
  to: string
  title: string
  description: string
  games: readonly GameMenuItem[]
}

export const GAME_CATEGORIES = {
  words: {
    to: '/words',
    title: 'ことば',
    description: 'ひらがなや ことばで あそぼう',
    games: [
      { id: 'quiz', to: '/quiz', label: 'ひらがなから えを えらぼう', description: 'ひらがなに あう えを えらぶ' },
      { id: 'stroke-order', to: '/stroke-order', label: '書き順れんしゅう', description: 'ひらがなの じゅんばんを なぞる' },
      { id: 'word-builder', to: '/word-builder', label: 'ことばを つくろう', description: 'えの なまえを つくる' },
      { id: 'missing-character', to: '/missing-character', label: 'ことばの あなうめ', description: 'たりない もじを えらぶ' },
      { id: 'kana-pair', to: '/kana-pair', label: 'ひらがなと カタカナ', description: 'なかまの もじを みつける' },
      { id: 'dakuten', to: '/dakuten', label: 'てんてんと まる', description: 'にている もじを みわける' },
      { id: 'kana-group', to: '/kana-group', label: 'かなの なかまわけ', description: 'おなじ なかまを えらぶ' },
      { id: 'audio-kana', to: '/audio-kana', label: 'おとを きいて えらぼう', description: 'きこえた かなを えらぶ' },
      { id: 'memory', to: '/memory', label: 'かなと えの しんけいすいじゃく', description: 'もじと えの ペアを さがす' },
      { id: 'small-kana', to: '/small-kana', label: 'ちいさい かな', description: 'ゃゅょ・っを れんしゅうする' },
      { id: 'shiritori', to: '/shiritori', label: 'しりとり', description: 'つぎの ことばを えらぶ' },
    ],
  },
  numbers: {
    to: '/numbers',
    title: 'かず',
    description: 'かぞえたり くらべたり してみよう',
    games: [
      { id: 'counting', to: '/counting', label: 'かずを かぞえよう', description: 'えの かずを かぞえる' },
      { id: 'number-compare', to: '/number-compare', label: 'おおきい かずは どれ？', description: 'おおきい かずを えらぶ' },
      { id: 'number-order', to: '/number-order', label: 'つぎの かずは どれ？', description: 'かずの じゅんばんを かんがえる' },
      { id: 'addition', to: '/addition', label: 'たしざん', description: 'あわせて いくつか かんがえる' },
      { id: 'subtraction', to: '/subtraction', label: 'ひきざん', description: 'のこりは いくつか かんがえる' },
      { id: 'clock', to: '/clock', label: 'とけいを よもう', description: 'とけいの はりが さす じかんを よむ' },
    ],
  },
  shapes: {
    to: '/shapes',
    title: 'かたち',
    description: 'いろや かたちを みつけよう',
    games: [
      { id: 'shape-color', to: '/shape-color', label: 'いろと かたち', description: 'おなじ いろと かたちを えらぶ' },
      { id: 'shape-pattern', to: '/shape-pattern', label: 'かたちの ならび', description: 'つぎに くる かたちを かんがえる' },
    ],
  },
  kanji: {
    to: '/kanji',
    title: 'かんじ',
    description: 'かんじの よみかたを おぼえよう',
    games: [
      { id: 'kanji-reading', to: '/kanji-reading', label: 'かんじの よみかた', description: 'かんじに あう よみかたを えらぶ' },
      { id: 'kanji-choice', to: '/kanji-choice', label: 'よみから かんじ', description: 'よみかたに あう かんじを えらぶ' },
    ],
  },
  sentences: {
    to: '/sentences',
    title: 'ぶん',
    description: 'ことばを ならべて ぶんを つくろう',
    games: [
      { id: 'sentence-order', to: '/sentence-order', label: 'ことばを ならべよう', description: 'ただしい じゅんばんに ならべる' },
      { id: 'particle-choice', to: '/particle-choice', label: 'ことばを つなごう', description: 'ぶんを つなぐ ことばを えらぶ' },
      { id: 'reading-comprehension', to: '/reading-comprehension', label: 'ぶんを よんで こたえよう', description: 'みじかい ぶんを よんで こたえる' },
    ],
  },
  play: {
    to: '/play',
    title: 'あそび',
    description: 'ぼうけんしながら かんがえよう',
    games: [
      { id: 'rescue-maze', to: '/rescue-maze', label: 'どうぶつレスキュー', description: 'めいろを すすんで どうぶつを たすける' },
    ],
  },
} satisfies Record<string, GameCategory>

export const GAME_CATEGORY_LIST: readonly GameCategory[] = Object.values(GAME_CATEGORIES)
