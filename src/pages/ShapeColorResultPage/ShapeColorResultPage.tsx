import { Link, useNavigate } from 'react-router-dom'
import { useShapeColorSession } from '../../features/shape-color/ShapeColorSessionProvider'
import { isShapeColorComplete } from '../../features/shape-color/model/shapeColorSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShapeColorResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useShapeColorSession()

  if (!session || !isShapeColorComplete(session)) {
    return (
      <PageLayout title="いろと かたちの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/shape-color')
  }

  return (
    <PageLayout title="いろと かたちの けっか">
      <div className="shape-color-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
