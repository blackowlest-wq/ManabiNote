import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ParticleChoiceSessionProvider } from '../../features/particle-choice/ParticleChoiceSessionProvider'
import { createParticleChoiceQuestions } from '../../features/particle-choice/model/particleChoiceQuestion'
import { createParticleChoiceSession } from '../../features/particle-choice/model/particleChoiceSession'
import { ParticleChoiceResultPage } from './ParticleChoiceResultPage'

const session = createParticleChoiceSession(
  createParticleChoiceQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/particle-choice/result']}>
    <ParticleChoiceSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/particle-choice/result" element={<ParticleChoiceResultPage />} />
        <Route path="/particle-choice" element={<p>ゲームページ</p>} />
      </Routes>
    </ParticleChoiceSessionProvider>
  </MemoryRouter>,
)

describe('ParticleChoiceResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'ことばつなぎ おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ぶんの メニューへ' })).toHaveAttribute('href', '/sentences')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
