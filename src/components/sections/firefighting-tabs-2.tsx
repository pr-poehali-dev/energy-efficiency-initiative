import { useState } from "react"
import Icon from "@/components/ui/icon"
import { ExportData } from "@/lib/export-utils"
import { NumInput, ResultRow, ResultBox, FormulaBox, CalcButtons, ExportButtons } from "./firefighting-ui"

export function TabVolume() {
  const [A, setA] = useState("")
  const [B, setB] = useState("")
  const [C, setC] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const a = parseFloat(A.replace(",", "."))
    const b = parseFloat(B.replace(",", "."))
    const c = parseFloat(C.replace(",", "."))
    if ([a, b, c].every((v) => !isNaN(v) && v > 0)) setResult(a * b * c)
  }
  const reset = () => { setA(""); setB(""); setC(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="V = A × B × C"
        params={[
          { sym: "V", desc: "Объём выработки, м³" },
          { sym: "A", desc: "Длина выработки, м" },
          { sym: "B", desc: "Ширина выработки, м" },
          { sym: "C", desc: "Высота выработки, м" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Длина — A, м" value={A} onChange={(v) => { setA(v); setResult(null) }} placeholder="Например: 100" />
        <NumInput label="Ширина — B, м" value={B} onChange={(v) => { setB(v); setResult(null) }} placeholder="Например: 5" />
        <NumInput label="Высота — C, м" value={C} onChange={(v) => { setC(v); setResult(null) }} placeholder="Например: 3" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!A || !B || !C} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Объём выработки V" value={result.toFixed(2)} unit="м³" />
            <ExportButtons data={{
              title: "Расчёт объёма выработки",
              formula: "V = A × B × C",
              inputs: [
                { label: "Длина (A)", value: A, unit: "м" },
                { label: "Ширина (B)", value: B, unit: "м" },
                { label: "Высота (C)", value: C, unit: "м" },
              ],
              results: [
                { label: "Объём выработки (V)", value: result.toFixed(2), unit: "м³" },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabArea() {
  const [A, setA] = useState("")
  const [B, setB] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const a = parseFloat(A.replace(",", "."))
    const b = parseFloat(B.replace(",", "."))
    if ([a, b].every((v) => !isNaN(v) && v > 0)) setResult(a * b)
  }
  const reset = () => { setA(""); setB(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="Sп = A × B"
        params={[
          { sym: "Sп", desc: "Площадь пожара, м²" },
          { sym: "A", desc: "Длина охваченного участка, м" },
          { sym: "B", desc: "Ширина охваченного участка, м" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Длина — A, м" value={A} onChange={(v) => { setA(v); setResult(null) }} placeholder="Например: 10" />
        <NumInput label="Ширина — B, м" value={B} onChange={(v) => { setB(v); setResult(null) }} placeholder="Например: 5" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!A || !B} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Площадь пожара Sп" value={result.toFixed(2)} unit="м²" />
            <ExportButtons data={{
              title: "Расчёт площади пожара",
              formula: "Sп = A × B",
              inputs: [
                { label: "Длина охваченного участка (A)", value: A, unit: "м" },
                { label: "Ширина охваченного участка (B)", value: B, unit: "м" },
              ],
              results: [
                { label: "Площадь пожара (Sп)", value: result.toFixed(2), unit: "м²" },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabResistance() {
  const [n, setN] = useState("")
  const [Sp, setSp] = useState("")
  const [Q, setQ] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const nv = parseFloat(n.replace(",", "."))
    const sp = parseFloat(Sp.replace(",", "."))
    const q = parseFloat(Q.replace(",", "."))
    if ([nv, sp, q].every((v) => !isNaN(v) && v > 0)) setResult(nv * sp * q * q)
  }
  const reset = () => { setN(""); setSp(""); setQ(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="h = n × Sp × Q²"
        params={[
          { sym: "h", desc: "Потери напора в рукавной линии, м вод. ст." },
          { sym: "n", desc: "Количество рукавов в линии, шт." },
          { sym: "Sp", desc: "Сопротивление одного рукава (справочное значение)" },
          { sym: "Q", desc: "Расход воды через линию, л/с" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Количество рукавов — n, шт." value={n} onChange={(v) => { setN(v); setResult(null) }} placeholder="Например: 5" />
        <NumInput label="Сопротивление рукава — Sp" value={Sp} onChange={(v) => { setSp(v); setResult(null) }} placeholder="Например: 0,015" />
        <NumInput label="Расход воды — Q, л/с" value={Q} onChange={(v) => { setQ(v); setResult(null) }} placeholder="Например: 3,5" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!n || !Sp || !Q} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Потери напора h" value={result.toFixed(3)} unit="м вод. ст." />
            <ExportButtons data={{
              title: "Расчёт сопротивления рукавной линии",
              formula: "h = n × Sp × Q²",
              inputs: [
                { label: "Количество рукавов (n)", value: n, unit: "шт." },
                { label: "Сопротивление рукава (Sp)", value: Sp, unit: "" },
                { label: "Расход воды (Q)", value: Q, unit: "л/с" },
              ],
              results: [
                { label: "Потери напора (h)", value: result.toFixed(3), unit: "м вод. ст." },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabFireIndex() {
  const [co, setCo]   = useState("")
  const [o2, setO2]   = useState("")
  const [co2, setCo2] = useState("")
  const [n2, setN2]   = useState("")
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ Ig: number; Iy: number; fireStage: string; igStatus: string; iyStatus: string } | null>(null)

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
  const isFire = result?.fireStage === "ПОЖАР"

  const getExportData = (): ExportData => ({
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
              { range: "< 0.1",    label: "Нет пожара",          color: "text-green-400" },
              { range: "0.1–0.5",  label: "Начальная стадия",    color: "text-yellow-400" },
              { range: "0.5–1.0",  label: "Активное горение",    color: "text-orange-400" },
              { range: "> 1.0",    label: "Интенсивное горение", color: "text-red-400" },
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
              { range: "< 0.5",   label: "Нет пожара",           color: "text-green-400" },
              { range: "0.5–1.5", label: "Самонагревание",        color: "text-yellow-400" },
              { range: "1.5–3.0", label: "Начало пожара",         color: "text-orange-400" },
              { range: "> 3.0",   label: "Активный пожар",        color: "text-red-400" },
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
            { label: "Окись углерода — CO, %",   val: co,  set: (v:string)=>{setCo(v);setCalculated(false)},  ph: "Например: 0.008" },
            { label: "Кислород — O₂, %",          val: o2,  set: (v:string)=>{setO2(v);setCalculated(false)},  ph: "Например: 18.5" },
            { label: "Углекислый газ — CO₂, %",   val: co2, set: (v:string)=>{setCo2(v);setCalculated(false)}, ph: "Например: 1.2" },
            { label: "Азот — N₂, % (необяз.)",    val: n2,  set: (v:string)=>{setN2(v);setCalculated(false)},  ph: "Например: 79" },
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
            <ExportButtons data={getExportData()} />
          </div>
        )}
      </div>
    </div>
  )
}

export function TabInertGas() {
  const [V, setV]     = useState("")
  const [o2, setO2]   = useState("")
  const [o2t, setO2t] = useState("")
  const [q, setQ]     = useState("")
  const [gasType, setGasType] = useState<"N2"|"CO2">("N2")
  const [calculated, setCalculated] = useState(false)
  const [result, setResult] = useState<{ Vin: number; t: number; kh: number } | null>(null)

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

  const getExportData = (): ExportData => ({
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
            { label: "Объём пространства — V, м³", val: V,   set: (v:string)=>{setV(v);setCalculated(false)},   ph: "Например: 5000" },
            { label: "Текущий O₂, %",              val: o2,  set: (v:string)=>{setO2(v);setCalculated(false)},  ph: "Например: 18" },
            { label: "Целевой O₂, %",              val: o2t, set: (v:string)=>{setO2t(v);setCalculated(false)}, ph: "Например: 2" },
            { label: "Подача газа — q, м³/ч",      val: q,   set: (v:string)=>{setQ(v);setCalculated(false)},   ph: "Например: 200" },
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
            <ExportButtons data={getExportData()} />
          </div>
        )}
      </div>
    </div>
  )
}
