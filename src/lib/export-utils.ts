import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from "docx"
import * as XLSX from "xlsx"

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
}

function formatDate() {
  return new Date().toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })
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

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: data.title, bold: true, size: 32 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Дата расчёта: ${data.date ?? formatDate()}`, size: 20, color: "888888" })],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Формула", bold: true, size: 24 })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.formula, size: 24, font: "Courier New" })],
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
          }),
        ],
      },
    ],
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
