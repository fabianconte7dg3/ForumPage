# Plantillas de datos base — Fase 0

> ⚠️ **Estado actual: datos 100% ficticios para desarrollo.** Nombres, becarios, coordenadas y comunidades en estos CSV son inventados — sirven para tener seed data realista mientras se construye Payload en Fase 1. **Ninguno representa a una persona real ni implica consentimiento real.** Antes de cargar datos reales del padrón de becarios, reemplazar este archivo por completo con la información verificada del staff, y solo entonces `mostrar_en_mapa` puede reflejar consentimientos firmados de verdad.

Estructura mínima según el modelo de datos en [docs/spec.md](../../docs/spec.md). El staff las llena con datos reales; luego se cargan a Payload al construir las colecciones (Fase 1, [03-runbook-tecnico.md §5](../../03-runbook-tecnico.md)).

| Archivo | Corresponde a la colección | Quién la llena |
|---|---|---|
| `comunidades.csv` | `Comunidades` | Staff, con apoyo de conocimiento local |
| `sedes.csv` | `Sedes` | Staff |
| `centros-educativos.csv` | `CentrosEducativos` | Staff |
| `programas.csv` | `Programas` | Ya viene pre-llenada con los 5 programas conocidos ([01-documento-de-proyecto.md](../../01-documento-de-proyecto.md)) y colores/íconos sugeridos del sistema de diseño — confirmar con la fundación |
| `becarios.csv` | `Becarios` | Staff, **solo becarios con consentimiento firmado o en trámite** |

## Reglas al llenarlas

- **Coordenadas siempre como centroide de la comunidad**, nunca del domicilio de una persona ([01-documento-de-proyecto.md §7](../../01-documento-de-proyecto.md), precisión geográfica).
- **`becarios.csv` contiene datos personales.** Aunque el repositorio es privado, evita dejar esta plantilla llena con datos reales en el historial de git más tiempo del necesario: una vez cargada a Payload (Fase 1), retírala o muévela fuera del repo. Mientras tanto, `mostrar_en_mapa` debe quedar en `no` para cualquier fila sin `consentimiento_firmado = si`.
- Un color hexadecimal y un ícono por programa alimentan directamente los filtros del mapa — no hace falta que sean definitivos ahora, pero si ya hay preferencia institucional, anotarla.
