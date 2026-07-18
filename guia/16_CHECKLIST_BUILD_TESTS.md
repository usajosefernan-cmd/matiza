# CHECKLIST GENERAL DE BUILD, TEST Y SEGURIDAD

## Antes de tocar código

```text
- Leer fase actual.
- Confirmar archivos permitidos.
- Confirmar archivos prohibidos.
- Hacer plan breve.
- Si el cambio excede la fase, parar y preguntar.
```

## Después de tocar código

Ejecutar:

```bash
npm run build
```

Si existen:

```bash
npm run test
npm run lint
```

Probar scripts si aplica:

```bash
node scripts/matiza-engine/run-daily.js --dry-run
node scripts/matiza-engine/run-hourly.js --dry-run
node scripts/matiza-engine/run-manual-item.js --dry-run --text "claim de prueba"
```

## Entrega obligatoria de Antigravity

```text
FASE COMPLETADA: [número y nombre]

Archivos tocados:
- ...

Qué cambió:
- ...

Qué NO se tocó:
- ...

Comandos ejecutados:
- ...

Resultado:
- build: OK/ERROR
- test: OK/ERROR/no existe
- dry-run: OK/ERROR/no aplica

Riesgos:
- ...

Siguiente fase recomendada:
- ...

STOP: no avanzo sin aprobación.
```

## Señales de peligro

Antigravity debe parar si necesita:

```text
- tocar muchas rutas públicas,
- cambiar arquitectura completa,
- borrar datos,
- cambiar provider de IA,
- instalar paquetes grandes,
- modificar deploy,
- activar crons,
- publicar contenido real,
- reescribir admin entero,
- tocar auth/permisos.
```

## Criterio de estabilidad

La fase solo está aceptada si:

```text
- compila,
- no rompe la web visible salvo fase de UX aprobada,
- no publica nada automático,
- deja logs o documentación,
- se puede revertir mentalmente por archivos tocados,
- respeta STOP gate.
```
