import { useRef, type KeyboardEvent } from 'react'
import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import type {
  Direction,
  EnemyEntity,
  Position,
  RescueState,
  StageDefinition,
  StageEntity,
} from '../model/rescueMaze'

export type RescueMazeBoardProps = {
  stage: StageDefinition
  state: RescueState
  onMove: (direction: Direction) => void
}

const PLAYER_IMAGE = { atlasId: 'animals-01', symbolId: 'fox' }
const DIRECTION_LABELS: Record<Direction, string> = {
  up: 'うえ',
  down: 'した',
  left: 'ひだり',
  right: 'みぎ',
}

const positionsEqual = (left: Position, right: Position) => left.x === right.x && left.y === right.y

const directionBetween = (from: Position, to: Position): Direction | null => {
  if (to.x === from.x && to.y === from.y - 1) return 'up'
  if (to.x === from.x && to.y === from.y + 1) return 'down'
  if (to.x === from.x - 1 && to.y === from.y) return 'left'
  if (to.x === from.x + 1 && to.y === from.y) return 'right'
  return null
}

const enemyArrow = (position: Position, nextPosition: Position) => {
  if (nextPosition.x > position.x) return '→'
  if (nextPosition.x < position.x) return '←'
  if (nextPosition.y > position.y) return '↓'
  return '↑'
}

const entityAt = <T extends StageEntity['kind']>(
  stage: StageDefinition,
  kind: T,
  position: Position,
): Extract<StageEntity, { kind: T }> | undefined => stage.entities.find(
  (entity): entity is Extract<StageEntity, { kind: T }> => entity.kind === kind &&
    ('position' in entity ? positionsEqual(entity.position, position) : false),
)

