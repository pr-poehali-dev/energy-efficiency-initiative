import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import Icon from "@/components/ui/icon"
import { exportToWord, exportToExcel } from "@/lib/export-utils"

const GASES: {
  key: string
  name: string
  formula: string
  lel: number
  uel: number
  lol: number
  description: string
}[] = [
  { key: "methane",   name: "Метан",        formula: "CH₄",  lel: 5.0,  uel: 15.0, lol: 12.0, description: "Основной рудничный газ" },
  { key: "hydrogen",  name: "Водород",       formula: "H₂",   lel: 4.0,  uel: 75.0, lol: 5.0,  description: "Взрывоопасен в широком диапазоне" },
  { key: "co",        name: "Угарный газ",   formula: "CO",   lel: 12.5, uel: 74.0, lol: 14.0, description: "Токсичен и взрывоопасен" },
  { key: "ethane",    name: "Этан",          formula: "C₂H₆", lel: 3.0,  uel: 12.5, lol: 11.0, description: "Попутный газ в шахтах" },
  { key: "propane",   name: "Пропан",        formula: "C₃H₈", lel: 2.1,  uel: 9.5,  lol: 10.0, description: "Тяжелее воздуха, накапливается внизу" },
  { key: "acetylene", name: "Ацетилен",      formula: "C₂H₂", lel: 2.5,  uel: 80.0, lol: 3.0,  description: "Очень широкий диапазон взрываемости" },
]

type Zone = "explosive" | "lean" | "rich" | "inert" | "unknown"

function getZone(gasPct: number, o2Pct: number, lel: number, uel: number, lol: number): Zone {
  if (o2Pct < lol) return "inert"
  if (gasPct < lel) return "lean"
  if (gasPct > uel) return "rich"
  return "explosive"
}

function getZoneLabel(zone: Zone): string {
  switch (zone) {
    case "explosive": return "ВЗРЫВООПАСНАЯ СМЕСЬ"
    case "lean":      return "БЕДНАЯ СМЕСЬ (невзрывоопасная)"
    case "rich":      return "БОГАТАЯ СМЕСЬ (невзрывоопасная)"
    case "inert":     return "ИНЕРТНАЯ СМЕСЬ (недостаток O₂)"
    default:          return "Неизвестно"
  }
}

function getZoneColor(zone: Zone): string {
  switch (zone) {
    case "explosive": return "#ef4444"
    case "lean":      return "#22c55e"
    case "rich":      return "#f59e0b"
    case "inert":     return "#6366f1"
    default:          return "#6b7280"
  }
}

function getConclusion(zone: Zone, gasName: string, gasPct: number, o2Pct: number, n2Pct: number, lel: number, uel: number): string {
  switch (zone) {
    case "explosive":
      return `Смесь ВЗРЫВООПАСНА. Концентрация ${gasName} (${gasPct.toFixed(2)}%) находится в диапазоне взрываемости [${lel}%–${uel}%]. Содержание O₂ (${o2Pct.toFixed(2)}%) достаточно для горения. Необходимо немедленное проветривание и эвакуация.`
    case "lean":
      return `Смесь НЕВЗРЫВООПАСНА — бедная. Концентрация ${gasName} (${gasPct.toFixed(2)}%) ниже нижнего предела взрываемости (НПВ = ${lel}%). При увеличении концентрации смесь станет взрывоопасной.`
    case "rich":
      return `Смесь НЕВЗРЫВООПАСНА — богатая. Концентрация ${gasName} (${gasPct.toFixed(2)}%) превышает верхний предел взрываемости (ВПВ = ${uel}%). При разбавлении воздухом смесь может войти в зону взрываемости — опасность при проветривании.`
    case "inert":
      return `Смесь НЕВЗРЫВООПАСНА — инертная. Содержание O₂ (${o2Pct.toFixed(2)}%) ниже минимального предела поддержания горения. Однако возможно удушье персонала — требуется вентиляция.`
    default:
      return "Недостаточно данных для оценки."
  }
}

