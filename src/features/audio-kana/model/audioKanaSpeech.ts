export function speakKana(kana: string): boolean {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) return false

  const utterance = new SpeechSynthesisUtterance(kana)
  utterance.lang = 'ja-JP'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
