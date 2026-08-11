import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyTreasureAction,
  calculateTreasureResult,
  startTreasureHunt,
  TREASURE_CLEAR_TARGET,
  TREASURE_ROUNDS,
  type TreasureDirection,
  type TreasureHuntEvent,
  type TreasureHuntState,
  type TreasureWarmth,
} from '../../features/treasure-hunt/model/treasureHunt'
import { PageLayout } from '../../shared/components/PageLayout'

export type TreasureHuntPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: TreasureHuntState
}

const DIRECTION_SYMBOL: Readonly<Record<TreasureDirection, string>> = {
  up: '↑',
  'up-right': '↗',
  right: '→',
  'down-right': '↘',
  down: '↓',
  'down-left': '↙',
  left: '←',
  'up-left': '↖',
}

const WARMTH_SYMBOL: Readonly<Record<TreasureWarmth, string>> = {
  hot: '🔥',
  warm: '☀️',
  cold: '❄️',
}

const WARMTH_MESSAGE: Readonly<Record<TreasureWarmth, string>> = {
  hot: 'すぐ ちかく！',
  warm: 'ちかいよ！',
  cold: 'まだ とおい',
}

const messageFor = (events: readonly TreasureHuntEvent[]) => {
  const clue = events.find((event) => event.type === 'clue-found')
  if (clue?.type === 'clue-found') {
    return `${DIRECTION_SYMBOL[clue.direction]} ${WARMTH_SYMBOL[clue.warmth]} ${WARMTH_MESSAGE[clue.warmth]}`
  }
  if (events.some((event) => event.type === 'treasure-found')) return 'たからを はっけん！'
  return null
}

export function TreasureHuntPage({
  storage,
  random = Math.random,
  initialState,
}: TreasureHuntPageProps = {}) {
  const [game, setGame] = useState<TreasureHuntState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('きになる ばしょを タップ！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateTreasureResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('treasure-hunt', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setGame(startTreasureHunt(random))
    setFeedback('きになる ばしょを タップ！')
  }

  const dig = (index: number) => {
    if (!game) return
    const transition = applyTreasureAction(game, { type: 'dig', index }, random)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  const advance = () => {
    if (!game) return
    setGame(applyTreasureAction(game, { type: 'next-round' }, random).state)
    setFeedback('きになる ばしょを タップ！')
  }

  if (!game) {
    return (
      <PageLayout title="どこかな？たからじま">
        <div className="treasure-intro">
          <div className="treasure-intro__scene" aria-hidden="true">🏝️ 🧭 🏴‍☠️</div>
          <p>しまを ほると、たからの ほうこうが わかるよ！</p>
          <p>3つの しまで {TREASURE_CLEAR_TARGET}こ みつけたら クリア！</p>
          <button type="button" className="primary-button" onClick={begin}>たからを さがす</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="どこかな？たからじま">
        <div className="treasure-result">
          <div className="treasure-result__scene" aria-hidden="true">{result.isCleared ? '🎉🏆💎🎉' : '🗺️🧭✨'}</div>
          <h2>{result.isCleared ? 'トレジャーハンター！' : 'つぎは みつけよう！'}</h2>
          <p className="treasure-result__score">{result.score} てん</p>
          <p>たからを {result.foundCount}こ はっけん</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const round = TREASURE_ROUNDS[game.roundIndex]
  const clueByIndex = new Map(game.dugCells.map((clue) => [clue.index, clue]))
  const roundFinished = game.status === 'round-won' || game.status === 'round-lost'
  const lastRound = game.roundIndex === TREASURE_ROUNDS.length - 1

  return (
    <PageLayout title="どこかな？たからじま">
      <div className="treasure-page">
        <div className="treasure-hud">
          <span>🗺️ {game.roundIndex + 1} / {TREASURE_ROUNDS.length}</span>
          <strong>{round.name}</strong>
          <span aria-label={`あと ${game.digsLeft}かい ほれる`}>⛏️ {game.digsLeft}</span>
          <span aria-label={`たから ${game.foundCount}こ`}>💎 {game.foundCount}</span>
        </div>

        <div
          className={`treasure-board treasure-board--${round.size}`}
          role="grid"
          aria-label="たからじまの ちず"
          style={{ gridTemplateColumns: `repeat(${round.size}, 1fr)` }}
        >
          {Array.from({ length: round.size * round.size }, (_, index) => {
            const clue = clueByIndex.get(index)
            const treasureShown = roundFinished && index === game.treasureIndex
            return (
              <button
                key={index}
                type="button"
                aria-label={`ばしょ ${index + 1}を ほる`}
                className={`treasure-cell${clue ? ` treasure-cell--${clue.warmth}` : ''}${treasureShown ? ' treasure-cell--treasure' : ''}`}
                disabled={Boolean(clue) || roundFinished}
                onClick={() => dig(index)}
              >
                {treasureShown ? (
                  <span className="treasure-cell__treasure" aria-hidden="true">🎁</span>
                ) : clue ? (
                  <span className="treasure-cell__clue" aria-hidden="true">
                    <b>{DIRECTION_SYMBOL[clue.direction]}</b>
                    <small>{WARMTH_SYMBOL[clue.warmth]}</small>
                  </span>
                ) : (
                  <span className="treasure-cell__ground" aria-hidden="true">{index % 7 === 0 ? '🌿' : index % 5 === 0 ? '🪨' : '·'}</span>
                )}
              </button>
            )
          })}
        </div>

        {!roundFinished ? (
          <p className="treasure-feedback" role="status" aria-live="polite">{feedback}</p>
        ) : (
          <section className="treasure-round-result" aria-live="polite">
            <h2>{game.status === 'round-won' ? 'たからを はっけん！' : 'たからは ここだった！'}</h2>
            <p aria-hidden="true">{game.status === 'round-won' ? '🎉🎁✨' : '🧭🎁'}</p>
            <button type="button" className="primary-button" onClick={advance}>{lastRound ? 'けっかを みる' : 'つぎの しま'}</button>
          </section>
        )}
        <button type="button" className="treasure-quit" onClick={() => setGame(null)}>たんけんを おわる</button>
      </div>
    </PageLayout>
  )
}
