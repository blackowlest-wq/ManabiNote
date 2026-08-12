import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PwaInstallButton } from './PwaInstallButton'

const createInstallPromptEvent = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  const prompt = vi.fn().mockResolvedValue({ outcome: 'accepted', platform: 'web' })
  Object.defineProperty(event, 'prompt', { value: prompt })
  return { event, prompt }
}

describe('PwaInstallButton', () => {
  it('shows browser menu instructions when an install prompt is unavailable', async () => {
    const user = userEvent.setup()
    render(<PwaInstallButton />)

    await user.click(screen.getByRole('button', { name: 'アプリを追加' }))

    expect(screen.getByRole('status')).toHaveTextContent('ホーム画面に追加')
  })

  it('appears when the browser reports that the app can be installed', () => {
    render(<PwaInstallButton />)
    const { event } = createInstallPromptEvent()

    fireEvent(window, event)

    expect(screen.getByRole('button', { name: 'アプリを追加' })).toBeInTheDocument()
    expect(event.defaultPrevented).toBe(true)
  })

  it('opens the browser install prompt and hides the button after acceptance', async () => {
    const user = userEvent.setup()
    render(<PwaInstallButton />)
    const { event, prompt } = createInstallPromptEvent()
    fireEvent(window, event)

    await user.click(screen.getByRole('button', { name: 'アプリを追加' }))

    expect(prompt).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'アプリを追加' })).not.toBeInTheDocument()
  })
})
