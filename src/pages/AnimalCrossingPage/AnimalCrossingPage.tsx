import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ANIMAL_CROSSING_STAGES,
  applyAnimalCrossingAction,
  calculateAnimalCrossingResult,
  startAnimalCrossing,
  type AnimalCrossingState,
  type Route,
} from '../../features/animal-crossing/model/animalCrossing'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

const lanePosition = (position: number) => 3 + (position + 2) * 21

export function AnimalCrossingPage({ storage, initialState }: { storage?: Storage; initialState?: AnimalCrossingState } = {}) {
  const [game, setGame] = useState<AnimalCrossingState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('くるまを よくみて しんごうを きりかえよう！')
  const recorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateAnimalCrossingResult(game) : null, [game])

  useEffect(() => {
    if (result?.isCleared && !recorded.current) {
      recorded.current = true
      markGameCleared('animal-crossing', storage)
    }
  }, [result, storage])

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const stage = ANIMAL_CROSSING_STAGES[game.stageIndex]
    const timer = window.setInterval(() => {
      setGame(current => {
        if (!current || current.status !== 'playing') return current
        const transition = applyAnimalCrossingAction(current, { type: 'tick' })
        if (transition.events.some(event => event.type === 'collision')) setFeedback('💥 ぶつかっちゃった！ なかを からにしてから きりかえよう')
        else if (transition.events.some(event => event.type === 'car-delivered')) setFeedback('✨ ぶじに とおれた！')
        else if (transition.events.some(event => event.type === 'stage-won')) setFeedback('みんな ぶじに とおれた！')
        return transition.state
      })
    }, stage.intervalMs)
    return () => window.clearInterval(timer)
  }, [game?.stageIndex, game?.status])

  const begin = () => {
    recorded.current = false
    setGame(startAnimalCrossing())
    setFeedback('はじめは よこの みちが あお！')
  }

  const act = (action: Parameters<typeof applyAnimalCrossingAction>[1]) => {
    if (!game) return
    const transition = applyAnimalCrossingAction(game, action)
    if (action.type === 'set-signal') setFeedback(action.signal === 'horizontal' ? '↔ よこの みちが あお！' : '↕ たての みちが あお！')
    else if (action.type === 'retry' || action.type === 'next-stage') setFeedback('くるまを よくみて きりかえよう！')
    setGame(transition.state)
  }

  if (!game) return (
    <PageLayout title="どうぶつ こうさてん">
      <div className="animal-crossing-center animal-crossing-intro">
        <div className="animal-crossing-scene" aria-hidden="true">🐰🚗　🚦　🐻🚙</div>
        <p>しんごうを きりかえて、どうぶつの くるまを ぶつけずに とおそう！</p>
        <p>こうさてんの なかが からになってから きりかえるのが コツ。</p>
        <button className="primary-button" onClick={begin}>こうつうせいり！</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  if (result) return (
    <PageLayout title="どうぶつ こうさてん">
      <div className="animal-crossing-center animal-crossing-intro">
        <div className="animal-crossing-scene" aria-hidden="true">🐰🚗✨🏆✨🚙🐻</div>
        <h2>こうさてん マスター！</h2>
        <p className="animal-crossing-score">⭐ {result.stars}こ　{result.score}てん</p>
        <p>さいこう {result.bestCombo} コンボ！</p>
        <button className="primary-button" onClick={begin}>もういちど</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  const stage = ANIMAL_CROSSING_STAGES[game.stageIndex]
  return (
    <PageLayout title="どうぶつ こうさてん">
      <div className="animal-crossing-center">
        <div className="animal-crossing-hud">
          <span>🚦 {game.stageIndex + 1} / {ANIMAL_CROSSING_STAGES.length}</span>
          <span>{'❤️'.repeat(Math.max(0, game.hearts))}</span>
          <span>🏁 {game.delivered}</span>
          <span>🔥 {game.combo}</span>
        </div>
        <b>{stage.name}</b>
        <div className="animal-crossing-board" aria-label="どうぶつの こうさてん">
          <div className="animal-crossing-road animal-crossing-road--horizontal" />
          <div className="animal-crossing-road animal-crossing-road--vertical" />
          <div className="animal-crossing-center-mark" aria-hidden="true">＋</div>
          <div className={`animal-crossing-light animal-crossing-light--horizontal${game.signal === 'horizontal' ? ' animal-crossing-light--green' : ''}`} aria-hidden="true">●</div>
          <div className={`animal-crossing-light animal-crossing-light--vertical${game.signal === 'vertical' ? ' animal-crossing-light--green' : ''}`} aria-hidden="true">●</div>
          {game.cars.map(car => (
            <div
              key={car.id}
              className={`animal-crossing-car animal-crossing-car--${car.route}`}
              style={car.route === 'horizontal' ? { left: `${lanePosition(car.position)}%` } : { top: `${lanePosition(car.position)}%` }}
              aria-label={`${car.route === 'horizontal' ? 'よこ' : 'たて'}の どうぶつカー`}
            >
              <span aria-hidden="true">{car.route === 'horizontal' ? '🐰' : '🐻'}</span>
            </div>
          ))}
        </div>
        <p className="animal-crossing-feedback" aria-live="polite">{feedback}</p>
        {game.status === 'playing' && (
          <div className="animal-crossing-controls">
            <button aria-label="よこを あお！" aria-pressed={game.signal === 'horizontal'} className={game.signal === 'horizontal' ? 'is-green' : ''} onClick={() => act({ type: 'set-signal', signal: 'horizontal' })}>↔<small>よこ</small></button>
            <button aria-label="たてを あお！" aria-pressed={game.signal === 'vertical'} className={game.signal === 'vertical' ? 'is-green' : ''} onClick={() => act({ type: 'set-signal', signal: 'vertical' })}>↕<small>たて</small></button>
          </div>
        )}
        {game.status === 'stage-won' && (
          <section className="animal-crossing-finish">
            <h2>みんな とおれた！</h2>
            <p>{'⭐'.repeat(game.stageStars)}　🏁 {game.delivered}だい</p>
            <button className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの こうさてん</button>
          </section>
        )}
        {game.status === 'failed' && (
          <section className="animal-crossing-finish">
            <h2>こうさてんが たいへん！</h2>
            <p>なかの くるまが でてから きりかえよう</p>
            <button className="primary-button" onClick={() => act({ type: 'retry' })}>もういちど</button>
          </section>
        )}
        <button className="animal-crossing-quit" onClick={() => setGame(null)}>こうさてんを でる</button>
      </div>
    </PageLayout>
  )
}
