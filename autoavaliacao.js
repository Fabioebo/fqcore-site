// Motor da autoavaliação. Os dados (seções, perguntas, chave de armazenamento)
// vêm de window.AV_DADOS, definido na própria página.
(function () {
  var OPCOES = [["s", "Sim"], ["p", "Parcial"], ["n", "Não"], ["na", "N/A"]];
  var D = window.AV_DADOS, SECOES = D.secoes, Q = D.perguntas, CHAVE = D.chave;
  var resp = {};
  var form = document.getElementById("av-form");

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(resp)); } catch (e) {} }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function montar() {
    var h = "", sec = null, i, j, q, id;
    for (i = 0; i < Q.length; i++) {
      q = Q[i];
      if (q[0] !== sec) {
        if (sec !== null) { h += "</div></fieldset>"; }
        sec = q[0];
        h += '<fieldset class="panel av-sec"><legend class="panel-head"><span>' + sec + " · " + SECOES[sec] + '</span><span class="label" id="av-cont-' + sec + '"></span></legend><div class="av-itens">';
      }
      h += '<div class="av-q" id="q' + i + '"><div class="av-q-txt"><span class="av-cl">' + esc(q[1]) + "</span><p>" + esc(q[2]) + '</p></div><div class="av-opc" role="radiogroup" aria-label="Resposta da pergunta ' + (i + 1) + '">';
      for (j = 0; j < OPCOES.length; j++) {
        id = "r" + i + "-" + OPCOES[j][0];
        h += '<input type="radio" name="r' + i + '" id="' + id + '" value="' + OPCOES[j][0] + '"><label for="' + id + '" class="o-' + OPCOES[j][0] + '">' + OPCOES[j][1] + "</label>";
      }
      h += "</div></div>";
    }
    h += "</div></fieldset>";
    form.innerHTML = h;
    var listaSec = "";
    for (var s in SECOES) { listaSec += '<li><span>' + s + " · " + SECOES[s] + '</span><span class="av-pct" id="av-pct-' + s + '">–</span><div class="av-barra"><i id="av-bar-' + s + '"></i></div></li>'; }
    document.getElementById("av-secoes").innerHTML = listaSec;
  }

  function classe(p) { return p >= 85 ? "bom" : p >= 60 ? "medio" : "ruim"; }

  function atualizar() {
    var por = {}, s, i, r, n = 0, totPts = 0, totVal = 0, lac = [], el;
    for (s in SECOES) { por[s] = { pts: 0, val: 0, resp: 0, tot: 0 }; }
    for (i = 0; i < Q.length; i++) {
      s = Q[i][0]; r = resp[i]; por[s].tot++;
      if (!r) { continue; }
      n++; por[s].resp++;
      if (r === "na") { continue; }
      por[s].val++; totVal++;
      if (r === "s") { por[s].pts += 1; totPts += 1; }
      else if (r === "p") { por[s].pts += 0.5; totPts += 0.5; lac.push([1, i]); }
      else { lac.push([0, i]); }
    }
    for (s in SECOES) {
      var pc = por[s].val ? Math.round(100 * por[s].pts / por[s].val) : null;
      document.getElementById("av-cont-" + s).textContent = por[s].resp + "/" + por[s].tot;
      el = document.getElementById("av-pct-" + s);
      el.textContent = pc === null ? "–" : pc + " %";
      el.className = "av-pct" + (pc === null ? "" : " " + classe(pc));
      el = document.getElementById("av-bar-" + s);
      el.style.width = (pc || 0) + "%";
      el.className = pc === null ? "" : classe(pc);
    }
    document.getElementById("av-progresso").textContent = n + " de " + Q.length + " respondidas";
    document.getElementById("av-barra-prog").style.width = Math.round(100 * n / Q.length) + "%";
    var tot = totVal ? Math.round(100 * totPts / totVal) : null;
    el = document.getElementById("av-total");
    el.textContent = tot === null ? "–" : tot + " %";
    el.className = tot === null ? "" : classe(tot);
    document.getElementById("av-total-txt").textContent = tot === null ? "Responda as perguntas para ver a nota." :
      n < Q.length ? "Nota parcial. Faltam " + (Q.length - n) + " perguntas." :
      tot >= 85 ? "Boa parte dos requisitos está atendida. Confira os pontos marcados como parciais." :
      tot >= 60 ? "Parte dos requisitos está atendida, mas há pontos que precisam de atenção." :
      "Vários requisitos ainda não estão atendidos. Comece pelos itens marcados como Não.";

    lac.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var h = "";
    for (i = 0; i < lac.length; i++) {
      var q = Q[lac[i][1]], tipo = lac[i][0] === 0 ? "n" : "p";
      h += '<li class="av-lac"><div class="av-lac-top"><span class="av-tag t-' + tipo + '">' + (tipo === "n" ? "Não" : "Parcial") + '</span><span class="av-cl">' + esc(q[1]) + "</span></div><strong>" + esc(q[2]) + "</strong><span>Evidência esperada: " + esc(q[3]) + "</span></li>";
    }
    document.getElementById("av-lista").innerHTML = h;
    document.getElementById("av-lacunas-vazio").hidden = lac.length > 0 || n === Q.length;
    document.getElementById("av-cta").hidden = lac.length === 0;
    if (n === Q.length && !lac.length) {
      document.getElementById("av-lista").innerHTML = '<li class="av-lac"><strong>Nenhum ponto marcado como Não ou Parcial.</strong><span>Uma auditoria interna com as evidências em mãos confirma o resultado.</span></li>';
    }
  }

  form.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t.type !== "radio") { return; }
    resp[+t.name.slice(1)] = t.value;
    gravar(); atualizar();
  });
  form.addEventListener("submit", function (ev) { ev.preventDefault(); });
  document.getElementById("av-limpar").addEventListener("click", function () {
    resp = {}; gravar(); form.reset(); atualizar();
    window.scrollTo(0, 0);
  });

  montar();
  resp = ler();
  for (var k in resp) {
    var el = document.getElementById("r" + k + "-" + resp[k]);
    if (el) { el.checked = true; } else { delete resp[k]; }
  }
  atualizar();
})();
