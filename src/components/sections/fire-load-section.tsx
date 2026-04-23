import { useReveal } from "@/hooks/use-reveal"
import { useState } from "react"
import Icon from "@/components/ui/icon"

const MAIN_MATERIALS = [
  { id: "31030115", name: "Древесина", qh: "13,8 [1,109]", qkr: "13,9 [1,236]", density: "500–1000" },
  { id: "31030120", name: "Древесина (бруски)", qh: "13,8", qkr: "", density: "500" },
  { id: "31030130", name: "Древесина сосновая", qh: "14", qkr: "21", density: "500" },
  { id: "32080", name: "Уголь", qh: "", qkr: "", density: "", header: true },
  { id: "32080105", name: "Антрацит", qh: "30", qkr: "", density: "1420" },
  { id: "32080110", name: "Древесный уголь", qh: "30", qkr: "", density: "190" },
  { id: "32080115", name: "Каменный уголь", qh: "30", qkr: "", density: "1420" },
  { id: "31110145", name: "Резина", qh: "33,5 [1,156]", qkr: "14,8 [1,237]", density: "900–1200" },
  { id: "32030", name: "Парафиновый ряд", qh: "", qkr: "", density: "", header: true },
  { id: "32030105", name: "Бутан", qh: "50", qkr: "", density: "2,02" },
  { id: "32030110", name: "Метан", qh: "50", qkr: "", density: "2,02" },
  { id: "32030115", name: "Пропан", qh: "50", qkr: "", density: "2,02" },
  { id: "32030120", name: "Этан", qh: "50", qkr: "", density: "2,02" },
  { id: "32040", name: "Виды горючего", qh: "", qkr: "", density: "", header: true },
  { id: "32040105", name: "Бензин", qh: "45", qkr: "", density: "700" },
  { id: "32040110", name: "Дизельное топливо", qh: "45", qkr: "", density: "700" },
  { id: "32040115", name: "Мазут", qh: "39,8", qkr: "", density: "820" },
  { id: "32040120", name: "Нефть", qh: "45", qkr: "", density: "820" },
]

const AIR_PROPERTIES = [
  { temp: "-40", density: "1,515", cp: "1,005", alpha: "3,67", v: "10,04", lambda: "0,0212", pr: "0,728" },
  { temp: "0",  density: "1,293", cp: "1,005", alpha: "3,67", v: "13,3",  lambda: "0,0243", pr: "0,715" },
  { temp: "10", density: "1,248", cp: "1,005", alpha: "3,55", v: "14,16", lambda: "0,025",  pr: "0,705" },
  { temp: "20", density: "1,205", cp: "1,005", alpha: "3,43", v: "15,11", lambda: "0,0257", pr: "0,713" },
  { temp: "40", density: "1,127", cp: "1,005", alpha: "3,2",  v: "16,97", lambda: "0,0271", pr: "0,711" },
  { temp: "60", density: "1,067", cp: "1,009", alpha: "3",    v: "18,9",  lambda: "0,0285", pr: "0,709" },
  { temp: "80", density: "1",     cp: "1,009", alpha: "2,83", v: "20,94", lambda: "0,0299", pr: "0,708" },
  { temp: "100",density: "0,946", cp: "1,009", alpha: "2,68", v: "23,06", lambda: "0,0314", pr: "0,703" },
]

