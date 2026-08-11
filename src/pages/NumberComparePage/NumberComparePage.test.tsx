import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NumberCompareSessionProvider } from '../../features/number-compare/NumberCompareSessionProvider'
import { createNumberCompareQuestions } from '../../features/number-compare/model/numberCompareQuestion'
import { createNumberCompareSession } from '../../features/number-compare/model/numberCompareSession'
import { NumberComparePage } from './NumberComparePage'

const initialSession = createNumberCompareSession(
  createNumberCompareQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/number-compare']}>
    <NumberCompareSessionProvider initialSession={session}>
      <Routes>
        <Route path="/number-compare" element={<NumberComparePage />} />
        <Route path="/number-compare/result" element={<p>けっかページ</p>} />
      </Routes>
    </NumberCompareSessionProvider>
  </MemoryRouter>,
)

describe('NumberComparePage', () => {
  it('shows progress and the comparison question', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'くらべる かず' })).toBeInTheDocument()
  })

  it('advances after the larger number is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: String(correctChoice.value) }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
