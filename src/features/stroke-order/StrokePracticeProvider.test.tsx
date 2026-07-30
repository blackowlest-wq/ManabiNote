import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as loader from '../question-types/kana-to-stroke/model/loader'
import { StrokePracticeProvider, useStrokePractice } from './StrokePracticeProvider'

function Consumer() {
  const { session, error, startPractice, recordFailure, recordSuccess, nextCharacter } = useStrokePractice()

  return (
    <div>
      <button type="button" onClick={startPractice}>start</button>
      <button type="button" onClick={recordFailure}>failure</button>
      <button type="button" onClick={recordSuccess}>success</button>
      <button type="button" onClick={nextCharacter}>next</button>
      <output data-testid="kana">{session?.questions[session.currentQuestionIndex]?.kana ?? 'none'}</output>
      <output data-testid="stroke">{session?.currentStrokeIndex ?? 'none'}</output>
      <output data-testid="attempts">{session?.attempts[0] ?? 'none'}</output>
      <output data-testid="status">{session?.status ?? 'none'}</output>
      {error && <p role="alert">{error.message}</p>}
    </div>
  )
}

const renderProvider = () =>
  render(
    <StrokePracticeProvider>
      <Consumer />
    </StrokePracticeProvider>,
  )

describe('StrokePracticeProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts the fixed five-character practice session', () => {
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'start' }))

    expect(screen.getByTestId('kana')).toHaveTextContent('あ')
    expect(screen.getByTestId('stroke')).toHaveTextContent('0')
    expect(screen.getByTestId('status')).toHaveTextContent('active')
  })

  it('records failure and success through the session model', () => {
    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'start' }))

    fireEvent.click(screen.getByRole('button', { name: 'failure' }))
    expect(screen.getByTestId('attempts')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'success' }))
    expect(screen.getByTestId('attempts')).toHaveTextContent('2')
    expect(screen.getByTestId('stroke')).toHaveTextContent('1')
  })

  it('exposes a safe error when loading data fails', () => {
    vi.spyOn(loader, 'loadStrokeQuestions').mockImplementationOnce(() => {
      throw new Error('broken loader')
    })
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'start' }))

    expect(screen.getByRole('alert')).toHaveTextContent('書き順練習を開始できませんでした。')
    expect(screen.getByTestId('kana')).toHaveTextContent('none')
  })
})
