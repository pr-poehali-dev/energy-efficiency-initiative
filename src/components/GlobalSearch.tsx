import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { search, SearchResult } from "@/lib/search-index"

const CATEGORY_ICON: Record<string, string> = {
  "Раздел":    "LayoutDashboard",
  "Газ":       "Flame",
  "Материал":  "Package",
  "Норматив":  "BookOpen",
}

interface Props {
  open: boolean
  onClose: () => void
  scrollToSection?: (index: number) => void
}

export default function GlobalSearch({ open, onClose, scrollToSection }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setResults(search(query))
    setActive(0)
  }, [query])

  function handleSelect(item: SearchResult) {
    onClose()
    if (item.route === "/" && item.sectionIndex !== undefined) {
      if (window.location.pathname === "/") {
        scrollToSection?.(item.sectionIndex)
      } else {
        navigate("/")
        setTimeout(() => scrollToSection?.(item.sectionIndex!), 300)
      }
    } else {
      navigate(item.route)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(v => Math.min(v + 1, results.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(v => Math.max(v - 1, 0)) }
    if (e.key === "Enter" && results[active]) handleSelect(results[active])
    if (e.key === "Escape") onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl rounded-2xl border border-foreground/10 bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/10">
          <Icon name="Search" size={16} className="text-foreground/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Поиск по разделам, газам, материалам..."
            className="flex-1 bg-transparent font-sans text-sm text-foreground placeholder:text-foreground/30 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-foreground/40 hover:text-foreground transition-colors">
              <Icon name="X" size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-foreground/30">
            Esc
          </kbd>
        </div>

        {results.length > 0 && (
          <ul className="max-h-[50vh] overflow-y-auto py-2">
            {results.map((item, i) => (
              <li key={item.id}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    active === i ? "bg-foreground/8" : "hover:bg-foreground/5"
                  }`}
                  style={{ backgroundColor: active === i ? "rgba(255,255,255,0.06)" : undefined }}
                >
                  <div className="mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center rounded-md border border-foreground/10 bg-foreground/5">
                    <Icon name={CATEGORY_ICON[item.category] ?? "FileText"} size={12} className="text-foreground/50" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-sm text-foreground truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="font-mono text-xs text-foreground/40 truncate mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-foreground/25 pt-0.5">{item.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <div className="py-10 text-center font-sans text-sm text-foreground/30">
            Ничего не найдено
          </div>
        )}

        {!query && (
          <div className="py-6 px-4 flex flex-wrap gap-2">
            {["Метан", "Вентиляция", "Бензин", "ПДК", "Пожаротушение"].map(hint => (
              <button
                key={hint}
                onClick={() => setQuery(hint)}
                className="rounded-lg border border-foreground/10 px-3 py-1.5 font-sans text-xs text-foreground/50 hover:border-foreground/25 hover:text-foreground/80 transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
