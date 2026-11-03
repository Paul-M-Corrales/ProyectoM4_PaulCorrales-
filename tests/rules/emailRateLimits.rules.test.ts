import { readFileSync } from 'node:fs'
import {
  assertFails, initializeTestEnvironment, type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ongoing',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

describe('reglas de Firestore: emailRateLimits (solo el servidor)', () => {
  it('ningún cliente, ni el dueño del uid, lee ni escribe ni borra su límite', async () => {
    const owner = env.authenticatedContext('userA').firestore()
    const ref = doc(owner, 'emailRateLimits/userA')
    await assertFails(getDoc(ref))
    await assertFails(setDoc(ref, { lastSentAt: 0, day: '2000-01-01', count: 0 }))
    await assertFails(deleteDoc(ref))
  })

  it('otro usuario y un anónimo tampoco pueden reiniciar el contador de A', async () => {
    const other = doc(env.authenticatedContext('userB').firestore(), 'emailRateLimits/userA')
    const anon = doc(env.unauthenticatedContext().firestore(), 'emailRateLimits/userA')
    await assertFails(setDoc(other, { count: 0 }))
    await assertFails(setDoc(anon, { count: 0 }))
    await assertFails(getDoc(anon))
  })
})
