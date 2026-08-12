import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { CountryFlag } from '../../features/flag-voyage/components/CountryFlag'
import { WorldMapHint } from '../../features/flag-voyage/components/WorldMapHint'
import {
  applyFlagVoyageAction,
  findFlagVoyageCountry,
  FLAG_VOYAGE_ROUND_COUNT,
  startFlagVoyage,
  type FlagVoyageAction,
  type FlagVoyageState,
} from '../../features/flag-voyage/model/flagVoyage'
import { PageLayout } from '../../shared/components/PageLayout'

export type FlagVoyagePageProps = {
  storage?: Storage
  random?: () => number
  initialState?: FlagVoyageState
}

export function FlagVoyagePage({ storage, random = Math.random, initialState }: FlagVoyagePageProps = {}) {
  const [game, setGame] = useState<FlagVoyageState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('この 国旗は どこの 国かな？')
  const clearRecorded = useRef(false)

  useEffect(() => {
    if (game?.status !== 'finished' || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('flag-voyage', storage)
  }, [game?.status, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('この 国旗は どこの 国かな？')
    setGame(startFlagVoyage(random))
  }

  const act = (action: FlagVoyageAction) => {
    if (!game) return
    const transition = applyFlagVoyageAction(game, action, random)
    const event = transition.events[0]
    if (event?.type === 'hint-shown') setFeedback('ちずで ばしょを たしかめよう！')
    if (event?.type === 'country-missed') setFeedback('おしい！ 国旗を よく 見てみよう')
    if (event?.type === 'country-found') {
      const country = findFlagVoyageCountry(event.countryId)
      setFeedback(`${country?.name ?? 'その国'} せいかい！ +${event.points}てん`)
    }
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="国旗で せかい一周">
        <div className="flag-voyage-intro">
          <div className="flag-voyage-intro__scene" aria-hidden="true">🚢 🌏 🧳</div>
          <p>国旗を 見て、国の 名前を あてよう！</p>
          <p>むずかしい ときは、ちずの ヒントが つかえるよ。</p>
          <p>{FLAG_VOYAGE_ROUND_COUNT}この 国旗を あてて せかい一周！</p>
          <button type="button" className="primary-button" onClick={begin}>国旗の旅へ しゅっぱつ</button>
          <Link to="/knowledge">ものしりへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (game.status === 'finished') {
    return (
      <PageLayout title="国旗で せかい一周">
        <div className="flag-voyage-result">
          <div className="flag-voyage-result__scene" aria-hidden="true">🎉 🌏 🏆 🎉</div>
          <h2>せかい一周 たっせい！</h2>
          <p className="flag-voyage-result__score">{game.score} てん</p>
          <p>さいこうコンボ {game.bestCombo} ・ ちずのヒント {game.hintCount}かい</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど 旅する</button>
          <Link to="/knowledge">ものしりへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const country = findFlagVoyageCountry(game.question.countryId)
  const isLastRound = game.roundIndex === FLAG_VOYAGE_ROUND_COUNT - 1

  return (
    <PageLayout title="国旗で せかい一周">
      <div className="flag-voyage-page">
        <div className="flag-voyage-hud">
          <span>{game.roundIndex + 1} / {FLAG_VOYAGE_ROUND_COUNT}</span>
          <span>⭐ {game.score}</span>
          <span>🔥 {game.combo}</span>
          <span aria-label="パスポートのスタンプ">🛂 {game.correctCount}</span>
        </div>

        <section className="flag-voyage-question" aria-label="国旗から国を当てる">
          <p>この 国旗は どこの 国？</p>
          <div className="flag-voyage-flag-frame">
            <CountryFlag countryId={game.question.countryId} />
          </div>

          {!game.hintUsed && game.status === 'playing' && (
            <button type="button" className="flag-voyage-hint-button" aria-label="ちずのヒントを見る" onClick={() => act({ type: 'show-hint' })}>
              🗺️ ちずのヒントを見る
            </button>
          )}

          {game.hintUsed && <WorldMapHint countryId={game.question.countryId} />}

          <div className="flag-voyage-choices" role="group" aria-label="国の名前をえらぶ">
            {game.question.choiceCountryIds.map((countryId) => {
              const choice = findFlagVoyageCountry(countryId)
              const isSelected = game.selectedCountryId === countryId
              return (
                <button
                  key={countryId}
                  type="button"
                  className={`flag-voyage-choice${isSelected ? ' flag-voyage-choice--selected' : ''}`}
                  aria-pressed={isSelected}
                  disabled={game.status === 'round-won'}
                  onClick={() => act({ type: 'choose', countryId })}
                >
                  {choice?.name}
                </button>
              )
            })}
          </div>
        </section>

        <p className="flag-voyage-feedback" role="status" aria-live="polite">{feedback}</p>

        {game.status === 'round-won' && (
          <div className="flag-voyage-passport">
            <span aria-hidden="true">✅ {country?.name} 📍</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next' })}>
              {isLastRound ? 'せかい一周を おえる' : 'つぎの国旗へ'}
            </button>
          </div>
        )}

        <button type="button" className="flag-voyage-quit" onClick={() => setGame(null)}>旅を やめる</button>
      </div>
    </PageLayout>
  )
}
