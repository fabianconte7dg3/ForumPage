// Pruebas de control de acceso contra /api/ con sesiones reales.
//
// Regla del proyecto (.agents/AGENTS.md #8): "Verificar contra /api/ con un GET
// sin sesión, nunca contra la interfaz. Que el panel no muestre algo no
// significa que la API no lo entregue." Estas pruebas son esa verificación.
//
// Correr con el servidor de desarrollo levantado:
//   node --import tsx --env-file=.env --test tests/acceso.test.ts
//
// Crea cuentas descartables al empezar y las borra al terminar. No toca datos
// reales y nunca debe correrse contra producción.

import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'

import { getPayload } from 'payload'

import config from '@/payload.config'
import type { User } from '@/payload-types'

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
const PASSWORD = 'Auditoria-2026-Temp!x9'
const MARCA = 'auditoria-acceso-temp'

const ROLES = ['becario', 'staff', 'directiva', 'admin'] as const
type Rol = (typeof ROLES)[number]
type Persona = 'anonimo' | Rol

// Nunca legibles sin sesión. Un `docs.length > 0` acá es una fuga de datos.
const PRIVADAS = [
  'users',
  'auditoria',
  'documentos-privados',
  'registros-academicos',
  'recuperaciones',
  'horas-labor-social',
  'desembolsos',
  'donaciones',
  'fotos-becarios',
]

// Contenido institucional: lectura pública, escritura solo staff o superior.
const INSTITUCIONALES = [
  'actividades',
  'comunidades',
  'proyectos',
  'programas',
  'sedes',
  'niveles',
  'materias',
  'cursos',
  'recursos',
  'practicas',
  'talleres',
  'tutorias',
  'giras-educativas',
  'equipo',
  'centros-educativos',
  'destinos-internacionales',
]

const TODAS = [...PRIVADAS, ...INSTITUCIONALES, 'becarios', 'necesidades', 'media']

// Campos que jamás deben salir por la API a quien no corresponde. El estado de
// suspensión de un becario es el más delicado: es reversible, no una baja, y
// docs/spec.md lo prohíbe incluso de forma agregada.
const CAMPOS_PROHIBIDOS_EN_PUBLICO = [
  'nota_interna_evaluacion',
  'motivo_suspension',
  'enlace_invitacion',
  'dosFA_secreto',
  'condicion_socioeconomica',
]

const cookies: Record<Persona, string> = {
  admin: '',
  anonimo: '',
  becario: '',
  directiva: '',
  staff: '',
}
const ids: number[] = []

