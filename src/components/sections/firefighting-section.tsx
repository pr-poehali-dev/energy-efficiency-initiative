import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"

type TabKey = "trunks" | "flow" | "hoses" | "flood" | "foam" | "volume" | "area" | "resistance"

const TABS: { key: TabKey; label: string; short: string }[] = [
  { key: "trunks",     label: "Кол-во стволов",       short: "Nств" },
  { key: "flow",       label: "Требуемый расход",      short: "Qтр" },
  { key: "hoses",      label: "Кол-во рукавов",        short: "n" },
  { key: "flood",      label: "Время затопления",      short: "t" },
  { key: "foam",       label: "Расход пенообразователя", short: "Qпен" },
  { key: "volume",     label: "Объём выработки",       short: "V" },
  { key: "area",       label: "Площадь пожара",        short: "Sп" },
  { key: "resistance", label: "Сопротивление линии",   short: "h" },
]

function NumInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs text-foreground/60">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="any"
        placeholder={placeholder ?? "0"}
        className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
      />
    </div>
  )
}

function ResultRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-foreground/50">{label}</p>
      <p className="font-sans text-3xl font-light text-foreground md:text-4xl">
        {value} <span className="text-xl text-foreground/60">{unit}</span>
      </p>
    </div>
  )
}

function CalcButtons({ onCalc, onReset, disabled, showReset }: { onCalc: () => void; onReset: () => void; disabled: boolean; showReset: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onCalc}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 font-sans text-sm font-medium text-background transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Icon name="Calculator" size={16} />
        Рассчитать
      </button>
      {showReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border border-foreground/20 px-5 py-3 font-sans text-sm text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
        >
          <Icon name="RotateCcw" size={14} />
          Сбросить
        </button>
      )}
    </div>
  )
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-foreground/50">Результат</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FormulaBox({ formula, params }: { formula: string; params: { sym: string; desc: string }[] }) {
  return (
    <div>
      <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-foreground/50">Формула</p>
        <p className="font-mono text-xl text-foreground md:text-2xl">{formula}</p>
      </div>
      <div className="space-y-3 text-sm text-foreground/70 md:text-base">
        {params.map(({ sym, desc }) => (
          <div key={sym} className="flex items-start gap-3">
            <span className="mt-1 min-w-[2.5rem] font-mono text-xs text-foreground/40">{sym}</span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabTrunks() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabFlow() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabHoses() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabFlood() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabFoam() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabVolume() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabArea() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

function TabResistance() {
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
          </ResultBox>
        )}
      </div>
    </div>
  )
}

const TAB_CONTENT: Record<TabKey, React.FC> = {
  trunks: TabTrunks,
  flow: TabFlow,
  hoses: TabHoses,
  flood: TabFlood,
  foam: TabFoam,
  volume: TabVolume,
  area: TabArea,
  resistance: TabResistance,
}

export function FirefightingSection({ sectionRef }: { sectionRef?: (el: HTMLElement | null) => void } = {}) {
  const { ref, isVisible } = useReveal(0.3)
  const [activeTab, setActiveTab] = useState<TabKey>("trunks")

  const ActiveContent = TAB_CONTENT[activeTab]

  return (
    <section
      ref={(el) => { ref.current = el; sectionRef?.(el) }}
      className="flex min-h-screen w-full flex-col px-4 py-24 md:px-12 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-10 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Пожаротушение
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Расчёты для горных выработок</p>
        </div>

        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 font-mono text-xs transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-foreground text-background"
                    : "border border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <ActiveContent />
        </div>
      </div>
    </section>
  )
}
