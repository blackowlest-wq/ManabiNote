import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  calculatePipeStars,
  connectionsFor,
  getWateredIndexes,
  PIPE_PATH_STAGES,
  rotatePipe,
  startPipeStage,
  type PipePathState,
} from '../../features/pipe-path/model/pipePath'
import { PageLayout } from '../../shared/components/PageLayout'

export type PipePathPageProps = {
  storage?: Storage
  initialStageIndex?: number
  initialState?: PipePathState
}

export function PipePathPage({ storage, initialStageIndex, initialState }: PipePathPageProps = {}) {
  const [stageIndex, setStageIndex] = useState<number | null>(initialState ? (initialStageIndex ?? 0) : null)
  const [game, setGame] = useState<PipePathState | null>(initialState ?? null)
  const clearRecorded = useRef(false)
  const stage = stageIndex === null ? null : PIPE_PATH_STAGES[stageIndex]
  const wateredIndexes = useMemo(
    () => stage && game ? getWateredIndexes(stage, game) : new Set<number>(),
    [stage, game],
  )
  const finalStageCleared = Boolean(
    stage && game?.status === 'cleared' && stageIndex === PIPE_PATH_STAGES.length - 1,
  )

  useEffect(() => {
    if (!finalStageCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('pipe-path', storage)
  }, [finalStageCleared, storage])

  const begin = () => {
    clearRecorded.current = false
    setStageIndex(0)
    setGame(startPipeStage(PIPE_PATH_STAGES[0]))
  }

  const resetStage = () => {
    if (!stage) return
    setGame(startPipeStage(stage))
  }

  const nextStage = () => {
    if (stageIndex === null) return
    const nextIndex = stageIndex + 1
    const next = PIPE_PATH_STAGES[nextIndex]
    if (!next) return
    setStageIndex(nextIndex)
    setGame(startPipeStage(next))
  }

  if (!stage || !game) {
    return (
      <PageLayout title="みずの みち">
        <div className="pipe-path-intro">
          <div className="pipe-path-intro__scene" aria-hidden="true">💧 〰️ 🌷</div>
          <p>パイプを タップで くるっと まわそう！</p>
          <p>みずが ぜんぶの おはなに とどけば クリア！</p>
          <button type="button" className="primary-button" onClick={begin}>みずを ながす</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stars = game.status === 'cleared' ? calculatePipeStars(stage, game) : 0

  return (
    <PageLayout title="みずの みち">
      <div className="pipe-path-page">
        <div className="pipe-path-hud">
          <span>🗺️ {stageIndex + 1} / {PIPE_PATH_STAGES.length}</span>
          <strong>{stage.name}</strong>
          <span aria-label={`${game.turnCount}かい まわした`}>🔄 {game.turnCount}</span>
        </div>

        <div
          className="pipe-path-board"
          role="grid"
          aria-label="みずの みち ばんめん"
          style={{ gridTemplateColumns: `repeat(${stage.width}, 1fr)` }}
        >
          {stage.tiles.map((tile, index) => {
            if (!tile) return <span key={index} role="gridcell" className="pipe-path-ground" aria-label="くさむら">·</span>
            const rotation = game.rotations[index] ?? 0
            const connections = connectionsFor(tile, rotation)
            const watered = wateredIndexes.has(index)
            const label = tile.kind === 'source'
              ? 'みずの でぐち'
              : tile.kind === 'goal'
                ? 'おはな'
                : `パイプ ${index + 1}を まわす`
            return (
              <button
                key={index}
                type="button"
                className={`pipe-path-tile pipe-path-tile--${tile.kind}${watered ? ' pipe-path-tile--watered' : ''}`}
                aria-label={label}
                disabled={tile.fixed || game.status === 'cleared'}
                onClick={() => setGame(rotatePipe(stage, game, index).state)}
              >
                <span className="pipe-path-core" aria-hidden="true" />
                {connections.map((direction) => (
                  <span key={direction} className={`pipe-path-arm pipe-path-arm--${direction}`} aria-hidden="true" />
                ))}
                {tile.kind === 'source' && <b className="pipe-path-symbol" aria-hidden="true">💧</b>}
                {tile.kind === 'goal' && <b className="pipe-path-symbol" aria-hidden="true">🌷</b>}
              </button>
            )
          })}
        </div>

        {game.status === 'playing' ? (
          <>
            <p className="pipe-path-feedback" role="status">パイプを タップして みずを つなごう</p>
            <div className="pipe-path-actions">
              <button type="button" onClick={resetStage}>やりなおす</button>
              <button type="button" onClick={() => { setStageIndex(null); setGame(null) }}>おわる</button>
            </div>
          </>
        ) : (
          <section className="pipe-path-clear" aria-live="polite">
            <div className="pipe-path-clear__flowers" aria-hidden="true">💧🌱🌷✨</div>
            <h2>{finalStageCleared ? 'みずの おしろ かんせい！' : 'おはなに みずが とどいた！'}</h2>
            <p className="pipe-path-clear__stars">{'⭐'.repeat(stars)}</p>
            <p>{game.turnCount}かいで つながったよ</p>
            {finalStageCleared ? (
              <button type="button" className="primary-button" onClick={begin}>もういちど</button>
            ) : (
              <button type="button" className="primary-button" onClick={nextStage}>つぎの ステージ</button>
            )}
            <Link to="/play">あそびへ戻る</Link>
          </section>
        )}
      </div>
    </PageLayout>
  )
}
