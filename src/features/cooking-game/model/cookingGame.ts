export type IngredientId =
  | 'bread'
  | 'lettuce'
  | 'tomato'
  | 'egg'
  | 'milk'
  | 'carrot'
  | 'broccoli'
  | 'apple'
  | 'banana'
  | 'strawberry'

export type IngredientDefinition = {
  id: IngredientId
  label: string
  symbolId: string
}

export type CookingRecipe = {
  id: string
  name: string
  emoji: string
  ingredients: readonly IngredientId[]
}

export type CookingOrder = {
  id: string
  recipeId: string
  completedIngredientIds: readonly IngredientId[]
  patience: number
  maxPatience: number
}

export type CookingState = {
  status: 'playing' | 'finished'
  orders: readonly CookingOrder[]
  selectedOrderId: string
  conveyor: readonly IngredientId[]
  score: number
  combo: number
  bestCombo: number
  completedDishCount: number
  timeLeft: number
  durationSeconds: number
  nextRecipeIndex: number
  nextOrderNumber: number
}

export type CookingAction =
  | { type: 'select-order'; orderId: string }
  | { type: 'pick-ingredient'; slotIndex: number }
  | { type: 'tick' }

export type CookingEvent =
  | { type: 'ingredient-placed'; ingredientId: IngredientId; orderId: string }
  | { type: 'ingredient-composted'; ingredientId: IngredientId }
  | { type: 'dish-completed'; recipeId: string; combo: number }
  | { type: 'order-left'; recipeId: string }
  | { type: 'game-finished' }

export type CookingTransition = {
  state: CookingState
  events: readonly CookingEvent[]
}

export type CookingResult = {
  score: number
  completedDishCount: number
  bestCombo: number
  isCleared: boolean
}

export const COOKING_CLEAR_TARGET = 4
const ORDER_PATIENCE = 12

export const COOKING_INGREDIENTS: readonly IngredientDefinition[] = [
  { id: 'bread', label: 'パン', symbolId: 'bread' },
  { id: 'lettuce', label: 'レタス', symbolId: 'lettuce' },
  { id: 'tomato', label: 'トマト', symbolId: 'tomato' },
  { id: 'egg', label: 'たまご', symbolId: 'egg' },
  { id: 'milk', label: 'ぎゅうにゅう', symbolId: 'milk' },
  { id: 'carrot', label: 'にんじん', symbolId: 'carrot' },
  { id: 'broccoli', label: 'ブロッコリー', symbolId: 'broccoli' },
  { id: 'apple', label: 'りんご', symbolId: 'apple' },
  { id: 'banana', label: 'バナナ', symbolId: 'banana' },
  { id: 'strawberry', label: 'いちご', symbolId: 'strawberry' },
]

export const COOKING_RECIPES: readonly CookingRecipe[] = [
  { id: 'sandwich', name: 'サンドイッチ', emoji: '🥪', ingredients: ['bread', 'lettuce', 'tomato', 'bread'] },
  { id: 'salad', name: 'サラダ', emoji: '🥗', ingredients: ['lettuce', 'tomato', 'carrot'] },
  { id: 'breakfast', name: 'あさごはん', emoji: '🍳', ingredients: ['bread', 'egg', 'milk'] },
  { id: 'fruit-cup', name: 'フルーツカップ', emoji: '🍓', ingredients: ['apple', 'banana', 'strawberry'] },
  { id: 'vegetable-soup', name: 'やさいスープ', emoji: '🥕', ingredients: ['carrot', 'broccoli', 'tomato'] },
]

const recipeById = (recipeId: string) => {
  const recipe = COOKING_RECIPES.find((candidate) => candidate.id === recipeId)
  if (!recipe) throw new Error('レシピが見つかりません')
  return recipe
}

const createOrder = (recipeIndex: number, orderNumber: number): CookingOrder => ({
  id: `order-${orderNumber}`,
  recipeId: COOKING_RECIPES[recipeIndex % COOKING_RECIPES.length]?.id ?? COOKING_RECIPES[0].id,
  completedIngredientIds: [],
  patience: ORDER_PATIENCE,
  maxPatience: ORDER_PATIENCE,
})

const shuffle = <T>(values: readonly T[], random: () => number): T[] => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.min(Math.max(random(), 0), 0.999999) * (index + 1))
    const current = result[index] as T
    result[index] = result[swapIndex] as T
    result[swapIndex] = current
  }
  return result
}

const nextIngredientFor = (order: CookingOrder): IngredientId => {
  const recipe = recipeById(order.recipeId)
  return recipe.ingredients[order.completedIngredientIds.length] ?? recipe.ingredients[0]
}

const buildConveyor = (orders: readonly CookingOrder[], random: () => number): IngredientId[] => {
  const required = [...new Set(orders.map(nextIngredientFor))]
  const remaining = shuffle(
    COOKING_INGREDIENTS.map((ingredient) => ingredient.id).filter((ingredientId) => !required.includes(ingredientId)),
    random,
  )
  return shuffle([...required, ...remaining.slice(0, 6 - required.length)], random)
}

