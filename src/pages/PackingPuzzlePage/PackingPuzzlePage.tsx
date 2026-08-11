import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyPackingAction,
  calculatePackingStars,
  packingPieceCells,
  packingPieceIndexes,
  PACKING_STAGES,
  startPackingStage,
  type PackingAction,
  type PackingEvent,
  type PackingPiece,
  type PackingState,
} from '../../features/packing-puzzle/model/packingPuzzle'
import { PageLayout } from '../../shared/components/PageLayout'

export type PackingPuzzlePageProps = {
  storage?: Storage
  initialStageIndex?: number
  initialState?: PackingState
}

function PieceShape({ piece, rotation }: { piece: PackingPiece; rotation: number }) {
  const cells = packingPieceCells(piece, rotation)
  const width = Math.max(...cells.map(({ x }) => x)) + 1
  const height = Math.max(...cells.map(({ y }) => y)) + 1
  const occupied = new Set(cells.map(({ x, y }) => `${x}:${y}`))
  return (
    <span
      className="packing-piece-shape"
      style={{ gridTemplateColumns: `repeat(${width}, 1fr)`, aspectRatio: `${width} / ${height}` }}
      aria-hidden="true"
    >
      {Array.from({ length: width * height }, (_, index) => {
        const x = index % width
        const y = Math.floor(index / width)
        return <i key={index} style={{ background: occupied.has(`${x}:${y}`) ? piece.color : 'transparent' }}>{occupied.has(`${x}:${y}`) ? piece.symbol : ''}</i>
      })}
    </span>
  )
}

const messageFor = (events: readonly PackingEvent[]) => {
  if (events.some((event) => event.type === 'cannot-place')) return 'そこには はいらないよ。べつの ばしょを ためそう！'
  if (events.some((event) => event.type === 'piece-rotated')) return 'くるっと まわしたよ！'
  if (events.some((event) => event.type === 'piece-removed')) return 'にもつを もどしたよ'
  if (events.some((event) => event.type === 'piece-placed')) return 'にもつが はいった！'
  return null
}

