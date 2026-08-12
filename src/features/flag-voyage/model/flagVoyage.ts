export const FLAG_VOYAGE_ROUND_COUNT = 12

export const FLAG_VOYAGE_COUNTRIES = [
  { id: 'japan', code: 'jp', name: '日本', continent: 'アジア' },
  { id: 'china', code: 'cn', name: '中国', continent: 'アジア' },
  { id: 'south-korea', code: 'kr', name: '韓国', continent: 'アジア' },
  { id: 'india', code: 'in', name: 'インド', continent: 'アジア' },
  { id: 'thailand', code: 'th', name: 'タイ', continent: 'アジア' },
  { id: 'indonesia', code: 'id', name: 'インドネシア', continent: 'アジア' },
  { id: 'vietnam', code: 'vn', name: 'ベトナム', continent: 'アジア' },
  { id: 'philippines', code: 'ph', name: 'フィリピン', continent: 'アジア' },
  { id: 'malaysia', code: 'my', name: 'マレーシア', continent: 'アジア' },
  { id: 'nepal', code: 'np', name: 'ネパール', continent: 'アジア' },
  { id: 'united-states', code: 'us', name: 'アメリカ', continent: '北アメリカ' },
  { id: 'canada', code: 'ca', name: 'カナダ', continent: '北アメリカ' },
  { id: 'mexico', code: 'mx', name: 'メキシコ', continent: '北アメリカ' },
  { id: 'cuba', code: 'cu', name: 'キューバ', continent: '北アメリカ' },
  { id: 'brazil', code: 'br', name: 'ブラジル', continent: '南アメリカ' },
  { id: 'argentina', code: 'ar', name: 'アルゼンチン', continent: '南アメリカ' },
  { id: 'chile', code: 'cl', name: 'チリ', continent: '南アメリカ' },
  { id: 'peru', code: 'pe', name: 'ペルー', continent: '南アメリカ' },
  { id: 'colombia', code: 'co', name: 'コロンビア', continent: '南アメリカ' },
  { id: 'united-kingdom', code: 'gb', name: 'イギリス', continent: 'ヨーロッパ' },
  { id: 'france', code: 'fr', name: 'フランス', continent: 'ヨーロッパ' },
  { id: 'germany', code: 'de', name: 'ドイツ', continent: 'ヨーロッパ' },
  { id: 'italy', code: 'it', name: 'イタリア', continent: 'ヨーロッパ' },
  { id: 'spain', code: 'es', name: 'スペイン', continent: 'ヨーロッパ' },
  { id: 'sweden', code: 'se', name: 'スウェーデン', continent: 'ヨーロッパ' },
  { id: 'switzerland', code: 'ch', name: 'スイス', continent: 'ヨーロッパ' },
  { id: 'portugal', code: 'pt', name: 'ポルトガル', continent: 'ヨーロッパ' },
  { id: 'netherlands', code: 'nl', name: 'オランダ', continent: 'ヨーロッパ' },
  { id: 'norway', code: 'no', name: 'ノルウェー', continent: 'ヨーロッパ' },
  { id: 'greece', code: 'gr', name: 'ギリシャ', continent: 'ヨーロッパ' },
  { id: 'russia', code: 'ru', name: 'ロシア', continent: 'ヨーロッパとアジアの間' },
  { id: 'egypt', code: 'eg', name: 'エジプト', continent: 'アフリカ' },
  { id: 'south-africa', code: 'za', name: '南アフリカ', continent: 'アフリカ' },
  { id: 'kenya', code: 'ke', name: 'ケニア', continent: 'アフリカ' },
  { id: 'morocco', code: 'ma', name: 'モロッコ', continent: 'アフリカ' },
  { id: 'nigeria', code: 'ng', name: 'ナイジェリア', continent: 'アフリカ' },
  { id: 'turkey', code: 'tr', name: 'トルコ', continent: 'アジアとヨーロッパの間' },
  { id: 'australia', code: 'au', name: 'オーストラリア', continent: 'オセアニア' },
  { id: 'new-zealand', code: 'nz', name: 'ニュージーランド', continent: 'オセアニア' },
  { id: 'fiji', code: 'fj', name: 'フィジー', continent: 'オセアニア' },
] as const

export type FlagVoyageCountryId = typeof FLAG_VOYAGE_COUNTRIES[number]['id']

