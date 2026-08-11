import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyForestGuardAction,
  calculateForestGuardResult,
  FOREST_WAVES,
  startForestGuard,
  type ForestElement,
  type ForestGuardEvent,
  type ForestGuardState,
  type ForestLane,
} from '../../features/forest-guard/model/forestGuard'
import { PageLayout } from '../../shared/components/PageLayout'

export type ForestGuardPageProps = {
  storage?: Storage
  initialState?: ForestGuardState
  tickMilliseconds?: number
}

const ELEMENTS: readonly ForestElement[] = ['fire', 'water', 'leaf']
const ELEMENT_INFO: Readonly<Record<ForestElement, { name: string; guard: string; enemy: string }>> = {
  fire: { name: 'ほのお', guard: '🐲', enemy: '🔥' },
  water: { name: 'みず', guard: '🐧', enemy: '💧' },
  leaf: { name: 'はっぱ', guard: '🐼', enemy: '🌿' },
}
const LANE_NAMES = ['うえ', 'まんなか', 'した'] as const

const feedbackFor = (events: readonly ForestGuardEvent[]) => {
  if (events.some((event) => event.type === 'game-won')) return 'もりを まもりきった！'
  if (events.some((event) => event.type === 'wave-won')) return 'しゅうげきを ふせいだ！'
  if (events.some((event) => event.type === 'forest-hit')) return 'モンスターが もりに はいった！'
  if (events.some((event) => event.type === 'enemy-defeated')) return 'ガードの こうげき！'
  return null
}

export function ForestGuardPage({
  storage,
  initialState,
  tickMilliseconds = 900,
}: ForestGuardPageProps = {}) {
  const [game, setGame] = useState<ForestGuardState | null>(initialState ?? null)
  const [selectedElement, setSelectedElement] = useState<ForestElement>('fire')
  const [feedback, setFeedback] = useState('ガードを 3つの みちに おこう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateForestGuardResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current) return current
        const transition = applyForestGuardAction(current, { type: 'tick' })
        const message = feedbackFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, tickMilliseconds)
    return () => window.clearInterval(timer)
  }, [game?.status, tickMilliseconds])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('forest-guard', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setSelectedElement('fire')
    setFeedback('ガードを 3つの みちに おこう！')
    setGame(startForestGuard())
  }

  const place = (lane: ForestLane) => {
    if (!game) return
    const transition = applyForestGuardAction(game, { type: 'place-guard', lane, element: selectedElement })
    if (transition.state !== game) setFeedback(`${ELEMENT_INFO[selectedElement].name}ガードを おいた！`)
    setGame(transition.state)
  }

  const startWave = () => {
    if (!game) return
    setFeedback('モンスターが くるぞ！')
    setGame(applyForestGuardAction(game, { type: 'start-wave' }).state)
  }

  const nextWave = () => {
    if (!game) return
    setFeedback('つぎの しゅうげきに そなえよう！')
    setGame(applyForestGuardAction(game, { type: 'next-wave' }).state)
  }

  if (!game) {
    return (
      <PageLayout title="もりの まもり隊">
        <div className="guard-intro">
          <div className="guard-intro__scene" aria-hidden="true">🌳 🐲 🐧 🐼 🌳</div>
          <p>3つの みちから やってくる モンスターを とめよう！</p>
          <div className="guard-cycle" aria-label="ガードの つよさ">
            <span>🐲 ➜ 🌿</span><span>🐼 ➜ 💧</span><span>🐧 ➜ 🔥</span>
          </div>
          <button type="button" className="primary-button" onClick={begin}>もりを まもる</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="もりの まもり隊">
        <div className="guard-result">
          <div className="guard-result__scene" aria-hidden="true">{result.isCleared ? '🌳🎉🏆🎉🌳' : '🌲🌙🌲'}</div>
          <h2>{result.isCleared ? 'もりを まもった！' : 'もりへ もどろう！'}</h2>
          <p className="guard-result__score">{result.score} てん</p>
          <p>モンスターを {result.defeatedCount}たい とめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const wave = FOREST_WAVES[game.waveIndex]
  const allGuardsReady = game.guards.every((guard) => guard !== null)
  const setup = game.status === 'setup'

  return (
    <PageLayout title="もりの まもり隊">
      <div className="guard-page">
        <div className="guard-hud">
          <span>🌊 {game.waveIndex + 1} / {FOREST_WAVES.length}</span>
          <span aria-label="のこりの たね">🌰 {game.seeds}</span>
          <span>💚 {game.hearts}</span>
          <span>⭐ {game.score}</span>
        </div>

        <div className="guard-wave-name">{wave.name}</div>

        <section className="guard-picker" aria-label="ガードを えらぶ">
          {ELEMENTS.map((element) => (
            <button
              key={element}
              type="button"
              className={selectedElement === element ? 'guard-picker__selected' : ''}
              aria-label={`${ELEMENT_INFO[element].name}ガードを えらぶ`}
              aria-pressed={selectedElement === element}
              onClick={() => setSelectedElement(element)}
            >
              <span aria-hidden="true">{ELEMENT_INFO[element].guard}</span>
              <small>{ELEMENT_INFO[element].name}</small>
            </button>
          ))}
        </section>

        <div className="guard-battlefield" aria-label="もりへ つづく 3つの みち">
          {([0, 1, 2] as const).map((lane) => {
            const guard = game.guards[lane]
            const laneEnemies = game.enemies.filter((enemy) => enemy.lane === lane)
            const preview = wave.spawns.filter((spawn, index) => index >= game.spawnCursor && spawn.lane === lane)
            return (
              <div className="guard-lane" key={lane}>
                <span className="guard-tree" aria-hidden="true">🌳</span>
                <button
                  type="button"
                  className="guard-station"
                  aria-label={`${LANE_NAMES[lane]}の みちに おく`}
                  disabled={!setup && game.status !== 'playing'}
                  onClick={() => place(lane)}
                >
                  <span aria-hidden="true">{guard ? ELEMENT_INFO[guard].guard : '＋'}</span>
                </button>
                <div className="guard-road" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, position) => {
                    const enemy = laneEnemies.find((candidate) => candidate.position === position)
                    return <span key={position}>{enemy ? ELEMENT_INFO[enemy.element].enemy : ''}</span>
                  })}
                </div>
                <div className="guard-preview" aria-label={`${LANE_NAMES[lane]}の みちに くる モンスター`}>
                  {preview.length > 0 ? preview.slice(0, 3).map((spawn, index) => <span key={`${spawn.turn}-${index}`} aria-hidden="true">{ELEMENT_INFO[spawn.element].enemy}</span>) : '☁️'}
                </div>
              </div>
            )
          })}
        </div>

        <p className="guard-feedback" role="status" aria-live="polite">{feedback}</p>

        {setup && (
          <button type="button" className="primary-button guard-start" disabled={!allGuardsReady} onClick={startWave}>
            しゅうげき スタート
          </button>
        )}
        {game.status === 'wave-won' && (
          <section className="guard-wave-clear" aria-live="polite">
            <strong>しゅうげきを ふせいだ！</strong>
            <span aria-hidden="true">✨🌳✨</span>
            <button type="button" className="primary-button" onClick={nextWave}>つぎの ウェーブ</button>
          </section>
        )}
        <button type="button" className="guard-quit" onClick={() => setGame(null)}>まもりを おわる</button>
      </div>
    </PageLayout>
  )
}
