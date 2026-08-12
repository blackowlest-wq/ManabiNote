import { useEffect, useState } from 'react'

type InstallPromptResult = {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<InstallPromptResult>
}

const isStandaloneApp = () => {
  if (typeof window === 'undefined') return false

  const displayModeStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }

  return displayModeStandalone || navigatorWithStandalone.standalone === true
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandaloneApp)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as Partial<InstallPromptEvent>
      if (typeof promptEvent.prompt !== 'function') return

      event.preventDefault()
      setInstallPrompt(promptEvent as InstallPromptEvent)
      setShowManualInstructions(false)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setShowManualInstructions(false)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  if (isInstalled) return null

  const install = async () => {
    const currentPrompt = installPrompt
    if (!currentPrompt) {
      setShowManualInstructions(true)
      return
    }

    try {
      const result = await currentPrompt.prompt()
      if (result.outcome === 'accepted') setIsInstalled(true)
      if (result.outcome === 'dismissed') setShowManualInstructions(true)
    } catch {
      setShowManualInstructions(true)
    } finally {
      setInstallPrompt(null)
    }
  }

  return (
    <>
      <button
        type="button"
        className="pwa-install-button primary-button"
        aria-label="アプリを追加"
        onClick={() => void install()}
      >
        📲 アプリを追加
      </button>
      {showManualInstructions && (
        <p className="pwa-install-help" role="status">
          ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選んでね。
        </p>
      )}
    </>
  )
}
