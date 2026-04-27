import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"
import { exportToWord, exportToExcel } from "@/lib/export-utils"

type TabKey = "area" | "resistance" | "leakage" | "explosion" | "fire-index" | "inert-gas" | "depression"

const TABS: { key: TabKey; label: string; full: string; short: string }[] = [
  { key: "area",        label: "Площадь сечения",           full: "Площадь сечения канала вентиляции",                        short: "Сечение" },
  { key: "resistance",  label: "Аэродин. сопротивление",    full: "Аэродинамическое сопротивление выработки",                 short: "Сопротивл." },
  { key: "leakage",     label: "Утечки надшахтного здания", full: "Нормативные утечки воздуха через надшахтное здание",       short: "Утечки" },
  { key: "explosion",   label: "Треугольник взрываемости",  full: "Определение взрываемости смеси горючих газов",             short: "Взрываемость" },
  { key: "fire-index",  label: "Пожарное состояние",        full: "Индексы пожарного состояния атмосферы (Грэхем, Янг)",     short: "Пожар. индекс" },
  { key: "inert-gas",   label: "Инертный газ",              full: "Расчёт подачи инертного газа для тушения пожара",          short: "Инерт. газ" },
  { key: "depression",  label: "Депрессия шахты",           full: "Расчёт депрессии и количества воздуха в шахте",            short: "Депрессия" },
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
            <div className="mb-3">
              <p className="font-mono text-xs text-foreground/40 mb-1">Нормативные утечки Q_ут.зд</p>
              <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
                {result.qzd} <span className="text-xl text-foreground/60">м³/мин</span>
              </p>
            </div>
            <div className="border-t border-foreground/10 pt-3">
              <p className="font-mono text-xs text-foreground/40 mb-1">В единицах м³/с</p>
              <p className="font-sans text-2xl font-light text-foreground">
                {parseFloat((result.qzd / 60).toFixed(4))} <span className="text-base text-foreground/60">м³/с</span>
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

// Треугольники взрываемости (Боевой устав ВГСЧ 1996, Приложение 11)
// Координаты вершин треугольника в пространстве (C_г%, O₂%)
// Каждый треугольник: [вершина A (верх-лево), вершина O (низ-лево), вершина D (право)]
// Данные оцифрованы с рис.1 для каждого PCO и PCH4
// prettier-ignore
const EXPLOSION_DATA: Record<string, Record<string, [number,number][]>> = {
  "0.0": {
    "1.0": [[5,20.9],[5,5],[5,5]],
    "0.9": [[5,20.9],[5,5.5],[12,9.5]],
    "0.8": [[5,20.9],[5,4.5],[16,10]],
    "0.7": [[5,20.9],[5,4],[20,10.5]],
    "0.6": [[5,20.9],[5,3.5],[24,11]],
    "0.5": [[5,20.9],[5,3],[27,11.5]],
    "0.4": [[5,20.9],[5,2.5],[29,12]],
    "0.3": [[5,20.9],[5,2],[31,13]],
  },
  "0.1": {
    "0.9": [[5,20.9],[5,5.5],[12,10]],
    "0.8": [[5,20.9],[5,5],[16,10.5]],
    "0.7": [[5,20.9],[5,4.5],[20,11]],
    "0.6": [[5,20.9],[5,4],[24,11.5]],
    "0.5": [[5,20.9],[5,3.5],[27,12]],
    "0.4": [[5,20.9],[5,3],[29,12.5]],
    "0.3": [[5,20.9],[5,2.5],[31,13.5]],
  },
  "0.2": {
    "0.8": [[5,20.9],[5,6],[14,11]],
    "0.7": [[5,20.9],[5,5.5],[18,11.5]],
    "0.6": [[5,20.9],[5,5],[22,12]],
    "0.5": [[5,20.9],[5,4.5],[26,12.5]],
    "0.4": [[5,20.9],[5,4],[29,13]],
    "0.3": [[5,20.9],[5,3.5],[31,13.5]],
  },
  "0.3": {
    "0.7": [[5,20.9],[5,6.5],[16,11.5]],
    "0.6": [[5,20.9],[5,6],[20,12]],
    "0.5": [[5,20.9],[5,5.5],[24,12.5]],
    "0.4": [[5,20.9],[5,5],[27,13]],
    "0.3": [[5,20.9],[5,4.5],[30,14]],
  },
  "0.4": {
    "0.6": [[5,20.9],[5,7],[18,12.5]],
    "0.5": [[5,20.9],[5,6.5],[22,13]],
    "0.4": [[5,20.9],[5,6],[25,13.5]],
    "0.3": [[5,20.9],[5,5.5],[28,14]],
  },
  "0.5": {
    "0.5": [[5,20.9],[5,8],[20,13]],
    "0.4": [[5,20.9],[5,7.5],[23,13.5]],
    "0.3": [[5,20.9],[5,7],[26,14]],
  },
}

function isPointInTriangle(px: number, py: number, tri: [number,number][]): boolean {
  const [A, B, C] = tri
  const sign = (p1: [number,number], p2: [number,number], p3: [number,number]) =>
    (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
  const d1 = sign([px,py], A, B)
  const d2 = sign([px,py], B, C)
  const d3 = sign([px,py], C, A)
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

function getNearestTriangle(pco: number, pch: number): { tri: [number,number][]; pcoKey: string; pchKey: string } | null {
  const pcoKeys = Object.keys(EXPLOSION_DATA).map(Number).sort((a,b) => Math.abs(a-pco) - Math.abs(b-pco))
  const bestPco = pcoKeys[0]
  const pcoKey = bestPco.toFixed(1)
  const pchKeys = Object.keys(EXPLOSION_DATA[pcoKey]).map(Number).sort((a,b) => Math.abs(a-pch) - Math.abs(b-pch))
  const bestPch = pchKeys[0]
  const pchKey = bestPch.toFixed(1)
  const tri = EXPLOSION_DATA[pcoKey]?.[pchKey]
  if (!tri) return null
  return { tri, pcoKey, pchKey }
}

function ExplosibilityCalculator() {
  const [ch4, setCh4] = useState("")
  const [co, setCo] = useState("")
  const [h2, setH2] = useState("")
  const [o2, setO2] = useState("")
  const [result, setResult] = useState<{
    C: number; pch: number; pco: number; ph: number;
    isExplosive: boolean; tri: [number,number][]; pcoKey: string; pchKey: string
  } | null>(null)
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = () => {
    const ch4n = parseFloat(ch4.replace(",",".")) || 0
    const con  = parseFloat(co.replace(",","."))  || 0
    const h2n  = parseFloat(h2.replace(",","."))  || 0
    const o2n  = parseFloat(o2.replace(",","."))  || 0
    const C = ch4n + con + h2n
    if (C <= 0) return
    const pch = ch4n / C
    const pco = con  / C
    const ph  = h2n  / C
    const found = getNearestTriangle(pco, pch)
    if (!found) return
    const isExplosive = isPointInTriangle(C, o2n, found.tri)
    setResult({ C: parseFloat(C.toFixed(3)), pch: parseFloat(pch.toFixed(3)), pco: parseFloat(pco.toFixed(3)), ph: parseFloat(ph.toFixed(3)), isExplosive, tri: found.tri, pcoKey: found.pcoKey, pchKey: found.pchKey })
    setCalculated(true)
  }

  const handleReset = () => {
    setCh4(""); setCo(""); setH2(""); setO2("")
    setResult(null); setCalculated(false)
  }

  // SVG координаты графика
  const SVG_W = 320, SVG_H = 220
  const PAD = { l: 36, r: 12, t: 12, b: 28 }
  const C_MAX = 32, O_MAX = 22
  const toSvgX = (c: number) => PAD.l + (c / C_MAX) * (SVG_W - PAD.l - PAD.r)
  const toSvgY = (o: number) => SVG_H - PAD.b - (o / O_MAX) * (SVG_H - PAD.t - PAD.b)
  const triPts = result ? result.tri.map(([c,o]) => `${toSvgX(c)},${toSvgY(o)}`).join(" ") : ""
  const dotX = result ? toSvgX(result.C) : 0
  const dotY = result ? toSvgY(parseFloat(o2.replace(",","."))) : 0

  const isReady = ch4 && o2 && (parseFloat(ch4)||0) + (parseFloat(co)||0) + (parseFloat(h2)||0) > 0

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50 uppercase tracking-widest">Метод</p>
          <p className="font-mono text-sm text-foreground">C = CH₄ + CO + H₂</p>
          <p className="mt-1 font-mono text-sm text-foreground/60">P<sub>CH</sub> = CH₄/C; P<sub>CO</sub> = CO/C; P<sub>H</sub> = H₂/C</p>
          <p className="mt-2 font-mono text-xs text-foreground/40">P<sub>CH</sub> + P<sub>CO</sub> + P<sub>H</sub> = 1</p>
        </div>

        <div className="space-y-2 text-sm text-foreground/70">
          <div className="flex gap-2"><span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0">C</span><span>Суммарное содержание горючих газов, %</span></div>
          <div className="flex gap-2"><span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0">O₂</span><span>Содержание кислорода, %</span></div>
          <div className="flex gap-2"><span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0">P_CH</span><span>Доля метана в смеси горючих</span></div>
          <div className="flex gap-2"><span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0">P_CO</span><span>Доля окиси углерода</span></div>
          <div className="flex gap-2"><span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0">P_H</span><span>Доля водорода</span></div>
        </div>

        <div className="mt-6 rounded-xl border border-foreground/10 overflow-hidden">
          <p className="px-3 py-2 font-mono text-xs text-foreground/40 uppercase tracking-widest border-b border-foreground/10">График треугольника взрываемости</p>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
            {/* Сетка */}
            {[0,4,8,12,16,20,24,28,32].map(c => (
              <line key={`gc${c}`} x1={toSvgX(c)} y1={PAD.t} x2={toSvgX(c)} y2={SVG_H-PAD.b} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
            ))}
            {[0,2,4,6,8,10,12,14,16,18,20,21].map(o => (
              <line key={`go${o}`} x1={PAD.l} y1={toSvgY(o)} x2={SVG_W-PAD.r} y2={toSvgY(o)} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
            ))}
            {/* Оси */}
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={SVG_H-PAD.b} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1"/>
            <line x1={PAD.l} y1={SVG_H-PAD.b} x2={SVG_W-PAD.r} y2={SVG_H-PAD.b} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1"/>
            {/* Подписи осей */}
            {[0,8,16,24,32].map(c => (
              <text key={`lc${c}`} x={toSvgX(c)} y={SVG_H-PAD.b+14} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.4">{c}</text>
            ))}
            {[0,5,10,15,20].map(o => (
              <text key={`lo${o}`} x={PAD.l-4} y={toSvgY(o)+3} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4">{o}</text>
            ))}
            <text x={SVG_W/2} y={SVG_H-2} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.5">C_г, %</text>
            <text x={8} y={SVG_H/2} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.5" transform={`rotate(-90,8,${SVG_H/2})`}>O₂, %</text>

            {/* Треугольник взрываемости */}
            {result && (
              <polygon
                points={triPts}
                fill={result.isExplosive ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)"}
                stroke={result.isExplosive ? "rgb(239,68,68)" : "rgb(34,197,94)"}
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
            )}
            {/* Точка */}
            {result && (
              <>
                <circle cx={dotX} cy={dotY} r="5" fill={result.isExplosive ? "rgb(239,68,68)" : "rgb(34,197,94)"} />
                <circle cx={dotX} cy={dotY} r="8" fill="none" stroke={result.isExplosive ? "rgb(239,68,68)" : "rgb(34,197,94)"} strokeWidth="1" strokeOpacity="0.4"/>
                <text x={dotX+10} y={dotY-6} fontSize="9" fill="currentColor" fillOpacity="0.7">({result.C.toFixed(1)}; {parseFloat(o2.replace(",","."))})</text>
              </>
            )}
            {/* Метки A, O, D */}
            <text x={PAD.l-2} y={PAD.t+8} fontSize="9" fill="currentColor" fillOpacity="0.5" fontWeight="bold">A</text>
            <text x={PAD.l-2} y={SVG_H-PAD.b+6} fontSize="9" fill="currentColor" fillOpacity="0.5" fontWeight="bold">O</text>
            <text x={SVG_W-PAD.r-2} y={toSvgY(9)} fontSize="9" fill="currentColor" fillOpacity="0.5" fontWeight="bold">D</text>
          </svg>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Метан — CH₄, %", val: ch4, set: (v:string) => { setCh4(v); setCalculated(false) }, placeholder: "Например: 3.0" },
            { label: "Окись углерода — CO, %", val: co, set: (v:string) => { setCo(v); setCalculated(false) }, placeholder: "Например: 1.0" },
            { label: "Водород — H₂, %", val: h2, set: (v:string) => { setH2(v); setCalculated(false) }, placeholder: "Например: 0.5" },
            { label: "Кислород — O₂, %", val: o2, set: (v:string) => { setO2(v); setCalculated(false) }, placeholder: "Например: 12.0" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="mb-2 block font-mono text-xs text-foreground/60">{label}</label>
              <input
                type="number"
                value={val}
                onChange={e => set(e.target.value)}
                min="0"
                step="any"
                placeholder={placeholder}
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleCalculate}
            disabled={!isReady}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="Calculator" size={16} />
            Определить
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

        {result && (
          <div className={`rounded-xl border p-5 backdrop-blur-sm transition-all duration-500 md:p-6 ${result.isExplosive ? "border-red-500/40 bg-red-500/5" : "border-green-500/40 bg-green-500/5"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-full p-2 ${result.isExplosive ? "bg-red-500/15" : "bg-green-500/15"}`}>
                <Icon name={result.isExplosive ? "AlertTriangle" : "ShieldCheck"} size={20} />
              </div>
              <div>
                <p className={`font-sans text-lg font-medium ${result.isExplosive ? "text-red-400" : "text-green-400"}`}>
                  {result.isExplosive ? "ВЗРЫВООПАСНА" : "НЕ ВЗРЫВООПАСНА"}
                </p>
                <p className="font-mono text-xs text-foreground/40">
                  Смесь {result.isExplosive ? "попадает" : "не попадает"} в зону взрываемости
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-foreground/10 pt-4">
              <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">Результаты расчёта</p>
              {[
                { label: "C (горючие газы)", value: result.C.toFixed(2) + " %" },
                { label: "P_CH₄ (доля метана)", value: result.pch.toFixed(3) },
                { label: "P_CO (доля CO)", value: result.pco.toFixed(3) },
                { label: "P_H₂ (доля H₂)", value: result.ph.toFixed(3) },
                { label: "Сумма долей", value: (result.pch + result.pco + result.ph).toFixed(3) },
                { label: "Треугольник (P_CO / P_CH)", value: `${result.pcoKey} / ${result.pchKey}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-foreground/50">{label}</span>
                  <span className="font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2 border-t border-foreground/10 pt-4">
              <button
                onClick={() => exportToWord({
                  title: "Определение взрываемости смеси горючих газов (Боевой устав ВГСЧ 1996, Прил. 11)",
                  formula: "C = CH4 + CO + H2; P_CH = CH4/C; P_CO = CO/C; P_H = H2/C",
                  inputs: [
                    { label: "Метан CH₄", value: ch4, unit: "%" },
                    { label: "Окись углерода CO", value: co, unit: "%" },
                    { label: "Водород H₂", value: h2, unit: "%" },
                    { label: "Кислород O₂", value: o2, unit: "%" },
                  ],
                  results: [
                    { label: "C (горючие газы)", value: result.C.toFixed(2), unit: "%" },
                    { label: "P_CH₄", value: result.pch.toFixed(3), unit: "" },
                    { label: "P_CO", value: result.pco.toFixed(3), unit: "" },
                    { label: "P_H₂", value: result.ph.toFixed(3), unit: "" },
                    { label: "Вывод", value: result.isExplosive ? "ВЗРЫВООПАСНА" : "НЕ ВЗРЫВООПАСНА", unit: "" },
                  ],
                })}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
              >
                <Icon name="FileText" size={14} />
                Word
              </button>
              <button
                onClick={() => exportToExcel({
                  title: "Определение взрываемости смеси горючих газов (Боевой устав ВГСЧ 1996, Прил. 11)",
                  formula: "C = CH4 + CO + H2; P_CH = CH4/C; P_CO = CO/C; P_H = H2/C",
                  inputs: [
                    { label: "Метан CH₄", value: ch4, unit: "%" },
                    { label: "Окись углерода CO", value: co, unit: "%" },
                    { label: "Водород H₂", value: h2, unit: "%" },
                    { label: "Кислород O₂", value: o2, unit: "%" },
                  ],
                  results: [
                    { label: "C (горючие газы)", value: result.C.toFixed(2), unit: "%" },
                    { label: "P_CH₄", value: result.pch.toFixed(3), unit: "" },
                    { label: "P_CO", value: result.pco.toFixed(3), unit: "" },
                    { label: "P_H₂", value: result.ph.toFixed(3), unit: "" },
                    { label: "Вывод", value: result.isExplosive ? "ВЗРЫВООПАСНА" : "НЕ ВЗРЫВООПАСНА", unit: "" },
                  ],
                })}
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

// ─── Индексы пожарного состояния атмосферы (Грэхем и Янг) ───────────────────
function FireIndexCalculator() {
  const [co, setCo]   = useState("")
  const [o2, setO2]   = useState("")
  const [co2, setCo2] = useState("")
  const [n2, setN2]   = useState("")
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ Ig: number; Iy: number; fireStage: string; igStatus: string; iyStatus: string } | null>(null)

  // Индекс Грэхема: Ig = CO / (0.265 - O2/100 * (N2/79)) × 100
  // Упрощённая формула применяемая в горноспасательной практике:
  // Ig = CO / (0.265 - O2) — при O2 в долях; стандарт: Ig = CO*100 / (0.265*(21-O2))
  // Индекс Янга: Iy = (CO2 + CO - CO2исх) / O2 * 100, исх CO2 ≈ 0.04%
  const handleCalculate = () => {
    const coN  = parseFloat(co.replace(",","."))
    const o2N  = parseFloat(o2.replace(",","."))
    const co2N = parseFloat(co2.replace(",","."))
    if (isNaN(coN) || isNaN(o2N) || isNaN(co2N) || o2N <= 0) return
    const defO2 = 21 - o2N
    const Ig = defO2 > 0 ? parseFloat((coN / defO2).toFixed(4)) : 0
    const co2excess = co2N - 0.04
    const Iy = parseFloat(((co2excess + coN) / o2N * 100).toFixed(3))

    let igStatus = ""
    if (Ig < 0.1)      igStatus = "Пожара нет / начальная стадия"
    else if (Ig < 0.5) igStatus = "Пожар в начальной стадии"
    else if (Ig < 1.0) igStatus = "Активное горение"
    else               igStatus = "Интенсивное горение"

    let iyStatus = ""
    if (Iy < 0.5)      iyStatus = "Пожара нет"
    else if (Iy < 1.5) iyStatus = "Признаки самонагревания"
    else if (Iy < 3.0) iyStatus = "Самонагревание / начало пожара"
    else               iyStatus = "Активный пожар"

    const fireStage = Ig >= 0.5 || Iy >= 1.5 ? "ПОЖАР" : "НЕТ ПРИЗНАКОВ ПОЖАРА"
    setResult({ Ig, Iy, fireStage, igStatus, iyStatus })
    setCalculated(true)
  }

  const handleReset = () => { setCo(""); setO2(""); setCo2(""); setN2(""); setResult(null); setCalculated(false) }
  const isReady = co && o2 && co2 && parseFloat(o2) > 0

  const getExportData = () => ({
    title: "Индексы пожарного состояния атмосферы (Грэхем, Янг)",
    formula: "Ig = CO / (21 - O2);  Iy = (CO2 + CO - 0.04) / O2 × 100",
    inputs: [
      { label: "CO", value: co, unit: "%" },
      { label: "O₂", value: o2, unit: "%" },
      { label: "CO₂", value: co2, unit: "%" },
      { label: "N₂", value: n2 || "—", unit: "%" },
    ],
    results: result ? [
      { label: "Индекс Грэхема (Ig)", value: String(result.Ig), unit: "" },
      { label: "Оценка по Ig", value: result.igStatus, unit: "" },
      { label: "Индекс Янга (Iy)", value: String(result.Iy), unit: "" },
      { label: "Оценка по Iy", value: result.iyStatus, unit: "" },
      { label: "Вывод", value: result.fireStage, unit: "" },
    ] : [],
  })

  const isFire = result?.fireStage === "ПОЖАР"

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-5 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формулы</p>
          <p className="font-mono text-sm text-foreground">Ig = CO / (21 − O₂)</p>
          <p className="mt-2 font-mono text-sm text-foreground">Iy = (CO₂ + CO − 0.04) / O₂ × 100</p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">Шкала индекса Грэхема (Ig)</p>
            {[
              { range: "< 0.1", label: "Нет пожара", color: "text-green-400" },
              { range: "0.1 – 0.5", label: "Начальная стадия", color: "text-yellow-400" },
              { range: "0.5 – 1.0", label: "Активное горение", color: "text-orange-400" },
              { range: "> 1.0", label: "Интенсивное горение", color: "text-red-400" },
            ].map(s => (
              <div key={s.range} className="flex justify-between py-1 border-b border-foreground/5 text-sm">
                <span className="font-mono text-foreground/50">{s.range}</span>
                <span className={s.color}>{s.label}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">Шкала индекса Янга (Iy)</p>
            {[
              { range: "< 0.5", label: "Нет пожара", color: "text-green-400" },
              { range: "0.5 – 1.5", label: "Самонагревание", color: "text-yellow-400" },
              { range: "1.5 – 3.0", label: "Начало пожара", color: "text-orange-400" },
              { range: "> 3.0", label: "Активный пожар", color: "text-red-400" },
            ].map(s => (
              <div key={s.range} className="flex justify-between py-1 border-b border-foreground/5 text-sm">
                <span className="font-mono text-foreground/50">{s.range}</span>
                <span className={s.color}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Окись углерода — CO, %", val: co, set: (v:string)=>{setCo(v);setCalculated(false)}, ph: "Например: 0.008" },
            { label: "Кислород — O₂, %",       val: o2, set: (v:string)=>{setO2(v);setCalculated(false)}, ph: "Например: 18.5" },
            { label: "Углекислый газ — CO₂, %", val: co2, set: (v:string)=>{setCo2(v);setCalculated(false)}, ph: "Например: 1.2" },
            { label: "Азот — N₂, % (необяз.)", val: n2, set: (v:string)=>{setN2(v);setCalculated(false)}, ph: "Например: 79" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="mb-2 block font-mono text-xs text-foreground/60">{label}</label>
              <input type="number" value={val} onChange={e=>set(e.target.value)} min="0" step="any" placeholder={ph}
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={handleCalculate} disabled={!isReady}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30">
            <Icon name="Calculator" size={16} />Рассчитать
          </button>
          {calculated && (
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
              <Icon name="RotateCcw" size={14} />Сбросить
            </button>
          )}
        </div>

        {result && (
          <div className={`rounded-xl border p-5 backdrop-blur-sm transition-all duration-500 md:p-6 ${isFire ? "border-red-500/40 bg-red-500/5" : "border-green-500/40 bg-green-500/5"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-full p-2 ${isFire ? "bg-red-500/15" : "bg-green-500/15"}`}>
                <Icon name={isFire ? "Flame" : "ShieldCheck"} size={20} />
              </div>
              <p className={`font-sans text-lg font-medium ${isFire ? "text-red-400" : "text-green-400"}`}>{result.fireStage}</p>
            </div>
            <div className="space-y-3 border-t border-foreground/10 pt-4">
              <div className="rounded-lg border border-foreground/10 p-3">
                <p className="font-mono text-xs text-foreground/40 mb-1">Индекс Грэхема (Ig)</p>
                <p className="font-sans text-2xl font-light text-foreground">{result.Ig}</p>
                <p className="font-mono text-xs text-foreground/50 mt-1">{result.igStatus}</p>
              </div>
              <div className="rounded-lg border border-foreground/10 p-3">
                <p className="font-mono text-xs text-foreground/40 mb-1">Индекс Янга (Iy)</p>
                <p className="font-sans text-2xl font-light text-foreground">{result.Iy}</p>
                <p className="font-mono text-xs text-foreground/50 mt-1">{result.iyStatus}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border-t border-foreground/10 pt-4">
              <button onClick={()=>exportToWord(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="FileText" size={14} />Word
              </button>
              <button onClick={()=>exportToExcel(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="Sheet" size={14} fallback="Table" />Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Расчёт подачи инертного газа для тушения ────────────────────────────────
function InertGasCalculator() {
  const [V, setV]   = useState("")   // объём изолируемого пространства, м³
  const [o2, setO2] = useState("")   // текущий O₂, %
  const [o2t, setO2t] = useState("") // целевой O₂ (обычно ≤2%), %
  const [q, setQ]   = useState("")   // производительность подачи газа, м³/ч
  const [gasType, setGasType] = useState<"N2"|"CO2">("N2")
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ Vin: number; t: number; kh: number } | null>(null)

  // Объём инертного газа: Vin = V × (O2нач - O2цель) / (O2воздуха - O2цель)
  // O2воздуха = 20.9%
  // Время: t = Vin / q (ч) → мин
  const handleCalculate = () => {
    const Vn   = parseFloat(V.replace(",","."))
    const o2n  = parseFloat(o2.replace(",","."))
    const o2tn = parseFloat(o2t.replace(",","."))
    const qn   = parseFloat(q.replace(",","."))
    if ([Vn,o2n,o2tn,qn].some(isNaN) || o2n<=o2tn || qn<=0) return
    const Vin = parseFloat((Vn * (o2n - o2tn) / (20.9 - o2tn)).toFixed(1))
    const tH  = Vin / qn
    const t   = parseFloat((tH * 60).toFixed(0))
    const kh  = parseFloat((Vin / Vn).toFixed(2))
    setResult({ Vin, t, kh })
    setCalculated(true)
  }

  const handleReset = () => { setV(""); setO2(""); setO2t(""); setQ(""); setResult(null); setCalculated(false) }
  const isReady = V && o2 && o2t && q && parseFloat(o2)>parseFloat(o2t) && parseFloat(q)>0

  const getExportData = () => ({
    title: "Расчёт подачи инертного газа для тушения подземного пожара",
    formula: "Vin = V × (O2нач − O2цель) / (20.9 − O2цель);  t = Vin / q",
    inputs: [
      { label: "Объём пространства (V)", value: V, unit: "м³" },
      { label: "Начальный O₂", value: o2, unit: "%" },
      { label: "Целевой O₂", value: o2t, unit: "%" },
      { label: "Производительность подачи", value: q, unit: "м³/ч" },
      { label: "Тип газа", value: gasType === "N2" ? "Азот (N₂)" : "Углекислый газ (CO₂)", unit: "" },
    ],
    results: result ? [
      { label: "Объём инертного газа (Vin)", value: String(result.Vin), unit: "м³" },
      { label: "Кратность заполнения (kh)", value: String(result.kh), unit: "" },
      { label: "Время подачи (t)", value: String(result.t), unit: "мин" },
    ] : [],
  })

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-5 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
          <p className="font-mono text-lg text-foreground">Vin = V × (O₂н − O₂ц) / (20.9 − O₂ц)</p>
          <p className="mt-2 font-mono text-sm text-foreground/60">t = Vin / q</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70">
          {[
            ["V",    "Объём изолируемого пространства, м³"],
            ["O₂н",  "Начальное содержание кислорода, %"],
            ["O₂ц",  "Целевое содержание O₂ (обычно ≤ 2%), %"],
            ["20.9", "Содержание O₂ в воздухе, %"],
            ["q",    "Производительность подачи инертного газа, м³/ч"],
            ["t",    "Время, необходимое для инертизации, мин"],
          ].map(([s, d]) => (
            <div key={s} className="flex gap-3">
              <span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0 w-10">{s}</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-foreground/10 p-4">
          <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">Характеристики газов</p>
          <div className="space-y-1 text-xs text-foreground/60 font-mono">
            <div className="flex justify-between"><span>Азот N₂</span><span>плотность 1.25 кг/м³, безопасен</span></div>
            <div className="flex justify-between"><span>CO₂</span><span>плотность 1.96 кг/м³, токсичен при &gt;3%</span></div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Тип инертного газа</label>
          <div className="flex gap-2">
            {([["N2","Азот (N₂)"],["CO2","Углекислый газ (CO₂)"]] as const).map(([k,l])=>(
              <button key={k} onClick={()=>setGasType(k)}
                className={`rounded-lg border px-4 py-2 font-sans text-sm transition-all ${gasType===k ? "border-foreground bg-foreground text-background" : "border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Объём пространства — V, м³", val: V, set: (v:string)=>{setV(v);setCalculated(false)}, ph: "Например: 5000" },
            { label: "Текущий O₂, %",              val: o2, set: (v:string)=>{setO2(v);setCalculated(false)}, ph: "Например: 18" },
            { label: "Целевой O₂, %",              val: o2t, set: (v:string)=>{setO2t(v);setCalculated(false)}, ph: "Например: 2" },
            { label: "Подача газа — q, м³/ч",      val: q, set: (v:string)=>{setQ(v);setCalculated(false)}, ph: "Например: 200" },
          ].map(({label,val,set,ph})=>(
            <div key={label}>
              <label className="mb-2 block font-mono text-xs text-foreground/60">{label}</label>
              <input type="number" value={val} onChange={e=>set(e.target.value)} min="0" step="any" placeholder={ph}
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={handleCalculate} disabled={!isReady}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30">
            <Icon name="Calculator" size={16} />Рассчитать
          </button>
          {calculated && (
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
              <Icon name="RotateCcw" size={14} />Сбросить
            </button>
          )}
        </div>

        {result && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-4 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg border border-foreground/10 p-3">
                <p className="font-mono text-xs text-foreground/40 mb-1">Объём газа</p>
                <p className="font-sans text-xl font-light text-foreground">{result.Vin}</p>
                <p className="font-mono text-xs text-foreground/40">м³</p>
              </div>
              <div className="rounded-lg border border-foreground/10 p-3">
                <p className="font-mono text-xs text-foreground/40 mb-1">Кратность</p>
                <p className="font-sans text-xl font-light text-foreground">{result.kh}</p>
                <p className="font-mono text-xs text-foreground/40">Vin/V</p>
              </div>
              <div className="rounded-lg border border-foreground/10 p-3">
                <p className="font-mono text-xs text-foreground/40 mb-1">Время</p>
                <p className="font-sans text-xl font-light text-foreground">{result.t}</p>
                <p className="font-mono text-xs text-foreground/40">мин</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-foreground/10 pt-4">
              <button onClick={()=>exportToWord(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="FileText" size={14} />Word
              </button>
              <button onClick={()=>exportToExcel(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="Sheet" size={14} fallback="Table" />Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Расчёт депрессии шахты ───────────────────────────────────────────────────
function DepressionCalculator() {
  const [Q, setQ]   = useState("")   // расход воздуха, м³/с
  const [R, setR]   = useState("")   // аэродинамическое сопротивление, кг·с²/м⁸
  const [mode, setMode] = useState<"h"|"Q"|"R">("h")
  const [h, setH]   = useState("")   // депрессия, даПа
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ value: number; label: string; unit: string; extra?: { label: string; value: string; unit: string }[] } | null>(null)

  // h = R × Q²  (депрессия в кгс/м², 1 кгс/м² ≈ 9.81 Па ≈ 0.981 даПа)
  const handleCalculate = () => {
    if (mode === "h") {
      const Qn = parseFloat(Q.replace(",",".")), Rn = parseFloat(R.replace(",","."))
      if (isNaN(Qn)||isNaN(Rn)||Qn<=0||Rn<=0) return
      const hVal = Rn * Qn * Qn
      const hPa = hVal * 9.81
      setResult({ value: parseFloat(hVal.toFixed(4)), label: "Депрессия шахты h", unit: "кгс/м²",
        extra: [{ label: "в Паскалях", value: hPa.toFixed(1), unit: "Па" },
                { label: "в даПа", value: (hPa/10).toFixed(2), unit: "даПа" }] })
    } else if (mode === "Q") {
      const hN = parseFloat(h.replace(",",".")), Rn = parseFloat(R.replace(",","."))
      if (isNaN(hN)||isNaN(Rn)||hN<=0||Rn<=0) return
      const Qval = Math.sqrt(hN / Rn)
      setResult({ value: parseFloat(Qval.toFixed(3)), label: "Расход воздуха Q", unit: "м³/с",
        extra: [{ label: "в м³/мин", value: (Qval*60).toFixed(1), unit: "м³/мин" }] })
    } else {
      const hN = parseFloat(h.replace(",",".")), Qn = parseFloat(Q.replace(",","."))
      if (isNaN(hN)||isNaN(Qn)||hN<=0||Qn<=0) return
      const Rval = hN / (Qn * Qn)
      setResult({ value: parseFloat(Rval.toFixed(6)), label: "Аэродинамическое сопротивление R", unit: "кг·с²/м⁸" })
    }
    setCalculated(true)
  }

  const handleReset = () => { setQ(""); setR(""); setH(""); setResult(null); setCalculated(false) }

  const isReady = mode === "h"
    ? Q && R && parseFloat(Q)>0 && parseFloat(R)>0
    : mode === "Q"
    ? h && R && parseFloat(h)>0 && parseFloat(R)>0
    : h && Q && parseFloat(h)>0 && parseFloat(Q)>0

  const getExportData = () => ({
    title: "Расчёт депрессии шахты",
    formula: "h = R × Q²",
    inputs: [
      ...(mode !== "h" ? [{ label: "Депрессия (h)", value: h, unit: "кгс/м²" }] : []),
      ...(mode !== "Q" ? [{ label: "Расход воздуха (Q)", value: Q, unit: "м³/с" }] : []),
      ...(mode !== "R" ? [{ label: "Сопротивление (R)", value: R, unit: "кг·с²/м⁸" }] : []),
    ],
    results: result ? [
      { label: result.label, value: String(result.value), unit: result.unit },
      ...(result.extra || []).map(e => ({ label: e.label, value: e.value, unit: e.unit })),
    ] : [],
  })

  const MODES = [
    { key: "h" as const, label: "Найти h (депрессию)" },
    { key: "Q" as const, label: "Найти Q (расход)" },
    { key: "R" as const, label: "Найти R (сопротивление)" },
  ]

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-5 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50 uppercase tracking-widest">Основная формула</p>
          <p className="font-mono text-2xl text-foreground">h = R × Q²</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70">
          {[
            ["h", "Депрессия шахты, кгс/м² (1 кгс/м² = 9.81 Па)"],
            ["R", "Аэродинамическое сопротивление сети, кг·с²/м⁸"],
            ["Q", "Количество воздуха, м³/с"],
          ].map(([s,d])=>(
            <div key={s} className="flex gap-3">
              <span className="font-mono text-xs text-foreground/40 mt-0.5 w-5 shrink-0">{s}</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-foreground/10 p-4">
          <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-2">Перевод единиц</p>
          <div className="space-y-1 text-xs font-mono text-foreground/60">
            <div>1 кгс/м² = 9.81 Па = 0.981 даПа</div>
            <div>1 даПа = 1.02 кгс/м²</div>
            <div>1 мм вод. ст. = 9.81 Па</div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-mono text-xs text-foreground/60">Что нужно найти?</label>
          <div className="flex flex-col gap-2">
            {MODES.map(m=>(
              <button key={m.key} onClick={()=>{setMode(m.key);setResult(null);setCalculated(false)}}
                className={`rounded-lg border px-4 py-2.5 text-left font-sans text-sm transition-all ${mode===m.key ? "border-foreground bg-foreground text-background" : "border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {(mode==="h"||mode==="R") && (
            <div>
              <label className="mb-2 block font-mono text-xs text-foreground/60">Расход воздуха — Q, м³/с</label>
              <input type="number" value={Q} onChange={e=>{setQ(e.target.value);setCalculated(false)}} min="0" step="any" placeholder="Например: 150"
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          )}
          {(mode==="h"||mode==="Q") && (
            <div>
              <label className="mb-2 block font-mono text-xs text-foreground/60">Аэродинамическое сопротивление — R, кг·с²/м⁸</label>
              <input type="number" value={R} onChange={e=>{setR(e.target.value);setCalculated(false)}} min="0" step="any" placeholder="Например: 0.000025"
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          )}
          {(mode==="Q"||mode==="R") && (
            <div>
              <label className="mb-2 block font-mono text-xs text-foreground/60">Депрессия — h, кгс/м²</label>
              <input type="number" value={h} onChange={e=>{setH(e.target.value);setCalculated(false)}} min="0" step="any" placeholder="Например: 50"
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={handleCalculate} disabled={!isReady}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30">
            <Icon name="Calculator" size={16} />Рассчитать
          </button>
          {calculated && (
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
              <Icon name="RotateCcw" size={14} />Сбросить
            </button>
          )}
        </div>

        {result && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <div className="mb-3">
              <p className="font-mono text-xs text-foreground/40 mb-1">{result.label}</p>
              <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
                {result.value} <span className="text-xl text-foreground/60">{result.unit}</span>
              </p>
            </div>
            {result.extra && result.extra.map(e=>(
              <div key={e.label} className="border-t border-foreground/10 pt-2 mt-2">
                <p className="font-mono text-xs text-foreground/40 mb-0.5">{e.label}</p>
                <p className="font-sans text-xl font-light text-foreground">{e.value} <span className="text-sm text-foreground/60">{e.unit}</span></p>
              </div>
            ))}
            <div className="mt-4 flex gap-2 border-t border-foreground/10 pt-4">
              <button onClick={()=>exportToWord(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="FileText" size={14} />Word
              </button>
              <button onClick={()=>exportToExcel(getExportData())}
                className="flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 font-mono text-xs text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground">
                <Icon name="Sheet" size={14} fallback="Table" />Excel
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

          {activeTab === "area"       && <AreaCalculator />}
          {activeTab === "resistance" && <ResistanceCalculator />}
          {activeTab === "leakage"    && <LeakageCalculator />}
          {activeTab === "explosion"  && <ExplosibilityCalculator />}
          {activeTab === "fire-index" && <FireIndexCalculator />}
          {activeTab === "inert-gas"  && <InertGasCalculator />}
          {activeTab === "depression" && <DepressionCalculator />}
        </div>
      </div>
    </section>
  )
}