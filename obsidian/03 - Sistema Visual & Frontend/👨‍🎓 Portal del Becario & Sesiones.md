---
title: "Portal del Becario & Sesiones"
tags:
  - portal
  - becario
  - frontend
  - sesiones
aliases:
  - Portal del Becario
  - Dashboard Becario
date: 2026-07-30
status: activo
---

# 👨‍🎓 Portal del Becario & Sesiones — Forum Foundation

> [!graduated-cap] Interfaz del Beneficiario (`/portal`)
> El Portal del Becario es la aplicación donde los estudiantes consultan el estado de su beca, su progreso en labor social, el historial de desembolsos y la lista en vivo de materias pendientes en caso de suspensión.

---

## 🏗️ Arquitectura de Autenticación & Componentes

```mermaid
graph TD
    Page["📄 Server Component /portal"] --> AuthCheck{"sesionActual() via payload.auth()"}
    AuthCheck -->|Sin Sesión| FormLogin["🔒 FormularioLogin (Support 2FA TOTP)"]
    AuthCheck -->|Becario Autenticado| Dashboard["👨‍🎓 Panel del Becario"]

    Dashboard --> BannerState{"Estado del Becario"}
    BannerState -->|Activo Reciente| BannerWelcome["🎉 Banner de Bienvenida de Regreso"]
    BannerState -->|Suspendido| BannerSuspension["⚠️ Banner de Suspensión + Lista en Vivo de Materias Pendientes"]
    
    Dashboard --> SocialLabor["⏱️ Barra de Progreso de Labor Social"]
    Dashboard --> Disbursements["💰 Historial Cronológico de Desembolsos"]
    Dashboard --> Logout["🚪 Botón Cerrar Sesión"]
```

---

## 🧩 Componentes y Funcionalidades Del Portal

### 1. Inicio de Sesión & Formularios ([FormularioLogin.tsx](file:///home/fabianc/Documentos/ForumPage/src/components/FormularioLogin.tsx))
- Soporta inicio de sesión por email/password y maneja automáticamente la bifurcación del desafío 2FA TOTP (`confirmarDosFA`).
- **Restablecimiento y Activación**: Formulario unificado ([FormularioContrasena.tsx](file:///home/fabianc/Documentos/ForumPage/src/components/FormularioContrasena.tsx)) para activar cuentas invitadas o restablecer contraseñas con desafío 2FA integrado.

### 2. Progreso de Labor Social
- Calcula las horas aprobadas en [[🗄️ Modelo de Datos y Colecciones|HorasLaborSocial]] contra la meta anual del becario.
- Muestra porcentaje de avance y barra visual adaptada a la paleta canónica (`montana`).

### 3. Historial Cronológico de Desembolsos
- Renderiza el calendario de desembolsos ordenado del más reciente al más antiguo.
- **Identificación por Estado**:
  - `programado`: Estilo neutro/estándar.
  - `retenido`: Destacado con acento de atención (coincidente con el banner de suspensión).
  - `pagado`: Indicador verde de depósito realizado.
  - `cancelado`: Estilo tachado/deshabilitado.

### 5. Portal del Staff (`/staff`)
- **Sistema de Pestañas**: Navegación dividida entre `Becarios` y `Publicaciones`.
- **Buscador Dinámico**: Filtro instantáneo por nombre en el cliente para la gestión acelerada de expedientes (>100 becarios).
- **Verificación de Expedientes y Evidencias**: Vista previa de créditos universitarios e informes/evidencias de labor social.
- **Registro Directo de Desembolsos**: Flujo simplificado "Registrar Pago Realizado" con estado `pagado` y fecha efectiva automática.
- **Publicaciones & Payload Admin**: Historial de 10 elementos con paginación (`?tab=publicaciones&p=1`) y enlace a creación en Payload Admin con branding corporativo inyectado (`admin.scss`).

---

## 🔗 Nodos Relacionados
- [[🗺️ Home - Forum Foundation]]
- [[🔐 Matriz IAM y Permisos]]
- [[🗄️ Modelo de Datos y Colecciones]]
- [[🔄 Automatismos de Negocio]]
- [[🎨 Tokens de Diseño & Tipografía]]
