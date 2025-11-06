/* ====== Brivax - Sistema de Fumaça ====== */

document.addEventListener("DOMContentLoaded", () => {
  gerarItensFumaca();
});

function gerarItensFumaca() {
  const lista = document.getElementById("listaFumaca");
  lista.innerHTML = "";

  // Item 0 - Fachada
  const fachada = document.createElement("div");
  fachada.className = "item";
  fachada.innerHTML = `
    <label>0. Foto da Fachada da Loja</label>
    <input type="file" accept="image/*" multiple />
  `;
  lista.appendChild(fachada);

  // Item principal - Detectores
  const detectoresDiv = document.createElement("div");
  detectoresDiv.id = "detectoresContainer";
  detectoresDiv.className = "item";
  detectoresDiv.innerHTML = `
    <label>1. Detectores de Fumaça</label>
    <button type="button" onclick="adicionarDetector()">+ Adicionar Detector</button>
  `;
  lista.appendChild(detectoresDiv);
}

let contadorDetector = 0;

function adicionarDetector() {
  contadorDetector++;
  if (contadorDetector > 100) return alert("Limite de 100 detectores atingido.");

  const container = document.getElementById("detectoresContainer");
  const div = document.createElement("div");
  div.className = "subitem";
  div.innerHTML = `
    <h4>Detector ${contadorDetector}</h4>
    <input type="file" accept="image/*" multiple />
    <div class="teste">
      <label>Teste:</label>
      <select><option>Sim</option><option>Não</option></select>
      <label>Funcionando:</label>
      <select><option>Sim</option><option>Não</option></select>
    </div>
  `;
  container.appendChild(div);
}

// ------- Assinatura e Envio -------
function gerarLaudo(tipo) {
  const cliente = {
    nome: document.getElementById("clienteNome").value,
    documento: document.getElementById("clienteDocumento").value,
    endereco: document.getElementById("clienteEndereco").value,
    telefone: document.getElementById("clienteTelefone").value,
    email: document.getElementById("clienteEmail").value
  };

  const itens = Array.from(document.querySelectorAll("#listaFumaca .item, .subitem")).map(div => ({
    descricao: div.querySelector("label") ? div.querySelector("label").textContent : div.querySelector("h4").textContent,
    teste: div.querySelectorAll("select")[0]?.value || "-",
    funcionando: div.querySelectorAll("select")[1]?.value || "-"
  }));

  salvarLaudoComCliente(cliente, "Sistema de Fumaça", itens);
  enviarEmailCliente(cliente.email, "Sistema de Fumaça");
}

function enviarEmailCliente(emailCliente, tipo) {
  const assunto = `Brivax Laudos Técnicos - ${tipo}`;
  const corpo = `
Laudo técnico de ${tipo}
Enviado automaticamente pelo sistema Brivax.
`;

  const emails = `${emailCliente}, brivax.adm@gmail.com`;
  window.open(`mailto:${emails}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
}
