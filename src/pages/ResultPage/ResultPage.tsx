import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appendHistory } from '../../features/history/model/historyStorage'
import type { HistoryRecord } from '../../features/history/model/historyTypes'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PerfectResultCelebration } from './PerfectResultCelebration'

export function ResultPage() {
  const { result, savedResultId, markResultSaved } = useQuizSession()

  useEffect(() => {
    if (!result || !result.answers.length || savedResultId === result.id) return
    const historyRecord: HistoryRecord = {
      id: result.id,
      questionType: result.questionType,
      startedAt: result.startedAt,
      score: result.answers.filter((answer) => answer.isCorrect).length,
      total: result.questions.length,
      answers: [...result.answers],
    }
    appendHistory(historyRecord)
    markResultSaved(result.id)
  }, [result, savedResultId, markResultSaved])

  if (!result || !result.answers.length) {
    return <PageLayout title="けっか"><p>結果を表示できません</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const score = result.answers.filter((answer) => answer.isCorrect).length
  return (
    <PageLayout title="けっか">
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
      <p><Link to="/history">履歴を見る</Link></p>
    </PageLayout>
  )
}
