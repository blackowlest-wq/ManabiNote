import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AudioKanaQuestion } from '../../features/audio-kana/components/AudioKanaQuestion'
import { useAudioKanaSession } from '../../features/audio-kana/AudioKanaSessionProvider'
import { isAudioKanaComplete } from '../../features/audio-kana/model/audioKanaSession'
import { speakKana } from '../../features/audio-kana/model/audioKanaSpeech'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function AudioKanaPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useAudioKanaSession()

  useEffect(() => {
    if ((!session || isAudioKanaComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isAudioKanaComplete(session)) {
    return (
      <PageLayout title="おとを きこう">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="おとを きこう"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/audio-kana/result')
  }

  return (
    <PageLayout title="おとを きこう">
      <div className="audio-kana-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <AudioKanaQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onPlay={() => speakKana(question.answer)}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="audio-kana-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
