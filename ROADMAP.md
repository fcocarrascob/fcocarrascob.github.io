# Roadmap / Brainstorming

Ideas discutidas para futuras sesiones (2026-07-03). Marcar estado al avanzar:
`[ ]` pendiente · `[~]` en curso · `[x]` hecho.

## A. Mejoras a herramientas

- [x] **A1. Placa base + anclaje al hormigón (ACI 318 Cap. 17) — fase 1 (tracción)**
  (hecho 2026-07-03): `src/lib/placaBaseAnchorage.ts` verifica breakout del grupo
  traccionado con ψec/ψed (17.6.2), pullout con tuerca hex. pesada (17.6.3) y
  side-face blowout con corrección de esquina y grupo por borde (17.6.4); input nuevo
  `h_ef`; sección §5 nueva en la nota teórica. Supuestos: cast-in, fisurado,
  pedestal concéntrico, φ = 0.70.
  - [x] **A1 fase 2: corte al hormigón (17.7) + interacción (17.8)** (hecho
    2026-07-03): breakout de corte hacia el borde por componente con la fila
    delantera tomando toda la componente (17.7.2), pryout con el grupo completo
    (17.7.3) e interacción N/φNn + V/φVn ≤ 1.2 (17.8.3). Secciones §5.4–5.5 en la
    nota. Queda fuera (documentado): armadura de anclaje (17.5.2), anclajes
    post-instalados y llave de corte.
- [x] **A2. Memoria de cálculo imprimible (placa base)** (hecho 2026-07-03): botón
  «Memoria de cálculo» que imprime/guarda como PDF una memoria con cabecera (fecha y
  referencias normativas), datos de entrada, derivados, equilibrio, la tabla completa
  de verificaciones con sus detalles, avisos y la planta con presiones; el resto de
  la página se oculta con `print:hidden`. Además, cada verificación de la tabla
  enlaza a su sección exacta (§n) de la nota teórica.
- [x] **A3. Barrido SAP2000 en la zapata biaxial** (hecho 2026-07-04): panel
  `ZapataSweepPanel` que parsea Joint Reactions (reusa `sapReactions.ts`) y corre el
  surrogate por fila (`zapataBiaxialSweep.ts`), con q_a para ratio/OK, amplificación
  opcional M′ = M + V·(H_ped + T), detección de tracción neta, avisos de envolvente
  por fila (⚠) y «ver caso →» al formulario. La física (pesos → N_tot →
  adimensionales) quedó extraída a `deriveZapata()`/`envelopeWarnings()` en la lib
  pura, compartida por formulario y barrido.
- [ ] **A4. Siguiente sub-tool de SAP Scripts** — agregar la próxima herramienta del
  catálogo (`src/lib/sap-scripts/catalog.ts`) vendoreando desde Skills_SAP, con
  `modelo-base` como referencia de implementación.

## B. Posts

- [x] **B1. Ejemplo trabajado de placa base** (hecho 2026-07-04):
  `src/content/blog/placa-base-ejemplo-trabajado.mdx` — el caso por defecto de la
  herramienta con Mux = 12 tonf·m (e = 30 cm, excentricidad grande) resuelto a mano con
  la DG1 y con la herramienta. Núcleo: mismo equilibrio con distinto brazo de la
  resultante (37.7 vs 34.2 cm → T +51 % en el elástico; flexión de placa +28 % en la
  DG1), y el breakout (Cap. 17) que la DG1 no formula falla con ambos métodos y termina
  gobernando el pedestal. Figura comparativa en `public/placa-base-ejemplo/`.
- [x] **B2. Esquema del diseño del barrido (post 3, experimento fundaciones)** (hecho
  2026-07-04): `public/fundaciones/fig-diseno-barrido.svg` — dos paneles: LHS sobre el
  espacio adimensional (proyección log₁₀ Kr – L/B, transición Kr ≈ 0.5 marcada) y, para
  cada zapata muestreada, el eje de e/B con los 8 niveles, el kern en 1/6 y las
  direcciones θ = 0°/45°; totales del piloto y del barrido completo al pie.

## C. Experimentos SAP2000

Fórmula que funcionó en la serie de fundaciones: *referencia analítica cerrada +
barrido paramétrico adimensional + mapa de error + surrogate + herramienta*.
Ordenados de menor a mayor esfuerzo:

- [ ] **C1. P-Delta: ¿cuándo confiar en 1/(1−θ)?** — pórticos 2D paramétricos
  barriendo el coeficiente de estabilidad θ = P·Δ/(V·h); comparar la amplificación
  de derivas y momentos del análisis P-Delta de SAP contra el amplificador clásico
  1/(1−θ) (y el B₂ de AISC). Modelos de segundos, referencia cerrada exacta;
  entregable: mapa tipo K_r ("hasta qué θ vale el amplificador"). Un post
  autocontenido — buen estreno de la serie sísmica.
- [ ] **C2. Períodos fundamentales: fórmulas aproximadas vs. modal** — barrido de
  pórticos (n pisos, H, distribución de masa/rigidez, acero y hormigón) midiendo T₁
  modal en SAP; validar T ≈ C_t·H^0.75 (NCh433/ASCE 7) y Rayleigh, mapear el error
  según irregularidad vertical. Modal cuesta segundos → dataset grande gratis →
  surrogate de período y forma modal → herramienta "estimador de T₁".
- [ ] **C3. SRSS vs CQC: el error de combinación modal** — estructuras con modos
  acoplados (plantas con excentricidad torsional variable); medir el error de SRSS
  respecto de CQC en función de β = Tᵢ/Tⱼ y el amortiguamiento, validando el
  coeficiente de correlación de Der Kiureghian. La teoría predice exactamente dónde
  SRSS falla (modos cercanos); el barrido lo dibuja.
- [ ] **C4. Estático equivalente vs. modal espectral** — ¿dónde se quiebra el método
  estático? Barrido de altura, setbacks y pisos blandos comparando perfiles de corte
  y deriva; entregable: "mapa de validez del método estático" (NCh433/NCh2369),
  conecta con el generador de espectros del script builder. Cierre de serie:
  surrogate de campo (POD, mismo truco que u_z en fundaciones) que predice el perfil
  de deriva completo desde parámetros adimensionales → herramienta en el navegador.

## Recomendación de orden

1. **A1** (en curso) — cierra la brecha más citada de la herramienta de placa base.
2. **C1** como post corto para estrenar la serie sísmica con victoria rápida.
3. **C2 → C3 → C4** como arco largo, terminando —igual que fundaciones— en un
   surrogate y una herramienta.
4. A2/A3/B1 como intercalados de bajo esfuerzo entre experimentos.
