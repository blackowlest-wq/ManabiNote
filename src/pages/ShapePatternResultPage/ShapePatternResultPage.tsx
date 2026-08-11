import { Link, useNavigate } from 'react-router-dom'
import { useShapePatternSession } from '../../features/shape-pattern/ShapePatternSessionProvider'
import { isShapePatternComplete } from '../../features/shape-pattern/model/shapePatternSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShapePatternResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useShapePatternSession()

  if (!session || !isShapePatternComplete(session)) {
    return (
      <PageLayout title="かたちの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/shapes">かたちの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/shape-pattern')
  }

  return (
    <PageLayout title="かたちの けっか" completedGameId="shape-pattern">
      <div className="shape-pattern-result">
        <h2>かたちの ならび おわり！</h2>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/shapes">かたちの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
