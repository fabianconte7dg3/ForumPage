import { randomUUID } from 'crypto'

import { verificarCodigo } from './totp'

interface DesafioPendiente {
  token: string
  exp: number
  secreto: string
  expiraEn: number
  intentos: number
}

// ponytail: mapa en memoria de un solo proceso — si el despliegue escala a
// varias instancias sin sticky sessions, un desafío creado en una instancia
// no se encuentra en otra. Subir a un store compartido (Redis) si eso pasa.
const desafios = new Map<string, DesafioPendiente>()
const DESAFIO_TTL_MS = 5 * 60 * 1000
const MAX_INTENTOS = 5

export function crearDesafio(token: string, exp: number, secreto: string): string {
  const id = randomUUID()
  desafios.set(id, { token, exp, secreto, expiraEn: Date.now() + DESAFIO_TTL_MS, intentos: 0 })
  return id
}

// Un código equivocado NO quema el desafío (typos pasan) — solo lo hace
// acertar, expirar, o agotar los intentos (mismo límite que ya usa Payload
// para contraseña, para no dejar los 6 dígitos abiertos a fuerza bruta).
export function verificarYConsumirDesafio(id: string, codigo: string): Pick<DesafioPendiente, 'exp' | 'token'> | undefined {
  const desafio = desafios.get(id)
  if (!desafio || desafio.expiraEn < Date.now()) {
    desafios.delete(id)
    return undefined
  }
  if (verificarCodigo(desafio.secreto, codigo)) {
    desafios.delete(id)
    return { exp: desafio.exp, token: desafio.token }
  }
  desafio.intentos += 1
  if (desafio.intentos >= MAX_INTENTOS) desafios.delete(id)
  return undefined
}