export function RescueMazeBoard({ stage, state, onMove }: RescueMazeBoardProps) {
  const pointerStart = useRef<Position | null>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Partial<Record<string, Direction>> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    }
    const direction = directions[event.key]
    if (!direction || state.status !== 'playing') return
    event.preventDefault()
    onMove(direction)
  }

  const handlePointerEnd = (position: Position) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || state.status !== 'playing') return
    const deltaX = position.x - start.x
    const deltaY = position.y - start.y
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return
    onMove(Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : (deltaY > 0 ? 'down' : 'up'))
  }

  return (
    <div
      className="rescue-maze-board"
      role="grid"
      aria-label="どうぶつレスキューの迷路"
      tabIndex={0}
      style={{ gridTemplateColumns: `repeat(${stage.width}, 1fr)` }}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => handlePointerEnd({ x: event.clientX, y: event.clientY })}
      onPointerCancel={() => {
        pointerStart.current = null
      }}
    >
      {stage.tiles.map((tile, index) => {
        const position = { x: index % stage.width, y: Math.floor(index / stage.width) }
        const direction = directionBetween(state.playerPosition, position)
        const canMove = direction !== null && tile !== 'wall' && state.status === 'playing'
        const animal = entityAt(stage, 'animal', position)
        const key = entityAt(stage, 'key', position)
        const door = entityAt(stage, 'door', position)
        const treasure = entityAt(stage, 'treasure', position)
        const floorSwitch = entityAt(stage, 'switch', position)
        const bridge = entityAt(stage, 'bridge', position)
        const bridgeIsActive = bridge && stage.entities.some(
          (entity) => entity.kind === 'switch' && entity.bridgeId === bridge.id &&
            state.activatedSwitchIds.includes(entity.id),
        )
        const boxState = state.boxStates.find((box) => positionsEqual(box.position, position))
        const enemyState = state.enemyStates.find((enemy) => positionsEqual(enemy.position, position))
        const enemy = enemyState
          ? stage.entities.find((entity): entity is EnemyEntity => entity.kind === 'enemy' && entity.id === enemyState.id)
          : undefined
        const playerIsHere = positionsEqual(state.playerPosition, position)
        const animalIsVisible = animal && !state.rescuedAnimalIds.includes(animal.id)
        const keyIsVisible = key && !state.collectedKeyEntityIds.includes(key.id)
        const doorIsVisible = door && !state.openDoorIds.includes(door.id)
        const treasureIsVisible = treasure && !state.collectedTreasureIds.includes(treasure.id)
        const cellLabel = tile === 'wall'
            ? 'きの かべ'
            : playerIsHere
              ? 'レスキューたいの いるマス'
              : boxState
                ? canMove && direction ? `${DIRECTION_LABELS[direction]}へ すすんで はこを おす` : 'おせる はこ'
                : floorSwitch
                  ? floorSwitch.activation === 'box' ? 'はこの スイッチ' : 'ふむ スイッチ'
                  : bridge
                    ? bridgeIsActive ? 'かかった はし' : 'まだ はしが ない'
                    : canMove && direction
                      ? `${DIRECTION_LABELS[direction]}へ すすむ`
                      : animalIsVisible
                        ? `${animal.label}の いるマス`
                        : tile === 'exit'
                          ? 'ゴール'
                          : 'みち'

        return (
          <div key={`${stage.id}-${index}`} role="gridcell" className="rescue-maze-gridcell">
            <button
              type="button"
              className={`rescue-maze-cell rescue-maze-cell--${tile}${bridge ? ` rescue-maze-cell--bridge${bridgeIsActive ? '-active' : '-closed'}` : ''}${canMove ? ' rescue-maze-cell--reachable' : ''}`}
              disabled={!canMove}
              aria-label={cellLabel}
              onClick={() => direction && onMove(direction)}
            >
              {tile === 'wall' && <span className="rescue-maze-wall" aria-hidden="true">🌲</span>}
              {tile === 'exit' && <span className="rescue-maze-exit" aria-hidden="true">🏁</span>}
              {doorIsVisible && <span className="rescue-maze-door" aria-hidden="true">🚪<small>{door.symbol}</small></span>}
              {keyIsVisible && <span className="rescue-maze-key" aria-hidden="true">🔑<small>{key.symbol}</small></span>}
              {treasureIsVisible && <span className="rescue-maze-treasure" aria-hidden="true">💎</span>}
              {bridge && (
                <span className={`rescue-maze-bridge rescue-maze-bridge--${bridgeIsActive ? 'active' : 'closed'}`} aria-hidden="true">
                  {bridgeIsActive ? '🌉' : '🌊'}<small>{bridge.symbol}</small>
                </span>
              )}
              {floorSwitch && (
                <span className={`rescue-maze-switch${state.activatedSwitchIds.includes(floorSwitch.id) ? ' rescue-maze-switch--active' : ''}`} aria-hidden="true">
                  {state.activatedSwitchIds.includes(floorSwitch.id) ? '🟢' : '🔘'}<small>{floorSwitch.symbol}</small>
                </span>
              )}
              {boxState && <span className="rescue-maze-box" aria-hidden="true">📦</span>}
              {animalIsVisible && (
                <span className="rescue-maze-entity rescue-maze-entity--animal" aria-hidden="true">
                  <SpriteImage image={{ atlasId: 'animals-01', symbolId: animal.symbolId }} alt={animal.label} width={64} height={64} />
                </span>
              )}
              {enemy && enemyState && (
                <span className="rescue-maze-entity rescue-maze-entity--enemy" aria-hidden="true">
                  <SpriteImage image={{ atlasId: 'animals-01', symbolId: enemy.symbolId }} alt={enemy.label} width={64} height={64} />
                  <small className="rescue-maze-enemy-arrow">{enemyArrow(enemyState.position, enemyState.nextPosition)}</small>
                </span>
              )}
              {playerIsHere && (
                <span className="rescue-maze-entity rescue-maze-entity--player" aria-hidden="true">
                  <SpriteImage image={PLAYER_IMAGE} alt="レスキューたい" width={64} height={64} />
                  <small>🛟</small>
                </span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
