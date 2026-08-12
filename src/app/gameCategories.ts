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
      { id: 'kanji-stroke-order', to: '/kanji-stroke-order', label: 'かんじの 書き順', description: 'かんじを なぞって じゅんばんを おぼえる' },
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
  knowledge: {
    to: '/knowledge',
    title: 'ものしり',
    description: 'せかいの いろいろを みつけよう',
    games: [
      { id: 'flag-voyage', to: '/flag-voyage', label: '国旗で せかい一周', description: '国旗を 見て 国の 名前を あてる' },
    ],
  },
  play: {
    to: '/play',
    title: 'あそび',
    description: 'ぼうけんしながら かんがえよう',
    games: [
      { id: 'rescue-maze', to: '/rescue-maze', label: 'どうぶつレスキュー', description: 'めいろを すすんで どうぶつを たすける' },
      { id: 'cooking', to: '/cooking', label: 'わくわくキッチン', description: 'ちゅうもんを みて りょうりを つくる' },
      { id: 'monster-merge', to: '/monster-merge', label: 'モンスター合体', description: 'おなじ モンスターを くっつけて しんか' },
      { id: 'pipe-path', to: '/pipe-path', label: 'みずの みち', description: 'パイプを まわして おはなに みずやり' },
      { id: 'shop-game', to: '/shop-game', label: 'どうぶつマーケット', description: 'ちゅうもんどおりに かごへ おかいもの' },
      { id: 'treasure-hunt', to: '/treasure-hunt', label: 'どこかな？たからじま', description: 'ほうこうの ヒントで たからを さがす' },
      { id: 'packing-puzzle', to: '/packing-puzzle', label: 'ぴったり！にづみ', description: 'にもつを まわして すきまなく つめる' },
      { id: 'robot-route', to: '/robot-route', label: 'ロボット GO！', description: 'うごきを ならべて ロボットを みちびく' },
      { id: 'shadow-hunt', to: '/shadow-hunt', label: 'シルエットハンター', description: 'かげと おなじ モンスターを みつける' },
      { id: 'forest-guard', to: '/forest-guard', label: 'もりの まもり隊', description: 'あいしょうを みて ガードを はいちする' },
      { id: 'copy-beat', to: '/copy-beat', label: 'まねっこビート', description: 'ひかる リズムを おぼえて まねする' },
      { id: 'sorting-factory', to: '/sorting-factory', label: 'ぽんぽん しわけ工場', description: 'ながれる ものを 2つの はこへ しわける' },
      { id: 'opposite-ghost', to: '/opposite-ghost', label: 'アベコベおばけ', description: 'うさぎは おなじ、おばけは はんたいへ' },
      { id: 'balance-boat', to: '/balance-boat', label: 'ぐらぐら おとどけ便', description: 'にもつを ふねの りょうがわへ のせる' },
      { id: 'bridge-builder', to: '/bridge-builder', label: 'ぽんぽこ 橋づくり', description: 'まるたを くみあわせて かわに はしを かける' },
      { id: 'rolling-labyrinth', to: '/rolling-labyrinth', label: 'くるくる ラビリンス', description: 'めいろを まわして たまを ころがす' },
      { id: 'firefly-lights', to: '/firefly-lights', label: 'ぴかぴか ほたる', description: 'となりも かわる ひかりを ぜんぶ つける' },
      { id: 'sheep-move', to: '/sheep-move', label: 'ひつじの おひっこし', description: 'ひつじを おして おうちへ つれていく' },
      { id: 'balloon-flight', to: '/balloon-flight', label: 'ふわふわ バルーン', description: 'たかさを かえて くもの すきまを とぶ' },
      { id: 'frog-jump', to: '/frog-jump', label: 'かえるジャンプ', description: 'かおの むきへ とんで ばしょを いれかえる' },
      { id: 'log-slide', to: '/log-slide', label: 'どんぐり だいだっしゅつ', description: 'まるたを ずらして リスの みちを あける' },
      { id: 'ghost-hide', to: '/ghost-hide', label: 'おばけ かくれんぼ', description: 'すがたを おぼえて むれから みつける' },
      { id: 'helper-team', to: '/helper-team', label: 'どうぶつ おたすけ隊', description: 'とくいな なかまを じゅんばんに ならべる' },
      { id: 'bee-route', to: '/bee-route', label: 'みつばち フラワールート', description: 'はばたきを のこして おはなを めぐる' },
      { id: 'bubble-chain', to: '/bubble-chain', label: 'ぽんぽん バブルれんさ', description: 'はじける なみを つないで ぜんぶ けす' },
      { id: 'animal-tower', to: '/animal-tower', label: 'ぐらぐら どうぶつタワー', description: 'うごく あしばを かさねて たかく つむ' },
      { id: 'penguin-ice', to: '/penguin-ice', label: 'ペンギン こおりとり', description: 'こおりを すすんで さかなを あつめる' },
      { id: 'cat-chase', to: '/cat-chase', label: 'ねこねこ おいかけっこ', description: 'にげる ねずみを かべへ おいつめる' },
      { id: 'rocket-landing', to: '/rocket-landing', label: 'ロケット ふわっと着陸', description: 'おちる はやさを ふんしゃで ちょうせつする' },
      { id: 'animal-crossing', to: '/animal-crossing', label: 'どうぶつ こうさてん', description: 'しんごうを きりかえて くるまを とおす' },
      { id: 'dance-spotlight', to: '/dance-spotlight', label: 'くるくる ダンススポット', description: 'くりかえす ひかりへ リズムよく うごく' },
      { id: 'shape-catcher', to: '/shape-catcher', label: 'くるくる かたちキャッチ', description: 'おちる かたちに あわせて うけざらを まわす' },
    ],
  },
} satisfies Record<string, GameCategory>

export const GAME_CATEGORY_LIST: readonly GameCategory[] = Object.values(GAME_CATEGORIES)
