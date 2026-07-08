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

- [x] **C1. P-Delta: ¿cuándo confiar en 1/(1−θ)?** (hecho 2026-07-04) — experimento
  completo en `APP_sap2000\pdelta_amplificador\` (fases 0–4 en un día): 294 pórticos,
  17 136 mediciones, 0 errores, validado contra dos límites cerrados (<1 %). Post
  `pdelta-cuando-confiar-amplificador.mdx` (estreno serie Sísmica) con 4 figuras PNG +
  SVG del modelo en `public/pdelta/`. Hallazgos: el error del clásico tiene forma de U
  sobre ρ (P-δ en viga rígida ≈ voladizo ≈ +7 % en θ=0.25); el eje dominante es f_lean
  (dónde baja la gravedad) y el R_M de AISC es exactamente esa corrección (B₂ deja
  +1.0 % donde el clásico pierde +5.6 %); frontera θ_lim(5 %) = 0.10–0.25 según ρ/n,
  con B₂ 0.30–0.50 salvo el rincón flexural alto. Densificación pendiente (opcional,
  fase 5): flexibilidad axial de columnas, grandes desplazamientos, patrón uniforme.
- [x] **C2. Períodos fundamentales: fórmulas aproximadas vs. modal** — barrido de
  pórticos (n pisos, H, distribución de masa/rigidez, acero y hormigón) midiendo T₁
  modal en SAP; validar T ≈ C_t·H^0.75 (NCh433/ASCE 7) y Rayleigh, mapear el error
  según irregularidad vertical. Modal cuesta segundos → dataset grande gratis →
  surrogate de período y forma modal → herramienta "estimador de T₁".
  - Fases 0–4 hechas (2026-07-05), fuente de verdad en
    `APP_sap2000\periodos_fundamentales\EXPERIMENTO.md`: 840/840 geometrías, 0
    errores, anclas cerradas a <0.05 %. Post publicado:
    `periodos-fundamentales-exponente.mdx` (serie Sísmica, parte 2, figuras en
    `public/periodos/`). Veredictos: el exponente de T–H es del régimen de diseño
    (x = 0.44 con c cte, 0.88 con c∝1/T, casi inmune a ρ e irregularidad — el 0.75
    queda entre regímenes); Rayleigh ≤ 0.06 % regular / ≤ 1.6 % irregular; mr₁ =
    73–85 % siempre (el 61 % es del muro puro); piso blando concentra deriva modo 1
    ×1.6–1.9 (gancho a C4).
  - Fase 5 hecha (2026-07-05): herramienta `/herramientas/estimador-t1` (tablas
    exactas interpoladas + factorial de irregularidades — la hipótesis
    multiplicativa se rechazó: interacciones de hasta 22 %; fórmula de bolsillo
    mediana 3.5 %) + post 3 `estimador-t1.mdx`. **C2 completo** — la fórmula
    entera de la serie (mapa + surrogate + herramienta) por primera vez en
    sísmica.
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

## D. Técnicas de modelación SAP2000 (posts de verificación)

Formato del post Gap/Hook (`gap-hook-sap2000-puntal-cumbre.mdx`, 2026-07-07): una
técnica de modelación con un pitfall real, validada contra teoría o un chequeo cruzado
en un caso concreto, con la API de SAP2000. No llevan barrido paramétrico ni surrogate
(eso es la serie C) — un modelo, bien elegido, alcanza.

- [ ] **D1. Zonas rígidas en nudos (End Length Offset + Rigid Zone Factor)** — pórtico
  simple con nudo de ancho finito; comparar centerline puro, offset sin zona rígida y
  offset con zona rígida calibrada contra la rigidez teórica de luz neta. Pitfall:
  dejar el factor en su default y sub/sobreestimar la rigidez.
- [ ] **D2. Rótulas plásticas en pushover (Static Nonlinear, hinges ASCE 41/FEMA 356)**
  — pórtico o columna en voladizo con mecanismo de colapso calculable a mano (My,
  secuencia de fluencia, carga de mecanismo); validar que la curva de capacidad y el
  orden de aparición de rótulas coinciden. Gancho a la serie de hormigón (ACI 318) con
  interacción P-M real en vez de M3 puro.
- [ ] **D3. Amortiguamiento de Rayleigh en Time History (α, β vs. decaimiento libre)**
  — impulso en un modelo simple (Direct Integration), medir el decremento logarítmico
  de la vibración libre y compararlo contra el ξ objetivo. Pitfall: calibrar α, β en
  solo dos frecuencias y dejar el resto de los modos mal amortiguados.
- [ ] **D4. Aislación sísmica (Link Isolator — Friction Pendulum / Rubber Isolator)** —
  edificio aislado vs. base fija; validar T_eff y ξ_eff medidos en el loop de
  histéresis contra la fórmula cerrada de ASCE 7 Cap. 17, y el corte basal reducido
  contra el espectro con ese amortiguamiento.
- [ ] **D5. Muros agrietados con Layered Shell (material no lineal por capas)** — muro
  con `Layered Shell` y backbone de hormigón no lineal, midiendo rigidez secante bajo
  carga lateral creciente; validar contra los factores de ACI 318 Tabla 6.6.3.1.1(a)
  (0.35 Ig fisurado, 0.70 Ig no fisurado) y ver dónde se desvían (axial bajo, muros
  esbeltos). Conecta con la serie de hormigón ya publicada.
- [x] **D6. Cómo arma SAP2000 la respuesta espectral modo a modo (Response Spectrum
  Modal Information)** (hecho 2026-07-08): torre de traspaso minera 3D (6×4 m, 4
  niveles) con arriostramiento asimétrico a propósito (3 de 4 caras, la de ingreso de
  correa sin diagonal) para generar acoplamiento torsión-traslación real — modo 1
  (T=0.859 s) mezcla 55.5 % X con 26.8 % torsión, modo 3 (T=0.398 s) es más torsional
  (56.4 %) que traslacional (29.2 %). Espectro NCh2369 reutilizando
  `nch2369-spectrum.ts` (mismo módulo del SAP Script Builder) vía `Func.FuncRS.SetUser`.
  Verificado a mano: Amplitudᵢ = Γᵢ·S_a(Tᵢ)/ωᵢ² (Γᵢ = `UX`/`ModalMass` de *Modal
  Participation Factors*) coincide con `U1Amp` a 0.2 % en 4 modos; corte basal
  reconstruido modo a modo (`Ux`·M_tot·Sa) combinado por SRSS y CQC (Der Kiureghian,
  ξ=3 %) coincide con *Base Reactions* a 0.5 %, con CQC 0.57 % por sobre SRSS (ρᵢⱼ
  máximo 3.8 %, entre modos 2-3) — gancho cuantitativo directo a C3. Post
  `respuesta-espectral-modal-torre-traspaso.mdx`, figuras SVG en
  `public/respuesta-espectral-modal-torre-traspaso/`.
  - **Reescritura didáctica (2026-07-08, misma sesión de estreno)**: se reforzó al
    nivel del post Gap/Hook. Tesis de apertura (SAP desarma → resuelve 1-GDL →
    recombina); descomposición física de la amplitud (Amplitud = Γ·Sd, oscilador de
    1 GDL) con fig `fig-desacople.svg`; mapeo GUI (columnas *Response Spectrum Modal
    Information* → símbolos); pitfall del **factor de escala del caso RS** (9.80665 en
    metros, no el default 386.089 = g en in/s²). **Dos torres nuevas** (mismo todo
    salvo arriostramiento, fig `fig-tres-torres.svg`): **gemelo simétrico** (4 caras →
    modos puros X/Y/torsión desacoplados, Rz≈0, CQC−SRSS = 0.2 %) y **modos cercanos**
    (2 caras adyacentes → modos 3,4 a 3.7 %, ρ₃₄=0.72, SRSS subestima Vx −6.7 %, Mz
    −12.7 %, reacción de esquina −11.9 % — teaser cuantitativo de C3). **Sección nueva
    de recuperación de signo para fundaciones** (fig `fig-recuperar-signo.svg`):
    Base/Joint Reactions salen como magnitudes ±; técnica del **modo dominante** (el
    signo es sign(Γ) del modo que domina esa respuesta) para obtener reacciones
    firmadas y concurrentes; patrón diagonal de vuelco por la torsión del modo 1;
    caveat de que la dominancia es por-respuesta (el modo 3 torsional domina las
    esquinas, no el modo 1). Datos de las 3 torres corridos en vivo por MCP SAP2000,
    modelos guardados en `Temp/sap2000_scripts/d6_modelA|B|C.sdb`. Model A reproduce
    el post original exacto (SRSS 38.506 / CQC 38.726 tonf, U1Amp 0.028166).

## Recomendación de orden (actualizada 2026-07-05)

Hecho hasta aquí: A1–A3, B1–B2, C1 completo y C2 fases 0–4 (dos posts de la serie
Sísmica publicados). Lo que sigue:

1. ~~C2 fase 5~~ ✅ (2026-07-05) — estimador de T₁ publicado.
2. **A4** como intercalado liviano entre experimentos (mecánico y acotado).
3. **C3 → C4** como cierre del arco: C3 estrena la modelación torsional/espectral
   (referencia cerrada de lujo: el coeficiente de correlación de Der Kiureghian);
   C4 reutiliza el modal de C2 (el piso blando ×1.6–1.9 es su gancho) y el espectral
   de C3, conecta con el generador de espectros y termina en el surrogate de campo
   (POD del perfil de deriva, el truco de u_z de fundaciones).
4. **Densificación de C1** (fase 5 opcional: flexibilidad axial, grandes
   desplazamientos, patrón uniforme) solo si C3/C4 levantan preguntas que la
   necesiten; si no, se deja caer.
