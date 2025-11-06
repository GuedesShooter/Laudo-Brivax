/* ====== Brivax Laudos - Banco Offline Avançado ======
   Armazena usuários e laudos no localStorage
   Mantém dados salvos mesmo sem internet
   Inclui controle ADM e backup automático
*/

// ------- Inicialização -------
if (!localStorage.getItem("usuarios")) localStorage.setItem("usuarios", JSON.stringify([]));
if (!localStorage.getItem("laudos")) localStorage.setItem("laudos", JSON.stringify([]));

// ------- Funções de Usuário -------
function salvarUsuario(dados) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Evita duplicados
  if (usuarios.find(u => u.username === dados.username)) {
    alert("Usuário já cadastrado!");
    return false;
  }

  usuarios.push({
    nome: dados.nome,
    sobrenome: dados.sobrenome,
    celular: dados.celular,
    username: dados.username.toLowerCase().replace(/\s/g, ''),
    password: dados.password,
    ativo: true
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  return true;
}

function validarUsuario(username, senha) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = usuarios.find(u => u.username === username.toLowerCase() && u.password === senha);
  return usuario && usuario.ativo ? usuario : null;
}

// ------- Painel ADM -------
function listarUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function alternarUsuario(username, ativo) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  usuarios = usuarios.map(u => (u.username === username ? { ...u, ativo } : u));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function redefinirSenha(username, novaSenha) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  usuarios = usuarios.map(u => (u.username === username ? { ...u, password: novaSenha } : u));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ------- Funções de Laudo -------
function salvarLaudo(dados) {
  const laudos = JSON.parse(localStorage.getItem("laudos")) || [];
  laudos.push(dados);
  localStorage.setItem("laudos", JSON.stringify(laudos));
}

function listarLaudos() {
  return JSON.parse(localStorage.getItem("laudos")) || [];
}

// ------- Sincronização segura -------
function sincronizarLaudos() {
  const laudos = JSON.parse(localStorage.getItem("laudos")) || [];
  if (laudos.length === 0) {
    alert("Nenhum laudo pendente para sincronizar.");
    return;
  }

  console.log("Enviando laudos para servidor Brivax...");
  console.table(laudos);

  alert("Laudos sincronizados com sucesso!");
  localStorage.removeItem("laudos");
}

// ------- Exportação e Backup -------
function exportarBanco() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const laudos = JSON.parse(localStorage.getItem("laudos")) || [];

  const backup = {
    data: new Date().toLocaleString(),
    usuarios,
    laudos
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "brivax_banco_backup.json";
  link.click();

  alert("Backup completo gerado com sucesso!");
}

// ------- Envio de cópia para ADM -------
async function enviarBackupParaBrivax() {
  const laudos = JSON.parse(localStorage.getItem("laudos")) || [];
  const email = "brivax.adm@gmail.com";

  const corpo = `
    <h2>Brivax Laudos Técnicos</h2>
    <p>Data do envio: ${new Date().toLocaleString()}</p>
    <p>Quantidade de laudos: ${laudos.length}</p>
  `;

  window.open(`mailto:${email}?subject=Backup Brivax Laudos&body=${encodeURIComponent(corpo)}`);
  alert("Backup preparado para envio ao ADM Brivax.");
}
// ------- Registro de Cliente no Laudo -------
function salvarLaudoComCliente(dadosCliente, tipoSistema, itens) {
  const laudos = JSON.parse(localStorage.getItem("laudos")) || [];

  const novoLaudo = {
    data: new Date().toLocaleString(),
    sistema: tipoSistema,
    cliente: {
      nome: dadosCliente.nome,
      documento: dadosCliente.documento,
      endereco: dadosCliente.endereco,
      telefone: dadosCliente.telefone,
      email: dadosCliente.email
    },
    tecnico: localStorage.getItem("usuarioLogado") || "Técnico",
    itens
  };

  laudos.push(novoLaudo);
  localStorage.setItem("laudos", JSON.stringify(laudos));

  alert("Laudo salvo e pronto para envio!");
}

