import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ArithmeticSessionProvider } from '../../features/arithmetic/ArithmeticSessionProvider'
import { createArithmeticQuestions } from '../../features/arithmetic/model/arithmeticQuestion'
import { createArithmeticSession } from '../../features/arithmetic/model/arithmeticSession'
import type { ArithmeticKind } from '../../features/arithmetic/model/types'
import { ArithmeticPage } from './ArithmeticPage'

const createSession = (kind: ArithmeticKind) => createArithmeticSession(
  kind,
  'normal',
  createArithmeticQuestions(kind, 'normal', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (kind: ArithmeticKind) => {
  const path = kind === 'addition' ? '/addition' : '/subtraction'
  const session = createSession(kind)
  return {
    session,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <ArithmeticSessionProvider initialSession={session}>
          <Routes>
            <Route path={path} element={<ArithmeticPage kind={kind} />} />
            <Route path={`${path}/result`} element={<p>けっかページ</p>} />
          </Routes>
        </ArithmeticSessionProvider>
      </MemoryRouter>,
    ),
  }
}

describe('ArithmeticPage', () => {
  it('starts with a difficulty selector when opened from the menu', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/addition']}>
        <ArithmeticSessionProvider>
          <Routes><Route path="/addition" element={<ArithmeticPage kind="addition" />} /></Routes>
        </ArithmeticSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /むずかしい/ }))

    expect(await screen.findByText('1 / 5')).toBeInTheDocument()
  })

  it.each([
    ['addition', 'たしざんの問題'],
    ['subtraction', 'ひきざんの問題'],
  ] as const)('shows a %s question', (kind, label) => {
    renderPage(kind)

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: label })).toBeInTheDocument()
  })

  it('advances after the correct answer is selected', async () => {
    const user = userEvent.setup()
    const { session } = renderPage('addition')
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')

    await user.click(screen.getByRole('button', { name: String(correctChoice.value) }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
