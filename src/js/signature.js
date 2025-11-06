// === BRIVAX - Módulo de Assinaturas Independentes ===

// Campos que terão assinatura
const signatureFields = ["tecnico", "cliente", "treinamento"];
let activeSignature = null;

// Cria dinamicamente um modal separado para cada tipo
signatureFields.forEach(field => {
  const modal = document.createElement("div");
  modal.id = `signatureModal_${field}`;
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";
  modal.innerHTML = `
    <div style="background:white;padding:20px;border-radius:10px;text-align:center;">
      <h3>Assinatura de ${field.charAt(0).toUpperCase() + field.slice(1)}</h3>
      <canvas id="canvas_${field}" width="320" height="200" style="border:2px solid orange;border-radius:8px;"></canvas>
      <br>
      <button onclick="clearSignature('${field}')">Apagar</button>
      <button onclick="saveSignature('${field}')">Salvar</button>
      <button onclick="closeSignature('${field}')">Fechar</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Inicializa canvas
  const canvas = modal.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;

  const startDraw = (x, y) => { drawing = true; ctx.beginPath(); ctx.moveTo(x, y); };
  const draw = (x, y) => { if (!drawing) return; ctx.lineTo(x, y); ctx.stroke(); };
  const stopDraw = () => { drawing = false; };

  canvas.addEventListener("mousedown", e => startDraw(e.offsetX, e.offsetY));
  canvas.addEventListener("mousemove", e => draw(e.offsetX, e.offsetY));
  canvas.addEventListener("mouseup", stopDraw);

  canvas.addEventListener("touchstart", e => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    startDraw(t.clientX - rect.left, t.clientY - rect.top);
  });
  canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    draw(t.clientX - rect.left, t.clientY - rect.top);
  });
  canvas.addEventListener("touchend", stopDraw);
});

// Funções globais
function openSignature(field) {
  document.getElementById(`signatureModal_${field}`).style.display = "flex";
}
function clearSignature(field) {
  const canvas = document.getElementById(`canvas_${field}`);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function saveSignature(field) {
  const canvas = document.getElementById(`canvas_${field}`);
  const data = canvas.toDataURL("image/png");
  localStorage.setItem(`assinatura_${field}`, data);
  alert(`✅ Assinatura de ${field} salva!`);
  closeSignature(field);
}
function closeSignature(field) {
  document.getElementById(`signatureModal_${field}`).style.display = "none";
}