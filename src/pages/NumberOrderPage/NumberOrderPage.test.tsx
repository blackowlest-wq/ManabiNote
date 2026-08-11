import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NumberOrderSessionProvider } from '../../features/number-order/NumberOrderSessionProvider'
import { createNumberOrderQuestions } from '../../features/number-order/model/numberOrderQuestion'
import { createNumberOrderSession } from '../../features/number-order/model/numberOrderSession'
import { NumberOrderPage } from './NumberOrderPage'

const initialSession = createNumberOrderSession(
  createNumberOrderQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/number-order']}>
    <NumberOrderSessionProvider initialSession={session}>
      <Routes>
        <Route path="/number-order" element={<NumberOrderPage />} />
        <Route path="/number-order/result" element={<p>けっかページ</p>} />
      </Routes>
    </NumberOrderSessionProvider>
  </MemoryRouter>,
)

describe('NumberOrderPage', () => {
  it('shows progress and the number sequence', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かずの じゅんばん' })).toBeInTheDocument()
  })

  it('advances after the missing number is selected', async () => {
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
