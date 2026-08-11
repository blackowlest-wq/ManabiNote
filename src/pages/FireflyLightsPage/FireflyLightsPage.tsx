import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyFireflyAction,
  calculateFireflyLightsResult,
  FIREFLY_STAGES,
  startFireflyLights,
  type FireflyLightsState,
} from '../../features/firefly-lights/model/fireflyLights'
import { PageLayout } from '../../shared/components/PageLayout'

export type FireflyLightsPageProps = {
  storage?: Storage
  initialState?: FireflyLightsState
}

export function FireflyLightsPage({ storage, initialState }: FireflyLightsPageProps = {}) {
  const [game, setGame] = useState<FireflyLightsState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('タップすると となりの ほたるも かわるよ！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateFireflyLightsResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('firefly-lights', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('タップすると となりの ほたるも かわるよ！')
    setGame(startFireflyLights())
  }

  const act = (action: Parameters<typeof applyFireflyAction>[1]) => {
    if (!game) return
    const transition = applyFireflyAction(game, action)
    if (transition.events.some((event) => event.type === 'stage-won')) setFeedback('ぜんぶ ぴかぴか！')
    else if (transition.events.some((event) => event.type === 'lights-changed')) setFeedback('ぱっ！ ひかりが いれかわった')
    else if (action.type === 'reset-stage') setFeedback('さいしょの よるに もどったよ')
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="ぴかぴか ほたる">
        <div className="firefly-intro">
          <div className="firefly-intro__scene" aria-hidden="true">🌙 ✨ 🪲 ✨ 🌿</div>
          <p>ほたるを タップすると、となりの ひかりも いれかわるよ！</p>
          <div className="firefly-intro__demo" aria-hidden="true"><span>· ✨ ·</span><span>✨ 🪲 ✨</span><span>· ✨ ·</span></div>
          <button type="button" className="primary-button" onClick={begin}>よるの にわへ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ぴかぴか ほたる">
        <div className="firefly-result">
          <div className="firefly-result__scene" aria-hidden="true">🎉✨🪲🏆✨🎉</div>
          <h2>ほたる マスター！</h2>
          <p className="firefly-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = FIREFLY_STAGES[game.stageIndex]
  const stageWon = game.status === 'stage-won'
  const litCount = game.lights.filter(Boolean).length

  return (
    <PageLayout title="ぴかぴか ほたる">
      <div className="firefly-page">
        <div className="firefly-hud">
          <span>🌙 {game.stageIndex + 1} / {FIREFLY_STAGES.length}</span>
          <span>✨ {litCount} / {game.lights.length}</span>
          <span>👆 {game.moveCount}</span>
          <span>⭐ {game.totalStars}</span>
        </div>

        <div className="firefly-stage-name">{stage.name}</div>

        <div className={`firefly-garden firefly-garden--${stage.size}`} role="grid" aria-label="ほたるの いる にわ" style={{ gridTemplateColumns: `repeat(${stage.size}, 1fr)` }}>
          {game.lights.map((lit, index) => (
            <button key={index} type="button" className={`firefly-light${lit ? ' firefly-light--on' : ''}`} aria-label={`ほたる ${index + 1}`} aria-pressed={lit} disabled={stageWon} onClick={() => act({ type: 'tap-firefly', index })}>
              <span aria-hidden="true">🪲</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <p className="firefly-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && <button type="button" className="firefly-reset" onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button>}

        {stageWon && (
          <section className="firefly-stage-clear" aria-live="polite">
            <h2>ぜんぶ ぴかぴか！</h2>
            <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの にわ</button>
          </section>
        )}

        <button type="button" className="firefly-quit" onClick={() => setGame(null)}>にわを でる</button>
      </div>
    </PageLayout>
  )
}
