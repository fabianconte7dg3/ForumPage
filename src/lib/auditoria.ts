import type { PayloadRequest } from 'payload'

type ValorJson = boolean | number | string | ValorJson[] | { [clave: string]: ValorJson } | null | undefined

// Sin actor autenticado no hay quién firme el evento (Auditoria.actor es
// obligatorio) — pasa en scripts/seeds con overrideAccess y sin req.user, que
// no deben dejar un rastro de auditoría a nombre de nadie.
export async function registrarAuditoria(
  req: PayloadRequest,
  datos: { accion: string; coleccion: string; documentoId: number | string; valorAnterior?: ValorJson; valorNuevo?: ValorJson },
): Promise<void> {
  if (!req.user) return
  await req.payload.create({
    collection: 'auditoria',
    data: {
      actor: req.user.id,
      accion: datos.accion,
      coleccion: datos.coleccion,
      documento_id: String(datos.documentoId),
      valor_anterior: datos.valorAnterior,
      valor_nuevo: datos.valorNuevo,
      fecha: new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })
}
