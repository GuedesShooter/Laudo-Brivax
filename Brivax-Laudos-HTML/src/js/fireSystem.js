/* ====== Brivax - Sistema de Incêndio ====== */

document.addEventListener("DOMContentLoaded", () => {
  gerarItensIncendio();
});

// ------- Geração dinâmica da lista de itens -------
function gerarItensIncendio() {
  const lista = document.getElementById("listaIncendio");
  const itens = [
    "Foto geral da cozinha",
    "Foto da coifa",
    "Foto dos termostatos instalados na coifa",
    "Foto dos bicos difusores instalados na coifa",
    "Foto dos cilindros de saponificante",
    "Foto do manômetro do saponificante",
    "Foto da solenoide conectada ao saponificante",
    "Foto do damper corta-fogo",
    "Foto dos termostatos reguláveis",
    "Foto do cilindro de CO₂",
    "Foto da solenoide do CO₂ conectada",
    "Tipo de gás da loja (GLP ou Natural)",
    "Foto do detector de gás",
    "Foto da solenoide do gás conectada",
    "Foto da comunicação da central do shopping",
    "Foto do quadro elétrico com disjuntor disponível",
    "Foto do quadro elétrico de exaustão com contato seco N/F",
    "Foto da central aberta com todas as conexões feitas",
    "Foto da central fechada e lacrada",
    "Treinamento realizado?",
    "Pendências (Brivax / Cliente)",
    "Observações do técnico"
  ];

  lista.innerHTML = "";

  itens.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <label>${i + 1}. ${item}</label>
      <input type="file" accept="image/*" multiple />
      <div class="teste">
        <label>Teste:</label>
        <select><option>Sim</option><option>Não</option></select>
        <label>Funcionando:</label>
        <select><option>Sim</option><option>Não</option></select>
      </div>
    `;
    lista.appendChild(div);
  });
}

// ------- Funções de assinatura -------
let assinaturaAtual = null;

function limparAssinatura(tipo) {
  const canvas = document.getElementById(`assinatura${capitalize(tipo)}`);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ------- Gerar e Enviar Laudo -------
function gerarLaudo(tipo) {
  const cliente = {
    nome: document.getElementById("clienteNome").value,
    documento: document.getElementById("clienteDocumento").value,
    endereco: document.getElementById("clienteEndereco").value,
    telefone: document.getElementById("clienteTelefone").value,
    email: document.getElementById("clienteEmail").value
  };

  const itens = Array.from(document.querySelectorAll("#listaIncendio .item")).map(div => ({
    descricao: div.querySelector("label").textContent,
    teste: div.querySelectorAll("select")[0].value,
    funcionando: div.querySelectorAll("select")[1].value
  }));

  salvarLaudoComCliente(cliente, "Sistema de Incêndio", itens);
  enviarEmailCliente(cliente.email, "Sistema de Incêndio");
}

// ------- Envio por E-mail -------
function enviarEmailCliente(emailCliente, tipo) {
  const assunto = `Brivax Laudos Técnicos - ${tipo}`;
  const corpo = `
Laudo técnico de ${tipo}
Enviado automaticamente pelo sistema Brivax.
`;

  const emails = `${emailCliente}, brivax.adm@gmail.com`;
  window.open(`mailto:${emails}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
}
