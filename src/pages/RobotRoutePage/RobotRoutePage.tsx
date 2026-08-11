import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyRobotAction,
  calculateRobotStars,
  ROBOT_STAGES,
  startRobotStage,
  type RobotCommand,
  type RobotRouteAction,
  type RobotRouteState,
} from '../../features/robot-route/model/robotRoute'
import { PageLayout } from '../../shared/components/PageLayout'

export type RobotRoutePageProps = {
  storage?: Storage
  initialStageIndex?: number
  initialState?: RobotRouteState
}

const COMMAND_SYMBOL: Readonly<Record<RobotCommand, string>> = {
  up: '↑',
  right: '→',
  down: '↓',
  left: '←',
}

const COMMAND_LABEL: Readonly<Record<RobotCommand, string>> = {
  up: 'うえ',
  right: 'みぎ',
  down: 'した',
  left: 'ひだり',
}

const failureMessage = (state: RobotRouteState) => {
  if (state.failureReason === 'wall') return 'かべに ゴツン！みちを かえてみよう'
  if (state.failureReason === 'missing-battery') return 'でんちを わすれてるよ！'
  return 'ゴールまで あとすこし！'
}

export function RobotRoutePage({
  storage,
  initialStageIndex,
  initialState,
}: RobotRoutePageProps = {}) {
  const [stageIndex, setStageIndex] = useState<number | null>(initialState ? (initialStageIndex ?? 0) : null)
  const [game, setGame] = useState<RobotRouteState | null>(initialState ?? null)
  const clearRecorded = useRef(false)
  const stage = stageIndex === null ? null : ROBOT_STAGES[stageIndex]
  const finalStageCleared = Boolean(stage && game?.status === 'cleared' && stageIndex === ROBOT_STAGES.length - 1)

  useEffect(() => {
    if (!finalStageCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('robot-route', storage)
  }, [finalStageCleared, storage])

  const begin = () => {
    clearRecorded.current = false
    setStageIndex(0)
    setGame(startRobotStage(ROBOT_STAGES[0]))
  }

  const act = (action: RobotRouteAction) => {
    if (!stage || !game) return
    setGame(applyRobotAction(stage, game, action).state)
  }

  const resetStage = () => {
    if (!stage) return
    setGame(startRobotStage(stage))
  }

  const nextStage = () => {
    if (stageIndex === null) return
    const nextIndex = stageIndex + 1
    const next = ROBOT_STAGES[nextIndex]
    if (!next) return
    setStageIndex(nextIndex)
    setGame(startRobotStage(next))
  }

  if (!stage || !game) {
    return (
      <PageLayout title="ロボット GO！">
        <div className="robot-intro">
          <div className="robot-intro__scene" aria-hidden="true">🤖 ➡️ 🔋 ➡️ 🚀</div>
          <p>うごきを よやくして、ロボットを ロケットまで つれていこう！</p>
          <p>かべに あたったら、ならびを かえて もういちど！</p>
          <button type="button" className="primary-button" onClick={begin}>ミッション スタート</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const trace = new Set(game.trace)
  const collected = new Set(game.collectedBatteryIndexes)
  const stars = game.status === 'cleared' ? calculateRobotStars(stage, game) : 0

  return (
    <PageLayout title="ロボット GO！">
      <div className="robot-page">
        <div className="robot-hud">
          <span>🛰️ {stageIndex! + 1} / {ROBOT_STAGES.length}</span>
          <strong>{stage.name}</strong>
          <span aria-label={`${game.attemptCount}かい しゅっぱつ`}>🚩 {game.attemptCount}</span>
        </div>

        <div
          className="robot-board"
          role="grid"
          aria-label="ロボットの フィールド"
          style={{ gridTemplateColumns: `repeat(${stage.width}, 1fr)`, aspectRatio: `${stage.width} / ${stage.height}` }}
        >
          {Array.from({ length: stage.width * stage.height }, (_, index) => {
            const isWall = stage.wallIndexes.includes(index)
            const isBattery = stage.batteryIndexes.includes(index) && !collected.has(index)
            const isGoal = index === stage.goalIndex
            const isRobot = index === game.position
            return (
              <div
                key={index}
                role="gridcell"
                className={`robot-cell${isWall ? ' robot-cell--wall' : ''}${trace.has(index) ? ' robot-cell--trace' : ''}`}
                aria-label={isRobot ? 'ロボット' : isWall ? 'かべ' : isBattery ? 'でんち' : isGoal ? 'ロケット' : 'みち'}
              >
                {trace.has(index) && !isRobot && <span className="robot-trace" aria-hidden="true">•</span>}
                {isWall && <span aria-hidden="true">🧱</span>}
                {isGoal && <span className="robot-goal" aria-hidden="true">🚀</span>}
                {isBattery && <span className="robot-battery" aria-hidden="true">🔋</span>}
                {isRobot && <span className="robot-player" aria-hidden="true">🤖</span>}
              </div>
            )
          })}
        </div>

        {game.status === 'planning' && (
          <>
            <section className="robot-command-queue" aria-label="うごきの よやく">
              {game.commands.length > 0 ? game.commands.map((command, index) => <span key={index}>{COMMAND_SYMBOL[command]}</span>) : <small>ここに うごきを ならべよう</small>}
            </section>
            <div className="robot-command-buttons" aria-label="うごきを ついか">
              {(['up', 'right', 'down', 'left'] as const).map((command) => (
                <button key={command} type="button" aria-label={`${COMMAND_LABEL[command]}を ついか`} onClick={() => act({ type: 'add-command', command })}>{COMMAND_SYMBOL[command]}</button>
              ))}
            </div>
            <div className="robot-edit-buttons">
              <button type="button" onClick={() => act({ type: 'remove-last-command' })}>ひとつ もどす</button>
              <button type="button" onClick={() => act({ type: 'clear-commands' })}>ぜんぶ けす</button>
            </div>
            <button type="button" className="robot-launch" aria-label="ロボット しゅっぱつ" disabled={game.commands.length === 0} onClick={() => act({ type: 'run' })}>▶ ロボット しゅっぱつ</button>
          </>
        )}

        {game.status === 'failed' && (
          <section className="robot-failed" aria-live="polite">
            <div aria-hidden="true">🤖💭</div>
            <h2>{failureMessage(game)}</h2>
            <p>{game.trace.length - 1}マス すすめたよ</p>
            <button type="button" className="primary-button" onClick={() => act({ type: 'retry' })}>もういちど かんがえる</button>
          </section>
        )}

        {game.status === 'cleared' && (
          <section className="robot-clear" aria-live="polite">
            <div aria-hidden="true">🤖🎉🚀</div>
            <h2>{finalStageCleared ? 'ロボット マスター！' : 'ミッション クリア！'}</h2>
            <p className="robot-clear__stars">{'⭐'.repeat(stars)}</p>
            {finalStageCleared ? (
              <button type="button" className="primary-button" onClick={begin}>もういちど</button>
            ) : (
              <button type="button" className="primary-button" onClick={nextStage}>つぎの ミッション</button>
            )}
            <Link to="/play">あそびへ戻る</Link>
          </section>
        )}

        {game.status !== 'cleared' && (
          <div className="robot-page-actions">
            <button type="button" onClick={resetStage}>やりなおす</button>
            <button type="button" onClick={() => { setStageIndex(null); setGame(null) }}>おわる</button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
