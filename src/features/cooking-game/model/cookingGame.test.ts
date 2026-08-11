import { describe, expect, it } from 'vitest'
import {
  applyCookingAction,
  calculateCookingResult,
  COOKING_RECIPES,
  startCookingGame,
  type CookingState,
} from './cookingGame'

const noShuffle = () => 0

const takeNextIngredient = (state: CookingState) => {
  const order = state.orders.find((candidate) => candidate.id === state.selectedOrderId)
  if (!order) throw new Error('選択中の注文がありません')
  const recipe = COOKING_RECIPES.find((candidate) => candidate.id === order.recipeId)
  if (!recipe) throw new Error('レシピがありません')
  const ingredientId = recipe.ingredients[order.completedIngredientIds.length]
  const slotIndex = state.conveyor.indexOf(ingredientId)
  if (slotIndex < 0) throw new Error('必要な食材がレーンにありません')
  return applyCookingAction(state, { type: 'pick-ingredient', slotIndex }, noShuffle)
}

describe('cookingGame', () => {
  it('opens with two orders and keeps each next ingredient on the conveyor', () => {
    const state = startCookingGame({ durationSeconds: 45 }, noShuffle)

    expect(state.status).toBe('playing')
    expect(state.orders).toHaveLength(2)
    expect(state.conveyor).toHaveLength(6)
    expect(state.selectedOrderId).toBe(state.orders[0]?.id)
    for (const order of state.orders) {
      const recipe = COOKING_RECIPES.find((candidate) => candidate.id === order.recipeId)
      expect(state.conveyor).toContain(recipe?.ingredients[0])
    }
  })

  it('builds a dish in order, raises the combo, and brings a new order', () => {
    let state = startCookingGame({ durationSeconds: 45 }, noShuffle)
    const firstOrderId = state.selectedOrderId
    const firstRecipe = COOKING_RECIPES.find((recipe) => recipe.id === state.orders[0]?.recipeId)
    if (!firstRecipe) throw new Error('最初のレシピがありません')

    let lastEvents = [] as ReturnType<typeof takeNextIngredient>['events']
    for (const _ingredient of firstRecipe.ingredients) {
      const transition = takeNextIngredient(state)
      state = transition.state
      lastEvents = transition.events
    }

    expect(state.completedDishCount).toBe(1)
    expect(state.combo).toBe(1)
    expect(state.score).toBeGreaterThan(100)
    expect(state.orders.some((order) => order.id === firstOrderId)).toBe(false)
    expect(lastEvents).toContainEqual({ type: 'dish-completed', recipeId: firstRecipe.id, combo: 1 })
  })

  it('sends an unneeded ingredient to the compost without advancing the recipe', () => {
    const state = startCookingGame({ durationSeconds: 45 }, noShuffle)
    const order = state.orders[0]
    const recipe = COOKING_RECIPES.find((candidate) => candidate.id === order?.recipeId)
    if (!order || !recipe) throw new Error('注文がありません')
    const wrongSlot = state.conveyor.findIndex((ingredientId) => ingredientId !== recipe.ingredients[0])

    const transition = applyCookingAction(state, { type: 'pick-ingredient', slotIndex: wrongSlot }, noShuffle)
    const updatedOrder = transition.state.orders.find((candidate) => candidate.id === order.id)

    expect(updatedOrder?.completedIngredientIds).toEqual([])
    expect(updatedOrder?.patience).toBeLessThan(order.patience)
    expect(transition.events).toEqual([{ type: 'ingredient-composted', ingredientId: state.conveyor[wrongSlot] }])
  })

  it('finishes when time runs out and clears after serving four dishes', () => {
    let state = startCookingGame({ durationSeconds: 1 }, noShuffle)
    while (state.completedDishCount < 4) {
      state = takeNextIngredient(state).state
    }

    const finished = applyCookingAction(state, { type: 'tick' }, noShuffle)

    expect(finished.state.status).toBe('finished')
    expect(finished.events).toContainEqual({ type: 'game-finished' })
    expect(calculateCookingResult(finished.state)).toMatchObject({
      isCleared: true,
      completedDishCount: 4,
    })
  })

  it('keeps the best combo in the result after the current combo is lost', () => {
    let state = startCookingGame({ durationSeconds: 1 }, noShuffle)
    const recipe = COOKING_RECIPES.find((candidate) => candidate.id === state.orders[0]?.recipeId)
    if (!recipe) throw new Error('レシピがありません')
    for (const _ingredient of recipe.ingredients) state = takeNextIngredient(state).state

    const selectedOrder = state.orders.find((order) => order.id === state.selectedOrderId)
    const selectedRecipe = COOKING_RECIPES.find((candidate) => candidate.id === selectedOrder?.recipeId)
    if (!selectedRecipe) throw new Error('次のレシピがありません')
    const wrongSlot = state.conveyor.findIndex((ingredientId) => ingredientId !== selectedRecipe.ingredients[0])
    state = applyCookingAction(state, { type: 'pick-ingredient', slotIndex: wrongSlot }, noShuffle).state
    state = applyCookingAction(state, { type: 'tick' }, noShuffle).state

    expect(state.combo).toBe(0)
    expect(calculateCookingResult(state).bestCombo).toBe(1)
  })
})
