export type ShopProductId =
  | 'apple'
  | 'banana'
  | 'bread'
  | 'milk'
  | 'carrot'
  | 'egg'
  | 'strawberry'
  | 'fish'

export type ShopProduct = {
  id: ShopProductId
  label: string
  emoji: string
  price: number
}

export type ShopOrder = {
  id: string
  customer: string
  items: Readonly<Partial<Record<ShopProductId, number>>>
  patience: number
  memoryAfterFirstPick?: boolean
}

export type ShopGameState = {
  status: 'playing' | 'finished'
  durationSeconds: number
  timeLeft: number
  orderIndex: number
  basket: readonly ShopProductId[]
  score: number
  coins: number
  combo: number
  bestCombo: number
  servedCount: number
  missedCount: number
  patience: number
  maxPatience: number
  orderHidden: boolean
}

export type ShopGameAction =
  | { type: 'pick-product'; productId: ShopProductId }
  | { type: 'remove-product'; basketIndex: number }
  | { type: 'deliver' }
  | { type: 'tick' }

export type ShopGameEvent =
  | { type: 'product-added'; productId: ShopProductId }
  | { type: 'product-removed'; productId: ShopProductId }
  | { type: 'basket-full' }
  | { type: 'basket-mismatch' }
  | { type: 'order-delivered'; orderId: string; combo: number }
  | { type: 'customer-left'; orderId: string }
  | { type: 'game-finished' }

export type ShopGameTransition = {
  state: ShopGameState
  events: readonly ShopGameEvent[]
}

export type ShopGameResult = {
  score: number
  coins: number
  servedCount: number
  missedCount: number
  bestCombo: number
  isCleared: boolean
}

export const SHOP_CLEAR_TARGET = 5
export const SHOP_BASKET_CAPACITY = 6

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  { id: 'apple', label: 'りんご', emoji: '🍎', price: 2 },
  { id: 'banana', label: 'バナナ', emoji: '🍌', price: 2 },
  { id: 'bread', label: 'パン', emoji: '🍞', price: 3 },
  { id: 'milk', label: 'ぎゅうにゅう', emoji: '🥛', price: 3 },
  { id: 'carrot', label: 'にんじん', emoji: '🥕', price: 1 },
  { id: 'egg', label: 'たまご', emoji: '🥚', price: 2 },
  { id: 'strawberry', label: 'いちご', emoji: '🍓', price: 3 },
  { id: 'fish', label: 'さかな', emoji: '🐟', price: 4 },
]

export const SHOP_ORDERS: readonly ShopOrder[] = [
  { id: 'apple-pair', customer: '🐰', items: { apple: 2 }, patience: 18 },
  { id: 'breakfast', customer: '🐻', items: { banana: 1, milk: 1 }, patience: 18 },
  { id: 'picnic', customer: '🐼', items: { bread: 2, egg: 1 }, patience: 17 },
  { id: 'memory-vegetables', customer: '🦊', items: { carrot: 3, apple: 1 }, patience: 16, memoryAfterFirstPick: true },
  { id: 'memory-fruits', customer: '🐨', items: { strawberry: 2, banana: 1, milk: 1 }, patience: 16, memoryAfterFirstPick: true },
  { id: 'fish-dinner', customer: '🐧', items: { fish: 1, carrot: 2 }, patience: 15 },
]

export const currentShopOrder = (state: ShopGameState) =>
  SHOP_ORDERS[state.orderIndex % SHOP_ORDERS.length] as ShopOrder

const productById = (productId: ShopProductId) => {
  const product = SHOP_PRODUCTS.find((candidate) => candidate.id === productId)
  if (!product) throw new Error('商品が見つかりません')
  return product
}

