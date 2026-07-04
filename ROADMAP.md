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
  - [ ] **A1 fase 2: corte al hormigón (17.7)** — breakout de corte hacia el borde
    y pryout, usando el reparto de corte de `nShear` y las distancias al borde del
    pedestal. Considerar también armadura de anclaje (anchor reinforcement) como
    opción que reemplaza al cono.
- [ ] **A2. Memoria de cálculo imprimible (placa base)** — los `CheckResult` ya traen
  demanda/capacidad/ratio y el detalle de cada fórmula; una vista print-friendly
  (print CSS) convierte cada corrida en una memoria entregable que cita la nota
  teórica como referencia.
- [ ] **A3. Barrido SAP2000 en la zapata biaxial** — replicar el patrón de
  `SapSweepPanel` de placa base: pegar la tabla Joint Reactions y correr el surrogate
  sobre todas las combinaciones de todos los apoyos. El parseo ya existe
  (`src/lib/sapReactions.ts`).
- [ ] **A4. Siguiente sub-tool de SAP Scripts** — agregar la próxima herramienta del
  catálogo (`src/lib/sap-scripts/catalog.ts`) vendoreando desde Skills_SAP, con
  `modelo-base` como referencia de implementación.

## B. Posts

- [ ] **B1. Ejemplo trabajado de placa base** — el mismo caso resuelto a mano con la
  DG1 clásica (bloque rectangular, excentricidad grande) y con la herramienta,
  mostrando dónde y por qué difieren. Cierra el triángulo teoría–herramienta–práctica.
- [ ] **B2. Esquema opcional pendiente (post 3, experimento fundaciones)** — diagrama
  del diseño del barrido en dos niveles (LHS sobre el espacio adimensional × barrido
  de e/B por geometría). Prioridad baja: las tablas ya lo cuentan.

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
