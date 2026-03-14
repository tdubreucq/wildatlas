import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { fetchTaxonDetail } from '@/lib/inaturalist'
import { TAXON_CONFIG } from '@/types/species'
import { thumbUrl } from '@/lib/inaturalist'
import { INAT_LOCALE_MAP } from '@/i18n/routing'
import Link from 'next/link'
import styles from './page.module.css'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'app' })
  try {
    const inatLocale = INAT_LOCALE_MAP[locale as keyof typeof INAT_LOCALE_MAP] ?? 'en'
    const taxon = await fetchTaxonDetail(Number(id), inatLocale)
    return {
      title: `${taxon.preferred_common_name ?? taxon.name} — ${t('name')}`,
    }
  } catch {
    return { title: t('name') }
  }
}

export default async function SpeciesPage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations('speciesPage')
  const tEnv = await getTranslations('filters')

  const inatLocale = INAT_LOCALE_MAP[locale as keyof typeof INAT_LOCALE_MAP] ?? 'en'
  const taxon = await fetchTaxonDetail(Number(id), inatLocale)
  const cfg = TAXON_CONFIG[taxon.iconic_taxon_name] ?? TAXON_CONFIG['Animalia']
  const photo = thumbUrl(taxon.default_photo?.url, 'medium')

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>
          {t('back')}
        </Link>
      </nav>

      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={taxon.name} className={styles.hero} />
      ) : (
        <div
          className={styles.heroPlaceholder}
          style={{ background: cfg.bgColor, color: cfg.color }}
        >
          {tEnv(`groups.${taxon.iconic_taxon_name}`)}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.names}>
          <h1 className={styles.commonName}>
            {taxon.preferred_common_name ?? taxon.name}
          </h1>
          <p className={styles.sciName}>{taxon.name}</p>
        </div>

        <div className={styles.badges}>
          <span
            className={styles.badge}
            style={{ background: cfg.bgColor, color: cfg.color }}
          >
            {tEnv(`groups.${taxon.iconic_taxon_name}`)}
          </span>
          {taxon.conservation_status && (
            <span
              className={styles.badge}
              style={{ background: '#ffe4d6', color: '#5c1a00' }}
            >
              {t('status', { status: taxon.conservation_status.toUpperCase() })}
            </span>
          )}
        </div>

        {taxon.wikipedia_url && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('learnMore')}</h2>
            <a
              href={taxon.wikipedia_url}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('learnMore')} →
            </a>
          </section>
        )}

        {taxon.ancestry && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('classification')}</h2>
            <p className={styles.ancestry}>
              {taxon.ancestry.replace(/\//g, ' › ')}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
