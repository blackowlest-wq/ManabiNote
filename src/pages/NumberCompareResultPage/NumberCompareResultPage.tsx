import { Link, useNavigate } from 'react-router-dom'
import { useNumberCompareSession } from '../../features/number-compare/NumberCompareSessionProvider'
import { isNumberCompareComplete } from '../../features/number-compare/model/numberCompareSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function NumberCompareResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useNumberCompareSession()

  if (!session || !isNumberCompareComplete(session)) {
    return (
      <PageLayout title="かずの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/number-compare')
  }

  return (
    <PageLayout title="かずの けっか">
      <div className="number-compare-result">
        <h2>かずの れんしゅう おわり！</h2>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/numbers">かずの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