export function PackingPuzzlePage({
  storage,
  initialStageIndex,
  initialState,
}: PackingPuzzlePageProps = {}) {
  const [stageIndex, setStageIndex] = useState<number | null>(initialState ? (initialStageIndex ?? 0) : null)
  const [game, setGame] = useState<PackingState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('にもつを えらんで、いろの ついた ばしょへ！')
  const clearRecorded = useRef(false)
  const stage = stageIndex === null ? null : PACKING_STAGES[stageIndex]
  const finalStageCleared = Boolean(stage && game?.status === 'cleared' && stageIndex === PACKING_STAGES.length - 1)

  useEffect(() => {
    if (!finalStageCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('packing-puzzle', storage)
  }, [finalStageCleared, storage])

  const occupiedByIndex = useMemo(() => {
    const result = new Map<number, PackingPiece>()
    if (!stage || !game) return result
    for (const placement of game.placements) {
      const piece = stage.pieces.find((candidate) => candidate.id === placement.pieceId)
      if (!piece) continue
      for (const index of packingPieceIndexes(stage, placement) ?? []) result.set(index, piece)
    }
    return result
  }, [stage, game])

  const begin = () => {
    clearRecorded.current = false
    setStageIndex(0)
    setGame(startPackingStage(PACKING_STAGES[0]))
    setFeedback('にもつを えらんで、いろの ついた ばしょへ！')
  }

  const act = (action: PackingAction) => {
    if (!stage || !game) return
    const transition = applyPackingAction(stage, game, action)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  const resetStage = () => {
    if (!stage) return
    setGame(startPackingStage(stage))
    setFeedback('もういちど つめてみよう！')
  }

  const nextStage = () => {
    if (stageIndex === null) return
    const nextIndex = stageIndex + 1
    const next = PACKING_STAGES[nextIndex]
    if (!next) return
    setStageIndex(nextIndex)
    setGame(startPackingStage(next))
    setFeedback('にもつを えらんで、いろの ついた ばしょへ！')
  }

  if (!stage || !game) {
    return (
      <PageLayout title="ぴったり！にづみ">
        <div className="packing-intro">
          <div className="packing-intro__scene" aria-hidden="true">🚚 📦 🧩</div>
          <p>にもつを まわして、トラックに ぴったり つめよう！</p>
          <p>えらぶ → まわす → おく。なんどでも やりなおせるよ！</p>
          <button type="button" className="primary-button" onClick={begin}>トラックを だす</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const targetIndexes = new Set(stage.targetIndexes)
  const stars = game.status === 'cleared' ? calculatePackingStars(stage, game) : 0

  return (
    <PageLayout title="ぴったり！にづみ">
      <div className="packing-page">
        <div className="packing-hud">
          <span>🚚 {stageIndex + 1} / {PACKING_STAGES.length}</span>
          <strong>{stage.name}</strong>
          <span aria-label={`${game.moveCount}かい うごかした`}>👋 {game.moveCount}</span>
        </div>

        <div
          className="packing-board"
          role="grid"
          aria-label="トラックの にだい"
          style={{ gridTemplateColumns: `repeat(${stage.width}, 1fr)`, aspectRatio: `${stage.width} / ${stage.height}` }}
        >
          {Array.from({ length: stage.width * stage.height }, (_, index) => {
            const placedPiece = occupiedByIndex.get(index)
            const isTarget = targetIndexes.has(index)
            if (!isTarget) return <span key={index} role="gridcell" className="packing-cell packing-cell--blocked" aria-label="おけない ばしょ">×</span>
            return (
              <button
                key={index}
                type="button"
                className={`packing-cell packing-cell--target${placedPiece ? ' packing-cell--filled' : ''}`}
                style={placedPiece ? { background: placedPiece.color } : undefined}
                aria-label={placedPiece ? `${placedPiece.label}を もどす` : `にもつを ばしょ ${index + 1}に おく`}
                disabled={game.status === 'cleared'}
                onClick={() => placedPiece
                  ? act({ type: 'remove-piece', pieceId: placedPiece.id })
                  : act({ type: 'place-selected', anchorIndex: index })}
              >
                {placedPiece ? <b aria-hidden="true">{placedPiece.symbol}</b> : <span aria-hidden="true">＋</span>}
              </button>
            )
          })}
        </div>

        {game.status === 'playing' ? (
          <>
            <section className="packing-tray" aria-label="にもつ おきば">
              {stage.pieces.map((piece) => {
                const placed = game.placements.some((placement) => placement.pieceId === piece.id)
                const selected = game.selectedPieceId === piece.id
                return (
                  <button
                    key={piece.id}
                    type="button"
                    className={`packing-piece-card${selected ? ' packing-piece-card--selected' : ''}`}
                    aria-label={`${piece.label}を えらぶ`}
                    aria-pressed={selected}
                    disabled={placed}
                    onClick={() => act({ type: 'select-piece', pieceId: piece.id })}
                  >
                    <PieceShape piece={piece} rotation={game.rotations[piece.id] ?? 0} />
                    <small>{placed ? 'つんだよ ✓' : piece.label}</small>
                  </button>
                )
              })}
            </section>
            <button type="button" className="packing-rotate" aria-label="えらんだ にもつを まわす" disabled={!game.selectedPieceId} onClick={() => act({ type: 'rotate-selected' })}>↻ えらんだ にもつを まわす</button>
            <p className="packing-feedback" role="status" aria-live="polite">{feedback}</p>
            <div className="packing-actions">
              <button type="button" onClick={resetStage}>やりなおす</button>
              <button type="button" onClick={() => { setStageIndex(null); setGame(null) }}>おわる</button>
            </div>
          </>
        ) : (
          <section className="packing-clear" aria-live="polite">
            <div aria-hidden="true">🚚💨✨</div>
            <h2>{finalStageCleared ? 'にづみ マスター！' : 'ぴったり はいった！'}</h2>
            <p className="packing-clear__stars">{'⭐'.repeat(stars)}</p>
            {finalStageCleared ? (
              <button type="button" className="primary-button" onClick={begin}>もういちど</button>
            ) : (
              <button type="button" className="primary-button" onClick={nextStage}>つぎの トラック</button>
            )}
            <Link to="/play">あそびへ戻る</Link>
          </section>
        )}
      </div>
    </PageLayout>
  )
}
