import type { AbsenceTypeDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import { findAbsenceForDate } from './absenceIndex'
import { hexToRgba } from './absenceCellStyle'
import type { PlanningDate } from './planningDates'

/**
 * HTML « imprimable » du planning, rendu hors écran puis capturé par html2canvas-pro
 * (buildExportHtml de Planning.vue, rendu identique).
 *
 * Bug B-02 du Vue (MIGRATION.md 8.2) corrigé : le Vue insérait prénom, nom, noms de types
 * d'absence et `customType` sans échappement dans ce HTML, ensuite affecté à `innerHTML` (XSS en
 * session admin). Le brief interdit l'injection de HTML non assaini : ces valeurs passent par
 * `escapeHtml`, sans effet visible pour des noms ordinaires.
 */

type AbbreviationInfo = { abbr: string; color: string; name: string }

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Échappe une valeur saisie par un utilisateur avant insertion dans le HTML d'export. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

/** Abréviation d'un type d'absence : initiales (≤ 3) ou 3 premières lettres, en majuscules. */
export function generateAbbreviation(name: string): string {
  if (!name) return '?'
  if (name.length <= 3) return name.toUpperCase()
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return words
      .map((w) => w.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3)
  }
  return name.slice(0, 3).toUpperCase()
}

/** Couleur de texte assombrie (−90 par composante) pour les cellules approuvées. */
export function darkenHex(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 90)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 90)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 90)
  return `rgb(${r},${g},${b})`
}

type BuildExportHtmlInput = {
  users: PlanningUserDTO[]
  dates: PlanningDate[]
  absenceTypes: AbsenceTypeDTO[]
  periodLabel: string
}

