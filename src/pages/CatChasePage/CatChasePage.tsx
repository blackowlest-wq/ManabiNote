import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  applyCatChaseAction,
  calculateCatChaseResult,
  CAT_CHASE_STAGES,
  startCatChase,
  type CatChaseState,
} from '../../features/cat-chase/model/catChase'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

function adjacent(index: number, size: number) {
  const row = Math.floor(index / size)
  const column = index % size
  return [[row - 1, column], [row, column + 1], [row + 1, column], [row, column - 1]]
    .filter(([nextRow, nextColumn]) => nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size)
    .map(([nextRow, nextColumn]) => nextRow * size + nextColumn)
}

export function CatChasePage({ storage, initialState }: { storage?: Storage; initialState?: CatChaseState } = {}) {
  const [game, setGame] = useState<CatChaseState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ひかっている マスへ すすもう！')
  const recorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateCatChaseResult(game) : null, [game])

  useEffect(() => {
    if (result?.isCleared && !recorded.current) {
      recorded.current = true
      markGameCleared('cat-chase', storage)
    }
  }, [result, storage])

  const begin = () => {
    recorded.current = false
    setGame(startCatChase())
    setFeedback('ねずみは 1かい おきに にげるよ！')
  }

  const act = (action: Parameters<typeof applyCatChaseAction>[1]) => {
    if (!game) return
    const transition = applyCatChaseAction(game, action)
    if (transition.events.some(event => event.type === 'mouse-caught')) setFeedback('やった！ つかまえた！')
    else if (transition.events.some(event => event.type === 'stage-lost')) setFeedback('ねずみに にげきられた！')
    else if (transition.events.some(event => event.type === 'mouse-moved')) setFeedback('ねずみが にげた！ さきまわりしよう')
    else if (transition.events.some(event => event.type === 'mouse-rested')) setFeedback('ねずみは ひとやすみ。いまだ！')
    else if (action.type === 'retry' || action.type === 'next-stage') setFeedback('ねずみは 1かい おきに にげるよ！')
    setGame(transition.state)
  }

  if (!game) return (
    <PageLayout title="ねこねこ おいかけっこ">
      <div className="cat-chase-center cat-chase-intro">
        <div className="cat-chase-scene" aria-hidden="true">🐱　🌳　🐭💨</div>
        <p>かべと はしっこを つかって、にげる ねずみを おいつめよう！</p>
        <p>ねずみが うごくのは 2ターンに 1かい。</p>
        <button className="primary-button" onClick={begin}>おいかける！</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  if (result) return (
    <PageLayout title="ねこねこ おいかけっこ">
      <div className="cat-chase-center cat-chase-intro">
        <div className="cat-chase-scene" aria-hidden="true">🐱✨🐭🏆</div>
        <h2>おいかけっこ マスター！</h2>
        <p className="cat-chase-score">⭐ {result.stars}こ　{result.score}てん</p>
        <button className="primary-button" onClick={begin}>もういちど</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  const stage = CAT_CHASE_STAGES[game.stageIndex]
  const movable = adjacent(game.catIndex, stage.size).filter(index => !stage.walls.includes(index))
  const boardCells = Array.from({ length: stage.size * stage.size }, (_, index) => index)
  return (
    <PageLayout title="ねこねこ おいかけっこ">
      <div className="cat-chase-center">
        <div className="cat-chase-hud">
          <span>🗺️ {game.stageIndex + 1} / {CAT_CHASE_STAGES.length}</span>
          <span>👣 あと {stage.turnLimit - game.turn}</span>
          <span>⭐ {game.totalStars}</span>
        </div>
        <b>{stage.name}</b>
        <div className="cat-chase-board" role="grid" aria-label="おいかけっこの もり" style={{ '--cat-board-size': stage.size } as React.CSSProperties}>
          {boardCells.map(index => {
            const wall = stage.walls.includes(index)
            const cat = index === game.catIndex
            const mouse = index === game.mouseIndex
            const canMove = game.status === 'playing' && movable.includes(index)
            return (
              <button
                key={index}
                aria-label={`マス ${index + 1}`}
                className={`cat-chase-cell${wall ? ' cat-chase-cell--wall' : ''}${canMove ? ' cat-chase-cell--movable' : ''}`}
                disabled={!canMove}
                onClick={() => act({ type: 'move', index })}
              >
                <span aria-hidden="true">{wall ? '🌳' : cat ? '🐱' : mouse ? '🐭' : ''}</span>
              </button>
            )
          })}
        </div>
        <p className="cat-chase-feedback" aria-live="polite">{feedback}</p>
        {game.status === 'stage-won' && (
          <section className="cat-chase-finish">
            <h2>ねずみを つかまえた！</h2>
            <p>{'⭐'.repeat(game.stageStars)}　{game.turn}ターン</p>
            <button className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの もり</button>
          </section>
        )}
        {game.status === 'failed' && (
          <section className="cat-chase-finish">
            <h2>おしい！ にげられた</h2>
            <p>かべの ほうへ おいつめてみよう</p>
            <button className="primary-button" onClick={() => act({ type: 'retry' })}>もういちど</button>
          </section>
        )}
        <button className="cat-chase-quit" onClick={() => setGame(null)}>もりを でる</button>
      </div>
    </PageLayout>
  )
}
