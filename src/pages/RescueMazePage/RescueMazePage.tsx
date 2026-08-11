import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RescueMazeBoard } from '../../features/rescue-maze/components/RescueMazeBoard'
import { playRescueSound } from '../../features/rescue-maze/rescueSound'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { loadRescueProgress, recordStageResult } from '../../features/rescue-maze/model/rescueProgressStorage'
import {
  applyAction,
  calculateResult,
  startStage,
  type Direction,
  type AnimalEntity,
  type GameEvent,
  type PlayerAction,
  type RescueState,
  type StageDefinition,
  type StageResult,
} from '../../features/rescue-maze/model/rescueMaze'
import { RESCUE_MAZE_STAGES } from '../../features/rescue-maze/model/stages'
import { PageLayout } from '../../shared/components/PageLayout'

export type RescueMazePageProps = {
  storage?: Storage
}

const STAGE_IDS = RESCUE_MAZE_STAGES.map((stage) => stage.id)

export function RescueMazePage({ storage }: RescueMazePageProps = {}) {
  const [progress, setProgress] = useState(() => loadRescueProgress(storage, STAGE_IDS))
  const [stage, setStage] = useState<StageDefinition | null>(null)
  const [session, setSession] = useState<RescueState | null>(null)
  const [feedback, setFeedback] = useState('となりの マスを タップして すすもう')
  const [result, setResult] = useState<StageResult | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const selectStage = (selectedStage: StageDefinition) => {
    setStage(selectedStage)
    setSession(startStage(selectedStage))
    setFeedback('となりの マスを タップして すすもう')
    setResult(null)
    setSaveError(null)
  }

  const eventMessage = (events: readonly GameEvent[]) => {
    const event = events[events.length - 1]
    if (!event || !stage) return null
    switch (event.type) {
      case 'animal-rescued': {
        const animal = stage.entities.find(
          (entity): entity is AnimalEntity => entity.kind === 'animal' && entity.id === event.animalId,
        )
        return `${animal?.label ?? 'どうぶつ'}を たすけた！`
      }
      case 'key-collected':
        return 'かぎを みつけた！'
      case 'door-opened':
        return 'とびらが ひらいた！'
      case 'door-locked':
        return 'この とびらの かぎを さがそう'
      case 'treasure-collected':
        return 'たからものを みつけた！'
      case 'bridge-activated':
        return 'はしが かかった！'
      case 'bridge-blocked':
        return 'スイッチで はしを かけよう'
      case 'box-pushed':
        return 'はこが うごいた！'
      case 'exit-blocked':
        return 'まだ たすけを まっているよ'
      case 'player-caught':
        return 'あぶない！ ひとつまえに もどったよ'
      case 'undone':
        return 'ひとつ もどったよ'
      case 'restarted':
        return 'もういちど はじめよう'
      case 'stage-cleared':
        return 'みんな たすけた！'
    }
  }

  const performAction = (action: PlayerAction) => {
    if (!stage || !session) return
    const transition = applyAction(stage, session, action)
    setSession(transition.state)
    const message = eventMessage(transition.events)
    if (message) setFeedback(message)
    if (soundEnabled) playRescueSound(transition.events[transition.events.length - 1])

    if (transition.state.status === 'cleared' && session.status !== 'cleared') {
      const stageResult = calculateResult(stage, transition.state)
      const saved = recordStageResult(stageResult, STAGE_IDS, storage)
      setResult(stageResult)
      if (saved.ok) {
        setProgress(saved.progress)
        setSaveError(null)
      } else {
        setSaveError('きろくを ほぞんできませんでした')
      }
      if (stage.id === STAGE_IDS[STAGE_IDS.length - 1]) markGameCleared('rescue-maze', storage)
    }
  }

  const move = (direction: Direction) => performAction({ type: 'move', direction })

  const returnToStageSelect = () => {
    setStage(null)
    setSession(null)
    setResult(null)
    setFeedback('となりの マスを タップして すすもう')
  }

  return (
    <PageLayout title="どうぶつレスキュー">
      {!stage || !session ? (
        <div className="rescue-stage-select">
          <p className="rescue-stage-select__message">どうぶつたちを たすけに いこう！</p>
          <div className="rescue-stage-list" aria-label="ステージをえらぶ">
            {RESCUE_MAZE_STAGES.map((candidate, index) => {
              const unlocked = progress.unlockedStageIds.includes(candidate.id)
              const stampCount = progress.bestStampCountByStage[candidate.id] ?? 0
              return (
                <button
                  key={candidate.id}
                  className="rescue-stage-card"
                  type="button"
                  disabled={!unlocked}
                  aria-label={`ステージ ${index + 1} ${candidate.name}${unlocked ? '' : ' ロック中'}`}
                  onClick={() => selectStage(candidate)}
                >
                  <span className="rescue-stage-card__number">{unlocked ? index + 1 : '🔒'}</span>
                  <span className="rescue-stage-card__name">{unlocked ? candidate.name : '？？？'}</span>
                  <span className="rescue-stage-card__stamps" aria-label={`${stampCount}こ獲得`}>{'🐾'.repeat(stampCount)}{'○'.repeat(3 - stampCount)}</span>
                </button>
              )
            })}
          </div>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      ) : (
        <div className="rescue-maze-page">
          <h2>{stage.name}</h2>
          <div className="rescue-maze-hud" aria-label="ステージのようす">
            <span>🐾 {session.moves}ほ</span>
            <span>🛟 {session.rescuedAnimalIds.length} / {stage.entities.filter((entity) => entity.kind === 'animal').length}</span>
            <span>🔑 {session.inventoryKeyIds.length}</span>
            <button
              className="rescue-sound-toggle"
              type="button"
              aria-label={soundEnabled ? 'おとを きる' : 'おとを だす'}
              aria-pressed={!soundEnabled}
              onClick={() => setSoundEnabled((enabled) => !enabled)}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <RescueMazeBoard stage={stage} state={session} onMove={move} />
          <p className="rescue-maze-feedback" role="status" aria-live="polite">{feedback}</p>
          {saveError && <p role="alert">{saveError}</p>}
          <div className="rescue-maze-controls">
            <button type="button" disabled={session.history.length === 0 || session.status === 'cleared'} onClick={() => performAction({ type: 'undo' })}>↶ ひとつ もどす</button>
            <button type="button" onClick={() => performAction({ type: 'restart' })}>↻ やりなおす</button>
            <button type="button" onClick={returnToStageSelect}>☰ ステージ</button>
          </div>

          {result && (
            <div className="rescue-clear-overlay" role="dialog" aria-modal="true" aria-labelledby="rescue-clear-title">
              <div className="rescue-clear-card">
                <span className="rescue-clear-card__animal" aria-hidden="true">🎉</span>
                <h2 id="rescue-clear-title">ステージ クリア！</h2>
                <p className="rescue-clear-card__stamps" aria-label={`${result.stampCount}こ獲得`}>
                  {'🐾'.repeat(result.stampCount)}{'○'.repeat(result.maxStampCount - result.stampCount)}
                </p>
                <p>{result.moves}ほで たすけたよ</p>
                <div className="rescue-clear-card__actions">
                  {RESCUE_MAZE_STAGES[RESCUE_MAZE_STAGES.findIndex((candidate) => candidate.id === stage.id) + 1] && (
                    <button
                      type="button"
                      onClick={() => selectStage(RESCUE_MAZE_STAGES[RESCUE_MAZE_STAGES.findIndex((candidate) => candidate.id === stage.id) + 1] as StageDefinition)}
                    >
                      つぎの ステージ
                    </button>
                  )}
                  <button type="button" onClick={() => selectStage(stage)}>もういちど</button>
                  <button type="button" onClick={returnToStageSelect}>ステージを えらぶ</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}
