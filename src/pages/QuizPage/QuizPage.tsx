import { Link, useNavigate } from 'react-router-dom'
import { KanaQuestion } from '../../features/question-types/kana-to-picture/components/KanaQuestion'
import { AnswerFeedback } from '../../features/quiz/components/AnswerFeedback'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function QuizPage() {
  const navigate = useNavigate()
  const { session, lastAnswer, answer, nextQuestion, error } = useQuizSession()

  if (!session) {
    return <PageLayout title="ひらがな れんしゅう"><p>学習を開始してください。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const answerIndex = lastAnswer ? session.currentIndex - 1 : session.currentIndex
  const question = session.questions[answerIndex]
  if (!question) return <PageLayout title="ひらがな れんしゅう"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>

  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
  const handleNext = () => {
    nextQuestion()
    if (session.currentIndex >= session.questions.length) navigate('/result')
  }

  return (
    <PageLayout title="ひらがな れんしゅう">
      <QuizProgress current={answerIndex + 1} total={session.questions.length} />
      <KanaQuestion
        question={question}
        selectedChoiceId={lastAnswer?.selectedChoiceId ?? null}
        disabled={Boolean(lastAnswer)}
        onSelect={answer}
      />
      {lastAnswer && correctChoice && (
        <>
          <AnswerFeedback isCorrect={lastAnswer.isCorrect} correctLabel={correctChoice.label} />
          <PrimaryButton onClick={handleNext}>次の問題</PrimaryButton>
        </>
      )}
      {error && <p role="alert">{error.message}</p>}
    </PageLayout>
  )
}
