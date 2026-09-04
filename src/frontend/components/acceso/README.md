# FASE 2 · FRONTEND · El formulario de entrada

> **Creada en:** Fase 2 · **Estado actual:** en uso

| Componente             | Qué es                                   |
| ---------------------- | ---------------------------------------- |
| `FormularioAcceso.tsx` | Correo, contraseña y el mensaje de error |

Lleva `"use client"` porque necesita estado: mostrar el error del servidor y
deshabilitar el botón mientras se comprueba. Sin eso, un usuario impaciente
pulsa "Entrar" cinco veces y lanza cinco intentos.

**No habla con Supabase.** Recibe la Server Action por prop y se limita a
colocarla en el `<form>`. La regla de arquitectura lo impediría igualmente:
ESLint no le deja importar nada de `src/backend/`.
