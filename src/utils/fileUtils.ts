import type { FileData } from '@/types/file'

export const getFileUrl = (file: FileData): string => {
  if (file.fileUrl) return file.fileUrl
  if (file.fileB64 && file.mimeType) {
    if (file.fileB64.startsWith('data:')) return file.fileB64
    return `data:${file.mimeType};base64,${file.fileB64}`
  }
  return ''
}

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 o'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export const isImage = (file: FileData): boolean => {
  return file.mimeType?.startsWith('image/') || false
}

export const isPdf = (file: FileData): boolean => {
  return file.mimeType === 'application/pdf'
}

export const isWord = (file: FileData): boolean => {
  return (
    file.mimeType?.includes('word') ||
    file.originalName?.endsWith('.doc') ||
    file.originalName?.endsWith('.docx') ||
    false
  )
}

export const isExcel = (file: FileData): boolean => {
  return (
    file.mimeType?.includes('excel') ||
    file.mimeType?.includes('spreadsheet') ||
    file.originalName?.endsWith('.xls') ||
    file.originalName?.endsWith('.xlsx') ||
    false
  )
}

export const getFileTypeCategory = (file: FileData): 'image' | 'pdf' | 'word' | 'excel' | 'generic' => {
  if (isImage(file)) return 'image'
  if (isPdf(file)) return 'pdf'
  if (isWord(file)) return 'word'
  if (isExcel(file)) return 'excel'
  return 'generic'
}
