import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MissingCharacterSessionProvider } from '../../features/missing-character/MissingCharacterSessionProvider'
import { createMissingCharacterSession, nextMissingCharacterQuestion, selectChoice } from '../../features/missing-character/model/missingCharacterSession'
import type { MissingCharacterQuestion } from '../../features/missing-character/model/types'
import { MissingCharacterResultPage } from './MissingCharacterResultPage'

const questions: MissingCharacterQuestion[] = ['りんご', 'ねこ', 'いぬ', 'うし', 'くま'].map((reading, index) => ({
  id: `word-${index}`,
  reading,
  image: { atlasId: 'food-01', symbolId: 'apple' },
  missingIndex: 0,
  correctCharacter: Array.from(reading)[0] ?? 'あ',
  choices: [
    { id: `word-${index}-correct`, character: Array.from(reading)[0] ?? 'あ' },
    { id: `word-${index}-wrong-1`, character: 'い' },
    { id: `word-${index}-wrong-2`, character: 'う' },
    { id: `word-${index}-wrong-3`, character: 'え' },
  ],
  correctChoiceId: `word-${index}-correct`,
}))

const createCompleteSession = () => {
  let session = createMissingCharacterSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextMissingCharacterQuestion(selectChoice(session, question.correctChoiceId))
  }
  return session
}

describe('MissingCharacterResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<MissingCharacterResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <MissingCharacterSessionProvider>{children}</MissingCharacterSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<MissingCharacterResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <MissingCharacterSessionProvider initialSession={createCompleteSession()}>{children}</MissingCharacterSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
