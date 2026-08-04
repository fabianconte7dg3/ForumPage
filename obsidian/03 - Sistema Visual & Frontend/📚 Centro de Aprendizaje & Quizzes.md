---
title: "Centro de Aprendizaje & Quizzes"
tags:
  - aprende
  - biblioteca
  - quizzes
  - frontend
aliases:
  - Centro de Aprendizaje
  - Quizzes
  - Biblioteca
date: 2026-07-29
status: activo
---

# 📚 Centro de Aprendizaje & Quizzes — Forum Foundation

> [!book] Valor Educativo Directo (`/aprende`)
> El Centro de Aprendizaje ofrece recursos educativos descargables, anuncios de tutorías y prácticas autocorregibles diseñadas para operar sin conexión o con bajo consumo de datos.

---

## 🧭 Secciones del Módulo

1. **Biblioteca (`/aprende/biblioteca`)**:
   - Filtros de búsqueda por materia, nivel educativo y tipo de recurso mediante Server Components y `FiltrosBiblioteca` sin recarga dura de página (`router.push`).
   - **Ver y Descargar (2026-08-03)**: Recursos de tipo `pdf_propio` ofrecen dos acciones separadas — "Ver" abre en pestaña nueva con el visor nativo del navegador, "Descargar" incluye el atributo `download` para guardar el archivo en el dispositivo para uso sin conexión. Antes era un solo botón que forzaba descarga siempre.
   - **Videos de YouTube Diferidos**: Utiliza un reproductor estático personalizado que no carga los `iframe` de `youtube-nocookie.com` hasta que el estudiante hace clic explícito, ahorrando datos móviles.

2. **Tutorías (`/aprende/tutorias`)**:
   - Anuncios de sesiones de reforzamiento académico con filtro por materia y sede.

3. **Prácticas & Quizzes (`/aprende/practicas`)**:
   - Evaluaciones interactivas autocorregibles, en tres modalidades: `descargable`, `quiz_autocorregido`, `quiz_con_progreso` (persiste `{aciertos, total, fecha}` en `localStorage` del alumno).
   - Filtros por modalidad/nivel/materia + paginación (2026-08-03), reutilizando `FiltrosBiblioteca` tal cual.
   - El staff las crea/edita desde `/staff` (pestaña Centro de Aprendizaje) sin pasar por `/admin` — ver [[🚀 Plan de Ejecución & Estado de Fases]].

---

## 🔒 Arquitectura de Calificación Segura (Server Actions)

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante as Alumno / Usuario
    participant UI as QuizPractica (Client)
    participant Action as calificarPractica (Server Action)
    participant DB as Payload Local API

    Estudiante->>UI: Selecciona opciones y presiona 'Calcular Puntaje'
    UI->>Action: Invoca Server Action con respuestas del alumno
    Note over Action: Ejecuta con overrideAccess: true en Servidor
    Action->>DB: Obtiene respuestas correctas de la base de datos
    Action->>Action: Compara respuestas y genera puntaje + retroalimentación
    Action-->>UI: Devuelve únicamente { correcto, retroalimentacion }
    Note over UI: NUNCA expone el índice correcto al navegador
```

> [!security] Protección de Respuestas Correctas
> Los campos `respuesta_correcta` y `retroalimentacion` en [[🗄️ Modelo de Datos y Colecciones|Practicas]] tienen `FieldAccess` restringido a Staff/Admin. Ni siquiera la API pública de REST expone las respuestas.

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🎨 Tokens de Diseño & Tipografía]]
- [[🔐 Matriz IAM y Permisos]]
- [[🗄️ Modelo de Datos y Colecciones]]
