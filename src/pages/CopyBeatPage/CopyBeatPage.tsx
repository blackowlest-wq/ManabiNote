import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyCopyBeatAction,
  calculateCopyBeatResult,
  COPY_BEAT_CLEAR_ROUND,
  COPY_BEAT_PADS,
  startCopyBeat,
  type CopyBeatPad,
  type CopyBeatState,
} from '../../features/copy-beat/model/copyBeat'
import { PageLayout } from '../../shared/components/PageLayout'

export type CopyBeatPageProps = {
  storage?: Storage
  random?: () => number
  initialState?: CopyBeatState
  beatMilliseconds?: number
}

const PAD_INFO: Readonly<Record<CopyBeatPad, { name: string; emoji: string; tone: number }>> = {
  sun: { name: 'おひさま', emoji: '☀️', tone: 262 },
  moon: { name: 'おつきさま', emoji: '🌙', tone: 330 },
  star: { name: 'おほしさま', emoji: '⭐', tone: 392 },
  leaf: { name: 'はっぱ', emoji: '🍀', tone: 523 },
}

export function CopyBeatPage({
  storage,
  random = Math.random,
  initialState,
  beatMilliseconds = 560,
}: CopyBeatPageProps = {}) {
  const [game, setGame] = useState<CopyBeatState | null>(initialState ?? null)
  const [activePad, setActivePad] = useState<CopyBeatPad | null>(null)
  const [feedback, setFeedback] = useState('ひかる じゅんばんを まねしよう！')
  const audioContext = useRef<AudioContext | null>(null)
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game && (game.status === 'finished' || game.status === 'lost') ? calculateCopyBeatResult(game) : null,
    [game],
  )

  const playTone = (pad: CopyBeatPad) => {
    const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) return
    const context = audioContext.current ?? new AudioContextConstructor()
    audioContext.current = context
    if (context.state === 'suspended') void context.resume()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = PAD_INFO[pad].tone
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(.14, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .22)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + .23)
  }

  useEffect(() => {
    if (!game || game.status !== 'showing') return
    setFeedback('みて おぼえよう！')
    const timers: number[] = []
    game.sequence.forEach((pad, index) => {
      timers.push(window.setTimeout(() => {
        setActivePad(pad)
        playTone(pad)
      }, index * beatMilliseconds))
      timers.push(window.setTimeout(() => setActivePad(null), index * beatMilliseconds + beatMilliseconds * .62))
    })
    timers.push(window.setTimeout(() => {
      setFeedback('おなじ じゅんばんで タップ！')
      setGame((current) => current ? applyCopyBeatAction(current, { type: 'finish-showing' }).state : current)
    }, game.sequence.length * beatMilliseconds))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [game?.status, game?.sequence, beatMilliseconds])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('copy-beat', storage)
  }, [result, storage])

  useEffect(() => () => {
    void audioContext.current?.close()
  }, [])

  const begin = () => {
    clearRecorded.current = false
    setActivePad(null)
    setFeedback('みて おぼえよう！')
    setGame(startCopyBeat(random))
  }

  const tapPad = (pad: CopyBeatPad) => {
    if (!game || game.status !== 'input') return
    setActivePad(pad)
    window.setTimeout(() => setActivePad(null), 160)
    playTone(pad)
    const transition = applyCopyBeatAction(game, { type: 'tap-pad', pad }, random)
    if (transition.events.some((event) => event.type === 'pattern-replay')) {
      setFeedback('もういちど きいてみよう！')
    } else if (transition.state.status === 'round-won') {
      setFeedback('ビート ばっちり！')
    }
    setGame(transition.state)
  }

  const nextRound = () => {
    if (!game) return
    setFeedback('つぎは 1ぱく ふえるよ！')
    setGame(applyCopyBeatAction(game, { type: 'next-round' }, random).state)
  }

  if (!game) {
    return (
      <PageLayout title="まねっこビート">
        <div className="beat-intro">
          <div className="beat-intro__scene" aria-hidden="true">🎵 ☀️ 🌙 ⭐ 🍀 🎵</div>
          <p>ひかった パッドを おぼえて、おなじ じゅんばんで タップ！</p>
          <p>ビートは すこしずつ ながくなるよ</p>
          <button type="button" className="primary-button" onClick={begin}>ライブ スタート</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="まねっこビート">
        <div className="beat-result">
          <div className="beat-result__scene" aria-hidden="true">{result.isCleared ? '🎉🎵🏆🎵🎉' : '🌙🎵✨'}</div>
          <h2>{result.isCleared ? 'ライブ だいせいこう！' : 'アンコール まってるよ！'}</h2>
          <p className="beat-result__score">{result.score} てん</p>
          <p>{result.round}ラウンド ・ さいだい {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={begin}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="まねっこビート">
      <div className="beat-page">
        <div className="beat-hud">
          <span>🎼 {game.round} / {COPY_BEAT_CLEAR_ROUND}</span>
          <span>💗 {game.hearts}</span>
          <span>⭐ {game.score}</span>
          <span>🔥 {game.combo}</span>
        </div>

        <div className="beat-stage">
          <div className="beat-speaker" aria-hidden="true">🔊</div>
          <div className="beat-message" role="status" aria-live="polite">{feedback}</div>
          <div className="beat-speaker" aria-hidden="true">🔊</div>
        </div>

        <div className="beat-progress" aria-label={`${game.inputIndex} / ${game.sequence.length}ぱく`}>
          {game.sequence.map((_, index) => <span key={index} className={index < game.inputIndex ? 'beat-progress__done' : ''} />)}
        </div>

        <div className="beat-pads" aria-label="ビートパッド">
          {COPY_BEAT_PADS.map((pad) => (
            <button
              key={pad}
              type="button"
              className={`beat-pad beat-pad--${pad}${activePad === pad ? ' beat-pad--active' : ''}`}
              aria-label={`${PAD_INFO[pad].name}パッド`}
              disabled={game.status !== 'input'}
              onClick={() => tapPad(pad)}
            >
              <span aria-hidden="true">{PAD_INFO[pad].emoji}</span>
            </button>
          ))}
        </div>

        {game.status === 'round-won' && (
          <section className="beat-round-clear" aria-live="polite">
            <h2>ビート ばっちり！</h2>
            <span aria-hidden="true">✨🎵✨</span>
            <button type="button" className="primary-button" onClick={nextRound}>つぎの ビート</button>
          </section>
        )}

        <button type="button" className="beat-quit" onClick={() => setGame(null)}>ライブを おわる</button>
      </div>
    </PageLayout>
  )
}
