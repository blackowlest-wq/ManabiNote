import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  ALL_HELPERS,
  applyHelperTeamAction,
  calculateHelperTeamResult,
  HELPER_TEAM_STAGES,
  startHelperTeam,
  type HelperKind,
  type HelperTeamState,
  type ObstacleKind,
} from '../../features/helper-team/model/helperTeam'
import { PageLayout } from '../../shared/components/PageLayout'

export type HelperTeamPageProps = { storage?: Storage; initialState?: HelperTeamState }

const HELPER: Readonly<Record<HelperKind, { name: string; icon: string; ability: ObstacleKind }>> = {
  beaver: { name: 'ビーバー', icon: '🦫', ability: 'river' },
  rabbit: { name: 'うさぎ', icon: '🐇', ability: 'fence' },
  elephant: { name: 'ぞう', icon: '🐘', ability: 'boulder' },
  mole: { name: 'もぐら', icon: '🐹', ability: 'cave' },
  monkey: { name: 'さる', icon: '🐒', ability: 'canopy' },
}

const OBSTACLE: Readonly<Record<ObstacleKind, { name: string; icon: string }>> = {
  river: { name: 'かわ', icon: '🌊' }, fence: { name: 'さく', icon: '🚧' },
  boulder: { name: 'おおいわ', icon: '🪨' }, cave: { name: 'ほらあな', icon: '⛰️' },
  canopy: { name: 'たかい き', icon: '🌴' },
}

export function HelperTeamPage({ storage, initialState }: HelperTeamPageProps = {}) {
  const [game, setGame] = useState<HelperTeamState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('みちの じゅんばんに なかまを ならべよう！')
  const clearRecorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateHelperTeamResult(game) : null, [game])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('helper-team', storage)
  }, [result, storage])

  const begin = () => {
    clearRecorded.current = false
    setFeedback('みちの じゅんばんに なかまを ならべよう！')
    setGame(startHelperTeam())
  }

  const act = (action: Parameters<typeof applyHelperTeamAction>[1]) => {
    if (!game) return
    const transition = applyHelperTeamAction(game, action)
    if (transition.events.some((event) => event.type === 'stage-won')) setFeedback('みんなの ちからで ゴール！')
    else if (transition.events.some((event) => event.type === 'helper-blocked')) setFeedback('ここでは べつの なかまの ちからが ひつよう！')
    else if (transition.events.some((event) => event.type === 'helper-added')) setFeedback('たいれつに はいったよ')
    else if (action.type === 'remove-helper') setFeedback('たいれつから もどしたよ')
    else if (action.type === 'retry') setFeedback('じゅんばんを かえて もういちど！')
    setGame(transition.state)
  }

  if (!game) return <PageLayout title="どうぶつ おたすけ隊">
    <div className="helper-team-intro">
      <div className="helper-team-intro__scene" aria-hidden="true">🐇 🦫 🐘 🐹 🐒</div>
      <p>とくいな ちからを もつ なかまを じゅんばんに ならべて、みんなで もりを すすもう！</p>
      <div className="helper-team-intro__powers" aria-hidden="true"><span>🦫→🌊</span><span>🐇→🚧</span><span>🐘→🪨</span></div>
      <button type="button" className="primary-button" onClick={begin}>ぼうけんへ しゅっぱつ</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  if (result) return <PageLayout title="どうぶつ おたすけ隊">
    <div className="helper-team-result">
      <div className="helper-team-result__scene" aria-hidden="true">🐇🦫🐘✨🏆✨🐹🐒</div>
      <h2>おたすけ隊 マスター！</h2>
      <p className="helper-team-result__score">{result.score} てん</p>
      <p>{result.totalStars}この ほしを あつめた</p>
      <button type="button" className="primary-button" onClick={begin}>もういちど</button>
      <Link to="/play">あそびへ戻る</Link>
    </div>
  </PageLayout>

  const stage = HELPER_TEAM_STAGES[game.stageIndex]
  const completed = game.status === 'stage-won'

  return <PageLayout title="どうぶつ おたすけ隊">
    <div className="helper-team-page">
      <div className="helper-team-hud">
        <span>🗺️ {game.stageIndex + 1} / {HELPER_TEAM_STAGES.length}</span>
        <span>🚩 {game.attempts}</span>
        <span>⭐ {game.totalStars}</span>
      </div>
      <div className="helper-team-stage-name">{stage.name}</div>

      <section className="helper-team-route" aria-label="ぼうけんの みち">
        <span className="helper-team-home" aria-hidden="true">🏕️</span>
        {stage.obstacles.map((obstacle, index) => <div key={`${obstacle}-${index}`} className={`helper-team-obstacle${index < game.passedCount ? ' helper-team-obstacle--passed' : game.status === 'failed' && index === game.passedCount ? ' helper-team-obstacle--blocked' : ''}`}>
          <span aria-hidden="true">{OBSTACLE[obstacle].icon}</span><small>{OBSTACLE[obstacle].name}</small>
        </div>)}
        <span className="helper-team-goal" aria-hidden="true">🏰</span>
      </section>

      {game.status === 'planning' && <>
        <section className="helper-team-plan" aria-label="おたすけ隊の じゅんばん">
          {stage.obstacles.map((_, index) => {
            const helper = game.plan[index]
            return helper
              ? <button key={index} type="button" aria-label={`${HELPER[helper].name}を たいれつから はずす`} onClick={() => act({ type: 'remove-helper', index })}>
                  <small>{index + 1}</small><span aria-hidden="true">{HELPER[helper].icon}</span><i aria-hidden="true">→{OBSTACLE[HELPER[helper].ability].icon}</i>
                </button>
              : <div key={index} className="helper-team-plan__empty"><small>{index + 1}</small><span aria-hidden="true">？</span></div>
          })}
        </section>

        <div className="helper-team-bench">
          {ALL_HELPERS.map((helper) => <button key={helper} type="button" aria-label={`${HELPER[helper].name}を チームに いれる`} disabled={game.plan.includes(helper) || game.plan.length >= stage.obstacles.length} onClick={() => act({ type: 'add-helper', helper })}>
            <span aria-hidden="true">{HELPER[helper].icon}</span><small>{HELPER[helper].name}</small><i aria-hidden="true">→ {OBSTACLE[HELPER[helper].ability].icon}</i>
          </button>)}
        </div>

        <button type="button" className="primary-button helper-team-run" disabled={game.plan.length !== stage.obstacles.length} onClick={() => act({ type: 'run-team' })}>チームで しゅっぱつ</button>
      </>}

      {game.status === 'failed' && <section className="helper-team-stopped" aria-live="polite">
        <div aria-hidden="true">{game.plan.map((helper) => HELPER[helper].icon).join(' ')} 💥</div>
        <h2>ここで とまった！</h2>
        <p>{game.passedCount + 1}ばんめの なかまを かえてみよう</p>
        <button type="button" className="primary-button" onClick={() => act({ type: 'retry' })}>たいれつを なおす</button>
      </section>}

      {completed && <section className="helper-team-stage-clear" aria-live="polite">
        <div aria-hidden="true">{game.plan.map((helper) => HELPER[helper].icon).join(' ')} 🎉</div>
        <h2>ぼうけん せいこう！</h2>
        <span aria-hidden="true">{'⭐'.repeat(game.stageStars)}</span>
        <button type="button" className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの みち</button>
      </section>}

      <p className="helper-team-feedback" role="status" aria-live="polite">{feedback}</p>
      <button type="button" className="helper-team-quit" onClick={() => setGame(null)}>ぼうけんを やめる</button>
    </div>
  </PageLayout>
}
