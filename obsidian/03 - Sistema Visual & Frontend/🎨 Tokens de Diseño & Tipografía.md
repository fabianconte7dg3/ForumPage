---
title: "Tokens de Diseño & Tipografía"
tags:
  - diseño
  - tokens
  - tipografia
  - css
aliases:
  - Tokens de Diseño
  - Sistema Visual
date: 2026-07-29
status: activo
---

# 🎨 Tokens de Diseño & Tipografía — Forum Foundation

> [!palette] Estética Documental, No Genérica
> El diseño visual imita un **registro o archivo documental**, no un folleto de ventas. Se evitan los estilos predeterminados de IA (como combinaciones crema/terracota genéricas o negro puro con verde ácido).

---

## 🎨 Paleta de Color Canónica

```css
/* Definidos en src/app/(frontend)/[locale]/styles.css */
--color-montana: #2c3e35;  /* Verde profundo institucional */
--color-cosecha: #d97706;  /* Acento cálido / ámbar */
--color-rio: #0284c7;      /* Azul agua / enlaces */
--color-tinta: #1c1917;    /* Texto principal */
--color-piedra: #78716c;   /* Bordes sutiles y secundarios */
--color-niebla: #f5f5f4;   /* Fondos claros documentales */
```

---

## 🔤 Jerarquía Tipográfica Deliberada

1. **Titulares (`font-display`)**: **Archivo Expanded** (institucional, ancha, en mayúsculas).
2. **Cuerpo de Texto (`font-lectura`)**: **Source Serif 4** (serifa editorial para máxima legibilidad en artículos).
3. **Datos Verificables (`font-mono`)**: **IBM Plex Mono**.

> [!caution] Regla Estricta para IBM Plex Mono
> La tipografía monoespaciada **no es decorativa**. Se utiliza **únicamente** para marcar datos empíricos: fechas (prominentes), coordenadas lat/lng, montos numéricos y contadores de impacto.

---

## 📐 Geometría y Restricciones Visuales

- **Radio de Borde**:
  - Tarjetas y botones: `4px` estricto.
  - Etiquetas / badges: `2px`.
  - Imágenes: `0px` (bordes rectos de archivo).
- **Sin Sombras (`box-shadow`)**: Cero sombras proyectadas. La jerarquía visual se logra exclusivamente mediante bordes hairline (`1px border-piedra/25`) y espacio en blanco.
- **Micro-interacciones**: Transiciones rápidas de 150-200ms en hovers, respetando siempre `prefers-reduced-motion`.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🏗️ Especificación Técnica (Spec)]]
- [[🗺️ Mapa de Impacto & MapLibre]]
- [[📚 Centro de Aprendizaje & Quizzes]]
