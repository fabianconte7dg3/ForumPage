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
  - `fecha_publicacion`: Date ISO (orden cronológico predeterminado).
  - `portada`: Upload `Media`.
  - `galeria`: Upload `Media` (imágenes adicionales).
  - `comunidad`: Relación con `Comunidades` (requerido).
  - `programa`: Relación con `Programas` (opcional).
  - `destacada`: Checkbox (para portada o tarjeta superior en el mural).

---

## 📦 Historias Sembradas (Primer Bloque de 5)

Sembradas automáticamente vía `pnpm seed:historias` (`scripts/seed-historias.ts`) desde los volcados reales en `ForumOldPageInfo/historias/`:

1. **Graduada con Honores 2022: Yazmilka Soto** *(ID: 7, destacada)*
   - Logro académico de la primera posición en el Colegio Candelario Ovalle y aspiración de estudiar Derecho.
2. **Amor por el Idioma y el Aprendizaje: Ailin Pérez** *(ID: 8)*
   - Becaria de la primera promoción de la Academia Forum que culminó la Licenciatura en Inglés en la Universidad de Panamá.
3. **El Acceso a Recursos Digitales Abre Paso al Cambio Sostenible: Jair Rodríguez** *(ID: 9)*
   - Estudiante de Villa Unida en Caimito que aprovechó el Centro Comunitario para su preparación universitaria.
4. **Superación y Pasión Gastronómica: Alexandra Martínez** *(ID: 10)*
   - Graduada de la Academia Forum cursando la carrera de Artes Culinarias.
5. **De Estudiante a Líder Comunitario: Bryner Joel Saldaña** *(ID: 11)*
   - Historia de superación y participación en giras de alcance comunitario en Coclé Norte.

---

## 🎨 Vistas Frontend & Renderizado Lexical

- **Mural `/historias`**: Rejilla de tarjetas (`ActividadCard`) con filtros por comunidad y programa, y paginación.
- **Detalle `/historias/[slug]`**: Renderizado seguro mediante `<RichText>` de `@payloadcms/richtext-lexical/react` (evitando `dangerouslySetInnerHTML`), con enlaces a comunidad y proyecto vinculados.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🎨 Tokens de Diseño & Tipografía]]
- [[🚀 Plan de Ejecución & Estado de Fases]]
