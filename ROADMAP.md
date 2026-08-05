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
- [x] ~~**A4. Siguiente sub-tool de SAP Scripts**~~ — **cancelado y retirado el 2026-08-05**
  (ver sección J): la herramienta entera salió del sitio.

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
  `nch2369-spectrum.ts` (hoy en `src/lib/`) vía `Func.FuncRS.SetUser`.
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
- [x] **D13. Pushover paso a paso: pórtico a momento vs. arriostrado concéntrico
  (chevron)** (hecho 2026-07-14; **post autocontenido formato D en clave tutorial**; build
  verde 83 págs, render verificado; 7 capturas GUI de Francisco integradas —incluye montaje
  MF-vs-CBF de rótulas Interacting-P-M3/Moment-M3 vs Axial-P— y post adaptado al estándar
  real de las capturas ASCE 41-17 Table 9-8; detalle en EXPERIMENTO.md §10) —
  experimento en `APP_sap2000\d13_pushover_mf_cbf\`, post
  `pushover-momento-vs-arriostrado-sap2000.mdx`. **Validado**: MF mecanismo sway H_u=305 vs
  SAP 320 (+5%); CBF pandeo AISC E3 Pcr=711=SAP exacto, V_buckle=2·Pcr·cosθ=925 exacto,
  diagonal traccionada nunca fluye, viga chevron M=137=(T−C)·sinθ·L/4 exacto (AISC 341 F2.3).
  Firma nueva: rótula axial de diagonal = tabla `08 - Auto FEMA 356 - Steel Brace`
  (CompType="Steel Brace", sin DOF). A diferencia de D2
  (que caza el pitfall de la rótula M3), este enseña el **flujo completo del pushover de
  punta a punta** y lo usa para **contrastar dos sistemas de acero de física de rótula
  opuesta**: MF (flexión → meseta dúctil) vs. CBF chevron (axial con pandeo → pico-y-caída).
  Misma geometría (1 vano 6 m / 1 piso 3.5 m, W10×49 col / W8×18 viga, A992), dos sistemas
  laterales; diagonales HSS esbeltas (P_cr ≪ T_y). **Referencia cerrada doble**: MF →
  mecanismo sway H_u=(2Mp_col+2Mp_viga)/h; CBF → V_peak=2·P_cr·cosθ (P_cr por AISC E3) +
  desbalance vertical chevron (T_y−0.3P_cr)·sinθ (AISC 341 F2.3). Reusa las rótulas auto
  ASCE 41/FEMA 356 por **DatabaseTables** de D2 (el OAPI no tiene `SetHingeAssigns`),
  extendiéndolas a la **rótula axial de diagonal** (nueva). Entregable extra pedido por
  Francisco: **guion de capturas de la GUI** para que el lector reproduzca el flujo.
  Ganchos: D2 (rótulas/pitfall M3), E3 (chevron/Ω₀), factor R (dúctil vs frágil).

## F. Ejemplos de cálculo (Hormigón y Acero)

Subsección **"Ejemplos de cálculo"** en `/hormigon` y `/acero` (elegida sobre mezclar con
notas o blog): ejemplos trabajados paso a paso, con **teoría enlazada, referencia normativa
en cada ecuación, tabla demanda–capacidad**, y —cuando el cálculo lo permite— una
**planilla interactiva en el canvas matemático** (deep-link `?plantilla=<id>`) que reproduce
exactamente los números del post y permite cambiar parámetros + **exportar a PDF** para
memorias de cálculo. Ver memoria `ejemplos-calculo-workflow`.

Convención de columnas: **Post** `[ ]`pend `[~]`curso `[x]`hecho · **Planilla** ✅hecha
◻posible/planeada —n/a · **Audit.** estado de `/auditar` (✅limpio · ⚠️con hallazgos ·
❌bloqueado · —sin auditar; el detalle vive en `AUDIT.md`) · **Verif.** = cómo se comprueba
el cálculo (arnés mathjs / Playwright / a mano). Funciones reutilizables del canvas (en
`worksheet.ts`): `beta1(fc)`, `sqrtfc(fc)`, `phiFlexion(et,ety)` — ampliar con cada ejemplo
nuevo (p.ej. `Pn_euler`, `shearLagU`, áreas de barras).

### F-H. Hormigón — ACI 318-25

| ID | Ejemplo | Cap. | Post | Planilla | Audit. | Verif. |
|----|---------|------|:----:|:--------:|:------:|--------|
| F-H1 | **Viga a flexión + corte** | 9 | [x] | ✅ `viga-flexion-corte` | ⚠️ 2🔵 abiertos (1🟠 2🟡 aplicados 2026-07-23; #4 pide ACI a mano, #5 política) | Playwright + arnés mathjs (canvas ≡ post) ✅ |
| F-H2 | **Viga T** (ancho efectivo 6.3.2.1, M⁺ ala vs M⁻ alma, la T "verdadera") | 9 / 6 | [x] | ◻ | ✅ 2026-07-25 (1🔴 2🟠 4🟡 2🔵 aplicados) | a mano (Python) ✅ · 2 SVG (sección con los dos signos + barras) · tesis: la misma sección es **dos vigas según el signo** — en positivo a=1.7 cm y la T se calcula rectangular (ε_t=0.076); en negativo el bloque se hunde 15 cm en el alma, gobierna (0.87 vs 0.82) y apilar barras castiga: 6Ø25 saca la sección de controlada por tracción (φ 0.90→0.82, +29 % acero para +13 % capacidad); la T con eje neutro bajo el ala pediría 104.7 cm² (ρ_w=6.5 %) — no existe en pisos · complementa F-H1 |
| F-H3 | **Columna: diagrama de interacción P–M + esbeltez** (barrido del eje neutro, P₀ y tope, balanceado, flexión pura, todas las combinaciones, esbeltez arriostrada) | 10 | [x] | ◻ (P–M pide programa) | ✅ 2026-07-23 (1🟡 2🔵 aplicados) | a mano (Python, iterando c) ✅ · 2 SVG (sección+compatibilidad y diagrama P–M) · tesis: gobierna la combinación sísmica de axial mínimo (0.9D+E), no la de gravedad con axial máximo, porque en la rama baja perder compresión acerca el punto a la frontera |
| F-H4 | Muro de corte a flexocompresión + elementos de borde | 11 | [ ] | ◻ | — | — |
| F-H5 | **Zapata aislada** (dimensionamiento, corte 1-dir con efecto de tamaño, punzonamiento, flexión, desarrollo) | 13 | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (3🟠 aplicados; 10🟡/🔵 abiertos) | a mano (script) ✅ · tesis: el corte 1-dir con λ_s de ACI 318-25 gobierna el canto (no el punzonamiento) · engancha /herramientas/zapata-biaxial |
| F-H6 | **Grupo de anclajes en pedestal** (breakout, pullout, blowout, corte, pryout, interacción) | 17 | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (3🔴 4🟠 aplicados; 6 abiertos) | a mano (port del motor `placaBaseAnchorage.ts`) ✅ · pedestal industrial; tesis: modos individuales holgan pero la interacción N–V gobierna · engancha /herramientas/placa-base + ejemplo B1 |
| F-H7 | **Ménsula / corbel por puntal-tensor** (tirante, puntal, nodos, N_uc, anclaje) | 23 / 16.5 | [x] | ◻ | ✅ 2026-07-25 (1🟠 5🟡 3🔵 aplicados) | a mano (Python) ✅ · 2 SVG (geometría+modelo STM y barras de usos) · estrena Cap. 23 · tesis: con a_v/d=0.375 no hay flexión ni corte — hay un triángulo; gobierna el **tirante** (0.91, dúctil) con el puntal detrás (0.86), la jerarquía que el STM busca; N_uc=0.2V_u es **un tercio del tirante** (olvidarla = acero 32 % corto); el cierre es el anclaje (horquilla 16.5.6.3) · engancha F-A4 (recibe la carrilera) |
| F-H8 | **Cabezal de 9 pilotes por puntal-tensor** (recibe el cabezal de la nota 16 de Geotecnia) | 23 / 13.4 | [ ] | ◻ | — | **próximo** — ver «Los tres próximos ejemplos» |
| F-H9 | Longitud de desarrollo y empalme | 25 | [ ] | ◻ | — | |
| F-H10 | **Losa unidireccional continua** (espesor por deflexión, coeficientes 6.5.2, mínimo que gobierna, corte sin estribos, I_e de Bischoff) | 7 / 6.5 / 24 | [x] | ◻ | ⚠️ 2026-07-29 (19 aplicados: 1🔴 5🟠 10🟡 3🔵; queda 1🔵 de convención decimal del repo) | a mano (Python, con 6 validaciones cerradas) ✅ · 2 SVG (esquema con las 5 secciones críticas y curva flecha–espesor) · tesis: **ninguna verificación de resistencia dimensiona nada** — el corte queda al 0,52 en todo el barrido, la flexión pide menos que el mínimo en las 5 secciones, y el espesor lo fija la deflexión, que **no baja suave**: entre h=190 y 220 la I_e pasa de 28 % a 100 % de I_g al cruzar ⅔M_cr, y 4 cm bajan la flecha a la quinta parte. Dos rutas permitidas para I_e (24.2.3.6 vs 24.2.3.7) **se reparten el veredicto en h=200** (1,06 vs 0,82) → h=210. Hallazgos de fuente: el V_c de losas quedó en la **mitad** desde 318-19; 318-25 **eliminó** la tabla por grado de acero del mínimo (7.6.1.1 y 24.4.3.2); el espaciamiento de flexión va por **Tabla 24.3.2**, no por 3h; y la Ec. (19.2.3.1) está **impresa con errata** en la edición SI (0,062 en vez de 0,62). Estrena el Cap. 7 y obligó a corregir su nota teórica |

### F-A. Acero — AISC 360-22

| ID | Ejemplo | Cap. | Post | Planilla | Audit. | Verif. |
|----|---------|------|:----:|:--------:|:------:|--------|
| F-A1 | **Diagonal HSS a tracción** (fluencia bruta, rotura + retraso de cortante Caso 5, soldadura de filete, bloque de corte) | D | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (2🔴 4🟠 aplicados; 6 abiertos) | a mano (script) ✅ · HSS soldado > ángulo (elección de Francisco: práctica chilena actual) · la 2.ª auditoría corrigió el caso de la Tabla D3.1 (6→**5** en 360-22, con la x̄ que incluye el espesor) y la cota de J4-5 |
| F-A2 | **Columna de galpón a compresión** (longitud efectiva por eje: cantilever K=2 en el plano vs. arriostrada K=1 fuera, esbeltez gobernante, pandeo local E7, curva de columna E3) | E | [x] | ◻ | ✅ 2026-07-23 (1🟡 1🔵 aplicados) | a mano (Python) ✅ · 2 SVG (elevación + curva de columna con los 2 ejes) · tesis: gobierna el eje fuerte pese a r_x>r_y porque la longitud efectiva pesa más; palanca = bajar L_c/r (arriostrar K=1 casi triplica), no subir F_y (elástico) · gancho a D9 (pandeo lineal SAP) |
| F-A3 | **Viga laminada con pandeo lateral-torsional** (Lb, Lp, Lr, Cb; tres zonas; dos esquemas de arriostramiento) | F | [x] | ◻ | ✅ 2026-07-23 (1🟡 aplicado) | a mano (Python) ✅ · 2 SVG (esquema+barras y curva Mn–Lb con los 2 puntos) · tesis: la misma viga W460×74 falla arriostrada solo en apoyos (Lb=8m, elástico, φMn=19.1<Mu=20) y sobra con un arriostre a media luz (Lb=4m, inelástico, φMn=51.0); el LTB se compra con arriostramiento y Cb, no con perfil mayor (φMp=52.4 ya sobra) · cierra la trilogía de flexión en acero (F pura → LTB → carrilera) |
| F-A4 | **Viga carrilera de puente grúa** (cargas de grúa ASCE 7 §4.9, carga móvil, LTB, flexión biaxial, corte, J10, deflexiones, fatiga) | F/G/H/J | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (1🔴 4🟠 aplicados; 17 abiertos) | a mano (script) ✅ · cierra posts de puente grúa · tesis: la flexión pura sobra; gobiernan LTB (8 m sin arriostrar) y flexión biaxial, con el canal como palanca; la fatiga no manda en Clase C pero toma el control en servicio pesado |
| F-A5 | **Viga armada: corte, campo de tracción y rigidizadores** | G | [ ] | ◻ | — | **próximo** — único capítulo de acero sin ejemplo |
| F-A6 | **Viga-columna** (fuerzas combinadas H1-1a/b, amplificación B1 P-δ, C_m, C_b) | H / Ap. 8 | [x] | ◻ | ✅ 2026-07-25 (1🔴 1🟠 6🟡 4🔵 aplicados) | a mano (Python) ✅ · 2 SVG (esquema+momentos 1.er/2.º orden y frontera H1-1 con el viaje del punto) · síntesis de E+F · tesis: por separado la columna sobra (0.55 compresión, 0.33 flexión) y combinada queda al **0.94** — diez puntos los pone B1=1.34 (P-δ) invisible al primer orden; la suma ingenua (0.99) tampoco es la norma (crédito 8/9); sin puntales de media altura uso 2.0 (el arriostramiento trabaja para los dos sumandos) · engancha F-A2, F-A3 y post P-Delta (B1 ≡ amplificador) |
| F-A7 | **Conexión apernada a corte simple** (shear tab: corte de pernos, aplastamiento/desgarre, corte fluencia/rotura de la plancha, rotura en bloque, geometría) | J | [x] | ◻ | ✅ 2026-07-23 (2🟠 2🟡 aplicados) | a mano (Python) ✅ · 2 SVG (esquema+modos de falla y cadena en barras) · tesis: la conexión es una cadena y gobierna la plancha (rotura por corte área neta, uso 0.89), no los pernos (0.69); la palanca es el espesor/geometría de la plancha · engancha /herramientas/placa-base + F-H6 |

### F-A8+. Conexiones de acero típicas (pedido de Francisco, 2026-07-25)

Sub-serie dentro de los ejemplos de Acero: las conexiones que un ingeniero verifica todas las
semanas, cada una con su modo de falla protagonista. F-A7 (shear tab) ya abrió el arco; estas
lo completan:

| ID | Ejemplo | Cap. | Post | Planilla | Audit. | Verif. |
|----|---------|------|:----:|:--------:|:------:|--------|
| F-A8 | **Placa de extremo extendida 4E** (par T–C, pernos a tracción, efecto palanca por T-stub, placa en corte, soldadura del ala, J10 del lado columna) | J / Manual P.9 | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (2🟠 aplicados; 14 abiertos) | a mano (Python) ✅ · 2 SVG (esquema+detalle T-stub y curva T_disp–t_p) · tesis: la resistencia del perno **no es una constante, es una curva del espesor de la placa** — con t_p=18 mm la palanca se come el 42 % y falla (1.15), con 22 mm queda al 0.83, y solo en t_c=31.1 mm desaparece; 4 mm de plancha = pasar o no pasar, con los mismos pernos; k_ds=1.5 (J2-5) es lo que salva el filete de 10 mm (0.83 vs 1.24) · engancha F-A7 (la hermana rígida) y F-A9 |
| F-A9 | **Placas de ala (BFP) + zona panel** (pernos, placas, F13.1 del ala perforada; J10-1/J10-2/J10-4/J10-10 de la columna; rigidizadores y doubler) | J / F13 | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (4🟠 aplicados; 11 abiertos) | a mano (Python) ✅ · 2 SVG (esquema con zona panel+refuerzos y barras conexión vs columna) · tesis: **la conexión pasa (≤0.74) y la columna no** (ala 1.43, alma 1.12, zona panel 1.07); el detalle fino es el término axial de J10-10: sin él la zona panel daba 1.00 **exacto** y el P_u de gravedad se lleva ese 6 % (la columna no puede usar dos veces el mismo acero); el crédito J10-11 (×1.156) salva pero **exige** modelar la deformación del panel · engancha F-A8 |
| F-A10 | **Doble ángulo apernado vs shear tab** (misma demanda y mismos pernos; corte doble, apoyo, J4, y la excentricidad) | J | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (1🔴 2🟠 aplicados; 7 abiertos) | a mano (Python) ✅ · 2 SVG (planta comparada 1 vs 2 planos y barras enfrentadas) · tesis: duplicar plano de corte y espesor de apoyo **saca el eslabón débil de la conexión** (0.93 → 0.46, quedando en empate técnico con el alma de la viga a 0.8 %); y la excentricidad, que la cadena de resistencia esconde, lleva el perno extremo de la tab al **0.995** (método elástico) contra 0.48 del doble ángulo — a cambio de 3.8× el acero y 3× los agujeros · complementa F-A7 |
| F-A11 | **Empalme apernado de viga** (reparto M a las alas / V al alma, cubreplacas, J3.9 deslizamiento crítico, F13.1) | J / J6 | [x] | ◻ | ⚠️ 2.ª pasada 2026-07-26 (3🟠 aplicados; 14 abiertos) | a mano (Python) ✅ · 2 SVG (esquema con el reparto y barras rotura vs deslizamiento) · tesis doble: **el empalme copia las fuerzas, no la sección** (cubreplaca 26.6 cm² < ala 27.55 y pasa, porque la demanda son 45.2 tonf y no las 87 del ala); y **pretensar no agrega resistencia, agrega una verificación** — el mismo perno vale 10.8 tonf a rotura y 6.1 a fricción, y el grupo pasa de 0.52 a 0.93; salidas: pernos, Clase B o n_s=2 |

**Infraestructura de Acero:** hecha con F-A1 (2026-07-23) — subsección `ejemplos` en
`src/lib/acero.ts` + `src/pages/acero/ejemplos/index.astro` (espejo de Hormigón).

**Trío de mayor retorno:** F-H1 ✅ → F-A1 ✅ (diagonal HSS) → F-H5 ✅ (zapata aislada) →
F-H6 ✅ (grupo de anclajes) → F-A4 ✅ (viga carrilera) → **F-A2 ✅ (columna a compresión,
gancho a D9)** → **F-H3 ✅ (columna P–M + esbeltez)** → **F-A3 ✅ (viga con LTB, 2026-07-23)**.
Par "la columna en los dos materiales" completo; **trilogía de flexión en acero completa**
(F-A3 pura LTB → F-A4 carrilera); **F-A7 ✅ (conexión apernada, 2026-07-23)** cierra el arco de
la conexión (placa base + anclajes F-H6 + shear tab). **Tanda 2026-07-25: F-A6 ✅
(viga-columna, cierra la síntesis E+F+H del acero), F-H2 ✅ (viga T, complementa F-H1) y
F-H7 ✅ (ménsula STM, estrena el Cap. 23 y engancha con la carrilera F-A4).** **Tanda
2026-07-25 (tarde): sub-serie de conexiones típicas COMPLETA — F-A8 ✅ (end-plate 4E,
palanca), F-A9 ✅ (BFP + zona panel), F-A10 ✅ (doble ángulo vs shear tab) y F-A11 ✅
(empalme, deslizamiento crítico).** Con F-A7 y F-H6 el Cap. J queda cubierto de punta a
punta: corte simple, momento apernado (dos familias), comparación de anatomías, empalme y
anclaje al hormigón. Siguientes candidatos, ya decididos más abajo: **F-H8** (cabezal de pilotes STM),
**F-A5** (alma a corte + rigidizadores) y **F-G1** (grupo de pilotes, en Geotecnia).

**Cierre de la tanda de conexiones (2026-07-25, tarde):**
- **Las cinco auditadas** (F-A7 a F-A11, 74 hallazgos, ver AUDIT.md; reauditadas en la segunda
  pasada del 2026-07-26, ver más abajo). Hallazgo transversal:
  las áreas netas iban sin el **sobreancho de 2 mm de B4.3b** —no conservador ~3 %—; corregido
  en los cinco posts con propagación a prosa, tablas, `description`, `alt` y SVG.
- **F-A7 ampliado con la sección de excentricidad** y reauditado: el perno extremo llega a
  **0.995** (método elástico, justo en el límite) y la plancha suma flexión (0.48). Con eso su
  tesis se completa: la cadena la gobierna la plancha (0.93), pero la holgura de los pernos era
  aparente.
- Quedan **2 hallazgos 🔵 anotados** que necesitan el *AISC Steel Construction Manual* 16.ª ed.
  (no está en `material_teorico/referencias`): si la *conventional configuration* exige
  $L_{eh} \ge 2d_b$, y el valor SI exacto de $F_{nv}$ en la Tabla J3.2 (372 vs 370 MPa).
- Pendiente opcional en F-H3: planilla del canvas con región `program` que reproduzca el
  diagrama P–M (◻).

### Segunda pasada de auditoría (2026-07-26): los ocho ejemplos «sin auditar» sí lo estaban

La columna **Audit.** de este ROADMAP marcaba «— sin auditar» a F-H5, F-H6, F-A1, F-A4 y
F-A8–F-A11, pero `AUDIT.md` ya registraba auditorías suyas del 23 y 25 de julio: **la columna
estaba desactualizada, no el registro**. Se corrió igual una segunda pasada, más profunda —los
auditores fueron al **texto crudo de las normas** (PDF de ACI 318-25 SI y de AISC 360-22, no solo
a las fichas de `material_teorico`) y cruzaron posts hermanos—, y encontró **137 hallazgos:
7🔴 · 26🟠 · 66🟡 · 38🔵**. Se aplicaron los **33 bloqueantes**; los ocho posts quedan en ⚠️ sin
🔴 ni 🟠 abiertos. Build verde, 144 páginas.

**Los tres hallazgos que cambiaron números publicados:**

1. **F-H6 · el φ de anclajes no existe en 318-25.** El post minoraba los modos de hormigón con
   **φ = 0.70**, que es la Tabla 17.5.3 Condición B de **318-19**. Verificado en el PDF: 318-25
   consolidó los φ en la **Tabla 21.2.1** —(l) tracción no redundante 0.65, (m) redundante 0.75,
   (n) corte 0.75— y estrenó la **Tabla 17.5.4.1** con el factor **Ψ_a = 0.95** (*cast-in* sin
   armadura suplementaria), que el post no tenía. Adoptado $\phi\Psi_a = 0.7125$: breakout N
   0.58→**0.57**, pullout 0.38→**0.37**, breakout V 0.56→**0.55**, interacción 0.78→**0.76**.
2. **F-A1 · el Caso 6 de la Tabla D3.1 es otro caso en 360-22.** Verificado en el PDF: el
   **Caso 5** es el HSS con una plancha pasante por ranuras (con una $ar{x}$ que **incluye el
   espesor**) y el **Caso 6** pasó a ser el tubo con dos planchas laterales. El post usaba la
   numeración y la fórmula de 360-16 → $ar{x}$ 3.81→**3.59**, $U$ 0.746→**0.760**, capacidad
   47.5→**48.4** tonf. Y su **Ec. J4-5 estaba incompleta**: sin la cota $\le 0.60F_yA_{gv}$
   sobreestimaba el bloque de corte un **24 %** hacia el lado inseguro (69.5→**56.1** tonf).
   La nota teórica del Cap. D arrastraba la misma numeración y se corrigió en el mismo commit.
3. **F-A10 · el veredicto publicado no era el que da su propia tabla.** «El eslabón débil se
   muda al alma de la viga» es falso por 0.8 %: la rotura en corte de los ángulos da 64.63 tonf
   (0.464) contra 65.15 del apoyo en el alma (0.461). Reescrito como **empate técnico**, que es
   una tesis mejor: la conexión deja de ser el eslabón débil y queda al nivel del miembro.

**Además:** F-A4 corrigió su modelo de flexión lateral (usaba el $S_y$ de la **sección completa**
donde el apunte teórico y la DG 7 piden **ala superior + canal**) → H1 0.89→**0.96**, y su
afirmación de que la fatiga gobierna «en servicio pesado», que su propia tabla desmiente (Clase D
da 0.76). F-H5 dejó de atribuir al **efecto de tamaño** una caída que aporta sobre todo el
término de cuantía (63.6 → 33.2 con $\lambda_s=1$ → 27.9).

**Deuda que abre esta tanda:** `src/lib/placaBaseAnchorage.ts` sigue en φ = 0.70 y en la regla
lineal ≤ 1.2 de 318-19. F-H6 ahora lo advierte en el post, pero **el motor de la herramienta de
placa base no se tocó** — es el próximo ítem de la sección A.

### Los tres próximos ejemplos (decididos 2026-07-26)

Los tres tienen la fuente ya procesada en `material_teorico`, así que ninguno se bloquea por
documentación. **F-G1 y F-H8 se publican como par**; F-A5 es independiente.

- [ ] **F-H8. Cabezal de 9 pilotes por puntal-tensor** (ACI 318-25 Cap. 23 + 13.4) — el de mayor
  retorno, porque **el caso ya está publicado y verificado**: recibe literalmente el cabezal con
  que cierra la nota 16 de Geotecnia (torre de traspaso, D = 360 / L = 95 tonf, V = 60 tonf con
  brazo 4,0 m, 9 pilotes Ø0,60 a s = 1,80 m, arrastre de 61,43 tonf por pilote). Aquel post
  entrega la reacción por pilote y dice explícitamente que dimensionarlo estructuralmente es otro
  problema; este lo convierte en armadura. **Tesis candidata**: el cabezal es una región D y el
  modelo de viga miente en los dos sentidos — la pirámide de puntales concentra el tirante en las
  bandas sobre los pilotes en vez de distribuirlo, y en punzonamiento los perímetros críticos
  **se traslapan** a s = 3D (13.4 remite a la envolvente menor), que es exactamente este caso.
  Más el arrastre: la carga de diseño del cabezal no es la de la superestructura. **Fuente**:
  `cap23-puntal-tensor.md` (ya ejercitado en F-H7) y `cap13-fundaciones.md` §13.4. **Verif.**: a
  mano en Python, reusando el motor de nodos/puntales de la ménsula. **Cierra** la cadena suelo →
  pilote → cabezal → columna, hoy publicada solo por tramos.
- [ ] **F-A5. Viga armada de alma esbelta: corte, campo de tracción y rigidizadores** (AISC
  Cap. G) — el **único capítulo de acero con nota y sin ejemplo**. La propia nota `capG-corte.md`
  ya plantea el ejercicio de síntesis que sería la tesis. **Tesis candidata**:
  $V_n = 0.6F_yA_wC_v$ tiene tres palancas y solo una cuesta acero — engrosar el alma sube $A_w$;
  rigidizar activa el **campo de tracción** (G2.2) y recupera resistencia post-pandeo sin agregar
  sección; bajar $a$ sube $k_v$; y el panel **extremo** no puede usar campo de tracción (G2.3) y
  suele ser el que gobierna, que es el detalle que se olvida. Cierre: el rigidizador se dimensiona
  por **rigidez** ($I_{st}$, G2-19), no por resistencia. **Caso**: viga armada de galpón o
  carrilera pesada, en continuidad con F-A3 y F-A4. **Bonus**: aritmética cerrada y sin iteración
  → primer candidato real a **planilla del canvas en Acero**, donde tampoco hay ninguna.
- [ ] **F-G1. El grupo: cuándo 9 pilotes no valen 9 veces uno** (Das §18.16–18.18, sección
  Geotecnia) — la pregunta que las dos notas de fundaciones profundas dejan abierta a propósito.
  El post 11 dice que en grupo «la penalización se acumula» y da el rango 2/3–3/4 para perforados,
  pero no lo calcula; el post 16 anota que a s = 1,80 m (3D) «el grupo interactúa» y luego aclara
  que **para el arrastre** no aplica reducción, dejando la capacidad sin resolver. **Tesis
  candidata**: la eficiencia de grupo no es un factor de tabla, es la competencia entre dos
  mecanismos —la suma de pilotes individuales y la falla en **bloque**—; y el asentamiento del
  grupo (§18.17–18.18) no escala con η, porque el bulbo de tensiones del conjunto es mucho más
  profundo. Con el caso del post 16 se puede medir si los 9 pilotes que la fricción negativa
  obligó a poner realmente rinden 9. **Verif.**: script `postNN_*.py` en `material_teorico`, como
  los 15 anteriores. **Alternativa**: G-12 (pozos perforados, Das cap. 19) también está listo de
  fuente y es la deuda *declarada*; se pospone porque no engancha con nada nuevo, mientras que el
  grupo alimenta directamente a F-H8.

**Descartados por falta de fuente** (verificado): **F-H4** con elementos de borde exige el
**Cap. 18** de ACI 318-25, que **no está procesado** (solo el Cap. 11, sin detallamiento sísmico);
y un ejemplo de muro sísmico sigue bloqueado por Mononobe-Okabe, que no está ni en Das ni en Sáez.

## G. Geotecnia (Das 4ª ed. + NCh2369:2025 Cap. 10)

Sección `/geotecnia`, estrenada el 2026-07-25. A diferencia de Hormigón y Acero, acá **no hay
una norma que entregue el número**: hay teoría, correlaciones y un informe de mecánica de
suelos. Por eso `norm`/`source` declaran la **fuente** (autor + edición), que cumple el mismo
papel de trazabilidad que la cláusula en ACI o AISC.

El recorrido no lo fija ni la fecha ni la subsección: lo fija `order` en el frontmatter y
`BLOQUES` en `src/lib/geotecnia.ts`. La taxonomía de subsecciones es temática y **cruza** los
bloques (el bloque 1 atraviesa cuatro subsecciones y `fundamentos` reaparece en el 2).

**Convención de trabajo** (la misma en los 15 posts, ver memoria `geotecnia-bloque5-nch2369`):
script verificador `material_teorico/_procesamiento/scripts/postNN_*.py` con **todos** los
números del post → 2-3 SVG en `public/geotecnia-<slug>/` → verificar el render con Playwright
inyectando el SVG *inline* (un `<img src="file://...">` queda bloqueado) → `npm run build` →
revisar warnings de KaTeX (**subíndices sin tilde**: `q_{max}`, no `q_{máx}`).

Columnas: **Post** `[ ]`pend `[~]`curso `[x]`hecho · **Script** verificador en
`material_teorico` · **Audit.** estado de `/auditar` (✅limpio · ⚠️con hallazgos · ❌bloqueado ·
—sin auditar; el detalle vive en `AUDIT.md`).

### Bloque 1 — La zapata superficial (`range: [1, 7]`)

| # | Post | Subsección | Post | Script | Audit. |
|---|------|-----------|:----:|:------:|:------:|
| 1 | `de-donde-sale-q-admisible` | fundamentos | [x] | `post01` | ⚠️ 10 (2🟠) |
| 2 | `terzaghi-vs-ecuacion-general` | capacidad-soporte | [x] | `post02` | ⚠️ 11 (1🟠) |
| 3 | `nivel-freatico-capacidad` | capacidad-soporte | [x] | `post03` | ⚠️ 11 (1🟠) |
| 4 | `modulo-es-parametro-dominante` | asentamientos | [x] | `post04` | ⚠️ 18 (3🟠) |
| 5 | `cuanto-y-cuando-consolidacion` | asentamientos | [x] | `post05` | ⚠️ 11 (2🟠) |
| 6 | `ocr-historia-de-tensiones` | asentamientos | [x] | `post06` | ⚠️ 10 (1🟠) |
| 7 | `ejemplo-zapata-los-dos-criterios` | ejemplos | [x] | `post07` | ⚠️ 12 (3🟠) |

### Bloque 2 — El origen de los parámetros (`range: [8, 8]`)

| # | Post | Subsección | Post | Script | Audit. |
|---|------|-----------|:----:|:------:|:------:|
| 8 | `como-leer-un-informe-de-mecanica-de-suelos` | fundamentos | [x] | `post08` | ⚠️ 10 (3🟠) |

### Bloque 3 — El suelo de costado (`range: [9, 10]`)

| # | Post | Subsección | Post | Script | Audit. |
|---|------|-----------|:----:|:------:|:------:|
| 9 | `tres-coeficientes-del-mismo-suelo` | empujes-y-muros | [x] | `post09` | ⚠️ 10 (1🟠) |
| 10 | `muro-tres-verificaciones` | empujes-y-muros | [x] | `post10` | ⚠️ 15 (2🟠) |

### Bloque 4 — Fundaciones profundas (`range: [11, 12]`) — **incompleto**

| # | Post | Subsección | Post | Script | Audit. |
|---|------|-----------|:----:|:------:|:------:|
| 11 | `pilotes-la-punta-casi-no-trabaja` | fundaciones-profundas | [x] | `post11` | ⚠️ 11 (2🟠) |
| **12** | **Pozos perforados (Das cap. 19)** | fundaciones-profundas | **[ ]** | — | — |

- [ ] **G-12. Pozos perforados — la deuda declarada de la sección.** `BLOQUES` reserva el
  `range: [11, 12]` y el post 11 lo **anuncia al cierre**: *«los pozos perforados, el otro tipo
  de fundación profunda, cierran este bloque. Tienen una geometría que permite ensanchar la
  base, y una tabla —la 19.1— que verifiqué entera sin encontrarle un solo error»*. Es la misma
  clase de promesa publicada que cerró el post 16. El cap. 19 ya está procesado en
  `material_teorico/libros/geotecnia-das/19-pozos-perforados.md` y su tabla verificada con
  `verify_das_cap19.py`, así que el trabajo pesado de fuente está hecho. Ganchos naturales: la
  campana de base ensanchada (lo que un pilote no puede hacer) y el contraste de eficiencia de
  grupo perforado vs hincado que el post 11 ya dejó planteado (2/3 a 3/4 contra η = 1).

### Bloque 5 — La norma con que se firma en Chile (`range: [13, 16]`) — **completo**

Casos típicos de la industria chilena bajo el Cap. 10 de NCh2369:2025. Tesis del bloque: la
fundación **no la dimensiona `q_adm`** sino las verificaciones que agrega la norma sísmica, y en
la sensibilidad se invierte el orden del bloque 1 — los parámetros del suelo son el ruido, las
decisiones de modelación y de clasificación normativa son la señal.

| # | Post | Cláusula | Post | Script | Audit. |
|---|------|----------|:----:|:------:|:------:|
| 13 | `ejemplo-zapata-galpon-nch2369` | 10.1.3 / 10.1.4 | [x] | `post13` | ⚠️ 15 (2🟠) |
| 14 | `ejemplo-fundacion-anclada-nch2369` | 10.1.6 (0,7R₁) | [x] | `post14` | ⚠️ 15 (5🟠) |
| 15 | `ejemplo-losa-rigida-o-flexible-nch2369` | Ec. (25) / 10.1.5 | [x] | `post15` | ⚠️ 16 (3🟠) |
| 16 | `ejemplo-pilotes-friccion-negativa-nch2369` | 10.2.4 | [x] | `post16` | ✅ 2026-07-26 (16 aplicados: 2🔴 4🟠 3🟡 7🔵) |

### Deuda y mantención

- [x] **G-A. Auditar la sección** (hecho 2026-07-26). Los **15 posts** auditados en tres tandas,
  **231 hallazgos**: 17🔴 · 60🟠 · 109🟡 · 45🔵. **Diez de los quince quedaron ❌ bloqueados**
  (nueve siguen así; la nota 16 ya se cerró aplicando sus 16). Quedan **215 abiertos** en 14
  posts: 15🔴 · 56🟠 · 106🟡 · 38🔵. El detalle vive en
  `AUDIT.md`, que estrena sección de cobertura `geotecnia`.
- [ ] **G-B. `getAllGeotecniaPosts()` es una trampa latente.** Ordena por `pubDate` desc
  (`src/lib/geotecnia.ts:92`), y los posts 2–11 están **fechados a futuro** (hasta 2026-08-10)
  mientras el bloque 5 salió el 2026-07-26 — así que ese orden deja el post 11 arriba del bloque
  5. Hoy **no lo usa ninguna página** (las siete de la sección usan `getGeotecniaSeries()` o
  `getGeotecniaPostsBySubsection()`, que ordenan por `order`, y `[slug].astro` llama a
  `getCollection` directo): es código muerto. El riesgo es que quien agregue una página tome el
  wrapper de nombre más obvio. Decidir entre borrarlo, renombrarlo a algo que declare el orden
  (`getGeotecniaPostsByDate`) o alinear las fechas.
- [ ] **G-F1. El grupo de pilotes: cuándo 9 no valen 9 veces uno** (Das §18.16–18.18) — el
  próximo ejemplo de la sección, decidido el 2026-07-26 y descrito en detalle en la sección F
  («Los tres próximos ejemplos»). Reusa el caso de la nota 16 y se publica **como par con F-H8**
  (el cabezal del mismo grupo, ahora desde el hormigón): el suelo entrega la reacción por pilote,
  el hormigón la convierte en armadura. Es también el mejor candidato a estrenar **G-C**, porque
  su aritmética es cerrada y sin iteración.
- [ ] **G-C. Ninguna planilla del canvas.** Los ejemplos de Hormigón/Acero declaran planilla
  interactiva como parte del formato (`ejemplos-calculo-workflow`); en geotecnia no hay ninguna.
  Candidatos naturales: capacidad de soporte por la ecuación general (post 2/7) y el arrastre
  del post 16, los dos con aritmética cerrada y sin iteración.

### Hallazgos transversales de la auditoría (tanda 1, posts 1-5)

Cinco posts, **71 hallazgos** (2🔴 17🟠 37🟡 15🔵), dos bloqueados. Las tesis centrales
resistieron el recálculo independiente —las dos reglas del post 3, los 240 valores de tablas del
post 2, la errata de la Tabla 9.3 del post 5, los 16 asentamientos del post 4—; lo que falla es
**declaración, consistencia entre notas y dos atribuciones de caso**. Estos patrones se repiten y
conviene arreglarlos de una vez, no post por post:

- [ ] **G-D. `q_adm` bruta vs neta — el más sistémico.** La nota 1 declara el dato como *neto* y
  lo retroanaliza como *bruto* (cambiaría 26,7° → 27,0° y la brecha a 35,5 %); la nota 4 mete
  $q_o$ **bruta** en la Ec. (17.2) donde Das pide **neta** (el caso base pasaría de 24,95 a ~27 mm);
  la nota 7 sí usa la neta. **Tres notas, dos criterios.** Hay que fijar uno y propagarlo — y las
  notas 3 y 4 ya citan el 26,7° y los 196 kPa, así que el arreglo no es local.
- [ ] **G-E. Deriva de cifras entre notas.** La brecha de la nota 2 citada como **30 % / 34 % /
  31 %** en tres lugares; el mismo caso de napa como **15 %** (nota 1) y **14,5 %** (nota 3);
  $C_s$ (Das, notas 5-7) contra $C_r$ (nota 16) para el mismo índice de recompresión;
  $C'_\alpha$ como 0,011 y 0,0108; el fin de la primaria como 1,2 y 1,5 años. Ninguna es un
  error de cálculo: son la misma cantidad escrita distinto en notas que se citan entre sí.
- [ ] **G-F. Bases de porcentaje y parámetros sin declarar.** El FS = 3 que la nota 2 nunca
  declara (quien aplique la ecuación citada obtiene un valor 3 veces mayor); el $\gamma = 18$
  kN/m³ de la nota 3, sin el cual sus dos números titulares no se reproducen; el 46 % y el +47 %
  de la nota 4. **Es el defecto más repetido de la sección** y el más barato de cerrar.
- [ ] **G-G. La nota 1 es el mapa de entrada y quedó desactualizada.** Cierra con «y termina
  bajando: pilotes», pero el arco ya tiene el bloque 5 con cuatro notas publicadas. Quien entra
  por la puerta principal no se entera de que existe NCh2369 en la sección.
- [ ] **G-H. Segunda promesa publicada sin cumplir.** La nota 4 dice que la cimentación
  compensada «es tema de otra nota» y no existe (verificado con `grep` sobre los 16 posts). Se
  suma a G-12 (pozos perforados). Decidir: escribirlas o retirar las promesas.
- [ ] **G-I. Convención decimal por colección.** `geotecnia`/`blog`/`apuntes` usan coma
  (334 / 240 / 62 usos de `{,}`); `hormigon`/`acero` usan punto (0 usos). Se nota al citar entre
  secciones: la nota 1 cita `q_a = 2.0` del ejemplo de hormigón y lo escribe `2{,}0`. Decidir a
  nivel de repo.

**Tanda 2 (posts 6-10): 69 hallazgos más, total 140.** Ocho de los diez auditados quedaron
**bloqueados**. Tres patrones nuevos, y dos incógnitas cerradas:

- [ ] **G-J. La cadena de confianza tiene un eslabón sin verificar.** El 🔴 de la nota 9 —«Coulomb
  (1776), 150 años anterior» a Rankine (1857), cuando son 81— **no lo inventó el post: lo heredó
  textual** de `material_teorico/libros/geotecnia-das/14-presion-lateral-de-tierra.md:116`. Los
  resúmenes procesados del cerebro **no están auditados**, y los posts los citan como si fueran la
  fuente. El auditor lo pilló solo porque fue al PDF. Verificado que afecta a un solo post, pero el
  problema es estructural: hay 14 capítulos procesados y ninguno pasó por auditoría.
- [ ] **G-K. Referencias hacia adelante disfrazadas de hacia atrás.** Las notas 9 y 10 dicen «el
  mismo principio que **ya** apareció en pilotes» / «**ya lo habíamos visto** en pilotes», y pilotes
  es la nota **11**, posterior a ambas. Es consecuencia de escribir la serie fuera de orden: el
  contenido existía en la cabeza del autor antes que en el arco.
- [ ] **G-L. El veredicto del auditor no siempre calza con sus propios hallazgos.** En tres de los
  diez reportes (notas 1, 7 y 10) el encabezado decía «⚠️» conteniendo un 🔴, que por la convención
  de `AUDIT.md` implica ❌; en otro (nota 3) el conteo del título no coincidía con las filas de la
  tabla. Se corrigieron al consolidar y quedó anotado en cada bloque. Conviene reforzarlo en
  `.claude/agents/auditor.md`.

**Dos incógnitas cerradas por la tanda 2:**

- **G-D (bruta vs neta) tiene culpable, y no es el que parecía.** La nota 7 **sí usa la neta**
  (155 kPa, verificado: da los 11,1 mm publicados; con la bruta darían 13,0) pero **no lo declara**;
  la nota 4 usa la bruta y tampoco. Y el origen del enredo está fuera de geotecnia: el post
  `hormigon/ejemplo-zapata-aislada.mdx` L.42 **rotula su $q_a = 2{,}0$ kgf/cm² como «neta» y luego
  lo usa como bruta** ($A_{req} = P/q_a$). El arreglo empieza por esa etiqueta.
- **El caso del Ejemplo 9.10 (🔴 de la nota 5): la nota 7 está limpia.** Declara explícitamente en
  su recuadro de reproducibilidad que *«no quise trasladar… la geometría de su Ejemplo 9.10 a una
  zapata distinta»* y calcula el caso real ($\sigma'_o = 106{,}0$, $S_p = 18{,}2$, $S_e = 11{,}1$,
  total 81,7 mm — los seis números confirmados). **Las que mezclan los dos casos son las notas 5 y
  6**, y las dos lo hacen llamándolo «el caso de la serie».

**El hallazgo más caro de la tanda 2**: la nota 10 publica «**el muro pasa por los pelos**» y
«las tres pasan», pero el deslizamiento da $FS = 1{,}4960 < 1{,}50$ — y **el propio verificador
imprime «NO CUMPLE»** (`post10_muro_completo.py` L.112). Es un veredicto publicado que su propio
script contradice. El margen (0,3 %) está dentro del ruido de los parámetros, y decirlo así
refuerza la tesis del post en vez de debilitarla.

**Un error de fondo, no de forma** (el único de la tanda que cambia una conclusión publicada): la
nota 2 afirma que Terzaghi es «**sistemáticamente** conservadora» respecto de la ecuación general.
El auditor construyó el contraejemplo: zapata **continua en superficie** con cohesión ($c'=20$ kPa,
$\phi'=30°$), donde Terzaghi da **8,1 % mayor** (15,3 % con $c'=50$). Sin bono de forma ni de
profundidad que lo compense, los $N_c$ y $N_q$ mayores de Terzaghi lo dejan del lado inseguro.

### Corrección aplicada (2026-07-26)

**Aplicados 40 de los 215 hallazgos abiertos: los 15 🔴 y 25 de los 56 🟠.** Ningún post queda ya
en ❌; los catorce con hallazgos abiertos están en ⚠️. Build verde, 144 páginas. Quedan **175
abiertos**: 31🟠 · 106🟡 · 38🔵.

Lo corregido, por familia:

- **Los cinco errores de fuente.** $N_c$ de Terzaghi es 5,70 y no 5,14 (nota 1, era la Tabla 16.2
  metida en la ecuación de la 16.1); Coulomb es 81 años anterior a Rankine y no 150 (nota 9, **con
  la ficha del cerebro corregida en el mismo commit**); el método λ usa tensión **efectiva** y no
  total (nota 11); la Ec. de $Q_u = Q_p + Q_s$ es la 18.3/18.7 y no la 18.1 (nota 11); y la cita de
  Das sobre el FS justificaba las pruebas de carga, no el rango (nota 11).
- **Las afirmaciones que excedían su respaldo.** «Terzaghi es *sistemáticamente* conservadora» ahora
  declara el contraejemplo (zapata continua en superficie con cohesión, donde entrega un 8–15 %
  **más**); «el deslizamiento *no está en Das*» pasa a «Das sí lo tiene (§15.6), la norma lo
  endurece»; «las siete $C_N$ coinciden *por construcción*» pasa a «seis de las siete»; «λ cae a un
  tercio» pasa a «el **coeficiente** cae a un 37 %, y no es $f_{prom}$»; «en una zapata la teoría
  está razonablemente asentada» ahora cita el 34 % que la propia serie midió.
- **Los dos posts que contradecían a su máquina.** La nota 10 ya no dice «el muro pasa por los
  pelos»: dice que queda **0,3 % por debajo** del mínimo y explica por qué eso es lo interesante.
  La nota 11 publica 887 y 2.465 kN, los valores que imprime su script.
- **Los parámetros que faltaban.** $\gamma = 18$ kN/m³ (nota 3), FS = 3 y que la tabla son $q_{adm}$
  (nota 2), $\delta' = 0{,}7\phi'$ y $N_{60} = 20$ (nota 11), $E$ del hormigón (nota 15),
  $\gamma_{sat}$ (nota 9), las **2 barras traccionadas** de las 4 (nota 14). Con eso los seis posts
  pasan a ser reproducibles desde el texto.
- **Las atribuciones normativas.** C10.1.5 **no trae ningún valor de $k_v$** —la banda 1.500–6.000
  ahora se declara como adoptada, no como recomendada por la norma— y la frase sobre el FS de
  deslizamiento está en la **cláusula** 10.1.3, no en su comentario.
- **Los dos casos mezclados.** Las notas 5 y 6 ya declaran que su caso es el **Ejemplo 9.10 de
  Das** (zapata de 1,5 × 1,5 m) y remiten a la nota 7 para el de la serie. La nota 7 declara su
  supuesto de drenaje en dos caras y cuánto vale (factor 4 en el tiempo).

**Lo que queda, y por qué no se aplicó:** los 31 🟠 restantes exigen **recalcular números
publicados y regenerar figuras**, no reescribir prosa. Los cuatro de mayor alcance:

1. **Nota 4 · $q_o$ bruta vs neta en la Ec. (17.2)** (G-D). Das pide neta; la nota usa bruta. Rehacer
   la tabla de 8 suelos, el tornado y 3 SVG. **Requiere primero decidir la convención de sección**,
   que arrastra a las notas 1 y 7 y a la etiqueta «neta» de `hormigon/ejemplo-zapata-aislada.mdx:42`.
2. **Nota 4 · $I_f$ interpolado solo en la fila $\mu_s = 0{,}3$.** El caso base pasaría de 24,95 a
   ≈27 mm y arrastra los 16 asentamientos.
3. **Nota 9 · Ec. (14.7) aplicada a arena.** Corresponde la (14.4): $K_o$ pasa de 0,940 a 0,980 y de
   1,330 a 1,415. La conclusión cualitativa se **refuerza**.
4. **Nota 15 · el barrido no congela el peso propio.** Hay que añadir la columna de $N$ total y
   corregir la lectura: lo que la Ec. (25) predice es el error de la hipótesis plana, no la
   desaparición del levantamiento.

### Cierre de la auditoría (2026-07-26): qué resistió y qué no

**Lo que resistió.** Ningún experimento ni modelo quedó desmentido. Los auditores recalcularon de
forma independiente —sin reusar los scripts— las dos reglas de la nota 3, los 240 valores de tablas
de la nota 2, la errata de la Tabla 9.3 de la nota 5, los 16 asentamientos de la nota 4, el
equilibrio anclado de la nota 14 (incluido su caso límite a $3{,}55\cdot10^{-15}$) y el barrido
completo de la nota 15. Todo cerró. **La aritmética de la sección es sólida; lo que falla es lo que
la rodea.**

**Las tres familias de defecto, por frecuencia:**

1. **Parámetros y bases que el post no declara** (aparece en 12 de 15). El lector no puede
   reproducir el número aunque el número esté bien: el FS = 3 de la nota 2, el $\gamma = 18$ de la
   3, el $\delta'$ y el $N_{60}$ de la 11 —que solo existe dentro del texto rasterizado de un
   SVG—, el $E$ del hormigón de la 15, las 2 barras traccionadas de la 14.
2. **Cifras que derivan entre notas que se citan entre sí** (11 de 15). La brecha de la nota 2
   citada como 30 / 31 / 34 %; $C_s$ contra $C_r$; 5 mm contra 3–6 mm para la misma tabla de Das;
   $C'_\alpha$ 0,011 contra 0,0108; la primaria a 1,2 contra 1,5 años.
3. **Afirmaciones más fuertes que su respaldo** (9 de 15). «Terzaghi es *sistemáticamente*
   conservadora» (contraejemplo construido), «el deslizamiento *no está en Das*» (§15.6 lo tiene),
   «las siete fórmulas coinciden *por construcción*» (una no), «el momento restaurador es *fijo*»
   (crece 30 %), «*el 1* de la Ec. (25) está calibrado» (hay correlación, no evidencia de
   calibración).

**Los dos casos donde el post contradice a su propia máquina:**

- La nota 10 publica «el muro pasa por los pelos» con $FS = 1{,}4960 < 1{,}50$, y
  `post10_muro_completo.py` imprime **«NO CUMPLE»**.
- La nota 11 publica 886 y 2.467 kN donde su script imprime **887 y 2.465**, sin convención de
  redondeo que lo explique.

En los otros ocho posts con script verificado los veredictos coinciden — el patrón no es general.

**Un hallazgo que cambia una tesis publicada**: en la nota 15 el barrido de espesores **no congela
el peso propio**, que crece de 105 a 357 tonf. Por eso «el levantamiento ya desapareció» en el
umbral: lo hace desaparecer el peso, no la rigidez. Congelando el peso, el levantamiento converge a
**2,39 m** — exactamente el valor que el propio post da para la hipótesis rígida. La columna de
error, que es lo que sostiene la tesis de calibración, **sí es robusta** (2 % en el umbral), y un
auditor lo confirmó por un segundo camino: barriendo $k_v$ en vez del espesor, el error en la razón
1,00 vuelve a dar 1,020.

### Vacíos de fuente (verificados, no son omisiones del autor)

- **Empuje sísmico (Mononobe-Okabe).** No está en Das cap. 14/15 **ni** en Sáez, *Fundamentos de
  Geotecnia* (PUC). Un ejemplo de muro sísmico —el complemento obvio del post 10 y el que la
  industria chilena pide— **requiere conseguir esa fuente aparte**. Es el bloqueo real para
  extender el bloque 3.
- **Distorsión angular admisible.** Das 4ª ed. no entrega límites (verificado al procesar el
  cap. 17, que solo llega al asentamiento total tolerable de 25 mm en zapatas), y NCh2369 10.1.5
  la remite a los objetivos de desempeño *«específicamente definidos para el proyecto»*. El post
  15 lo declara explícitamente en vez de inventar un límite; mantener ese criterio.
- **Licuefacción.** C10.2.1 de NCh2369 la nombra como motivo para ir a fundación profunda, pero
  el Cap. 10 no da procedimiento. Cubrirla pediría NCh433 u otra fuente.

## H. NCh 2369:2025 — la norma con que se firma (subsección `/apuntes/nch2369`)

Estrenada el **2026-08-03**. Existía un hueco raro: la norma se citaba en **39 posts** de todas
las secciones y no había ni una nota que la explicara. La galería vive en
`/apuntes/nch2369` (grupo `normativas` de `SUBSECTIONS`, `src/lib/apuntes.ts`; página en
`src/pages/apuntes/nch2369/index.astro`, copia del patrón de los libros). Las notas se ordenan
por el primer número de `chapter`, así que basta con nombrarlas `Caps. 1–4`, `Cap. 5`, etc.

**Fuente:** el PDF de la 3.ª edición, **no** las fichas de
`material_teorico/referencias/NCh2369-2025/`, que no están auditadas — y en esta tanda se les
encontró un error (ver abajo). Receta: `pdfplumber`, `pg.crop((40, 50, 305, 800))` para la
columna normativa y `(305, 50, 570, 800)` para el comentario; **página PDF = página norma + 7**.

| ID | Nota | Cláusulas | Post | Figuras | Audit. |
|----|------|-----------|:----:|:-------:|:------:|
| H1 | **El contrato: alcance, desempeño y combinaciones** | 1–4 + Anexo B | [x] | 1 SVG a mano | ⚠️ 2026-08-03 (3 aplicados; 14 abiertos, sin 🔴 ni 🟠) |
| H2 | **El espectro de diseño y sus tres correcciones** | 5.4 y 6.1 | [x] | 2 SVG **generados** | ⚠️ 2026-08-03 (7 aplicados; 7 abiertos, sin 🔴 ni 🟠) |
| H3 | **El 0,7R₁: diseño por capacidad como multiplicador** | 4.1, 5.12–5.14, 8 | [x] | — (deuda) | ⚠️ 2026-08-03 (10 aplicados, incl. 1🔴; 6 abiertos) |

**Novedad de infraestructura: figuras calculadas, no dibujadas.**
`scripts/render-espectro-nch2369.mjs` (`npm run figuras:espectro`) importa
`src/lib/nch2369-spectrum.ts` con el patrón esbuild + `import()` de `verify-planilla.mjs`, y emite
los dos SVG del espectro a `public/apuntes/nch2369/`. Cero JS en la página y una sola fuente de
verdad entre la nota y el código. Es el primer caso en el repo de una figura de contenido que se
regenera desde el código. (El módulo vivía en `src/lib/sap-scripts/`; se mudó al retirar la
herramienta el 2026-08-05 — sección J.)

**Los tres hallazgos que valen más que las notas:**

1. **La Ec. (4) de la ficha del cerebro estaba mal transcrita.** El espectro vertical lleva
   $1{,}7\,T_V/T_0$ (se **comprime** en período); la ficha decía $T_V/(1{,}7\,T_0)$ y lo glosaba
   como «estirado por 1,7». Factor 2,89 dentro del paréntesis. El puerto TS siempre estuvo bien.
   Corregido en `material_teorico/.../cap05-analisis-sismico.md` con nota al pie. **Confirma el
   hallazgo G-J**: las fichas no están auditadas y los posts las citaban como fuente.
2. **`nch2369-spectrum.ts` no implementaba la rama `R = 1 → R* = 1` de la Ec. (1b)**, y el
   backend Python vendoreado tampoco (`_r_star` en `backend_modelo_base.py`). Para $R = 1$
   —«estructuras diseñadas para permanecer elásticas», Tabla 7 fila 1— devolvía hasta **1,5** en
   $T \to 0$, o sea que **dividía el espectro por 1,5 donde la norma no permite reducir**: hasta
   33 % menos espectro, del lado inseguro, y en silencio. **✅ CORREGIDO el 2026-08-05** (sección
   J): el fix ya no va por `Skills_SAP` porque el backend vendoreado se borró con la herramienta;
   la rama está en `src/lib/nch2369-spectrum.ts`. Verificado regenerando las dos figuras: salen
   **byte-idénticas**, o sea que el bug nunca alcanzaba a una figura publicada — vivía en la rama
   que solo tocaba quien pidiera $R = 1$ en el formulario, que ya no existe.
3. **La norma calcula $R^*$ una sola vez, con $T^*$** («el período del modo con mayor masa de
   traslación equivalente»), no período a período. La curva que se dibuja en la figura usa
   $R^*(T)$, que es más conservadora para los modos altos — un factor **3,33** en $T = 0$ para el
   caso de la figura. No es un error, pero conviene declarar cuál se usó.

**Lo que la galería queda esperando** (en orden de retorno):

- [ ] **H4. Métodos de análisis y corte basal** (5.5 a 5.11): AEE, AME, modelo matemático,
  acción vertical, análisis especiales. Engancha con D6, D11 y C2.
- [ ] **H5. Deformaciones y equipos** (6–7): deriva, separación entre estructuras, $F_p$, $K_p$,
  Tabla 8, $R_p$, anclajes de equipos. La Ec. (19) tiene el radical dibujado como trazo
  vectorial — leerla del PDF con cuidado.
- [ ] **H6. Hormigón armado** (9), con el enredo NCh430 → **DS 60**, cuya ficha ya existe en
  `material_teorico/referencias/DS60-2011/`.
- [ ] **H7. Fundaciones** (10) como puente a los cuatro ejemplos del bloque 5 de Geotecnia — nota
  corta, de mapeo, para no duplicar lo publicado.
- **Bloqueado por fuente:** cláusulas 11 a 14 (estanques y chimeneas, galpones y estanterías,
  muelles, generación eléctrica) y los anexos informativos A, C, D y E **no están procesados**.
- **Deuda menor:** H3 no tiene figura (un esquema de la cadena $R \to R^* \to R_1 \to 0{,}7R_1$
  es lo que le falta al §1), y quedan 27 hallazgos 🟡/🔵 abiertos entre las tres.

## I. Sección «Oficio» — la línea corta de práctica (estrenada 2026-08-05)

Diseño completo en `docs/superpowers/specs/2026-08-05-seccion-oficio-design.md`.

El blog tenía un formato dominante muy pesado (experimento paramétrico + referencia cerrada + mapa
de error) y ninguna línea que se leyera rápido. La sección `Fundamentos` —que tenía **un solo
post**, `capacidad-vs-resistencia`, y ya era esa voz— **se renombró a `Oficio`** y aloja la línea
nueva. No se creó una sección aparte: `section` en blog es texto libre, `contarTemas()` deriva los
chips de lo publicado y no hay ruta por sección, así que el renombre fue una línea de frontmatter
sin URLs rotas.

**Público**: ingeniero con 2–5 años. **Formato**: 800–1.500 palabras, una idea por post, SVG solo
cuando el esquema haga un trabajo que el texto no puede. **Fuente**: destilar lo ya publicado +
cálculo nuevo y corto + lectura crítica de norma; la anécdota de oficina queda fuera porque no es
verificable desde el repo.

Tres formatos recurrentes, reconocibles desde el título:

| Formato | Promesa | Cierre obligado |
|---|---|---|
| **El número, la banda y dónde se rompe** | Una magnitud que se cita de memoria: valor típico, banda real medida y la frontera donde deja de valer | El enlace al post que mide cada cifra |
| **Qué dice de verdad esa cláusula** | Una disposición que se aplica en automático, leída del PDF vigente | Qué cambia en la planilla de quien la heredó |
| **El error que no da alarma** | Un modelo que equilibra perfecto y está mal | Cómo se detecta en 10 minutos |

Regla del formato de bolsillo: **un número por post**.

**PDF** = exige abrir la norma vigente antes de escribir un valor (regla no negociable de
`CLAUDE.md`). El resto destila cifras ya publicadas y verificadas acá: el trabajo es la compresión y
el enlace, no el recálculo.

| ID | Post | Formato | PDF | Estado |
|----|------|---------|:---:|:------:|
| I1 | **Cinco errores que no dan ninguna alarma** (`oficio-errores-sin-alarma`) | error sin alarma | — | [x] 2026-08-05 |
| I2 | **Rígido y flexible no son adjetivos: son una razón** (`oficio-rigido-y-flexible`) | criterio | sí (§B3.4) | [x] 2026-08-05 |
| I3 | **Una sección puede ser esbelta y compacta a la vez** (`oficio-esbelta-y-compacta`) | cláusula | sí (B4.1a/b) | [x] 2026-08-05 |
| I4 | ¿Es creíble el período que te devolvió el modelo? | bolsillo | — | [ ] |
| I5 | θ = 0,10: cuándo P-Delta deja de ser un detalle | bolsillo | — | [ ] |
| I6 | e = L/6: el kern y la presión que la lineal no ve | bolsillo | — | [ ] *(riesgo de solape)* |
| I7 | Cuántos modos son suficientes | bolsillo | — | [ ] |
| I8 | El corte de losas se cayó a la mitad y nadie avisó | cláusula | sí | [ ] |
| I9 | El espesor de tabla no es un mínimo: es el diseño | cláusula | sí | [ ] |
| I10 | El φ de anclajes que usa tu planilla ya no existe | cláusula | sí | [ ] |
| I11 | Los factores de uso no son comparables entre sí | criterio | — | [ ] |
| I12 | La revisión de 10 minutos antes de creerle a un modelo | error sin alarma | — | [ ] |

**I1 es el que define la sección**: sus cinco casos ya están medidos en este blog —la zapata con
resortes lineales que inventa −116 kPa de tracción con equilibrio exacto (D8), Eigen que devuelve
corte basal **0 tonf** sin un solo mensaje (D11), el factor de escala 386.089 del caso RS (D6), la
rótula M3 que sobre-predice 16 % e **invierte la secuencia de daño** de modo que el resultado
*parece* diseño por capacidad (D2), y el `R = 1` del espectro NCh2369 que reducía donde la norma lo
prohíbe (hallazgo H2, **corregido el 2026-08-05**; el caso 5 del post se reescribió en pasado)—,
así que no pide experimento nuevo.

**I6 está marcado con riesgo**: es el que más se solapa con lo publicado (D8 y el laboratorio de la
zapata). Se escribe solo si el enfoque queda en el número; si no, cae.

**Deuda que abre I10**: `src/lib/placaBaseAnchorage.ts` sigue en φ = 0,70 y en la regla lineal ≤ 1,2
de 318-19 — el mismo ítem pendiente de la sección A.

**Tanda de estreno (2026-08-05): I1, I2 e I3 publicados.** Build verde, 176 páginas. Notas de la
tanda:

- **I2 salió sin SVG.** El plan pedía un eje adimensional con las cuatro fronteras superpuestas, y
  al escribirlo quedó claro que **no son conmensurables** ($K_r$, $\lambda L$ y $K_sL/EI$ miden
  cosas distintas): superponerlas habría sugerido una comparación que no existe. La tabla de tres
  filas hace el trabajo. I3 **sí** lleva figura
  (`public/oficio-esbelta-y-compacta/fig-dos-tablas.svg`), que ahí el eje sí es común.
- **I2 dejó el diafragma sin umbral**, declarándolo en el texto: el criterio cuantitativo está en
  normas que no estaban disponibles al escribir, y la regla de fuentes manda no escribir el número.
  Queda como ampliación si aparece la fuente.
- **I1 publicaba un bug vivo del repo** (la rama `R = 1` que faltaba en `rStar()`) como su quinto
  caso. **Cerrado el mismo día**: al retirar la herramienta (sección J) el arreglo dejó de depender
  de `Skills_SAP` y se hizo en `src/lib/nch2369-spectrum.ts`; el caso 5 del post está reescrito en
  pasado y ahora cuenta el ciclo completo, incluido que la verificación fue regenerar las figuras y
  comprobar que no se movían.
- **Los tres auditados el 2026-08-05**: 32 hallazgos (2🔴 · 11🟠 · 12🟡 · 7🔵). Los 13 🔴/🟠
  aplicados; el detalle en `AUDIT.md`.

**Rutas desactualizadas en `CLAUDE.md`** (encontrado en esta tanda): la unidad `F:` no existe en la
máquina. Las normas están en
`C:\Users\francisco.carrasco\OneDrive - PSC INGENIERÍA SpA\Escritorio\Documentos\Normas\` y
`material_teorico` en `C:\Proyectos_Python\material_teorico`. Además **PyMuPDF no está instalado**:
la rasterización de esta tanda se hizo con `pypdfium2` + `PIL`, que sí están.

## J. Retiro de las herramientas SAP2000 (2026-08-05)

Se sacaron del sitio **`/herramientas/sap-scripts`** (el constructor de scripts) y
**`/herramientas/mcp-sap2000`** (la documentación del servidor MCP). Las dos eran la cara web de
`fcocarrascob/Skills_SAP`, un repo independiente que vincula SAP2000 con Python: ese trabajo tiene
su propio lugar y el sitio estaba pagando el costo de mantener la copia sincronizada.

**El detonante fue normativo.** El generador vendorizaba `_r_star()` del backend Python, sin la
rama `R = 1 → R* = 1` de la Ec. (1b) — y el `.py` que el usuario descargaba y corría contra su
modelo llevaba ese error adentro. La regla del repo mandaba corregir aguas arriba, en `Skills_SAP`
+ `npm run sync:sap-scripts`, o sea que **una corrección normativa del sitio dependía de un repo
externo**. Retirando la herramienta, esa atadura desaparece.

**Lo que se encontró al ejecutarlo:**

- **El submódulo ya no existía.** `.gitmodules` estaba vacío y no había carpeta `vendor/`, así que
  `npm run sync:sap-scripts` llevaba tiempo sin poder correr. La herramienta ya estaba huérfana de
  su fuente y nadie se había enterado.
- **El bug nunca alcanzó una figura publicada.** `render-espectro-nch2369.mjs` pide la curva de
  referencia con `applyRStar = false` y la de diseño con `R = 5`, así que `rStar()` nunca se
  llamaba con `R = 1`. Verificado regenerando los dos SVG después del arreglo: **byte-idénticos**.
- **`nch2369-spectrum.ts` no era de la herramienta.** Vivía en `src/lib/sap-scripts/` pero su
  trabajo real es dibujar las figuras de la nota del espectro. Se mudó a `src/lib/`, dejó de ser un
  puerto de Python vendorizado y ahí se le agregó la rama que faltaba — un `if` de una línea.

**Qué quedó:**

- `src/lib/nch2369-spectrum.ts`, con la Ec. (1b) completa y un solo consumidor
  (`npm run figuras:espectro`).
- El contenido de MCP SAP2000 sobrevive como post: `blog/mcp-sap2000-como-esta-armado.mdx`,
  sección SAP2000. **No es la transcripción de la página** —eso era material de referencia y
  envejece mal— sino las tres decisiones de diseño que la sostienen: el registry de 136 funciones
  verificadas, el sandbox de ejecución y la convención ByRef del OAPI. Declarado como instantánea
  fechada, con el repo como fuente.
- `CLAUDE.md` reemplazó la sección del Script Builder por una nota de retiro con la regla nueva:
  **no reintroducir una dependencia de `Skills_SAP` desde este repo** — se enlaza, no se vendoriza.

**Efecto en el sitio**: `/herramientas` baja de siete tarjetas a cinco; el build, de 176 páginas a
174 (menos tres páginas, más el post).

## Recomendación de orden (actualizada 2026-07-14)

Publicado a la fecha: **serie Fundaciones** completa (5 posts, jun 2026); A1–A3, B1–B2;
**C1 y C2 completos** (serie Sísmica partes 1–3 con el estimador de T₁); **serie D
técnica** con Gap/Hook (D0), Rótulas pushover (D2), Respuesta espectral (D6), Section Cut
(D7) y Solo-compresión (D8); **serie "El factor R" completa** (E1–E5: 5 posts + 2
experimentos, jul 2026). Lo que sigue:

1. ~~**D11 (Ritz vs Eigen)**~~ — ✅ hecho 2026-07-14 (post publicado).
2. ~~**D13 (pushover MF vs CBF chevron)**~~ — ✅ hecho 2026-07-14 (tutorial, post + 7 capturas
   GUI integradas).
3. **D12 (cables / no linealidad geométrica)** — showpiece avanzado, **próximo paso activo**.
4. **C3 → C4** como cierre del arco sísmico: C3 ya tiene su teaser cuantitativo desde D6
   (ρ=0.72, gap SRSS-CQC ~12 %); C4 reutiliza el modal de C2 (piso blando ×1.6–1.9) y el
   espectral de C3, conecta con el generador de espectros y termina en el surrogate de
   campo (POD del perfil de deriva).
5. **D9 / D10** (pandeo lineal, diafragma rígido vs flexible) como intercalados técnicos
   de un modelo entre experimentos. (A4 ya no está: la herramienta se retiró — sección J.)
6. **E6 (densificaciones del factor R)** y **densificación de C1** (fase 5) solo si otro
   experimento las pide; si no, se dejan caer.

**Anexo 2026-07-26 — Geotecnia (sección G, nueva).** La sección `/geotecnia` se estrenó el
2026-07-25 y creció fuera de este orden: 15 posts en dos días, con el bloque 5 (NCh2369 Cap. 10)
completo el 2026-07-26. Lo que pide atención, en orden:

1. **Auditar los 14 posts pendientes** (G-A). Es la deuda más grande del repo en proporción:
   una sección entera publicada con una sola auditoría. El bloque 1 primero, porque su tesis la
   citan las notas posteriores.
2. **G-12, pozos perforados** — la única promesa publicada de la sección que sigue abierta, con
   la fuente ya procesada y verificada.
3. **G-B / G-C** (el wrapper por fecha, la primera planilla de canvas en geotecnia) como
   intercalados mecánicos.
