import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyOppositeGhostAction,
  calculateOppositeGhostResult,
  OPPOSITE_LEVELS,
  OPPOSITE_LEVEL_TARGET,
  startOppositeGhost,
  type OppositeDirection,
  type OppositeGhostEvent,
  type OppositeGhostState,
} from '../../features/opposite-ghost/model/oppositeGhost'
import { PageLayout } from '../../shared/components/PageLayout'

export type OppositeGhostPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: OppositeGhostState
  tickMilliseconds?: number
}

const feedbackFor = (events: readonly OppositeGhostEvent[]) => {
  if (events.some((event) => event.type === 'gate-passed')) return 'シュッ！ ゲートを ぬけた！'
  if (events.some((event) => event.type === 'bumped')) return 'ゴツン！ おばけが わらった'
  if (events.some((event) => event.type === 'timed-out')) return 'ゲートが しまった！'
  return null
}

export function OppositeGhostPage({
  storage,
  random = Math.random,
  initialState,
  tickMilliseconds = 1000,
}: OppositeGhostPageProps = {}) {
  const [game, setGame] = useState<OppositeGhostState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('キャラクターを みて ダッシュ！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateOppositeGhostResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current) return current
        const transition = applyOppositeGhostAction(current, { type: 'tick' }, random)
        const message = feedbackFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, tickMilliseconds)
    return () => window.clearInterval(timer)
  }, [game?.status, random, tickMilliseconds])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('opposite-ghost', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('うさぎは やじるしと おなじ！')
    setGame(startOppositeGhost(random))
  }

  const move = (direction: OppositeDirection) => {
    if (!game) return
    const transition = applyOppositeGhostAction(game, { type: 'move', direction }, random)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  const nextLevel = () => {
    if (!game) return
    setFeedback(game.levelIndex === 0 ? 'おばけは やじるしと はんたい！' : 'うさぎと おばけを みわけよう！')
    setGame(applyOppositeGhostAction(game, { type: 'next-level' }, random).state)
  }

  if (!game) {
    return (
      <PageLayout title="アベコベおばけ">
        <div className="opposite-intro">
          <div className="opposite-intro__scene" aria-hidden="true">🌲 🐰 👻 🌲</div>
          <div className="opposite-rules" aria-label="うごきかた">
            <span>🐰 ＋ ← ＝ ←</span>
            <span>👻 ＋ ← ＝ →</span>
          </div>
          <p>うさぎは おなじ、おばけは はんたいへ ダッシュ！</p>
          <button type="button" className="primary-button" onClick={begin}>よるの もりへ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="アベコベおばけ">
        <div className="opposite-result">
          <div className="opposite-result__scene" aria-hidden="true">{result.isCleared ? '🎉👻🏆🐰🎉' : '🌙👻🌲'}</div>
          <h2>{result.isCleared ? 'アベコベ マスター！' : 'おばけに つかまった！'}</h2>
          <p className="opposite-result__score">{result.score} てん</p>
          <p>{result.totalCleared}ゲート ・ さいだい {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const actorEmoji = game.currentCard.actor === 'rabbit' ? '🐰' : '👻'
  const arrow = game.currentCard.arrow === 'left' ? '←' : '→'

  return (
    <PageLayout title="アベコベおばけ">
      <div className="opposite-page">
        <div className="opposite-hud">
          <span>🌲 {game.levelIndex + 1} / {OPPOSITE_LEVELS.length}</span>
          <span>💗 {game.hearts}</span>
          <span aria-label="ぬけた ゲートの かず">🚪 {game.clearedInLevel} / {OPPOSITE_LEVEL_TARGET}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <div className="opposite-level-name">{OPPOSITE_LEVELS[game.levelIndex].name}</div>

        <div className="opposite-timer" aria-label={`のこり ${game.timeLeft}`}>
          {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < game.timeLeft ? 'opposite-timer__on' : ''} />)}
        </div>

        <section className={`opposite-gate opposite-gate--${game.currentCard.actor}`} aria-label="いまの ゲート">
          <div className="opposite-gate__moon" aria-hidden="true">🌙</div>
          <div className="opposite-gate__actor" aria-hidden="true">{actorEmoji}</div>
          <div className="opposite-gate__arrow" aria-hidden="true">{arrow}</div>
        </section>

        <div className="opposite-move-buttons">
          <button type="button" aria-label="ひだりへ ダッシュ" disabled={game.status !== 'playing'} onClick={() => move('left')}>
            <span aria-hidden="true">←</span><small>ひだり</small>
          </button>
          <button type="button" aria-label="みぎへ ダッシュ" disabled={game.status !== 'playing'} onClick={() => move('right')}>
            <span aria-hidden="true">→</span><small>みぎ</small>
          </button>
        </div>

        <p className="opposite-feedback" role="status" aria-live="polite">{feedback}</p>

        {game.status === 'level-won' && (
          <section className="opposite-level-clear" aria-live="polite">
            <h2>もりを ぬけた！</h2>
            <span aria-hidden="true">✨🚪✨</span>
            <button type="button" className="primary-button" onClick={nextLevel}>つぎの もり</button>
          </section>
        )}

        <button type="button" className="opposite-quit" onClick={() => setGame(null)}>もりを でる</button>
      </div>
    </PageLayout>
  )
}
