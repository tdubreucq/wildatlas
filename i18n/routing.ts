import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'pt', 'zh'],
  defaultLocale: 'fr',
})

export type Locale = (typeof routing.locales)[number]

/** Maps app locale → iNaturalist API locale */
export const INAT_LOCALE_MAP: Record<Locale, string> = {
  fr: 'fr',
  en: 'en',
  es: 'es',
  pt: 'pt',
  zh: 'zh-CN',
}
