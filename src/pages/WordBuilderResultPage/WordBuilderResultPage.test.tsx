import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { WordBuilderSessionProvider } from '../../features/word-builder/WordBuilderSessionProvider'
import { createWordBuilderSession, nextWord, selectTile, submitWord } from '../../features/word-builder/model/wordBuilderSession'
import type { WordBuilderQuestion } from '../../features/word-builder/model/types'
import { WordBuilderResultPage } from './WordBuilderResultPage'

const questions: WordBuilderQuestion[] = [
  { id: 'word-0', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
  { id: 'word-1', reading: 'ねこ', image: { atlasId: 'animals-01', symbolId: 'cat' } },
  { id: 'word-2', reading: 'いぬ', image: { atlasId: 'animals-01', symbolId: 'dog' } },
  { id: 'word-3', reading: 'うし', image: { atlasId: 'animals-01', symbolId: 'cow' } },
  { id: 'word-4', reading: 'くま', image: { atlasId: 'animals-01', symbolId: 'bear' } },
]

const createCompleteSession = () => {
  let session = createWordBuilderSession(questions, () => new Date('2026-08-07T11:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    const selected = Array.from(question.reading).reduce((current, character) => {
      const tile = current.tiles.find((candidate) => candidate.character === character && !current.selectedTileIds.includes(candidate.id))
      if (!tile) throw new Error(`テストタイルが見つかりません: ${character}`)
      return selectTile(current, tile.id)
    }, session)
    session = nextWord(submitWord(selected))
  }
  return session
}

describe('WordBuilderResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<WordBuilderResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <WordBuilderSessionProvider>{children}</WordBuilderSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the five-word completion message and actions', () => {
    render(<WordBuilderResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <WordBuilderSessionProvider initialSession={createCompleteSession()}>{children}</WordBuilderSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
