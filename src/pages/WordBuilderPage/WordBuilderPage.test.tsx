import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { WordBuilderSessionProvider } from '../../features/word-builder/WordBuilderSessionProvider'
import { createWordBuilderSession, nextWord, selectTile, submitWord } from '../../features/word-builder/model/wordBuilderSession'
import type { WordBuilderQuestion } from '../../features/word-builder/model/types'
import { WordBuilderResultPage } from '../WordBuilderResultPage/WordBuilderResultPage'
import { WordBuilderPage } from './WordBuilderPage'

const makeQuestions = (): WordBuilderQuestion[] => [
  { id: 'word-0', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
  { id: 'word-1', reading: 'ねこ', image: { atlasId: 'animals-01', symbolId: 'cat' } },
  { id: 'word-2', reading: 'いぬ', image: { atlasId: 'animals-01', symbolId: 'dog' } },
  { id: 'word-3', reading: 'うし', image: { atlasId: 'animals-01', symbolId: 'cow' } },
  { id: 'word-4', reading: 'くま', image: { atlasId: 'animals-01', symbolId: 'bear' } },
]

const initialSession = createWordBuilderSession(
  makeQuestions(),
  () => new Date('2026-08-07T11:00:00.000Z'),
  () => 0.999,
)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <WordBuilderSessionProvider initialSession={initialSession}>{children}</WordBuilderSessionProvider>
)

const testWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <TestProvider>{children}</TestProvider>
  </MemoryRouter>
)

async function completeCurrentWord(user: ReturnType<typeof userEvent.setup>) {
  const reading = screen.getByRole('img').getAttribute('aria-label') ?? ''
  for (const character of Array.from(reading)) {
    await user.click(screen.getAllByRole('button', { name: character })[0])
  }
  await user.click(screen.getByRole('button', { name: 'できた！' }))
}

describe('WordBuilderPage', () => {
  it('shows progress, picture, tiles, and disabled undo at the start', () => {
    render(<WordBuilderPage />, { wrapper: testWrapper })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もどす' })).toBeDisabled()
  })

  it('shows a completion result after the fifth word', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/word-builder']}>
        <TestProvider>
          <Routes>
            <Route path="/word-builder" element={<WordBuilderPage />} />
            <Route path="/word-builder/result" element={<WordBuilderResultPage />} />
          </Routes>
        </TestProvider>
      </MemoryRouter>,
    )

    for (let index = 0; index < 5; index += 1) {
      await completeCurrentWord(user)
      if (index < 4) await user.click(screen.getByRole('button', { name: 'つぎへ' }))
    }

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
  })
})

export function createCompleteSession() {
  let session = initialSession
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
