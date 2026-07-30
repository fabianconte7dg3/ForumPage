---
title: "Historias de la Comunidad & Mural"
tags:
  - historias
  - actividades
  - mural
  - frontend
  - payload-cms
aliases:
  - Historias
  - Mural de Historias
  - /historias
date: 2026-07-30
status: completado
---

# 📜 Historias de la Comunidad & Mural (`/historias`)

> [!abstract] Resumen de Módulo
> El módulo de **Historias de la Comunidad** unifica las publicaciones de blog y el mural de actividades de la ONG. Permite contar los logros de becarios y proyectos en las comunidades de Coclé Norte.

---

## 🏗️ Colección `Actividades` (`src/collections/Actividades.ts`)

- **Slug**: `actividades`
- **Campos Principales**:
  - `titulo`: Texto (localizado `es`/`en`).
  - `slug`: Generado automáticamente desde el título.
  - `extracto`: Textarea resumen (localizado `es`/`en`).
  - `contenido`: Lexical RichText (localizado `es`/`en`).
  - `fecha_publicacion`: Date ISO (orden cronológico predeterminado con fecha real de publicación de WordPress).
  - `portada`: Upload `Media`.
  - `galeria`: Upload `Media` (imágenes adicionales).
  - `comunidad`: Relación con `Comunidades` (requerido).
  - `programa`: Relación con `Programas` (opcional).
  - `destacada`: Checkbox (para portada o tarjeta superior en el mural).

---

## 📦 Historias Migradas (70 Artículos Completos)

Migradas automáticamente vía `pnpm migrate:historias` (`scripts/migrate-all-historias.ts`) desde los volcados reales en `ForumOldPageInfo/historias/`:

- **Preservación de Fechas**: Se extrajeron las fechas reales de publicación (ej. `2020-09-08`, `2020-11-02`, `2021-02-19`, `2023-03-09`).
- **Resolución de Comunidades**: Matcheo automático por palabras clave (Túrega, Caimito, Machuca, Río Indio, Chiguirí, Penonomé, etc.).
- **Procesamiento de Medios**: Portadas e imágenes de galería cargadas en `Media` sin duplicación mediante caché de archivos.
- **Renderizado Lexical**: Contenido convertido a párrafos estandarizados de Lexical.

---

## 🎨 Vistas Frontend & Renderizado Layout

- **Mural `/historias`**: Rejilla de tarjetas (`ActividadCard`) con filtros por comunidad y programa, y paginación.
- **Detalle `/historias/[slug]`**:
  - Portada a pantalla completa (`w-full block`) a tamaño natural sin recortes de rostros.
  - Contenido en contenedor responsive de lectura (`max-w-5xl px-4 md:px-8 py-12 md:py-16`).

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🎨 Tokens de Diseño & Tipografía]]
- [[🚀 Plan de Ejecución & Estado de Fases]]
