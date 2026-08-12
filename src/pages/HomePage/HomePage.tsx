import { Link } from 'react-router-dom'
import { GAME_CATEGORY_LIST } from '../../app/gameCategories'
import { PwaInstallButton } from '../../features/pwa-install/components/PwaInstallButton'
import { PageLayout } from '../../shared/components/PageLayout'

export function HomePage() {
  return (
    <PageLayout title="ManabiNote">
      <p>あそびながら いろいろ おぼえよう</p>
      <div className="home-actions" data-testid="home-actions">
        {GAME_CATEGORY_LIST.map((category) => (
          <Link key={category.to} className="category-link" aria-label={category.title} to={category.to}>
            <span className="category-link__label">{category.title}</span>
            <small className="category-link__description">{category.description}</small>
          </Link>
        ))}
        <PwaInstallButton />
      </div>
      <p><Link to="/history">クリア状況を見る</Link></p>
    </PageLayout>
  )
}
