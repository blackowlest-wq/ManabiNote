import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyBalanceBoatAction,
  BALANCE_LEVELS,
  calculateBalanceBoatResult,
  startBalanceBoat,
  type BalanceBoatEvent,
  type BalanceBoatState,
  type BalanceSide,
} from '../../features/balance-boat/model/balanceBoat'
import { PageLayout } from '../../shared/components/PageLayout'

export type BalanceBoatPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: BalanceBoatState
}

const feedbackFor = (events: readonly BalanceBoatEvent[]) => {
  const placed = events.find((event) => event.type === 'parcel-placed')
  if (events.some((event) => event.type === 'boat-balanced')) return 'ぴたっ！ まっすぐに なった！'
  if (events.some((event) => event.type === 'boat-tipped')) return 'ざぶーん！ にもつが おちた！'
  if (placed?.type === 'parcel-placed') return `${placed.side === 'left' ? 'ひだり' : 'みぎ'}へ のせた！`
  return null
}

export function BalanceBoatPage({
  storage,
  random = Math.random,
  initialState,
}: BalanceBoatPageProps = {}) {
  const [game, setGame] = useState<BalanceBoatState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('かるい ほうへ にもつを のせよう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateBalanceBoatResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('balance-boat', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('かるい ほうへ にもつを のせよう！')
    setGame(startBalanceBoat(random))
  }

  const place = (side: BalanceSide) => {
    if (!game) return
    const transition = applyBalanceBoatAction(game, { type: 'place', side }, random)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  const nextLevel = () => {
    if (!game) return
    setFeedback('つぎの みなとは なみが つよいよ！')
    setGame(applyBalanceBoatAction(game, { type: 'next-level' }, random).state)
  }

  if (!game) {
    return (
      <PageLayout title="ぐらぐら おとどけ便">
        <div className="balance-intro">
          <div className="balance-intro__scene" aria-hidden="true">📦 ⛵ 🌊 🏝️</div>
          <p>にもつを ひだり・みぎに のせて、ふねを まっすぐに しよう！</p>
          <div className="balance-intro__demo" aria-hidden="true"><span>📦</span><b>⚖️</b><span>📦</span></div>
          <button type="button" className="primary-button" onClick={begin}>しゅっこうする</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ぐらぐら おとどけ便">
        <div className="balance-result">
          <div className="balance-result__scene" aria-hidden="true">{result.isCleared ? '🎉🏝️🏆⛵🎉' : '🌊📦🌊'}</div>
          <h2>{result.isCleared ? 'おとどけ だいせいこう！' : 'もういちど しゅっこう！'}</h2>
          <p className="balance-result__score">{result.score} てん</p>
          <p>{result.totalDelivered}こ おとどけ ・ さいだい {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const level = BALANCE_LEVELS[game.levelIndex]
  const difference = game.rightWeight - game.leftWeight
  const angle = Math.max(-12, Math.min(12, difference * 4))
  const meterPosition = 50 + Math.max(-40, Math.min(40, difference * 14))

  return (
    <PageLayout title="ぐらぐら おとどけ便">
      <div className="balance-page">
        <div className="balance-hud">
          <span>⚓ {game.levelIndex + 1} / {BALANCE_LEVELS.length}</span>
          <span>💗 {game.hearts}</span>
          <span>📦 {game.deliveredInLevel} / {level.target}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <div className="balance-level-name">{level.name} ・ {level.water}</div>

        <section className="balance-next" aria-label="つぎの にもつ">
          <small>つぎの にもつ</small>
          <span aria-hidden="true">{Array.from({ length: game.currentWeight }, () => '📦').join('')}</span>
          <strong>{game.currentWeight}</strong>
        </section>

        <div className="balance-meter" aria-label={`ひだり ${game.leftWeight}、みぎ ${game.rightWeight}`}>
          <span>◀</span><div><i style={{ left: `${meterPosition}%` }} /></div><span>▶</span>
        </div>

        <div className="balance-scene">
          <span className="balance-sun" aria-hidden="true">☀️</span>
          <div className="balance-boat" style={{ transform: `rotate(${angle}deg)` }}>
            <button type="button" aria-label="ひだりへ のせる" disabled={game.status !== 'playing'} onClick={() => place('left')}>
              <span aria-label="ひだりの おもさ">{game.leftWeight}</span>
              <b aria-hidden="true">{Array.from({ length: game.leftWeight }, () => '▪').join('')}</b>
              <small>ひだり</small>
            </button>
            <div className="balance-mast" aria-hidden="true">⛵</div>
            <button type="button" aria-label="みぎへ のせる" disabled={game.status !== 'playing'} onClick={() => place('right')}>
              <span aria-label="みぎの おもさ">{game.rightWeight}</span>
              <b aria-hidden="true">{Array.from({ length: game.rightWeight }, () => '▪').join('')}</b>
              <small>みぎ</small>
            </button>
          </div>
          <div className="balance-waves" aria-hidden="true">〰️〰️〰️〰️〰️</div>
        </div>

        <p className="balance-feedback" role="status" aria-live="polite">{feedback}</p>

        {game.status === 'level-won' && (
          <section className="balance-level-clear" aria-live="polite">
            <h2>みなとに ついた！</h2>
            <span aria-hidden="true">✨🏝️✨</span>
            <button type="button" className="primary-button" onClick={nextLevel}>つぎの みなと</button>
          </section>
        )}

        <button type="button" className="balance-quit" onClick={() => setGame(null)}>ふねを おりる</button>
      </div>
    </PageLayout>
  )
}
