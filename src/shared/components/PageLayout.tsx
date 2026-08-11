import { useEffect, type ReactNode } from 'react'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import type { GameId } from '../../features/clear-progress/model/gameIds'

export type PageLayoutProps = {
  title: string
  children: ReactNode
  completedGameId?: GameId
}

export function PageLayout({ title, children, completedGameId }: PageLayoutProps) {
  useEffect(() => {
    if (completedGameId) markGameCleared(completedGameId)
  }, [completedGameId])

  return (
    <main className="page-layout">
      <div className="page-layout__content">
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  )
}
