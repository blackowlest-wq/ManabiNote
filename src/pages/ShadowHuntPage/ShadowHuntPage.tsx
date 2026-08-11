import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyShadowHuntAction,
  calculateShadowHuntResult,
  SHADOW_HUNT_CLEAR_TARGET,
  SHADOW_MONSTERS,
  startShadowHunt,
  type ShadowHuntEvent,
  type ShadowHuntState,
} from '../../features/shadow-hunt/model/shadowHunt'
import { PageLayout } from '../../shared/components/PageLayout'

export type ShadowHuntPageProps = {
  storage?: Storage
  random?: () => number
  durationSeconds?: number
  initialState?: ShadowHuntState
}

const monsterById = new Map(SHADOW_MONSTERS.map((monster) => [monster.id, monster]))

const messageFor = (events: readonly ShadowHuntEvent[]) => {
  const captured = events.find((event) => event.type === 'monster-captured')
  if (captured?.type === 'monster-captured') {
    return `${monsterById.get(captured.monsterId)?.name ?? 'モンスター'}を つかまえた！`
  }
  if (events.some((event) => event.type === 'shadow-escaped')) return 'かげが もりへ にげた！'
  if (events.some((event) => event.type === 'flashlight-dim')) return 'ライトが すこし くらくなった'
  return null
}

export function ShadowHuntPage({
  storage,
  random = Math.random,
  durationSeconds = 45,
  initialState,
}: ShadowHuntPageProps = {}) {
  const [game, setGame] = useState<ShadowHuntState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('かげと おなじ すがたを さがそう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateShadowHuntResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => current ? applyShadowHuntAction(current, { type: 'tick' }, random).state : current)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [game?.status, random])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('shadow-hunt', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('かげと おなじ すがたを さがそう！')
    setGame(startShadowHunt({ durationSeconds }, random))
  }

  const capture = (slotIndex: number) => {
    if (!game) return
    const transition = applyShadowHuntAction(game, { type: 'capture', slotIndex }, random)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="シルエットハンター">
        <div className="shadow-intro">
          <div className="shadow-intro__scene" aria-hidden="true">🔦 🌲 👾 🌲</div>
          <p>くらい もりに かくれた モンスターを みつけよう！</p>
          <div className="shadow-intro__rule" aria-hidden="true"><span className="shadow-figure">🐰</span><b>＝</b><span>🐰</span></div>
          <p>{SHADOW_HUNT_CLEAR_TARGET}たい つかまえると ハンタークリア！</p>
          <button type="button" className="primary-button" onClick={begin}>もりへ しゅっぱつ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="シルエットハンター">
        <div className="shadow-result">
          <div className="shadow-result__scene" aria-hidden="true">{result.isCleared ? '🎉🔦🏆🎉' : '🌙🌲✨'}</div>
          <h2>{result.isCleared ? 'ハンターランク クリア！' : 'もりの たんけん おわり！'}</h2>
          <p className="shadow-result__score">{result.score} てん</p>
          <p>{result.captureCount}たい つかまえた ・ {result.discoveredCount}しゅるい はっけん</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const target = monsterById.get(game.targetMonsterId)

  return (
    <PageLayout title="シルエットハンター">
      <div className="shadow-page">
        <div className="shadow-hud">
          <span aria-label={`のこり ${game.timeLeft}びょう`}>⏱️ {game.timeLeft}</span>
          <span>⭐ {game.score}</span>
          <span aria-label="つかまえた かず">🪤 {game.captureCount} / {SHADOW_HUNT_CLEAR_TARGET}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <section className="shadow-target" aria-label="さがす モンスターの かげ">
          <small>この かげを さがせ！</small>
          <span className="shadow-target__figure shadow-figure" aria-hidden="true">{target?.emoji}</span>
          <div className="shadow-flashlight" aria-label={`ライト のこり ${game.flashlightEnergy}`}>
            {Array.from({ length: 3 }, (_, index) => <span key={index}>{index < game.flashlightEnergy ? '🔦' : '·'}</span>)}
          </div>
        </section>

        <div className="shadow-forest" aria-label="モンスターの いる もり">
          {game.fieldMonsterIds.map((monsterId, slotIndex) => {
            const monster = monsterById.get(monsterId)
            return (
              <button
                key={`${monsterId}-${slotIndex}`}
                type="button"
                className="shadow-monster"
                aria-label={`${monster?.name ?? 'モンスター'}を つかまえる`}
                onClick={() => capture(slotIndex)}
              >
                <span aria-hidden="true">{monster?.emoji}</span>
              </button>
            )
          })}
        </div>

        <p className="shadow-feedback" role="status" aria-live="polite">{feedback}</p>

        <section className="shadow-collection" aria-label="みつけた モンスターずかん">
          <strong>ずかん</strong>
          <div>
            {SHADOW_MONSTERS.map((monster) => (
              <span key={monster.id} className={game.capturedMonsterIds.includes(monster.id) ? '' : 'shadow-collection__unknown'} aria-label={game.capturedMonsterIds.includes(monster.id) ? monster.name : 'まだ みつけていない'}>
                {game.capturedMonsterIds.includes(monster.id) ? monster.emoji : '？'}
              </span>
            ))}
          </div>
        </section>

        <button type="button" className="shadow-quit" onClick={() => setGame(null)}>もりを でる</button>
      </div>
    </PageLayout>
  )
}
