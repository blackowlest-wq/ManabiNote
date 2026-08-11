import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ParticleChoiceSessionProvider } from '../../features/particle-choice/ParticleChoiceSessionProvider'
import { createParticleChoiceQuestions } from '../../features/particle-choice/model/particleChoiceQuestion'
import { createParticleChoiceSession } from '../../features/particle-choice/model/particleChoiceSession'
import { ParticleChoicePage } from './ParticleChoicePage'

const initialSession = createParticleChoiceSession(
  'normal',
  createParticleChoiceQuestions('normal', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session: typeof initialSession | null = initialSession) => render(
  <MemoryRouter initialEntries={['/particle-choice']}>
    <ParticleChoiceSessionProvider initialSession={session ?? undefined}>
      <Routes>
        <Route path="/particle-choice" element={<ParticleChoicePage />} />
        <Route path="/particle-choice/result" element={<p>けっかページ</p>} />
      </Routes>
    </ParticleChoiceSessionProvider>
  </MemoryRouter>,
)

describe('ParticleChoicePage', () => {
  it('starts after selecting a difficulty', async () => {
    const user = userEvent.setup()
    renderPage(null)

    await user.click(screen.getByRole('button', { name: /かんたん/ }))

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('shows progress and particle choices', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'つなぐことばをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the matching particle is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.particle }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
