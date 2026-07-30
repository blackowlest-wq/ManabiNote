import { useState } from 'react'
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
            type="button"
            onClick={() => {
              setClearError(null)
              setConfirmOpen(true)
            }}
          >
            履歴をクリア
          </button>
        </>
      )}
      {confirmOpen && (
        <dialog open aria-labelledby="history-clear-dialog-title" aria-modal="true">
          <h2 id="history-clear-dialog-title">履歴をクリアしますか？</h2>
          <p>保存されている学習履歴がすべて削除されます。</p>
          {clearError && <p role="alert">{clearError}</p>}
          <button
            type="button"
            autoFocus
            onClick={() => {
              setConfirmOpen(false)
              setClearError(null)
            }}
          >
            キャンセル
          </button>
          <button type="button" onClick={handleClear}>削除する</button>
        </dialog>
      )}
      <Link to="/">ホームへ戻る</Link>
    </PageLayout>
  )
}
