# FASE 0 — AUDITORÍA DEL REPO

## Objetivo

Auditar el repo actual sin modificar archivos. Esta fase es solo lectura.

## Permitido

```text
- Leer estructura del proyecto.
- Detectar framework.
- Localizar rutas públicas.
- Localizar admin.
- Localizar scripts/crons actuales.
- Localizar pipeline IA actual.
- Localizar datos, mocks, Firebase, APIs o backend.
- Detectar riesgos de romper la web.
- Proponer plan de integración.
```

## Prohibido

```text
- Modificar archivos.
- Crear archivos.
- Instalar paquetes.
- Ejecutar migraciones.
- Cambiar configuración.
- Tocar diseño.
- Activar crons.
- Hacer deploy.
```

## Tareas

1. Detectar tecnología:

```text
- Vite, React, Next, Angular, Vue, Firebase, Node, Express, etc.
```

2. Localizar motor actual:

```text
- ai-pipeline.js o equivalente.
- scripts de scraping.
- scripts de generación de noticias.
- uso de APIs IA.
- automatizaciones existentes.
```

3. Localizar admin actual:

```text
- rutas admin,
- componentes admin,
- permisos,
- APIs admin,
- estructura visual.
```

4. Localizar datos:

```text
- JSON locales,
- Firebase,
- Firestore,
- localStorage,
- mocks,
- base de datos.
```

5. Localizar build/deploy:

```text
- package.json,
- scripts npm,
- Firebase/Vercel,
- configuración de hosting.
```

6. Detectar encaje recomendado:

```text
/scripts/matiza-engine/
/config/matiza/
/docs/
/api/admin/...
```

## Entrega obligatoria

Al terminar, entregar informe:

```text
1. Tecnología detectada.
2. Estructura importante del repo.
3. Archivos críticos que NO conviene tocar.
4. Motor actual y problemas.
5. Admin actual y problemas.
6. Dónde encaja Matiza Engine.
7. Riesgos.
8. Plan de fases recomendado.
9. STOP: no avanzar.
```

## Criterio de aceptación

La fase está bien si:

```text
- No se modificó ningún archivo.
- Hay mapa claro del repo.
- Hay propuesta concreta de dónde crear el motor sin romper la web.
- Hay lista de riesgos.
```
