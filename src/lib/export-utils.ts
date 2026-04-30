import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ImageRun } from "docx"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"

export interface ExportRow {
  label: string
  value: string
  unit: string
}

export interface ExportData {
  title: string
  formula: string
  inputs: ExportRow[]
  results: ExportRow[]
  date?: string
  svgElement?: SVGSVGElement | null
}

function formatDate() {
  return new Date().toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })
}

async function svgToDataUrl(svg: SVGSVGElement, width = 800, height = 800): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute("width", String(width))
  clone.setAttribute("height", String(height))

  // Белый фон для экспорта
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bg.setAttribute("width", "100%")
  bg.setAttribute("height", "100%")
  bg.setAttribute("fill", "#ffffff")
  clone.insertBefore(bg, clone.firstChild)

  // Перекрашиваем светлые цвета в тёмные для белого фона
  const allElements = clone.querySelectorAll("*")
  allElements.forEach((el) => {
    const fill = el.getAttribute("fill") || ""
    const stroke = el.getAttribute("stroke") || ""
    const textFill = el.getAttribute("fill") || ""

    if (fill.includes("rgba(255,255,255") || fill === "rgba(255,255,255,0.04)") {
      el.setAttribute("fill", "rgba(0,0,0,0.04)")
    }
    if (fill.includes("rgba(255,255,255,0.8)") || textFill.includes("rgba(255,255,255,0.8)")) {
      el.setAttribute("fill", "#111111")
    }
    if (stroke.includes("rgba(255,255,255,0.15)")) {
      el.setAttribute("stroke", "rgba(0,0,0,0.3)")
    }
    if (stroke.includes("rgba(255,255,255,0.06)") || fill.includes("rgba(255,255,255,0.06)")) {
      el.setAttribute("stroke", "rgba(0,0,0,0.1)")
      el.setAttribute("fill", "rgba(0,0,0,0.1)")
    }
    // Текст currentColor → чёрный
    if (fill === "currentColor" || fill === "") {
      el.setAttribute("fill", "#111111")
    }
    if (stroke === "currentColor") {
      el.setAttribute("stroke", "#111111")
    }
  })

  const svgStr = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG render failed")) }
    img.src = url
  })
}

