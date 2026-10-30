import { readFileSync } from 'node:fs'
import {
  assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'

let env: RulesTestEnvironment

const validTask = () => ({
  title: 'Estudiar reglas',
  description: '',
  priority: 'media',
  dueDate: '2026-05-14',
  completed: false,
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ongoing',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const asA = () => env.authenticatedContext('userA').firestore()
const asB = () => env.authenticatedContext('userB').firestore()
const anonymous = () => env.unauthenticatedContext().firestore()
const taskOfA = (db: ReturnType<typeof asA>, id = 't1') => doc(db, 'users/userA/tasks', id)

async function seedTaskOfA() {
  await assertSucceeds(setDoc(taskOfA(asA()), validTask()))
}

describe('reglas de Firestore: users/{uid}/tasks', () => {
  it('el usuario A crea, lee, edita y elimina sus propias tareas', async () => {
    await seedTaskOfA()
    await assertSucceeds(getDoc(taskOfA(asA())))
    await assertSucceeds(getDocs(collection(asA(), 'users/userA/tasks')))
    await assertSucceeds(updateDoc(taskOfA(asA()), { completed: true, updatedAt: serverTimestamp() }))
    await assertSucceeds(deleteDoc(taskOfA(asA())))
  })

  it('el reordenamiento en lote (order + updatedAt) lo permite el dueño y lo niega a otro usuario', async () => {
    await seedTaskOfA()
    await assertSucceeds(setDoc(taskOfA(asA(), 't2'), validTask()))
    const reorder = (db: ReturnType<typeof asA>) => {
      const batch = writeBatch(db)
      for (const [id, order] of [['t1', 2], ['t2', 1]] as const) {
        batch.update(taskOfA(db, id), { order, updatedAt: serverTimestamp() })
      }
      return batch.commit()
    }
    await assertFails(reorder(asB()))
    await assertSucceeds(reorder(asA()))
  })

  it('el usuario B no puede leer, listar, editar ni eliminar tareas de A', async () => {
    await seedTaskOfA()
    await assertFails(getDoc(taskOfA(asB())))
    await assertFails(getDocs(collection(asB(), 'users/userA/tasks')))
    await assertFails(updateDoc(taskOfA(asB()), { completed: true, updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(taskOfA(asB())))
  })

  it('el usuario B no puede crear tareas en la ruta de A', async () => {
    await assertFails(setDoc(taskOfA(asB(), 'intruso'), validTask()))
  })

  it('sin autenticar no se lee ni se escribe', async () => {
    await seedTaskOfA()
    await assertFails(getDoc(taskOfA(anonymous())))
    await assertFails(getDocs(collection(anonymous(), 'users/userA/tasks')))
    await assertFails(setDoc(taskOfA(anonymous(), 'x'), validTask()))
    await assertFails(deleteDoc(taskOfA(anonymous())))
  })

  it('rechaza datos arbitrarios: campos extra, tipos y tamaños inválidos', async () => {
    const db = asA()
    const attempt = (data: object, id: string) => setDoc(taskOfA(db, id), { ...validTask(), ...data })
    await assertFails(attempt({ owner: 'userB' }, 'a'))
    await assertFails(attempt({ title: '' }, 'b'))
    await assertFails(attempt({ title: 'x'.repeat(121) }, 'c'))
    await assertFails(attempt({ description: 'x'.repeat(501) }, 'd'))
    await assertFails(attempt({ priority: 'urgente' }, 'e'))
    await assertFails(attempt({ dueDate: '14/05/2026' }, 'f'))
    await assertFails(attempt({ completed: 'si' }, 'g'))
    await assertFails(attempt({ createdAt: new Date(2020, 1, 1) }, 'h'))
    await assertSucceeds(attempt({ dueDate: null }, 'ok'))
  })

  it('no permite cambiar la fecha de creación ni añadir campos al editar', async () => {
    await seedTaskOfA()
    const ref = taskOfA(asA())
    await assertFails(updateDoc(ref, { createdAt: new Date(2000, 0, 1), updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { uid: 'userB', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { completed: true }))
  })

  it('no hay acceso a otras rutas no declaradas', async () => {
    await assertFails(setDoc(doc(asA(), 'users/userA/otra/x'), { a: 1 }))
    await assertFails(getDoc(doc(asA(), 'users/userA')))
  })
})
