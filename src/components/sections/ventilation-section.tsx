import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"



export function VentilationSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [L, setL] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = () => {
    const lNum = parseFloat(L.replace(",", "."))
    if (!isNaN(lNum) && lNum > 0) {
      const F = lNum / 3600
      setResult(F)
      setCalculated(true)
    }
  }

  const handleReset = () => {
    setL("")
    setResult(null)
    setCalculated(false)
  }

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
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
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Расчёт площади сечения канала</p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left — формула и описание */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
              <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
              <p className="font-mono text-2xl text-foreground md:text-3xl">
                F = L / 3600
              </p>
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

            </div>
          </div>

          {/* Right — калькулятор */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-mono text-xs text-foreground/60">
                  Подача ГВУ — L, м³/ч
                </label>
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
                <div
                  className="rounded-xl border border-foreground/20 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-500 md:p-6"
                >
                  <p className="mb-1 font-mono text-xs text-foreground/50 uppercase tracking-widest">Результат</p>
                  <p className="font-sans text-4xl font-light text-foreground md:text-5xl">
                    {result.toFixed(4)} <span className="text-2xl text-foreground/60">м²</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-foreground/50">
                    {(result * 10000).toFixed(2)} см² · {(result * 1000000).toFixed(0)} мм²
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}