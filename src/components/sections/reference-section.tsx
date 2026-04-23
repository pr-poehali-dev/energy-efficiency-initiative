import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"

const REFERENCE_DATA = [
  {
    category: "Вентиляция",
    items: [
      { name: "Скорость воздуха (принудит. проветривание)", value: "3 м/с" },
      { name: "Скорость воздуха (естественное проветривание)", value: "0.5–1 м/с" },
      { name: "Минимальный воздухообмен на человека", value: "6 м³/мин" },
      { name: "ПДК СО", value: "0.0017 мг/л" },
      { name: "ПДК NO₂", value: "0.005 мг/л" },
    ],
  },
  {
    category: "Пожаротушение",
    items: [
      { name: "Нормативный расход воды (подземные выработки)", value: "10 л/с" },
      { name: "Давление в пожарном трубопроводе", value: "0.3–0.6 МПа" },
      { name: "Радиус действия пожарного ствола", value: "15–25 м" },
      { name: "Запас воды (не менее)", value: "250 м³" },
    ],
  },
  {
    category: "Общие нормативы",
    items: [
      { name: "Стандартная высота горной выработки", value: "2.0–3.5 м" },
      { name: "Ширина пешеходного прохода", value: "≥ 1.2 м" },
      { name: "Освещённость на рабочем месте", value: "≥ 50 лк" },
      { name: "Уровень шума (допустимый)", value: "≤ 80 дБ" },
    ],
  },
]

export function ReferenceSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [activeCategory, setActiveCategory] = useState(0)

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
            Справочник
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Нормативные значения для расчётов</p>
        </div>

        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="mb-6 flex gap-2 flex-wrap">
            {REFERENCE_DATA.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(i)}
                className={`rounded-lg border px-4 py-2 font-sans text-sm transition-all ${
                  activeCategory === i
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-foreground/10 bg-foreground/5 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-2 border-b border-foreground/10 px-5 py-3 md:px-8">
              <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Параметр</p>
              <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Значение</p>
            </div>
            {REFERENCE_DATA[activeCategory].items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b border-foreground/5 px-5 py-4 last:border-0 hover:bg-foreground/5 transition-colors md:px-8"
              >
                <p className="text-sm text-foreground/80 pr-4 md:text-base">{item.name}</p>
                <p className="font-mono text-sm text-foreground font-medium md:text-base">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 font-mono text-xs text-foreground/40 flex items-center gap-2">
            <Icon name="Info" size={12} />
            Значения приведены согласно действующим нормам и правилам безопасности
          </p>
        </div>
      </div>
    </section>
  )
}