export function startShopGame(options: { durationSeconds?: number } = {}): ShopGameState {
  const durationSeconds = options.durationSeconds ?? 60
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) throw new Error('ゲーム時間が正しくありません')
  const firstOrder = SHOP_ORDERS[0]
  return {
    status: 'playing',
    durationSeconds,
    timeLeft: durationSeconds,
    orderIndex: 0,
    basket: [],
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    servedCount: 0,
    missedCount: 0,
    patience: firstOrder.patience,
    maxPatience: firstOrder.patience,
    orderHidden: false,
  }
}

const basketCounts = (basket: readonly ShopProductId[]) => {
  const counts: Partial<Record<ShopProductId, number>> = {}
  for (const productId of basket) counts[productId] = (counts[productId] ?? 0) + 1
  return counts
}

const basketMatches = (basket: readonly ShopProductId[], order: ShopOrder) => {
  const counts = basketCounts(basket)
  return SHOP_PRODUCTS.every(({ id }) => (counts[id] ?? 0) === (order.items[id] ?? 0))
}

const nextCustomer = (state: ShopGameState): ShopGameState => {
  const orderIndex = (state.orderIndex + 1) % SHOP_ORDERS.length
  const order = SHOP_ORDERS[orderIndex]
  return {
    ...state,
    orderIndex,
    basket: [],
    patience: order.patience,
    maxPatience: order.patience,
    orderHidden: false,
  }
}

export function applyShopAction(state: ShopGameState, action: ShopGameAction): ShopGameTransition {
  if (state.status === 'finished') return { state, events: [] }
  const order = currentShopOrder(state)

  if (action.type === 'pick-product') {
    if (state.basket.length >= SHOP_BASKET_CAPACITY) return { state, events: [{ type: 'basket-full' }] }
    return {
      state: {
        ...state,
        basket: [...state.basket, action.productId],
        orderHidden: Boolean(order.memoryAfterFirstPick),
      },
      events: [{ type: 'product-added', productId: action.productId }],
    }
  }

  if (action.type === 'remove-product') {
    const productId = state.basket[action.basketIndex]
    if (!productId) return { state, events: [] }
    return {
      state: { ...state, basket: state.basket.filter((_, index) => index !== action.basketIndex) },
      events: [{ type: 'product-removed', productId }],
    }
  }

  if (action.type === 'deliver') {
    if (!basketMatches(state.basket, order)) {
      return {
        state: { ...state, combo: 0, patience: Math.max(1, state.patience - 2) },
        events: [{ type: 'basket-mismatch' }],
      }
    }
    const combo = state.combo + 1
    const servedCount = state.servedCount + 1
    const coins = state.basket.reduce((total, productId) => total + productById(productId).price, 0)
    const delivered: ShopGameState = {
      ...state,
      servedCount,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      coins: state.coins + coins,
      score: state.score + 100 * combo + state.basket.length * 10,
    }
    const events: ShopGameEvent[] = [{ type: 'order-delivered', orderId: order.id, combo }]
    if (servedCount >= SHOP_CLEAR_TARGET) {
      events.push({ type: 'game-finished' })
      return { state: { ...delivered, status: 'finished', basket: [] }, events }
    }
    return { state: nextCustomer(delivered), events }
  }

  if (state.timeLeft <= 1) {
    return {
      state: { ...state, status: 'finished', timeLeft: 0 },
      events: [{ type: 'game-finished' }],
    }
  }
  if (state.patience <= 1) {
    return {
      state: nextCustomer({
        ...state,
        timeLeft: state.timeLeft - 1,
        missedCount: state.missedCount + 1,
        combo: 0,
      }),
      events: [{ type: 'customer-left', orderId: order.id }],
    }
  }
  return {
    state: { ...state, timeLeft: state.timeLeft - 1, patience: state.patience - 1 },
    events: [],
  }
}

export function calculateShopResult(state: ShopGameState): ShopGameResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return {
    score: state.score,
    coins: state.coins,
    servedCount: state.servedCount,
    missedCount: state.missedCount,
    bestCombo: state.bestCombo,
    isCleared: state.servedCount >= SHOP_CLEAR_TARGET,
  }
}
