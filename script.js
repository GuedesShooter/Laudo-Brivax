/* ====== Brivax Laudos App - script.js ====== */

// ------- Funções de navegação entre telas -------
function showCadastro() {
  document.getElementById("login").style.display = "none";
  document.getElementById("cadastro").style.display = "block";
}

function showLogin() {
  document.getElementById("cadastro").style.display = "none";
  document.getElementById("login").style.display = "block";
}

function showLaudo() {
  document.getElementById("login").style.display = "none";
  document.getElementById("laudo").style.display = "block";
}

// ------- Sistema de login e cadastro local (SQLite simulado com localStorage) -------
function cadastrar() {
  const nick = document.getElementById("novoNickname").value.trim().toLowerCase().replace(/\s+/g, '');
  const pass = document.getElementById("novaSenha").value;

  if (!nick || !pass) {
    alert("Preencha todos os campos!");
    return;
  }

  if (localStorage.getItem(nick)) {
    alert("Usuário já cadastrado!");
    return;
  }

  localStorage.setItem(nick, pass);
  alert("Usuário cadastrado com sucesso!");
  showLogin();
}

function login() {
  const nick = document.getElementById("nickname").value.trim().toLowerCase();
  const pass = document.getElementById("senha").value;

  if (localStorage.getItem(nick) === pass) {
    showLaudo();
  } else {
    alert("Usuário não encontrado ou senha incorreta.");
  }
}

// ------- Assinatura Digital -------
function initSignature(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  let drawing = false;

  canvas.addEventListener("mousedown", e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", e => {
    if (drawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseleave", () => drawing = false);

  // Para mobile
  canvas.addEventListener("touchstart", e => {
    drawing = true;
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top);
  });

  canvas.addEventListener("touchmove", e => {
    if (drawing) {
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top);
      ctx.stroke();
    }
  });

  canvas.addEventListener("touchend", () => drawing = false);
}

function limparAssinatura(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.onload = () => {
  initSignature("sigTecnico");
  initSignature("sigCliente");
};

// ------- Geração de PDF -------
function gerarPDF() {
  const nomeLoja = prompt("Digite o nome da loja:");
  const data = document.getElementById("data").value;
  const tecnico = localStorage.getItem("ultimoUsuario") || "Técnico";

  const corpo = `
  <h1>Laudo de Sistema de Incêndio - Brivax</h1>
  <p><strong>Data:</strong> ${data}</p>
  <p><strong>Loja:</strong> ${nomeLoja}</p>
  <p><strong>Técnico:</strong> ${tecnico}</p>
  <p><strong>Status:</strong> Gerado via app Brivax Laudos</p>
  `;

  const novaJanela = window.open("", "_blank");
  novaJanela.document.write(corpo);
  novaJanela.print();

  enviarLaudo(nomeLoja, tecnico, data);
}

// ------- Envio via Email/WhatsApp -------
function enviarLaudo(loja, tecnico, data) {
  const assunto = `Brivax Laudos - ${data} - ${loja}`;
  const corpoEmail = `Segue o laudo da loja ${loja}.\nTécnico: ${tecnico}\nData: ${data}`;
  const emailBrivax = "brivax.adm@gmail.com";

  // E-mail
  window.open(`mailto:${emailBrivax}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`);

  // WhatsApp
  const textoWhats = `Brivax Laudos - Loja: ${loja}%0AData: ${data}%0ATécnico: ${tecnico}`;
  window.open(`https://wa.me/?text=${textoWhats}`);
}
