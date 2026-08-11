import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applySheepMoveAction,
  calculateSheepMoveResult,
  SHEEP_STAGES,
  startSheepMove,
  type SheepDirection,
  type SheepMoveEvent,
  type SheepMoveState,
} from '../../features/sheep-move/model/sheepMove'
import { PageLayout } from '../../shared/components/PageLayout'

export type SheepMovePageProps = {
  storage?: Storage
  initialState?: SheepMoveState
}

const samePosition = (left: { row: number; column: number }, right: { row: number; column: number }) =>
  left.row === right.row && left.column === right.column

const feedbackFor = (events: readonly SheepMoveEvent[]) => {
  if (events.some((event) => event.type === 'stage-won')) return 'みんな おうちに ついた！'
  if (events.some((event) => event.type === 'sheep-pushed')) return 'よいしょ！ ひつじを おした'
  if (events.some((event) => event.type === 'blocked')) return 'そこからは おせないよ！'
  if (events.some((event) => event.type === 'player-moved')) return 'てくてく…'
  return null
}

export function SheepMovePage({ storage, initialState }: SheepMovePageProps = {}) {
  const [game, setGame] = useState<SheepMoveState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ひつじを おして おうちへ つれていこう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateSheepMoveResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('sheep-move', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('ひつじを おして おうちへ つれていこう！')
    setGame(startSheepMove())
  }

  const act = (action: Parameters<typeof applySheepMoveAction>[1]) => {
    if (!game) return
    const transition = applySheepMoveAction(game, action)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    else if (action.type === 'undo') setFeedback('ひとつ まえに もどったよ')
    else if (action.type === 'reset-stage') setFeedback('さいしょから かんがえよう！')
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="ひつじの おひっこし">
        <div className="sheep-intro">
          <div className="sheep-intro__scene" aria-hidden="true">🧑‍🌾 🐑 ➜ 🏡</div>
          <p>ひつじを うしろから おして、みんなを おうちへ つれていこう！</p>
          <p>ひつじは ひっぱれないから、さきの みちを かんがえてね</p>
          <button type="button" className="primary-button" onClick={begin}>ぼくじょうへ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ひつじの おひっこし">
        <div className="sheep-result">
          <div className="sheep-result__scene" aria-hidden="true">🎉🐑🏆🐑🎉</div>
          <h2>ひつじマスター！</h2>
          <p className="sheep-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = SHEEP_STAGES[game.stageIndex]
  const stageWon = game.status === 'stage-won'
  const homeCount = stage.goals.filter((goal) => game.sheep.some((sheep) => samePosition(sheep, goal))).length

  const move = (direction: SheepDirection) => act({ type: 'move', direction })

  return (
    <PageLayout title="ひつじの おひっこし">
      <div className="sheep-page">
        <div className="sheep-hud">
          <span>🐑 {game.stageIndex + 1} / {SHEEP_STAGES.length}</span>
          <span>🏡 {homeCount} / {stage.goals.length}</span>
          <span>👣 {game.moveCount}</span>
          <span>⭐ {game.totalStars}</span>
        </div>

        <div className="sheep-stage-name">{stage.name}</div>

        <div className="sheep-board" role="grid" aria-label="ひつじの ぼくじょう" style={{ gridTemplateColumns: `repeat(${stage.size}, 1fr)` }}>
          {Array.from({ length: stage.size * stage.size }, (_, index) => {
            const position = { row: Math.floor(index / stage.size), column: index % stage.size }
            const wall = stage.walls.some((candidate) => samePosition(candidate, position))
            const goal = stage.goals.some((candidate) => samePosition(candidate, position))
            const sheep = game.sheep.some((candidate) => samePosition(candidate, position))
            const player = samePosition(game.player, position)
            return (
              <div key={index} className={`sheep-cell${wall ? ' sheep-cell--wall' : ''}${goal ? ' sheep-cell--goal' : ''}${sheep && goal ? ' sheep-cell--home' : ''}`}>
                {goal && !sheep && <span className="sheep-goal" aria-hidden="true">⌂</span>}
                {wall && <span aria-hidden="true">🪨</span>}
                {sheep && <span className="sheep-animal" aria-label="ひつじ">🐑</span>}
                {player && <span className="sheep-player" aria-label="ひつじかい">🧑‍🌾</span>}
              </div>
            )
          })}
        </div>

        <p className="sheep-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && (
          <>
            <div className="sheep-dpad">
              <button type="button" aria-label="うえへ すすむ" onClick={() => move('up')}>↑</button>
              <button type="button" aria-label="ひだりへ すすむ" onClick={() => move('left')}>←</button>
              <span aria-hidden="true">🐾</span>
              <button type="button" aria-label="みぎへ すすむ" onClick={() => move('right')}>→</button>
              <button type="button" aria-label="したへ すすむ" onClick={() => move('down')}>↓</button>
            </div>
            <div className="sheep-controls">
              <button type="button" disabled={game.history.length === 0} onClick={() => act({ type: 'undo' })}>↩ ひとつ もどす</button>
              <button type="button" onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button>
            </div>
          </>
        )}

        {stageWon && (
          <section className="sheep-stage-clear" aria-live="polite">
            <h2>みんな おうちに ついた！</h2>
            <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの ぼくじょう</button>
          </section>
        )}

        <button type="button" className="sheep-quit" onClick={() => setGame(null)}>ぼくじょうを でる</button>
      </div>
    </PageLayout>
  )
}
