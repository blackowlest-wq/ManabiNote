import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyFrogJumpAction,
  calculateFrogJumpResult,
  FROG_JUMP_STAGES,
  startFrogJump,
  type FrogJumpState,
} from '../../features/frog-jump/model/frogJump'
import { PageLayout } from '../../shared/components/PageLayout'

export type FrogJumpPageProps = {
  storage?: Storage
  initialState?: FrogJumpState
}

export function FrogJumpPage({ storage, initialState }: FrogJumpPageProps = {}) {
  const [game, setGame] = useState<FrogJumpState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('かおの むきへ ぴょん！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateFrogJumpResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('frog-jump', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('かおの むきへ ぴょん！')
    setGame(startFrogJump())
  }

  const act = (action: Parameters<typeof applyFrogJumpAction>[1]) => {
    if (!game) return
    const transition = applyFrogJumpAction(game, action)
    if (transition.events.some((event) => event.type === 'stage-won')) setFeedback('いれかわり せいこう！')
    else if (transition.events.some((event) => event.type === 'blocked')) setFeedback('そっちへは とべないよ')
    else if (transition.events.some((event) => event.type === 'frog-moved' && event.jumped)) setFeedback('ぴょーん！')
    else if (transition.events.some((event) => event.type === 'frog-moved')) setFeedback('ぴょん！')
    else if (action.type === 'undo') setFeedback('ひとつ もどったよ')
    else if (action.type === 'reset-stage') setFeedback('さいしょの ならびに もどったよ')
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="かえるジャンプ">
        <div className="frog-jump-intro">
          <div className="frog-jump-intro__pond" aria-hidden="true">🐸 ➡️ 🪷 ⬅️ 🐸</div>
          <p>かえるは かおの むきだけ。おともだちを とびこえて、ばしょを いれかえよう！</p>
          <div className="frog-jump-intro__rule" aria-hidden="true"><span>🐸🪷</span><b>ぴょん！</b><span>🪷🐸</span></div>
          <button type="button" className="primary-button" onClick={begin}>いけへ しゅっぱつ</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="かえるジャンプ">
        <div className="frog-jump-result">
          <div className="frog-jump-result__scene" aria-hidden="true">🐸✨🏆✨🐸</div>
          <h2>かえるジャンプ マスター！</h2>
          <p className="frog-jump-result__score">{result.score} てん</p>
          <p>{result.totalStars}この ほしを あつめた</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const stage = FROG_JUMP_STAGES[game.stageIndex]
  const stageWon = game.status === 'stage-won'

  return (
    <PageLayout title="かえるジャンプ">
      <div className="frog-jump-page">
        <div className="frog-jump-hud">
          <span>🪷 {game.stageIndex + 1} / {FROG_JUMP_STAGES.length}</span>
          <span>👣 {game.moveCount}</span>
          <span>⭐ {game.totalStars}</span>
        </div>

        <div className="frog-jump-stage-name">{stage.name}</div>

        <div className="frog-jump-destinations" aria-hidden="true">
          <span>← 🏡</span><b>ばしょを いれかえよう</b><span>🏡 →</span>
        </div>
        <div className="frog-jump-pond">
          <div className="frog-jump-water" aria-hidden="true" />
          <div className="frog-jump-stones" role="group" aria-label="かえるの いる いけ">
            {game.board.map((frog, index) => (
              <button
                key={index}
                type="button"
                className={`frog-jump-stone${frog ? ` frog-jump-stone--${frog}` : ' frog-jump-stone--empty'}`}
                aria-label={`いし ${index + 1}、${frog === 'right' ? 'みぎむきの かえる' : frog === 'left' ? 'ひだりむきの かえる' : 'あいている'}`}
                disabled={!frog || stageWon}
                onClick={() => act({ type: 'tap-frog', index })}
              >
                <span className="frog-jump-lily" aria-hidden="true">●</span>
                {frog && <span className="frog-jump-frog" aria-hidden="true">🐸<i>{frog === 'right' ? '→' : '←'}</i></span>}
              </button>
            ))}
          </div>
        </div>

        <p className="frog-jump-feedback" role="status" aria-live="polite">{feedback}</p>

        {!stageWon && (
          <div className="frog-jump-tools">
            <button type="button" onClick={() => act({ type: 'undo' })} disabled={game.history.length === 0}>↩ ひとつ もどる</button>
            <button type="button" onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button>
          </div>
        )}

        {stageWon && (
          <section className="frog-jump-stage-clear" aria-live="polite">
            <h2>いれかわり せいこう！</h2>
            <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの いけ</button>
          </section>
        )}

        <button type="button" className="frog-jump-quit" onClick={() => setGame(null)}>いけを でる</button>
      </div>
    </PageLayout>
  )
}
