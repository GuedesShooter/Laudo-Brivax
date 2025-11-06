window.onload = function () {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "LoginScreen.html";
    return;
  }

  document.getElementById("userName").innerText = `Bem-vindo, ${usuarioLogado.usuario}!`;
};

function abrirSistema(tipo) {
  if (tipo === "fire") {
    window.location.href = "FireSystemReport.html";
  } else if (tipo === "smoke") {
    window.location.href = "SmokeSystemReport.html";
  }
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("lembrarUsuario");
}
