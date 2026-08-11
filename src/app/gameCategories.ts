export type GameMenuItem = {
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
      { to: '/quiz', label: 'ひらがなから えを えらぼう', description: 'ひらがなに あう えを えらぶ' },
      { to: '/stroke-order', label: '書き順れんしゅう', description: 'ひらがなの じゅんばんを なぞる' },
      { to: '/word-builder', label: 'ことばを つくろう', description: 'えの なまえを つくる' },
      { to: '/missing-character', label: 'ことばの あなうめ', description: 'たりない もじを えらぶ' },
      { to: '/kana-pair', label: 'ひらがなと カタカナ', description: 'なかまの もじを みつける' },
      { to: '/dakuten', label: 'てんてんと まる', description: 'にている もじを みわける' },
      { to: '/kana-group', label: 'かなの なかまわけ', description: 'おなじ なかまを えらぶ' },
      { to: '/audio-kana', label: 'おとを きいて えらぼう', description: 'きこえた かなを えらぶ' },
      { to: '/memory', label: 'かなと えの しんけいすいじゃく', description: 'もじと えの ペアを さがす' },
      { to: '/small-kana', label: 'ちいさい かな', description: 'ゃゅょ・っを れんしゅうする' },
      { to: '/shiritori', label: 'しりとり', description: 'つぎの ことばを えらぶ' },
    ],
  },
  numbers: {
    to: '/numbers',
    title: 'かず',
    description: 'かぞえたり くらべたり してみよう',
    games: [
      { to: '/counting', label: 'かずを かぞえよう', description: 'えの かずを かぞえる' },
      { to: '/number-compare', label: 'おおきい かずは どれ？', description: 'おおきい かずを えらぶ' },
      { to: '/number-order', label: 'つぎの かずは どれ？', description: 'かずの じゅんばんを かんがえる' },
      { to: '/addition', label: 'たしざん', description: 'あわせて いくつか かんがえる' },
      { to: '/subtraction', label: 'ひきざん', description: 'のこりは いくつか かんがえる' },
      { to: '/clock', label: 'とけいを よもう', description: 'とけいの はりが さす じかんを よむ' },
    ],
  },
  shapes: {
    to: '/shapes',
    title: 'かたち',
    description: 'いろや かたちを みつけよう',
    games: [
      { to: '/shape-color', label: 'いろと かたち', description: 'おなじ いろと かたちを えらぶ' },
      { to: '/shape-pattern', label: 'かたちの ならび', description: 'つぎに くる かたちを かんがえる' },
    ],
  },
  kanji: {
    to: '/kanji',
    title: 'かんじ',
    description: 'かんじの よみかたを おぼえよう',
    games: [
      { to: '/kanji-reading', label: 'かんじの よみかた', description: 'かんじに あう よみかたを えらぶ' },
      { to: '/kanji-choice', label: 'よみから かんじ', description: 'よみかたに あう かんじを えらぶ' },
    ],
  },
  sentences: {
    to: '/sentences',
    title: 'ぶん',
    description: 'ことばを ならべて ぶんを つくろう',
    games: [
      { to: '/sentence-order', label: 'ことばを ならべよう', description: 'ただしい じゅんばんに ならべる' },
      { to: '/particle-choice', label: 'ことばを つなごう', description: 'ぶんを つなぐ ことばを えらぶ' },
      { to: '/reading-comprehension', label: 'ぶんを よんで こたえよう', description: 'みじかい ぶんを よんで こたえる' },
    ],
  },
} satisfies Record<string, GameCategory>

export const GAME_CATEGORY_LIST: readonly GameCategory[] = Object.values(GAME_CATEGORIES)
