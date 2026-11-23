import { useEffect, useState } from 'react'
import { Check, Download, Share2, Smartphone } from 'lucide-react'

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export default function InstallApp({ className = '' }) {
  const [promptEvent, setPromptEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandaloneMode)
  const ios = isIOS()

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setPromptEvent(event)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    if (choice.outcome === 'accepted') setInstalled(true)
  }

  if (installed) {
    return (
      <div className={`rounded-card border border-emerald-200 bg-emerald-50 p-4 ${className}`}>
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
          <Check className="h-5 w-5" aria-hidden="true" />
          Sawa Citi is installed
        </p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-700">
          You are running the app from your home screen. You can find its icon there anytime.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {promptEvent && (
        <button type="button" onClick={install} className="btn-accent w-full sm:w-auto">
          <Download className="h-4 w-4" aria-hidden="true" />
          Install Sawa Citi app
        </button>
      )}

      {ios ? (
        <div className="rounded-card border border-white/20 bg-white/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Install on iPhone or iPad
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-white/80">
            <li>Open this site in Safari.</li>
            <li>Tap the Share button (square with an arrow up).</li>
            <li>Choose “Add to Home Screen”.</li>
            <li>Tap “Add” — the Sawa Citi icon appears on your home screen.</li>
          </ol>
        </div>
      ) : (
        !promptEvent && (
          <div className="rounded-card border border-white/20 bg-white/10 p-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
              Install on Android
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              In Chrome, open the browser menu (three dots) and choose “Install app” or “Add to Home
              screen”. Then tap the Sawa Citi icon to open the app.
            </p>
          </div>
        )
      )}
    </div>
  )
}
