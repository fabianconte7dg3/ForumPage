'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type CambiarPasswordInput = {
  passwordActual: string
  passwordNueva: string
}

// Exige reingresar la contraseña actual antes de cambiarla — mismo criterio
// que ya usa desactivarDosFA: una sesión secuestrada (ej. XSS) no debería
// poder tomar la cuenta con solo cambiar la contraseña.
export async function cambiarPassword(input: CambiarPasswordInput) {
  const usuario = await sesionActual()
  if (!usuario) {
    return { error: 'No autenticado.' }
  }

  if (!input.passwordNueva || input.passwordNueva.length < 8) {
    return { error: 'La nueva contraseña debe tener al menos 8 caracteres.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.login({ collection: 'users', data: { email: usuario.email, password: input.passwordActual } })
  } catch {
    return { error: 'La contraseña actual es incorrecta.' }
  }

  await payload.update({
    collection: 'users',
    id: usuario.id,
    data: { password: input.passwordNueva },
    overrideAccess: true,
  })

  return { success: true }
}
