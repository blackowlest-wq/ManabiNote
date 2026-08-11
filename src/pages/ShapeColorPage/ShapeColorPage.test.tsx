import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ShapeColorSessionProvider } from '../../features/shape-color/ShapeColorSessionProvider'
import { createShapeColorQuestions } from '../../features/shape-color/model/shapeColorQuestion'
import { createShapeColorSession, nextShapeColorQuestion, selectShapeColorChoice } from '../../features/shape-color/model/shapeColorSession'
import { ShapeColorPage } from './ShapeColorPage'

const initialSession = createShapeColorSession(createShapeColorQuestions(() => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)

const shapeLabels = { circle: 'まる', triangle: 'さんかく', square: 'しかく', star: 'ほし' } as const
const colorLabels = { red: 'あか', blue: 'あお', yellow: 'きいろ', green: 'みどり' } as const

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/shape-color']}>
    <ShapeColorSessionProvider initialSession={session}>
      <Routes>
        <Route path="/shape-color" element={<ShapeColorPage />} />
        <Route path="/shape-color/result" element={<p>けっかページ</p>} />
      </Routes>
    </ShapeColorSessionProvider>
  </MemoryRouter>,
)

describe('ShapeColorPage', () => {
  it('shows progress, a target shape, and choices', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'おなじいろとかたちをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the matching shape and color is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解の選択肢が見つかりません')

    renderPage()

    await user.click(screen.getByRole('button', { name: 'あかのまる' }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextShapeColorQuestion(selectShapeColorChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後の問題が見つかりません')
    const correctChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!correctChoice) throw new Error('最後の正解が見つかりません')

    renderPage(session)
    await user.click(screen.getByRole('button', { name: `${colorLabels[correctChoice.color]}の${shapeLabels[correctChoice.shape]}` }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByText('けっかページ')).toBeInTheDocument()
  })
})
