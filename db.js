// ===== BRIVAX LAUDOS – Banco de Dados Local =====

// Inicializa o armazenamento local
if (!localStorage.getItem("usuarios")) {
  localStorage.setItem("usuarios", JSON.stringify([]));
}
if (!localStorage.getItem("laudos")) {
  localStorage.setItem("laudos", JSON.stringify([]));
}

// Função para salvar usuário
function salvarUsuario(usuario) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  usuarios.push(usuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// Função para validar login
function validarLogin(nick, senha) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  return usuarios.find(
    (u) => u.nickname === nick.toLowerCase().trim() && u.senha === senha
  );
}

// Função para salvar laudo
function salvarLaudoLocal(laudo) {
  let laudos = JSON.parse(localStorage.getItem("laudos"));
  laudo.id = laudos.length + 1;
  laudos.push(laudo);
  localStorage.setItem("laudos", JSON.stringify(laudos));
  return laudo.id;
}

// Função para listar laudos
function listarLaudos() {
  return JSON.parse(localStorage.getItem("laudos"));
}
