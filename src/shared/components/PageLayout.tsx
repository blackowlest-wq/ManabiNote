import type { ReactNode } from 'react'

export type PageLayoutProps = {
  title: string
  children: ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <main className="page-layout">
      <div className="page-layout__content">
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  )
}
