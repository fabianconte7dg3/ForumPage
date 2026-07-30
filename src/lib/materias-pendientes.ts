import type { Recuperacion, RegistrosAcademico } from '@/payload-types'

// Cuenta ocurrencias de materias reprobadas (en registros verificados) menos
// las ya recuperadas (en recuperaciones verificadas) — un becario con dos
// materias reprobadas no reactiva recuperando solo una. Devuelve los nombres
// distintos que todavía quedan pendientes. Compartido entre el automatismo
// de reactivación (Recuperaciones.ts) y el panel del becario, para que este
// último muestre la lista real y no una copia congelada del momento de la
// suspensión.
export function materiasPendientes(registros: RegistrosAcademico[], recuperaciones: Recuperacion[]): string[] {
  const conteo = new Map<string, number>()
  for (const registro of registros) {
    for (const m of registro.materias_reprobadas ?? []) {
      conteo.set(m.nombre, (conteo.get(m.nombre) ?? 0) + 1)
    }
  }
  for (const recuperacion of recuperaciones) {
    const restante = conteo.get(recuperacion.materia) ?? 0
    if (restante > 0) conteo.set(recuperacion.materia, restante - 1)
  }
  return Array.from(conteo.entries())
    .filter(([, cantidad]) => cantidad > 0)
    .map(([nombre]) => nombre)
}
