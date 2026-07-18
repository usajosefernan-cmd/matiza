# PROMPT INICIAL PARA ANTIGRAVITY

Pega este prompt cuando dejes la carpeta `guia/` dentro del repo.

```text
MODO SWARM LOOP ENGINEERING — MATIZA

He dejado una carpeta llamada /guia dentro del repo.

Primero lee:
- guia/00_LEEME_PRIMERO.md
- guia/01_REGLAS_GLOBALES.md
- guia/02_MASTER_MATIZA.md
- guia/03_FASE_0_AUDITORIA.md

Contexto:
MATIZA debe evolucionar sin romper la web actual.
La carpeta también contiene MATIZA Live Agentic, pero NO debe implementarse durante la Fase 0.
No quiero un megaprompt ejecutado de golpe.
Quiero fases cerradas con STOP GATES.

Reglas obligatorias:
1. Ejecuta solo la fase que te indique.
2. No avances a la siguiente fase sin mi aprobación.
3. Antes de tocar código, explica plan y archivos afectados.
4. Después de tocar código, ejecuta build/test si existen.
5. Al terminar, entrega:
   - archivos tocados,
   - qué cambió,
   - qué NO tocaste,
   - riesgos,
   - comandos ejecutados,
   - siguiente fase recomendada.
6. Si una fase requiere tocar más de lo previsto, paras y preguntas.
7. No rehagas la web.
8. No cambies diseño público salvo que la fase lo pida.
9. No metas lógica compleja en admin.
10. No publiques automático.
11. No actives crons.
12. No borres datos.

FASE ACTUAL: 0 — AUDITORÍA

Objetivo:
Auditar el repo sin modificar archivos.

Tareas:
- Detecta framework y estructura.
- Localiza motor actual de noticias.
- Localiza admin actual.
- Localiza scripts/crons existentes.
- Localiza rutas públicas.
- Detecta dónde encajaría /scripts/matiza-engine/.
- Detecta riesgos de romper la web.
- Propón fases de implementación.

PROHIBIDO:
- modificar archivos,
- instalar paquetes,
- cambiar configuración,
- crear rutas,
- tocar diseño,
- activar crons,
- hacer deploy.

Entrega solo informe.
PARA al terminar.
```