export function buildExportHtml({
  users,
  dates,
  absenceTypes,
  periodLabel,
}: BuildExportHtmlInput): string {
  // Abréviations uniques par type
  const abbrMap = new Map<string, AbbreviationInfo>()
  const usedAbbrs = new Set<string>()
  for (const type of absenceTypes) {
    if (!type.uuid || !type.name) continue
    let abbr = generateAbbreviation(type.name)
    while (usedAbbrs.has(abbr)) abbr += type.name.charAt(abbr.length) || '+'
    usedAbbrs.add(abbr)
    abbrMap.set(type.uuid, { abbr, color: type.color || '#888888', name: type.name })
  }

  // Bandeau des mois
  const monthSpans: { label: string; colspan: number }[] = []
  let curMonthKey = ''
  for (const date of dates) {
    const d = new Date(date.dateStr)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (key !== curMonthKey) {
      monthSpans.push({ label: label.charAt(0).toUpperCase() + label.slice(1), colspan: 1 })
      curMonthKey = key
    } else {
      monthSpans[monthSpans.length - 1]!.colspan++
    }
  }

  // Dimensions adaptées au nombre de jours
  const nDays = dates.length
  let colW = 32
  let empW = 180
  let fs = 10
  let rowH = 30
  if (nDays > 62) {
    colW = 22
    empW = 150
    fs = 8
    rowH = 24
  } else if (nDays > 31) {
    colW = 26
    empW = 160
    fs = 9
    rowH = 26
  }

  const B = '1px solid #aaa'
  const BB = '2px solid #333'

  let h = `<div style="font-family:Arial,Helvetica,sans-serif;background:#fff;padding:24px 20px;color:#111;">`

  // Titre
  h += `<div style="margin-bottom:14px;">`
  h += `<div style="font-size:16px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;">Planning des absences</div>`
  h += `<div style="font-size:11px;color:#555;margin-top:3px;">${periodLabel} &nbsp;·&nbsp; Généré le ${new Date().toLocaleDateString('fr-FR')}</div>`
  h += `</div>`

  h += `<table style="border-collapse:collapse;font-size:${fs}px;line-height:1.3;">`

  // En-tête des mois
  h += `<tr>`
  h += `<th style="border:${BB};padding:4px;background:#e0e0e0;min-width:${empW}px;width:${empW}px;"></th>`
  for (const span of monthSpans) {
    h += `<th colspan="${span.colspan}" style="border:${BB};padding:3px 2px;background:#e0e0e0;text-align:center;font-size:${fs}px;font-weight:700;">${span.label}</th>`
  }
  h += `</tr>`

  // En-tête des jours
  h += `<tr>`
  h += `<th style="border:${BB};padding:4px 8px;background:#f2f2f2;text-align:left;font-weight:700;">Employé</th>`
  let prevM = -1
  for (const date of dates) {
    const m = new Date(date.dateStr).getMonth()
    const lb = m !== prevM && prevM !== -1 ? BB : B
    prevM = m
    let bg = '#f2f2f2'
    let clr = '#222'
    if (date.isWeekend) {
      bg = '#d9d9d9'
      clr = '#555'
    }
    if (date.isHoliday) {
      bg = '#f5c6cb'
      clr = '#721c24'
    }
    const dl = date.dayName.charAt(0).toUpperCase()
    h += `<th style="border:${B};border-left:${lb};border-top:${BB};padding:2px 0;min-width:${colW}px;width:${colW}px;text-align:center;background:${bg};color:${clr};font-weight:600;">`
    h += `${dl}<br><span style="font-size:${Math.max(fs, 8)}px;">${date.dayNumber}</span>`
    if (date.isHoliday) h += `<br><span style="font-size:5px;color:#721c24;">●</span>`
    h += `</th>`
  }
  h += `</tr>`

  // Lignes des employés (fond alterné pour la lisibilité en noir et blanc)
  users.forEach((user, i) => {
    const rowBg = i % 2 === 0 ? '#fff' : '#f9f9f9'
    h += `<tr>`
    h += `<td style="border:${BB};padding:4px 8px;background:${rowBg};font-weight:600;white-space:nowrap;height:${rowH}px;">`
    h += escapeHtml(`${user.firstName} ${user.lastName}`)
    h += `</td>`

    prevM = -1
    for (const date of dates) {
      const m = new Date(date.dateStr).getMonth()
      const lb = m !== prevM && prevM !== -1 ? BB : B
      prevM = m

      const absence = findAbsenceForDate(user.absences, date.dateStr)
      let bg = rowBg
      let txt = ''
      let clr = '#333'
      let fw = 'normal'
      let bdr = `border:${B};border-left:${lb};`

      if (!absence) {
        if (date.isWeekend) bg = '#ececec'
        if (date.isHoliday) bg = '#fde8e8'
      } else {
        const info = absence.absenceType?.uuid ? abbrMap.get(absence.absenceType.uuid) : null
        // Abréviation issue du nom de type ou de customType : échappée à l'insertion (B-02)
        const abbr =
          info?.abbr || (absence.customType ? generateAbbreviation(absence.customType) : '')
        const color = info?.color || absence.absenceType?.color || '#888888'

        if (absence.status === 'APPROVED') {
          bg = hexToRgba(color, 0.35)
          clr = darkenHex(color)
          txt = abbr
          fw = 'bold'
        } else if (absence.status === 'PENDING') {
          bg = hexToRgba(color, 0.15)
          clr = '#444'
          txt = abbr + '?'
          bdr = `border:1px dashed #999;border-left:${lb};`
        }
        if (absence.period === 'MORNING') txt += '↑'
        else if (absence.period === 'AFTERNOON') txt += '↓'
      }

      h += `<td style="${bdr}padding:1px;text-align:center;background:${bg};color:${clr};font-weight:${fw};font-size:${Math.max(fs - 1, 7)}px;height:${rowH}px;">${escapeHtml(txt)}</td>`
    }
    h += `</tr>`
  })

  h += `</table>`

  // Légende
  h += `<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:12px;font-size:${fs}px;align-items:center;">`
  h += `<span style="font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.5px;font-size:${fs - 1}px;">Légende :</span>`
  for (const [, info] of abbrMap) {
    h += `<span style="display:inline-flex;align-items:center;gap:4px;">`
    h += `<span style="display:inline-block;width:14px;height:14px;background:${hexToRgba(info.color, 0.35)};border:2px solid ${escapeHtml(info.color)};border-radius:2px;"></span>`
    h += `<strong>${escapeHtml(info.abbr)}</strong> = ${escapeHtml(info.name)}`
    h += `</span>`
  }
  h += `</div>`
  h += `<div style="margin-top:6px;font-size:${Math.max(fs - 1, 7)}px;color:#777;">? = En attente · ↑ = Matin · ↓ = Après-midi · ● = Jour férié · Lignes alternées pour lisibilité N&B</div>`
  h += `</div>`

  return h
}
