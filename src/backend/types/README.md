# FASE 3 · BACKEND · La forma exacta de los datos

> **Creada en:** Fase 1 · **Se llena en:** Fase 3 · **Estado actual:** vacío a propósito

Describe qué columnas tiene cada tabla, para que TypeScript avise si escribes
`orden.fehcaCierre` en vez de `orden.fechaCierre`.

Estos tipos **no se escriben a mano: se generan** desde la base de datos real:

```bash
npx supabase gen types typescript --linked > src/backend/types/database.types.ts
```

Escribirlos a mano garantiza que un día alguien añada una columna en SQL, se
olvide del fichero `.ts`, y el fallo aparezca en producción delante de un
técnico. Generándolos, el esquema SQL es la única verdad.
