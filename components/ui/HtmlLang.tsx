'use client'

import { useEffect } from 'react'

/** Sets document.documentElement.lang when the locale changes. */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
