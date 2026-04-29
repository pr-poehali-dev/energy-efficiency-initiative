import { useState } from "react"
import { NumInput, ResultRow, ResultBox, FormulaBox, CalcButtons, ExportButtons } from "./firefighting-ui"

export function TabTrunks() {
  const [Sp, setSp] = useState("")
  const [Jn, setJn] = useState("")
  const [qStv, setQStv] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const sp = parseFloat(Sp.replace(",", "."))
    const jn = parseFloat(Jn.replace(",", "."))
    const q = parseFloat(qStv.replace(",", "."))
    if ([sp, jn, q].every((v) => !isNaN(v) && v > 0)) setResult((sp * jn) / q)
  }
  const reset = () => { setSp(""); setJn(""); setQStv(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="Nств = Sп × Jн / qств"
        params={[
          { sym: "Sп", desc: "Площадь пожара, м²" },
          { sym: "Jн", desc: "Нормативная интенсивность, л/(с·м²) — негорючая крепь: 0,55; горючая: 1,66" },
          { sym: "qств", desc: "Расход одного ствола, л/с (водяная завеса на копрах: ≥ 7 л/с)" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Площадь пожара — Sп, м²" value={Sp} onChange={(v) => { setSp(v); setResult(null) }} placeholder="Например: 50" />
        <NumInput label="Нормативная интенсивность — Jн, л/(с·м²)" value={Jn} onChange={(v) => { setJn(v); setResult(null) }} placeholder="0,55 или 1,66" />
        <NumInput label="Расход одного ствола — qств, л/с" value={qStv} onChange={(v) => { setQStv(v); setResult(null) }} placeholder="Например: 3,5" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!Sp || !Jn || !qStv} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Количество стволов Nств" value={Math.ceil(result).toString()} unit="шт." />
            <div className="border-t border-foreground/10 pt-2">
              <p className="font-mono text-xs text-foreground/40">Точное значение: {result.toFixed(2)}</p>
            </div>
            <ExportButtons data={{
              title: "Расчёт количества стволов",
              formula: "Nств = Sп × Jн / qств",
              inputs: [
                { label: "Площадь пожара (Sп)", value: Sp, unit: "м²" },
                { label: "Нормативная интенсивность (Jн)", value: Jn, unit: "л/(с·м²)" },
                { label: "Расход одного ствола (qств)", value: qStv, unit: "л/с" },
              ],
              results: [
                { label: "Количество стволов (Nств)", value: Math.ceil(result).toString(), unit: "шт." },
                { label: "Точное значение", value: result.toFixed(2), unit: "шт." },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabFlow() {
  const [Sp, setSp] = useState("")
  const [Jn, setJn] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const sp = parseFloat(Sp.replace(",", "."))
    const jn = parseFloat(Jn.replace(",", "."))
    if ([sp, jn].every((v) => !isNaN(v) && v > 0)) setResult(sp * jn)
  }
  const reset = () => { setSp(""); setJn(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="Qтр = Sп × Jн"
        params={[
          { sym: "Qтр", desc: "Требуемый расход раствора, л/с" },
          { sym: "Sп", desc: "Площадь пожара, м²" },
          { sym: "Jн", desc: "Нормативная интенсивность, л/(с·м²)" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Площадь пожара — Sп, м²" value={Sp} onChange={(v) => { setSp(v); setResult(null) }} placeholder="Например: 50" />
        <NumInput label="Нормативная интенсивность — Jн, л/(с·м²)" value={Jn} onChange={(v) => { setJn(v); setResult(null) }} placeholder="0,55 или 1,66" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!Sp || !Jn} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Требуемый расход Qтр" value={result.toFixed(3)} unit="л/с" />
            <div className="border-t border-foreground/10 pt-2">
              <ResultRow label="" value={(result * 3.6).toFixed(2)} unit="м³/ч" />
            </div>
            <ExportButtons data={{
              title: "Расчёт требуемого расхода воды",
              formula: "Qтр = Sп × Jн",
              inputs: [
                { label: "Площадь пожара (Sп)", value: Sp, unit: "м²" },
                { label: "Нормативная интенсивность (Jн)", value: Jn, unit: "л/(с·м²)" },
              ],
              results: [
                { label: "Требуемый расход (Qтр)", value: result.toFixed(3), unit: "л/с" },
                { label: "Требуемый расход (Qтр)", value: (result * 3.6).toFixed(2), unit: "м³/ч" },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabHoses() {
  const [L, setL] = useState("")
  const [lp, setLp] = useState("20")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const l = parseFloat(L.replace(",", "."))
    const lpr = parseFloat(lp.replace(",", "."))
    if ([l, lpr].every((v) => !isNaN(v) && v > 0)) setResult((1.2 * l) / lpr)
  }
  const reset = () => { setL(""); setLp("20"); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="n = 1,2 × L / lp"
        params={[
          { sym: "n", desc: "Количество пожарных рукавов, шт." },
          { sym: "L", desc: "Расстояние от пожара до водоисточника, м" },
          { sym: "lp", desc: "Средняя длина одного рукава, м (обычно 20 м)" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Расстояние до водоисточника — L, м" value={L} onChange={(v) => { setL(v); setResult(null) }} placeholder="Например: 200" />
        <NumInput label="Длина одного рукава — lp, м" value={lp} onChange={(v) => { setLp(v); setResult(null) }} placeholder="20" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!L} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Количество рукавов n" value={Math.ceil(result).toString()} unit="шт." />
            <div className="border-t border-foreground/10 pt-2">
              <p className="font-mono text-xs text-foreground/40">Точное значение: {result.toFixed(2)}</p>
            </div>
            <ExportButtons data={{
              title: "Расчёт количества пожарных рукавов",
              formula: "n = 1,2 × L / lp",
              inputs: [
                { label: "Расстояние до водоисточника (L)", value: L, unit: "м" },
                { label: "Длина одного рукава (lp)", value: lp, unit: "м" },
              ],
              results: [
                { label: "Количество рукавов (n)", value: Math.ceil(result).toString(), unit: "шт." },
                { label: "Точное значение", value: result.toFixed(2), unit: "шт." },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabFlood() {
  const [V, setV] = useState("")
  const [q, setQ] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const v = parseFloat(V.replace(",", "."))
    const qv = parseFloat(q.replace(",", "."))
    if ([v, qv].every((x) => !isNaN(x) && x > 0)) setResult(v / qv)
  }
  const reset = () => { setV(""); setQ(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="t = V / q"
        params={[
          { sym: "t", desc: "Время заполнения выработки, ч" },
          { sym: "V", desc: "Объём выработки, м³" },
          { sym: "q", desc: "Скорость заполнения (приход), м³/ч" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Объём выработки — V, м³" value={V} onChange={(v) => { setV(v); setResult(null) }} placeholder="Например: 500" />
        <NumInput label="Скорость заполнения — q, м³/ч" value={q} onChange={(v) => { setQ(v); setResult(null) }} placeholder="Например: 50" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!V || !q} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Время затопления t" value={result.toFixed(2)} unit="ч" />
            <div className="border-t border-foreground/10 pt-2">
              <ResultRow label="" value={(result * 60).toFixed(0)} unit="мин" />
            </div>
            <ExportButtons data={{
              title: "Расчёт времени затопления выработки",
              formula: "t = V / q",
              inputs: [
                { label: "Объём выработки (V)", value: V, unit: "м³" },
                { label: "Скорость заполнения (q)", value: q, unit: "м³/ч" },
              ],
              results: [
                { label: "Время затопления (t)", value: result.toFixed(2), unit: "ч" },
                { label: "Время затопления (t)", value: (result * 60).toFixed(0), unit: "мин" },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}

export function TabFoam() {
  const [Sp, setSp] = useState("")
  const [Jn, setJn] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const calc = () => {
    const sp = parseFloat(Sp.replace(",", "."))
    const jn = parseFloat(Jn.replace(",", "."))
    if ([sp, jn].every((v) => !isNaN(v) && v > 0)) setResult(sp * jn)
  }
  const reset = () => { setSp(""); setJn(""); setResult(null) }

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <FormulaBox
        formula="Qтр = Jн × Sп"
        params={[
          { sym: "Qтр", desc: "Требуемый расход раствора пенообразователя, л/с" },
          { sym: "Jн", desc: "Нормативная интенсивность подачи раствора, л/(с·м²)" },
          { sym: "Sп", desc: "Площадь пожара, м²" },
        ]}
      />
      <div className="space-y-5">
        <NumInput label="Площадь пожара — Sп, м²" value={Sp} onChange={(v) => { setSp(v); setResult(null) }} placeholder="Например: 50" />
        <NumInput label="Нормативная интенсивность — Jн, л/(с·м²)" value={Jn} onChange={(v) => { setJn(v); setResult(null) }} placeholder="Например: 0,08" />
        <CalcButtons onCalc={calc} onReset={reset} disabled={!Sp || !Jn} showReset={result !== null} />
        {result !== null && (
          <ResultBox>
            <ResultRow label="Расход пенообразователя Qтр" value={result.toFixed(3)} unit="л/с" />
            <div className="border-t border-foreground/10 pt-2">
              <ResultRow label="" value={(result * 3.6).toFixed(2)} unit="м³/ч" />
            </div>
            <ExportButtons data={{
              title: "Расчёт расхода пенообразователя",
              formula: "Qтр = Jн × Sп",
              inputs: [
                { label: "Площадь пожара (Sп)", value: Sp, unit: "м²" },
                { label: "Нормативная интенсивность (Jн)", value: Jn, unit: "л/(с·м²)" },
              ],
              results: [
                { label: "Расход пенообразователя (Qтр)", value: result.toFixed(3), unit: "л/с" },
                { label: "Расход пенообразователя (Qтр)", value: (result * 3.6).toFixed(2), unit: "м³/ч" },
              ],
            }} />
          </ResultBox>
        )}
      </div>
    </div>
  )
}
