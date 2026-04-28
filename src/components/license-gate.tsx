import { useState } from "react"
import { useLicense } from "@/context/license-context"
import Icon from "@/components/ui/icon"

export function LicenseBanner() {
  const { isUnlocked, clientName, deactivate } = useLicense()
  const [showModal, setShowModal] = useState(false)

  if (isUnlocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
        <Icon name="ShieldCheck" size={14} />
        <span>Полная версия — {clientName}</span>
        <button onClick={deactivate} className="ml-1 text-green-400/50 hover:text-green-400 transition-colors">
          <Icon name="LogOut" size={12} />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border border-foreground/20 px-3 py-1.5 text-xs text-foreground/60 hover:border-foreground/40 hover:text-foreground transition-all"
      >
        <Icon name="Lock" size={14} />
        Демо-версия — ввести ключ
      </button>
      {showModal && <LicenseModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export function LicenseModal({ onClose }: { onClose: () => void }) {
  const { activate, isLoading, error } = useLicense()
  const [key, setKey] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await activate(key.trim())
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-foreground/20 bg-background p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="font-sans text-2xl font-light text-foreground">Активация</h3>
            <p className="mt-1 font-mono text-xs text-foreground/50">Введите лицензионный ключ для полного доступа</p>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              autoFocus
              className="w-full border-b border-foreground/30 bg-transparent py-3 font-mono text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none tracking-widest"
            />
            {error && (
              <p className="mt-2 font-mono text-xs text-red-400 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />{error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!key.trim() || isLoading}
            className="w-full rounded-lg bg-foreground py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Icon name="Loader" size={16} />Проверка...</> : <><Icon name="Unlock" size={16} />Активировать</>}
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-foreground/30 text-center">
          Ключ сохраняется в браузере — вводить повторно не нужно
        </p>
      </div>
    </div>
  )
}

export function DemoBlocker({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = useLicense()
  const [showModal, setShowModal] = useState(false)

  if (isUnlocked) return <>{children}</>

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/60 backdrop-blur-sm">
          <Icon name="Lock" size={24} className="text-foreground/50" />
          <p className="font-sans text-sm text-foreground/70">Доступно в полной версии</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-foreground px-5 py-2 font-sans text-sm font-medium text-background hover:opacity-80 transition-all"
          >
            Ввести ключ
          </button>
        </div>
      </div>
      {showModal && <LicenseModal onClose={() => setShowModal(false)} />}
    </>
  )
}