import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyProverbChoiceAction,
  findProverb,
  PROVERB_CHOICE_ROUND_COUNT,
  startProverbChoice,
  type ProverbChoiceAction,
  type ProverbChoiceState,
} from '../../features/proverb-choice/model/proverbChoice'
import { PageLayout } from '../../shared/components/PageLayout'

export type ProverbChoicePageProps = {
  storage?: Storage
  random?: () => number
  initialState?: ProverbChoiceState
}

export function ProverbChoicePage({ storage, random = Math.random, initialState }: ProverbChoicePageProps = {}) {
  const [game, setGame] = useState<ProverbChoiceState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('せつめいに あう ことわざは どれ？')
  const clearRecorded = useRef(false)

  useEffect(() => {
    if (game?.status !== 'finished' || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('proverb-choice', storage)
  }, [game?.status, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('せつめいに あう ことわざは どれ？')
    setGame(startProverbChoice(random))
  }

  const act = (action: ProverbChoiceAction) => {
    if (!game) return
    const transition = applyProverbChoiceAction(game, action, random)
    const event = transition.events[0]
    if (event?.type === 'proverb-missed') setFeedback('おしい！ せつめいを よく よんでみよう')
    if (event?.type === 'proverb-found') {
      const proverb = findProverb(event.proverbId)
      setFeedback(`${proverb?.proverb ?? 'そのことわざ'} せいかい！ +${event.points}てん`)
    }
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="ことわざを えらぼう">
        <div className="proverb-choice-intro">
          <div className="proverb-choice-intro__scene" aria-hidden="true">📖 💡 🌟</div>
          <p>ことわざの せつめいを よんで、ぴったりの ことばを えらぼう！</p>
          <p>{PROVERB_CHOICE_ROUND_COUNT}もん せいかいして、ことわざマスターを めざそう。</p>
          <button type="button" className="primary-button" onClick={begin}>ことわざクイズを はじめる</button>
          <Link to="/knowledge">ものしりへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (game.status === 'finished') {
    return (
      <PageLayout title="ことわざを えらぼう">
        <div className="proverb-choice-result">
          <div className="proverb-choice-result__scene" aria-hidden="true">🎉 📖 🏆 🎉</div>
          <h2>ことわざマスター！</h2>
          <p className="proverb-choice-result__score">{game.score} てん</p>
          <p>{game.correctCount}もん せいかい ・ さいこうコンボ {game.bestCombo}</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど あそぶ</button>
          <Link to="/knowledge">ものしりへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const proverb = findProverb(game.question.proverbId)
  const isLastRound = game.roundIndex === PROVERB_CHOICE_ROUND_COUNT - 1

  return (
    <PageLayout title="ことわざを えらぼう">
      <div className="proverb-choice-page">
        <div className="proverb-choice-hud">
          <span>{game.roundIndex + 1} / {PROVERB_CHOICE_ROUND_COUNT}</span>
          <span>⭐ {game.score}</span>
          <span>🔥 {game.combo}</span>
          <span aria-label="せいかい数">✅ {game.correctCount}</span>
        </div>

        <section className="proverb-choice-question" aria-label="ことわざの説明から選ぶ問題">
          <p>この せつめいに あう ことわざは どれ？</p>
          <div className="proverb-choice-explanation" aria-label="ことわざの説明">
            {proverb?.explanation}
          </div>

          <div className="proverb-choice-options" role="group" aria-label="ことわざをえらぶ">
            {game.question.choiceProverbIds.map((proverbId) => {
              const choice = findProverb(proverbId)
              const isSelected = game.selectedProverbId === proverbId
              return (
                <button
                  key={proverbId}
                  type="button"
                  className={`proverb-choice-option${isSelected ? ' proverb-choice-option--selected' : ''}`}
                  aria-pressed={isSelected}
                  disabled={game.status === 'round-won'}
                  onClick={() => act({ type: 'choose', proverbId })}
                >
                  {choice?.proverb}
                </button>
              )
            })}
          </div>
        </section>

        <p className="proverb-choice-feedback" role="status" aria-live="polite">{feedback}</p>

        {game.status === 'round-won' && (
          <div className="proverb-choice-next">
            <span aria-hidden="true">✅ {proverb?.proverb}</span>
            <button type="button" className="primary-button" onClick={() => act({ type: 'next' })}>
              {isLastRound ? 'けっかを見る' : 'つぎの ことわざへ'}
            </button>
          </div>
        )}

        <button type="button" className="proverb-choice-quit" onClick={() => setGame(null)}>クイズを やめる</button>
      </div>
    </PageLayout>
  )
}