export function startCookingGame(
  options: { durationSeconds?: number } = {},
  random: () => number = Math.random,
): CookingState {
  const durationSeconds = options.durationSeconds ?? 45
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
    throw new Error('ゲーム時間が正しくありません')
  }
  const orders = [createOrder(0, 1), createOrder(1, 2)]
  return {
    status: 'playing',
    orders,
    selectedOrderId: orders[0].id,
    conveyor: buildConveyor(orders, random),
    score: 0,
    combo: 0,
    bestCombo: 0,
    completedDishCount: 0,
    timeLeft: durationSeconds,
    durationSeconds,
    nextRecipeIndex: 2,
    nextOrderNumber: 3,
  }
}

const replaceOrder = (
  orders: readonly CookingOrder[],
  orderId: string,
  recipeIndex: number,
  orderNumber: number,
) => orders.map((order) => order.id === orderId ? createOrder(recipeIndex, orderNumber) : order)

export function applyCookingAction(
  state: CookingState,
  action: CookingAction,
  random: () => number = Math.random,
): CookingTransition {
  if (state.status === 'finished') return { state, events: [] }

  if (action.type === 'select-order') {
    if (!state.orders.some((order) => order.id === action.orderId)) return { state, events: [] }
    return { state: { ...state, selectedOrderId: action.orderId }, events: [] }
  }

  if (action.type === 'tick') {
    if (state.timeLeft <= 1) {
      return {
        state: { ...state, status: 'finished', timeLeft: 0 },
        events: [{ type: 'game-finished' }],
      }
    }

    let nextRecipeIndex = state.nextRecipeIndex
    let nextOrderNumber = state.nextOrderNumber
    let selectedOrderId = state.selectedOrderId
    const events: CookingEvent[] = []
    const orders = state.orders.map((order) => {
      if (order.patience > 1) return { ...order, patience: order.patience - 1 }
      const replacement = createOrder(nextRecipeIndex, nextOrderNumber)
      nextRecipeIndex += 1
      nextOrderNumber += 1
      if (order.id === selectedOrderId) selectedOrderId = replacement.id
      events.push({ type: 'order-left', recipeId: order.recipeId })
      return replacement
    })

    return {
      state: {
        ...state,
        orders,
        selectedOrderId,
        conveyor: events.length > 0 ? buildConveyor(orders, random) : state.conveyor,
        combo: events.length > 0 ? 0 : state.combo,
        timeLeft: state.timeLeft - 1,
        nextRecipeIndex,
        nextOrderNumber,
      },
      events,
    }
  }

  const ingredientId = state.conveyor[action.slotIndex]
  const selectedOrder = state.orders.find((order) => order.id === state.selectedOrderId)
  if (!ingredientId || !selectedOrder) return { state, events: [] }
  const recipe = recipeById(selectedOrder.recipeId)
  const expectedIngredientId = recipe.ingredients[selectedOrder.completedIngredientIds.length]

  if (ingredientId !== expectedIngredientId) {
    const orders = state.orders.map((order) => order.id === selectedOrder.id
      ? { ...order, patience: Math.max(1, order.patience - 2) }
      : order)
    return {
      state: { ...state, orders, conveyor: buildConveyor(orders, random), combo: 0 },
      events: [{ type: 'ingredient-composted', ingredientId }],
    }
  }

  const completedIngredientIds = [...selectedOrder.completedIngredientIds, ingredientId]
  const ingredientEvent: CookingEvent = { type: 'ingredient-placed', ingredientId, orderId: selectedOrder.id }
  if (completedIngredientIds.length < recipe.ingredients.length) {
    const orders = state.orders.map((order) => order.id === selectedOrder.id
      ? { ...order, completedIngredientIds, patience: Math.min(order.maxPatience, order.patience + 1) }
      : order)
    return {
      state: { ...state, orders, conveyor: buildConveyor(orders, random), score: state.score + 10 },
      events: [ingredientEvent],
    }
  }

  const combo = state.combo + 1
  const replacement = createOrder(state.nextRecipeIndex, state.nextOrderNumber)
  const orders = state.orders.map((order) => order.id === selectedOrder.id ? replacement : order)
  return {
    state: {
      ...state,
      orders,
      selectedOrderId: replacement.id,
      conveyor: buildConveyor(orders, random),
      score: state.score + 10 + 100 * combo,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      completedDishCount: state.completedDishCount + 1,
      nextRecipeIndex: state.nextRecipeIndex + 1,
      nextOrderNumber: state.nextOrderNumber + 1,
    },
    events: [ingredientEvent, { type: 'dish-completed', recipeId: recipe.id, combo }],
  }
}

export function calculateCookingResult(state: CookingState): CookingResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return {
    score: state.score,
    completedDishCount: state.completedDishCount,
    bestCombo: state.bestCombo,
    isCleared: state.completedDishCount >= COOKING_CLEAR_TARGET,
  }
}
