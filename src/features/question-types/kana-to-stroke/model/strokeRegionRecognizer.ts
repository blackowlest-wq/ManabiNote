import type { StrokeDefinition, StrokePoint } from './types'
import type {
  StrokeRecognitionReason,
  StrokeRecognitionResult,
} from './strokeRecognizer'

type StrokePolygon = readonly StrokePoint[]

export type StrokeRegion = {
  polygons: readonly StrokePolygon[]
  guide: readonly StrokePoint[]
}

export type StrokeRegionRecognitionOptions = {
  regionTolerance: number
  startTolerance: number
  endTolerance: number
  minInputPoints: number
  minGuideProgress: number
  maxOutsideRatio: number
}

export const DEFAULT_STROKE_REGION_RECOGNITION_OPTIONS: StrokeRegionRecognitionOptions = {
  regionTolerance: 14,
  startTolerance: 30,
  endTolerance: 32,
  minInputPoints: 2,
  minGuideProgress: 0.72,
  maxOutsideRatio: 0.25,
}

const PATH_COMMAND_ARGUMENTS: Readonly<Record<string, number>> = {
  C: 6,
  H: 1,
  L: 2,
  M: 2,
  V: 1,
  Z: 0,
}

const isCommandToken = (token: string): boolean => /^[A-Za-z]$/.test(token)

const parsePathTokens = (path: string): readonly string[] =>
  [...path.matchAll(/[A-Za-z]|-?\d+(?:\.\d+)?/g)].map((match) => match[0])

const isSamePoint = (first: StrokePoint, second: StrokePoint): boolean =>
  first.x === second.x && first.y === second.y

const appendPoint = (polygon: StrokePoint[], point: StrokePoint): void => {
  const previous = polygon[polygon.length - 1]
  if (!previous || !isSamePoint(previous, point)) {
    polygon.push(point)
  }
}

const finishPolygon = (polygons: StrokePolygon[], polygon: StrokePoint[]): void => {
  if (polygon.length < 3) return
  const first = polygon[0]
  const last = polygon[polygon.length - 1]
  if (!isSamePoint(first, last)) {
    polygon.push(first)
  }
  polygons.push([...polygon])
}

const cubicPoint = (
  start: StrokePoint,
  firstControl: StrokePoint,
  secondControl: StrokePoint,
  end: StrokePoint,
  progress: number,
): StrokePoint => {
  const inverse = 1 - progress
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * progress * firstControl.x +
      3 * inverse * progress ** 2 * secondControl.x +
      progress ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * progress * firstControl.y +
      3 * inverse * progress ** 2 * secondControl.y +
      progress ** 3 * end.y,
  }
}

const parseOutlinePath = (path: string): readonly StrokePolygon[] => {
  const tokens = parsePathTokens(path)
  const polygons: StrokePolygon[] = []
  let polygon: StrokePoint[] = []
  let current: StrokePoint = { x: 0, y: 0 }
  let subpathStart: StrokePoint | null = null
  let command = ''
  let tokenIndex = 0

  while (tokenIndex < tokens.length) {
    if (isCommandToken(tokens[tokenIndex])) {
      command = tokens[tokenIndex]
      tokenIndex += 1

      if (command.toUpperCase() === 'Z') {
        if (subpathStart) {
          appendPoint(polygon, subpathStart)
          current = subpathStart
        }
        finishPolygon(polygons, polygon)
        polygon = []
        subpathStart = null
        command = ''
        continue
      }
    }

    const commandType = command.toUpperCase()
    const argumentCount = PATH_COMMAND_ARGUMENTS[commandType]
    if (!argumentCount || tokenIndex + argumentCount > tokens.length) {
      throw new Error('書き順の輪郭データを解析できませんでした。')
    }

    const values = tokens.slice(tokenIndex, tokenIndex + argumentCount).map(Number)
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error('書き順の輪郭データを解析できませんでした。')
    }
    tokenIndex += argumentCount

    const isRelative = command === command.toLowerCase()
    const point = (x: number, y: number): StrokePoint => ({
      x: isRelative ? current.x + x : x,
      y: isRelative ? current.y + y : y,
    })

    if (commandType === 'M') {
      if (polygon.length > 0) finishPolygon(polygons, polygon)
      current = point(values[0], values[1])
      polygon = [current]
      subpathStart = current
      command = isRelative ? 'l' : 'L'
      continue
    }

    if (commandType === 'L') {
      current = point(values[0], values[1])
      appendPoint(polygon, current)
      continue
    }

    if (commandType === 'H') {
      current = {
        x: isRelative ? current.x + values[0] : values[0],
        y: current.y,
      }
      appendPoint(polygon, current)
      continue
    }

    if (commandType === 'V') {
      current = {
        x: current.x,
        y: isRelative ? current.y + values[0] : values[0],
      }
      appendPoint(polygon, current)
      continue
    }

    if (commandType === 'C') {
      const start = current
      const firstControl = point(values[0], values[1])
      const secondControl = point(values[2], values[3])
      const end = point(values[4], values[5])
      for (let step = 1; step <= 12; step += 1) {
        appendPoint(polygon, cubicPoint(start, firstControl, secondControl, end, step / 12))
      }
      current = end
      continue
    }

    throw new Error('書き順の輪郭データを解析できませんでした。')
  }

  finishPolygon(polygons, polygon)
  return polygons
}

