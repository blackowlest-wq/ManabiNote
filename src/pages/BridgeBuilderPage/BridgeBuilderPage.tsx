import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyBridgeAction,
  BRIDGE_STAGES,
  calculateBridgeBuilderResult,
  startBridgeBuilder,
  type BridgeBuilderEvent,
  type BridgeBuilderState,
} from '../../features/bridge-builder/model/bridgeBuilder'
import { PageLayout } from '../../shared/components/PageLayout'

export type BridgeBuilderPageProps = {
  storage?: Storage
  initialState?: BridgeBuilderState
}

const feedbackFor = (events: readonly BridgeBuilderEvent[]) => {
  if (events.some((event) => event.type === 'bridge-collapsed')) return 'ざぶーん！ ながすぎた！'
  if (events.some((event) => event.type === 'stage-won')) return 'はしが つながった！'
  if (events.some((event) => event.type === 'log-removed')) return 'まるたを もどしたよ'
  if (events.some((event) => event.type === 'log-placed')) return 'トン！ まるたを おいた！'
  return null
}

export function BridgeBuilderPage({ storage, initialState }: BridgeBuilderPageProps = {}) {
  const [game, setGame] = useState<BridgeBuilderState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('まるたを つないで むこうぎしへ！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateBridgeBuilderResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('bridge-builder', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('まるたを つないで むこうぎしへ！')
    setGame(startBridgeBuilder())
  }

  const act = (action: Parameters<typeof applyBridgeAction>[1]) => {
    if (!game) return
    const transition = applyBridgeAction(game, action)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="ぽんぽこ 橋づくり">
        <div className="bridge-intro">
          <div className="bridge-intro__scene" aria-hidden="true">🦝 🌳 🪵 🌊 🏕️</div>
          <p>ながさの ちがう まるたで、ぴったりの はしを つくろう！</p>
          <div className="bridge-intro__logs" aria-hidden="true"><span>🪵</span><span>🪵🪵</span><span>🪵🪵🪵</span></div>
          <button type="button" className="primary-button" onClick={begin}>かわへ しゅっぱつ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ぽんぽこ 橋づくり">
        <div className="bridge-result">
          <div className="bridge-result__scene" aria-hidden="true">🎉🦝🌉🏆🎉</div>
          <h2>はしづくり マスター！</h2>
          <p className="bridge-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = BRIDGE_STAGES[game.stageIndex]
  const placedLogs = game.placedLogIds.map((id) => stage.logs.find((log) => log.id === id)).filter(Boolean)
  const stageWon = game.status === 'stage-won'

  return (
    <PageLayout title="ぽんぽこ 橋づくり">
      <div className="bridge-page">
        <div className="bridge-hud">
          <span>🌉 {game.stageIndex + 1} / {BRIDGE_STAGES.length}</span>
          <span>📏 {game.builtLength} / {stage.span}</span>
          <span>🌊 {game.collapseCount}</span>
          <span>⭐ {game.totalStars}</span>
        </div>

        <div className="bridge-stage-name">{stage.name}</div>

        <section className="bridge-river" aria-label="はしを かける かわ">
          <div className="bridge-bank bridge-bank--left" aria-hidden="true">🌳<b>🦝</b></div>
          <div className="bridge-gap">
            <div className="bridge-slots" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${stage.span}, 1fr)` }}>
              {Array.from({ length: stage.span }, (_, index) => <span key={index} />)}
            </div>
            <div className="bridge-built" aria-label={`できた ながさ ${game.builtLength}`}>
              {placedLogs.map((log) => log && (
                <span key={log.id} className={`bridge-log bridge-log--${log.color}`} style={{ flex: log.length }} aria-hidden="true">
                  {Array.from({ length: log.length }, () => '●').join('')}
                </span>
              ))}
              {game.builtLength < stage.span && (
                <span className="bridge-built__remaining" style={{ flex: stage.span - game.builtLength }} aria-hidden="true" />
              )}
            </div>
            <div className="bridge-water" aria-hidden="true">〰 〰 〰</div>
          </div>
          <div className="bridge-bank bridge-bank--right" aria-hidden="true"><b>{stageWon ? '🦝' : '⛺'}</b>🌲</div>
        </section>

        <p className="bridge-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && (
          <>
            <section className="bridge-inventory" aria-label="つかえる まるた">
              {stage.logs.map((log, index) => {
                const used = game.placedLogIds.includes(log.id)
                return (
                  <button key={log.id} type="button" className={`bridge-inventory__log bridge-inventory__log--${log.color}`} aria-label={`ながさ ${log.length}の まるた ${index + 1}`} disabled={used} onClick={() => act({ type: 'place-log', logId: log.id })}>
                    <span aria-hidden="true">{Array.from({ length: log.length }, () => '●').join('')}</span>
                    <b>{log.length}</b>
                  </button>
                )
              })}
            </section>
            <div className="bridge-controls">
              <button type="button" disabled={game.placedLogIds.length === 0} onClick={() => act({ type: 'remove-last' })}>↩ ひとつ もどす</button>
              <button type="button" disabled={game.placedLogIds.length === 0} onClick={() => act({ type: 'reset-stage' })}>🔄 やりなおす</button>
            </div>
          </>
        )}

        {stageWon && (
          <section className="bridge-stage-clear" aria-live="polite">
            <h2>はしが つながった！</h2>
            <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの かわ</button>
          </section>
        )}

        <button type="button" className="bridge-quit" onClick={() => setGame(null)}>はしづくりを おわる</button>
      </div>
    </PageLayout>
  )
}
