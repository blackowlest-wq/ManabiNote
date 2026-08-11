import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  applyBeeRouteAction,
  BEE_ROUTE_STAGES,
  calculateBeeRouteResult,
  startBeeRoute,
  type BeePoint,
  type BeeRouteState,
  type BeeTarget,
} from '../../features/bee-route/model/beeRoute'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

export type BeeRoutePageProps = { storage?: Storage; initialState?: BeeRouteState }

const percentPoint = (point: BeePoint) => ({ x: 10 + point.column * 20, y: 10 + point.row * 20 })

export function BeeRoutePage({ storage, initialState }: BeeRoutePageProps = {}) {
  const [game, setGame] = useState<BeeRouteState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ちかい おはなを つないで とぼう！')
  const clearRecorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateBeeRouteResult(game) : null, [game])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('bee-route', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('ちかい おはなを つないで とぼう！')
    setGame(startBeeRoute())
  }

  const act = (action: Parameters<typeof applyBeeRouteAction>[1]) => {
    if (!game) return
    const transition = applyBeeRouteAction(game, action)
    if (transition.events.some((event) => event.type === 'stage-won')) setFeedback('はちみつを おとどけ！')
    else if (transition.events.some((event) => event.type === 'flower-visited')) setFeedback('みつを ゲット！ つぎは どこ？')
    else if (transition.events.some((event) => event.type === 'flowers-remaining')) setFeedback('まだ おはなが のこっているよ')
    else if (transition.events.some((event) => event.type === 'out-of-energy')) setFeedback('はばたきが たりなくなった！')
    else if (action.type === 'undo') setFeedback('ひとつ まえへ もどったよ')
    else if (action.type === 'retry') setFeedback('こんどは みじかい みちを さがそう！')
    setGame(transition.state)
  }

  if (!game) return <PageLayout title="みつばち フラワールート">
    <div className="bee-route-intro">
      <div className="bee-route-intro__scene" aria-hidden="true">🐝 〰️ 🌷 〰️ 🌻 〰️ 🍯</div>
      <p>はばたきが なくなるまえに おはなの みつを あつめて、すへ かえろう！</p>
      <div className="bee-route-intro__energy" aria-hidden="true">⚡⚡⚡ → 🌷 → 🏠</div>
      <button type="button" className="primary-button" onClick={begin}>おはなばたけへ</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  if (result) return <PageLayout title="みつばち フラワールート">
    <div className="bee-route-result">
      <div className="bee-route-result__scene" aria-hidden="true">🐝🍯✨🏆✨🌼</div>
      <h2>フラワールート マスター！</h2>
      <p className="bee-route-result__score">{result.score} てん</p>
      <p>{result.totalStars}この ほしを あつめた</p>
      <button type="button" className="primary-button" onClick={begin}>もういちど</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  const stage = BEE_ROUTE_STAGES[game.stageIndex]
  const completed = game.status === 'stage-won'
  const pointFor = (target: BeeTarget) => target === 'hive' ? stage.hive : stage.flowers.find((flower) => flower.id === target)!
  const routePoints = game.route.map((target) => percentPoint(pointFor(target))).map(({ x, y }) => `${x},${y}`).join(' ')
  const beePoint = percentPoint(pointFor(game.position))
  const energyPercent = game.energyLeft / stage.energyBudget * 100

  return <PageLayout title="みつばち フラワールート">
    <div className="bee-route-page">
      <div className="bee-route-hud">
        <span>🌼 {game.stageIndex + 1} / {BEE_ROUTE_STAGES.length}</span>
        <span>🍯 {game.collected.length} / {stage.flowers.length}</span>
        <span>⚡ {game.energyLeft}</span>
        <span>⭐ {game.totalStars}</span>
      </div>
      <div className="bee-route-stage-name">{stage.name}</div>
      <div className="bee-route-energy" aria-label={`のこり はばたき ${game.energyLeft}`}><i style={{ width: `${energyPercent}%` }} /></div>

      <div className="bee-route-field">
        <svg className="bee-route-lines" viewBox="0 0 100 100" aria-hidden="true"><polyline points={routePoints} /></svg>
        <button
          type="button"
          className={`bee-route-node bee-route-hive${game.collected.length === stage.flowers.length ? ' bee-route-hive--ready' : ''}`}
          style={{ left: `${percentPoint(stage.hive).x}%`, top: `${percentPoint(stage.hive).y}%` }}
          aria-label="はちのすへ もどる"
          disabled={completed}
          onClick={() => act({ type: 'fly-to', target: 'hive' })}
        ><span aria-hidden="true">🍯</span></button>
        {stage.flowers.map((flower) => {
          const point = percentPoint(flower)
          const collected = game.collected.includes(flower.id)
          return <button
            key={flower.id}
            type="button"
            className={`bee-route-node bee-route-flower${collected ? ' bee-route-flower--collected' : ''}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-label={`おはな ${flower.id.toUpperCase()}`}
            disabled={collected || completed}
            onClick={() => act({ type: 'fly-to', target: flower.id })}
          ><span aria-hidden="true">{flower.icon}</span><i aria-hidden="true">{collected ? '✓' : flower.id.toUpperCase()}</i></button>
        })}
        <span className="bee-route-bee" aria-hidden="true" style={{ left: `${beePoint.x}%`, top: `${beePoint.y}%` }}>🐝</span>
      </div>

      <p className="bee-route-feedback" role="status" aria-live="polite">{feedback}</p>

      {game.status === 'playing' && <div className="bee-route-tools">
        <button type="button" onClick={() => act({ type: 'undo' })} disabled={game.history.length === 0}>↩ ひとつ もどる</button>
        <span>🐝 {'•'.repeat(game.route.length - 1)} ➜</span>
      </div>}

      {game.status === 'failed' && <section className="bee-route-tired" aria-live="polite">
        <div aria-hidden="true">🐝💤</div><h2>はばたきが たりない！</h2>
        <button type="button" className="primary-button" onClick={() => act({ type: 'retry' })}>べつの みちを ためす</button>
      </section>}

      {completed && <section className="bee-route-stage-clear" aria-live="polite">
        <div aria-hidden="true">🐝 🍯 🎉</div><h2>はちみつを おとどけ！</h2>
        <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
        <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの おはなばたけ</button>
      </section>}

      <button type="button" className="bee-route-quit" onClick={() => setGame(null)}>おはなばたけを でる</button>
    </div>
  </PageLayout>
}
