import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import Icon from "@/components/ui/icon"
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, PageOrientation, convertMillimetersToTwip } from "docx"
import * as XLSX from "xlsx"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const ACCIDENT_TYPES = ["Пожар", "Взрыв", "Загазованность", "Обрушение", "Затопление", "Прочее"]
const STORAGE_KEY = "emergency_schemes_v1"

interface LegendItem {
  id: string
  symbol: string
  description: string
  imageUrl?: string
}

interface MarkerPosition {
  legendId: string
  x: number
  y: number
}

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

interface SavedScheme {
  id: string
  createdAt: string
  updatedAt: string
  form: FormData
  legend: LegendItem[]
  imageDataUrl: string | null
  markers?: MarkerPosition[]
}

const LEGEND_IMAGES: { url: string; description: string; symbol: string }[] = [
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/9db6e135-1e27-4383-8295-3630be8e7681.png", description: "Пожар", symbol: "🔥" },
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/c672fa41-8b71-441b-8a32-bd7fbb233da3.png", description: "Взрыв", symbol: "💥" },
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/7e41e0cd-276a-4e08-a7d3-ed00f9b927e8.png", description: "Газовыделение", symbol: "☁" },
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/830959e7-402a-42a0-8b56-df79e9290b9a.png", description: "Самоходное оборудование", symbol: "🚗" },
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/df8bef2b-8856-4f67-879f-9b97ccd8b935.png", description: "Местонахождение пострадавшего (смертельно)", symbol: "✕" },
  { url: "https://cdn.poehali.dev/projects/9e0b7c43-fecb-4248-943e-e190c3206477/bucket/c3ca59d8-d4d4-48be-9a62-58e35f43e826.png", description: "Местонахождение пострадавшего (травм.)", symbol: "○" },
]

const DEFAULT_LEGEND: LegendItem[] = [
  { id: "1", symbol: "🏭", description: "Надшахтное здание" },
  { id: "2", symbol: "🔥", description: "Пожар", imageUrl: LEGEND_IMAGES[0].url },
  { id: "3", symbol: "ВГК", description: "Стационарный пункт ВГК" },
  { id: "4", symbol: "→", description: "Отделение в движении" },
]

function makeDefaultForm(): FormData {
  return {
    position: "",
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
}

function loadSchemes(): SavedScheme[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function saveSchemes(schemes: SavedScheme[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes))
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Field({ label, value, onChange, placeholder = "", wide = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs text-foreground/50 font-mono uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors" />
    </div>
  )
}

function GasField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono text-foreground/70 w-20 shrink-0">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="0,00%"
        className="w-full bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors" />
    </div>
  )
}

