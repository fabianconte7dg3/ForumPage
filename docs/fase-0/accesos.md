# Accesos y cuentas — Fase 0

Documento vivo: marcar cada casilla cuando el acceso o la cuenta exista de verdad, no cuando se solicite. Fuente: [00-cuentas-accesos-secretos en 03-runbook-tecnico.md](../../03-runbook-tecnico.md) y [02-plan-de-ejecucion.md](../../02-plan-de-ejecucion.md).

**Regla que gobierna todo esto: nada a nombre personal.** Toda cuenta se crea con el correo institucional de la fundación, nunca con una cuenta privada del mantenedor o de un solo miembro del staff.

## Correo institucional

- [ ] `tecnologia@forum-foundation.org` (o similar) creado o confirmado como cuenta raíz
- [ ] Recuperación configurada con al menos dos personas de la fundación
- [ ] Documentado quién tiene acceso

## Gestor de contraseñas

- [ ] Bóveda compartida creada (Bitwarden o 1Password)
- [ ] Al menos un responsable de la fundación invitado, además del mantenedor
- [ ] Acordado: ninguna credencial vive fuera de la bóveda

## Cuentas de servicio a dar de alta

| Servicio | Para qué | Estado |
|---|---|---|
| GitHub (organización) | Repositorio y CI | ✅ repo creado (`fabianconte7dg3/ForumPage`, privado) — pendiente: mover a organización de la fundación en vez de cuenta personal, si aplica |
| DigitalOcean | Droplet + Spaces | [ ] Pendiente — a nombre de la fundación |
| Cloudflare | DNS y protección (opcional) | [ ] Pendiente |
| MapTiler o Protomaps | Teselas del mapa | [ ] Pendiente |
| Resend o Postmark | Correo transaccional | [ ] Pendiente |
| YouTube | Videos del Centro de Aprendizaje | [ ] Pendiente — canal ligado al correo institucional |
| Plausible o Umami | Analítica sin cookies | [ ] Pendiente |

- [ ] 2FA activado en todas las cuentas anteriores
- [ ] Códigos de recuperación guardados en la bóveda compartida

## Acceso a lo existente

- [ ] Usuario administrador del WordPress actual
- [ ] Acceso al panel del hosting actual (cPanel, SFTP o el que sea)
- [ ] Acceso al registrador del dominio `forum-foundation.org`
- [ ] Confirmado dónde apuntan hoy los nameservers
- [ ] Acceso a la carpeta de Google Drive con los informes anuales
- [ ] Acceso a la cuenta de Anchor/Spotify del podcast

## Levantamiento de contenido (paralelo, no bloquea código)

- [ ] Inventario completo de artículos del WordPress actual (título, URL, fecha real, imágenes, idioma)
- [ ] Informes anuales descargados de Google Drive (2021, 2022 y los que existan)
- [ ] Episodios del podcast descargados de Anchor
- [ ] Biblioteca de medios de WordPress exportada en resolución original

## Legal y consentimientos

- [ ] Formulario de consentimiento redactado — ver [docs/fase-0/consentimiento.md](consentimiento.md)
- [ ] Validado contra la Ley 81 de 2019 por asesoría legal panameña
- [ ] Recolección de firmas de becarios **iniciada** — punto crítico del cronograma
- [ ] Procedimiento de consentimiento de acudientes definido
- [ ] Material educativo existente auditado (qué se puede publicar y bajo qué licencia)

## Criterio de cierre de Fase 0

Existe una hoja de cálculo con comunidades y coordenadas (ver [plantillas/](plantillas/)), un inventario de artículos, y al menos un consentimiento firmado que sirva de modelo.

---

*Actualizar las casillas conforme se completen — reflejar el estado real en [docs/plan.md](../plan.md) cuando se cierre toda la fase.*
