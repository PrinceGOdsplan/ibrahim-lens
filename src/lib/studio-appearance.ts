import { useCallback, useEffect, useState } from 'react'

export type StudioAppearance = 'light' | 'night'

const KEY = 'studio-appearance'
const DOC_ATTR = 'data-studio-appearance'

export const STUDIO_THEME_LIGHT = '#F7F7F5'
export const STUDIO_THEME_NIGHT = '#100e0b'

export function isStudioAppearance(value: unknown): value is StudioAppearance {
  return value === 'light' || value === 'night'
}

export function readStudioAppearance(): StudioAppearance {
  try {
    const raw = localStorage.getItem(KEY)
    if (isStudioAppearance(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'light'
}

export function writeStudioAppearance(appearance: StudioAppearance) {
  try {
    localStorage.setItem(KEY, appearance)
  } catch {
    /* ignore */
  }
}

export function studioThemeColor(appearance: StudioAppearance) {
  return appearance === 'night' ? STUDIO_THEME_NIGHT : STUDIO_THEME_LIGHT
}

/** Soft night–related status bar; light keeps Apple `default`. */
export function studioStatusBarStyle(appearance: StudioAppearance) {
  return appearance === 'night' ? 'black-translucent' : 'default'
}

export function applyStudioAppearanceToDocument(appearance: StudioAppearance) {
  document.documentElement.setAttribute(DOC_ATTR, appearance)
}

export function clearStudioAppearanceFromDocument() {
  document.documentElement.removeAttribute(DOC_ATTR)
}

/**
 * Studio light/night preference: persist, sync to `<html>`, and expose a toggle.
 * Clears the document attribute on unmount so public Soft night is untouched.
 */
export function useStudioAppearance() {
  const [appearance, setAppearanceState] = useState<StudioAppearance>(readStudioAppearance)

  useEffect(() => {
    applyStudioAppearanceToDocument(appearance)
    return () => clearStudioAppearanceFromDocument()
  }, [appearance])

  const setAppearance = useCallback((next: StudioAppearance) => {
    writeStudioAppearance(next)
    setAppearanceState(next)
  }, [])

  const toggleAppearance = useCallback(() => {
    setAppearance(appearance === 'light' ? 'night' : 'light')
  }, [appearance, setAppearance])

  return { appearance, setAppearance, toggleAppearance }
}
