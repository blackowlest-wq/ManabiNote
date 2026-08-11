import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GAME_CATEGORY_LIST } from '../../app/gameCategories'
import { clearClearProgress, loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { clearRescueProgress } from '../../features/rescue-maze/model/rescueProgressStorage'
import { PageLayout } from '../../shared/components/PageLayout'

type HistoryPageProps = {
  storage?: Storage
}

const TOTAL_GAMES = GAME_CATEGORY_LIST.reduce((total, category) => total + category.games.length, 0)

export function HistoryPage({ storage }: HistoryPageProps = {}) {
  const [progress, setProgress] = useState(() => loadClearProgress(storage))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const clearTriggerRef = useRef<HTMLButtonElement>(null)
  const firstDialogActionRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreFocusRef = useRef(false)
  const clearedGameIds = new Set(progress.map((record) => record.gameId))

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (confirmOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          try {
            dialog.showModal()
          } catch {
            dialog.setAttribute('open', '')
          }
        } else {
          dialog.setAttribute('open', '')
        }
      }
      firstDialogActionRef.current?.focus()
      return
    }

    if (dialog.open) {
      if (typeof dialog.close === 'function') {
        try {
          dialog.close()
        } catch {
          dialog.removeAttribute('open')
        }
      } else {
        dialog.removeAttribute('open')
      }
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false
      const clearTrigger = clearTriggerRef.current
      if (clearTrigger?.isConnected) clearTrigger.focus()
    }
  }, [confirmOpen])

  const closeConfirmation = () => {
    setConfirmOpen(false)
    setClearError(null)
  }

  const handleClear = () => {
    const rescueResult = clearRescueProgress(storage)
    if (!rescueResult.ok) {
      setClearError('クリア状況をリセットできませんでした。もう一度お試しください。')
      return
    }

    const result = clearClearProgress(storage)
    if (!result.ok) {
      setClearError('クリア状況をリセットできませんでした。もう一度お試しください。')
      return
    }

    setProgress([])
    setConfirmOpen(false)
    setClearError(null)
  }

  return (
    <PageLayout title="クリア状況">
      <div className="clear-progress-page">
        <p className="clear-progress-page__description">ゲームを さいごまで できたら クリア！</p>
        <p className="clear-progress-summary" aria-label={`ぜんぶで ${TOTAL_GAMES}こ中 ${clearedGameIds.size}こ クリア`}>
          <strong>{clearedGameIds.size}</strong> / {TOTAL_GAMES} クリア
        </p>

        <div className="clear-progress-categories">
          {GAME_CATEGORY_LIST.map((category) => (
            <section key={category.to} className="clear-progress-category" aria-labelledby={`clear-progress-${category.to.slice(1)}`}>
              <h2 id={`clear-progress-${category.to.slice(1)}`}>{category.title}</h2>
              <ul>
                {category.games.map((game) => {
                  const isCleared = clearedGameIds.has(game.id)
                  return (
                    <li key={game.id} className={isCleared ? 'clear-progress-game clear-progress-game--cleared' : 'clear-progress-game'}>
                      <Link to={game.to}>{game.label}</Link>
                      <span className={`clear-progress-status clear-progress-status--${isCleared ? 'cleared' : 'not-cleared'}`}>
                        {isCleared ? '✓ クリア済み' : '未クリア'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        {clearedGameIds.size > 0 && (
          <button
            ref={clearTriggerRef}
            className="clear-progress-reset"
            type="button"
            onClick={() => {
              setClearError(null)
              shouldRestoreFocusRef.current = true
              setConfirmOpen(true)
            }}
          >
            クリア状況をリセット
          </button>
        )}

        <dialog
          ref={dialogRef}
          aria-labelledby="clear-progress-dialog-title"
          aria-modal="true"
          onCancel={(event) => {
            event.preventDefault()
            closeConfirmation()
          }}
          onClose={closeConfirmation}
        >
          <h2 id="clear-progress-dialog-title">クリア状況をリセットしますか？</h2>
          <p>すべてのゲームが 未クリアに もどり、どうぶつレスキューは ステージ1からに なります。</p>
          {clearError && <p role="alert">{clearError}</p>}
          <button ref={firstDialogActionRef} type="button" onClick={closeConfirmation}>キャンセル</button>
          <button type="button" onClick={handleClear}>リセットする</button>
        </dialog>

        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
