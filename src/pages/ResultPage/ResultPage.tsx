import { Link } from 'react-router-dom'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PerfectResultCelebration } from './PerfectResultCelebration'

export function ResultPage() {
  const { result } = useQuizSession()

  if (!result || !result.answers.length) {
    return <PageLayout title="けっか"><p>結果を表示できません</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const score = result.answers.filter((answer) => answer.isCorrect).length
  return (
    <PageLayout title="けっか" completedGameId="quiz">
      <p>{score} / {result.questions.length}</p>
      {score === result.questions.length && <PerfectResultCelebration />}
      <ul>
        {result.answers.map((answer) => (
          <li key={answer.questionId}>
            <span>{answer.kana}</span>：<span>{answer.isCorrect ? '正解' : '不正解'}</span>
          </li>
        ))}
      </ul>
      <p><Link to="/">もういちど</Link></p>
      <p><Link to="/history">クリア状況を見る</Link></p>
    </PageLayout>
  )
}
