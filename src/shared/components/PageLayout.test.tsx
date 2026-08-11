import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { PageLayout } from './PageLayout'

vi.mock('../../features/clear-progress/model/clearProgressStorage', () => ({
  markGameCleared: vi.fn(),
}))

describe('PageLayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title as the semantic main heading', () => {
    render(
      <PageLayout title="ひらがなを れんしゅう">
        <p>ここから はじめよう</p>
      </PageLayout>,
    )

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'ひらがなを れんしゅう' }),
    )
    expect(screen.getByText('ここから はじめよう')).toBeInTheDocument()
  })

  it('records a completed game only when its id is supplied', () => {
    const view = render(<PageLayout title="ゲーム">プレイ中</PageLayout>)
    expect(markGameCleared).not.toHaveBeenCalled()

    view.rerender(<PageLayout title="けっか" completedGameId="quiz">クリア！</PageLayout>)
    expect(markGameCleared).toHaveBeenCalledOnce()
    expect(markGameCleared).toHaveBeenCalledWith('quiz')
  })
})
