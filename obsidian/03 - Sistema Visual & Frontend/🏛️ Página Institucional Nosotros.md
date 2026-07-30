---
title: "Página Institucional Nosotros & Equipo"
tags:
  - frontend
  - nosotros
  - equipo
  - globals
  - colecciones
aliases:
  - Nosotros
  - Equipo
  - /nosotros
date: 2026-07-30
status: completado
---

# 🏛️ Página Institucional Nosotros & Equipo (`/nosotros`)

> [!abstract] Resumen de la Vista
> La página `/nosotros` presenta la misión, historia y el equipo humano de **Forum Foundation**. Todo el contenido se gestiona desde el panel de Payload CMS (cero bios o datos hardcodeados en código) mediante la colección `Equipo` y el global `Nosotros`.

---

## 🏗️ Esquemas de Datos Asociados

### 1. Global `Nosotros` (`src/globals/Nosotros.ts`)
- **Tipo**: Singleton Global (Configuración de la página).
- **Campos**:
  - `mision`: Lexical RichText localizado (`es`/`en`).
  - `historia`: Lexical RichText localizado (`es`/`en`).
  - `foto`: Imagen descriptiva que acompaña el texto.
  - `logo`: Emblema/marca institucional.
- **Acceso**: Lectura pública (`() => true`), edición restringida a Staff/Admin (`esStaffOSuperior`).

### 2. Colección `Equipo` (`src/collections/Equipo.ts`)
- **Tipo**: Colección (21ª colección del CMS).
- **Campos**:
  - `nombre`: Texto (Nombre completo).
  - `cargo`: Texto localizado (`es`/`en`).
  - `bio`: Textarea localizado (`es`/`en`).
  - `foto`: Upload de imagen (`Media`).
  - `destacado`: Checkbox (Si es `true`, renderiza una tarjeta prominente de 2 columnas para el fundador).
  - `orden`: Número (Orden de aparición en la grilla, de menor a mayor).
- **Acceso**: Lectura pública (`() => true`), CRUD restringido a Staff/Admin (`esStaffOSuperior`).

---

## 🎨 Diseño Visual & Cumplimiento `user_global`

- **Estética Documental**: Registro biográfico e histórico limpio sin adornos genéricos ni elementos de marketing.
- **Titulares**: *Archivo Expanded* en mayúsculas ancha para el encabezado principal y nombres.
- **Cuerpo**: *Source Serif 4* para la biografía y narrativa histórica.
- **Geometría**:
  - Tarjetas de equipo con `border-radius: 4px`.
  - Imágenes con `border-radius: 0px` (sin redondeado en fotos).
  - Hairline border (`1px border-piedra/25`).
  - **Cero sombras** (`box-shadow: none`).

---

## 🔄 Sembrado de Datos (`scripts/seed-nosotros.ts`)

El script `pnpm seed:nosotros` migra el contenido institucional real del sitio WordPress archivado (`ForumOldPageInfo/`), poblando los 7 miembros del equipo original con sus fotos reales y traduciendo la misión e historia al español.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🎨 Tokens de Diseño & Tipografía]]
- [[🔐 Matriz IAM y Permisos]]
