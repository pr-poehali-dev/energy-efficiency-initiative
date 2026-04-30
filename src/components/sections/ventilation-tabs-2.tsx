import { useState } from "react"
import { exportToWord, exportToExcel } from "@/lib/export-utils"
import { VentCalcButton, VentExportButtons } from "./ventilation-ui"

export function DepressionCalculator() {
  const [Q, setQ]   = useState("")
  const [R, setR]   = useState("")
  const [mode, setMode] = useState<"h"|"Q"|"R">("h")
  const [h, setH]   = useState("")
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ value: number; label: string; unit: string; extra?: { label: string; value: string; unit: string }[] } | null>(null)

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

        <VentCalcButton onClick={handleCalculate} disabled={!isReady} calculated={calculated} onReset={handleReset} />

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
            <VentExportButtons onWord={() => exportToWord(getExportData())} onExcel={() => exportToExcel(getExportData())} />
          </div>
        )}
      </div>
    </div>
  )
}

export function FanReserveCalculator() {
  const [Qmax, setQmax] = useState("")
  const [Qv, setQv]     = useState("")
  const [calculated, setCalculated]   = useState(false)
  const [result, setResult] = useState<{ dQ: number; status: string; statusColor: string } | null>(null)

  const handleCalculate = () => {
    const Qmaxn = parseFloat(Qmax.replace(",", "."))
    const Qvn   = parseFloat(Qv.replace(",", "."))
    if (isNaN(Qmaxn) || isNaN(Qvn) || Qvn <= 0 || Qmaxn <= 0) return
    const dQ = parseFloat(((Qmaxn / Qvn - 1) * 100).toFixed(1))

    let status = "", statusColor = ""
    if (dQ < 20)       { status = "Резерв недостаточен (< 20%)";   statusColor = "text-red-400" }
    else if (dQ < 30)  { status = "Резерв в норме (20–30%)";        statusColor = "text-yellow-400" }
    else               { status = "Резерв достаточен (≥ 30%)";      statusColor = "text-green-400" }

    setResult({ dQ, status, statusColor })
    setCalculated(true)
  }

  const handleReset = () => { setQmax(""); setQv(""); setResult(null); setCalculated(false) }
  const isReady = Qmax && Qv && parseFloat(Qv) > 0 && parseFloat(Qmax) > 0

  const getExportData = () => ({
    title: "Резерв подачи вентиляторов главного проветривания (ΔQ)",
    formula: "ΔQ = (Qmax / Qв − 1) × 100%",
    inputs: [
      { label: "Максимальная подача вентилятора (Qmax)", value: Qmax, unit: "м³/с" },
      { label: "Фактический расход воздуха в шахте (Qв)", value: Qv, unit: "м³/с" },
    ],
    results: result ? [
      { label: "Резерв подачи (ΔQ)", value: String(result.dQ), unit: "%" },
      { label: "Оценка", value: result.status, unit: "" },
    ] : [],
  })

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
      <div>
        <div className="mb-5 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm">
          <p className="mb-2 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
          <p className="font-mono text-xl text-foreground">ΔQ = (Q<sub>max</sub> / Q<sub>в</sub> − 1) · 100%</p>
        </div>
        <div className="space-y-3 text-sm text-foreground/70">
          {[
            ["Qmax", "Максимальная подача вентилятора при работе на шахтную сеть, м³/с"],
            ["Qв",   "Фактический расход воздуха в шахте (по замеру или расчёту), м³/с"],
            ["ΔQ",   "Резерв подачи, %"],
          ].map(([s, d]) => (
            <div key={s} className="flex gap-3">
              <span className="font-mono text-xs text-foreground/40 mt-0.5 shrink-0 w-10">{s}</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-foreground/10 p-4">
          <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-3">Нормативная оценка</p>
          {[
            { range: "< 20%",  label: "Резерв недостаточен", color: "text-red-400" },
            { range: "20–30%", label: "Норма",               color: "text-yellow-400" },
            { range: "≥ 30%",  label: "Достаточный резерв",  color: "text-green-400" },
          ].map(s => (
            <div key={s.range} className="flex justify-between py-1 border-b border-foreground/5 text-sm">
              <span className="font-mono text-foreground/50">{s.range}</span>
              <span className={s.color}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Макс. подача вентилятора — Qmax, м³/с", val: Qmax, set: (v: string) => { setQmax(v); setCalculated(false) }, ph: "Например: 120" },
            { label: "Расход воздуха в шахте — Qв, м³/с",    val: Qv,   set: (v: string) => { setQv(v);   setCalculated(false) }, ph: "Например: 90" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="mb-2 block font-mono text-xs text-foreground/60">{label}</label>
              <input type="number" value={val} onChange={e => set(e.target.value)} min="0" step="any" placeholder={ph}
                className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none" />
            </div>
          ))}
        </div>

        <VentCalcButton onClick={handleCalculate} disabled={!isReady} calculated={calculated} onReset={handleReset} />

        {result && (
          <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
            <p className="mb-4 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
            <div className="mb-4">
              <p className="font-mono text-xs text-foreground/40 mb-1">Резерв подачи (ΔQ)</p>
              <p className="font-sans text-5xl font-light text-foreground">{result.dQ}<span className="text-2xl text-foreground/50 ml-1">%</span></p>
              <p className={`mt-2 font-mono text-sm ${result.statusColor}`}>{result.status}</p>
            </div>
            <VentExportButtons onWord={() => exportToWord(getExportData())} onExcel={() => exportToExcel(getExportData())} />
          </div>
        )}
      </div>
    </div>
  )
}
