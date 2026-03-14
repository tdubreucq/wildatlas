import { useTranslations } from 'next-intl'
import { Environment, ENVIRONMENT_CONFIG } from '@/lib/overpass'
import styles from './EnvironmentBadge.module.css'

interface Props {
  environment: Environment | undefined
  loading?: boolean
}

export function EnvironmentBadge({ environment, loading }: Props) {
  const t = useTranslations('environment')

  if (loading) return <span className={styles.skeleton} />
  if (!environment) return null

  const cfg = ENVIRONMENT_CONFIG[environment.type]

  return (
    <span
      className={styles.badge}
      style={{ background: cfg.bgColor, color: cfg.color }}
    >
      <span className={styles.dot} style={{ background: cfg.color }} />
      {t(environment.type)}
    </span>
  )
}
