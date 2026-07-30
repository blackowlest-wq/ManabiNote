import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadHistory } from '../../features/history/model/historyStorage'
import { PageLayout } from '../../shared/components/PageLayout'

export function HistoryPage() {
  const [history] = useState(() => loadHistory())

  return (
    <PageLayout title="学習履歴">
      {history.length === 0 ? (
        <p>まだ学習履歴がありません</p>
      ) : (
        <ul>
          {history.map((record) => <li key={record.id}>{record.score} / {record.total}</li>)}
        </ul>
      )}
      <Link to="/">ホームへ戻る</Link>
    </PageLayout>
  )
}
