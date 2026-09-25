import { downloadUrl } from '@/lib/downloadBlob'

export type PlanningExportFormat = 'pdf' | 'png'

type ExportPlanningFileInput = {
  /** HTML construit par `buildExportHtml`. */
  html: string
  /** « 1 septembre 2026 — 30 septembre 2026 » (en-tête des pages du PDF). */
  periodLabel: string
  startDate: string
  endDate: string
}

/**
 * Capture le planning « imprimable » (html2canvas-pro) puis le télécharge en PNG ou en PDF A4
 * paysage découpé en pages (jspdf), comme exportPlanning de Planning.vue. Les deux bibliothèques
 * sont importées à la demande. Le conteneur hors écran est retiré même en cas d'échec.
 */
export async function exportPlanningFile(
  format: PlanningExportFormat,
  { html, periodLabel, startDate, endDate }: ExportPlanningFileInput,
): Promise<void> {
  const fileName = `planning-absences_${startDate}_${endDate}.${format}`

  // Élément hors écran optimisé pour l'impression (HTML construit à la main, voir B-02)
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;'
  container.innerHTML = html
  document.body.appendChild(container)

  let canvas: HTMLCanvasElement
  try {
    const html2canvas = (await import('html2canvas-pro')).default
    canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    })
  } finally {
    container.remove()
  }

  if (format === 'png') {
    downloadUrl(canvas.toDataURL('image/png'), fileName)
    return
  }

  // PDF : A4 paysage avec pagination
  const { jsPDF } = await import('jspdf')
  const A4_W = 297
  const A4_H = 210
  const MARGIN = 8
  const HEADER_H = 14
  const usableW = A4_W - MARGIN * 2
  const usableH = A4_H - MARGIN * 2 - HEADER_H

  const ratio = usableW / canvas.width
  const scaledH = canvas.height * ratio

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const drawPageHeader = (pageNum: number, totalPages: number) => {
    pdf.setFontSize(11)
    pdf.setTextColor(30, 30, 30)
    pdf.text(`Planning des absences — ${periodLabel}`, MARGIN, MARGIN + 5)
    pdf.setFontSize(8)
    pdf.setTextColor(120, 120, 120)
    pdf.text(`Page ${pageNum}/${totalPages}`, A4_W - MARGIN, MARGIN + 5, { align: 'right' })
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, A4_W - MARGIN, MARGIN + 9, {
      align: 'right',
    })
  }

  if (scaledH <= usableH) {
    drawPageHeader(1, 1)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGIN, MARGIN + HEADER_H, usableW, scaledH)
  } else {
    // Tranches de la hauteur d'une page (les lignes peuvent être coupées, comme le Vue)
    const totalPages = Math.ceil(scaledH / usableH)
    const sliceHeightPx = usableH / ratio

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()
      drawPageHeader(page + 1, totalPages)

      const srcY = page * sliceHeightPx
      const srcH = Math.min(sliceHeightPx, canvas.height - srcY)
      const destH = srcH * ratio

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = srcH
      const ctx = sliceCanvas.getContext('2d')!
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)

      pdf.addImage(
        sliceCanvas.toDataURL('image/png'),
        'PNG',
        MARGIN,
        MARGIN + HEADER_H,
        usableW,
        destH,
      )
    }
  }

  pdf.save(fileName)
}
