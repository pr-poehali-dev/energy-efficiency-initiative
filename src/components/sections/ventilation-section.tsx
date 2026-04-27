import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"
import { exportToWord, exportToExcel } from "@/lib/export-utils"

type TabKey = "area" | "resistance" | "leakage"

const TABS: { key: TabKey; label: string; full: string; short: string }[] = [
  { key: "area",       label: "Площадь сечения",           full: "Площадь сечения канала вентиляции",              short: "Сечение" },
  { key: "resistance", label: "Аэродин. сопротивление",    full: "Аэродинамическое сопротивление выработки",       short: "Сопротивл." },
  { key: "leakage",    label: "Утечки надшахтного здания", full: "Нормативные утечки воздуха через надшахтное здание", short: "Утечки" },
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

const SHAFT_TABLE = {
  skip: [
    { area: "до 100",    qn: null,  kn: null  },
    { area: "100–300",   qn: null,  kn: null  },
    { area: "300–500",   qn: 670,   kn: 11.2  },
    { area: "500–1000",  qn: 780,   kn: 13.0  },
    { area: "более 1000",qn: 950,   kn: 15.8  },
  ],
  cage: [
    { area: "до 100",    qn: 90,    kn: 1.5   },
    { area: "100–300",   qn: 190,   kn: 3.2   },
    { area: "300–500",   qn: 380,   kn: 6.3   },
    { area: "500–1000",  qn: 690,   kn: 11.5  },
    { area: "более 1000",qn: 850,   kn: 14.2  },
  ],
}

function LeakageCalculator() {
  const [shaftType, setShaftType] = useState<"skip" | "cage">("cage")
  const [areaIdx, setAreaIdx] = useState<number>(0)
  const [h, setH] = useState("")
  const [result, setResult] = useState<{ qzd: number; qnh: number } | null>(null)
  const [calculated, setCalculated] = useState(false)

  const rows = SHAFT_TABLE[shaftType]
  const selected = rows[areaIdx]

  const handleCalculate = () => {
    const hNum = parseFloat(h.replace(",", "."))
    if (isNaN(hNum) || hNum <= 0 || selected.qn === null || selected.kn === null) return
    const qnh = selected.qn + selected.kn * Math.sqrt(hNum)
    const qzd = selected.qn * Math.sqrt(hNum / 200)
    setResult({ qzd: parseFloat(qzd.toFixed(2)), qnh: parseFloat(qnh.toFixed(2)) })
    setCalculated(true)
  }

  const handleReset = () => {
    setH("")
    setResult(null)
    setCalculated(false)
  }

  const getExportData = () => ({
    title: "Нормативные утечки воздуха через надшахтное здание",
    formula: "Q_ут.зд = Q_ут.н × √(h / 200)",
    inputs: [
      { label: "Тип ствола", value: shaftType === "skip" ? "Скиповый" : "Клетевой", unit: "" },
      { label: "Площадь наружных стен", value: rows[areaIdx].area, unit: "м²" },
      { label: "Депрессия участка (h)", value: h, unit: "даПа" },
    ],
    results: result ? [
      { label: "Нормативные утечки Q_ут.зд", value: String(result.qzd), unit: "м³/мин" },
    ] : [],
  })

  const isReady = h && parseFloat(h) > 0 && selected.qn !== null

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
          <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
          <p className="font-mono text-xl text-foreground md:text-2xl">Q_ут.зд = Q_ут.н × √(h / 200)</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70 md:text-base">
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40 shrink-0">Q_ут.зд</span>
            <span>Нормативные утечки через надшахтное здание, м³/мин</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40 shrink-0">Q_ут.н</span>
            <span>Нормативные утечки (из таблицы 8.4), м³/мин</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 font-mono text-xs text-foreground/40 shrink-0">h</span>
            <span>Потеря депрессии на данном участке, даПа</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 font-mono text-xs text-foreground/40 uppercase tracking-widest">Табл. 8.4 — Нормы утечек (м³/мин)</p>
          <div className="overflow-x-auto rounded-lg border border-foreground/10">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/5">
                  <th className="px-3 py-2 text-left text-foreground/50">Площадь стен, м²</th>
                  <th className="px-3 py-2 text-center text-foreground/50">Скиповый Q_н</th>
                  <th className="px-3 py-2 text-center text-foreground/50">Клетевой Q_н</th>
                </tr>
              </thead>
              <tbody>
                {SHAFT_TABLE.cage.map((row, i) => (
                  <tr key={i} className="border-b border-foreground/5 last:border-0">
                    <td className="px-3 py-2 text-foreground/70">{row.area}</td>
                    <td className="px-3 py-2 text-center text-foreground/50">{SHAFT_TABLE.skip[i].qn ?? "—"}</td>
                    <td className="px-3 py-2 text-center text-foreground/70">{row.qn ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Тип ствола</label>
          <div className="flex gap-2">
            {([["cage", "Клетевой"], ["skip", "Скиповый"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setShaftType(key); setCalculated(false); setResult(null) }}
                className={`rounded-lg border px-4 py-2 font-sans text-sm transition-all ${
                  shaftType === key
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Площадь наружных стен и перекрытий, м²</label>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <button
                key={i}
                onClick={() => { setAreaIdx(i); setCalculated(false); setResult(null) }}
                disabled={row.qn === null}
                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 font-sans text-sm transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                  areaIdx === i && row.qn !== null
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 text-foreground/60 hover:border-foreground/35 hover:text-foreground"
                }`}
              >
                <span>{row.area}</span>
                {row.qn !== null && (
                  <span className={`font-mono text-xs ${areaIdx === i ? "text-background/60" : "text-foreground/35"}`}>
                    Q_н = {row.qn} м³/мин
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Депрессия участка — h, даПа</label>
          <input
            type="number"
            value={h}
            onChange={(e) => { setH(e.target.value); setCalculated(false) }}
            min="0"
            step="any"
            placeholder="Например: 200"
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

        {result !== null && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <div>
              <p className="font-mono text-xs text-foreground/40 mb-1">Нормативные утечки Q_ут.зд</p>
              <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
                {result.qzd} <span className="text-xl text-foreground/60">м³/мин</span>
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
          {activeTab === "leakage" && <LeakageCalculator />}
        </div>
      </div>
    </section>
  )
}