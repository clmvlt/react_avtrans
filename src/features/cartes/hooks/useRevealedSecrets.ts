import { useState } from 'react'

const toggleIn = (set: ReadonlySet<string>, uuid: string) => {
  const next = new Set(set)
  if (next.has(uuid)) next.delete(uuid)
  else next.add(uuid)
  return next
}

/**
 * Numéros et codes PIN révélés (œil), par uuid de carte. L'affichage du numéro passe ensuite par
 * `maskCardNumber`, qui reproduit la recherche par numéro du Vue (B-30).
 */
export function useRevealedSecrets() {
  const [revealedNumeros, setRevealedNumeros] = useState<ReadonlySet<string>>(() => new Set())
  const [revealedCodes, setRevealedCodes] = useState<ReadonlySet<string>>(() => new Set())

  return {
    revealedNumeros,
    revealedCodes,
    isNumeroRevealed: (uuid?: string) => revealedNumeros.has(uuid ?? ''),
    isCodeRevealed: (uuid?: string) => revealedCodes.has(uuid ?? ''),
    toggleNumero: (uuid?: string) => {
      if (uuid) setRevealedNumeros((current) => toggleIn(current, uuid))
    },
    toggleCode: (uuid?: string) => {
      if (uuid) setRevealedCodes((current) => toggleIn(current, uuid))
    },
  }
}

export type RevealedSecrets = ReturnType<typeof useRevealedSecrets>
