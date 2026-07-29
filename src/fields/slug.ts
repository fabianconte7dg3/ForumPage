import type { Field } from 'payload'

const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Slug generado por hook beforeValidate desde `fuente`, editable pero estable —
// ver 03-runbook-tecnico.md §5, "Reglas transversales".
export const slugField = (fuente = 'nombre'): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return formatSlug(value)
        const base = data?.[fuente]
        return typeof base === 'string' ? formatSlug(base) : value
      },
    ],
  },
})
