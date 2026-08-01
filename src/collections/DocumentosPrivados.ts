import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { esStaffOSuperior } from '@/access'

// Solo auditoría: deja registrado quién subió el archivo. NO se usa para
// control de acceso — la propiedad real del documento la define el becario del
// registro que lo referencia, no quién apretó el botón (el staff sube
// documentación en nombre del becario todo el tiempo).
const autocompletarPropietario: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' && req.user && !data.uploadedBy) {
    data.uploadedBy = req.user.id
  }
  return data
}

export const DocumentosPrivados: CollectionConfig = {
  slug: 'documentos-privados',
  access: {
    // Solo-staff en las cuatro operaciones. Ningún vista del becario renderiza
    // estos archivos (BotonVerDocumento solo se usa en components/staff/), así
    // que darle lectura sería ampliar el alcance sin que nadie lo necesite.
    // El becario sube evidencia por la server action, que corre con
    // overrideAccess tras validar tamaño y tipo.
    read: esStaffOSuperior,
    create: esStaffOSuperior,
    update: esStaffOSuperior,
    delete: esStaffOSuperior,
  },
  upload: {
    // Para documentos no necesitamos todos los image sizes de Media público,
    // pero mantenemos lo mínimo si suben imágenes.
    imageSizes: [
      { name: 'thumbnail', width: 400 },
    ],
  },
  hooks: {
    beforeChange: [autocompletarPropietario],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
}
