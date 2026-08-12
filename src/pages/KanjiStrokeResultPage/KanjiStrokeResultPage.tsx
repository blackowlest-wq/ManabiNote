import { Link, useNavigate } from 'react-router-dom'
import { useKanjiStrokePractice } from '../../features/stroke-order/KanjiStrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiStrokeResultPage() {
  const navigate = useNavigate()
  const { session, resetPractice } = useKanjiStrokePractice()

  if (!session || session.status !== 'complete') {
    return (
      <PageLayout title="かんじの 書き順結果">
        <p>結果を表示できません。</p>
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    resetPractice()
    navigate('/kanji-stroke-order')
  }

  return (
    <PageLayout title="かんじの 書き順結果" completedGameId="kanji-stroke-order">
      <h2>かんじの れんしゅう おわり！</h2>
      <p>{session.questions.length}もじ できたね！</p>
      <ul className="stroke-result-list">
        {session.questions.map((question, index) => (
          <li key={question.id}>
            {question.kanji}：{session.attempts[index]}回 なぞったよ
          </li>
        ))}
      </ul>
      <PrimaryButton onClick={handleRetry}>もう一度れんしゅう</PrimaryButton>
      <p><Link to="/kanji">かんじの メニューへ</Link></p>
    </PageLayout>
  )
}