const BURNING_PROPS = [
  { name: "Резина",                          qh: "36",   smoke: "0,011",  mass: "0,018",  flame: "2,99", oxygen: "0,42",  toxic: "0,015" },
  { name: "Бензин",                          qh: "45",   smoke: "0,06",   mass: "—",      flame: "3,41", oxygen: "2,92",  toxic: "0,175" },
  { name: "Дизельное топливо",               qh: "45",   smoke: "0,043",  mass: "—",      flame: "3,37", oxygen: "3,16",  toxic: "0,122" },
  { name: "Электрокабель АВВГ; ПВХ-оболочка и изоляция", qh: "25", smoke: "0,024", mass: "0,007", flame: "2,19", oxygen: "0,4", toxic: "0,109" },
  { name: "Электрокабель АПВГ; ПВХ-оболочка и полиэтилен", qh: "36,4", smoke: "0,024", mass: "0,007", flame: "2,19", oxygen: "0,9", toxic: "0,15" },
  { name: "Телефонный кабель ТВВ; ПВХ и полиэтилен",   qh: "34,6", smoke: "0,0085", mass: "0,0022", flame: "2,19", oxygen: "0,9", toxic: "0,124" },
  { name: "Хвойные древесные стройматериалы", qh: "13,8", smoke: "0,006", mass: "0,059", flame: "1,15", oxygen: "1,57", toxic: "0,024" },
  { name: "Лиственные древесные стройматериалы", qh: "13,8", smoke: "0,014", mass: "0,059", flame: "1,15", oxygen: "1,57", toxic: "0,024" },
  { name: "Провода в резиновой изоляции (КПРТ, ПТ, ВПРС)", qh: "37,8", smoke: "0,192", mass: "0,005", flame: "2,99", oxygen: "0,42", toxic: "0,15" },
  { name: "Кабели 0,75-(АВВГ, АПВГ, ТПВ) 0,25-(КПРТ, ПР, ШРПС)", qh: "33,5", smoke: "0,062", mass: "0,0054", flame: "2,39", oxygen: "0,66", toxic: "0,1" },
]

const BURN_RATE = [
  { name: "Пенополиуретан",      rate: "0,0028" },
  { name: "Полипропилен",        rate: "0,015" },
  { name: "Полиэтилен",          rate: "0,01" },
  { name: "Резина",              rate: "0,011" },
  { name: "Древесина (бруски)",  rate: "0,039" },
]

const LOW_HEAT = [
  { name: "Древесина",                 value: "13,8" },
  { name: "Древесина (бруски)",        value: "13,8" },
  { name: "Древесина сосновая",        value: "18,7–20,8" },
  { name: "Антрацит",                  value: "33,9–34,8" },
  { name: "Древесный уголь",           value: "33,9" },
  { name: "Каменный уголь",            value: "30" },
  { name: "Резина",                    value: "33,5" },
  { name: "Масло трансформаторное",    value: "43,1" },
  { name: "Масло моторное",            value: "41,8" },
  { name: "Масло индустриальное",      value: "42,3" },
  { name: "Пластик",                   value: "33,6" },
  { name: "Битум",                     value: "41,9" },
  { name: "Фанера",                    value: "18,2" },
  { name: "Солидол",                   value: "37,2" },
]

type TabKey = "main" | "air" | "burning" | "burnrate" | "lowheat"

const TABS: { key: TabKey; label: string }[] = [
  { key: "main",     label: "Материалы СИТИС" },
  { key: "air",      label: "Свойства воздуха" },
  { key: "burning",  label: "Свойства горения" },
  { key: "burnrate", label: "Скорость выгорания" },
  { key: "lowheat",  label: "Теплота сгорания" },
]

