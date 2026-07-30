import type { StrokeDefinition, StrokePoint } from './types'

export type StrokeRecognitionReason = 'accepted' | 'start-too-far' | 'off-path' | 'incomplete'

export type StrokeRecognitionResult = {
  accepted: boolean
  reason: StrokeRecognitionReason
  progress: number
}

export type StrokeRecognitionOptions = {
  startTolerance: number
  checkpointTolerance: number
  endTolerance: number
  minInputPoints: number
}

export const DEFAULT_STROKE_RECOGNITION_OPTIONS: StrokeRecognitionOptions = {
  startTolerance: 26,
  checkpointTolerance: 28,
  endTolerance: 30,
  minInputPoints: 2,
}

const distance = (first: StrokePoint, second: StrokePoint): number =>
  Math.hypot(first.x - second.x, first.y - second.y)

const distanceToSegment = (point: StrokePoint, start: StrokePoint, end: StrokePoint): number => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthSquared = deltaX * deltaX + deltaY * deltaY

  if (lengthSquared === 0) {
    return distance(point, start)
  }

  const projection = ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared
  const clampedProjection = Math.max(0, Math.min(1, projection))
  const nearest = {
    x: start.x + clampedProjection * deltaX,
    y: start.y + clampedProjection * deltaY,
  }

  return distance(point, nearest)
}

const distanceToPolyline = (point: StrokePoint, checkpoints: readonly StrokePoint[]): number => {
  let nearestDistance = Number.POSITIVE_INFINITY

  for (let index = 1; index < checkpoints.length; index += 1) {
    nearestDistance = Math.min(
      nearestDistance,
      distanceToSegment(point, checkpoints[index - 1], checkpoints[index]),
    )
  }

  return nearestDistance
}

const reachedCheckpointCount = (
  inputPoints: readonly StrokePoint[],
  checkpoints: readonly StrokePoint[],
  tolerance: number,
): number => {
  let nextCheckpointIndex = 0

  for (const point of inputPoints) {
    if (
      nextCheckpointIndex < checkpoints.length &&
      distance(point, checkpoints[nextCheckpointIndex]) <= tolerance
    ) {
      nextCheckpointIndex += 1
    }
  }

  return nextCheckpointIndex
}

export const recognizeStroke = (
  inputPoints: readonly StrokePoint[],
  stroke: StrokeDefinition,
  options: Partial<StrokeRecognitionOptions> = {},
): StrokeRecognitionResult => {
  const resolvedOptions = { ...DEFAULT_STROKE_RECOGNITION_OPTIONS, ...options }
  const { checkpoints } = stroke
  const progress = reachedCheckpointCount(
    inputPoints,
    checkpoints,
    resolvedOptions.checkpointTolerance,
  ) / checkpoints.length

  if (inputPoints.length < resolvedOptions.minInputPoints) {
    return { accepted: false, reason: 'incomplete', progress }
  }

  if (distance(inputPoints[0], checkpoints[0]) > resolvedOptions.startTolerance) {
    return { accepted: false, reason: 'start-too-far', progress: 0 }
  }

  const offPath = inputPoints.some(
    (point) => distanceToPolyline(point, checkpoints) > resolvedOptions.checkpointTolerance,
  )
  if (offPath) {
    return { accepted: false, reason: 'off-path', progress }
  }

  const lastPoint = inputPoints[inputPoints.length - 1]
  const reachedAllCheckpoints = progress === 1
  const nearEnd = distance(lastPoint, checkpoints[checkpoints.length - 1]) <= resolvedOptions.endTolerance

  if (!reachedAllCheckpoints || !nearEnd) {
    return { accepted: false, reason: 'incomplete', progress }
  }

  return { accepted: true, reason: 'accepted', progress: 1 }
}