// Треугольная диаграмма Гиббса (SVG)
function GibbsTriangle({
  gasPct, o2Pct, n2Pct, zone, lel, uel, lol
}: {
  gasPct: number; o2Pct: number; n2Pct: number; zone: Zone | null;
  lel: number; uel: number; lol: number
}) {
  const size = 400
  const pad = 48
  // Вершины равностороннего треугольника
  const top   = { x: size / 2,  y: pad }
  const left  = { x: pad,        y: size - pad }
  const right = { x: size - pad, y: size - pad }

  // Нормализуем проценты (сумма = 100)
  const total = gasPct + o2Pct + n2Pct
  const gN = total > 0 ? gasPct / total : 0
  const oN = total > 0 ? o2Pct  / total : 0
  const nN = total > 0 ? n2Pct  / total : 0

  // Барицентрические координаты → декартовы
  // Вершина top = газ, left = N₂, right = O₂
  const px = gN * top.x + nN * left.x + oN * right.x
  const py = gN * top.y + nN * left.y + oN * right.y

  // Зона взрываемости — упрощённый четырёхугольник внутри треугольника
  // Точки: при lel/uel по газу + минимальный O2 (lol)
  // Верхний предел gas, min O2
  const lelPoint = bary(lel / 100, (100 - lel) / 100 * 0.21, (100 - lel) / 100 * 0.79, top, left, right)
  const uelPoint = bary(uel / 100, (100 - uel) / 100 * 0.21, (100 - uel) / 100 * 0.79, top, left, right)
  const lelLol   = bary(lel / 100, lol / 100, (100 - lel - lol) / 100, top, left, right)
  const uelLol   = bary(uel / 100, lol / 100, (100 - uel - lol) / 100, top, left, right)

  const zoneColor = zone ? getZoneColor(zone) : "#888"

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[380px]" style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))" }}>
      {/* Фон треугольника */}
      <polygon
        points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />

      {/* Зона взрываемости */}
      {lel < uel && (
        <polygon
          points={`${lelPoint.x},${lelPoint.y} ${uelPoint.x},${uelPoint.y} ${uelLol.x},${uelLol.y} ${lelLol.x},${lelLol.y}`}
          fill="rgba(239,68,68,0.25)"
          stroke="rgba(239,68,68,0.6)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}

      {/* Подписи вершин */}
      <text x={top.x} y={top.y - 14} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="monospace">Газ 100%</text>
      <text x={left.x - 8} y={left.y + 18} textAnchor="end" fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="monospace">N₂ 100%</text>
      <text x={right.x + 8} y={right.y + 18} textAnchor="start" fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="monospace">O₂ 100%</text>

      {/* Метка зоны взрываемости */}
      <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="10" fontFamily="monospace">зона взрываемости</text>

      {/* Точка состава */}
      {total > 0 && (
        <>
          <line x1={px} y1={py} x2={px} y2={py} stroke="none" />
          <circle cx={px} cy={py} r={10} fill={`${zoneColor}40`} stroke={zoneColor} strokeWidth="2" />
          <circle cx={px} cy={py} r={4}  fill={zoneColor} />
          {/* Перекрестие */}
          <line x1={px - 16} y1={py} x2={px + 16} y2={py} stroke={zoneColor} strokeWidth="0.8" opacity="0.6" />
          <line x1={px} y1={py - 16} x2={px} y2={py + 16} stroke={zoneColor} strokeWidth="0.8" opacity="0.6" />
        </>
      )}

      {/* Линии сетки (20% шаг) */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => {
        const a = lerp2d(top, left, t)
        const b = lerp2d(top, right, t)
        const c = lerp2d(left, right, t)
        const d = lerp2d(top, left, 1 - t)
        const e = lerp2d(left, right, t)
        const f = lerp2d(top, right, t)
        return (
          <g key={t}>
            <line x1={a.x} y1={a.y} x2={lerp2d(left, right, 1-t).x} y2={lerp2d(left, right, 1-t).y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <line x1={b.x} y1={b.y} x2={lerp2d(left, right, t).x}   y2={lerp2d(left, right, t).y}   stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <line x1={d.x} y1={d.y} x2={lerp2d(top, right, 1-t).x}  y2={lerp2d(top, right, 1-t).y}  stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
          </g>
        )
      })}
    </svg>
  )
}

