import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import Icon from "@/components/ui/icon"
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx"
import * as XLSX from "xlsx"

const ACCIDENT_TYPES = ["Пожар", "Взрыв", "Загазованность", "Обрушение", "Затопление", "Прочее"]

interface LegendItem {
  id: string
  symbol: string
  description: string
}

const DEFAULT_LEGEND: LegendItem[] = [
  { id: "1", symbol: "🏭", description: "Надшахтное здание" },
  { id: "2", symbol: "🔥", description: "Пожар" },
  { id: "3", symbol: "ВГК", description: "Стационарный пункт ВГК" },
  { id: "4", symbol: "→", description: "Отделение в движении" },
]

interface FormData {
  position: string
  date: string
  time: string
  timezone: string
  objectName: string
  accidentType: string
  accidentDate: string
  accidentTime: string
  accidentLocation: string
  airVolume: string
  sectionArea: string
  phoneCP: string
  co: string
  co2: string
  so2: string
  o2: string
  ch4: string
  nono2: string
  so2_2: string
  temperature: string
  smokeLevel: string
  headRescue: string
  assistantCommander: string
  commanderName: string
}

const DEFAULT_FORM: FormData = {
  position: "28",
  date: new Date().toLocaleDateString("ru-RU"),
  time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  timezone: "мск",
  objectName: "",
  accidentType: "Пожар",
  accidentDate: new Date().toLocaleDateString("ru-RU"),
  accidentTime: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  accidentLocation: "",
  airVolume: "",
  sectionArea: "",
  phoneCP: "",
  co: "",
  co2: "",
  so2: "",
  o2: "",
  ch4: "",
  nono2: "",
  so2_2: "",
  temperature: "",
  smokeLevel: "",
  headRescue: "",
  assistantCommander: "",
  commanderName: "",
}

function Field({ label, value, onChange, placeholder = "", wide = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  wide?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs text-foreground/50 font-mono uppercase tracking-wider">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
      />
    </div>
  )
}

function GasField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono text-foreground/70 w-20 shrink-0">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0,00%"
        className="w-full bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
      />
    </div>
  )
}