const pedir = (ruta: string, persona: Persona, init: RequestInit = {}) =>
  fetch(`${BASE}${ruta}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies[persona] ? { Cookie: cookies[persona] } : {}),
      ...init.headers,
    },
    redirect: 'manual',
  })

describe('control de acceso', { concurrency: false, timeout: 300_000 }, () => {
  before(async () => {
    const payload = await getPayload({ config })

    for (const rol of ROLES) {
      const email = `${MARCA}-${rol}@example.invalid`
      // Barrer una corrida anterior que haya quedado a medias.
      const previos = await payload.find({ collection: 'users', where: { email: { equals: email } } })
      for (const doc of previos.docs) await payload.delete({ collection: 'users', id: doc.id })

      const creado = (await payload.create({
        collection: 'users',
        data: { email, password: PASSWORD, rol },
      })) as User
      ids.push(creado.id)

      // `generarInvitacionAlCrear` pisa la contraseña con una aleatoria justo
      // después de crear; sin este update no se puede iniciar sesión. El hook
      // no vuelve a dispararse porque solo actúa en `operation === 'create'`.
      await payload.update({ collection: 'users', id: creado.id, data: { password: PASSWORD } })

      const res = await fetch(`${BASE}/api/users/login`, {
        body: JSON.stringify({ email, password: PASSWORD }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      assert.equal(res.status, 200, `login de ${rol} falló con ${res.status}`)
      const cookie = res.headers.getSetCookie().find((c) => c.startsWith('payload-token='))
      assert.ok(cookie, `login de ${rol} no devolvió cookie de sesión`)
      cookies[rol] = cookie.split(';')[0]
    }
  })

  after(async () => {
    const payload = await getPayload({ config })
    for (const id of ids) await payload.delete({ collection: 'users', id }).catch(() => {})
  })

  // El bug que disparó la auditoría: sin `access.admin` declarado, Payload deja
  // entrar al panel nativo a cualquier usuario autenticado — becario incluido.
  describe('panel /admin', () => {
    test('becario no entra al panel', async () => {
      const res = await pedir('/admin', 'becario')
      assert.notEqual(res.status, 200, 'becario recibió 200 en /admin')
    })
    for (const persona of ['staff', 'directiva', 'admin'] as const) {
      test(`${persona} sí entra al panel`, async () => {
        const res = await pedir('/admin', persona)
        assert.equal(res.status, 200, `${persona} quedó fuera de /admin con ${res.status}`)
      })
    }
  })

  describe('lectura anónima de colecciones privadas', () => {
    for (const slug of PRIVADAS) {
      test(`anónimo no lee ${slug}`, async () => {
        const res = await pedir(`/api/${slug}?limit=1`, 'anonimo')
        if (res.status === 403 || res.status === 401) return
        assert.equal(res.status, 200, `${slug} respondió ${res.status}`)
        const cuerpo = (await res.json()) as { docs?: unknown[] }
        assert.equal(cuerpo.docs?.length ?? 0, 0, `${slug} entregó ${cuerpo.docs?.length} documentos sin sesión`)
      })
    }
  })

  describe('lectura de becario sobre colecciones privadas ajenas', () => {
    for (const slug of ['users', 'auditoria', 'documentos-privados', 'donaciones', 'desembolsos']) {
      test(`becario no lista ${slug} ajenos`, async () => {
        const res = await pedir(`/api/${slug}?limit=100`, 'becario')
        if (res.status === 403 || res.status === 401) return
        const cuerpo = (await res.json()) as { docs?: { id: number }[] }
        if (slug === 'users') {
          // Becario puede leer únicamente su propio registro de usuario, ninguno más.
          const ajenos = (cuerpo.docs ?? []).filter((d) => d.id !== ids[ROLES.indexOf('becario')])
          assert.equal(ajenos.length, 0, `becario pudo leer ${ajenos.length} usuarios ajenos`)
        } else {
          assert.equal(cuerpo.docs?.length ?? 0, 0, `${slug} entregó ${cuerpo.docs?.length} documentos a un becario`)
        }
      })
    }
  })

  describe('escritura anónima', () => {
    for (const slug of TODAS) {
      test(`anónimo no crea en ${slug}`, async () => {
        const res = await pedir(`/api/${slug}`, 'anonimo', { body: JSON.stringify({}), method: 'POST' })
        assert.ok([401, 403].includes(res.status), `POST anónimo a ${slug} devolvió ${res.status} (403/401 esperado)`)
      })
    }
  })

  describe('escritura de becario sobre contenido institucional', () => {
    for (const slug of INSTITUCIONALES) {
      test(`becario no crea en ${slug}`, async () => {
        const res = await pedir(`/api/${slug}`, 'becario', { body: JSON.stringify({}), method: 'POST' })
        assert.ok([401, 403].includes(res.status), `POST de becario a ${slug} devolvió ${res.status} (403/401 esperado)`)
      })
      test(`becario no borra en ${slug}`, async () => {
        const res = await pedir(`/api/${slug}?where[id][exists]=true`, 'becario', { method: 'DELETE' })
        assert.ok([401, 403].includes(res.status), `DELETE de becario a ${slug} devolvió ${res.status}`)
      })
    }
  })

  describe('escalada de privilegios', () => {
    for (const persona of ['becario', 'staff', 'directiva'] as const) {
      test(`${persona} no se asciende a admin`, async () => {
        const yo = await (await pedir('/api/users/me', persona)).json()
        const id = (yo as { user?: { id?: number } }).user?.id
        assert.ok(id, `no se pudo resolver el id de ${persona}`)
        await pedir(`/api/users/${id}`, persona, { body: JSON.stringify({ rol: 'admin' }), method: 'PATCH' })
        const despues = await (await pedir('/api/users/me', persona)).json()
        assert.equal((despues as { user?: { rol?: string } }).user?.rol, persona, `${persona} logró cambiarse el rol`)
      })
    }

    test('becario no cambia el rol de otro usuario', async () => {
      const objetivo = ids[ROLES.indexOf('staff')]
      await pedir(`/api/users/${objetivo}`, 'becario', { body: JSON.stringify({ rol: 'becario' }), method: 'PATCH' })
      const payload = await getPayload({ config })
      const doc = (await payload.findByID({ collection: 'users', id: objetivo })) as User
      assert.equal(doc.rol, 'staff', 'un becario degradó a un usuario staff')
    })
  })

  describe('campos sensibles en respuestas públicas', () => {
    for (const slug of ['becarios', 'necesidades', 'practicas', 'media']) {
      test(`${slug} no filtra campos internos a un anónimo`, async () => {
        const res = await pedir(`/api/${slug}?limit=100&depth=1`, 'anonimo')
        if (res.status !== 200) return
        const texto = await res.text()
        for (const campo of CAMPOS_PROHIBIDOS_EN_PUBLICO) {
          assert.ok(!texto.includes(`"${campo}"`), `${slug} expuso el campo ${campo} sin sesión`)
        }
      })
    }

    // El consentimiento es revocable en cualquier momento por el propio
    // becario: todo becario que salga por la API pública tiene que tener
    // mostrar_en_mapa en true. Error #10 del repo, ya cometido una vez.
    test('la API pública solo entrega becarios con consentimiento activo', async () => {
      const res = await pedir('/api/becarios?limit=200', 'anonimo')
      if (res.status !== 200) return
      const cuerpo = (await res.json()) as { docs?: { id: number; mostrar_en_mapa?: boolean }[] }
      const sinConsentimiento = (cuerpo.docs ?? []).filter((d) => d.mostrar_en_mapa !== true)
      assert.equal(sinConsentimiento.length, 0, `${sinConsentimiento.length} becarios sin consentimiento salieron por la API pública`)
    })

    test('el token de invitación no es legible por otro usuario', async () => {
      const objetivo = ids[ROLES.indexOf('becario')]
      for (const persona of ['anonimo', 'becario', 'staff'] as const) {
        const res = await pedir(`/api/users/${objetivo}`, persona)
        if (res.status !== 200) continue
        const texto = await res.text()
        assert.ok(!texto.includes('enlace_invitacion'), `${persona} pudo leer enlace_invitacion de otra cuenta`)
      }
    })
  })
})
