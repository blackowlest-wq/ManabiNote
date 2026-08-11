import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyMonsterMove,
  MONSTER_CLEAR_LEVEL,
  MONSTER_LEVELS,
  startMonsterMerge,
  type MonsterMergeEvent,
  type MonsterMergeState,
  type MonsterMoveDirection,
} from '../../features/monster-merge/model/monsterMerge'
import { PageLayout } from '../../shared/components/PageLayout'

export type MonsterMergePageProps = {
  storage?: Storage
  random?: () => number
  initialState?: MonsterMergeState
}

const messageFor = (events: readonly MonsterMergeEvent[]) => {
  const discovered = events.findLast((event) => event.type === 'monster-discovered')
  if (discovered?.type === 'monster-discovered') {
    return `${MONSTER_LEVELS[discovered.level].name}を はっけん！`
  }
  if (events.some((event) => event.type === 'game-cleared')) return 'ドラゴンが うまれた！'
  if (events.some((event) => event.type === 'board-stuck')) return 'しまが いっぱい！'
  if (events.some((event) => event.type === 'monsters-merged')) return 'がったい せいこう！'
  if (events.some((event) => event.type === 'move-blocked')) return 'ちがう ほうへ うごかしてみよう'
  return null
}

export function MonsterMergePage({
  storage,
  random = Math.random,
  initialState,
}: MonsterMergePageProps = {}) {
  const [game, setGame] = useState<MonsterMergeState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('おなじ モンスターを くっつけよう！')
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const clearRecorded = useRef(false)

  useEffect(() => {
    if (game?.status !== 'cleared' || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('monster-merge', storage)
  }, [game?.status, storage])

  const startGame = () => {
    clearRecorded.current = false
    setGame(startMonsterMerge(random))
    setFeedback('おなじ モンスターを くっつけよう！')
  }

  const move = (direction: MonsterMoveDirection) => {
    if (!game || game.status !== 'playing') return
    const transition = applyMonsterMove(game, direction, random)
    setGame(transition.state)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directionByKey: Partial<Record<string, MonsterMoveDirection>> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    }
    const direction = directionByKey[event.key]
    if (!direction) return
    event.preventDefault()
    move(direction)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
  }

  if (!game) {
    return (
      <PageLayout title="モンスター合体">
        <div className="monster-merge-intro">
          <div className="monster-merge-intro__evolution" aria-hidden="true">🥚 ＋ 🥚 → 🐣 → 🐲</div>
          <p>しまを うごかして、おなじ モンスターを がったい！</p>
          <p>{MONSTER_LEVELS[MONSTER_CLEAR_LEVEL].emoji} ドラゴンが うまれたら クリア！</p>
          <button type="button" className="primary-button" onClick={startGame}>たんけんを はじめる</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (game.status !== 'playing') {
    const cleared = game.status === 'cleared'
    return (
      <PageLayout title="モンスター合体">
        <div className="monster-merge-result">
          <div className="monster-merge-result__hero" aria-hidden="true">{cleared ? '🎉🐉🎉' : '🏝️✨'}</div>
          <h2>{cleared ? 'ドラゴン たんじょう！' : 'しまが いっぱい！'}</h2>
          <p className="monster-merge-result__score">{game.score} てん</p>
          <p>{game.discoveredLevels.length}しゅるい はっけん</p>
          <p>さいこう {game.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={startGame}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="モンスター合体">
      <div className="monster-merge-page">
        <div className="monster-merge-hud" aria-label="たんけんの きろく">
          <span aria-label={`${game.score}てん`}>🏅 {game.score}</span>
          <span aria-label={`${game.combo}コンボ`}>🔥 {game.combo}</span>
          <span aria-label={`${game.moveCount}かい うごかした`}>👣 {game.moveCount}</span>
        </div>

        <div
          className="monster-merge-board"
          role="grid"
          aria-label="モンスターの しま"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {game.board.map((level, index) => (
            <div
              key={index}
              className={`monster-merge-cell${level ? ` monster-merge-cell--level-${level}` : ''}`}
              role="gridcell"
              aria-label={level ? MONSTER_LEVELS[level].name : 'あきマス'}
            >
              {level && (
                <span className="monster-merge-piece">
                  <b aria-hidden="true">{MONSTER_LEVELS[level].emoji}</b>
                  <small>{MONSTER_LEVELS[level].name}</small>
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="monster-merge-controls" aria-label="うごかす ほうこう">
          <button type="button" aria-label="うえへ うごかす" onClick={() => move('up')}>▲</button>
          <button type="button" aria-label="ひだりへ うごかす" onClick={() => move('left')}>◀</button>
          <button type="button" aria-label="したへ うごかす" onClick={() => move('down')}>▼</button>
          <button type="button" aria-label="みぎへ うごかす" onClick={() => move('right')}>▶</button>
        </div>

        <p className="monster-merge-feedback" role="status" aria-live="polite">{feedback}</p>
        <section className="monster-merge-book" aria-label="はっけん ずかん">
          <strong>はっけん ずかん</strong>
          <div>
            {([1, 2, 3, 4, 5] as const).map((level) => {
              const discovered = game.discoveredLevels.includes(level)
              return <span key={level} aria-label={discovered ? MONSTER_LEVELS[level].name : 'まだ みつけていない'}>{discovered ? MONSTER_LEVELS[level].emoji : '？'}</span>
            })}
          </div>
        </section>
        <button type="button" className="monster-merge-quit" onClick={() => setGame(null)}>たんけんを おわる</button>
      </div>
    </PageLayout>
  )
}
