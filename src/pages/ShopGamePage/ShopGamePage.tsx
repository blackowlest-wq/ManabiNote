import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import {
  applyShopAction,
  calculateShopResult,
  currentShopOrder,
  SHOP_BASKET_CAPACITY,
  SHOP_CLEAR_TARGET,
  SHOP_PRODUCTS,
  startShopGame,
  type ShopGameAction,
  type ShopGameEvent,
  type ShopGameState,
  type ShopProductId,
} from '../../features/shop-game/model/shopGame'
import { PageLayout } from '../../shared/components/PageLayout'

export type ShopGamePageProps = {
  storage?: Storage
  durationSeconds?: number
  initialState?: ShopGameState
}

const productById = (productId: ShopProductId) => {
  const product = SHOP_PRODUCTS.find((candidate) => candidate.id === productId)
  if (!product) throw new Error('商品が見つかりません')
  return product
}

const messageFor = (events: readonly ShopGameEvent[]) => {
  if (events.some((event) => event.type === 'order-delivered')) return 'おかいあげ ありがとう！'
  const added = events.find((event) => event.type === 'product-added')
  if (added?.type === 'product-added') return `${productById(added.productId).label}を かごへ！`
  const removed = events.find((event) => event.type === 'product-removed')
  if (removed?.type === 'product-removed') return `${productById(removed.productId).label}を もどしたよ`
  if (events.some((event) => event.type === 'basket-full')) return 'かごが いっぱい！'
  if (events.some((event) => event.type === 'basket-mismatch')) return 'かごを もういちど みてみよう'
  if (events.some((event) => event.type === 'customer-left')) return 'つぎの おきゃくさんが きたよ'
  return null
}

export function ShopGamePage({
  storage,
  durationSeconds = 60,
  initialState,
}: ShopGamePageProps = {}) {
  const [game, setGame] = useState<ShopGameState | null>(initialState ?? null)
  const [feedback, setFeedback] = useState('しょうひんを かごに いれよう！')
  const clearRecorded = useRef(false)
  const result = useMemo(
    () => game?.status === 'finished' ? calculateShopResult(game) : null,
    [game],
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        if (!current || current.status !== 'playing') return current
        const transition = applyShopAction(current, { type: 'tick' })
        const message = messageFor(transition.events)
        if (message) setFeedback(message)
        return transition.state
      })
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [game?.status])

  useEffect(() => {
    if (!result?.isCleared || clearRecorded.current) return
    clearRecorded.current = true
    markGameCleared('shop-game', storage)
  }, [result, storage])

  const startGame = () => {
    clearRecorded.current = false
    setGame(startShopGame({ durationSeconds }))
    setFeedback('しょうひんを かごに いれよう！')
  }

  const act = (action: ShopGameAction) => {
    if (!game || game.status !== 'playing') return
    const transition = applyShopAction(game, action)
    const message = messageFor(transition.events)
    if (message) setFeedback(message)
    setGame(transition.state)
  }

  if (!game) {
    return (
      <PageLayout title="どうぶつマーケット">
        <div className="shop-game-intro">
          <div className="shop-game-intro__scene" aria-hidden="true">🏪 🐰 🛒</div>
          <p>ちゅうもんを みて、しょうひんを かごに いれよう！</p>
          <p>{SHOP_CLEAR_TARGET}にん せっきゃくできたら おみせマスター！</p>
          <button type="button" className="primary-button" onClick={startGame}>おみせを ひらく</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  if (result) {
    return (
      <PageLayout title="どうぶつマーケット">
        <div className="shop-game-result">
          <div className="shop-game-result__scene" aria-hidden="true">{result.isCleared ? '🎉🏪🎉' : '🛒✨'}</div>
          <h2>{result.isCleared ? 'おみせマスター！' : 'また きてね！'}</h2>
          <p className="shop-game-result__score">{result.score} てん</p>
          <p>🪙 {result.coins}まい　🐾 {result.servedCount}にん</p>
          <p>さいこう {result.bestCombo}コンボ</p>
          <button type="button" className="primary-button" onClick={startGame}>もういちど</button>
          <Link to="/play">あそびへ戻る</Link>
        </div>
      </PageLayout>
    )
  }

  const order = currentShopOrder(game)

  return (
    <PageLayout title="どうぶつマーケット">
      <div className="shop-game-page">
        <div className="shop-game-hud" aria-label="おみせの きろく">
          <span aria-label={`のこり ${game.timeLeft}びょう`}>⏰ {game.timeLeft}</span>
          <span aria-label={`${game.coins}コイン`}>🪙 {game.coins}</span>
          <span aria-label={`せっきゃく ${game.servedCount}にん`}>🐾 {game.servedCount}</span>
          <span aria-label={`${game.combo}コンボ`}>🔥 {game.combo}</span>
        </div>

        <section className="shop-customer" aria-label="おきゃくさんの ちゅうもん">
          <span className="shop-customer__face" aria-hidden="true">{order.customer}</span>
          <div className="shop-order-bubble">
            {game.orderHidden ? (
              <div className="shop-order-memory"><b>？</b><span>おぼえてるかな？</span></div>
            ) : (
              <div className="shop-order-items">
                {SHOP_PRODUCTS.flatMap((product) => {
                  const count = order.items[product.id] ?? 0
                  return count > 0 ? [(
                    <span key={product.id} aria-label={`${product.label}${count}こ`}>
                      <b aria-hidden="true">{product.emoji}</b><strong>×{count}</strong>
                    </span>
                  )] : []
                })}
              </div>
            )}
            <span className="shop-patience" aria-label={`まちじかん ${game.patience}`}>
              <span style={{ width: `${(game.patience / game.maxPatience) * 100}%` }} />
            </span>
          </div>
        </section>

        <section className="shop-shelf" aria-label="しょうひんだな">
          {SHOP_PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              aria-label={`${product.label}を かごに いれる`}
              onClick={() => act({ type: 'pick-product', productId: product.id })}
            >
              <b aria-hidden="true">{product.emoji}</b>
              <span>{product.label}</span>
              <small>🪙{product.price}</small>
            </button>
          ))}
        </section>

        <section className="shop-basket" aria-label={`おかいものかご ${game.basket.length}こ`}>
          <strong>🛒 かご</strong>
          <div>
            {Array.from({ length: SHOP_BASKET_CAPACITY }, (_, index) => {
              const productId = game.basket[index]
              return productId ? (
                <button
                  key={`${productId}-${index}`}
                  type="button"
                  aria-label={`${productById(productId).label}を かごから もどす`}
                  onClick={() => act({ type: 'remove-product', basketIndex: index })}
                >
                  <span aria-hidden="true">{productById(productId).emoji}</span>
                </button>
              ) : <span key={index} aria-hidden="true">＋</span>
            })}
          </div>
        </section>

        <button type="button" className="shop-deliver" onClick={() => act({ type: 'deliver' })}>おきゃくさんに わたす</button>
        <p className="shop-game-feedback" role="status" aria-live="polite">{feedback}</p>
        <button type="button" className="shop-game-quit" onClick={() => setGame(null)}>おみせを とじる</button>
      </div>
    </PageLayout>
  )
}
