import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const VERIFY_URL = "https://functions.poehali.dev/7513af2e-460b-4420-bcdd-cdb9318f6eea"
const STORAGE_KEY = "license_key"

interface LicenseContextValue {
  isUnlocked: boolean
  clientName: string | null
  isLoading: boolean
  error: string | null
  activate: (key: string) => Promise<boolean>
  deactivate: () => void
}

const LicenseContext = createContext<LicenseContextValue>({
  isUnlocked: false,
  clientName: null,
  isLoading: false,
  error: null,
  activate: async () => false,
  deactivate: () => {},
})

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [clientName, setClientName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      verifyKey(saved)
    }
  }, [])

  const verifyKey = async (key: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      const parsed = typeof data === "string" ? JSON.parse(data) : data
      if (parsed.valid) {
        setIsUnlocked(true)
        setClientName(parsed.client_name || null)
        return true
      } else {
        setIsUnlocked(false)
        setClientName(null)
        setError(parsed.error || "Неверный ключ")
        localStorage.removeItem(STORAGE_KEY)
        return false
      }
    } catch {
      setError("Ошибка соединения")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const activate = async (key: string): Promise<boolean> => {
    const ok = await verifyKey(key)
    if (ok) localStorage.setItem(STORAGE_KEY, key)
    return ok
  }

  const deactivate = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsUnlocked(false)
    setClientName(null)
    setError(null)
  }

  return (
    <LicenseContext.Provider value={{ isUnlocked, clientName, isLoading, error, activate, deactivate }}>
      {children}
    </LicenseContext.Provider>
  )
}

export const useLicense = () => useContext(LicenseContext)
