import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RescueMazePage } from './RescueMazePage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (storage = makeStorage()) => render(
  <MemoryRouter>
    <RescueMazePage storage={storage} />
  </MemoryRouter>,
)

describe('RescueMazePage', () => {
  it('starts with only the first of six stages unlocked', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'どうぶつレスキュー' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /ステージ/ })).toHaveLength(6)
    expect(screen.getByRole('button', { name: /ステージ 1/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /ステージ 2/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /ステージ 1/ }))

    expect(screen.getByRole('grid', { name: 'どうぶつレスキューの迷路' })).toBeInTheDocument()
    expect(screen.getByText('ひよこを たすけよう')).toBeInTheDocument()
  })

  it('rescues the animal, clears the stage, and unlocks the next stage', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /ステージ 1/ }))

    await user.click(screen.getByRole('button', { name: 'みぎへ すすむ' }))
    await user.click(screen.getByRole('button', { name: 'したへ すすむ' }))
    await user.click(screen.getByRole('button', { name: 'したへ すすむ' }))
    expect(screen.getByRole('status')).toHaveTextContent('ひよこを たすけた！')
    await user.click(screen.getByRole('button', { name: 'みぎへ すすむ' }))
    await user.click(screen.getByRole('button', { name: 'したへ すすむ' }))

    const clearDialog = screen.getByRole('dialog', { name: 'ステージ クリア！' })
    expect(clearDialog).toHaveTextContent('🐾🐾🐾')
    await user.click(screen.getByRole('button', { name: 'ステージを えらぶ' }))

    expect(screen.getByRole('button', { name: /ステージ 2/ })).toBeEnabled()
  })

  it('lets a child or parent turn game sounds off', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /ステージ 1/ }))

    const soundButton = screen.getByRole('button', { name: 'おとを きる' })
    await user.click(soundButton)

    expect(screen.getByRole('button', { name: 'おとを だす' })).toBeInTheDocument()
  })
})