export default function EmergencyScheme() {
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState<SavedScheme[]>(loadSchemes)
  const [activeId, setActiveId] = useState<string | null>(() => loadSchemes()[0]?.id ?? null)
  const [form, setForm] = useState<FormData>(() => loadSchemes()[0]?.form ?? makeDefaultForm())
  const [legend, setLegend] = useState<LegendItem[]>(() => loadSchemes()[0]?.legend ?? DEFAULT_LEGEND)
  const [imageUrl, setImageUrl] = useState<string | null>(() => loadSchemes()[0]?.imageDataUrl ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [markers, setMarkers] = useState<MarkerPosition[]>(() => loadSchemes()[0]?.markers ?? [])
  const [draggingMarker, setDraggingMarker] = useState<{ legendId: string; offsetX: number; offsetY: number } | null>(null)
  const [placingLegendId, setPlacingLegendId] = useState<string | null>(null)
  const [editingMarkers, setEditingMarkers] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = (field: keyof FormData) => (v: string) => setForm(f => ({ ...f, [field]: v }))

  // Автосохранение при изменении формы
  useEffect(() => {
    if (!activeId) return
    const updated = schemes.map(s =>
      s.id === activeId
        ? { ...s, form, legend, imageDataUrl: imageUrl, markers, updatedAt: new Date().toISOString() }
        : s
    )
    setSchemes(updated)
    saveSchemes(updated)
  }, [form, legend, imageUrl, markers])

  const createNew = () => {
    const id = Date.now().toString()
    const now = new Date().toISOString()
    const newScheme: SavedScheme = {
      id,
      createdAt: now,
      updatedAt: now,
      form: makeDefaultForm(),
      legend: DEFAULT_LEGEND,
      imageDataUrl: null,
    }
    const updated = [newScheme, ...schemes]
    setSchemes(updated)
    saveSchemes(updated)
    switchTo(newScheme)
  }

  const switchTo = (scheme: SavedScheme) => {
    setActiveId(scheme.id)
    setForm(scheme.form)
    setLegend(scheme.legend)
    setImageUrl(scheme.imageDataUrl)
    setMarkers(scheme.markers ?? [])
    setImageFile(null)
    setActiveTab("form")
  }

  const duplicateScheme = (s: SavedScheme) => {
    const id = Date.now().toString()
    const now = new Date().toISOString()
    const newPos = s.form.position ? String(Number(s.form.position) + 1 || s.form.position + "_копия") : ""
    const duplicate: SavedScheme = {
      id,
      createdAt: now,
      updatedAt: now,
      form: {
        ...s.form,
        position: newPos,
        date: new Date().toLocaleDateString("ru-RU"),
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        accidentDate: new Date().toLocaleDateString("ru-RU"),
        accidentTime: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      },
      legend: s.legend,
      imageDataUrl: s.imageDataUrl,
    }
    const updated = [duplicate, ...schemes]
    setSchemes(updated)
    saveSchemes(updated)
    switchTo(duplicate)
  }

  const deleteScheme = (id: string) => {
    const updated = schemes.filter(s => s.id !== id)
    setSchemes(updated)
    saveSchemes(updated)
    setDeleteConfirm(null)
    if (activeId === id) {
      if (updated.length > 0) {
        switchTo(updated[0])
      } else {
        setActiveId(null)
        setForm(makeDefaultForm())
        setLegend(DEFAULT_LEGEND)
        setImageUrl(null)
        setMarkers([])
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const dataUrl = await fileToDataUrl(file)
    setImageUrl(dataUrl)
  }

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    const el = imageContainerRef.current
    if (!el) return { x: 50, y: 50 }
    const rect = el.getBoundingClientRect()
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    }
  }, [])

  const handleImageAreaClick = useCallback((e: React.MouseEvent) => {
    if (!placingLegendId) return
    const pos = getRelativePos(e.clientX, e.clientY)
    setMarkers(m => {
      const without = m.filter(mk => mk.legendId !== placingLegendId)
      return [...without, { legendId: placingLegendId, x: pos.x, y: pos.y }]
    })
    setPlacingLegendId(null)
  }, [placingLegendId, getRelativePos])

  const handleMarkerMouseDown = useCallback((e: React.MouseEvent, legendId: string) => {
    e.stopPropagation()
    const el = imageContainerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const marker = markers.find(m => m.legendId === legendId)
    if (!marker) return
    const markerPxX = (marker.x / 100) * rect.width + rect.left
    const markerPxY = (marker.y / 100) * rect.height + rect.top
    setDraggingMarker({ legendId, offsetX: e.clientX - markerPxX, offsetY: e.clientY - markerPxY })
  }, [markers])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingMarker) return
    const pos = getRelativePos(e.clientX - draggingMarker.offsetX, e.clientY - draggingMarker.offsetY)
    setMarkers(m => m.map(mk => mk.legendId === draggingMarker.legendId ? { ...mk, x: pos.x, y: pos.y } : mk))
  }, [draggingMarker, getRelativePos])

  const handleMouseUp = useCallback(() => {
    setDraggingMarker(null)
  }, [])

  const removeMarker = (legendId: string) => setMarkers(m => m.filter(mk => mk.legendId !== legendId))

  const addLegendItem = () => setLegend(l => [...l, { id: Date.now().toString(), symbol: "", description: "" }])
  const updateLegend = (id: string, field: "symbol" | "description" | "imageUrl", value: string) =>
    setLegend(l => l.map(item => item.id === id ? { ...item, [field]: value } : item))
  const removeLegend = (id: string) => setLegend(l => l.filter(item => item.id !== id))

  const exportToPdf = async () => {
    const el = previewRef.current
    if (!el) return
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#ffffff", width: el.scrollWidth, height: el.scrollHeight })
    const imgData = canvas.toDataURL("image/png")

    // A4 landscape в мм: 297 x 210
    // Поля: левое 30мм, верхнее 20мм, правое 10мм, нижнее 20мм
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const marginLeft = 30
    const marginTop = 20
    const marginRight = 10
    const marginBottom = 20
    const pageW = 297
    const pageH = 210
    const printW = pageW - marginLeft - marginRight  // 257мм
    const printH = pageH - marginTop - marginBottom  // 170мм

    const ratio = canvas.width / canvas.height
    let w = printW
    let h = w / ratio
    if (h > printH) { h = printH; w = h * ratio }

    const x = marginLeft + (printW - w) / 2
    const y = marginTop + (printH - h) / 2

    // Рамка ГОСТ по полям
    pdf.setDrawColor(0)
    pdf.setLineWidth(0.5)
    pdf.rect(marginLeft, marginTop, printW, printH)
    // Двойная линия слева (штамп)
    pdf.setLineWidth(1.0)
    pdf.line(marginLeft, marginTop, marginLeft, marginTop + printH)

    pdf.addImage(imgData, "PNG", x, y, w, h)
    pdf.save(`Схема_аварийного_участка_поз${form.position || "—"}.pdf`)
  }

  const renderImageWithMarkers = (): Promise<ArrayBuffer | null> => {
    return new Promise(resolve => {
      if (!imageUrl || markers.length === 0) { resolve(null); return }
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0)
        markers.forEach(mk => {
          const item = legend.find(l => l.id === mk.legendId)
          if (!item) return
          const px = (mk.x / 100) * canvas.width
          const py = (mk.y / 100) * canvas.height
          const text = item.symbol
          ctx.font = `bold ${Math.max(14, canvas.width / 40)}px Arial`
          const metrics = ctx.measureText(text)
          const pad = 6
          const bw = metrics.width + pad * 2
          const bh = Math.max(14, canvas.width / 40) + pad * 2
          const bx = px - bw / 2
          const by = py - bh / 2
          ctx.fillStyle = "rgba(255,255,255,0.92)"
          ctx.strokeStyle = "#222"
          ctx.lineWidth = Math.max(1, canvas.width / 400)
          ctx.beginPath()
          ctx.roundRect(bx, by, bw, bh, 4)
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = "#111"
          ctx.textBaseline = "middle"
          ctx.textAlign = "center"
          ctx.fillText(text, px, py)
        })
        canvas.toBlob(blob => {
          if (!blob) { resolve(null); return }
          blob.arrayBuffer().then(resolve)
        }, "image/png")
      }
      img.onerror = () => resolve(null)
      img.src = imageUrl
    })
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
      ["CO", form.co], ["CO2", form.co2], ["SO2", form.so2], ["O2", form.o2],
      ["CH4", form.ch4], ["NO-NO2", form.nono2], ["t°", form.temperature],
      ["Степень задымлённости", form.smokeLevel],
      [],
      ["УСЛОВНЫЕ ОБОЗНАЧЕНИЯ"],
      ...legend.map(l => {
        const mk = markers.find(m => m.legendId === l.id)
        return mk
          ? [l.symbol, l.description, `на схеме (${mk.x.toFixed(0)}%, ${mk.y.toFixed(0)}%)`]
          : [l.symbol, l.description]
      }),
      [],
      ["Руководитель горноспасательных работ:", form.headRescue],
      ["Помощник командира отряда:", form.assistantCommander],
      ["", form.commanderName],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws["!cols"] = [{ wch: 40 }, { wch: 35 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Схема аварийного участка")
    XLSX.writeFile(wb, `Схема_аварийного_участка_поз${form.position || "—"}.xlsx`)
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
      new TableRow({ children: [
        new TableCell({ borders: noBorder, width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })] }),
        new TableCell({ borders: noBorder, width: { size: 55, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })] }),
      ]})
    const gasRow = (label: string, value: string) =>
      new TableRow({ children: [
        new TableCell({ borders: thinBorder, width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label, size: 18, bold: true })] })] }),
        new TableCell({ borders: thinBorder, width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: value || "—", size: 18 })] })] }),
      ]})

    const children: (Paragraph | Table)[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Схема аварийного участка — позиция  ${form.position}     ${form.date}     ${form.time}  (${form.timezone})`, bold: true, size: 26 })],
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
      new Paragraph({ children: [new TextRun({ text: "Состав рудничной атмосферы:", bold: true, size: 22, underline: {} })], spacing: { before: 200, after: 100 } }),
      new Table({
        width: { size: 60, type: WidthType.PERCENTAGE },
        rows: [
          gasRow("CO", form.co), gasRow("CO2", form.co2), gasRow("SO2", form.so2),
          gasRow("O2", form.o2), gasRow("CH4", form.ch4), gasRow("NO-NO2", form.nono2),
          gasRow("t°", form.temperature), gasRow("Задымлённость", form.smokeLevel),
        ],
      }),
      new Paragraph({ spacing: { after: 300 } }),
    ]

    if (imageUrl) {
      let arrayBuffer: ArrayBuffer
      const compositeBuffer = await renderImageWithMarkers()
      if (compositeBuffer) {
        arrayBuffer = compositeBuffer
      } else if (imageFile) {
        arrayBuffer = await imageFile.arrayBuffer()
      } else {
        const res = await fetch(imageUrl)
        arrayBuffer = await res.arrayBuffer()
      }
      const isJpg = !compositeBuffer && (imageUrl.includes("jpeg") || imageUrl.includes("jpg") || !!imageFile?.type.includes("jpeg"))
      children.push(
        new Paragraph({ children: [new TextRun({ text: "Схема участка:", bold: true, size: 22 })], spacing: { before: 200, after: 100 } }),
        new Paragraph({
          children: [new ImageRun({ data: arrayBuffer, transformation: { width: 600, height: 380 }, type: isJpg ? "jpg" : "png" })],
          spacing: { after: 300 },
        }),
      )
    }

    if (legend.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: "Условные обозначения:", bold: true, size: 22, underline: {} })], spacing: { before: 200, after: 100 } }),
        new Table({
          width: { size: 50, type: WidthType.PERCENTAGE },
          rows: legend.map(l => new TableRow({ children: [
            new TableCell({ borders: noBorder, width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: l.symbol, size: 20 })] })] }),
            new TableCell({ borders: noBorder, width: { size: 80, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: l.description, size: 20 })] })] }),
          ]})),
        }),
        new Paragraph({ spacing: { after: 400 } }),
      )
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorder, width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `Руководитель горноспасательных работ:  ${form.headRescue}`, size: 20 })] })] }),
          new TableCell({ borders: noBorder, width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `Помощник командира отряда  ${form.assistantCommander}  /${form.commanderName}/`, size: 20 })] })] }),
        ]})],
      })
    )

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: convertMillimetersToTwip(297),
              height: convertMillimetersToTwip(210),
            },
            margin: {
              left: convertMillimetersToTwip(30),
              top: convertMillimetersToTwip(20),
              right: convertMillimetersToTwip(10),
              bottom: convertMillimetersToTwip(20),
            },
            borders: {
              pageBorderTop: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 0 },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 0 },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 18, color: "000000", space: 0 },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 0 },
            },
          },
        },
        children,
      }],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `Схема_аварийного_участка_поз${form.position || "—"}.docx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const schemeLabel = (s: SavedScheme) => {
    const pos = s.form.position ? `Поз. ${s.form.position}` : "Без номера"
    const date = s.form.date || new Date(s.createdAt).toLocaleDateString("ru-RU")
    const type = s.form.accidentType || ""
    return { pos, date, type }
  }

  return (
    <div className="min-h-screen bg-background custom-cursor-active">
      <CustomCursor />
      <GrainOverlay />

      {/* Навигация */}
      <nav className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-background/80 backdrop-blur-md border-b border-foreground/10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={18} />
          <span className="font-sans text-sm hidden sm:inline">Назад</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-sans text-sm font-semibold text-foreground">Схема аварийного участка</span>
          <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">Рудник / Шахта</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-1.5 rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-colors">
            <Icon name="FileSpreadsheet" size={15} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={exportToWord} className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 transition-colors">
            <Icon name="FileText" size={15} />
            <span className="hidden sm:inline">Word</span>
          </button>
          <button
            onClick={() => { if (activeTab !== "preview") { setActiveTab("preview"); setTimeout(exportToPdf, 300) } else { exportToPdf() } }}
            className="flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Icon name="FileDown" size={15} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </nav>

      <div className="pt-16 flex h-screen overflow-hidden">

        {/* Боковая панель — история */}
        <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 border-r border-foreground/10 bg-background/60 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">История</span>
            <button
              onClick={createNew}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Icon name="Plus" size={13} />
              Новая
            </button>
          </div>

          {schemes.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-foreground/30 px-4 text-center">
              <Icon name="FileX" size={28} />
              <p className="text-xs">Нет сохранённых схем</p>
              <button onClick={createNew} className="text-xs text-primary hover:text-primary/80 transition-colors mt-1">Создать первую</button>
            </div>
          )}

          <div className="flex flex-col py-1">
            {schemes.map(s => {
              const { pos, date, type } = schemeLabel(s)
              const isActive = s.id === activeId
              return (
                <div key={s.id} className={`group relative flex flex-col gap-0.5 px-4 py-3 cursor-pointer transition-colors border-l-2 ${isActive ? "bg-foreground/8 border-primary" : "border-transparent hover:bg-foreground/5"}`}
                  onClick={() => switchTo(s)}>
                  <span className={`font-sans text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground/70"}`}>{pos}</span>
                  <span className="font-mono text-xs text-foreground/40">{date}</span>
                  {type && <span className="text-xs text-accent/80 truncate">{type}</span>}
                  <div className="absolute right-1 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    <button
                      onClick={e => { e.stopPropagation(); duplicateScheme(s) }}
                      title="Дублировать"
                      className="text-foreground/30 hover:text-primary p-1 rounded transition-colors"
                    >
                      <Icon name="Copy" size={12} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id) }}
                      title="Удалить"
                      className="text-foreground/30 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Основная область */}
        <main className="flex-1 overflow-y-auto">
          {/* Мобильная: кнопка новой + выбор схемы */}
          <div className="flex md:hidden items-center gap-2 px-4 py-2 border-b border-foreground/10 overflow-x-auto">
            <button onClick={createNew} className="flex items-center gap-1 shrink-0 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors">
              <Icon name="Plus" size={12} />
              Новая
            </button>
            {schemes.map(s => {
              const { pos, date } = schemeLabel(s)
              return (
                <button key={s.id} onClick={() => switchTo(s)}
                  className={`shrink-0 text-xs rounded-lg px-3 py-1.5 border transition-colors ${s.id === activeId ? "border-primary bg-primary/10 text-primary" : "border-foreground/15 text-foreground/60 hover:text-foreground"}`}>
                  {pos} · {date}
                </button>
              )
            })}
          </div>

          {activeId === null ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/40">
              <Icon name="FilePlus2" size={48} />
              <p className="text-base">Создайте первую схему</p>
              <button onClick={createNew} className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm text-primary hover:bg-primary/20 transition-colors">
                <Icon name="Plus" size={16} />
                Создать схему
              </button>
            </div>
          ) : (
            <div className="px-4 pb-10 md:px-6 lg:px-8">
              {/* Вкладки */}
              <div className="flex gap-1 border-b border-foreground/10 mb-6 mt-3">
                {(["form", "preview"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-sm font-sans transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-foreground/50 hover:text-foreground/80"}`}>
                    {tab === "form" ? "Ввод данных" : "Предпросмотр"}
                  </button>
                ))}
              </div>

              {/* ФОРМА */}
              {activeTab === "form" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Левая колонка */}
                  <div className="flex flex-col gap-5">
                    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                      <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Заголовок документа</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Позиция №" value={form.position} onChange={set("position")} placeholder="28" />
                        <Field label="Дата" value={form.date} onChange={set("date")} placeholder="01.01.2026" />
                        <Field label="Время" value={form.time} onChange={set("time")} placeholder="7:15" />
                        <Field label="Часовой пояс" value={form.timezone} onChange={set("timezone")} placeholder="мск" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                      <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-4">Основные сведения</p>
                      <div className="flex flex-col gap-3">
                        <Field label="Наименование объекта" value={form.objectName} onChange={set("objectName")} placeholder="Рудник (месторождение)..." wide />
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-foreground/50 font-mono uppercase tracking-wider">Вид аварии</label>
                          <select value={form.accidentType} onChange={e => set("accidentType")(e.target.value)}
                            className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors">
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
                          <input value={form.smokeLevel} onChange={e => set("smokeLevel")(e.target.value)} placeholder="средняя от 5 до 10м"
                            className="bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                      <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest mb-3">Схема (картинка) участка</p>
                      <div onClick={() => fileInputRef.current?.click()}
                        className="relative cursor-pointer rounded-lg border-2 border-dashed border-foreground/20 hover:border-primary/50 transition-colors overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Схема участка" className="w-full h-48 object-contain bg-white/5" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-36 gap-2 text-foreground/40">
                            <Icon name="ImagePlus" size={28} />
                            <span className="text-sm">Нажмите для загрузки</span>
                          </div>
                        )}
                      </div>
                      {imageUrl && (
                        <button onClick={() => { setImageUrl(null); setImageFile(null) }}
                          className="mt-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors flex items-center gap-1">
                          <Icon name="X" size={12} />Удалить
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>

                    <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-xs text-foreground/40 uppercase tracking-widest">Условные обозначения</p>
                        <button onClick={addLegendItem} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                          <Icon name="Plus" size={13} />Добавить
                        </button>
                      </div>
                      {/* Библиотека иконок */}
                      <div className="mb-3">
                        <p className="text-xs text-foreground/40 mb-2">Быстрое добавление из библиотеки:</p>
                        <div className="flex flex-wrap gap-2">
                          {LEGEND_IMAGES.map(img => (
                            <button
                              key={img.url}
                              title={img.description}
                              onClick={() => setLegend(l => [...l, { id: Date.now().toString(), symbol: img.symbol, description: img.description, imageUrl: img.url }])}
                              className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-foreground/15 hover:border-primary/50 bg-foreground/5 hover:bg-primary/5 transition-colors"
                            >
                              <img src={img.url} alt={img.description} className="w-8 h-8 object-contain" />
                              <span className="text-[9px] text-foreground/50 max-w-[52px] text-center leading-tight">{img.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {legend.map(item => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-foreground/15 rounded-lg bg-foreground/5 overflow-hidden">
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt={item.symbol} className="w-8 h-8 object-contain" />
                                : <span className="text-base">{item.symbol || "?"}</span>
                              }
                            </div>
                            <input value={item.description} onChange={e => updateLegend(item.id, "description", e.target.value)} placeholder="Описание"
                              className="flex-1 bg-foreground/5 border border-foreground/15 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 transition-colors" />
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
                <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-foreground/40 font-mono uppercase tracking-wider">Предпросмотр</span>
                  <button
                    onClick={() => { setEditingMarkers(e => !e); setPlacingLegendId(null) }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${editingMarkers ? "border-blue-400/60 bg-blue-500/15 text-blue-400" : "border-foreground/20 bg-foreground/5 text-foreground/60 hover:text-foreground"}`}
                  >
                    <Icon name="MapPin" size={13} />
                    {editingMarkers ? "Готово" : "Разместить маркеры"}
                  </button>
                </div>
                <div ref={previewRef} className="bg-white text-black shadow-2xl" style={{ fontFamily: "Times New Roman, serif", fontSize: 13, padding: "20px 10px 20px 30px" }}>

                  {/* Заголовок */}
                  <p className="text-center font-bold mb-2" style={{ fontSize: 15 }}>
                    Схема аварийного участка - позиция&nbsp;&nbsp;&nbsp;{form.position || "—"}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{form.date}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{form.time}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;({form.timezone})
                  </p>

                  {/* Наименование объекта */}
                  <div className="flex gap-2 mb-1" style={{ fontSize: 13 }}>
                    <span className="font-bold whitespace-nowrap">Наименование обслуживаемого объекта:</span>
                    <span>{form.objectName || "—"}</span>
                  </div>

                  {/* Три колонки: левая + газы + легенда */}
                  <div className="flex gap-0 mb-1" style={{ fontSize: 12 }}>
                    {/* Левая колонка */}
                    <div style={{ width: "34%" }}>
                      <div className="flex gap-1"><span className="font-bold">Вид аварии:</span><span>{form.accidentType}</span></div>
                      <div className="flex gap-1"><span className="font-bold">Дата и время аварии:</span><span>{form.accidentDate}&nbsp;&nbsp;{form.accidentTime}&nbsp;&nbsp;({form.timezone})</span></div>
                      <div className="flex gap-1"><span className="font-bold">Место аварии:</span><span className="italic">{form.accidentLocation || "—"}</span></div>
                      <div className="flex gap-1"><span className="font-bold whitespace-nowrap">Количество воздуха в аварийной выработке:</span><span>{form.airVolume && <>{form.airVolume}&nbsp;м³/с</>}</span></div>
                      <div className="flex gap-1"><span className="font-bold">Сечение аварийной выработки:</span><span>{form.sectionArea && <>{form.sectionArea}&nbsp;м²</>}</span></div>
                      <div className="flex gap-1"><span className="font-bold">Телефон КП:</span><span>{form.phoneCP || "—"}</span></div>
                    </div>

                    {/* Центр: состав атмосферы */}
                    <div style={{ width: "42%" }} className="pl-2">
                      <p className="font-bold underline mb-0.5">Состав рудничной атмосферы:</p>
                      <div className="grid grid-cols-3 gap-x-3" style={{ fontSize: 11 }}>
                        {[["CO", form.co], ["CO2", form.co2], ["SO2", form.so2], ["O2", form.o2], ["CH4", form.ch4], ["NO-NO2", form.nono2], ["t°", form.temperature], ["SO2", form.so2_2]].filter(([, v]) => v).map(([l, v]) => (
                          <span key={l}><b>{l}</b>- {v}</span>
                        ))}
                      </div>
                      {form.smokeLevel && (
                        <p style={{ fontSize: 11 }} className="mt-0.5"><b>Степень задымлённости</b>- {form.smokeLevel}</p>
                      )}
                    </div>

                    {/* Правая колонка: условные обозначения */}
                    {legend.length > 0 && (
                      <div style={{ width: "24%" }} className="pl-2 border-l border-gray-300">
                        <p className="font-bold underline mb-1" style={{ fontSize: 12 }}>Условные обозначения:</p>
                        <div className="flex flex-col gap-1">
                          {legend.map(item => {
                            const placed = markers.some(m => m.legendId === item.id)
                            const isPlacing = placingLegendId === item.id
                            return (
                              <div key={item.id} className="flex items-center gap-1" style={{ fontSize: 11 }}>
                                <span className="shrink-0" style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.symbol} style={{ width: 20, height: 20, objectFit: "contain" }} />
                                    : <span className="border border-gray-500 rounded px-1 font-bold leading-tight">{item.symbol}</span>
                                  }
                                </span>
                                <span className="flex-1 leading-tight">{item.description}</span>
                                {editingMarkers && (
                                  <button
                                    title={placed ? "Убрать" : "Разместить"}
                                    onClick={() => { if (placed) removeMarker(item.id); else setPlacingLegendId(isPlacing ? null : item.id) }}
                                    className={`shrink-0 rounded px-0.5 text-xs transition-colors ${isPlacing ? "text-blue-600 bg-blue-100" : placed ? "text-red-400" : "text-gray-400 hover:text-gray-700"}`}
                                  >{placed ? "✕" : "📍"}</button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {editingMarkers && markers.length > 0 && (
                          <p className="text-gray-400 mt-1" style={{ fontSize: 9 }}>Двойной клик — убрать маркер</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Картинка схемы — на всю ширину */}
                  <div
                    ref={imageContainerRef}
                    className={`relative border border-gray-400 bg-gray-50 select-none overflow-hidden ${editingMarkers && placingLegendId ? "cursor-crosshair" : editingMarkers && draggingMarker ? "cursor-grabbing" : ""}`}
                    style={{ width: "100%", minHeight: 300 }}
                    onClick={editingMarkers ? handleImageAreaClick : undefined}
                    onMouseMove={editingMarkers ? handleMouseMove : undefined}
                    onMouseUp={editingMarkers ? handleMouseUp : undefined}
                    onMouseLeave={editingMarkers ? handleMouseUp : undefined}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Схема" className="block pointer-events-none" style={{ width: "100%", height: "auto" }} />
                    ) : (
                      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: 300 }}>Схема участка не загружена</div>
                    )}
                    {editingMarkers && placingLegendId && (
                      <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none flex items-center justify-center">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">Кликните для размещения</span>
                      </div>
                    )}
                    {markers.map(mk => {
                      const item = legend.find(l => l.id === mk.legendId)
                      if (!item) return null
                      return (
                        <div
                          key={mk.legendId}
                          className={`absolute ${editingMarkers ? "cursor-grab active:cursor-grabbing" : ""}`}
                          style={{ left: `${mk.x}%`, top: `${mk.y}%`, transform: "translate(-50%,-50%)", zIndex: 10 }}
                          onMouseDown={editingMarkers ? e => handleMarkerMouseDown(e, mk.legendId) : undefined}
                          onDoubleClick={editingMarkers ? e => { e.stopPropagation(); removeMarker(mk.legendId) } : undefined}
                        >
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.symbol} className="shadow-md rounded-full" style={{ width: 28, height: 28, objectFit: "contain", background: "white" }} />
                            : <span className="bg-white border-2 border-gray-800 rounded px-1 font-bold shadow-md" style={{ fontSize: 11, lineHeight: 1.3 }}>{item.symbol}</span>
                          }
                        </div>
                      )
                    })}
                  </div>

                  {/* Подписи */}
                  <div className="flex justify-between pt-2" style={{ fontSize: 12 }}>
                    <span className="font-bold">Руководитель горноспасательных работ:&nbsp;<span className="border-b border-gray-500 inline-block" style={{ minWidth: 140 }}>{form.headRescue}</span></span>
                    <span>Помощник командира отряда&nbsp;<span className="border-b border-gray-500 inline-block" style={{ minWidth: 120 }}>{form.assistantCommander}</span>&nbsp;/{form.commanderName}/</span>
                  </div>
                </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Подтверждение удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-foreground/15 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Trash2" size={20} className="text-red-400" />
              <span className="font-sans text-base font-semibold text-foreground">Удалить схему?</span>
            </div>
            <p className="text-sm text-foreground/60 mb-5">Это действие нельзя отменить. Все данные позиции будут удалены.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg border border-foreground/20 px-4 py-2 text-sm text-foreground/70 hover:text-foreground transition-colors">Отмена</button>
              <button onClick={() => deleteScheme(deleteConfirm)} className="flex-1 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}