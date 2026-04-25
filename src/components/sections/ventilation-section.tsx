import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"
import { exportToWord, exportToExcel } from "@/lib/export-utils"

type TabKey = "area" | "resistance"

const TABS: { key: TabKey; label: string; full: string; short: string }[] = [
  { key: "area",       label: "Площадь сечения",           full: "Площадь сечения канала вентиляции",              short: "Сечение" },
  { key: "resistance", label: "Аэродин. сопротивление",    full: "Аэродинамическое сопротивление выработки",       short: "Сопротивл." },
]

function AreaCalculator() {
  const [L, setL] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = () => {
    const lNum = parseFloat(L.replace(",", "."))
    if (!isNaN(lNum) && lNum > 0) {
      const F = (lNum / 3600) * 3
      setResult(F)
      setCalculated(true)
    }
  }

  const handleReset = () => {
    setL("")
    setResult(null)
    setCalculated(false)
  }

  const getExportData = () => ({
    title: "Расчёт площади сечения канала вентиляции",
    formula: "F = (L / 3600) × Vс",
    inputs: [
      { label: "Подача ГВУ (L)", value: L, unit: "м³/ч" },
      { label: "Скорость принудит. проветривания (Vс)", value: "3", unit: "м/с" },
    ],
    results: result !== null ? [
      { label: "Площадь сечения канала (F)", value: result.toFixed(4), unit: "м²" },
      { label: "Площадь сечения канала (F)", value: (result * 10000).toFixed(2), unit: "см²" },
      { label: "Площадь сечения канала (F)", value: (result * 1000000).toFixed(0), unit: "мм²" },
    ] : [],
  })

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
          <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
          <p className="font-mono text-2xl text-foreground md:text-3xl">F = (L / 3600) × Vс</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70 md:text-base">
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">F</span>
            <span>Площадь сечения канала, м²</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">L</span>
            <span>Максимальная подача ГВУ (из паспорта), м³/ч</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">Vс</span>
            <span>Скорость при принудительном проветривании — <strong className="text-foreground">3 м/с</strong></span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Подача ГВУ — L, м³/ч</label>
          <input
            type="number"
            value={L}
            onChange={(e) => { setL(e.target.value); setCalculated(false) }}
            min="0"
            step="any"
            placeholder="Например: 12000"
            className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCalculate}
            disabled={!L || parseFloat(L) <= 0}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="Calculator" size={16} />
            Рассчитать
          </button>
          {calculated && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
          )}
        </div>

        {result !== null && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-1 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
              {result.toFixed(2)} <span className="text-2xl text-foreground/60">м²</span>
            </p>
            <p className="mt-2 font-mono text-xs text-foreground/50">
              {(result * 10000).toFixed(2)} см² · {(result * 1000000).toFixed(0)} мм²
            </p>
            <div className="mt-4 flex gap-2 border-t border-foreground/10 pt-4">
              <button
                onClick={() => exportToWord(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
              >
                <Icon name="FileText" size={14} />
                Word
              </button>
              <button
                onClick={() => exportToExcel(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
              >
                <Icon name="Sheet" size={14} fallback="Table" />
                Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResistanceCalculator() {
  const [h, setH] = useState("")
  const [v, setV] = useState("")
  const [S, setS] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [Q, setQ] = useState<number | null>(null)
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = () => {
    const hNum = parseFloat(h.replace(",", "."))
    const vNum = parseFloat(v.replace(",", "."))
    const sNum = parseFloat(S.replace(",", "."))
    if (!isNaN(hNum) && !isNaN(vNum) && !isNaN(sNum) && vNum > 0 && sNum > 0) {
      const qVal = vNum * sNum
      const rVal = hNum / (qVal * qVal)
      setQ(qVal)
      setResult(rVal)
      setCalculated(true)
    }
  }

  const handleReset = () => {
    setH("")
    setV("")
    setS("")
    setResult(null)
    setQ(null)
    setCalculated(false)
  }

  const getExportData = () => ({
    title: "Расчёт аэродинамического сопротивления выработки",
    formula: "Q = v × S; R = h / Q²",
    inputs: [
      { label: "Депрессия выработки (h)", value: h, unit: "кгс/м²" },
      { label: "Средняя скорость воздуха (v)", value: v, unit: "м/с" },
      { label: "Площадь поперечного сечения (S)", value: S, unit: "м²" },
    ],
    results: result !== null && Q !== null ? [
      { label: "Расход воздуха (Q)", value: Q.toFixed(4), unit: "м³/с" },
      { label: "Аэродинамическое сопротивление (R)", value: result.toFixed(6), unit: "кг·с²/м⁸" },
    ] : [],
  })

  const isReady = h && v && S && parseFloat(v) > 0 && parseFloat(S) > 0

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
          <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
          <p className="font-mono text-xl text-foreground md:text-2xl">R = h / Q²</p>
          <p className="mt-2 font-mono text-sm text-foreground/60">Q = v · S</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70 md:text-base">
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">R</span>
            <span>Аэродинамическое сопротивление, кг·с²/м⁸</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">h</span>
            <span>Депрессия выработки, кгс/м² (или Па)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">Q</span>
            <span>Количество воздуха, протекающего по выработке, м³/с</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">v</span>
            <span>Средняя скорость движения воздуха, м/с</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40">S</span>
            <span>Площадь поперечного сечения выработки, м²</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Депрессия выработки — h, кгс/м²</label>
          <input
            type="number"
            value={h}
            onChange={(e) => { setH(e.target.value); setCalculated(false) }}
            min="0"
            step="any"
            placeholder="Например: 5.2"
            className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Средняя скорость воздуха — v, м/с</label>
          <input
            type="number"
            value={v}
            onChange={(e) => { setV(e.target.value); setCalculated(false) }}
            min="0"
            step="any"
            placeholder="Например: 1.5"
            className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Площадь поперечного сечения — S, м²</label>
          <input
            type="number"
            value={S}
            onChange={(e) => { setS(e.target.value); setCalculated(false) }}
            min="0"
            step="any"
            placeholder="Например: 8.4"
            className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCalculate}
            disabled={!isReady}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="Calculator" size={16} />
            Рассчитать
          </button>
          {calculated && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
          )}
        </div>

        {result !== null && Q !== null && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <div className="mb-3 border-b border-foreground/10 pb-3">
              <p className="font-mono text-xs text-foreground/40 mb-1">Расход воздуха Q</p>
              <p className="font-sans text-2xl font-light text-foreground">
                {Q.toFixed(4)} <span className="text-base text-foreground/60">м³/с</span>
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-foreground/40 mb-1">Аэродинамическое сопротивление R</p>
              <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
                {result.toFixed(6)} <span className="text-xl text-foreground/60">кг·с²/м⁸</span>
              </p>
            </div>
            <div className="mt-4 flex gap-2 border-t border-foreground/10 pt-4">
              <button
                onClick={() => exportToWord(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
              >
                <Icon name="FileText" size={14} />
                Word
              </button>
              <button
                onClick={() => exportToExcel(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
              >
                <Icon name="Sheet" size={14} fallback="Table" />
                Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function VentilationSection({ sectionRef }: { sectionRef?: (el: HTMLElement | null) => void } = {}) {
  const { ref, isVisible } = useReveal(0.3)
  const [activeTab, setActiveTab] = useState<TabKey>("area")

  const activeTabData = TABS.find((t) => t.key === activeTab)!

  return (
    <section
      ref={(el) => { ref.current = el; sectionRef?.(el) }}
      className="flex min-h-screen w-full items-start px-4 py-24 md:px-12 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-10 transition-all duration-700 md:mb-14 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Вентиляция
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Расчёты для горных выработок</p>
        </div>

        {/* Вкладки */}
        <div
          className={`mb-10 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg border px-4 py-2 font-mono text-xs transition-all ${
                  activeTab === tab.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="mb-8 border-b border-foreground/10 pb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-1">Расчёт</p>
            <h3 className="font-sans text-2xl font-light text-foreground md:text-3xl">
              {activeTabData.full}
            </h3>
          </div>

          {activeTab === "area" && <AreaCalculator />}
          {activeTab === "resistance" && <ResistanceCalculator />}
        </div>
      </div>
    </section>
  )
}