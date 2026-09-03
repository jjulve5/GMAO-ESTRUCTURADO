# FASE 2 · FRONTEND · Trozos de lógica de pantalla reutilizables

> **Creada en:** Fase 1 · **Se llena en:** Fase 2 · **Estado actual:** vacía

Un *hook* es una función de React que encapsula un comportamiento repetido de
la interfaz para no copiarlo y pegarlo en cada componente.

Ejemplos previstos: `useUsuarioActual()` (Fase 2), `useFiltroTabla()` (Fase 5).

**Prohibido aquí:** consultar la base de datos. Un hook puede *llamar* a un
servicio, pero no puede crear un cliente de Supabase por su cuenta.