function bary(a: number, b: number, c: number, A: {x:number;y:number}, B: {x:number;y:number}, C: {x:number;y:number}) {
  return { x: a * A.x + b * B.x + c * C.x, y: a * A.y + b * B.y + c * C.y }
}
function lerp2d(a: {x:number;y:number}, b: {x:number;y:number}, t: number) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export default function ExplosionTriangle() {
  const navigate = useNavigate()
  const [selectedGas, setSelectedGas] = useState(GASES[0])
  const [gasVal, setGasVal]   = useState("")
  const [o2Val,  setO2Val]    = useState("")
  const [n2Val,  setN2Val]    = useState("")
  const [zone, setZone]       = useState<Zone | null>(null)
  const [calculated, setCalculated] = useState(false)

  const gasPct = parseFloat(gasVal.replace(",", ".")) || 0
  const o2Pct  = parseFloat(o2Val.replace(",", "."))  || 0
  const n2Pct  = parseFloat(n2Val.replace(",", "."))  || 0
  const total  = gasPct + o2Pct + n2Pct

  const handleCalculate = () => {
    if (gasPct >= 0 && o2Pct >= 0 && n2Pct >= 0 && total > 0) {
      const z = getZone(gasPct, o2Pct, selectedGas.lel, selectedGas.uel, selectedGas.lol)
      setZone(z)
      setCalculated(true)
    }
  }

  const handleReset = () => {
    setGasVal(""); setO2Val(""); setN2Val("")
    setZone(null); setCalculated(false)
  }

  const getExportData = () => ({
    title: `Треугольник взрываемости — ${selectedGas.name} (${selectedGas.formula})`,
    formula: `НПВ = ${selectedGas.lel}%, ВПВ = ${selectedGas.uel}%, мин. O₂ = ${selectedGas.lol}%`,
    inputs: [
      { label: `Концентрация ${selectedGas.name}`, value: gasVal, unit: "%" },
      { label: "Концентрация O₂",                  value: o2Val,  unit: "%" },
      { label: "Концентрация N₂",                  value: n2Val,  unit: "%" },
    ],
    results: zone ? [
      { label: "Зона",    value: getZoneLabel(zone),  unit: "" },
      { label: "Вывод",   value: getConclusion(zone, selectedGas.name, gasPct, o2Pct, n2Pct, selectedGas.lel, selectedGas.uel), unit: "" },
    ] : [],
  })

  const zoneColor = zone ? getZoneColor(zone) : null

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />
      <GrainOverlay />

      {/* Шапка */}
      <nav className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between px-6 py-6 md:px-12 bg-background/60 backdrop-blur-md border-b border-foreground/10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img
            src="https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/cdb64365-d7bf-41f9-85c0-39b1dd2dc03f.png"
            alt="СДС" className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-sans text-xl font-semibold tracking-tight text-foreground">СДС</span>
            <span className="font-sans text-[10px] text-foreground/60 tracking-wide -mt-0.5">Расчёты для шахт и рудников</span>
          </div>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-mono text-xs text-foreground/60 hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          На главную
        </button>
      </nav>

      <div className="relative z-10 pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-12">
          <div className="mb-4 inline-block rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5">
            <p className="font-mono text-xs text-foreground/70">Анализ газовой смеси</p>
          </div>
          <h1 className="font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl mb-3">
            Треугольник взрываемости
          </h1>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl">
            Определение зоны взрываемости газовой смеси по трём компонентам.
            Метод диаграммы Гиббса (треугольник газ — O₂ — N₂).
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Левая панель — ввод */}
          <div className="space-y-8">
            {/* Выбор газа */}
            <div>
              <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Горючий газ</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GASES.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => { setSelectedGas(g); setCalculated(false); setZone(null) }}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                      selectedGas.key === g.key
                        ? "border-foreground/60 bg-foreground/15 text-foreground"
                        : "border-foreground/15 bg-foreground/5 text-foreground/60 hover:border-foreground/30 hover:text-foreground/80"
                    }`}
                  >
                    <div className="font-mono text-xs text-foreground/40">{g.formula}</div>
                    <div className="font-sans text-sm font-medium mt-0.5">{g.name}</div>
                  </button>
                ))}
              </div>
              {selectedGas && (
                <div className="mt-3 rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3">
                  <div className="flex gap-6 text-xs font-mono text-foreground/50">
                    <span>НПВ: <span className="text-foreground/80">{selectedGas.lel}%</span></span>
                    <span>ВПВ: <span className="text-foreground/80">{selectedGas.uel}%</span></span>
                    <span>мин. O₂: <span className="text-foreground/80">{selectedGas.lol}%</span></span>
                  </div>
                  <p className="mt-1 text-xs text-foreground/40">{selectedGas.description}</p>
                </div>
              )}
            </div>

            {/* Ввод концентраций */}
            <div>
              <p className="mb-4 font-mono text-xs text-foreground/50 uppercase tracking-widest">Состав смеси, %</p>
              <div className="space-y-4">
                {[
                  { label: `${selectedGas.name} (${selectedGas.formula})`, val: gasVal, set: setGasVal, placeholder: `НПВ=${selectedGas.lel}%, ВПВ=${selectedGas.uel}%` },
                  { label: "Кислород O₂",   val: o2Val,  set: setO2Val,  placeholder: "Норма: 20.9%" },
                  { label: "Азот N₂",        val: n2Val,  set: setN2Val,  placeholder: "Норма: 79%" },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label}>
                    <label className="mb-1.5 block font-mono text-xs text-foreground/50">{label}</label>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => { set(e.target.value); setCalculated(false) }}
                      min="0"
                      max="100"
                      step="any"
                      placeholder={placeholder}
                      className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/25 focus:border-foreground/60 focus:outline-none"
                    />
                  </div>
                ))}
                {total > 0 && (
                  <div className={`flex items-center gap-2 text-xs font-mono ${Math.abs(total - 100) < 0.1 ? "text-green-400/70" : "text-amber-400/70"}`}>
                    <Icon name={Math.abs(total - 100) < 0.1 ? "CheckCircle" : "AlertCircle"} size={12} />
                    Сумма: {total.toFixed(2)}% {Math.abs(total - 100) < 0.1 ? "✓" : `(должна быть 100%)`}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                disabled={total <= 0}
                className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon name="Triangle" size={16} />
                Определить зону
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

            {/* Результат */}
            {zone && calculated && (
              <div
                className="rounded-xl border p-5 backdrop-blur-sm transition-all duration-500 md:p-6"
                style={{ borderColor: `${zoneColor}50`, backgroundColor: `${zoneColor}10` }}
              >
                <p className="mb-1 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
                <p className="font-sans text-xl font-semibold mb-3" style={{ color: zoneColor! }}>
                  {getZoneLabel(zone)}
                </p>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {getConclusion(zone, selectedGas.name, gasPct, o2Pct, n2Pct, selectedGas.lel, selectedGas.uel)}
                </p>

                {/* Экспорт */}
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

          {/* Правая панель — диаграмма */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm flex flex-col items-center">
              <p className="mb-4 font-mono text-xs text-foreground/50 uppercase tracking-widest self-start">Диаграмма Гиббса</p>
              <GibbsTriangle
                gasPct={gasPct}
                o2Pct={o2Pct}
                n2Pct={n2Pct}
                zone={zone}
                lel={selectedGas.lel}
                uel={selectedGas.uel}
                lol={selectedGas.lol}
              />
              {/* Легенда */}
              <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs font-mono">
                {([
                  { zone: "explosive", label: "Взрывоопасная" },
                  { zone: "lean",      label: "Бедная смесь" },
                  { zone: "rich",      label: "Богатая смесь" },
                  { zone: "inert",     label: "Инертная" },
                ] as { zone: Zone; label: string }[]).map(({ zone: z, label }) => (
                  <div key={z} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getZoneColor(z) }} />
                    <span className="text-foreground/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Справка по газу */}
            <div className="w-full rounded-xl border border-foreground/10 bg-foreground/5 p-5">
              <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Справка: {selectedGas.name}</p>
              <div className="space-y-2 text-sm text-foreground/60">
                <div className="flex justify-between">
                  <span>Нижний предел взрываемости (НПВ)</span>
                  <span className="font-mono text-foreground/80">{selectedGas.lel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Верхний предел взрываемости (ВПВ)</span>
                  <span className="font-mono text-foreground/80">{selectedGas.uel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Мин. содержание O₂ для горения</span>
                  <span className="font-mono text-foreground/80">{selectedGas.lol}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Диапазон взрываемости</span>
                  <span className="font-mono text-foreground/80">{(selectedGas.uel - selectedGas.lel).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
