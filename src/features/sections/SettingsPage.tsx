import { AccountPanel } from './AccountPanel'
import { PreferencesPanel } from './PreferencesPanel'
import { SectionPage } from './SectionPage'
import styles from './cards.module.css'

export function SettingsPage() {
  return (
    <SectionPage title="Configuración" lead="Consultá los datos de tu cuenta y elegí cómo arranca Mis tareas.">
      <div className={styles.grid}>
        <AccountPanel />
        <PreferencesPanel />
      </div>
    </SectionPage>
  )
}
