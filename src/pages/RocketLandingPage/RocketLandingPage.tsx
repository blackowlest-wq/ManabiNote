import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  applyRocketLandingAction,
  calculateRocketLandingResult,
  ROCKET_LANDING_STAGES,
  startRocketLanding,
  type RocketLandingState,
} from '../../features/rocket-landing/model/rocketLanding'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

export function RocketLandingPage({ storage, initialState }: { storage?: Storage; initialState?: RocketLandingState } = {}) {
  const [game, setGame] = useState<RocketLandingState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('おちる はやさを みて ふんしゃ！')
  const recorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateRocketLandingResult(game) : null, [game])

  useEffect(() => {
    if (result?.isCleared && !recorded.current) {
      recorded.current = true
      markGameCleared('rocket-landing', storage)
    }
  }, [result, storage])

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame(current => {
        if (!current || current.status !== 'playing') return current
        const transition = applyRocketLandingAction(current, { type: 'tick' })
        if (transition.events.some(event => event.type === 'landed')) setFeedback('ふわっと ちゃくりく！')
        else if (transition.events.some(event => event.type === 'crashed')) setFeedback('はやすぎた！ もういちど ちょうせん')
        return transition.state
      })
    }, 600)
    return () => window.clearInterval(timer)
  }, [game?.stageIndex, game?.status])

  const begin = () => {
    recorded.current = false
    setFeedback('おちる はやさを みて ふんしゃ！')
    setGame(startRocketLanding())
  }

  const act = (action: Parameters<typeof applyRocketLandingAction>[1]) => {
    if (!game) return
    const transition = applyRocketLandingAction(game, action)
    if (transition.events.some(event => event.type === 'thrusted')) setFeedback('🔥 ブレーキ！')
    else if (transition.events.some(event => event.type === 'fuel-empty')) setFeedback('ねんりょうが からっぽ！')
    else if (action.type === 'retry' || action.type === 'next-stage') setFeedback('おちる はやさを みて ふんしゃ！')
    setGame(transition.state)
  }

  if (!game) return (
    <PageLayout title="ロケット ふわっと着陸">
      <div className="rocket-landing-center rocket-landing-intro">
        <div className="rocket-landing-scene" aria-hidden="true">🚀　🌙</div>
        <p>ロケットが はやく おちすぎないように、ふんしゃで ブレーキを かけよう。</p>
        <p>ねんりょうを のこすと ほしが ふえるよ！</p>
        <button className="primary-button" onClick={begin}>ちゃくりくへ！</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  if (result) return (
    <PageLayout title="ロケット ふわっと着陸">
      <div className="rocket-landing-center rocket-landing-intro">
        <div className="rocket-landing-scene" aria-hidden="true">🚀✨🏆✨</div>
        <h2>ちゃくりく マスター！</h2>
        <p className="rocket-landing-score">⭐ {result.stars}こ　{result.score}てん</p>
        <button className="primary-button" onClick={begin}>もういちど</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  const stage = ROCKET_LANDING_STAGES[game.stageIndex]
  const progress = Math.min(82, 6 + (1 - game.altitude / stage.maxAltitude) * 76)
  const fallSpeed = Math.max(0, game.velocity)
  const safe = fallSpeed <= stage.safeSpeed
  return (
    <PageLayout title="ロケット ふわっと着陸">
      <div className="rocket-landing-center">
        <div className="rocket-landing-hud">
          <span>{stage.planet} {game.stageIndex + 1} / {ROCKET_LANDING_STAGES.length}</span>
          <span>⛽ {game.fuel}</span>
          <span>⭐ {game.totalStars}</span>
        </div>
        <b>{stage.name}</b>
        <div className="rocket-landing-sky" aria-label="ちゃくりくする ロケット">
          <div className="rocket-landing-stars" aria-hidden="true">✦　·　✧　·　✦</div>
          <div className="rocket-landing-rocket" style={{ top: `${progress}%` }} aria-hidden="true">🚀</div>
          <div className="rocket-landing-ground" aria-hidden="true"><span>{stage.planet}</span><i /></div>
          <div className={`rocket-landing-speed${safe ? ' rocket-landing-speed--safe' : ' rocket-landing-speed--fast'}`}>
            <small>おちる はやさ</small>
            <strong>{'↓'.repeat(Math.min(5, fallSpeed || 1))}</strong>
            <span>{safe ? 'ゆっくり' : 'はやい！'}</span>
          </div>
        </div>
        <p className="rocket-landing-feedback" aria-live="polite">{feedback}</p>
        {game.status === 'playing' && (
          <button className="rocket-landing-thrust" aria-label="ふんしゃ！" disabled={game.fuel === 0} onClick={() => act({ type: 'thrust' })}>
            <span aria-hidden="true">🔥</span> ふんしゃ！
          </button>
        )}
        {game.status === 'stage-won' && (
          <section className="rocket-landing-finish">
            <h2>ふわっと ちゃくりく！</h2>
            <p>{'⭐'.repeat(game.stageStars)}　⛽ {game.fuel} のこり</p>
            <button className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの ほし</button>
          </section>
        )}
        {game.status === 'crashed' && (
          <section className="rocket-landing-finish">
            <h2>ドシーン！ はやすぎた</h2>
            <p>じめんの ちかくで ゆっくりに しよう</p>
            <button className="primary-button" onClick={() => act({ type: 'retry' })}>もういちど</button>
          </section>
        )}
        <button className="rocket-landing-quit" onClick={() => setGame(null)}>うちゅうを でる</button>
      </div>
    </PageLayout>
  )
}
