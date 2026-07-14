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
- [x] **C5. El exponente 0.4: ¿de dónde sale el (0.05/ξ)^0.4 del amortiguamiento?**
  (hecho 2026-07-12, **post único** `amortiguamiento-exponente.mdx`, figuras en
  `public/amortiguamiento/`) — experimento en `APP_sap2000\amortiguamiento_04\`
  reusando completa la maquinaria de E2: mapa denso 60 T × 8 ξ (480 integraciones) +
  validación SAP (banco elástico, un caso FNA por ξ, 72 puntos a 0.009 % mediana).
  Hallazgos: los extremos van a 1 (la corrección plana es ficción en T corto); en la
  meseta **EC8 abraza el dato** (−9…+4 %) y el ^0.4 sobrecorrige en ξ bajo (+6.6 % en
  el ξ = 3 % industrial, +34 % en 1 %); **rincón inseguro**: ξ = 15–20 % en T ≤ 0.1 s
  → la fórmula entrega 31–37 % menos espectro que lo real (equipos rígidos
  amortiguados). Gotcha nuevo: el dt de salida del TH debe resolver el T más corto
  (≥ 50 ptos/ciclo). Densificación anotada: registros chilenos; gancho a D3 (Rayleigh).
- [ ] **C6. Torsión accidental: ¿cuándo el 5 % de excentricidad cubre?** (decidido
  2026-07-12; **post único autocontenido**) — el sistema de 1 piso torsionalmente
  acoplado tiene solución cerrada exacta (Chopra cap. 13) en dos adimensionales:
  e/r y Ω_θ = ω_torsional/ω_lateral. Barrido de plantas (técnica de tuning con MMI
  de D6, memoria `sap2000-espectral-gotchas`) midiendo amplificación de desplazamiento
  de borde vs planta simétrica + 5 % accidental. Entregable: mapa (e/r, Ω_θ) con la
  frontera "el 5 % ya no cubre". **Sinergia**: el barrido genera gratis los pares de
  modos cercanos que C3 (SRSS vs CQC) necesita — correr ambos como una campaña, dos
  posts independientes.

## E. Serie "El factor R" (hecha 2026-07-09 → 2026-07-12)

Serie de 5 posts (sección Sísmica, `series: "El factor R"`) que mide la descomposición
R = Rμ·Ω₀ del cap. 7 de *Proyectar en Acero: práctica chilena*, con dos experimentos
SAP2000 propios. **OJO numeración**: las carpetas de los experimentos se llaman
internamente C3 (`factor_r_rmu`) y C4 (`factor_r_omega0`) en sus EXPERIMENTO.md — NO
confundir con los C3/C4 de la sección C de este roadmap (SRSS-CQC y estático-modal,
aún pendientes).

- [x] **E1. Post 1 — anatomía** (`factor-r-anatomia.mdx`, 2026-07-09): conceptual, la
  curva pushover con Ve/Vy/Vd, Ec. 1–8, Newmark Cd = R e igual energía, la letra chica
  del detallamiento. 3 SVG a mano en `public/factor-r/` (carpeta compartida de la serie).
- [x] **E2. Post 2 — Rμ medido** (`factor-r-rmu.mdx`, 2026-07-11): experimento
  `APP_sap2000\factor_r_rmu\` — banco de 63 SDOF elastoplásticos (9 T × elástico + 6 R)
  en un solo .sdb/caso FNA bajo El Centro, validado contra integrador Newmark-β propio
  (<0.35 % en 62/63). Igual desplazamiento emerge en T ≥ 0.5 s (mediana δu/δe = 1.01,
  μ ≈ R); quiebre en T cortos peor que igual energía (μ = 126 vs 32.5 en T=0.1/R=8);
  residual 0.3→5 δy. **Gotcha estrella**: SAP sostiene el último valor de la función TH
  (no cero) → cerrar el registro con un 0 explícito.
- [x] **E3. Post 3 — Ω₀ medido** (`factor-r-omega0.mdx`, 2026-07-12): experimento
  `APP_sap2000\factor_r_omega0\` — chevron 3-4-5 diseñado dos veces (M = 100/50 t →
  manda resistencia/esbeltez, mismo HSS5×5×1/4) con espectro NCh2369 R = 3, pushover con
  links MultiLinearPlastic calibrados (acepta rama degradante). **Ω₀ dentro de
  δu = R\*·δd: 1.44 vs 2.90 — el 0.7R = 2.1 flanqueado**; contabilidad multiplicativa
  cierra a 3 decimales; Ω₀×Rμ = R\* exacto sobre la curva; la viga puntal ralentiza la
  redistribución (48EI/L³ verificado). Gotcha: el caso RS corrige el espectro si su
  amortiguamiento difiere del de la función (−10.2 % silencioso).
- [x] **E4. Post 4 — capacidad esperada** (`factor-r-capacidad-esperada.mdx`,
  2026-07-12): equilibrio plástico a mano = pushover en toda la cadena (M viga =
  P·L/4 al 0.00 %, columnas −P/2, anclaje 995 kN); la W16×57 "fuerte" quedaría a 2.2·Mp
  (por capacidad → W27×94, +65 % acero/m) mientras el análisis le pide 0 (0.7R ciego:
  2.1×0 = 0); conexión: Nu 365/151 → 0.7R 766/318 → Tye 1244 (atajo 38/74 % corto).
- [x] **E5. Post 5 — cierre** (`factor-r-cierre.mdx`, 2026-07-12): recap de
  verificaciones + lecciones de método (referencia independiente caza trampas
  silenciosas; sanidad antes de barrer; hipótesis anotadas antes de correr; el
  experimento mínimo enseña más).
- [ ] **E6. Densificaciones anotadas** (opcionales, en los EXPERIMENTO.md): registro
  chileno como 2ª realización del banco Rμ; chevron con la viga real (W16×57 con rótula
  — cambia el mecanismo, ¿cuánto Ω₀ queda?); degradación cíclica del fusible; barrido
  de amortiguamiento.

## D. Técnicas de modelación SAP2000 (posts de verificación)

Formato del post Gap/Hook (`gap-hook-sap2000-puntal-cumbre.mdx`, 2026-07-07): una
técnica de modelación con un pitfall real, validada contra teoría o un chequeo cruzado
en un caso concreto, con la API de SAP2000. No llevan barrido paramétrico ni surrogate
(eso es la serie C) — un modelo, bien elegido, alcanza.

- [x] **D0 (origen del formato). Links Gap y Hook** (hecho 2026-07-07):
  `gap-hook-sap2000-puntal-cumbre.mdx` — Link no lineal Gap/Hook en un puntal de
  respaldo bajo la cumbre de un pórtico; elección Gap vs Hook por el signo, conexión
  con dos links en paralelo (no lineal U1 + Linear rígido en corte), calibración de la
  holgura en el modelo completo. Define el formato de la serie D. SVG + capturas de
  diálogos en `public/gap-hook-sap2000/`.
- [ ] **D1. Zonas rígidas en nudos (End Length Offset + Rigid Zone Factor)** — pórtico
  simple con nudo de ancho finito; comparar centerline puro, offset sin zona rígida y
  offset con zona rígida calibrada contra la rigidez teórica de luz neta. Pitfall:
  dejar el factor en su default y sub/sobreestimar la rigidez.
- [x] **D2. Rótulas plásticas en pushover (Static Nonlinear, hinges ASCE 41/FEMA 356)**
  (hecho 2026-07-13, post `rotulas-pushover-sap2000.mdx`, figuras en
  `public/rotulas-pushover-sap2000/`) — experimento en `APP_sap2000\d2_rotulas_pushover\`:
  pórtico de acero 1 vano/1 piso (W8×31 col / W8×18 viga), rótulas auto FEMA 356 asignadas
  por **DatabaseTables** (el OAPI no tiene `SetHingeAssigns`). Validado contra análisis
  plástico incremental cerrado propio (solver 2D event-to-event): **secuencia de rótulas
  idéntica** y **gap M3-vs-P-M: SAP 15.6 % vs cerrado 15.8 %** (0.2 %). Hallazgos: la
  rótula M3 en columnas con axial **sobre-predice la capacidad 16 % e INVIERTE la secuencia
  de daño** (M3: viga→columna, parece capacity design; P-M real: columna de sotavento
  primero). Reverse-engineering de la rótula FEMA: usa resistencia esperada Fye=Ry·Fy y
  reduce por **PCL de pandeo (no Py)** → más severo que la interacción de libro (memoria
  `sap2000-rotulas-frame-oapi`). Offset absoluto +9 % SAP sobre el ideal = longitud finita
  de rótula (RelDist 0.0375) + 3 % hardening FEMA (residual ±2 %). Control de desplazamiento
  obligatorio (fuerza no cruza la meseta, verificado). Gancho hormigón: diagrama P-M de ACI
  318 (columna RC) — en hormigón la M3 puede errar en ambos sentidos según el balanceado.
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
- [x] **D7. Section Cut en losas y muros: By Group vs By Quad y la convención de
  signos** (hecho 2026-07-09): reescritura completa de un borrador flojo (números
  inventados, un ejemplo físicamente al revés, placeholders). Distinción clave
  verificada en vivo por MCP SAP2000: *By Group* suma **reacciones + cargas nodales**
  del grupo (muro voladizo P=10 tonf, H=3 m → F1=10 cortante basal, M2=30 volcamiento,
  exacto); *By Quadrilateral* suma **fuerzas internas** de los elementos que el plano
  cruza (losa unidireccional q=1, L=6, B=4 → M=18.1 vs qL²B/8=18.0, 0.7 %). Tres
  trampas decodificadas: (1) el momento se reporta respecto al **centroide del grupo**
  por defecto (M=10 vs 30 sin fijar la Result Location); (2) By Group da la **reacción**,
  no el esfuerzo interno (losa: 12 = reacción de apoyo, no el cortante); (3) el **signo
  lo fija el orden de los 4 puntos** (regla mano derecha → eje 1; M2 −18.1 ↔ +18.1 al
  invertir). Firmas OAPI (`SetByGroup`/`SetByQuad`/`SectionCutAnalysis`) obtenidas por
  reverse-engineering — no están en la doc del MCP. Post
  `section-cut-muros-losas-sap2000.mdx`, 4 SVG limpios en
  `public/section-cut-muros-losas-sap2000/`, modelos `sc_wall.sdb` + `sc_slab2.sdb`.
- [x] **D8. Resortes de solo compresión: estabilidad y despegue de una zapata (SAP vs
  cerrado)** (idea del usuario 2026-07-09; hecho 2026-07-12, post
  `zapata-solo-compresion-sap2000.mdx`, figuras en `public/zapata-solo-compresion/`) —
  experimento en `APP_sap2000\d8_solo_compresion\`: zapata rígida 3×2 (grilla 25×17,
  constraint Body) sobre 425 **links Gap de un nudo** (gap = 0, k tributaria), 5 casos
  NL por excentricidad + gemelo lineal. Verificación: qmax a −0.2…−1.5 % de la cerrada
  (c = 3(L/2−e), qmax = 2N/(Bc)), c a ≤ medio espaciamiento, ΣR y resultante EXACTOS.
  **Pitfall cuantificado**: el lineal es exacto hasta el kern y desde ahí subestima
  qmax −6/−16/−49 % (e/L = 0.25/0.30/0.40) con tracción ficticia de hasta −116 kPa y
  equilibrio perfecto (cero alarmas). Firmas API verificadas: SetGap, link 1-nudo
  (AddByPoint mismo nudo, local 1 = +Z), SetBody/SetConstraint, LinkForce("ALL",
  GroupElm). **Cierre teórico-SAP de la serie de Fundaciones.**
- [ ] **D9. Pandeo lineal (Linear Buckling) vs Euler y el factor K** — análisis de
  pandeo lineal en SAP de una columna/pórtico → factor de carga crítica y modo de
  pandeo, validado contra Euler P_cr = π²EI/(KL)² en casos de K conocido (biarticulada
  K=1, voladizo K=2, pórtico con desplazamiento lateral). Valida el **factor de
  longitud efectiva K** que usa AISC Cap. E (nota de acero ya publicada). Pitfall: el
  pandeo lineal ignora imperfecciones e inelasticidad → cuándo NO confiar en P_cr
  (columnas intermedias, gancho a la curva de columna del Cap. E).
- [ ] **D10. Diafragma rígido vs flexible: cómo se reparte el corte a los muros** — un
  nivel con muros de distinta rigidez y excentricidad en planta; el diafragma **rígido**
  reparte por rigidez relativa + torsión, el **flexible** por área tributaria. Validar
  SAP contra el reparto a mano (rigidez-proporcional con el término torsional).
  Pitfall: dejar el default de diafragma equivocado reparte mal el corte (muy común).
  Conecta con el acoplamiento torsional de D6 y con los muros. *Alternativa candidata:*
  arriostramiento **tension-only** (X-bracing donde solo trabaja la diagonal
  traccionada), gancho directo a los Links de D0.
- [x] **D11. Vectores Ritz (LDR) vs Eigen: la masa que no capturas** (hecho 2026-07-14,
  post `ritz-vs-eigen-masa-participativa-sap2000.mdx`, figuras en
  `public/ritz-vs-eigen-masa-participativa-sap2000/`) — experimento en
  `APP_sap2000\d11_ritz_eigen\`: marco plano 8 pisos (shear building: diafragma + RY
  restringido en columnas) con pisos flexibles simplemente apoyados cargando equipos
  pesados → modos de rebote vertical (T≈0.90 s) más bajos que los laterales. **Hallazgos**:
  Eigen entierra el 1.er modo lateral (85.6 % UX) en el **modo 9** tras 8 verticales de
  0 % UX; 90 % UX a los **18 modos**, 99 % a los 29. **Ritz (Accel UX)**: 90 % en **2**
  vectores, 100 % en **8** (reproduce exacto los 8 laterales, salta los 32 verticales,
  SumUz=0). **Corte basal NCh2369**: Eigen-8 = **0 tonf** (todo vertical), Eigen-40 =
  Ritz-8 = 130.06 tonf idénticos. **Gotcha de Ritz**: solo-UX da 0 % UZ; UX+UZ (16 vec)
  da 100%UX+97%UZ vs Eigen-40 68%UZ. Sanity T₁ shear-building c/deformación por corte =
  0.5293 s = SAP (0.0 %). Firmas verificadas: `ModalRitz.SetLoads`, `FuncRS.SetUser`,
  `ResponseSpectrum.SetLoads`; gotchas `Analyze.GetCaseStatus()` sin nombre y
  `ModalParticipatingMassRatios` no filtra por caso (particionar por `LoadCase`). Idea de
  Francisco 2026-07-14 (con el aporte de usar `SetActiveDOF` plano XZ, no restringir nudos).
  Original:
  frecuencia parásitos (candidato: la torre de traspaso de D6 con un apéndice rígido, o
  una losa/marco con un tramo muy rígido). **Pitfall**: con Eigen (default) se gastan
  vectores en modos locales inútiles y no se alcanza el 90 % de masa participativa
  (NCh433/NCh2369) ni con 20–30 modos; con **vectores Ritz dependientes de la carga**
  (LDR, arrancados desde el patrón de aceleración) se captura ~99 % de masa con una
  fracción de los vectores — y son los que además exige la FNA (E2/C5). **Validación
  cerrada**: corrección de masa faltante (*missing mass / residual rigid response*) — la
  masa no capturada responde estáticamente con la aceleración de piso rígido (ZPA), así
  que el corte basal exacto = M_tot·Sa(rígido) al sumar modos + residual; se compara base
  shear Eigen (incompleto) vs Ritz vs el estático cerrado. **API**: caso modal Eigen vs
  Ritz (`SetCase`/`SetLoads` del modal Ritz), `SetNumberModes`, lectura de *Modal
  Participating Mass Ratios*. Reutiliza la maquinaria modal de D6. Ganchos: C2 (períodos),
  D6 (espectral modo a modo), C3 (SRSS/CQC).
- [ ] **D12. No linealidad geométrica: cables y catenaria** (idea del usuario
  2026-07-14) — cable simple bajo peso propio entre dos apoyos (o mástil guyado con 3
  tirantes pretensados); relevante a estructuras industriales/mineras (arriostres de
  mástiles guyados, galerías de correa colgadas, tirantes). **Pitfall doble**: (1) el
  análisis **lineal de un cable es singular** — sin rigidez transversal hasta estar
  tensado; hay que activar **P-Delta + grandes desplazamientos** y una pretensión /
  target-force para arrancar; (2) modelar el cable como *frame* con releases en vez de
  elemento **Cable** subestima el sag y la tensión (converge a algo equivocado, error
  silencioso). **Validación cerrada**: catenaria exacta — flecha, tensión horizontal H y
  máxima $T = H\cosh(wx/H)$, con la transición parábola↔catenaria según sag/luz. **API**:
  objeto Cable, caso NonLinear con geometric nonlinearity (large displacement), carga
  inicial de tensión (target-force). Ganchos: D0 (links no lineales), C1 (P-Delta →
  grandes desplazamientos). *Showpiece avanzado — ejecutar después de D11.*

## Recomendación de orden (actualizada 2026-07-14)

Publicado a la fecha: **serie Fundaciones** completa (5 posts, jun 2026); A1–A3, B1–B2;
**C1 y C2 completos** (serie Sísmica partes 1–3 con el estimador de T₁); **serie D
técnica** con Gap/Hook (D0), Rótulas pushover (D2), Respuesta espectral (D6), Section Cut
(D7) y Solo-compresión (D8); **serie "El factor R" completa** (E1–E5: 5 posts + 2
experimentos, jul 2026). Lo que sigue:

1. ~~**D11 (Ritz vs Eigen)**~~ — ✅ hecho 2026-07-14 (post publicado).
2. **D12 (cables / no linealidad geométrica)** — showpiece avanzado, **próximo paso activo**.
3. **C3 → C4** como cierre del arco sísmico: C3 ya tiene su teaser cuantitativo desde D6
   (ρ=0.72, gap SRSS-CQC ~12 %); C4 reutiliza el modal de C2 (piso blando ×1.6–1.9) y el
   espectral de C3, conecta con el generador de espectros y termina en el surrogate de
   campo (POD del perfil de deriva).
4. **D9 / D10** (pandeo lineal, diafragma rígido vs flexible) como intercalados técnicos
   de un modelo entre experimentos; **A4** (sub-tool SAP Scripts) cuando convenga algo
   mecánico y acotado.
5. **E6 (densificaciones del factor R)** y **densificación de C1** (fase 5) solo si otro
   experimento las pide; si no, se dejan caer.
