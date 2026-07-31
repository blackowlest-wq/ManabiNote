import { Link, useNavigate } from 'react-router-dom'
import { getStrokeRow } from '../../features/question-types/kana-to-stroke/model/kanaRows'
import { useStrokePractice } from '../../features/stroke-order/StrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function StrokeResultPage() {
  const navigate = useNavigate()
  const { session, startPractice } = useStrokePractice()

  if (!session || session.status !== 'complete') {
    return (
      <PageLayout title="れんしゅう結果">
        <p>結果を表示できません。</p>
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startPractice(session.rowId)) navigate('/stroke-order')
  }

  return (
    <PageLayout title="れんしゅう結果">
      <h2>{getStrokeRow(session.rowId).label}の {session.questions.length}もじ できたよ</h2>
      <ul className="stroke-result-list">
        {session.questions.map((question, index) => (
          <li key={question.id}>
            {question.kana}：{session.attempts[index]}回 なぞったよ
          </li>
        ))}
      </ul>
      <PrimaryButton onClick={handleRetry}>もう一度れんしゅう</PrimaryButton>
      <p><Link to="/">ホームへ戻る</Link></p>
    </PageLayout>
  )
}
