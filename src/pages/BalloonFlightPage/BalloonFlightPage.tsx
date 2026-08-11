import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyBalloonAction,
  BALLOON_CLEAR_TARGET,
  calculateBalloonFlightResult,
  startBalloonFlight,
  type BalloonFlightEvent,
  type BalloonFlightState,
} from '../../features/balloon-flight/model/balloonFlight'
import { PageLayout } from '../../shared/components/PageLayout'

export type BalloonFlightPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: BalloonFlightState
  tickMilliseconds?: number
}

const feedbackFor = (events: readonly BalloonFlightEvent[]) => {
  if (events.some((event) => event.type === 'gate-passed')) return 'すいーっ！ くもを ぬけた！'
  if (events.some((event) => event.type === 'cloud-hit')) return 'ぽふん！ くもに ぶつかった！'
  return null
}

export function BalloonFlightPage({
  storage,
  random = Math.random,
  initialState,
  tickMilliseconds = 780,
}: BalloonFlightPageProps = {}) {
  const [game, setGame] = useState<BalloonFlightState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('くもの すきまへ ふわふわ！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateBalloonFlightResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const speed = Math.max(430, tickMilliseconds - game.passedCount * 28)
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current) return current
        const transition = applyBalloonAction(current, { type: 'tick' }, random)
        const message = feedbackFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [game?.status, game?.passedCount, random, tickMilliseconds])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('balloon-flight', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('くもの すきまへ ふわふわ！')
    setGame(startBalloonFlight(random))
  }

  const move = (direction: 'up' | 'down') => {
    if (!game) return
    const transition = applyBalloonAction(game, { type: direction === 'up' ? 'move-up' : 'move-down' }, random)
    if (transition.state !== game) setFeedback(`ふわっ！ ${direction === 'up' ? 'うえ' : 'した'}へ`)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="ふわふわ バルーン">
        <div className="balloon-intro">
          <div className="balloon-intro__scene" aria-hidden="true">☁️ 🎈 ☁️ ⭐</div>
          <p>ふうせんを うえ・したへ うごかして、くもの すきまを ぬけよう！</p>
          <p>10この くもゲートを ぬけたら ゴール</p>
          <button type="button" className="primary-button" onClick={begin}>そらへ しゅっぱつ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ふわふわ バルーン">
        <div className="balloon-result">
          <div className="balloon-result__scene" aria-hidden="true">{result.isCleared ? '🎉🎈🏆🎈🎉' : '☁️🎈☁️'}</div>
          <h2>{result.isCleared ? 'おそらの エース！' : 'ふうせんを なおそう！'}</h2>
          <p className="balloon-result__score">{result.score} てん</p>
          <p>{result.passedCount}ゲート ・ さいだい {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="ふわふわ バルーン">
      <div className="balloon-page">
        <div className="balloon-hud">
          <span>🎈 {game.passedCount} / {BALLOON_CLEAR_TARGET}</span>
          <span>💗 {game.hearts}</span>
          <span>⭐ {game.score}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <div className="balloon-sky" role="grid" aria-label="くもの そら">
          <span className="balloon-sun" aria-hidden="true">☀️</span>
          {Array.from({ length: 18 }, (_, index) => {
            const row = Math.floor(index / 6)
            const column = index % 6
            const cloud = column === game.gateColumn && row !== game.gapRow
            const gapStar = column === game.gateColumn && row === game.gapRow
            const balloon = column === 1 && row === game.playerRow
            return (
              <div key={index} className="balloon-sky__cell">
                {cloud && <span className="balloon-cloud" aria-hidden="true">☁️</span>}
                {gapStar && <span className="balloon-gap" aria-hidden="true">✦</span>}
                {balloon && <span className="balloon-player" aria-label="ふうせん" data-row={row}>🎈</span>}
              </div>
            )
          })}
          <div className="balloon-horizon" aria-hidden="true">🏔️　🏝️　🏔️</div>
        </div>

        <div className="balloon-controls">
          <button type="button" aria-label="うえへ とぶ" onClick={() => move('up')}><span aria-hidden="true">↑</span><small>うえ</small></button>
          <button type="button" aria-label="したへ とぶ" onClick={() => move('down')}><span aria-hidden="true">↓</span><small>した</small></button>
        </div>

        <p className="balloon-feedback" role="status" aria-live="polite">{feedback}</p>
        <button type="button" className="balloon-quit" onClick={() => setGame(null)}>そらから おりる</button>
      </div>
    </PageLayout>
  )
}
