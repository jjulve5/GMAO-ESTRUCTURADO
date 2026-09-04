# FASE 2 · FRONTEND · Alta y gestión de personas

> **Creada en:** Fase 2 · **Estado actual:** en uso

| Componente                  | Cliente | Por qué                                                                                             |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `FormularioAltaUsuario.tsx` | sí      | Necesita estado: el generador de contraseña y el mensaje de resultado                               |
| `TablaUsuarios.tsx`         | **no**  | Sus dos controles son formularios que envían Server Actions; no necesita JavaScript en el navegador |

Esa diferencia es la regla general: solo se marca `"use client"` lo que de
verdad necesita estado o eventos. Todo lo demás se renderiza en el servidor y
no añade peso al navegador.

## El generador de contraseña

Usa `crypto.getRandomValues`, el generador criptográfico del navegador, y
**nunca `Math.random()`**, que es predecible y no debe usarse para nada
relacionado con credenciales.

Es una medida provisional: lo correcto es que la persona cambie la contraseña
en su primer acceso. Esa pantalla todavía no existe y está anotada como
pendiente en `docs/pdca.md`.
