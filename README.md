# GMAO — Gestor de Mantenimiento Asistido por Ordenador

Aplicación web multiusuario (objetivo: ~30 usuarios) para la gestión del
mantenimiento preventivo y correctivo, alimentada con volcados reales de
**SAP PM** (maestro de materiales y recambios, planes preventivos y sus checks).

**Estado actual: Fase 2 — Autenticación y roles.**

---

## Pila tecnológica

| Pieza                   | Versión instalada  | Para qué                                       |
| ----------------------- | ------------------ | ---------------------------------------------- |
| Next.js (App Router)    | 16.3.4             | Framework: rutas, renderizado en servidor, API |
| React                   | 19.2.8             | Interfaz                                       |
| TypeScript              | ^5 (modo `strict`) | Tipado estático                                |
| Tailwind CSS            | ^4                 | Estilos                                        |
| ESLint                  | ^9                 | Análisis estático                              |
| `@supabase/supabase-js` | 2.115.0            | Cliente de base de datos y auth                |
| `@supabase/ssr`         | 0.12.5             | Sesión vía cookies (servidor + navegador)      |
| `supabase` (CLI, dev)   | —                  | Migraciones y generación de tipos              |

> `@supabase/auth-helpers-nextjs` está **obsoleto** (marcado como `deprecated`
> en npm). Este proyecto usa `@supabase/ssr`, que es su sustituto oficial.
> Si encuentras un tutorial que use el paquete antiguo, no lo sigas.

---

## Arquitectura: dónde está cada cosa

El código se parte en dos mitades con nombres que se entienden sin explicación:

```
src/
├── app/         FASE 1 · MIXTO     rutas y pantallas  (Next.js obliga a que esté aquí)
├── frontend/    FASE 1 · FRONTEND  todo lo que el usuario ve y toca
│   ├── components/ui/       botones, tablas, etiquetas
│   ├── components/layout/   cabecera, menú, pie
│   ├── hooks/               lógica de pantalla reutilizable
│   └── constants.ts         nombre del producto y rutas
└── backend/     FASE 1 · BACKEND   todo lo que toca datos
    ├── config/              variables de entorno y origen SAP
    ├── lib/supabase/        la conexión (navegador y servidor)
    ├── services/            LAS CONSULTAS. Único sitio con supabase.from()
    └── types/               la forma de los datos, generada desde la BD
```

**Cada carpeta lleva su propio `README.md`** con el formato
`FASE X · FRONTEND|BACKEND|MIXTO · qué contiene`. Si te pierdes, ábrelo.

### El recorrido de un dato

```
  src/app/          (pantalla)   ─┐
  src/frontend/     (se ve)      ─┴─►  backend/services/  ──►  backend/lib/supabase/
                                            │                        │
                                       las consultas            la conexión
                                                                     │
                                                                     ▼
                                                        Supabase / PostgreSQL
```

### Las reglas no son una recomendación: las aplica ESLint

`npm run lint` **falla** si incumples cualquiera de estas:

| Regla                                              | Dónde se permite                 |
| -------------------------------------------------- | -------------------------------- |
| Importar `@supabase/ssr` o `@supabase/supabase-js` | solo `src/backend/lib/supabase/` |
| Leer `process.env`                                 | solo `src/backend/config/env.ts` |
| Que `src/frontend/` importe de `src/backend/`      | solo tipos, con `import type`    |

Ese último matiz tiene motivo: los tipos de TypeScript **se borran al
compilar**, así que importarlos no crea ninguna dependencia en el programa que
se ejecuta. Importar una función, sí.

### ¿Por qué `src/app/` no está dentro de `frontend/`?

Porque Next.js no lo permite: las rutas se leen de `app/` o de `src/app/`, y de
ningún otro sitio (documentado en `node_modules/next/dist/docs/`). Además esos
ficheros son genuinamente mixtos: se ejecutan en el servidor y producen el HTML
que llega al navegador. Ver `src/app/README.md` y la decisión D-005.

## Puesta en marcha

### Requisitos

**Node.js 22 o superior.** La versión exacta con la que se construye y verifica
el proyecto está en `.nvmrc`; si usas `nvm`, basta con `nvm use` dentro de la
carpeta. Next 16 declara un mínimo de 20.9, pero fijamos 22 porque es la línea
con la que está probado: pedir menos invita a fallos que solo aparecen en la
máquina de otra persona.

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
npm run dev           # desarrollo con recarga en caliente
npm run build         # compilación de producción
npm run start         # sirve la compilación de producción

npm run lint          # reglas de arquitectura + análisis estático
npm run typecheck     # comprueba los tipos sin generar ficheros
npm run format        # formatea el código (Prettier)
npm run format:check  # comprueba el formato sin tocar nada

npm run verify        # ↑ los cuatro anteriores, en orden.
                      #   Ejecútalo antes de subir código: es exactamente
                      #   lo que hará la CI de GitHub.
```

### Integración continua

`.github/workflows/ci.yml` ejecuta `format:check`, `lint`, `typecheck` y `build`
en cada push y cada pull request, sobre una instalación limpia (`npm ci`).

Esto es lo que hace que las reglas de arquitectura sean **obligatorias** y no
una recomendación: sin CI, un `git push` con las reglas violadas entraría en el
repositorio sin que nadie se enterase.

> **Desde la Fase 2, `.env.local` es obligatorio.** En la Fase 1 la aplicación
> arrancaba sin él porque la portada no tocaba Supabase; ahora toda la
> aplicación está detrás del acceso, así que sin las variables ni siquiera
> compila. El error lo dice con todas las letras y señala este mismo fichero.
>
> Hacen falta las tres: la URL, la clave pública y **la clave secreta**, que
> es la que permite a un supervisor dar de alta usuarios.

---

## Plan de fases

| #   | Fase                                                          | Estado       |
| --- | ------------------------------------------------------------- | ------------ |
| 1   | Setup e infraestructura                                       | ✅ hecho     |
| 2   | Autenticación y roles de usuario (Admin, Técnico…)            | ⏭️ siguiente |
| 3   | Base de datos core (esquemas SQL preparados para volcado SAP) | ⬜           |
| 4   | Planes preventivos (cronogramas y checks)                     | ⬜           |
| 5   | Asignación y ejecución de tareas                              | ⬜           |
| 6   | Recambios (stock por códigos SAP)                             | ⬜           |
| 7   | Reportes y notificaciones (comparativas diarias)              | ⬜           |

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
