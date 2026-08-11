import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyCookingAction,
  calculateCookingResult,
  COOKING_CLEAR_TARGET,
  COOKING_INGREDIENTS,
  COOKING_RECIPES,
  startCookingGame,
  type CookingAction,
  type CookingEvent,
  type CookingState,
  type IngredientId,
} from '../../features/cooking-game/model/cookingGame'
import { SpriteImage } from '../../features/question-types/kana-to-picture/components/SpriteImage'
import { PageLayout } from '../../shared/components/PageLayout'

export type CookingGamePageProps = {
  storage?: Storage
  durationSeconds?: number
  random?: () => number
}

const ingredientById = (ingredientId: IngredientId) => {
  const ingredient = COOKING_INGREDIENTS.find((candidate) => candidate.id === ingredientId)
  if (!ingredient) throw new Error('食材が見つかりません')
  return ingredient
}

const recipeById = (recipeId: string) => {
  const recipe = COOKING_RECIPES.find((candidate) => candidate.id === recipeId)
  if (!recipe) throw new Error('レシピが見つかりません')
  return recipe
}

const messageFor = (events: readonly CookingEvent[]) => {
  const event = events[events.length - 1]
  if (!event) return null
  switch (event.type) {
    case 'ingredient-placed':
      return `${ingredientById(event.ingredientId).label}を のせたよ！`
    case 'ingredient-composted':
      return `${ingredientById(event.ingredientId).label}は コンポストへ！`
    case 'dish-completed':
      return `${recipeById(event.recipeId).name}が できた！`
    case 'order-left':
      return 'おきゃくさんが いれかわったよ'
    case 'game-finished':
      return 'おみせは ここまで！'
  }
}

export function CookingGamePage({
  storage,
  durationSeconds = 45,
  random = Math.random,
}: CookingGamePageProps = {}) {
  const [game, setGame] = useState<CookingState | null>(null)
  const [feedback, setFeedback] = useState('ちゅうもんを えらんで しょくざいを タップ！')
  const clearRecordedRef = useRef(false)

  const result = useMemo(
    () => game?.status === 'finished' ? calculateCookingResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current || current.status !== 'playing') return current
        const transition = applyCookingAction(current, { type: 'tick' }, random)
        const message = messageFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [game?.status, random])

  useEffect(() => {
    if (!result?.isCleared || clearRecordedRef.current) return
    clearRecordedRef.current = true
    markGameCleared('cooking', storage)
  }, [result, storage])

  const startGame = () => {
    clearRecordedRef.current = false
    setGame(startCookingGame({ durationSeconds }, random))
    setFeedback('ちゅうもんを えらんで しょくざいを タップ！')
  }

  const performAction = (action: CookingAction) => {
    if (!game || game.status !== 'playing') return
    const transition = applyCookingAction(game, action, random)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="わくわくキッチン">
        <div className="cooking-intro">
          <div className="cooking-intro__scene" aria-hidden="true">👨‍🍳　🍳　🥪</div>
          <p>ふたつの ちゅうもんを みながら、しょくざいを じゅんばんに のせよう！</p>
          <p>じかんないに {COOKING_CLEAR_TARGET}さら つくれたら クリア！</p>
          <button type="button" className="primary-button" onClick={startGame}>おみせを ひらく</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="わくわくキッチン">
        <div className="cooking-result">
          <div className="cooking-result__celebration" aria-hidden="true">{result.isCleared ? '🎉👨‍🍳🎉' : '🍽️✨'}</div>
          <h2>{result.isCleared ? 'キッチンマスター！' : 'また あそぼう！'}</h2>
          <p className="cooking-result__score">{result.score} てん</p>
          <p>{result.completedDishCount}さら できたよ</p>
          <p>さいこう {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={startGame}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="わくわくキッチン">
      <div className="cooking-game-page">
        <div className="cooking-hud" aria-label="おみせのようす">
          <span aria-label={`のこり ${game.timeLeft}びょう`}>⏰ {game.timeLeft}</span>
          <span aria-label={`${game.score}てん`}>🏅 {game.score}</span>
          <span aria-label={`できた りょうり ${game.completedDishCount}さら`}>🍽️ {game.completedDishCount}</span>
          <span aria-label={`${game.combo}コンボ`}>🔥 {game.combo}</span>
        </div>

        <section className="cooking-orders" aria-label="ちゅうもん">
          {game.orders.map((order) => {
            const recipe = recipeById(order.recipeId)
            const selected = order.id === game.selectedOrderId
            return (
              <button
                key={order.id}
                type="button"
                className={`cooking-order${selected ? ' cooking-order--selected' : ''}`}
                aria-label={`ちゅうもん ${recipe.name}`}
                aria-pressed={selected}
                onClick={() => performAction({ type: 'select-order', orderId: order.id })}
              >
                <span className="cooking-order__title"><b aria-hidden="true">{recipe.emoji}</b>{recipe.name}</span>
                <span className="cooking-order__recipe" aria-hidden="true">
                  {recipe.ingredients.map((ingredientId, index) => {
                    const ingredient = ingredientById(ingredientId)
                    const completed = index < order.completedIngredientIds.length
                    const next = index === order.completedIngredientIds.length
                    return (
                      <span key={`${order.id}-${index}`} className={`cooking-recipe-slot${completed ? ' cooking-recipe-slot--done' : ''}${next ? ' cooking-recipe-slot--next' : ''}`}>
                        <SpriteImage image={{ atlasId: 'food-01', symbolId: ingredient.symbolId }} alt={ingredient.label} width={48} height={48} />
                        {completed && <small>✓</small>}
                      </span>
                    )
                  })}
                </span>
                <span className="cooking-patience" aria-label={`まちじかん ${order.patience}`}>
                  <span style={{ width: `${(order.patience / order.maxPatience) * 100}%` }} />
                </span>
              </button>
            )
          })}
        </section>

        <div className="cooking-counter" aria-label="ちょうりだい">
          <span aria-hidden="true">🍽️</span>
          <strong>{recipeById(game.orders.find((order) => order.id === game.selectedOrderId)?.recipeId ?? game.orders[0].recipeId).name}</strong>
          <span aria-hidden="true">👨‍🍳</span>
        </div>

        <section className="cooking-conveyor" aria-label="しょくざいレーン">
          {game.conveyor.map((ingredientId, slotIndex) => {
            const ingredient = ingredientById(ingredientId)
            return (
              <button
                key={`${ingredientId}-${slotIndex}`}
                type="button"
                className="cooking-ingredient"
                aria-label={`${ingredient.label}を とる`}
                onClick={() => performAction({ type: 'pick-ingredient', slotIndex })}
              >
                <SpriteImage image={{ atlasId: 'food-01', symbolId: ingredient.symbolId }} alt={ingredient.label} width={72} height={72} />
                <span>{ingredient.label}</span>
              </button>
            )
          })}
        </section>

        <p className="cooking-feedback" role="status" aria-live="polite">{feedback}</p>
        <button type="button" className="cooking-quit" onClick={() => setGame(null)}>おみせを とじる</button>
      </div>
    </PageLayout>
  )
}