export const createStrokeRegion = (
  stroke: StrokeDefinition,
  outlinePath: string,
): StrokeRegion => ({
  polygons: parseOutlinePath(outlinePath),
  guide: stroke.checkpoints,
})

const distance = (first: StrokePoint, second: StrokePoint): number =>
  Math.hypot(first.x - second.x, first.y - second.y)

const distanceToSegment = (
  point: StrokePoint,
  start: StrokePoint,
  end: StrokePoint,
): number => {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthSquared = deltaX * deltaX + deltaY * deltaY
  if (lengthSquared === 0) return distance(point, start)

  const projection =
    ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared
  const clampedProjection = Math.max(0, Math.min(1, projection))
  return distance(point, {
    x: start.x + clampedProjection * deltaX,
    y: start.y + clampedProjection * deltaY,
  })
}

const isPointInPolygon = (point: StrokePoint, polygon: StrokePolygon): boolean => {
  let inside = false
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; index += 1) {
    const current = polygon[index]
    const previous = polygon[previousIndex]
    const crossesHorizontalRay =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x
    if (crossesHorizontalRay) inside = !inside
    previousIndex = index
  }
  return inside
}

const distanceToRegionBoundary = (point: StrokePoint, region: StrokeRegion): number => {
  let nearest = Number.POSITIVE_INFINITY
  for (const polygon of region.polygons) {
    for (let index = 1; index < polygon.length; index += 1) {
      nearest = Math.min(nearest, distanceToSegment(point, polygon[index - 1], polygon[index]))
    }
  }
  return nearest
}

const isInsideExpandedRegion = (
  point: StrokePoint,
  region: StrokeRegion,
  tolerance: number,
): boolean =>
  region.polygons.some((polygon) => isPointInPolygon(point, polygon)) ||
  distanceToRegionBoundary(point, region) <= tolerance

const sampleInputPath = (inputPoints: readonly StrokePoint[]): readonly StrokePoint[] => {
  if (inputPoints.length < 2) return inputPoints

  const sampled: StrokePoint[] = [inputPoints[0]]
  for (let index = 1; index < inputPoints.length; index += 1) {
    const start = inputPoints[index - 1]
    const end = inputPoints[index]
    for (let step = 1; step <= 4; step += 1) {
      const progress = step / 4
      sampled.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
      })
    }
  }
  return sampled
}

const projectProgress = (point: StrokePoint, guide: readonly StrokePoint[]): number => {
  let totalLength = 0
  for (let index = 1; index < guide.length; index += 1) {
    totalLength += distance(guide[index - 1], guide[index])
  }
  if (totalLength === 0) return 0

  let travelledLength = 0
  let nearestDistance = Number.POSITIVE_INFINITY
  let nearestProgress = 0
  for (let index = 1; index < guide.length; index += 1) {
    const start = guide[index - 1]
    const end = guide[index]
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const lengthSquared = deltaX * deltaX + deltaY * deltaY
    const segmentLength = Math.sqrt(lengthSquared)
    const projection = lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared,
          ),
        )
    const nearestPoint = {
      x: start.x + projection * deltaX,
      y: start.y + projection * deltaY,
    }
    const candidateDistance = distance(point, nearestPoint)
    if (candidateDistance < nearestDistance) {
      nearestDistance = candidateDistance
      nearestProgress = (travelledLength + projection * segmentLength) / totalLength
    }
    travelledLength += segmentLength
  }
  return nearestProgress
}

const result = (
  accepted: boolean,
  reason: StrokeRecognitionReason,
  progress: number,
): StrokeRecognitionResult => ({ accepted, reason, progress })

export const recognizeStrokeRegion = (
  inputPoints: readonly StrokePoint[],
  region: StrokeRegion,
  options: Partial<StrokeRegionRecognitionOptions> = {},
): StrokeRecognitionResult => {
  const resolvedOptions = {
    ...DEFAULT_STROKE_REGION_RECOGNITION_OPTIONS,
    ...options,
  }
  const progress = inputPoints.reduce(
    (furthest, point) => Math.max(furthest, projectProgress(point, region.guide)),
    0,
  )

  if (distance(inputPoints[0], region.guide[0]) > resolvedOptions.startTolerance) {
    return result(false, 'start-too-far', 0)
  }

  if (inputPoints.length < resolvedOptions.minInputPoints) {
    return result(false, 'incomplete', progress)
  }

  const sampledInputPath = sampleInputPath(inputPoints)
  const outsideCount = sampledInputPath.filter(
    (point) => !isInsideExpandedRegion(point, region, resolvedOptions.regionTolerance),
  ).length
  if (outsideCount / sampledInputPath.length > resolvedOptions.maxOutsideRatio) {
    return result(false, 'off-path', progress)
  }

  const endPoint = region.guide[region.guide.length - 1]
  if (
    progress < resolvedOptions.minGuideProgress ||
    distance(inputPoints[inputPoints.length - 1], endPoint) > resolvedOptions.endTolerance
  ) {
    return result(false, 'incomplete', progress)
  }

  return result(true, 'accepted', 1)
}
