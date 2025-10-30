// ===== BRIVAX LAUDOS – Lógica Principal =====

// === TELA DE LOGIN E CADASTRO ===
function showRegister() {
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("register-screen").classList.add("active");
}

function showLogin() {
  document.getElementById("register-screen").classList.remove("active");
  document.getElementById("login-screen").classList.add("active");
}

function login() {
  const nick = document.getElementById("nickname").value.toLowerCase().trim();
  const senha = document.getElementById("password").value.trim();

  const user = validarLogin(nick, senha);
  if (!user) {
    alert("Usuário não encontrado ou senha incorreta.");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("select-system").classList.add("active");
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("login-screen").classList.add("active");
}

function register() {
  const nome = document.getElementById("regNome").value;
  const nick = document.getElementById("regNick").value.toLowerCase().trim();
  const senha = document.getElementById("regSenha").value;
  const confirma = document.getElementById("regConfirma").value;

  if (!nome || !nick || !senha) return alert("Preencha todos os campos!");
  if (senha !== confirma) return alert("As senhas não coincidem.");

  salvarUsuario({ nome, nickname: nick, senha });
  alert("Usuário cadastrado com sucesso!");
  showLogin();
}

// === SISTEMAS ===
function selectSystem(tipo) {
  document.getElementById("select-system").classList.remove("active");
  document.getElementById("laudo-container").classList.add("active");

  const titulo = tipo === "incendio"
    ? "Laudo – Sistema de Combate a Incêndio"
    : "Laudo – Sistema de Detecção de Fumaça";

  document.getElementById("laudo-titulo").innerText = titulo;
  gerarFormulario(tipo);
}

function voltarInicio() {
  document.getElementById("laudo-container").classList.remove("active");
  document.getElementById("select-system").classList.add("active");
}

// === FORMULÁRIO DINÂMICO ===
function gerarFormulario(tipo) {
  const form = document.getElementById("laudo-form");
  form.innerHTML = "";

  const camposComuns = [
    { label: "Nome da Loja:", id: "nomeLoja", tipo: "text" },
    { label: "Data do Laudo:", id: "dataLaudo", tipo: "date" },
    { label: "Cidade:", id: "cidade", tipo: "text" },
    { label: "Responsável Técnico:", id: "responsavel", tipo: "text" },
  ];

  camposComuns.forEach(c => {
    form.innerHTML += `<label>${c.label}</label><input id="${c.id}" type="${c.tipo}" />`;
  });

  const listaItens =
    tipo === "incendio"
      ? [
          "Foto dos termostatos instalados",
          "Foto da solenóide conectada no cilindro de saponificante",
          "Foto da central de alarme Brivax",
          "Foto do CO₂",
          "Foto do dumper corta-fogo",
          "Foto da solenóide conectada ao CO₂",
          "Foto do termostato regulável",
          "Foto do detector de gás",
          "Foto da solenóide do gás",
        ]
      : [
          "Foto dos detectores de fumaça",
          "Foto da central de alarme de fumaça",
          "Foto dos módulos e sirenes",
        ];

  listaItens.forEach((desc, i) => {
    form.innerHTML += `
      <div class="item">
        <h4>${i + 1}. ${desc}</h4>
        <input type="file" accept="image/*" capture="environment" id="foto_${i}" />
        <div class="option-group">
          <div class="option-btn" onclick="toggleOption(this)">Teste: Sim</div>
          <div class="option-btn" onclick="toggleOption(this)">Teste: Não</div>
        </div>
        <div class="option-group">
          <div class="option-btn" onclick="toggleOption(this)">Funcionando: Sim</div>
          <div class="option-btn" onclick="toggleOption(this)">Funcionando: Não</div>
        </div>
        <textarea placeholder="Observações"></textarea>
      </div>`;
  });

  form.innerHTML += `
    <h3>Assinaturas</h3>
    <button onclick="abrirAssinatura('tecnico')">Assinar Técnico</button>
    <button onclick="abrirAssinatura('cliente')">Assinar Cliente</button>
    <canvas id="assinaturaTecnico" class="signature-pad"></canvas>
    <canvas id="assinaturaCliente" class="signature-pad"></canvas>
  `;
}

// === OPÇÕES DE TESTE ===
function toggleOption(btn) {
  const group = btn.parentElement.querySelectorAll(".option-btn");
  group.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// === ASSINATURA ===
function abrirAssinatura(tipo) {
  const popup = document.createElement("div");
  popup.classList.add("signature-popup");

  popup.innerHTML = `
    <div class="signature-container">
      <h3>Assinatura ${tipo === "tecnico" ? "do Técnico" : "do Cliente"}</h3>
      <canvas id="canvasAssinatura" width="400" height="250" style="border:1px solid #ccc"></canvas>
      <div class="signature-actions">
        <button onclick="salvarAssinatura('${tipo}')">Salvar</button>
        <button onclick="this.closest('.signature-popup').remove()">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  const canvas = popup.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let desenhando = false;

  canvas.addEventListener("mousedown", () => (desenhando = true));
  canvas.addEventListener("mouseup", () => (desenhando = false));
  canvas.addEventListener("mousemove", e => {
    if (!desenhando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  });
}

function salvarAssinatura(tipo) {
  const canvas = document.querySelector("#canvasAssinatura");
  const imgData = canvas.toDataURL("image/png");
  document.getElementById(
    tipo === "tecnico" ? "assinaturaTecnico" : "assinaturaCliente"
  ).src = imgData;
  document.querySelector(".signature-popup").remove();
}

// === SALVAR, PDF E ENVIO ===
function salvarLaudo() {
  const laudo = {
    loja: document.getElementById("nomeLoja").value,
    data: document.getElementById("dataLaudo").value,
    tecnico: document.getElementById("responsavel").value,
  };

  const id = salvarLaudoLocal(laudo);
  alert("Laudo salvo com sucesso! Nº " + id);
}

function gerarPDF() {
  alert("Função de PDF será integrada na exportação final.");
}

function enviarWhatsApp() {
  const loja = document.getElementById("nomeLoja").value;
  const data = document.getElementById("dataLaudo").value;
  const mensagem = `Brivax Laudos - Laudo da loja ${loja}, data ${data}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`);
}

function enviarEmail() {
  const loja = document.getElementById("nomeLoja").value;
  const data = document.getElementById("dataLaudo").value;
  const assunto = `Brivax Laudos - ${loja} - ${data}`;
  const corpo = `Segue o laudo realizado da loja ${loja} em ${data}.`;
  window.location.href = `mailto:brivax.adm@gmail.com?subject=${encodeURIComponent(
    assunto
  )}&body=${encodeURIComponent(corpo)}`;
}