export function FireLoadSection() {
  const { ref, isVisible } = useReveal(0.2)
  const [activeTab, setActiveTab] = useState<TabKey>("main")

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start flex-col px-4 pt-20 pb-6 md:px-12 lg:px-16"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col h-full">
        {/* Header */}
        <div
          className={`mb-6 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-1 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Пожарная нагрузка
          </h2>
          <p className="font-mono text-xs text-foreground/60 md:text-sm">/ Справочник СИТИС-СПН-1 от 15.05.2014г.</p>
        </div>

        {/* Tabs */}
        <div
          className={`mb-4 flex gap-2 flex-wrap transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg border px-3 py-1.5 font-sans text-xs transition-all md:text-sm ${
                activeTab === tab.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table area */}
        <div
          className={`flex-1 overflow-auto rounded-xl border border-foreground/10 bg-foreground/5 backdrop-blur-sm transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Tab: Материалы СИТИС */}
          {activeTab === "main" && (
            <table className="w-full text-xs md:text-sm">
              <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                <tr className="border-b border-foreground/10">
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">ИД</th>
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">Наименование</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Qh, МДж/кг</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">qкр, кВт/м²</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Плотность, кг/м³</th>
                </tr>
              </thead>
              <tbody>
                {MAIN_MATERIALS.map((row) =>
                  row.header ? (
                    <tr key={row.id} className="bg-foreground/10">
                      <td colSpan={5} className="px-3 py-2 font-sans text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                        {row.name}
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-foreground/50">{row.id}</td>
                      <td className="px-3 py-2.5 text-foreground/80">{row.name}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-foreground">{row.qh || "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-foreground">{row.qkr || "—"}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-foreground">{row.density || "—"}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}

          {/* Tab: Свойства воздуха */}
          {activeTab === "air" && (
            <table className="w-full text-xs md:text-sm">
              <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                <tr className="border-b border-foreground/10">
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">t, °C</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">ρ, кг/м³</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Cp, кДж/(кг·К)</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">α×10⁻³, (1/К)</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">ν×10⁻⁶, м²/с</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">λ, кДж/(м·К)</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Pr</th>
                </tr>
              </thead>
              <tbody>
                {AIR_PROPERTIES.map((row) => (
                  <tr key={row.temp} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-foreground">{row.temp}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.density}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.cp}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.alpha}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.v}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.lambda}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.pr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Tab: Свойства горения */}
          {activeTab === "burning" && (
            <table className="w-full text-xs md:text-sm">
              <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                <tr className="border-b border-foreground/10">
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">Материал</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Qh, МДж/кг</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Дымообр., Нп·м²/кг</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Уд. скорость выгор., кг/(м²·с)</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Скорость пламени, м/с</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Расход О₂, кг/кг</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Токс. прод., кг/кг</th>
                </tr>
              </thead>
              <tbody>
                {BURNING_PROPS.map((row, i) => (
                  <tr key={i} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <td className="px-3 py-2.5 text-foreground/80 max-w-[200px]">{row.name}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">{row.qh}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.smoke}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.mass}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.flame}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.oxygen}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{row.toxic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Tab: Скорость выгорания */}
          {activeTab === "burnrate" && (
            <table className="w-full text-xs md:text-sm">
              <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                <tr className="border-b border-foreground/10">
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">Вещество / Материал</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Уд. массовая скорость выгорания, кг/(м²·с)</th>
                </tr>
              </thead>
              <tbody>
                {BURN_RATE.map((row, i) => (
                  <tr key={i} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <td className="px-3 py-3 text-foreground/80">{row.name}</td>
                    <td className="px-3 py-3 text-right font-mono text-foreground">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Tab: Теплота сгорания */}
          {activeTab === "lowheat" && (
            <table className="w-full text-xs md:text-sm">
              <thead className="sticky top-0 bg-background/80 backdrop-blur-sm">
                <tr className="border-b border-foreground/10">
                  <th className="px-3 py-3 text-left font-mono text-xs text-foreground/40 uppercase tracking-widest">Вещество / Материал</th>
                  <th className="px-3 py-3 text-right font-mono text-xs text-foreground/40 uppercase tracking-widest">Низшая теплота сгорания, МДж/кг</th>
                </tr>
              </thead>
              <tbody>
                {LOW_HEAT.map((row, i) => (
                  <tr key={i} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <td className="px-3 py-3 text-foreground/80">{row.name}</td>
                    <td className="px-3 py-3 text-right font-mono text-foreground">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-3 font-mono text-xs text-foreground/40 flex items-center gap-2 shrink-0">
          <Icon name="Info" size={12} />
          Источник: СИТИС-СПН-1 от 15.05.2014г.
        </p>
      </div>
    </section>
  )
}
