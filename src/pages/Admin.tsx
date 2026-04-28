import { useState, useEffect, useCallback } from "react"
import Icon from "@/components/ui/icon"

const ADMIN_URL = "https://functions.poehali.dev/7e0e505c-5045-4d0c-b9be-dcdb0bd05f88"
const STORAGE_KEY = "admin_password"

interface LicenseKey {
  id: number
  key: string
  client_name: string
  is_active: boolean
  created_at: string
  expires_at: string | null
}

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${seg()}-${seg()}-${seg()}`
}

async function api(pwd: string, action: string, extra: object = {}) {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pwd, action, ...extra }),
  })
  const data = await res.json()
  return typeof data === "string" ? JSON.parse(data) : data
}

export default function Admin() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  const [keys, setKeys] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(false)
  const [savedPwd, setSavedPwd] = useState("")

  const [newKey, setNewKey] = useState(generateKey())
  const [newName, setNewName] = useState("")
  const [newExpires, setNewExpires] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [copied, setCopied] = useState<number | null>(null)

  const fetchKeys = useCallback(async (pwd: string) => {
    setLoading(true)
    const data = await api(pwd, "list")
    setLoading(false)
    return data
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")
    const data = await fetchKeys(password)
    setAuthLoading(false)
    if (data.error) {
      setAuthError("Неверный пароль")
    } else {
      setKeys(data.keys || [])
      setSavedPwd(password)
      localStorage.setItem(STORAGE_KEY, password)
      setAuthed(true)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      fetchKeys(saved).then(data => {
        if (!data.error) {
          setKeys(data.keys || [])
          setSavedPwd(saved)
          setAuthed(true)
        }
      })
    }
  }, [fetchKeys])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim() || !newName.trim()) return
    setAdding(true)
    setAddError("")
    const data = await api(savedPwd, "add", {
      key: newKey.trim(),
      client_name: newName.trim(),
      expires_at: newExpires || null,
    })
    setAdding(false)
    if (data.error) {
      setAddError(data.error)
    } else {
      setNewKey(generateKey())
      setNewName("")
      setNewExpires("")
      const fresh = await fetchKeys(savedPwd)
      setKeys(fresh.keys || [])
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить ключ клиента «${name}»?`)) return
    await api(savedPwd, "delete", { id })
    const fresh = await fetchKeys(savedPwd)
    setKeys(fresh.keys || [])
  }

  const handleCopy = (key: string, id: number) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
    setPassword("")
    setKeys([])
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="font-sans text-3xl font-light text-foreground">Администратор</h1>
            <p className="mt-1 font-mono text-xs text-foreground/40">Управление лицензионными ключами</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs text-foreground/60">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                placeholder="Введите пароль"
                className="w-full border-b border-foreground/30 bg-transparent py-3 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none"
              />
              {authError && (
                <p className="mt-2 font-mono text-xs text-red-400 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />{authError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!password || authLoading}
              className="w-full rounded-lg bg-foreground py-3 font-sans text-sm font-medium text-background hover:opacity-80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? <><Icon name="Loader" size={16} />Вход...</> : <><Icon name="LogIn" size={16} />Войти</>}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-light text-foreground">Лицензионные ключи</h1>
            <p className="font-mono text-xs text-foreground/40 mt-1">Всего: {keys.length}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/60 hover:border-foreground/40 hover:text-foreground transition-all">
            <Icon name="LogOut" size={14} />Выйти
          </button>
        </div>

        <div className="mb-8 rounded-xl border border-foreground/10 bg-foreground/5 p-6">
          <p className="mb-4 font-mono text-xs text-foreground/50 uppercase tracking-widest">Добавить клиента</p>
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
            <div>
              <label className="mb-1 block font-mono text-xs text-foreground/50">Имя клиента</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Шахта Северная"
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-foreground/50">Ключ</label>
              <div className="flex gap-2 items-center border-b border-foreground/30">
                <input
                  type="text"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="w-full bg-transparent py-2 font-mono text-sm text-foreground focus:outline-none tracking-wider"
                />
                <button type="button" onClick={() => setNewKey(generateKey())}
                  className="text-foreground/40 hover:text-foreground transition-colors shrink-0">
                  <Icon name="RefreshCw" size={14} />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-foreground/50">Срок (необяз.)</label>
              <input
                type="date"
                value={newExpires}
                onChange={e => setNewExpires(e.target.value)}
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-sm text-foreground focus:border-foreground/60 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!newName.trim() || !newKey.trim() || adding}
                className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2 font-sans text-sm font-medium text-background hover:opacity-80 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Icon name={adding ? "Loader" : "Plus"} size={15} />
                {adding ? "Добавляю..." : "Добавить"}
              </button>
            </div>
          </form>
          {addError && <p className="mt-3 font-mono text-xs text-red-400">{addError}</p>}
        </div>

        <div className="rounded-xl border border-foreground/10 bg-foreground/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-foreground/40">
              <Icon name="Loader" size={20} />
            </div>
          ) : keys.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm text-foreground/30">Ключей пока нет</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_120px_100px_60px] border-b border-foreground/10 px-5 py-3 bg-background/40">
                <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Клиент / Ключ</p>
                <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Создан</p>
                <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Истекает</p>
                <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest text-right">Удалить</p>
              </div>
              {keys.map(k => (
                <div key={k.id} className="grid grid-cols-[1fr_120px_100px_60px] border-b border-foreground/5 last:border-0 px-5 py-4 hover:bg-foreground/5 transition-colors items-center">
                  <div>
                    <p className="text-sm text-foreground font-medium">{k.client_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono text-xs text-foreground/50 tracking-wider">{k.key}</p>
                      <button onClick={() => handleCopy(k.key, k.id)}
                        className="text-foreground/30 hover:text-foreground transition-colors">
                        <Icon name={copied === k.id ? "Check" : "Copy"} size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-foreground/50">
                    {new Date(k.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="font-mono text-xs text-foreground/50">
                    {k.expires_at ? new Date(k.expires_at).toLocaleDateString('ru-RU') : "Бессрочно"}
                  </p>
                  <div className="flex justify-end">
                    <button onClick={() => handleDelete(k.id, k.client_name)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1.5 font-mono text-xs text-red-400/70 hover:border-red-500/50 hover:text-red-400 transition-all">
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
