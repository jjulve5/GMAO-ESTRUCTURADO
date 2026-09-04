# FASE 2 · MIXTO (Frontend + Backend) · Lo único visible sin sesión

> **Creada en:** Fase 2 · **Se llena en:** Fase 2 · **Estado actual:** solo el acceso

## Qué hay dentro

| Ruta      | Fichero           |
| --------- | ----------------- |
| `/acceso` | `acceso/page.tsx` |

Es la única pantalla del GMAO que se puede ver sin haber entrado. Todo lo demás
está en `(privado)`.

## Qué NO hace esta pantalla, y es intencionado

**No comprueba si ya hay sesión.** De eso se ocupa `src/proxy.ts`, que se
ejecuta antes y manda a la portada a quien ya haya entrado. Repetir aquí la
comprobación sería duplicar una regla en dos sitios que algún día discreparían.

## El parámetro `?volver=`

Cuando el proxy echa a alguien de una ruta privada, guarda a dónde quería ir en
`?volver=/usuarios`, y tras entrar se le devuelve allí en lugar de dejarle
siempre en la portada.

Ese valor **se valida antes de usarlo** (ver `destinoSeguro` en `acciones.ts`):
solo se admiten rutas internas. Sin esa comprobación, un enlace como
`/acceso?volver=https://sitio-falso.com` mostraría el dominio correcto de la
empresa, recogería credenciales reales y luego llevaría a una copia del GMAO
controlada por otro. Es una redirección abierta, y una técnica de phishing
habitual.
