import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"

export function FirefightingSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [S, setS] = useState("")
  const [result, setResult] = useState<{ qw: number; Qw: number } | null>(null)
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = () => {
    const sNum = parseFloat(S.replace(",", "."))
    if (!isNaN(sNum) && sNum > 0) {
      const qw = 0.2 * Math.sqrt(sNum)
      const Qw = qw * 10
      setResult({ qw, Qw })
      setCalculated(true)
    }
  }

  const handleReset = () => {
    setS("")
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
            Пожаротушение
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Расчёт расхода воды на тушение</p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="mb-6 rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm md:p-8">
              <p className="mb-3 font-mono text-xs text-foreground/50 uppercase tracking-widest">Формула</p>
              <p className="font-mono text-2xl text-foreground md:text-3xl">
                qw = 0.2 × √S
              </p>
            </div>

            <div className="space-y-3 text-sm text-foreground/70 md:text-base">
              <div className="flex items-start gap-3">
                <span className="mt-1 font-mono text-xs text-foreground/40">qw</span>
                <span>Удельный расход воды, л/с·м²</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 font-mono text-xs text-foreground/40">S</span>
                <span>Площадь выработки, м²</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 font-mono text-xs text-foreground/40">Qw</span>
                <span>Общий расход воды — <strong className="text-foreground">qw × 10</strong>, л/с</span>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-mono text-xs text-foreground/60">
                  Площадь выработки — S, м²
                </label>
                <input
                  type="number"
                  value={S}
                  onChange={(e) => { setS(e.target.value); setCalculated(false) }}
                  min="0"
                  step="any"
                  placeholder="Например: 25"
                  className="w-full border-b border-foreground/30 bg-transparent py-2 text-lg text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none md:text-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!S || parseFloat(S) <= 0}
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
                  <div className="space-y-2">
                    <div>
                      <p className="font-mono text-xs text-foreground/50">Удельный расход qw</p>
                      <p className="font-sans text-3xl font-light text-foreground md:text-4xl">
                        {result.qw.toFixed(3)} <span className="text-xl text-foreground/60">л/с·м²</span>
                      </p>
                    </div>
                    <div className="border-t border-foreground/10 pt-2">
                      <p className="font-mono text-xs text-foreground/50">Общий расход Qw</p>
                      <p className="font-sans text-3xl font-light text-foreground md:text-4xl">
                        {result.Qw.toFixed(2)} <span className="text-xl text-foreground/60">л/с</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
