import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { appendHistory } from '../../features/history/model/historyStorage'
import type { HistoryRecord } from '../../features/history/model/historyTypes'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'

export function ResultPage() {
  const { result } = useQuizSession()
  const savedResultId = useRef<string | null>(null)

  useEffect(() => {
    if (!result || !result.answers.length || savedResultId.current === result.id) return
    const historyRecord: HistoryRecord = {
      id: result.id,
      questionType: result.questionType,
      startedAt: result.startedAt,
      score: result.answers.filter((answer) => answer.isCorrect).length,
      total: result.questions.length,
      answers: [...result.answers],
    }
    appendHistory(historyRecord)
    savedResultId.current = result.id
  }, [result])

  if (!result || !result.answers.length) {
    return <main><p>結果を表示できません</p><Link to="/">ホームへ戻る</Link></main>
  }

  const score = result.answers.filter((answer) => answer.isCorrect).length
  return (
    <main>
      <h1>けっか</h1>
      <p>{score} / {result.questions.length}</p>
      <ul>
        {result.answers.map((answer) => (
          <li key={answer.questionId}>
            <span>{answer.kana}</span>：<span>{answer.isCorrect ? '正解' : '不正解'}</span>
          </li>
        ))}
      </ul>
      <p><Link to="/">もういちど</Link></p>
      <p><Link to="/history">履歴を見る</Link></p>
    </main>
  )
}
