import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { KanaToStrokeQuestion } from '../model/types'
import { StrokeCanvas } from './StrokeCanvas'

const question: KanaToStrokeQuestion = {
  type: 'kana-to-stroke',
  id: 'hiragana-test',
  kana: 'あ',
  viewBox: '0 0 200 200',
  glyphPaths: [
    'M 10 10 L 20 10 L 110 90 L 100 110 Z',
    'M 90 20 L 110 20 L 110 100 L 90 100 Z',
  ],
  strokes: [
    {
      order: 1,
      guidePath: 'M 20 20 L 60 60 L 100 100',
      checkpoints: [
        { x: 20, y: 20 },
        { x: 60, y: 60 },
        { x: 100, y: 100 },
      ],
    },
    {
      order: 2,
      guidePath: 'M 100 20 L 100 100',
      checkpoints: [
        { x: 100, y: 20 },
        { x: 100, y: 100 },
      ],
    },
  ],
}

const setSvgRect = (svg: SVGSVGElement) => {
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 200,
    bottom: 200,
    width: 200,
    height: 200,
    toJSON: () => ({}),
  })
}

const dispatchPointer = (
  svg: SVGSVGElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  clientX: number,
  clientY: number,
) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: 1 },
  })
  svg.dispatchEvent(event)
}

const dispatchTouch = (svg: SVGSVGElement, type: 'touchstart' | 'touchmove') => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  svg.dispatchEvent(event)
  return event
}

describe('StrokeCanvas', () => {
  it('renders the regular character outline as the primary tracing shadow', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-character-guide')).toHaveClass(
      'stroke-character-guide--primary',
    )
    expect(screen.getByTestId('stroke-character-guide-0')).toHaveAttribute(
      'd',
      question.glyphPaths[0],
    )
  })

  it('uses the regular character as the primary guide without rendering centerlines', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-character-guide')).toHaveClass(
      'stroke-character-guide--primary',
    )
    expect(screen.queryByTestId('stroke-guide-0')).not.toBeInTheDocument()
  })

  it('renders the source glyph outlines in the same coordinate system as the stroke data', () => {
    const glyphPathQuestion = {
      ...question,
      glyphPaths: ['M 10 10 L 60 10 L 60 60 Z', 'M 80 80 L 120 80 L 120 120 Z'],
    }

    render(
      <StrokeCanvas
        question={glyphPathQuestion}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-character-guide-0')).toHaveAttribute(
      'd',
      glyphPathQuestion.glyphPaths[0],
    )
    expect(screen.queryByTestId('stroke-character-guide-text')).not.toBeInTheDocument()
  })

  it('renders the fixed viewBox and highlights the active outline', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={1}
        completedStrokeIndexes={[0]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-canvas')).toHaveAttribute('viewBox', '0 0 200 200')
    expect(screen.getByTestId('stroke-character-guide-0')).toHaveAttribute('d', question.glyphPaths[0])
    expect(screen.getByTestId('stroke-character-guide-1')).toHaveClass(
      'stroke-character-guide__path--active',
    )
    expect(screen.getByTestId('stroke-character-guide-0')).toHaveClass(
      'stroke-character-guide__path--completed',
    )
  })

  it('keeps the full character visible while hiding the start hint before the first failed trace', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-character-guide-0')).toBeInTheDocument()
    expect(screen.getByTestId('stroke-character-guide-1')).toBeInTheDocument()
    expect(screen.getByTestId('stroke-hint-start')).toHaveClass('stroke-hint--hidden')
    expect(screen.getByTestId('stroke-hint-arrow')).toHaveClass('stroke-hint--hidden')
    expect(screen.getByTestId('stroke-hint-label')).not.toHaveClass('stroke-hint--hidden')
  })

  it('shows the start hint after the first failed trace', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        showFailureHint
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByTestId('stroke-character-guide-0')).toHaveClass(
      'stroke-character-guide__path--active',
    )
    expect(screen.getByTestId('stroke-hint-start')).not.toHaveClass('stroke-hint--hidden')
    expect(screen.getByTestId('stroke-hint-arrow')).not.toHaveClass('stroke-hint--hidden')
    expect(screen.getByTestId('stroke-hint-label')).not.toHaveClass('stroke-hint--hidden')
  })

  it('shows a readable start hint for the active stroke', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )

    expect(screen.getByText('文字を なぞろう')).toBeInTheDocument()
  })

  it('prevents the page from scrolling during touch tracing', () => {
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={vi.fn()}
      />,
    )
    const svg = screen.getByTestId('stroke-canvas') as unknown as SVGSVGElement

    const touchStart = dispatchTouch(svg, 'touchstart')
    const touchMove = dispatchTouch(svg, 'touchmove')

    expect(touchStart.defaultPrevented).toBe(true)
    expect(touchMove.defaultPrevented).toBe(true)
  })

  it('reports an accepted result after tracing every checkpoint', () => {
    const onStrokeResult = vi.fn()
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={onStrokeResult}
      />,
    )
    const svg = screen.getByTestId('stroke-canvas') as unknown as SVGSVGElement
    setSvgRect(svg)

    dispatchPointer(svg, 'pointerdown', 20, 20)
    dispatchPointer(svg, 'pointermove', 60, 55)
    dispatchPointer(svg, 'pointermove', 100, 90)
    dispatchPointer(svg, 'pointerup', 100, 100)

    expect(onStrokeResult).toHaveBeenCalledWith(
      expect.objectContaining({ accepted: true, reason: 'accepted', progress: 1 }),
    )
  })

  it('reports a rejected result when tracing starts far from the guide', () => {
    const onStrokeResult = vi.fn()
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={onStrokeResult}
      />,
    )
    const svg = screen.getByTestId('stroke-canvas') as unknown as SVGSVGElement
    setSvgRect(svg)

    dispatchPointer(svg, 'pointerdown', 160, 20)
    dispatchPointer(svg, 'pointerup', 180, 30)

    expect(onStrokeResult).toHaveBeenCalledWith(
      expect.objectContaining({ accepted: false, reason: 'start-too-far' }),
    )
  })

  it('reports failure and clears input on pointer cancellation', async () => {
    const onStrokeResult = vi.fn()
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        onStrokeResult={onStrokeResult}
      />,
    )
    const svg = screen.getByTestId('stroke-canvas') as unknown as SVGSVGElement
    setSvgRect(svg)

    dispatchPointer(svg, 'pointerdown', 20, 20)
    dispatchPointer(svg, 'pointermove', 60, 60)
    await waitFor(() => expect(screen.getByTestId('stroke-input')).toBeInTheDocument())
    dispatchPointer(svg, 'pointercancel', 60, 60)

    expect(onStrokeResult).toHaveBeenCalledWith(
      expect.objectContaining({ accepted: false }),
    )
    await waitFor(() => expect(screen.queryByTestId('stroke-input')).not.toBeInTheDocument())
  })

  it('does not handle pointer input when disabled', () => {
    const onStrokeResult = vi.fn()
    render(
      <StrokeCanvas
        question={question}
        currentStrokeIndex={0}
        completedStrokeIndexes={[]}
        disabled
        onStrokeResult={onStrokeResult}
      />,
    )
    const svg = screen.getByTestId('stroke-canvas') as unknown as SVGSVGElement
    setSvgRect(svg)

    dispatchPointer(svg, 'pointerdown', 20, 20)
    dispatchPointer(svg, 'pointerup', 100, 100)

    expect(onStrokeResult).not.toHaveBeenCalled()
  })
})
