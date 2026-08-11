import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyGhostHideAction,
  calculateGhostHideResult,
  GHOST_HIDE_STAGES,
  startGhostHide,
  type GhostHideState,
  type HideGhost,
} from '../../features/ghost-hide/model/ghostHide'
import { PageLayout } from '../../shared/components/PageLayout'

export type GhostHidePageProps = { storage?: Storage; initialState?: GhostHideState }

const FACE: Readonly<Record<HideGhost['face'], string>> = { happy: '●‿●', sleepy: '－‿－', surprised: '●○●' }
const HAT: Readonly<Record<HideGhost['hat'], string>> = { star: '⭐', crown: '👑', bow: '🎀', none: '' }

function GhostFigure({ ghost, large = false }: { ghost: HideGhost; large?: boolean }) {
  return <span className={`hide-ghost hide-ghost--${ghost.color}${large ? ' hide-ghost--large' : ''}`} aria-hidden="true">
    <i className="hide-ghost__hat">{HAT[ghost.hat]}</i>
    <b className="hide-ghost__face">{FACE[ghost.face]}</b>
    <i className="hide-ghost__feet">● ● ●</i>
  </span>
}

export function GhostHidePage({ storage, initialState }: GhostHidePageProps = {}) {
  const [game, setGame] = useState<GhostHideState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('いろ・かお・ぼうしを おぼえよう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateGhostHideResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (game?.status !== 'hunting') return
    const timer = window.setInterval(() => {
      setGame((current) => current ? applyGhostHideAction(current, { type: 'tick' }).state : current)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [game?.status])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('ghost-hide', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('いろ・かお・ぼうしを おぼえよう！')
    setGame(startGhostHide())
  }

  const act = (action: Parameters<typeof applyGhostHideAction>[1]) => {
    if (!game) return
    const transition = applyGhostHideAction(game, action)
    if (transition.events.some((event) => event.type === 'target-found')) setFeedback('みつけた！ コンボ！')
    else if (transition.events.some((event) => event.type === 'decoy-chosen')) setFeedback('おしい！ もういちど よくみて')
    else if (transition.events.some((event) => event.type === 'peeked')) setFeedback('3びょう つかって もういちど！')
    else if (transition.events.some((event) => event.type === 'target-hidden')) setFeedback('にている おばけに まぎれたよ！')
    setGame(transition.state)
  }

  if (!game) return <PageLayout title="おばけ かくれんぼ">
    <div className="ghost-hide-intro">
      <div className="ghost-hide-intro__scene" aria-hidden="true">🏚️ 🌙 👻 👻 👻</div>
      <p>おばけの すがたを おぼえて、そっくりな なかまの なかから みつけよう！</p>
      <button type="button" className="primary-button" onClick={begin}>おばけやしきへ</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  if (result) return <PageLayout title="おばけ かくれんぼ">
    <div className="ghost-hide-result">
      <div className="ghost-hide-result__scene" aria-hidden="true">{result.isCleared ? '👻✨🏆✨👻' : '🌫️ 👻 💨'}</div>
      <h2>{result.isCleared ? 'かくれんぼ マスター！' : 'おばけが にげちゃった！'}</h2>
      <p className="ghost-hide-result__score">{result.score} てん</p>
      <p>{result.foundCount}たい みつけた</p>
      <button type="button" className="primary-button" onClick={begin}>もういちど</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  const stage = GHOST_HIDE_STAGES[game.roundIndex]

  return <PageLayout title="おばけ かくれんぼ">
    <div className="ghost-hide-page">
      <div className="ghost-hide-hud">
        <span>🏚️ {game.roundIndex + 1} / {GHOST_HIDE_STAGES.length}</span>
        <span>⏳ {game.timeLeft}</span>
        <span>💗 {game.hearts}</span>
        <span>🔥 {game.combo}</span>
      </div>
      <div className="ghost-hide-stage-name">{stage.name}</div>

      {game.status === 'memorizing' && <section className="ghost-hide-memory">
        <h2>この おばけを おぼえて！</h2>
        <div className="ghost-hide-portrait"><GhostFigure ghost={game.target} large /></div>
        <div className="ghost-hide-clues" aria-hidden="true">
          <span className={`ghost-hide-swatch ghost-hide-swatch--${game.target.color}`} />
          <span>{FACE[game.target.face]}</span><span>{HAT[game.target.hat] || '🚫🎩'}</span>
        </div>
        <button type="button" className="primary-button" onClick={() => act({ type: 'hide-target' })}>かくれた！さがす</button>
      </section>}

      {game.status === 'hunting' && <>
        <div className="ghost-hide-crowd" role="group" aria-label="おばけの むれ">
          {game.crowd.map((ghost, index) => <button key={ghost.id} type="button" aria-label={`おばけ ${index + 1}`} onClick={() => act({ type: 'choose-ghost', index })}>
            <GhostFigure ghost={ghost} />
          </button>)}
        </div>
        <button type="button" className="ghost-hide-peek" onClick={() => act({ type: 'peek' })}>👀 もういちど みる（−3）</button>
      </>}

      {game.status === 'round-won' && <section className="ghost-hide-round-clear" aria-live="polite">
        <GhostFigure ghost={game.target} large />
        <h2>みつけた！</h2>
        <p>🔥 {game.combo} コンボ</p>
        <button type="button" className="primary-button" onClick={() => act({ type: 'next-round' })}>つぎの おばけ</button>
      </section>}

      <p className="ghost-hide-feedback" role="status" aria-live="polite">{feedback}</p>
      <button type="button" className="ghost-hide-quit" onClick={() => setGame(null)}>やしきを でる</button>
    </div>
  </PageLayout>
}
