import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArithmeticQuestion } from '../../features/arithmetic/components/ArithmeticQuestion'
import { useArithmeticSession } from '../../features/arithmetic/ArithmeticSessionProvider'
import { isArithmeticComplete } from '../../features/arithmetic/model/arithmeticSession'
import type { ArithmeticKind } from '../../features/arithmetic/model/types'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

const GAME_TEXT: Record<ArithmeticKind, { title: string; resultPath: string }> = {
  addition: { title: 'たしざん', resultPath: '/addition/result' },
  subtraction: { title: 'ひきざん', resultPath: '/subtraction/result' },
}

export function ArithmeticPage({ kind }: { kind: ArithmeticKind }) {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useArithmeticSession()
  const text = GAME_TEXT[kind]

  useEffect(() => {
    if ((!session || session.kind !== kind || isArithmeticComplete(session)) && !error) startSession(kind)
  }, [session, error, startSession, kind])

  if (!session || session.kind !== kind || isArithmeticComplete(session)) {
    return (
      <PageLayout title={text.title}>
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title={text.title}><p>問題を表示できません。</p><Link to="/numbers">かずの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate(text.resultPath)
  }

  return (
    <PageLayout title={text.title}>
      <div className="arithmetic-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ArithmeticQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="arithmetic-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
