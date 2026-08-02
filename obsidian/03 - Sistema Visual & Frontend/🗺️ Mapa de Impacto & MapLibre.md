---
title: "Mapa de Impacto & MapLibre"
tags:
  - mapa
  - maplibre
  - frontend
  - impacto
aliases:
  - Mapa de Impacto
  - MapLibre
date: 2026-07-29
status: activo
---

# 🗺️ Mapa de Impacto & MapLibre — Forum Foundation

> [!map] El Centro de Rendición de Cuentas (`/impacto`)
> El Mapa de Impacto combina datos geográficos reales de [[🗄️ Modelo de Datos y Colecciones|Comunidades y Sedes]] en Coclé Norte, conectándolos con sus proyectos activos, métricas y actividades.

---

## 🏗️ Arquitectura de Carga Asíncrona

```mermaid
sequenceDiagram
    autonumber
    participant Server as Next.js Server Page
    participant Loader as ImpactoMapLoader (Client)
    participant Map as MapLibre GL JS
    participant Worker as MapLibre Worker (Local)

    Server->>Server: Consulta Comunidades, Sedes y Proyectos en Postgres
    Server->>Server: Formatea GeoJSON (ComunidadFeatures & SedeFeatures)
    Server->>Loader: Renderiza dynamic(() => ImpactoMap, { ssr: false })
    Loader->>Map: Inicializa contenedor WebGL
    Map->>Worker: Carga /maplibre-gl-worker.mjs & shared deps
    Worker-->>Map: Procesa renderizado de vectores & pines
    Map-->>Loader: Evento 'load' completado (pines interactivos listos)
```

---

## 🛠️ Mitigaciones Técnicas Realizadas

1. **Resolución del Web Worker de MapLibre en Webpack**:
   - `maplibre-gl` v6 utiliza `import.meta.url` para resolver su worker script, lo que causaba un error 404 en el bundling de Next.js.
   - **Solución**: El comando `postinstall` en `package.json` copia automáticamente `maplibre-gl-worker.mjs` y `maplibre-gl-shared.mjs` desde `node_modules` hacia `/public/`.
2. **Carga Estática Demarcada**:
   - El componente se carga mediante `next/dynamic({ ssr: false })` para aislar WebGL y los objetos `window` del lado del servidor.

---

## 🎛️ Componentes de Interfaz del Mapa

- **ImpactoTabs (Selector de vistas)**: Alternador superior entre "Mapa", "Resumen" y "Portal de equipo".
- **ImpactoOverview (Panel de Resumen)**: Panel estadístico implementado desde la vista `/impacto` que muestra métricas globales (estudiantes, proyectos), un becario destacado ("Scholar of the term") y dos tablas para monitorear proyectos en ejecución y destinos de estudio.
- **Sidebar de Métricas Reales**: En el mapa, muestra 6 contadores (Comunidades, Sedes, Proyectos Activos, Obras Completadas, Becarios Activos, Países alcanzados).
- **Lista de Comunidades**: Navegación lateral que ejecuta `flyTo` al hacer clic en una comunidad.
- **Panel Lateral de Detalle de Comunidad**: Reemplaza el popup genérico con la ficha completa de la comunidad, sus proyectos en ejecución y el desglose de **becarios originarios de esa comunidad**.
- **Panel Flotante de Becario Internacional**: Tarjeta documental con foto de perfil/avatar, insignia del año de estudio, ruta visual (`📍 ORIGEN` ➔ `✈ DESTINO`), cita inspiradora estilizada y enlace localizado a la comunidad de origen.

---

## 🛠️ Gestión Directa del Mapa y Proyectos por el Staff (`/staff`)

Para cumplir la **Regla Rector** (*"gestionar o publicar en menos de 3 minutos desde un móvil"*), el staff gestiona el 100% de la plataforma sin ingresar a `/admin`:
- **Pestaña `BECARIOS`**: Registro y edición de expedientes, niveles, horas de labor social y verificaciones académicas.
- **Pestaña `PUBLICACIONES`**: Redacción y publicación de noticias, historias y actividades comunitarias.
- **Pestaña `COMUNIDADES (MAPA)`**: Lista navegable con coordenadas GPS, distritos y corregimientos con modales `+ Nueva Comunidad` y `✏ Editar Comunidad`.
- **Pestaña `PROYECTOS`**: Creación de proyectos de infraestructura y programas (`+ Nuevo Proyecto`), selector de estado (*Propuesto, Aprobado, En ejecución, Completado*), monto ($) y **control deslizante (slider 0-100%) para actualizar el % de avance en vivo** que alimenta el Mapa de Impacto (`/impacto`).
- **Autocompletado de Destinos Internacionales**: Selector con las coordenadas pre-cargadas de universidades frecuentes en el extranjero (*Bocconi, University of Florida, Navarra, Tec de Monterrey, Zamorano, EARTH*) para agilizar el registro de trayectorias.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🎨 Tokens de Diseño & Tipografía]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🚀 Plan de Ejecución & Estado de Fases]]

