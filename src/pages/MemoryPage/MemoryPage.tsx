import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { MemoryBoard } from '../../features/memory/components/MemoryBoard'
import { MemoryFeedback } from '../../features/memory/components/MemoryFeedback'
import { useMemorySession } from '../../features/memory/MemorySessionProvider'
import { isMemoryComplete } from '../../features/memory/model/memorySession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function MemoryPage() {
  const navigate = useNavigate()
  const { session, error, startSession, flipCard } = useMemorySession()

  useEffect(() => {
    if (!session && !error) startSession()
  }, [session, error, startSession])

  if (!session) {
    return (
      <PageLayout title="かなと えの しんけいすいじゃく">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="かなと えの しんけいすいじゃく">
      <div className="memory-page">
        <p className="memory-page__progress" aria-label="そろった くみ数">
          {session.matchedPairIds.length} / {session.pairs.length} くみ
        </p>
        <p className="memory-page__instruction">かなと えを おなじ くみに しよう</p>
        <MemoryBoard
          cards={session.cards}
          flippedCardIds={session.flippedCardIds}
          matchedPairIds={session.matchedPairIds}
          onFlip={flipCard}
        />
        <MemoryFeedback feedback={session.feedback} />
        <p className="memory-page__moves">めくった かいすう：{session.moves}かい</p>
        {isMemoryComplete(session) && (
          <PrimaryButton className="memory-next" onClick={() => navigate('/memory/result')}>
            けっかを みる
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
