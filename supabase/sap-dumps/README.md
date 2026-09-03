# FASE 3 · BACKEND · Los volcados reales exportados de SAP PM

> **Creada en:** Fase 1 · **Se llena en:** Fase 3 · **Estado actual:** vacía

Los ficheros tal y como salen de SAP, sin transformar. Alcance acordado
(decisión D-004): **mantenimiento preventivo y recambios sí; datos de empresa
no, por ahora**.

Se guardan en crudo por dos motivos:

1. Sirven de referencia para diseñar el esquema SQL de la Fase 3: nuestras
   columnas se ajustarán a lo que el volcado realmente trae.
2. Permiten repetir una importación desde cero si se detecta un error de
   transformación, sin pedir otra exportación a SAP.

> ⚠ Antes de subir un fichero aquí, decide si puede vivir en el repositorio o
> debe quedarse fuera mediante `.gitignore`.
