// Menus do cabeçalho (Produtos, Recursos e o menu do celular): abrir um fecha
// os outros, e clicar fora ou apertar Esc fecha todos.
(function () {
  function menus() { return Array.prototype.slice.call(document.querySelectorAll("details.dd, details.menu-mob")); }
  function fechar(exceto) {
    menus().forEach(function (d) { if (d !== exceto && d.open) { d.open = false; } });
  }
  menus().forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) { fechar(d); } });
  });
  document.addEventListener("click", function (e) {
    menus().forEach(function (d) { if (d.open && !d.contains(e.target)) { d.open = false; } });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") { return; }
    menus().forEach(function (d) {
      if (d.open) { d.open = false; d.querySelector("summary").focus(); }
    });
  });
})();
