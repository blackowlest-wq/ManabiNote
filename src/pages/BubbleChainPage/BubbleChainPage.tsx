import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyBubbleChainAction, BUBBLE_CHAIN_STAGES, calculateBubbleChainResult, startBubbleChain, type BubbleChainState } from '../../features/bubble-chain/model/bubbleChain'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

export function BubbleChainPage({ storage, initialState }: { storage?: Storage; initialState?: BubbleChainState } = {}) {
  const [game, setGame] = useState<BubbleChainState | null>(initialState ?? null); const [feedback, setFeedback] = useState('どこから れんさを はじめる？'); const recorded = useRef(false)
  const result = useMemo(() => game?.status === 'finished' ? calculateBubbleChainResult(game) : null, [game])
  useEffect(() => { if (result?.isCleared && !recorded.current) { recorded.current = true; markGameCleared('bubble-chain', storage) } }, [result, storage])
  const begin = () => { recorded.current = false; setGame(startBubbleChain()); setFeedback('どこから れんさを はじめる？') }
  const act = (action: Parameters<typeof applyBubbleChainAction>[1]) => { if (!game) return; const t = applyBubbleChainAction(game, action); const chain = t.events.find(e => e.type === 'chain'); if (t.events.some(e => e.type === 'stage-won')) setFeedback('ぜんぶ はじけた！'); else if (chain?.type === 'chain') setFeedback(chain.count > 1 ? `${chain.count}こ れんさ！` : 'あと すこし！'); setGame(t.state) }
  if (!game) return <PageLayout title="ぽんぽん バブルれんさ"><div className="bubble-chain-center"><div className="bubble-chain-scene">🫧✨🫧✨🫧</div><p>ひとつ はじけると となりへ ぽん！ ぜんぶの バブルを れんささせよう。</p><button className="primary-button" onClick={begin}>バブルの うみへ</button><Link to="/play">あそびへ戻る</Link></div></PageLayout>
  if (result) return <PageLayout title="ぽんぽん バブルれんさ"><div className="bubble-chain-center"><div className="bubble-chain-scene">🫧🎉🏆🎉🫧</div><h2>バブルれんさ マスター！</h2><p className="bubble-chain-score">{result.score} てん</p><button className="primary-button" onClick={begin}>もういちど</button><Link to="/play">あそびへ戻る</Link></div></PageLayout>
  const stage = BUBBLE_CHAIN_STAGES[game.stageIndex]; const won = game.status === 'stage-won'
  return <PageLayout title="ぽんぽん バブルれんさ"><div className="bubble-chain-center"><div className="bubble-chain-hud"><span>🫧 {game.stageIndex + 1} / 6</span><span>👆 {game.moveCount}</span><span>⭐ {game.totalStars}</span></div><b>{stage.name}</b><div className="bubble-chain-grid" style={{ gridTemplateColumns: `repeat(${stage.size}, 1fr)` }}>{game.strengths.map((n, i) => <button key={i} aria-label={`バブル ${i + 1}、あと ${n}`} disabled={!n || won} className={`bubble-chain-bubble bubble-chain-bubble--${n}`} onClick={() => act({ type: 'tap-bubble', index: i })}><span>{n || '✨'}</span></button>)}</div><p className="bubble-chain-feedback">{feedback}</p>{!won && <div className="bubble-chain-tools"><button disabled={!game.history.length} onClick={() => act({ type: 'undo' })}>↩ もどる</button><button onClick={() => act({ type: 'reset-stage' })}>🔄 はじめから</button></div>}{won && <section className="bubble-chain-clear"><h2>ぜんぶ はじけた！</h2><span>{'⭐'.repeat(game.stageStars)}</span><button className="primary-button" onClick={() => act({ type: 'next-stage' })}>つぎの バブル</button></section>}<button className="bubble-chain-quit" onClick={() => setGame(null)}>うみを でる</button></div></PageLayout>
}
