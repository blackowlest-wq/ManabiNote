import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyLogSlideAction,
  calculateLogSlideResult,
  LOG_SLIDE_STAGES,
  startLogSlide,
  type LogSlideState,
  type SlidePiece,
} from '../../features/log-slide/model/logSlide'
import { PageLayout } from '../../shared/components/PageLayout'

export type LogSlidePageProps = { storage?: Storage; initialState?: LogSlideState }

const pieceName = (piece: SlidePiece) => piece.kind === 'squirrel'
  ? 'リスの そり'
  : `${piece.orientation === 'vertical' ? 'たて' : 'よこ'}の まるた ${piece.id.toUpperCase()}`

export function LogSlidePage({ storage, initialState }: LogSlidePageProps = {}) {
  const [game, setGame] = useState<LogSlideState | null>(initialState ?? null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('まるたを どかして、みぎの でぐちへ！')
  const clearRecorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateLogSlideResult(game) : null, [game])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('log-slide', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setSelectedId(null)
    setFeedback('まるたを どかして、みぎの でぐちへ！')
    setGame(startLogSlide())
  }

  const act = (action: Parameters<typeof applyLogSlideAction>[1]) => {
    if (!game) return
    const transition = applyLogSlideAction(game, action)
    if (transition.events.some((event) => event.type === 'stage-won')) setFeedback('でぐちが ひらいた！')
    else if (transition.events.some((event) => event.type === 'blocked')) setFeedback('ぶつかって うごかないよ')
    else if (transition.events.some((event) => event.type === 'piece-moved')) setFeedback('ずずっ！ みちが かわった')
    else if (action.type === 'undo') setFeedback('ひとつ もどったよ')
    else if (action.type === 'reset-stage') setFeedback('さいしょの もりに もどったよ')
    if (action.type === 'next-stage' || action.type === 'reset-stage') setSelectedId(null)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="どんぐり だいだっしゅつ">
        <div className="log-slide-intro">
          <div className="log-slide-intro__scene" aria-hidden="true">🌲 🪵 🐿️🌰 ➡️</div>
          <p>まるたを たて・よこに ずらして、リスの そりを でぐちまで とおそう！</p>
          <div className="log-slide-intro__rule" aria-hidden="true"><span>🪵 ↕</span><span>🪵 ↔</span></div>
          <button type="button" className="primary-button" onClick={begin}>もりへ しゅっぱつ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="どんぐり だいだっしゅつ">
        <div className="log-slide-result">
          <div className="log-slide-result__scene" aria-hidden="true">🐿️🌰✨🏆✨</div>
          <h2>だっしゅつ マスター！</h2>
          <p className="log-slide-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = LOG_SLIDE_STAGES[game.stageIndex]
  const stageWon = game.status === 'stage-won'
  const selected = game.pieces.find((piece) => piece.id === selectedId) ?? null
  const squirrel = game.pieces.find((piece) => piece.kind === 'squirrel')!

  return (
    <PageLayout title="どんぐり だいだっしゅつ">
      <div className="log-slide-page">
        <div className="log-slide-hud">
          <span>🌲 {game.stageIndex + 1} / {LOG_SLIDE_STAGES.length}</span>
          <span>👣 {game.moveCount}</span>
          <span>⭐ {game.totalStars}</span>
        </div>
        <div className="log-slide-stage-name">{stage.name}</div>

        <div className={`log-slide-board log-slide-board--${stage.size}`} style={{ gridTemplateColumns: `repeat(${stage.size}, 1fr)`, gridTemplateRows: `repeat(${stage.size}, 1fr)` }}>
          <span className="log-slide-exit" aria-hidden="true" style={{ gridColumn: stage.size, gridRow: squirrel.row + 1 }}>➡</span>
          {game.pieces.map((piece) => (
            <button
              key={piece.id}
              type="button"
              className={`log-slide-piece log-slide-piece--${piece.kind} log-slide-piece--${piece.orientation}${selectedId === piece.id ? ' log-slide-piece--selected' : ''}`}
              style={{
                gridColumn: `${piece.column + 1} / span ${piece.orientation === 'horizontal' ? piece.length : 1}`,
                gridRow: `${piece.row + 1} / span ${piece.orientation === 'vertical' ? piece.length : 1}`,
              }}
              aria-label={pieceName(piece)}
              aria-pressed={selectedId === piece.id}
              disabled={stageWon}
              onClick={() => { setSelectedId(piece.id); setFeedback(`${pieceName(piece)}を えらんだよ`) }}
            >
              <span aria-hidden="true">{piece.kind === 'squirrel' ? '🐿️🌰' : '🪵'}</span>
            </button>
          ))}
        </div>

        <p className="log-slide-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && (
          <div className="log-slide-controls">
            {selected ? (
              selected.orientation === 'vertical' ? <>
                <button type="button" aria-label="うえへ うごかす" onClick={() => act({ type: 'move-piece', id: selected.id, delta: -1 })}>↑<small>うえ</small></button>
                <button type="button" aria-label="したへ うごかす" onClick={() => act({ type: 'move-piece', id: selected.id, delta: 1 })}>↓<small>した</small></button>
              </> : <>
                <button type="button" aria-label="ひだりへ うごかす" onClick={() => act({ type: 'move-piece', id: selected.id, delta: -1 })}>←<small>ひだり</small></button>
                <button type="button" aria-label="みぎへ うごかす" onClick={() => act({ type: 'move-piece', id: selected.id, delta: 1 })}>→<small>みぎ</small></button>
              </>
            ) : <p>うごかす まるたを タップ！</p>}
          </div>
        )}

        {!stageWon && <div className="log-slide-tools">
          <button type="button" onClick={() => act({ type: 'undo' })} disabled={game.history.length === 0}>↩ ひとつ もどる</button>
          <button type="button" onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button>
        </div>}

        {stageWon && <section className="log-slide-stage-clear" aria-live="polite">
          <h2>でぐちが ひらいた！</h2>
          <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
          <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの もり</button>
        </section>}

        <button type="button" className="log-slide-quit" onClick={() => setGame(null)}>もりを でる</button>
      </div>
    </PageLayout>
  )
}
