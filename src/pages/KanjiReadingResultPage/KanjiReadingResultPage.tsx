import { Link, useNavigate } from 'react-router-dom'
import { useKanjiReadingSession } from '../../features/kanji-reading/KanjiReadingSessionProvider'
import { isKanjiReadingComplete } from '../../features/kanji-reading/model/kanjiReadingSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiReadingResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useKanjiReadingSession()

  if (!session || !isKanjiReadingComplete(session)) {
    return (
      <PageLayout title="かんじの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/kanji-reading')
  }

  return (
    <PageLayout title="かんじの けっか">
      <div className="kanji-reading-result">
        <h2>かんじの れんしゅう おわり！</h2>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/kanji">かんじの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
