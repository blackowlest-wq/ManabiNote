import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applySortingFactoryAction,
  calculateSortingFactoryResult,
  SORTING_LEVELS,
  SORTING_LEVEL_TARGET,
  startSortingFactory,
  type SortingFactoryEvent,
  type SortingFactoryState,
  type SortingSide,
} from '../../features/sorting-factory/model/sortingFactory'
import { PageLayout } from '../../shared/components/PageLayout'

export type SortingFactoryPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: SortingFactoryState
  tickMilliseconds?: number
}

const feedbackFor = (events: readonly SortingFactoryEvent[]) => {
  if (events.some((event) => event.type === 'item-sorted')) return 'ぽん！ しわけ せいこう！'
  if (events.some((event) => event.type === 'item-dropped')) return 'ガシャン！ はこから とびだした'
  if (events.some((event) => event.type === 'item-missed')) return 'コンベアの さきへ いっちゃった！'
  return null
}

export function SortingFactoryPage({
  storage,
  random = Math.random,
  initialState,
  tickMilliseconds = 720,
}: SortingFactoryPageProps = {}) {
  const [game, setGame] = useState<SortingFactoryState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('ながれてくる ものを はこへ ぽん！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateSortingFactoryResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current) return current
        const transition = applySortingFactoryAction(current, { type: 'tick' }, random)
        const message = feedbackFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, tickMilliseconds)
    return () => window.clearInterval(timer)
  }, [game?.status, random, tickMilliseconds])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('sorting-factory', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('ながれてくる ものを はこへ ぽん！')
    setGame(startSortingFactory(random))
  }

  const sort = (side: SortingSide) => {
    if (!game) return
    const transition = applySortingFactoryAction(game, { type: 'sort', side }, random)
    const message = feedbackFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  const nextLevel = () => {
    if (!game) return
    setFeedback('あたらしい しわけが はじまるよ！')
    setGame(applySortingFactoryAction(game, { type: 'next-level' }, random).state)
  }

  if (!game) {
    return (
      <PageLayout title="ぽんぽん しわけ工場">
        <div className="factory-intro">
          <div className="factory-intro__scene" aria-hidden="true">🏭 📦 ⚙️ 📦 🏭</div>
          <p>コンベアの ものを、2つの はこへ どんどん しわけよう！</p>
          <div className="factory-intro__demo" aria-hidden="true"><span>🍎</span><b>➜</b><span>📦</span></div>
          <button type="button" className="primary-button" onClick={begin}>こうじょうを うごかす</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="ぽんぽん しわけ工場">
        <div className="factory-result">
          <div className="factory-result__scene" aria-hidden="true">{result.isCleared ? '🎉🏭🏆🏭🎉' : '🔧🏭✨'}</div>
          <h2>{result.isCleared ? 'こうじょうマスター！' : 'こうじょうを なおそう！'}</h2>
          <p className="factory-result__score">{result.score} てん</p>
          <p>{result.totalSorted}こ しわけ ・ さいだい {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const level = SORTING_LEVELS[game.levelIndex]
  const item = level.items.find(({ id }) => id === game.currentItemId)

  return (
    <PageLayout title="ぽんぽん しわけ工場">
      <div className="factory-page">
        <div className="factory-hud">
          <span>🏭 {game.levelIndex + 1} / {SORTING_LEVELS.length}</span>
          <span>💗 {game.hearts}</span>
          <span aria-label="しわけた かず">📦 {game.sortedInLevel} / {SORTING_LEVEL_TARGET}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <div className="factory-level-name">{level.name}</div>

        <div className="factory-machine">
          <div className="factory-chute" aria-hidden="true">⚙️</div>
          <div className="factory-belt" aria-label="ながれている もの">
            {Array.from({ length: 6 }, (_, index) => <span key={index} aria-hidden="true" />)}
            <b className="factory-item" style={{ '--belt-position': game.itemPosition } as React.CSSProperties} aria-hidden="true">{item?.emoji}</b>
          </div>
          <div className="factory-drop" aria-hidden="true">🕳️</div>
        </div>

        <div className="factory-directions" aria-hidden="true"><span>↙</span><span>↘</span></div>

        <div className="factory-boxes">
          {(['left', 'right'] as const).map((side) => {
            const label = side === 'left' ? level.leftLabel : level.rightLabel
            const emoji = side === 'left' ? level.leftEmoji : level.rightEmoji
            return (
              <button key={side} type="button" className={`factory-box factory-box--${side}`} aria-label={`${label}の はこへ いれる`} disabled={game.status !== 'playing'} onClick={() => sort(side)}>
                <span aria-hidden="true">{emoji}</span>
                <small>{label}</small>
                <b aria-hidden="true">📦</b>
              </button>
            )
          })}
        </div>

        <p className="factory-feedback" role="status" aria-live="polite">{feedback}</p>

        {game.status === 'level-won' && (
          <section className="factory-level-clear" aria-live="polite">
            <h2>ベルト クリア！</h2>
            <span aria-hidden="true">⚙️✨⚙️</span>
            <button type="button" className="primary-button" onClick={nextLevel}>つぎの ベルト</button>
          </section>
        )}

        <button type="button" className="factory-quit" onClick={() => setGame(null)}>こうじょうを とめる</button>
      </div>
    </PageLayout>
  )
}
