import { Link, useNavigate } from 'react-router-dom'
import { useArithmeticSession } from '../../features/arithmetic/ArithmeticSessionProvider'
import { isArithmeticComplete } from '../../features/arithmetic/model/arithmeticSession'
import type { ArithmeticKind } from '../../features/arithmetic/model/types'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { getDifficultyLabel } from '../../shared/gameDifficulty'

const GAME_TEXT: Record<ArithmeticKind, { title: string; gamePath: string }> = {
  addition: { title: 'たしざん', gamePath: '/addition' },
  subtraction: { title: 'ひきざん', gamePath: '/subtraction' },
}

export function ArithmeticResultPage({ kind }: { kind: ArithmeticKind }) {
  const navigate = useNavigate()
  const { session, error, startSession } = useArithmeticSession()
  const text = GAME_TEXT[kind]

  if (!session || session.kind !== kind || !isArithmeticComplete(session)) {
    return (
      <PageLayout title="けいさんの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession(kind, session.difficulty)) navigate(text.gamePath)
  }

  return (
    <PageLayout title="けいさんの けっか" completedGameId={kind}>
      <div className="arithmetic-result">
        <h2>{text.title} おわり！</h2>
        <p>むずかしさ：{getDifficultyLabel(session.difficulty)}</p>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/numbers">かずの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
