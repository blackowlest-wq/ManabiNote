import type { GameEvent } from './model/rescueMaze'

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

const toneFor = (event: GameEvent): { frequency: number; duration: number } | null => {
  switch (event.type) {
    case 'animal-rescued':
      return { frequency: 660, duration: 0.16 }
    case 'key-collected':
    case 'treasure-collected':
      return { frequency: 880, duration: 0.12 }
    case 'door-opened':
    case 'bridge-activated':
      return { frequency: 520, duration: 0.14 }
    case 'box-pushed':
      return { frequency: 360, duration: 0.1 }
    case 'player-caught':
    case 'door-locked':
    case 'bridge-blocked':
    case 'exit-blocked':
      return { frequency: 220, duration: 0.12 }
    case 'stage-cleared':
      return { frequency: 990, duration: 0.28 }
    case 'undone':
    case 'restarted':
      return null
  }
}

export function playRescueSound(event: GameEvent | undefined) {
  if (!event || typeof window === 'undefined') return
  const tone = toneFor(event)
  if (!tone) return

  try {
    const audioWindow = window as AudioWindow
    const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
    if (!AudioContextConstructor) return
    const context = new AudioContextConstructor()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(tone.frequency, context.currentTime)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + tone.duration)
    oscillator.addEventListener('ended', () => void context.close(), { once: true })
  } catch {
    // 音を出せない環境でも、ゲーム進行は継続する。
  }
}
