import { Link } from 'react-router-dom'
import type { GameMenuItem } from '../../app/gameCategories'
import { PageLayout } from '../../shared/components/PageLayout'

export type CategoryPageProps = {
  title: string
  description: string
  games: readonly GameMenuItem[]
}

export function CategoryPage({ title, description, games }: CategoryPageProps) {
  return (
    <PageLayout title={title}>
      <div className="category-page">
        <p className="category-page__description">{description}</p>
        <nav className="category-page__games" aria-label={`${title}のゲーム`}>
          {games.map((game) => (
            <Link key={game.to} className="category-game-link" aria-label={game.label} to={game.to}>
              <span className="category-game-link__label">{game.label}</span>
              <small className="category-game-link__description">{game.description}</small>
            </Link>
          ))}
        </nav>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
