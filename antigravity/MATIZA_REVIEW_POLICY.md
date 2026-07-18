# POLÍTICAS DE REVISIÓN Y CONTROL DE CALIDAD (MATIZA_REVIEW_POLICY)

Todos los artículos y desmentidos redactados por el motor de inteligencia nativa de Antigravity deben quedar estrictamente bloqueados en el estado de moderación `human_review`. 

## 🚫 PROHIBICIÓN ABSOLUTA DE AUTO-PUBLICACIÓN

Queda terminantemente prohibido que el Agente de Antigravity establezca de forma directa la marca de estado `'publicado'` o `'published'` en la base de datos de artículos para desmentidos recién redactados.
El único estado inicial permitido es `'human_review'`.

## ✍️ CRITERIOS DE REVISIÓN HUMANA

Antes de aprobar y pasar un borrador al estado `'publicado'`, un editor o administrador humano debe:
1. **Validación de Fuentes**: Verificar que las fuentes citadas sean reales y los enlaces apunten a los documentos oficiales correctos (BOE, INE, etc.).
2. **Neutralidad de Tono**: Certificar que la redacción sea ecuánime y carezca de expresiones sesgadas o valorativas ajenas a los hechos objetivos del contraste.
3. **Coherencia de Veredicto**: Validar que el veredicto asignado (`bulo`, `verdadero`, `impreciso`, `falta_contexto`) se corresponda de forma lógica con los datos expuestos en el desglose explicativo.
4. **Validación de la Infografía**: Comprobar que los datos clave impresos en el SVG de la infografía representen con fidelidad la información verificada.