export async function exportToPdf(data: ExportData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageW = 210
  const margin = 20
  const contentW = pageW - margin * 2
  const y = margin

  // Шрифт через встроенный (латиница), для кириллицы используем base64 или рисуем через canvas
  // jsPDF не поддерживает кириллицу без встроенного шрифта — выгружаем через canvas
  // Создаём offscreen canvas для всей страницы
  const canvas = document.createElement("canvas")
  canvas.width = 794  // A4 at 96dpi
  canvas.height = 1123
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const ml = 56, mr = 56
  const cw = canvas.width - ml - mr
  let cy = 48

  // Заголовок
  ctx.fillStyle = "#111111"
  ctx.font = "bold 22px Arial, sans-serif"
  const titleLines = wrapText(ctx, data.title, cw, "bold 22px Arial, sans-serif")
  for (const line of titleLines) {
    ctx.fillText(line, ml, cy)
    cy += 30
  }

  // Дата
  cy += 4
  ctx.fillStyle = "#888888"
  ctx.font = "13px Arial, sans-serif"
  ctx.fillText(`Дата расчёта: ${data.date ?? formatDate()}`, ml, cy)
  cy += 28

  // Графика SVG
  if (data.svgElement) {
    try {
      const imgData = await svgToDataUrl(data.svgElement, 500, 500)
      const imgSize = Math.min(cw, 360)
      const imgX = ml + (cw - imgSize) / 2
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => { ctx.drawImage(img, imgX, cy, imgSize, imgSize); resolve() }
        img.src = imgData
      })
      cy += imgSize + 20
    } catch {
      // пропускаем если ошибка
    }
  }

  // Разделитель
  ctx.strokeStyle = "#dddddd"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(ml, cy)
  ctx.lineTo(ml + cw, cy)
  ctx.stroke()
  cy += 20

  // Формула
  ctx.fillStyle = "#333333"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("Формула", ml, cy)
  cy += 20
  ctx.fillStyle = "#444444"
  ctx.font = "13px Courier New, monospace"
  const formulaLines = wrapText(ctx, data.formula, cw, "13px Courier New, monospace")
  for (const line of formulaLines) {
    ctx.fillText(line, ml, cy)
    cy += 18
  }
  cy += 16

  // Исходные данные
  ctx.fillStyle = "#333333"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("Исходные данные", ml, cy)
  cy += 20

  for (const row of data.inputs) {
    ctx.fillStyle = "#555555"
    ctx.font = "13px Arial, sans-serif"
    ctx.fillText(row.label, ml, cy)
    const valStr = row.value + (row.unit ? " " + row.unit : "")
    ctx.fillStyle = "#111111"
    ctx.font = "bold 13px Arial, sans-serif"
    const vw = ctx.measureText(valStr).width
    ctx.fillText(valStr, ml + cw - vw, cy)
    cy += 22
  }
  cy += 10

  // Результат
  ctx.fillStyle = "#333333"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("Результат", ml, cy)
  cy += 20

  for (const row of data.results) {
    ctx.fillStyle = "#555555"
    ctx.font = "13px Arial, sans-serif"
    const labelLines = wrapText(ctx, row.label, cw * 0.55, "13px Arial, sans-serif")
    for (const line of labelLines) {
      ctx.fillText(line, ml, cy)
      cy += 20
    }
    const valStr = row.value + (row.unit ? " " + row.unit : "")
    ctx.fillStyle = "#111111"
    ctx.font = "bold 13px Arial, sans-serif"
    const vw = ctx.measureText(valStr).width
    cy -= 20
    ctx.fillText(valStr, ml + cw - vw, cy)
    cy += 24
  }

  // Экспортируем canvas в PDF
  const imgDataFull = canvas.toDataURL("image/png", 1.0)
  doc.addImage(imgDataFull, "PNG", 0, 0, 210, 297)
  doc.save(`${data.title}.pdf`)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const test = current ? current + " " + word : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function exportToWord(data: ExportData) {
  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  }

  const makeRow = (label: string, value: string, unit: string) =>
    new TableRow({
      children: [
        new TableCell({
          borders: noBorder,
          width: { size: 55, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: label, size: 22 })] })],
        }),
        new TableCell({
          borders: noBorder,
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: value, size: 22, bold: true })] })],
        }),
        new TableCell({
          borders: noBorder,
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: unit, size: 22, color: "888888" })] })],
        }),
      ],
    })

  const children: (Paragraph | Table | ImageRun)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: data.title, bold: true, size: 32 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Дата расчёта: ${data.date ?? formatDate()}`, size: 20, color: "888888" })],
      spacing: { after: 300 },
    }),
  ]

  // Вставляем изображение треугольника если есть
  if (data.svgElement) {
    try {
      const dataUrl = await svgToDataUrl(data.svgElement, 600, 600)
      const base64 = dataUrl.split(",")[1]
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Диаграмма", bold: true, size: 24 })],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: bytes,
              transformation: { width: 400, height: 400 },
              type: "png",
            }),
          ],
          spacing: { after: 300 },
        })
      )
    } catch {
      // пропускаем если ошибка
    }
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: "Формула", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.formula, size: 22, font: "Courier New" })],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Исходные данные", bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: data.inputs.map((r) => makeRow(r.label, r.value, r.unit)),
    }),
    new Paragraph({
      children: [new TextRun({ text: "Результат", bold: true, size: 24 })],
      spacing: { before: 400, after: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: data.results.map((r) => makeRow(r.label, r.value, r.unit)),
    })
  )

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${data.title}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
}

export function exportToExcel(data: ExportData) {
  const rows: (string | number)[][] = [
    [data.title],
    [`Дата расчёта: ${data.date ?? formatDate()}`],
    [],
    ["Формула", data.formula],
    [],
    ["Исходные данные", "", ""],
    ["Параметр", "Значение", "Ед. изм."],
    ...data.inputs.map((r) => [r.label, r.value, r.unit]),
    [],
    ["Результат", "", ""],
    ["Параметр", "Значение", "Ед. изм."],
    ...data.results.map((r) => [r.label, r.value, r.unit]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws["!cols"] = [{ wch: 45 }, { wch: 18 }, { wch: 12 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Расчёт")
  XLSX.writeFile(wb, `${data.title}.xlsx`)
}

function downloadBlob(blob: Blob, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([blob], { type }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}