export type FlagVoyageQuestion = {
  countryId: FlagVoyageCountryId
  choiceCountryIds: readonly FlagVoyageCountryId[]
}

export type FlagVoyageState = {
  status: 'playing' | 'round-won' | 'finished'
  journeyCountryIds: readonly FlagVoyageCountryId[]
  roundIndex: number
  question: FlagVoyageQuestion
  hintUsed: boolean
  selectedCountryId: FlagVoyageCountryId | null
  score: number
  combo: number
  bestCombo: number
  correctCount: number
  wrongCount: number
  hintCount: number
}

export type FlagVoyageAction =
  | { type: 'show-hint' }
  | { type: 'choose'; countryId: FlagVoyageCountryId }
  | { type: 'next' }

export type FlagVoyageEvent =
  | { type: 'hint-shown'; countryId: FlagVoyageCountryId }
  | { type: 'country-missed'; countryId: FlagVoyageCountryId }
  | { type: 'country-found'; countryId: FlagVoyageCountryId; points: number }
  | { type: 'voyage-finished' }

export type FlagVoyageTransition = {
  state: FlagVoyageState
  events: readonly FlagVoyageEvent[]
}

const countryIds = FLAG_VOYAGE_COUNTRIES.map(({ id }) => id)

const randomIndex = (length: number, random: () => number) =>
  Math.floor(Math.min(Math.max(random(), 0), 0.999999) * length)

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const createQuestion = (countryId: FlagVoyageCountryId, random: () => number): FlagVoyageQuestion => {
  const distractors = shuffle(countryIds.filter((id) => id !== countryId), random).slice(0, 3)
  return {
    countryId,
    choiceCountryIds: shuffle([countryId, ...distractors], random),
  }
}

export function startFlagVoyage(random: () => number = Math.random): FlagVoyageState {
  const journeyCountryIds = shuffle(countryIds, random).slice(0, FLAG_VOYAGE_ROUND_COUNT)
  const firstCountryId = journeyCountryIds[0]
  if (!firstCountryId) throw new Error('国旗の問題を始められません')

  return {
    status: 'playing',
    journeyCountryIds,
    roundIndex: 0,
    question: createQuestion(firstCountryId, random),
    hintUsed: false,
    selectedCountryId: null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    hintCount: 0,
  }
}

export function applyFlagVoyageAction(
  state: FlagVoyageState,
  action: FlagVoyageAction,
  random: () => number = Math.random,
): FlagVoyageTransition {
  if (state.status === 'finished') return { state, events: [] }

  if (action.type === 'show-hint') {
    if (state.status !== 'playing' || state.hintUsed) return { state, events: [] }
    return {
      state: { ...state, hintUsed: true, hintCount: state.hintCount + 1 },
      events: [{ type: 'hint-shown', countryId: state.question.countryId }],
    }
  }

  if (action.type === 'next') {
    if (state.status !== 'round-won') return { state, events: [] }
    const nextRoundIndex = state.roundIndex + 1
    const nextCountryId = state.journeyCountryIds[nextRoundIndex]
    if (!nextCountryId) {
      return {
        state: { ...state, status: 'finished' },
        events: [{ type: 'voyage-finished' }],
      }
    }
    return {
      state: {
        ...state,
        status: 'playing',
        roundIndex: nextRoundIndex,
        question: createQuestion(nextCountryId, random),
        hintUsed: false,
        selectedCountryId: null,
      },
      events: [],
    }
  }

  if (state.status !== 'playing' || !state.question.choiceCountryIds.includes(action.countryId)) {
    return { state, events: [] }
  }

  if (action.countryId !== state.question.countryId) {
    return {
      state: {
        ...state,
        selectedCountryId: action.countryId,
        combo: 0,
        wrongCount: state.wrongCount + 1,
      },
      events: [{ type: 'country-missed', countryId: action.countryId }],
    }
  }

  const combo = state.combo + 1
  const points = state.hintUsed ? 60 : 100 + state.combo * 20
  return {
    state: {
      ...state,
      status: 'round-won',
      selectedCountryId: action.countryId,
      score: state.score + points,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      correctCount: state.correctCount + 1,
    },
    events: [{ type: 'country-found', countryId: action.countryId, points }],
  }
}

export const findFlagVoyageCountry = (countryId: FlagVoyageCountryId) =>
  FLAG_VOYAGE_COUNTRIES.find(({ id }) => id === countryId)
