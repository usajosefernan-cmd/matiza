# 📊 Sistema de Infografías SVG Autogeneradas (Fase 08)

El diseño y visualización didáctica ("como para tontos") se apoya en un generador dinámico de diagramas vectoriales SVG. Cada artículo publicado cuenta con su propio gráfico SVG insertado nativamente en el HTML, compartiendo una estructura y estilo visual consistente en todo el portal.

---

## 1. Reglas Visuales y Estilo Cyberpunk Premium
Para garantizar la coherencia gráfica de Matiza, la IA debe generar el código SVG siguiendo estrictamente los colores neón corporativos calibrados:

*   **Fondo General**: `rgba(7, 9, 19, 0.45)` (Fondo oscuro cyberpunk integrado).
*   **Nodo Claim (Izquierda)**: Borde rosa `#ff007f` y fondo translúcido.
*   **Nodo Contraste (Centro)**: Borde amarillo/ámbar `#ffb703` o morado `#9d4edd`.
*   **Nodo Hechos (Derecha)**: Borde verde menta `#00f0ff` o `#00f5d4` (Datos del Estado).
*   **Tipografía**: `sans-serif` o `system-ui`.
*   **Efectos**: Sombras y brillos a través de filtros SVG básicos o bordes finos de neón (`stroke-width="1.5"`).

---

## 2. Plantilla y Estructura del Diagrama Flujo SVG
El gráfico debe medir `800px` de ancho por `240px` de alto (`viewBox="0 0 800 240"`). A continuación se muestra la estructura modular del flujo de contraste de datos:

```xml
<svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Conexiones / Flechas de neón punteadas -->
  <line x1="200" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="4,4" />
  <line x1="500" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="4,4" />

  <!-- NODO 1: AFIRMACIÓN VIRAL DETECTADA (Izquierda) -->
  <rect x="20" y="40" width="180" height="160" rx="8" fill="rgba(255,0,127,0.03)" stroke="#ff007f" stroke-width="1.5" />
  <text x="110" y="80" fill="#ff007f" font-size="12" font-weight="900" text-anchor="middle">AFIRMACIÓN VIRAL</text>
  <!-- Texto dinámico del claim truncado -->
  <text x="110" y="120" fill="#ffffff" font-size="11" text-anchor="middle">"La vivienda está disparada"</text>
  <text x="110" y="140" fill="#ffffff" font-size="11" text-anchor="middle">e impuestos altos.</text>

  <!-- NODO 2: PROCESADO Y VEREDICTO DEONTOLÓGICO (Centro) -->
  <rect x="300" y="40" width="200" height="160" rx="8" fill="rgba(255,183,3,0.03)" stroke="#ffb703" stroke-width="1.5" />
  <text x="400" y="80" fill="#ffb703" font-size="12" font-weight="900" text-anchor="middle">VEREDICTO EDITORIAL</text>
  <!-- Veredicto dinámico -->
  <text x="400" y="125" fill="#ffffff" font-size="15" font-weight="900" text-anchor="middle">FALTA CONTEXTO</text>
  <text x="400" y="150" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="middle">Análisis Deontológico FAPE</text>

  <!-- NODO 3: FUENTES REGULADORAS DE ESPAÑA (Derecha) -->
  <rect x="600" y="40" width="180" height="160" rx="8" fill="rgba(0,240,255,0.03)" stroke="#00f0ff" stroke-width="1.5" />
  <text x="690" y="80" fill="#00f0ff" font-size="12" font-weight="900" text-anchor="middle">REGISTRO OFICIAL</text>
  <!-- Organismos dinámicos del Estado desmentidores -->
  <text x="690" y="120" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">INE (Datos IPV)</text>
  <text x="690" y="140" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">EPA (Empleo Joven)</text>
</svg>
```

---

## 3. Directiva de Generación para LLMs (Prompting Seguro)
Para evitar que el código generado rompa la serialización JSON del pipeline, se le indica a la IA:
*   Utilizar comillas simples para todos los atributos del SVG (por ejemplo, `viewBox='0 0 800 240'`).
*   No inyectar etiquetas o scripts externos.
*   Retornar únicamente el tag `<svg>` y sus elementos descendientes limpios.
*   Mantener el ancho adaptativo para dispositivos móviles a través de CSS nativo.
