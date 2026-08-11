import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  applyDanceSpotlightAction,
  calculateDanceSpotlightResult,
  DANCE_SPOTLIGHT_STAGES,
  startDanceSpotlight,
  type DanceSpotlightState,
} from '../../features/dance-spotlight/model/danceSpotlight'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

const laneNames = ['ひだり', 'まんなか', 'みぎ'] as const

export function DanceSpotlightPage({ storage, initialState }: { storage?: Storage; initialState?: DanceSpotlightState } = {}) {
  const [game, setGame] = useState<DanceSpotlightState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ひかっている ゆかへ いどうしよう！')
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const recorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateDanceSpotlightResult(game) : null, [game])

  useEffect(() => {
    if (result?.isCleared && !recorded.current) {
      recorded.current = true
      markGameCleared('dance-spotlight', storage)
    }
  }, [result, storage])

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const stage = DANCE_SPOTLIGHT_STAGES[game.stageIndex]
    const timer = window.setInterval(() => {
      setGame(current => {
        if (!current || current.status !== 'playing') return current
        const transition = applyDanceSpotlightAction(current, { type: 'tick' })
        const hit = transition.events.some(event => event.type === 'spotlight-hit')
        setFlash(hit ? 'hit' : 'miss')
        setFeedback(hit ? '✨ ナイス ダンス！' : '💨 つぎの ひかりへ！')
        window.setTimeout(() => setFlash(null), 220)
        return transition.state
      })
    }, stage.intervalMs)
    return () => window.clearInterval(timer)
  }, [game?.stageIndex, game?.status])

  const begin = () => {
    recorded.current = false
    setGame(startDanceSpotlight())
    setFeedback('ひかっている ゆかへ いどうしよう！')
    setFlash(null)
  }

  const act = (action: Parameters<typeof applyDanceSpotlightAction>[1]) => {
    if (!game) return
    const transition = applyDanceSpotlightAction(game, action)
    if (action.type === 'move') setFeedback(`${laneNames[action.lane]}へ ダンス！`)
    else if (action.type === 'retry' || action.type === 'next-stage') setFeedback('ひかっている ゆかへ いどうしよう！')
    setGame(transition.state)
  }

  if (!game) return (
    <PageLayout title="くるくる ダンススポット">
      <div className="dance-spotlight-center dance-spotlight-intro">
        <div className="dance-spotlight-scene" aria-hidden="true">🕺✨🪩✨💃</div>
        <p>スポットライトが うごくよ。ひかっている ゆかへ リズムよく いどうしよう！</p>
        <p>ひかりの ならびは くりかえすよ。</p>
        <button className="primary-button" onClick={begin}>ダンス スタート！</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  if (result) return (
    <PageLayout title="くるくる ダンススポット">
      <div className="dance-spotlight-center dance-spotlight-intro">
        <div className="dance-spotlight-scene" aria-hidden="true">🕺✨🏆✨💃</div>
        <h2>ダンス マスター！</h2>
        <p className="dance-spotlight-score">⭐ {result.stars}こ　{result.score}てん</p>
        <p>さいこう {result.bestCombo} コンボ！</p>
        <button className="primary-button" onClick={begin}>もういちど</button>
        <Link to="/play">あそびへ戻る</Link>
      </div>
    </PageLayout>
  )

  const stage = DANCE_SPOTLIGHT_STAGES[game.stageIndex]
  const spotlightLane = stage.pattern[game.beat % stage.pattern.length]
  return (
    <PageLayout title="くるくる ダンススポット">
      <div className="dance-spotlight-center">
        <div className="dance-spotlight-hud">
          <span>🪩 {game.stageIndex + 1} / {DANCE_SPOTLIGHT_STAGES.length}</span>
          <span>{'❤️'.repeat(Math.max(0, game.hearts))}</span>
          <span>🎵 {game.beat} / {stage.beats}</span>
          <span>🔥 {game.combo}</span>
        </div>
        <b>{stage.name}</b>
        <div className={`dance-spotlight-stage${flash ? ` dance-spotlight-stage--${flash}` : ''}`} aria-label="ダンス ステージ">
          <div className="dance-spotlight-ball" aria-hidden="true">🪩</div>
          {[0, 1, 2].map(lane => <div key={lane} className={`dance-spotlight-beam dance-spotlight-beam--${lane}${spotlightLane === lane ? ' is-on' : ''}`} />)}
          <div className="dance-spotlight-floor">
            {[0, 1, 2].map(lane => (
              <button
                key={lane}
                aria-label={`${laneNames[lane]}へ`}
                aria-pressed={game.dancerLane === lane}
                className={`${spotlightLane === lane ? 'is-lit ' : ''}${game.dancerLane === lane ? 'has-dancer' : ''}`}
                disabled={game.status !== 'playing'}
                onClick={() => act({ type: 'move', lane })}
              >
                <span aria-hidden="true">{game.dancerLane === lane ? '🕺' : '✦'}</span>
                <small>{laneNames[lane]}</small>
              </button>
            ))}
          </div>
        </div>
        <p className="dance-spotlight-feedback" aria-live="polite">{feedback}</p>
        {game.status === 'stage-won' && (
          <section className="dance-spotlight-finish">
            <h2>ステージ クリア！</h2>
            <p>{'⭐'.repeat(game.stageStars)}　🎵 {game.hits}ヒット</p>
            <button className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの ステージ</button>
          </section>
        )}
        {game.status === 'failed' && (
          <section className="dance-spotlight-finish">
            <h2>おしい！ リズムを つかもう</h2>
            <p>ひかりの くりかえしを よくみよう</p>
            <button className="primary-button" onClick={() => act({ type: 'retry' })}>もういちど</button>
          </section>
        )}
        <button className="dance-spotlight-quit" onClick={() => setGame(null)}>ステージを でる</button>
      </div>
    </PageLayout>
  )
}
