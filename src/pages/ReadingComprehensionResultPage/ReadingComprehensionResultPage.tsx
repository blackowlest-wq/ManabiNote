import { Link, useNavigate } from 'react-router-dom'
import { useReadingComprehensionSession } from '../../features/reading-comprehension/ReadingComprehensionSessionProvider'
import { isReadingComprehensionComplete } from '../../features/reading-comprehension/model/readingComprehensionSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { getDifficultyLabel } from '../../shared/gameDifficulty'

export function ReadingComprehensionResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useReadingComprehensionSession()

  if (!session || !isReadingComprehensionComplete(session)) {
    return (
      <PageLayout title="ぶんよみの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/sentences">ぶんの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession(session.difficulty)) navigate('/reading-comprehension')
  }

  return (
    <PageLayout title="ぶんよみの けっか">
      <div className="reading-comprehension-result">
        <h2>ぶんよみ おわり！</h2>
        <p>むずかしさ：{getDifficultyLabel(session.difficulty)}</p>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
