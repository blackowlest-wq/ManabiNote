import { Link, useNavigate } from 'react-router-dom'
import { useKanjiChoiceSession } from '../../features/kanji-choice/KanjiChoiceSessionProvider'
import { isKanjiChoiceComplete } from '../../features/kanji-choice/model/kanjiChoiceSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiChoiceResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useKanjiChoiceSession()

  if (!session || !isKanjiChoiceComplete(session)) {
    return (
      <PageLayout title="かんじの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/kanji-choice')
  }

  return (
    <PageLayout title="かんじの けっか" completedGameId="kanji-choice">
      <div className="kanji-choice-result">
        <h2>かんじえらび おわり！</h2>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/kanji">かんじの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
