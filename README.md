# GMAO — Gestor de Mantenimiento Asistido por Ordenador

Aplicación web multiusuario (objetivo: ~30 usuarios) para la gestión del
mantenimiento preventivo y correctivo, alimentada con volcados reales de
**SAP PM** (maestro de materiales y recambios, planes preventivos y sus checks).

**Estado actual: Fase 1 — Setup e infraestructura.**

---

## Pila tecnológica

| Pieza | Versión instalada | Para qué |
|---|---|---|
| Next.js (App Router) | 16.3.4 | Framework: rutas, renderizado en servidor, API |
| React | 19.2.8 | Interfaz |
| TypeScript | ^5 (modo `strict`) | Tipado estático |
| Tailwind CSS | ^4 | Estilos |
| ESLint | ^9 | Análisis estático |
| `@supabase/supabase-js` | 2.115.0 | Cliente de base de datos y auth |
| `@supabase/ssr` | 0.12.5 | Sesión vía cookies (servidor + navegador) |
| `supabase` (CLI, dev) | — | Migraciones y generación de tipos |

> `@supabase/auth-helpers-nextjs` está **obsoleto** (marcado como `deprecated`
> en npm). Este proyecto usa `@supabase/ssr`, que es su sustituto oficial.
> Si encuentras un tutorial que use el paquete antiguo, no lo sigas.

---

## Arquitectura: separación de responsabilidades

La regla que gobierna todo el proyecto:

```
  src/app/  ·  src/components/          →  pintan
        │
        ▼
  src/services/                         →  consultan la base de datos
        │
        ▼
  src/lib/supabase/                     →  configuran la conexión
        │
        ▼
  Supabase / PostgreSQL
```

- **Ningún** componente ni página contiene `supabase.from(...)`.
- **Ninguna** consulta a la base de datos vive fuera de `src/services/`.
- **Ninguna** lectura de `process.env` vive fuera de `src/lib/env.ts`.

Cada carpeta tiene su propio `README.md` explicando qué va dentro y por qué.

---

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
#    → rellena los valores desde: panel Supabase → Project Settings → API

# 3. Servidor de desarrollo
npm run dev            # http://localhost:3000
```

### Comandos disponibles

```bash
npm run dev        # desarrollo con recarga en caliente
npm run build      # compilación de producción
npm run start      # sirve la compilación de producción
npm run lint       # ESLint
npm run typecheck  # comprueba los tipos sin generar ficheros
```

> En la Fase 1 la aplicación arranca **sin** `.env.local`: la página de inicio
> no toca Supabase a propósito. La configuración pasará a ser obligatoria en la
> Fase 2, cuando exista el login.

---

## Plan de fases

| # | Fase | Estado |
|---|---|---|
| 1 | Setup e infraestructura | ✅ hecho |
| 2 | Autenticación y roles de usuario (Admin, Técnico…) | ⏭️ siguiente |
| 3 | Base de datos core (esquemas SQL preparados para volcado SAP) | ⬜ |
| 4 | Planes preventivos (cronogramas y checks) | ⬜ |
| 5 | Asignación y ejecución de tareas | ⬜ |
| 6 | Recambios (stock por códigos SAP) | ⬜ |
| 7 | Reportes y notificaciones (comparativas diarias) | ⬜ |

---

## Reglas de trabajo del proyecto

1. **Separación de responsabilidades.** Base de datos en `/services`,
   configuración en `/lib`, interfaz en `/components`. Sin mezclas.
2. **Nada se reescribe sin permiso.** Si una fase necesita tocar código o
   esquemas de una fase anterior, se para, se explica el motivo técnico y se
   pide aprobación explícita antes de generar código.
3. **Datos reales, no inventados.** La base de datos se alimenta de volcados
   de SAP PM. Los esquemas SQL se diseñan para facilitar esa importación.
4. **El árbol de carpetas se revisa** en cada fase que cree carpetas o ficheros.
5. **Código documentado en español**, comentado por bloques lógicos: qué hace y
   por qué está estructurado así.