export default function EmergencyScheme() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [legend, setLegend] = useState<LegendItem[]>(DEFAULT_LEGEND)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = (field: keyof FormData) => (v: string) => setForm(f => ({ ...f, [field]: v }))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const addLegendItem = () => {
    setLegend(l => [...l, { id: Date.now().toString(), symbol: "", description: "" }])
  }

  const updateLegend = (id: string, field: "symbol" | "description", value: string) => {
    setLegend(l => l.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeLegend = (id: string) => {
    setLegend(l => l.filter(item => item.id !== id))
  }

  const exportToExcel = () => {
    const rows: (string | number)[][] = [
      ["СХЕМА АВАРИЙНОГО УЧАСТКА"],
      [`Позиция: ${form.position}`, `Дата: ${form.date}`, `Время: ${form.time} (${form.timezone})`],
      [],
      ["Наименование объекта:", form.objectName],
      ["Вид аварии:", form.accidentType],
      ["Дата и время аварии:", `${form.accidentDate} ${form.accidentTime} (${form.timezone})`],
      ["Место аварии:", form.accidentLocation],
      ["Количество воздуха:", `${form.airVolume} м³/с`],
      ["Сечение аварийной выработки:", `${form.sectionArea} м²`],
      ["Телефон КП:", form.phoneCP],
      [],
      ["СОСТАВ РУДНИЧНОЙ АТМОСФЕРЫ"],
      ["Параметр", "Значение"],
      ["CO", form.co],
      ["CO2", form.co2],
      ["SO2", form.so2],
      ["O2", form.o2],
      ["CH4", form.ch4],
      ["NO-NO2", form.nono2],
      ["t°", form.temperature],
      ["Степень задымлённости", form.smokeLevel],
      [],
      ["УСЛОВНЫЕ ОБОЗНАЧЕНИЯ"],
      ...legend.map(l => [l.symbol, l.description]),
      [],
      ["Руководитель горноспасательных работ:", form.headRescue],
      ["Помощник командира отряда:", form.assistantCommander],
      ["", form.commanderName],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws["!cols"] = [{ wch: 40 }, { wch: 35 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Схема аварийного участка")
    XLSX.writeFile(wb, `Схема_аварийного_участка_поз${form.position}.xlsx`)
  }

  const exportToWord = async () => {
    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    }
    const thinBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    }

    const makeRow = (label: string, value: string) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
          }),
          new TableCell({
            borders: noBorder,
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })],
          }),
        ],
      })

    const gasRow = (label: string, value: string) =>
      new TableRow({
        children: [
          new TableCell({ borders: thinBorder, width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label, size: 18, bold: true })] })] }),
          new TableCell({ borders: thinBorder, width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: value || "—", size: 18 })] })] }),
        ],
      })

    const children: (Paragraph | Table)[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `Схема аварийного участка — позиция  ${form.position}     ${form.date}     ${form.time}  (${form.timezone})`, bold: true, size: 26 }),
        ],
        spacing: { after: 400 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeRow("Наименование обслуживаемого объекта:", form.objectName),
          makeRow("Вид аварии:", form.accidentType),
          makeRow("Дата и время аварии:", `${form.accidentDate}  ${form.accidentTime}  (${form.timezone})`),
          makeRow("Место аварии:", form.accidentLocation),
          makeRow("Количество воздуха в аварийной выработке:", `${form.airVolume} м³/с`),
          makeRow("Сечение аварийной выработки:", `${form.sectionArea} м²`),
          makeRow("Телефон КП:", form.phoneCP),
        ],
      }),
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "Состав рудничной атмосферы:", bold: true, size: 22, underline: {} })],
        spacing: { before: 200, after: 100 },
      }),
      new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        rows: [
          gasRow("CO", form.co),
          gasRow("CO2", form.co2),
          gasRow("SO2", form.so2),
          gasRow("O2", form.o2),
          gasRow("CH4", form.ch4),
          gasRow("NO-NO2", form.nono2),
          gasRow("t°", form.temperature),
          gasRow("Задымлённость", form.smokeLevel),
        ],
      }),
      new Paragraph({ spacing: { after: 300 } }),
    ]

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Схема участка:", bold: true, size: 22 })],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: { width: 600, height: 380 },
              type: imageFile.type.includes("png") ? "png" : "jpg",
            }),
          ],
          spacing: { after: 300 },
        }),
      )
    }

    if (legend.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Условные обозначения:", bold: true, size: 22, underline: {} })],
          spacing: { before: 200, after: 100 },
        }),
        new Table({
          width: { size: 50, type: WidthType.PERCENTAGE },
          rows: legend.map(l => new TableRow({
            children: [
              new TableCell({ borders: noBorder, width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: l.symbol, size: 20 })] })] }),
              new TableCell({ borders: noBorder, width: { size: 80, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: l.description, size: 20 })] })] }),
            ],
          })),
        }),
        new Paragraph({ spacing: { after: 400 } }),
      )
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorder,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: `Руководитель горноспасательных работ:  ${form.headRescue}`, size: 20 })] })],
              }),
              new TableCell({
                borders: noBorder,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: `Помощник командира отряда  ${form.assistantCommander}  /${form.commanderName}/`, size: 20 })] })],
              }),
            ],
          }),
        ],
      }),
    )

    const doc = new Document({ sections: [{ children }] })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `Схема_аварийного_участка_поз${form.position}.docx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background custom-cursor-active">
      <CustomCursor />
      <GrainOverlay />

      {/* Навигация */}
      <nav className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-foreground/10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={18} />
          <span className="font-sans text-sm">Назад</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-sans text-sm font-semibold text-foreground">Схема аварийного участка</span>
          <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">Рудник / Шахта</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-colors"
          >
            <Icon name="FileSpreadsheet" size={15} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={exportToWord}
            className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 transition-colors"
          >
            <Icon name="FileText" size={15} />
            <span className="hidden sm:inline">Word</span>
          </button>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-10 md:px-8 lg:px-12">
        {/* Вкладки */}
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-1 border-b border-foreground/10 mb-6 mt-2">
            {(["form", "preview"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-sans transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-foreground/50 hover:text-foreground/80"
                }`}
              >
                {tab === "form" ? "Ввод данных" : "Предпросмотр"}
              </button>
            ))}
          </div>

          {/* ФОРМА */}
          {activeTab === "form" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Левая колонка */}
              <div className="flex flex-col gap-5">

                {/* Заголовок */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Заголовок документа</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Позиция №" value={form.position} onChange={set("position")} placeholder="28" />
                    <Field label="Дата" value={form.date} onChange={set("date")} placeholder="01.01.2026" />
                    <Field label="Время" value={form.time} onChange={set("time")} placeholder="7:15" />
                    <Field label="Часовой пояс" value={form.timezone} onChange={set("timezone")} placeholder="мск" />
                  </div>
                </div>

                {/* Основные данные */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Основные сведения</p>
                  <div className="flex flex-col gap-3">
                    <Field label="Наименование объекта" value={form.objectName} onChange={set("objectName")} placeholder="Рудник (месторождение)..." wide />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-foreground/50 font-mono uppercase tracking-wider">Вид аварии</label>
                      <select
                        value={form.accidentType}
                        onChange={e => set("accidentType")(e.target.value)}
                        className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      >
                        {ACCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Дата аварии" value={form.accidentDate} onChange={set("accidentDate")} />
                      <Field label="Время аварии" value={form.accidentTime} onChange={set("accidentTime")} />
                    </div>
                    <Field label="Место аварии" value={form.accidentLocation} onChange={set("accidentLocation")} placeholder="насосная гор. +210м." />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Кол-во воздуха, м³/с" value={form.airVolume} onChange={set("airVolume")} placeholder="4,79" />
                      <Field label="Сечение выработки, м²" value={form.sectionArea} onChange={set("sectionArea")} placeholder="10,0" />
                    </div>
                    <Field label="Телефон КП" value={form.phoneCP} onChange={set("phoneCP")} placeholder="2-100" />
                  </div>
                </div>

                {/* Подписи */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Подписи</p>
                  <div className="flex flex-col gap-3">
                    <Field label="Руководитель горноспасательных работ" value={form.headRescue} onChange={set("headRescue")} placeholder="Фамилия И.О." />
                    <Field label="Помощник командира отряда" value={form.assistantCommander} onChange={set("assistantCommander")} placeholder="Фамилия И.О." />
                    <Field label="Командир (в скобках)" value={form.commanderName} onChange={set("commanderName")} placeholder="И.И. Иванов" />
                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="flex flex-col gap-5">

                {/* Газы */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Состав рудничной атмосферы</p>
                  <div className="flex flex-col gap-2.5">
                    <GasField label="CO" value={form.co} onChange={set("co")} />
                    <GasField label="CO₂" value={form.co2} onChange={set("co2")} />
                    <GasField label="SO₂" value={form.so2} onChange={set("so2")} />
                    <GasField label="O₂" value={form.o2} onChange={set("o2")} />
                    <GasField label="CH₄" value={form.ch4} onChange={set("ch4")} />
                    <GasField label="NO-NO₂" value={form.nono2} onChange={set("nono2")} />
                    <GasField label="t°" value={form.temperature} onChange={set("temperature")} />
                    <div className="flex flex-col gap-1 mt-1">
                      <label className="text-xs text-foreground/50 font-mono uppercase tracking-wider">Степень задымлённости</label>
                      <input
                        value={form.smokeLevel}
                        onChange={e => set("smokeLevel")(e.target.value)}
                        placeholder="средняя от 5 до 10м"
                        className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Картинка участка */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Схема (картинка) участка</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer rounded-lg border-2 border-dashed border-foreground/20 hover:border-primary/50 transition-colors overflow-hidden"
                    style={{ minHeight: 160 }}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Схема участка" className="w-full h-48 object-contain bg-white/5" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 gap-2 text-foreground/40">
                        <Icon name="ImagePlus" size={32} />
                        <span className="text-sm">Нажмите для загрузки картинки</span>
                        <span className="text-xs">JPG, PNG, GIF</span>
                      </div>
                    )}
                  </div>
                  {imageUrl && (
                    <button
                      onClick={() => { setImageUrl(null); setImageFile(null) }}
                      className="mt-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors flex items-center gap-1"
                    >
                      <Icon name="X" size={12} />
                      Удалить
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* Условные обозначения */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Условные обозначения</p>
                    <button
                      onClick={addLegendItem}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icon name="Plus" size={13} />
                      Добавить
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {legend.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          value={item.symbol}
                          onChange={e => updateLegend(item.id, "symbol", e.target.value)}
                          placeholder="Символ"
                          className="w-20 bg-foreground/5 border border-foreground/15 rounded-lg px-2 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors text-center"
                        />
                        <input
                          value={item.description}
                          onChange={e => updateLegend(item.id, "description", e.target.value)}
                          placeholder="Описание"
                          className="flex-1 bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
                        />
                        <button onClick={() => removeLegend(item.id)} className="text-foreground/30 hover:text-foreground/60 transition-colors shrink-0">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ПРЕДПРОСМОТР */}
          {activeTab === "preview" && (
            <div ref={previewRef} className="bg-white text-black rounded-xl overflow-hidden shadow-2xl" style={{ fontFamily: "Times New Roman, serif" }}>
              {/* Заголовок */}
              <div className="px-8 pt-6 pb-2 text-center border-b border-gray-300">
                <p className="text-base font-bold">
                  Схема аварийного участка — позиция&nbsp;&nbsp;{form.position}
                  &nbsp;&nbsp;&nbsp;&nbsp;{form.date}&nbsp;&nbsp;&nbsp;&nbsp;{form.time}&nbsp;&nbsp;&nbsp;&nbsp;({form.timezone})
                </p>
              </div>

              <div className="px-8 py-4">
                {/* Основные поля */}
                <table className="w-full text-sm mb-2" style={{ borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td className="py-0.5 font-bold pr-4 whitespace-nowrap">Наименование обслуживаемого объекта:</td>
                      <td className="py-0.5">{form.objectName || "—"}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold pr-4">Вид аварии:</td>
                      <td className="py-0.5">{form.accidentType}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold pr-4">Дата и время аварии:</td>
                      <td className="py-0.5">{form.accidentDate}&nbsp;&nbsp;{form.accidentTime}&nbsp;&nbsp;({form.timezone})</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold pr-4">Место аварии:</td>
                      <td className="py-0.5 italic">{form.accidentLocation || "—"}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Средний блок — параметры + газы */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <table style={{ borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td className="py-0.5 font-bold pr-2">Количество воздуха в аварийной выработке:</td>
                        <td className="py-0.5">{form.airVolume} м³/с</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 font-bold pr-2">Сечение аварийной выработки:</td>
                        <td className="py-0.5">{form.sectionArea} м²</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 font-bold pr-2">Телефон КП:</td>
                        <td className="py-0.5">{form.phoneCP || "—"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div>
                    <p className="font-bold underline mb-1">Состав рудничной атмосферы:</p>
                    <div className="grid grid-cols-2 gap-x-4 text-xs">
                      {[
                        ["CO", form.co], ["CO₂", form.co2],
                        ["SO₂", form.so2], ["O₂", form.o2],
                        ["CH₄", form.ch4], ["NO-NO₂", form.nono2],
                        ["t°", form.temperature], ["SO₂", form.so2_2],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <span key={label + value} className="py-0.5">
                          <b>{label}</b>- {value}
                        </span>
                      ))}
                    </div>
                    {form.smokeLevel && (
                      <p className="text-xs mt-1"><b>Степень задымлённости</b> — {form.smokeLevel}</p>
                    )}
                  </div>
                </div>

                {/* Картинка + легенда */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 border border-gray-400 rounded overflow-hidden bg-gray-50" style={{ minHeight: 200 }}>
                    {imageUrl ? (
                      <img src={imageUrl} alt="Схема участка" className="w-full object-contain" style={{ maxHeight: 320 }} />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        Схема участка не загружена
                      </div>
                    )}
                  </div>
                  {legend.length > 0 && (
                    <div className="w-44 shrink-0">
                      <p className="font-bold underline text-sm mb-2">Условные обозначения:</p>
                      <div className="flex flex-col gap-1.5">
                        {legend.map(item => (
                          <div key={item.id} className="flex items-start gap-2 text-xs">
                            <span className="border border-gray-400 rounded px-1 py-0.5 font-bold shrink-0 min-w-[28px] text-center">{item.symbol}</span>
                            <span>{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Подписи */}
                <div className="border-t border-gray-300 pt-3 flex justify-between text-sm">
                  <span>Руководитель горноспасательных работ:&nbsp;&nbsp;<span className="border-b border-gray-400 inline-block min-w-[120px]">{form.headRescue}</span></span>
                  <span>Помощник командира отряда&nbsp;&nbsp;<span className="border-b border-gray-400 inline-block min-w-[100px]">{form.assistantCommander}</span>&nbsp;&nbsp;/{form.commanderName}/</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
