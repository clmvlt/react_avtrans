import { useState } from 'react'
import { readFileAsBase64 } from '../lib/readFileAsBase64'

/**
 * Fichier APK choisi dans le dialog de création et son contenu en base64 (tout le fichier est
 * gardé en mémoire, comme dans le Vue).
 */
export function useApkFileReader() {
  const [file, setFile] = useState<File | null>(null)
  const [base64, setBase64] = useState('')
  const [progress, setProgress] = useState(0)
  const [isReading, setIsReading] = useState(false)

  /** Retient le fichier puis le lit ; `false` si la lecture échoue (le fichier est alors retiré). */
  const read = async (next: File): Promise<boolean> => {
    setFile(next)
    setBase64('')
    setIsReading(true)
    setProgress(0)
    try {
      setBase64(await readFileAsBase64(next, setProgress))
      return true
    } catch {
      setFile(null)
      setBase64('')
      return false
    } finally {
      setIsReading(false)
    }
  }

  const clear = () => {
    setFile(null)
    setBase64('')
    setProgress(0)
  }

  return { file, base64, progress, isReading, read, clear }
}
