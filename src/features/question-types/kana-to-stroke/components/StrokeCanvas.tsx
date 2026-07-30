import { useEffect, useRef, useState } from 'react'
import {
  recognizeStroke,
  type StrokeRecognitionResult,
} from '../model/strokeRecognizer'
import type { KanaToStrokeQuestion, StrokePoint } from '../model/types'

export type StrokeCanvasProps = {
  question: KanaToStrokeQuestion
  currentStrokeIndex: number
  completedStrokeIndexes: readonly number[]
  disabled?: boolean
  onStrokeResult: (result: StrokeRecognitionResult) => void
}

const VIEWBOX_SIZE = 200

const pointsToPath = (points: readonly StrokePoint[]): string =>
  points
    .map((point, index) => {
      const command = index === 0 ? 'M ' : 'L '
      return command + point.x + ' ' + point.y
    })
    .join(' ')

const toViewBoxPoint = (svg: SVGSVGElement, clientX: number, clientY: number): StrokePoint => {
  const rect = svg.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    return { x: 0, y: 0 }
  }

  return {
    x: ((clientX - rect.left) / rect.width) * VIEWBOX_SIZE,
    y: ((clientY - rect.top) / rect.height) * VIEWBOX_SIZE,
  }
}

export function StrokeCanvas({
  question,
  currentStrokeIndex,
  completedStrokeIndexes,
  disabled = false,
  onStrokeResult,
}: StrokeCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const inputPointsRef = useRef<StrokePoint[]>([])
  const [inputPoints, setInputPoints] = useState<StrokePoint[]>([])
  const activeStroke = question.strokes[currentStrokeIndex] ?? question.strokes[0]

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || disabled) return

    const preventTouchScroll = (event: TouchEvent) => {
      event.preventDefault()
    }
    const options: AddEventListenerOptions = { passive: false }

    svg.addEventListener('touchstart', preventTouchScroll, options)
    svg.addEventListener('touchmove', preventTouchScroll, options)

    return () => {
      svg.removeEventListener('touchstart', preventTouchScroll, options)
      svg.removeEventListener('touchmove', preventTouchScroll, options)
    }
  }, [disabled])

  const toPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    return toViewBoxPoint(svgRef.current, clientX, clientY)
  }

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return
    const point = toPoint(event.clientX, event.clientY)
    inputPointsRef.current = [point]
    setInputPoints([point])
    if (typeof svgRef.current?.setPointerCapture === 'function') {
      svgRef.current.setPointerCapture(event.pointerId)
    }
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || inputPointsRef.current.length === 0) return
    const nextPoints = [...inputPointsRef.current, toPoint(event.clientX, event.clientY)]
    inputPointsRef.current = nextPoints
    setInputPoints(nextPoints)
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || inputPointsRef.current.length === 0) return
    const finalPoints = [...inputPointsRef.current, toPoint(event.clientX, event.clientY)]
    const result = recognizeStroke(finalPoints, activeStroke)
    inputPointsRef.current = []
    setInputPoints([])
    onStrokeResult(result)
  }

  const handlePointerCancel = () => {
    if (disabled || inputPointsRef.current.length === 0) return
    inputPointsRef.current = []
    setInputPoints([])
    onStrokeResult({ accepted: false, reason: 'incomplete', progress: 0 })
  }

  return (
    <svg
      ref={svgRef}
      className="stroke-canvas"
      data-testid="stroke-canvas"
      viewBox={question.viewBox}
      role="img"
      aria-label={question.kana + 'の書き順お手本'}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <title>{question.kana}の書き順お手本</title>
      {question.strokes.map((stroke, index) => {
        const isCompleted = completedStrokeIndexes.includes(index)
        const isActive = index === currentStrokeIndex
        return (
          <path
            key={stroke.order}
            data-testid={'stroke-guide-' + index}
            className={[
              'stroke-guide',
              isActive ? 'stroke-guide--active' : '',
              isCompleted ? 'stroke-guide--completed' : '',
            ].filter(Boolean).join(' ')}
            d={stroke.guidePath}
            aria-hidden="true"
          />
        )
      })}
      {inputPoints.length > 0 && (
        <path
          data-testid="stroke-input"
          className="stroke-input"
          d={pointsToPath(inputPoints)}
          aria-hidden="true"
        />
      )}
      <circle
        className="stroke-hint-start"
        data-testid="stroke-hint-start"
        cx={activeStroke.checkpoints[0].x}
        cy={activeStroke.checkpoints[0].y}
        r="6"
        aria-hidden="true"
      />
      <path
        className="stroke-hint-arrow"
        d={
          'M ' +
          activeStroke.checkpoints[0].x +
          ' ' +
          (activeStroke.checkpoints[0].y - 14) +
          ' L ' +
          activeStroke.checkpoints[0].x +
          ' ' +
          (activeStroke.checkpoints[0].y - 7)
        }
        aria-hidden="true"
      />
      <text
        className="stroke-hint-label"
        x="10"
        y="188"
        aria-hidden="true"
      >
        ここから なぞろう
      </text>
    </svg>
  )
}
