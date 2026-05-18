(function () {
  const usuarioStr = localStorage.getItem("usuario");
  if (!usuarioStr) {
    window.location.href = "../index.html";
    return;
  }

  const usuario = JSON.parse(usuarioStr);
  const path = window.location.pathname;

  if (path.includes("/administrador/") && usuario.rol !== "ADMINISTRADOR") {
    window.location.href = "../participante/index.html";
  } else if (
    path.includes("/participante/") &&
    usuario.rol !== "PARTICIPANTE"
  ) {
    window.location.href = "../administrador/dashboard.html";
  }
})();

window.logout = function () {
  localStorage.removeItem("usuario");
  window.location.href = "../index.html";
};
