export type SearchResult = {
  id: string
  title: string
  subtitle?: string
  category: string
  route: string
  sectionIndex?: number
}

const SECTIONS: SearchResult[] = [
  { id: "s-ventilation", title: "Вентиляция", subtitle: "Расчёт площади сечения и аэродинамического сопротивления", category: "Раздел", route: "/", sectionIndex: 1 },
  { id: "s-firefighting", title: "Пожаротушение", subtitle: "Расчёт стволов, расхода, рукавов, пены и объёма", category: "Раздел", route: "/", sectionIndex: 2 },
  { id: "s-explosion", title: "Треугольник взрываемости", subtitle: "Диаграмма Гиббса — зона взрываемости по трём параметрам", category: "Раздел", route: "/explosion-triangle" },
  { id: "s-reference", title: "Справочник", subtitle: "Нормативные значения, материалы, свойства воздуха", category: "Раздел", route: "/", sectionIndex: 4 },
]

const GASES: SearchResult[] = [
  { id: "g-methane",  title: "Метан",        subtitle: "CH₄ · НПВ 5% · ВПВ 15% · Основной рудничный газ",         category: "Газ",      route: "/explosion-triangle" },
  { id: "g-hydrogen", title: "Водород",      subtitle: "H₂ · НПВ 4% · ВПВ 75% · Взрывоопасен в широком диапазоне", category: "Газ",      route: "/explosion-triangle" },
  { id: "g-co",       title: "Угарный газ",  subtitle: "CO · НПВ 12.5% · ВПВ 74% · Токсичен и взрывоопасен",       category: "Газ",      route: "/explosion-triangle" },
  { id: "g-ethane",   title: "Этан",         subtitle: "C₂H₆ · НПВ 3% · ВПВ 12.5% · Попутный газ в шахтах",       category: "Газ",      route: "/explosion-triangle" },
  { id: "g-propane",  title: "Пропан",       subtitle: "C₃H₈ · НПВ 2.1% · ВПВ 9.5% · Тяжелее воздуха",           category: "Газ",      route: "/explosion-triangle" },
  { id: "g-acetylene",title: "Ацетилен",     subtitle: "C₂H₂ · НПВ 2.5% · ВПВ 80%",                               category: "Газ",      route: "/explosion-triangle" },
]

const MATERIALS: SearchResult[] = [
  { id: "m-wood",       title: "Древесина",            subtitle: "Теплота сгорания 13,8 МДж/кг · плотность 500–1000 кг/м³", category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-wood-br",    title: "Древесина (бруски)",   subtitle: "Теплота сгорания 13,8 МДж/кг · скорость выгорания 0,039", category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-wood-pine",  title: "Древесина сосновая",   subtitle: "Теплота сгорания 14 МДж/кг",                               category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-anthracite", title: "Антрацит",             subtitle: "Теплота сгорания 30 МДж/кг · плотность 1420 кг/м³",       category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-charcoal",   title: "Древесный уголь",      subtitle: "Теплота сгорания 30 МДж/кг · плотность 190 кг/м³",        category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-coal",       title: "Каменный уголь",       subtitle: "Теплота сгорания 30 МДж/кг · плотность 1420 кг/м³",       category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-rubber",     title: "Резина",               subtitle: "Теплота сгорания 33,5 МДж/кг · скорость выгорания 0,011", category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-butane",     title: "Бутан",                subtitle: "Теплота сгорания 50 МДж/кг",                               category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-methane-m",  title: "Метан (материал)",     subtitle: "Теплота сгорания 50 МДж/кг",                               category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-propane-m",  title: "Пропан (материал)",    subtitle: "Теплота сгорания 50 МДж/кг",                               category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-ethane-m",   title: "Этан (материал)",      subtitle: "Теплота сгорания 50 МДж/кг",                               category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-benzin",     title: "Бензин",               subtitle: "Теплота сгорания 45 МДж/кг · плотность 700 кг/м³",        category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-diesel",     title: "Дизельное топливо",    subtitle: "Теплота сгорания 45 МДж/кг · плотность 700 кг/м³",        category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-mazut",      title: "Мазут",                subtitle: "Теплота сгорания 39,8 МДж/кг · плотность 820 кг/м³",      category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-oil",        title: "Нефть",                subtitle: "Теплота сгорания 45 МДж/кг · плотность 820 кг/м³",        category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-foam",       title: "Пенополиуретан",       subtitle: "Скорость выгорания 0,0028 кг/(м²·с)",                     category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-pp",         title: "Полипропилен",         subtitle: "Скорость выгорания 0,015 кг/(м²·с)",                      category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-pe",         title: "Полиэтилен",           subtitle: "Скорость выгорания 0,01 кг/(м²·с)",                       category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-cable1",     title: "Кабель АВВГ",          subtitle: "Электрокабель АВВГ · ПВХ-оболочка и изоляция",            category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-cable2",     title: "Кабель АПВГ",          subtitle: "Электрокабель АПВГ · ПВХ-оболочка и полиэтилен",          category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-paraffin",   title: "Фанера",               subtitle: "Теплота сгорания 18,2 МДж/кг",                            category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-bitum",      title: "Битум",                subtitle: "Теплота сгорания 41,9 МДж/кг",                            category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-solidol",    title: "Солидол",              subtitle: "Теплота сгорания 37,2 МДж/кг",                            category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-oil-tr",     title: "Масло трансформаторное", subtitle: "Теплота сгорания 43,1 МДж/кг",                          category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-oil-mot",    title: "Масло моторное",       subtitle: "Теплота сгорания 41,8 МДж/кг",                            category: "Материал", route: "/", sectionIndex: 4 },
  { id: "m-oil-ind",    title: "Масло индустриальное", subtitle: "Теплота сгорания 42,3 МДж/кг",                            category: "Материал", route: "/", sectionIndex: 4 },
]

const NORMS: SearchResult[] = [
  { id: "n-air-speed-f", title: "Скорость воздуха (принудит. проветривание)", subtitle: "3 м/с · Вентиляция",               category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-air-speed-n", title: "Скорость воздуха (естественное проветривание)", subtitle: "0.5–1 м/с · Вентиляция",        category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-air-min",     title: "Минимальный воздухообмен на человека",       subtitle: "6 м³/мин · Вентиляция",            category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-pdk-co",      title: "ПДК СО",                                     subtitle: "0.0017 мг/л · Вентиляция",         category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-pdk-no2",     title: "ПДК NO₂",                                    subtitle: "0.005 мг/л · Вентиляция",          category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-water-flow",  title: "Нормативный расход воды",                    subtitle: "10 л/с · Пожаротушение",           category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-pressure",    title: "Давление в пожарном трубопроводе",           subtitle: "0.3–0.6 МПа · Пожаротушение",      category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-hose-range",  title: "Радиус действия пожарного ствола",           subtitle: "15–25 м · Пожаротушение",          category: "Норматив", route: "/", sectionIndex: 4 },
  { id: "n-water-stock", title: "Запас воды",                                 subtitle: "не менее 250 м³ · Пожаротушение",  category: "Норматив", route: "/", sectionIndex: 4 },
]

const ALL_ITEMS: SearchResult[] = [...SECTIONS, ...GASES, ...MATERIALS, ...NORMS]

export function search(query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_ITEMS.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.subtitle?.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  ).slice(0, 12)
}
