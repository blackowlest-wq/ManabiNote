import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearHistory, loadHistory } from '../../features/history/model/historyStorage'
import { PageLayout } from '../../shared/components/PageLayout'

type HistoryPageProps = {
  storage?: Storage
}

const formatExecutionDate = (startedAt: string) => {
  const date = new Date(startedAt)
  return Number.isNaN(date.getTime()) ? startedAt : date.toLocaleString('ja-JP')
}

export function HistoryPage({ storage }: HistoryPageProps = {}) {
  const [history, setHistory] = useState(() => loadHistory(storage))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const clearTriggerRef = useRef<HTMLButtonElement>(null)
  const firstDialogActionRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreFocusRef = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

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
      if (clearTrigger?.isConnected) {
        clearTrigger.focus()
      }
    }
  }, [confirmOpen])

  const closeConfirmation = () => {
    setConfirmOpen(false)
    setClearError(null)
  }

  const handleClear = () => {
    const result = clearHistory(storage)
    if (!result.ok) {
      setClearError('履歴をクリアできませんでした。もう一度お試しください。')
      return
    }

    setHistory([])
    setConfirmOpen(false)
    setClearError(null)
  }

  return (
    <PageLayout title="学習履歴">
      {history.length === 0 ? (
        <p>まだ学習履歴がありません</p>
      ) : (
        <>
          <ul>
            {history.map((record) => (
              <li key={record.id}>
                <p>
                  <time dateTime={record.startedAt}>{formatExecutionDate(record.startedAt)}</time>
                </p>
                <p>{record.score} / {record.total}</p>
                <ul aria-label="回答結果">
                  {record.answers.map((answer) => (
                    <li key={answer.questionId}>
                      {answer.kana}：{answer.isCorrect ? '正解' : '不正解'}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button
            ref={clearTriggerRef}
            type="button"
            onClick={() => {
              setClearError(null)
              shouldRestoreFocusRef.current = true
              setConfirmOpen(true)
            }}
          >
            履歴をクリア
          </button>
        </>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby="history-clear-dialog-title"
        aria-modal="true"
        onCancel={(event) => {
          event.preventDefault()
          closeConfirmation()
        }}
        onClose={closeConfirmation}
      >
        <h2 id="history-clear-dialog-title">履歴をクリアしますか？</h2>
        <p>保存されている学習履歴がすべて削除されます。</p>
        {clearError && <p role="alert">{clearError}</p>}
        <button ref={firstDialogActionRef} type="button" onClick={closeConfirmation}>
          キャンセル
        </button>
        <button type="button" onClick={handleClear}>削除する</button>
      </dialog>
      <Link to="/">ホームへ戻る</Link>
    </PageLayout>
  )
}
