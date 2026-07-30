import { Link, useNavigate } from 'react-router-dom'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'

export function HomePage() {
  const navigate = useNavigate()
  const { startSession, error } = useQuizSession()

  const handleStart = () => {
    startSession()
    navigate('/quiz')
  }

  return (
    <main>
      <h1>ManabiNote</h1>
      <p>ひらがなと えを おぼえよう</p>
      <button type="button" onClick={handleStart}>学習をはじめる</button>
      <p><Link to="/history">履歴を見る</Link></p>
      {error && <p role="alert">問題を読み込めませんでした。</p>}
    </main>
  )
}
