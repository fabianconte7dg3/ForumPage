'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Opcion = { value: string; label: string }

// Los filtros aplican al cambiar el select y navegan vía router.push — Next
// solo reemplaza el payload de esta página (sin recarga de documento
// completo), a diferencia de un <form method="get"> que dispara una
// navegación dura del navegador. Ver 02-plan-de-ejecucion.md, Fase 2.
export function FiltrosBiblioteca({
  tipos,
  niveles,
  materias,
  textos,
}: {
  tipos: Opcion[]
  niveles: Opcion[]
  materias: Opcion[]
  textos: { tipo: string; nivel: string; materia: string; todos: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function actualizar(nombre: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor) params.set(nombre, valor)
    else params.delete(nombre)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Filtro
        label={textos.tipo}
        name="tipo"
        onChange={actualizar}
        opciones={tipos}
        todosLabel={textos.todos}
        value={searchParams.get('tipo') ?? ''}
      />
      <Filtro
        label={textos.nivel}
        name="nivel"
        onChange={actualizar}
        opciones={niveles}
        todosLabel={textos.todos}
        value={searchParams.get('nivel') ?? ''}
      />
      <Filtro
        label={textos.materia}
        name="materia"
        onChange={actualizar}
        opciones={materias}
        todosLabel={textos.todos}
        value={searchParams.get('materia') ?? ''}
      />
    </div>
  )
}

function Filtro({
  label,
  name,
  opciones,
  todosLabel,
  value,
  onChange,
}: {
  label: string
  name: string
  opciones: Opcion[]
  todosLabel: string
  value: string
  onChange: (nombre: string, valor: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block font-dato text-xs uppercase tracking-wider text-tinta/60" htmlFor={name}>
        {label}
      </label>
      <select
        className="w-full rounded-md border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta"
        id={name}
        onChange={(e) => onChange(name, e.target.value)}
        value={value}
      >
        <option value="">{todosLabel}</option>
        {opciones.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
