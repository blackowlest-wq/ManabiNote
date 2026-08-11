import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { applyAnimalTowerAction, calculateAnimalTowerResult, startAnimalTower, TOWER_FLOOR_GOAL, type AnimalTowerState } from '../../features/animal-tower/model/animalTower'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

const ANIMALS = ['🐻', '🐰', '🐼', '🦊', '🐸', '🐨', '🐯', '🐧', '🦁']

export function AnimalTowerPage({ storage, initialState }: { storage?: Storage; initialState?: AnimalTowerState } = {}) {
  const [game, setGame] = useState<AnimalTowerState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('まんなかで タップして おとそう！')
  const recorded = useRef(false)
  const result = useMemo(() => game && (game.status === 'finished' || game.status === 'lost') ? calculateAnimalTowerResult(game) : null, [game])

  useEffect(() => {
    if (game?.status !== 'playing') return
    const timer = window.setInterval(() => setGame(current => current ? applyAnimalTowerAction(current, { type: 'tick' }).state : current), Math.max(95, 220 - game.floor * 15))
    return () => window.clearInterval(timer)
  }, [game?.floor, game?.status])

  useEffect(() => {
    if (result?.isCleared && !recorded.current) { recorded.current = true; markGameCleared('animal-tower', storage) }
  }, [result, storage])

  const begin = () => { recorded.current = false; setGame(startAnimalTower()); setFeedback('まんなかで タップして おとそう！') }
  const drop = () => {
    if (!game) return
    const transition = applyAnimalTowerAction(game, { type: 'drop' })
    if (transition.events.some(event => event.type === 'tower-finished')) setFeedback('てっぺんまで ついた！')
    else if (transition.events.some(event => event.type === 'floor-missed')) setFeedback('おっとっと！ つぎは よくみて')
    else if (transition.events.some(event => event.type === 'floor-landed')) setFeedback('ぴたっ！ そのちょうし！')
    setGame(transition.state)
  }

  if (!game) return <PageLayout title="ぐらぐら どうぶつタワー"><div className="animal-tower-center"><div className="animal-tower-scene">🐻<br />🐰 🐼<br />🧱🧱🧱</div><p>うごく ブロックを おとして、どうぶつの タワーを てっぺんまで つもう！</p><button type="button" className="primary-button" onClick={begin}>タワーを つくる</button><Link to="/play">あそびへ戻る</Link></div></PageLayout>

  if (result) return <PageLayout title="ぐらぐら どうぶつタワー"><div className="animal-tower-center"><div className="animal-tower-result-scene">{result.isCleared ? '🗼🎉🏆🎉🗼' : '🧱💨😵💨🧱'}</div><h2>{result.isCleared ? 'タワー マスター！' : 'タワーが くずれちゃった！'}</h2><p className="animal-tower-score">{result.score} てん</p><p>{result.floors}だん つめたよ</p><button type="button" className="primary-button" onClick={begin}>もういちど</button><Link to="/play">あそびへ戻る</Link></div></PageLayout>

  return <PageLayout title="ぐらぐら どうぶつタワー"><div className="animal-tower-center"><div className="animal-tower-hud"><span>🏗️ {game.floor} / {TOWER_FLOOR_GOAL}</span><span>💗 {game.hearts}</span><span>🔥 {game.combo}</span><span>⭐ {game.score}</span></div><div className="animal-tower-field" aria-label="どうぶつの タワー">{game.landed.map((block, index) => <div key={index} className="animal-tower-block animal-tower-block--landed" style={{ left: `${block.x * 10}%`, width: `${block.width * 10}%`, bottom: `${index * 2.05}rem` }}><span aria-hidden="true">{ANIMALS[index % ANIMALS.length]}</span></div>)}<div className="animal-tower-block animal-tower-block--moving" style={{ left: `${game.moving.x * 10}%`, width: `${game.moving.width * 10}%`, bottom: `${game.landed.length * 2.05 + 1.2}rem` }}><span aria-hidden="true">{ANIMALS[game.landed.length % ANIMALS.length]}</span></div><div className="animal-tower-ground" aria-hidden="true">🌳　　　　　　　　🌳</div></div><p className="animal-tower-feedback" role="status">{feedback}</p><button type="button" className="animal-tower-drop" aria-label="ブロックを おとす" onClick={drop}>⬇<small>おとす！</small></button><button type="button" className="animal-tower-quit" onClick={() => setGame(null)}>タワーを やめる</button></div></PageLayout>
}
