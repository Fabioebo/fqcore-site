/* FQCORE — cálculos das ferramentas para instrumentistas.
   Escrito em JavaScript antigo (ES3) de propósito: roda em qualquer navegador
   e também no cscript do Windows, onde os testes de referência são rodados
   (teste-calc.js). Sem dependências. Expõe o objeto global FQCalc. */
var FQCalc = (function () {

  // Coeficientes NIST SRD 60 (ITS-90), gerados a partir da tabela oficial.
  // E (mV) = soma c[i]*t^i  [+ a0*exp(a1*(t-a2)^2) no tipo K acima de 0 °C]
  var TC = {
    B: [
      { tmin: 0.0, tmax: 630.615, c: [0.0, -0.00024650818346, 5.9040421171e-06, -1.3257931636e-09, 1.5668291901e-12, -1.694452924e-15, 6.2990347094e-19], exp: null },
      { tmin: 630.615, tmax: 1820.0, c: [-3.8938168621, 0.02857174747, -8.4885104785e-05, 1.5785280164e-07, -1.6835344864e-10, 1.1109794013e-13, -4.4515431033e-17, 9.8975640821e-21, -9.3791330289e-25], exp: null }
    ],
    E: [
      { tmin: -270.0, tmax: 0.0, c: [0.0, 0.058665508708, 4.5410977124e-05, -7.7998048686e-07, -2.5800160843e-08, -5.9452583057e-10, -9.3214058667e-12, -1.0287605534e-13, -8.0370123621e-16, -4.3979497391e-18, -1.6414776355e-20, -3.9673619516e-23, -5.5827328721e-26, -3.4657842013e-29], exp: null },
      { tmin: 0.0, tmax: 1000.0, c: [0.0, 0.05866550871, 4.5032275582e-05, 2.8908407212e-08, -3.3056896652e-10, 6.502440327e-13, -1.9197495504e-16, -1.2536600497e-18, 2.1489217569e-21, -1.4388041782e-24, 3.5960899481e-28], exp: null }
    ],
    J: [
      { tmin: -210.0, tmax: 760.0, c: [0.0, 0.050381187815, 3.047583693e-05, -8.568106572e-08, 1.3228195295e-10, -1.7052958337e-13, 2.0948090697e-16, -1.2538395336e-19, 1.5631725697e-23], exp: null },
      { tmin: 760.0, tmax: 1200.0, c: [296.45625681, -1.4976127786, 0.0031787103924, -3.1847686701e-06, 1.5720819004e-09, -3.0691369056e-13], exp: null }
    ],
    K: [
      { tmin: -270.0, tmax: 0.0, c: [0.0, 0.039450128025, 2.3622373598e-05, -3.2858906784e-07, -4.9904828777e-09, -6.7509059173e-11, -5.7410327428e-13, -3.1088872894e-15, -1.0451609365e-17, -1.9889266878e-20, -1.6322697486e-23], exp: null },
      { tmin: 0.0, tmax: 1372.0, c: [-0.017600413686, 0.038921204975, 1.8558770032e-05, -9.9457592874e-08, 3.1840945719e-10, -5.6072844889e-13, 5.6075059059e-16, -3.2020720003e-19, 9.7151147152e-23, -1.2104721275e-26], exp: [0.1185976, -0.0001183432, 126.9686] }
    ],
    N: [
      { tmin: -270.0, tmax: 0.0, c: [0.0, 0.026159105962, 1.0957484228e-05, -9.3841111554e-08, -4.6412039759e-11, -2.6303357716e-12, -2.2653438003e-14, -7.6089300791e-17, -9.3419667835e-20], exp: null },
      { tmin: 0.0, tmax: 1300.0, c: [0.0, 0.025929394601, 1.571014188e-05, 4.3825627237e-08, -2.5261169794e-10, 6.4311819339e-13, -1.0063471519e-15, 9.9745338992e-19, -6.0863245607e-22, 2.0849229339e-25, -3.0682196151e-29], exp: null }
    ],
    R: [
      { tmin: -50.0, tmax: 1064.18, c: [0.0, 0.00528961729765, 1.39166589782e-05, -2.38855693017e-08, 3.56916001063e-11, -4.62347666298e-14, 5.00777441034e-17, -3.73105886191e-20, 1.57716482367e-23, -2.81038625251e-27], exp: null },
      { tmin: 1064.18, tmax: 1664.5, c: [2.95157925316, -0.00252061251332, 1.59564501865e-05, -7.64085947576e-09, 2.05305291024e-12, -2.93359668173e-16], exp: null },
      { tmin: 1664.5, tmax: 1768.1, c: [152.232118209, -0.268819888545, 0.000171280280471, -3.45895706453e-08, -9.34633971046e-15], exp: null }
    ],
    S: [
      { tmin: -50.0, tmax: 1064.18, c: [0.0, 0.00540313308631, 1.2593428974e-05, -2.32477968689e-08, 3.22028823036e-11, -3.31465196389e-14, 2.55744251786e-17, -1.25068871393e-20, 2.71443176145e-24], exp: null },
      { tmin: 1064.18, tmax: 1664.5, c: [1.32900444085, 0.00334509311344, 6.54805192818e-06, -1.64856259209e-09, 1.29989605174e-14], exp: null },
      { tmin: 1664.5, tmax: 1768.1, c: [146.628232636, -0.258430516752, 0.000163693574641, -3.30439046987e-08, -9.43223690612e-15], exp: null }
    ],
    T: [
      { tmin: -270.0, tmax: 0.0, c: [0.0, 0.038748106364, 4.4194434347e-05, 1.1844323105e-07, 2.0032973554e-08, 9.0138019559e-10, 2.2651156593e-11, 3.6071154205e-13, 3.8493939883e-15, 2.8213521925e-17, 1.4251594779e-19, 4.8768662286e-22, 1.079553927e-24, 1.3945027062e-27, 7.9795153927e-31], exp: null },
      { tmin: 0.0, tmax: 400.0, c: [0.0, 0.038748106364, 3.329222788e-05, 2.0618243404e-07, -2.1882256846e-09, 1.0996880928e-11, -3.0815758772e-14, 4.547913529e-17, -2.7512901673e-20], exp: null }
    ]
  };

  // ── utilidades ─────────────────────────────────────────────────────────
  function poly(c, x) {
    var s = 0, i;
    for (i = c.length - 1; i >= 0; i--) { s = s * x + c[i]; }
    return s;
  }

  // Resolve A·x = b por eliminação de Gauss com pivoteamento parcial.
  function resolver(A, b) {
    var n = b.length, M = [], i, j, k, p, t, f, x = [];
    for (i = 0; i < n; i++) { M[i] = A[i].slice(0); M[i].push(b[i]); }
    for (k = 0; k < n; k++) {
      p = k;
      for (i = k + 1; i < n; i++) { if (Math.abs(M[i][k]) > Math.abs(M[p][k])) { p = i; } }
      if (Math.abs(M[p][k]) < 1e-300) { throw new Error("Sistema sem solução única. Confira se os pontos não estão repetidos."); }
      t = M[k]; M[k] = M[p]; M[p] = t;
      for (i = k + 1; i < n; i++) {
        f = M[i][k] / M[k][k];
        for (j = k; j <= n; j++) { M[i][j] -= f * M[k][j]; }
      }
    }
    for (i = n - 1; i >= 0; i--) {
      t = M[i][n];
      for (j = i + 1; j < n; j++) { t -= M[i][j] * x[j]; }
      x[i] = t / M[i][i];
    }
    return x;
  }

  // Mínimos quadrados: linhas de X (cada linha = valores das funções-base) contra y.
  function minimosQuadrados(X, y) {
    var m = X[0].length, N = [], v = [], i, j, k;
    for (i = 0; i < m; i++) { N[i] = []; v[i] = 0; for (j = 0; j < m; j++) { N[i][j] = 0; } }
    for (k = 0; k < y.length; k++) {
      for (i = 0; i < m; i++) {
        v[i] += X[k][i] * y[k];
        for (j = 0; j < m; j++) { N[i][j] += X[k][i] * X[k][j]; }
      }
    }
    return resolver(N, v);
  }

  // Raiz por bisseção com refinamento: f crescente ou decrescente em [a, b].
  function raiz(f, a, b, tol) {
    var fa = f(a), fb = f(b), m, fm, i;
    if (fa === 0) { return a; }
    if (fb === 0) { return b; }
    if ((fa > 0) === (fb > 0)) { return NaN; }
    for (i = 0; i < 200; i++) {
      m = (a + b) / 2; fm = f(m);
      if (fm === 0 || (b - a) / 2 < tol) { return m; }
      if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else { b = m; }
    }
    return (a + b) / 2;
  }

  // ── Termopares (NIST SRD 60) ──────────────────────────────────────────
  function tcFaixa(tipo) {
    var s = TC[tipo];
    if (!s) { throw new Error("Tipo de termopar desconhecido: " + tipo); }
    return { min: s[0].tmin, max: s[s.length - 1].tmax };
  }

  function tcEmf(tipo, t) {
    var segs = TC[tipo], i, s, e;
    if (!segs) { throw new Error("Tipo de termopar desconhecido: " + tipo); }
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      if (t >= s.tmin && t <= s.tmax) {
        e = poly(s.c, t);
        if (s.exp) { e += s.exp[0] * Math.exp(s.exp[1] * (t - s.exp[2]) * (t - s.exp[2])); }
        return e;
      }
    }
    throw new Error("Temperatura fora da faixa do tipo " + tipo + " (" + segs[0].tmin + " a " + segs[segs.length - 1].tmax + " °C).");
  }

  // Temperatura a partir da f.e.m. medida, com compensação da junta de referência.
  function tcTemp(tipo, emf, tJunta) {
    var f = tcFaixa(tipo), alvo = emf + (tJunta ? tcEmf(tipo, tJunta) : 0), t;
    // O tipo B tem f.e.m. quase nula e não monotônica abaixo de ~50 °C;
    // a busca começa onde a curva já é crescente.
    var ini = tipo === "B" ? 50 : f.min;
    t = raiz(function (x) { return tcEmf(tipo, x) - alvo; }, ini, f.max, 1e-9);
    if (isNaN(t)) { throw new Error("F.e.m. fora da faixa do tipo " + tipo + "."); }
    return t;
  }

  // ── PT100/PT1000: Callendar–Van Dusen (IEC 60751) ─────────────────────
  var IEC = { A: 3.9083e-3, B: -5.775e-7, C: -4.183e-12 };

  function cvdR(t, R0, A, B, C) {
    var r = 1 + A * t + B * t * t;
    if (t < 0) { r += C * (t - 100) * t * t * t; }
    return R0 * r;
  }

  function cvdT(R, R0, A, B, C) {
    var t, d, i, f, df;
    if (R >= R0) {
      if (B === 0) { return (R / R0 - 1) / A; }
      d = A * A - 4 * B * (1 - R / R0);
      if (d < 0) { throw new Error("Resistência fora do alcance da equação."); }
      return (-A + Math.sqrt(d)) / (2 * B);
    }
    t = (R / R0 - 1) / A;
    for (i = 0; i < 60; i++) {
      f = cvdR(t, R0, A, B, C) - R;
      df = R0 * (A + 2 * B * t + C * (4 * t * t * t - 300 * t * t));
      d = f / df; t -= d;
      if (Math.abs(d) < 1e-12) { break; }
    }
    return t;
  }

  // Ajuste por mínimos quadrados de R0, A, B (e C, se houver ponto abaixo de 0 °C).
  // R = R0 + (R0·A)·t + (R0·B)·t² + (R0·C)·(t−100)·t³  é linear nos parâmetros.
  function cvdAjustar(pontos, fixarR0) {
    var temNeg = false, i, X = [], y = [], p, t, R0, out, n;
    for (i = 0; i < pontos.length; i++) { if (pontos[i].t < 0) { temNeg = true; } }
    n = (fixarR0 ? 0 : 1) + 2 + (temNeg ? 1 : 0);
    if (pontos.length < n) {
      throw new Error("Pontos insuficientes: são necessários pelo menos " + n + " pontos" + (temNeg ? " (há ponto abaixo de 0 °C, então C também é ajustado)." : "."));
    }
    for (i = 0; i < pontos.length; i++) {
      t = pontos[i].t;
      var linha = [];
      if (!fixarR0) { linha.push(1); }
      linha.push(t, t * t);
      if (temNeg) { linha.push(t < 0 ? (t - 100) * t * t * t : 0); }
      X.push(linha);
      y.push(fixarR0 ? pontos[i].R - fixarR0 : pontos[i].R);
    }
    p = minimosQuadrados(X, y);
    R0 = fixarR0 ? fixarR0 : p.shift();
    out = { R0: R0, A: p[0] / R0, B: p[1] / R0, C: temNeg ? p[2] / R0 : 0, ajustouC: temNeg, residuos: [] };
    for (i = 0; i < pontos.length; i++) {
      out.residuos.push({
        t: pontos[i].t, R: pontos[i].R,
        Rcalc: cvdR(pontos[i].t, out.R0, out.A, out.B, out.C),
        tCalc: cvdT(pontos[i].R, out.R0, out.A, out.B, out.C)
      });
    }
    return out;
  }

  // ── SPRT: ITS-90 ──────────────────────────────────────────────────────
  // Funções de referência Wr(T90) da escala (texto oficial da ITS-90).
  var ITS_A = [-2.13534729, 3.18324720, -1.80143597, 0.71727204, 0.50344027, -0.61899395,
               -0.05332322, 0.28021362, 0.10715224, -0.29302865, 0.04459872, 0.11868632, -0.05248134];
  var ITS_C = [2.78157254, 1.64650916, -0.13714390, -0.00649767, -0.00234444, 0.00511868,
               0.00187982, -0.00204472, -0.00046122, 0.00045724];

  function itsWr(tC) {
    var T = tC + 273.15, x;
    // Tolerância de 1e-9 nos limites: a conversão °C <-> K arredonda no último dígito.
    if (T < 13.8033 - 1e-9 || tC > 961.78 + 1e-9) { throw new Error("Fora da faixa da ITS-90 para SPRT (13,8033 K a 961,78 °C)."); }
    if (T < 273.16) {
      x = (Math.log(T / 273.16) + 1.5) / 1.5;
      return Math.exp(poly(ITS_A, x));
    }
    x = (T - 754.15) / 481;
    return poly(ITS_C, x);
  }

  // Inversa por busca numérica na própria função de referência (exata, sem
  // depender das funções inversas aproximadas da norma).
  function itsT(Wr) {
    var t;
    if (Wr >= 1) { t = raiz(function (x) { return itsWr(x) - Wr; }, 0.01, 961.78, 1e-10); }
    else { t = raiz(function (x) { return itsWr(x) - Wr; }, 13.8033 - 273.15, 0.01, 1e-10); }
    if (isNaN(t)) { throw new Error("W fora da faixa da ITS-90."); }
    return t;
  }

  // Subfaixas usuais de calibração de SPRT, com as funções de desvio da ITS-90.
  // termos(W) devolve os valores que multiplicam a, b, c.
  var FAIXAS = {
    "4":  { nome: "83,8058 K (Ar) a 0,01 °C", min: 83.8058 - 273.15, max: 0.01, pontos: ["Ar", "Hg"],
            termos: function (W) { return [W - 1, (W - 1) * Math.log(W)]; } },
    "5":  { nome: "−38,8344 °C (Hg) a 29,7646 °C (Ga)", min: -38.8344, max: 29.7646, pontos: ["Hg", "Ga"],
            termos: function (W) { return [W - 1, (W - 1) * (W - 1)]; } },
    "7":  { nome: "0,01 °C a 660,323 °C (Al)", min: 0.01, max: 660.323, pontos: ["Sn", "Zn", "Al"],
            termos: function (W) { return [W - 1, (W - 1) * (W - 1), (W - 1) * (W - 1) * (W - 1)]; } },
    "8":  { nome: "0,01 °C a 419,527 °C (Zn)", min: 0.01, max: 419.527, pontos: ["Sn", "Zn"],
            termos: function (W) { return [W - 1, (W - 1) * (W - 1)]; } },
    "9":  { nome: "0,01 °C a 231,928 °C (Sn)", min: 0.01, max: 231.928, pontos: ["In", "Sn"],
            termos: function (W) { return [W - 1, (W - 1) * (W - 1)]; } },
    "10": { nome: "0,01 °C a 156,5985 °C (In)", min: 0.01, max: 156.5985, pontos: ["In"],
            termos: function (W) { return [W - 1]; } },
    "11": { nome: "0,01 °C a 29,7646 °C (Ga)", min: 0.01, max: 29.7646, pontos: ["Ga"],
            termos: function (W) { return [W - 1]; } }
  };
  var PONTOS_FIXOS = {
    Ar: { nome: "Argônio (ponto triplo)", t: 83.8058 - 273.15 },
    Hg: { nome: "Mercúrio (ponto triplo)", t: -38.8344 },
    Ga: { nome: "Gálio (fusão)", t: 29.7646 },
    In: { nome: "Índio (solidificação)", t: 156.5985 },
    Sn: { nome: "Estanho (solidificação)", t: 231.928 },
    Zn: { nome: "Zinco (solidificação)", t: 419.527 },
    Al: { nome: "Alumínio (solidificação)", t: 660.323 }
  };

  // Coeficientes de desvio a partir dos W medidos nos pontos fixos da subfaixa.
  function itsCoeficientes(faixa, Wmedidos) {
    var F = FAIXAS[faixa], X = [], y = [], i, nome, W;
    if (!F) { throw new Error("Subfaixa desconhecida."); }
    for (i = 0; i < F.pontos.length; i++) {
      nome = F.pontos[i]; W = Wmedidos[nome];
      if (!(W > 0)) { throw new Error("Informe W no ponto " + PONTOS_FIXOS[nome].nome + "."); }
      X.push(F.termos(W));
      y.push(W - itsWr(PONTOS_FIXOS[nome].t));
    }
    return resolver(X, y);
  }

  function itsDesvio(faixa, coef, W) {
    var k = FAIXAS[faixa].termos(W), s = 0, i;
    for (i = 0; i < coef.length; i++) { s += coef[i] * k[i]; }
    return s;
  }

  // Temperatura a partir de W medido (W = R / R(0,01 °C)).
  function itsTdeW(faixa, coef, W) { return itsT(W - itsDesvio(faixa, coef, W)); }

  // W esperado numa temperatura: resolve W = Wr(t) + ΔW(W) por iteração.
  function itsWdeT(faixa, coef, t) {
    var Wr = itsWr(t), W = Wr, i, novo;
    for (i = 0; i < 100; i++) {
      novo = Wr + itsDesvio(faixa, coef, W);
      if (Math.abs(novo - W) < 1e-14) { return novo; }
      W = novo;
    }
    return W;
  }

  // Calibração por comparação: pontos (t90 de referência, R do SPRT) em
  // temperaturas quaisquer da subfaixa. Ajusta a função de desvio por
  // mínimos quadrados: W − Wr(t) = a·f1(W) + b·f2(W) [+ c·f3(W)].
  function itsAjustar(faixa, Rtpw, pontos) {
    var F = FAIXAS[faixa], X = [], y = [], i, W, coef, res = [], tc;
    if (!F) { throw new Error("Subfaixa desconhecida."); }
    if (!(Rtpw > 0)) { throw new Error("Informe R no ponto triplo da água."); }
    if (pontos.length < F.pontos.length) {
      throw new Error("Pontos insuficientes: a subfaixa " + faixa + " tem " + F.pontos.length + " coeficiente(s), então precisa de pelo menos " + F.pontos.length + " ponto(s) fora de 0,01 °C.");
    }
    for (i = 0; i < pontos.length; i++) {
      W = pontos[i].R / Rtpw;
      if (Math.abs(W - 1) < 1e-9) { throw new Error("O ponto de 0,01 °C não entra no ajuste: ele já é o R(0,01 °C)."); }
      X.push(F.termos(W));
      y.push(W - itsWr(pontos[i].t));
    }
    coef = pontos.length === F.pontos.length ? resolver(X, y) : minimosQuadrados(X, y);
    for (i = 0; i < pontos.length; i++) {
      W = pontos[i].R / Rtpw;
      tc = itsTdeW(faixa, coef, W);
      res.push({ t: pontos[i].t, R: pontos[i].R, W: W, tCalc: tc, Rcalc: itsWdeT(faixa, coef, pontos[i].t) * Rtpw });
    }
    return { coef: coef, residuos: res };
  }

  // ── Termopar calibrado: função de desvio ──────────────────────────────
  // ΔE(t) = E_cal(t) − E_NIST(t) = d1·t + d2·t² + ... (sem termo constante:
  // com junta a 0 °C a f.e.m. é zero por definição, para qualquer termopar).
  // Com a junta em tj, o próprio fio calibrado gera o desvio na junta também:
  //   E_medido = E_cal(t) − E_cal(tj)
  //            = E_NIST(t) − E_NIST(tj) + Σ dk·(t^k − tj^k)
  // que continua linear em dk, então o ajuste por mínimos quadrados é exato.
  function tcAjustar(tipo, pontos, grau, tJunta) {
    var X = [], y = [], i, k, linha, p, d, res = [], tj = tJunta || 0, ejN = tcEmf(tipo, tj), tc;
    if (!(grau >= 1 && grau <= 4)) { throw new Error("Grau da função de desvio deve ser de 1 a 4."); }
    if (pontos.length < grau) { throw new Error("Pontos insuficientes: um desvio de grau " + grau + " precisa de pelo menos " + grau + " ponto(s)."); }
    for (i = 0; i < pontos.length; i++) {
      linha = [];
      for (k = 1; k <= grau; k++) { linha.push(Math.pow(pontos[i].t, k) - Math.pow(tj, k)); }
      X.push(linha);
      y.push(pontos[i].E - (tcEmf(tipo, pontos[i].t) - ejN));
    }
    p = pontos.length === grau ? resolver(X, y) : minimosQuadrados(X, y);
    d = [0].concat(p);
    for (i = 0; i < pontos.length; i++) {
      tc = tcTempCal(tipo, d, pontos[i].E, tj);
      res.push({
        t: pontos[i].t, E: pontos[i].E,
        Ecal: tcEmfCal(tipo, d, pontos[i].t) - tcEmfCal(tipo, d, tj),
        desvio: tcDesvio(d, pontos[i].t), tCalc: tc
      });
    }
    return { d: d, residuos: res };
  }
  function tcDesvio(d, t) { return poly(d, t); }
  function tcEmfCal(tipo, d, t) { return tcEmf(tipo, t) + poly(d, t); }
  function tcTempCal(tipo, d, emf, tJunta) {
    var f = tcFaixa(tipo), alvo = emf + (tJunta ? tcEmfCal(tipo, d, tJunta) : 0), t;
    t = raiz(function (x) { return tcEmfCal(tipo, d, x) - alvo; }, tipo === "B" ? 50 : f.min, f.max, 1e-9);
    if (isNaN(t)) { throw new Error("F.e.m. fora da faixa do tipo " + tipo + "."); }
    return t;
  }

  // ── Transmissor / sinal analógico ─────────────────────────────────────
  function escala(x, xMin, xMax, yMin, yMax) {
    if (xMax === xMin) { throw new Error("A faixa não pode ter início igual ao fim."); }
    return yMin + (x - xMin) / (xMax - xMin) * (yMax - yMin);
  }

  // ── Ensaio de proficiência e comparação (ISO/IEC 17043, ISO 13528) ────
  function en(x, U, xr, Ur) {
    var d = Math.sqrt(U * U + Ur * Ur);
    if (!(d > 0)) { throw new Error("As incertezas não podem ser as duas zero."); }
    return (x - xr) / d;
  }
  function escoreZ(x, X, s) {
    if (!(s > 0)) { throw new Error("O desvio padrão para proficiência tem que ser maior que zero."); }
    return (x - X) / s;
  }
  function zeta(x, ux, X, uX) {
    var d = Math.sqrt(ux * ux + uX * uX);
    if (!(d > 0)) { throw new Error("As incertezas não podem ser as duas zero."); }
    return (x - X) / d;
  }
  // En: |En| ≤ 1 satisfatório. z e ζ: ≤ 2 satisfatório, entre 2 e 3 questionável, ≥ 3 insatisfatório.
  function avaliarEn(v) { return Math.abs(v) <= 1 ? "Satisfatório" : "Insatisfatório"; }
  function avaliarZ(v) { var a = Math.abs(v); return a <= 2 ? "Satisfatório" : (a < 3 ? "Questionável" : "Insatisfatório"); }

  // ── Tolerância de classe ──────────────────────────────────────────────
  // IEC 60751: tolerância = ±(a + b·|t|), com faixa de validade por construção.
  var CLASSES_RTD = {
    AA: { a: 0.1, b: 0.0017, fio: [-50, 250], filme: [0, 150] },
    A:  { a: 0.15, b: 0.002, fio: [-100, 450], filme: [-30, 300] },
    B:  { a: 0.3, b: 0.005, fio: [-196, 600], filme: [-50, 500] },
    C:  { a: 0.6, b: 0.01, fio: [-196, 600], filme: [-50, 600] }
  };
  function tolRTD(classe, t) {
    var c = CLASSES_RTD[classe];
    if (!c) { throw new Error("Classe desconhecida."); }
    return { tol: c.a + c.b * Math.abs(t), fio: c.fio, filme: c.filme };
  }

  // IEC 60584-1: cada faixa é [de, até, parte fixa (°C), fator de |t|].
  // R e S classe 1 acima de 1100 °C: ±[1 + 0,003·(t − 1100)], marcado "RS".
  var CLASSES_TC = {
    T: { "1": [[-40, 125, 0.5, 0], [125, 350, 0, 0.004]],
         "2": [[-40, 133, 1.0, 0], [133, 350, 0, 0.0075]],
         "3": [[-67, 40, 1.0, 0], [-200, -67, 0, 0.015]] },
    E: { "1": [[-40, 375, 1.5, 0], [375, 800, 0, 0.004]],
         "2": [[-40, 333, 2.5, 0], [333, 900, 0, 0.0075]],
         "3": [[-167, 40, 2.5, 0], [-200, -167, 0, 0.015]] },
    J: { "1": [[-40, 375, 1.5, 0], [375, 750, 0, 0.004]],
         "2": [[-40, 333, 2.5, 0], [333, 750, 0, 0.0075]] },
    K: { "1": [[-40, 375, 1.5, 0], [375, 1000, 0, 0.004]],
         "2": [[-40, 333, 2.5, 0], [333, 1200, 0, 0.0075]],
         "3": [[-167, 40, 2.5, 0], [-200, -167, 0, 0.015]] },
    N: { "1": [[-40, 375, 1.5, 0], [375, 1000, 0, 0.004]],
         "2": [[-40, 333, 2.5, 0], [333, 1200, 0, 0.0075]],
         "3": [[-167, 40, 2.5, 0], [-200, -167, 0, 0.015]] },
    R: { "1": [[0, 1100, 1.0, 0], [1100, 1600, "RS", 0]],
         "2": [[0, 600, 1.5, 0], [600, 1600, 0, 0.0025]] },
    S: { "1": [[0, 1100, 1.0, 0], [1100, 1600, "RS", 0]],
         "2": [[0, 600, 1.5, 0], [600, 1600, 0, 0.0025]] },
    B: { "2": [[600, 1700, 0, 0.0025]],
         "3": [[600, 800, 4.0, 0], [800, 1700, 0, 0.005]] }
  };
  // ASTM E230: limites padrão (STD) e especiais (SLE, "special limits of
  // error"), de 0 °C para cima. Cada faixa é [de, até, parte fixa (°C),
  // fator de |t|] e vale o MAIOR dos dois. Abaixo de 0 °C a norma tem
  // valores próprios (e não define SLE para todos os tipos), que não entram.
  var ASTM_TC = {
    T: { STD: [[0, 370, 1.0, 0.0075]], SLE: [[0, 370, 0.5, 0.004]] },
    E: { STD: [[0, 870, 1.7, 0.005]], SLE: [[0, 870, 1.0, 0.004]] },
    J: { STD: [[0, 760, 2.2, 0.0075]], SLE: [[0, 760, 1.1, 0.004]] },
    K: { STD: [[0, 1260, 2.2, 0.0075]], SLE: [[0, 1260, 1.1, 0.004]] },
    N: { STD: [[0, 1260, 2.2, 0.0075]], SLE: [[0, 1260, 1.1, 0.004]] },
    R: { STD: [[0, 1480, 1.5, 0.0025]], SLE: [[0, 1480, 0.6, 0.001]] },
    S: { STD: [[0, 1480, 1.5, 0.0025]], SLE: [[0, 1480, 0.6, 0.001]] },
    B: { STD: [[870, 1700, 0, 0.005]], SLE: [[870, 1700, 0, 0.0025]] }
  };
  // Devolve a tolerância (°C) ou null se a classe não cobre essa temperatura.
  function tolTC(tipo, classe, t) {
    var faixas, i, f;
    if (classe === "STD" || classe === "SLE") {
      faixas = (ASTM_TC[tipo] || {})[classe];
      if (!faixas) { return null; }
      for (i = 0; i < faixas.length; i++) {
        f = faixas[i];
        if (t >= f[0] && t <= f[1]) { return Math.max(f[2], f[3] * Math.abs(t)); }
      }
      return null;
    }
    faixas = (CLASSES_TC[tipo] || {})[classe];
    if (!faixas) { return null; }
    for (i = 0; i < faixas.length; i++) {
      f = faixas[i];
      if (t >= f[0] && t <= f[1]) {
        if (f[2] === "RS") { return 1 + 0.003 * (t - 1100); }
        return f[2] + f[3] * Math.abs(t);
      }
    }
    return null;
  }
  function classesTC(tipo) {
    var c = CLASSES_TC[tipo], out = [], k;
    for (k in c) { if (c.hasOwnProperty(k)) { out.push(k); } }
    out.sort();
    if (ASTM_TC[tipo]) { out.push("STD", "SLE"); }
    return out;
  }
  function nomeClasseTC(c) {
    return c === "STD" ? "ASTM padrão" : c === "SLE" ? "ASTM especial (SLE)" : "Classe " + c;
  }

  // ── Regra de decisão (ILAC G8:2019) ───────────────────────────────────
  // "simples":    aceitação simples, w = 0 (U não entra na decisão).
  // "binaria":    banda de guarda w = U; conforme só dentro de [LI + U, LS − U].
  // "naobinaria": w = U, com zona intermediária de resultado condicional.
  // A incerteza entra UMA vez só, também com limite de um lado só.
  function decidir(x, U, li, ls, modo) {
    var temLi = li !== null && !isNaN(li), temLs = ls !== null && !isNaN(ls), dentro, dentroGuarda, foraGuarda;
    if (!temLi && !temLs) { throw new Error("Informe pelo menos um limite."); }
    if (temLi && temLs && li >= ls) { throw new Error("O limite inferior tem que ser menor que o superior."); }
    U = Math.abs(U || 0);
    dentro = (!temLi || x >= li) && (!temLs || x <= ls);
    if (modo === "simples") {
      return { decisao: dentro ? "Conforme" : "Não conforme", w: 0 };
    }
    dentroGuarda = (!temLi || x >= li + U) && (!temLs || x <= ls - U);
    if (modo === "binaria") {
      return { decisao: dentroGuarda ? "Conforme" : "Não conforme", w: U };
    }
    foraGuarda = (temLi && x < li - U) || (temLs && x > ls + U);
    if (dentroGuarda) { return { decisao: "Conforme", w: U }; }
    if (foraGuarda) { return { decisao: "Não conforme", w: U }; }
    return { decisao: dentro ? "Conforme condicional" : "Não conforme condicional", w: U };
  }

  // ── Incerteza: t de Student, νeff e especificação de instrumento ──────
  // ln Γ(x) pela aproximação de Lanczos (precisão ~1e-15).
  function lnGama(x) {
    var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    var i, a, t;
    if (x < 0.5) { return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGama(1 - x); }
    x -= 1; a = c[0]; t = x + g + 0.5;
    for (i = 1; i < g + 2; i++) { a += c[i] / (x + i); }
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  // Fração continuada da beta incompleta (método de Lentz).
  function betaFC(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap, m, m2, aa, del, h;
    if (Math.abs(d) < 1e-300) { d = 1e-300; }
    d = 1 / d; h = d;
    for (m = 1; m <= 300; m++) {
      m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) { d = 1e-300; }
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) { c = 1e-300; }
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) { d = 1e-300; }
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) { c = 1e-300; }
      d = 1 / d; del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) { break; }
    }
    return h;
  }
  // Beta incompleta regularizada I_x(a, b).
  function betaInc(a, b, x) {
    if (x <= 0) { return 0; }
    if (x >= 1) { return 1; }
    var bt = Math.exp(lnGama(a + b) - lnGama(a) - lnGama(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) { return bt * betaFC(a, b, x) / a; }
    return 1 - bt * betaFC(b, a, 1 - x) / b;
  }
  // P(|T| ≤ t) para ν graus de liberdade.
  function tBilateral(t, nu) { return 1 - betaInc(nu / 2, 0.5, nu / (nu + t * t)); }

  // Probabilidade de abrangência do k = 2 na normal: erf(√2) = 0,9544997...
  var P_K2 = 0.954499736103642;

  // Fator de abrangência k = t_p(ν). ν infinito (ou acima de 1e7) usa a normal.
  function fatorK(nu, p) {
    p = p || P_K2;
    if (!(nu > 0)) { throw new Error("Graus de liberdade têm que ser maiores que zero."); }
    if (!isFinite(nu) || nu > 1e7) { nu = 1e7; }
    var k = raiz(function (t) { return tBilateral(t, nu) - p; }, 0, 1e4, 1e-12);
    return k;
  }

  // Orçamento: contribuições já multiplicadas pelo coeficiente de sensibilidade.
  // νeff por Welch–Satterthwaite; o GUM (Anexo G) recomenda truncar νeff para baixo
  // antes de buscar o t de Student.
  function orcamento(contribs, p) {
    var soma2 = 0, soma4 = 0, i, u, nu, uc, nueff, nuUsado, k;
    if (!contribs.length) { throw new Error("Informe pelo menos uma contribuição."); }
    for (i = 0; i < contribs.length; i++) {
      u = Math.abs(contribs[i].u); nu = contribs[i].nu;
      if (!(nu > 0)) { throw new Error("Graus de liberdade da linha " + (i + 1) + " têm que ser maiores que zero (deixe em branco para infinito)."); }
      soma2 += u * u;
      if (isFinite(nu)) { soma4 += Math.pow(u, 4) / nu; }
    }
    uc = Math.sqrt(soma2);
    if (!(uc > 0)) { throw new Error("A incerteza combinada deu zero. Confira as contribuições."); }
    nueff = soma4 > 0 ? Math.pow(uc, 4) / soma4 : Infinity;
    nuUsado = isFinite(nueff) ? Math.max(1, Math.floor(nueff + 1e-9)) : Infinity;
    k = fatorK(nuUsado, p);
    return { uc: uc, nueff: nueff, nuUsado: nuUsado, k: k, U: k * uc };
  }

  // Arredonda U para 2 algarismos significativos e devolve também quantas
  // casas decimais usar no resultado (mesma posição do último dígito de U).
  function arredondarU(U) {
    if (!(U > 0)) { return { U: U, casas: 0 }; }
    var e = Math.floor(Math.log(U) / Math.LN10 + 1e-12), casas = 1 - e, f = Math.pow(10, casas), r = Math.round(U * f) / f;
    // Se o arredondamento subiu de casa (ex.: 0,0996 -> 0,10), recalcula.
    if (r >= Math.pow(10, e + 1)) { casas -= 1; f = Math.pow(10, casas); r = Math.round(U * f) / f; }
    return { U: r, casas: Math.max(0, casas) };
  }

  // Limite de erro de uma especificação: ±(% leitura + % faixa + dígitos + fixo).
  function especLimite(e) {
    return Math.abs(e.leitura) * (e.pctLeitura || 0) / 100 + Math.abs(e.faixa || 0) * (e.pctFaixa || 0) / 100 +
      (e.digitos || 0) * (e.resolucao || 0) + (e.fixo || 0);
  }

  // ── Conversão de unidades (fator para a unidade base de cada grandeza) ─
  var UNIDADES = {
    "Pressão": { base: "Pa", u: [
      ["Pa", 1], ["kPa", 1e3], ["MPa", 1e6], ["bar", 1e5], ["mbar", 100], ["hPa", 100],
      ["psi", 6894.757293168361], ["kgf/cm²", 98066.5], ["atm", 101325], ["Torr", 101325 / 760],
      ["mmHg (convencional)", 133.322387415], ["inHg (convencional)", 3386.388640341],
      ["mmH₂O (convencional)", 9.80665], ["cmH₂O (convencional)", 98.0665], ["inH₂O (convencional)", 249.08891]
    ] },
    "Força": { base: "N", u: [["N", 1], ["kN", 1e3], ["kgf", 9.80665], ["gf", 0.00980665], ["lbf", 4.4482216152605], ["dyn", 1e-5]] },
    "Torque": { base: "N·m", u: [["N·m", 1], ["kgf·m", 9.80665], ["kgf·cm", 0.0980665], ["lbf·ft", 1.3558179483314004], ["lbf·in", 0.1129848290276167], ["ozf·in", 0.007061551814226]] },
    "Massa": { base: "kg", u: [["kg", 1], ["g", 1e-3], ["mg", 1e-6], ["t", 1e3], ["lb", 0.45359237], ["oz", 0.028349523125]] },
    "Comprimento": { base: "m", u: [["m", 1], ["mm", 1e-3], ["µm", 1e-6], ["cm", 1e-2], ["km", 1e3], ["in", 0.0254], ["ft", 0.3048], ["mil (milésimo de polegada)", 0.0000254]] },
    "Volume": { base: "m³", u: [["m³", 1], ["L", 1e-3], ["mL", 1e-6], ["µL", 1e-9], ["gal (EUA)", 0.003785411784], ["ft³", 0.028316846592]] },
    "Vazão": { base: "m³/s", u: [["m³/h", 1 / 3600], ["m³/s", 1], ["L/min", 1e-3 / 60], ["L/h", 1e-3 / 3600], ["L/s", 1e-3], ["gal/min (EUA)", 0.003785411784 / 60]] }
  };

  function converter(grandeza, valor, de, para) {
    var G = UNIDADES[grandeza], fd = null, fp = null, i;
    for (i = 0; i < G.u.length; i++) {
      if (G.u[i][0] === de) { fd = G.u[i][1]; }
      if (G.u[i][0] === para) { fp = G.u[i][1]; }
    }
    return valor * fd / fp;
  }

  function converterTemp(valor, de, para) {
    var c;
    if (de === "°C") { c = valor; } else if (de === "K") { c = valor - 273.15; } else { c = (valor - 32) / 1.8; }
    if (para === "°C") { return c; } if (para === "K") { return c + 273.15; } return c * 1.8 + 32;
  }

  return {
    TC: TC, tcFaixa: tcFaixa, tcEmf: tcEmf, tcTemp: tcTemp,
    IEC: IEC, cvdR: cvdR, cvdT: cvdT, cvdAjustar: cvdAjustar,
    itsWr: itsWr, itsT: itsT, FAIXAS: FAIXAS, PONTOS_FIXOS: PONTOS_FIXOS,
    itsCoeficientes: itsCoeficientes, itsDesvio: itsDesvio, itsTdeW: itsTdeW, itsWdeT: itsWdeT,
    itsAjustar: itsAjustar, tcAjustar: tcAjustar, tcDesvio: tcDesvio, tcEmfCal: tcEmfCal, tcTempCal: tcTempCal,
    escala: escala, UNIDADES: UNIDADES, converter: converter, converterTemp: converterTemp,
    en: en, escoreZ: escoreZ, zeta: zeta, avaliarEn: avaliarEn, avaliarZ: avaliarZ,
    CLASSES_RTD: CLASSES_RTD, tolRTD: tolRTD, tolTC: tolTC, classesTC: classesTC, nomeClasseTC: nomeClasseTC, decidir: decidir,
    P_K2: P_K2, tBilateral: tBilateral, fatorK: fatorK, orcamento: orcamento, arredondarU: arredondarU, especLimite: especLimite
  };
})();
