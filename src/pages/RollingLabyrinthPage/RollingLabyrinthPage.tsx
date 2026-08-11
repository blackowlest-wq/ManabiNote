import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyLabyrinthAction,
  calculateRollingLabyrinthResult,
  LABYRINTH_STAGES,
  startRollingLabyrinth,
  type RollingLabyrinthEvent,
  type RollingLabyrinthState,
} from '../../features/rolling-labyrinth/model/rollingLabyrinth'
import { PageLayout } from '../../shared/components/PageLayout'

export type RollingLabyrinthPageProps = {
  storage?: Storage
  initialState?: RollingLabyrinthState
}

const feedbackFor = (events: readonly RollingLabyrinthEvent[]) => {
  if (events.some((event) => event.type === 'stage-won')) return 'ゴールに とうちゃく！'
  if (events.some((event) => event.type === 'star-collected')) return 'キラリン！ ほしを ゲット！'
  if (events.some((event) => event.type === 'ball-rolled')) return 'ころころころ！'
  return null
}

export function RollingLabyrinthPage({ storage, initialState }: RollingLabyrinthPageProps = {}) {
  const [game, setGame] = useState<RollingLabyrinthState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ラビリンスを まわして ころがそう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateRollingLabyrinthResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('rolling-labyrinth', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('ラビリンスを まわして ころがそう！')
    setGame(startRollingLabyrinth())
  }

  const act = (action: Parameters<typeof applyLabyrinthAction>[1]) => {
    if (!game) return
    const transition = applyLabyrinthAction(game, action)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="くるくる ラビリンス">
        <div className="labyrinth-intro">
          <div className="labyrinth-intro__scene" aria-hidden="true">↶ 🟡 ⭐ 🏁 ↷</div>
          <p>ラビリンスを まわすと、たまが したへ ころがるよ！</p>
          <p>ほしを あつめて ゴールへ いこう</p>
          <button type="button" className="primary-button" onClick={begin}>ラビリンスへ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="くるくる ラビリンス">
        <div className="labyrinth-result">
          <div className="labyrinth-result__scene" aria-hidden="true">🎉⭐🏆🟡🎉</div>
          <h2>くるくる マスター！</h2>
          <p className="labyrinth-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = LABYRINTH_STAGES[game.stageIndex]
  const stageWon = game.status === 'stage-won'

  return (
    <PageLayout title="くるくる ラビリンス">
      <div className="labyrinth-page">
        <div className="labyrinth-hud">
          <span>🌀 {game.stageIndex + 1} / {LABYRINTH_STAGES.length}</span>
          <span>⭐ {game.collectedStarIds.length} / {stage.stars.length}</span>
          <span>↻ {game.rotations}</span>
          <span>🏆 {game.score}</span>
        </div>

        <div className="labyrinth-stage-name">{stage.name}</div>

        <div className="labyrinth-frame">
          <div className="labyrinth-board" aria-label="まわる ラビリンス" style={{ gridTemplateColumns: `repeat(${stage.size}, 1fr)`, transform: `rotate(${game.orientation * 90}deg)` }}>
            {Array.from({ length: stage.size * stage.size }, (_, index) => {
              const row = Math.floor(index / stage.size)
              const column = index % stage.size
              const isWall = stage.walls.some((wall) => wall.row === row && wall.column === column)
              const star = stage.stars.find((candidate) => candidate.row === row && candidate.column === column)
              const hasStar = star && !game.collectedStarIds.includes(star.id)
              const isGoal = stage.goal.row === row && stage.goal.column === column
              const hasBall = game.ball.row === row && game.ball.column === column
              return (
                <div key={index} className={`labyrinth-cell${isWall ? ' labyrinth-cell--wall' : ''}${isGoal ? ' labyrinth-cell--goal' : ''}`}>
                  {isWall && <span aria-hidden="true">🪨</span>}
                  {isGoal && <span aria-hidden="true">🏁</span>}
                  {hasStar && <span className="labyrinth-star" aria-hidden="true">⭐</span>}
                  {hasBall && <span className="labyrinth-ball" aria-label="ころがる たま" data-position={`${row}-${column}`}>●</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="labyrinth-controls">
          <button type="button" aria-label="ひだりへ まわす" disabled={stageWon} onClick={() => act({ type: 'rotate-counterclockwise' })}><span aria-hidden="true">↶</span><small>ひだり</small></button>
          <button type="button" aria-label="みぎへ まわす" disabled={stageWon} onClick={() => act({ type: 'rotate-clockwise' })}><span aria-hidden="true">↷</span><small>みぎ</small></button>
        </div>

        <p className="labyrinth-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && <button type="button" className="labyrinth-reset" onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button>}

        {stageWon && (
          <section className="labyrinth-stage-clear" aria-live="polite">
            <h2>ゴールに とうちゃく！</h2>
            <span aria-hidden="true">✨🟡🏁✨</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの ラビリンス</button>
          </section>
        )}

        <button type="button" className="labyrinth-quit" onClick={() => setGame(null)}>ラビリンスを でる</button>
      </div>
    </PageLayout>
  )
}
