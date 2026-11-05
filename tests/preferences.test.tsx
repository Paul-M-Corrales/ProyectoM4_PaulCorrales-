import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import type { AuthUser } from '@/features/auth/types'
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from '@/features/preferences/taskPreferences'
import { AccountInfoContext } from '@/features/sections/accountInfoContext'
import { TaskRepositoryContext } from '@/features/tasks/context/taskRepositoryContext'
import { fakeGateway, USER } from './auth/helpers'
import { memoryRepository } from './tasks/memoryRepository'

const OTHER: AuthUser = { ...USER, uid: 'u2', email: 'otra@dominio.com' }

beforeEach(() => localStorage.clear())

describe('almacenamiento de preferencias', () => {
  it('guarda y recupera por usuario, con valores por defecto sin datos', () => {
    expect(loadPreferences('u1')).toEqual(DEFAULT_PREFERENCES)
    expect(savePreferences('u1', { sort: 'priority' })).toBe(true)
    expect(loadPreferences('u1')).toEqual({ sort: 'priority' })
  })

  it('aísla a cada usuario y no devuelve nada sin sesión', () => {
    savePreferences('u1', { sort: 'title' })
    expect(loadPreferences('u2')).toEqual(DEFAULT_PREFERENCES)
    expect(loadPreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(savePreferences(null, { sort: 'title' })).toBe(false)
  })

  it('ignora datos corruptos o con un orden desconocido', () => {
    localStorage.setItem('ongoing.preferences.v1.u1', '{no es json')
    expect(loadPreferences('u1')).toEqual(DEFAULT_PREFERENCES)
    localStorage.setItem('ongoing.preferences.v1.u1', JSON.stringify({ sort: 'inventado' }))
    expect(loadPreferences('u1')).toEqual(DEFAULT_PREFERENCES)
    expect(savePreferences('u1', { sort: 'inventado' } as never)).toBe(false)
  })

  it('sin almacenamiento disponible no lanza y avisa de que no guardó', () => {
    const broken = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('cuota') } }
    expect(loadPreferences('u1', broken)).toEqual(DEFAULT_PREFERENCES)
    expect(savePreferences('u1', { sort: 'due' }, broken)).toBe(false)
  })
})

function open(user: AuthUser, path: string) {
  const gateway = fakeGateway()
  const view = render(
    <AccountInfoContext value={() => ({ emailVerified: true, provider: 'password' })}>
      <TaskRepositoryContext value={() => memoryRepository()}>
        <AuthProvider gateway={gateway}>
          <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
          </MemoryRouter>
        </AuthProvider>
      </TaskRepositoryContext>
    </AccountInfoContext>,
  )
  act(() => gateway.emit(user))
  return view
}
const sortOf = () => screen.getByLabelText(/Ordenar por/)

describe('Configuración → Mis tareas', () => {
  it('muestra los datos reales de la cuenta: nombre, correo, método y verificación', async () => {
    open(USER, '/configuracion')
    const panel = within(await screen.findByRole('region', { name: 'Cuenta' }))
    expect(panel.getByText(USER.email as string)).toBeInTheDocument()
    expect(panel.getByText('Correo y contraseña')).toBeInTheDocument()
    expect(panel.getByText('Verificado')).toBeInTheDocument()
    expect(panel.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('el orden elegido se guarda y se aplica realmente al abrir Mis tareas', async () => {
    const user = userEvent.setup()
    open(USER, '/configuracion')
    await user.selectOptions(await screen.findByLabelText('Orden predeterminado'), 'priority')
    expect(await screen.findByText('Preferencia guardada.')).toBeInTheDocument()
    expect(loadPreferences(USER.uid)).toEqual({ sort: 'priority' })
    await user.click(screen.getByRole('link', { name: 'Mis tareas' }))
    expect(await screen.findByLabelText(/Ordenar por/)).toHaveValue('priority')
  })

  it('se recupera al volver a iniciar sesión y no afecta a otro usuario', async () => {
    savePreferences(USER.uid, { sort: 'title' })
    const first = open(USER, '/tareas')
    expect(await screen.findByLabelText(/Ordenar por/)).toHaveValue('title')
    first.unmount()
    open(OTHER, '/tareas')
    expect(await screen.findByLabelText(/Ordenar por/)).toHaveValue('due')
    expect(sortOf()).not.toHaveValue('title')
  })

  it('cambiar el orden dentro de Mis tareas no pisa la preferencia guardada', async () => {
    savePreferences(USER.uid, { sort: 'title' })
    open(USER, '/tareas')
    await userEvent.setup().selectOptions(await screen.findByLabelText(/Ordenar por/), 'created')
    expect(loadPreferences(USER.uid)).toEqual({ sort: 'title' })
  })
})
