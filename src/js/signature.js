let canvas, ctx;

function abrirAssinatura(tipo) {
  const modal = document.getElementById('signatureModal');
  const title = document.getElementById('signatureTitle');
  title.textContent = tipo === 'cliente' ? 'Assinatura do Cliente' : 'Assinatura do Técnico';
  modal.style.display = 'flex';

  canvas = document.getElementById('signaturePad');
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';

  let drawing = false;
  canvas.addEventListener('mousedown', () => drawing = true);
  canvas.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('mousemove', draw);

  function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }

  document.getElementById('clearSignature').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('saveSignature').onclick = () => {
    const img = canvas.toDataURL('image/png');
    modal.style.display = 'none';
    alert(`Assinatura ${tipo} salva!`);
  };
}
