// === GERAÇÃO DOS PDFS PRINCIPAIS ===
async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça", "Smoke");
}

// === FUNÇÃO PRINCIPAL DE GERAÇÃO DE LAUDO ===
async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();

   // Usa fonte nativa Helvetica (evita precisar do fontkit)
const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);


    // Nova página A4
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 60;

    // === 🧯 Cabeçalho ===
    page.drawRectangle({ x: 0, y: y - 25, width, height: 60, color: rgb(1, 0.48, 0) });
    page.drawText(`BRIVAX SISTEMAS DE COMBATE A INCÊNDIO`, {
      x: 40, y: y + 10, size: 14, font, color: rgb(1, 1, 1)
    });
    page.drawText(`Laudo Técnico - ${tipoSistema}`, {
      x: 40, y: y - 10, size: 11, font, color: rgb(1, 1, 1)
    });

    y -= 90;

    // === 📋 Informações Gerais ===
    const dataEntrega = document.getElementById("dataEntrega")?.value || "";
    const dataLaudo = document.getElementById("dataLaudo")?.value || "";
    const nomeLoja = document.getElementById("nomeLoja")?.value || "";
    const localInstalacao = document.getElementById("localInstalacao")?.value || "";
    const nomeTecnico = document.getElementById("nomeTecnico")?.value || "";
    const nomeAjudante = document.getElementById("nomeAjudante")?.value || "";

    const infoLines = [
      `Data de Entrega: ${dataEntrega}`,
      `Data do Laudo: ${dataLaudo}`,
      `Loja: ${nomeLoja}`,
      `Local da Instalação: ${localInstalacao}`,
      `Técnico Responsável: ${nomeTecnico}`,
      `Ajudante: ${nomeAjudante}`,
    ];

    page.drawText("📄 Informações Gerais", { x: 40, y, size: 13, font, color: rgb(1, 0.48, 0) });
    y -= 20;

    infoLines.forEach(line => {
      page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 15;
    });

    y -= 10;
    drawLine(page, width, y);
    y -= 25;

    // === 🧩 Itens do checklist ===
    const itens = document.querySelectorAll(".item");

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoesSelecionados = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      // Quebra de página se faltar espaço
      if (y < 200) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }

      page.drawText(titulo, { x: 40, y, size: 12, font, color: rgb(1, 0.48, 0) });
      y -= 16;

      // Botões selecionados
      botoesSelecionados.forEach(btn => {
        const label = btn.parentNode.querySelector("label")?.textContent || "";
        page.drawText(`${label} ${btn.textContent}`, { x: 50, y, size: 10.5, font });
        y -= 12;
      });

      // Observações
      if (observacoes.trim() !== "") {
        const texto = `Obs: ${observacoes}`;
        const linhas = quebraTexto(texto, 85);
        linhas.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      // Imagens (miniaturas)
      for (let img of imagens) {
        if (y < 160) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }
        const imgBytes = await fetch(img.src).then(res => res.arrayBuffer());
        let imgEmbed;
        try { imgEmbed = await pdfDoc.embedJpg(imgBytes); }
        catch { imgEmbed = await pdfDoc.embedPng(imgBytes); }

        const scaled = imgEmbed.scale(150 / imgEmbed.height);
        page.drawImage(imgEmbed, {
          x: 50,
          y: y - 150,
          width: scaled.width,
          height: scaled.height
        });
        y -= 160;
      }

      y -= 10;
      drawLine(page, width, y);
      y -= 25;
    }

    // === ✍️ Assinaturas ===
    y -= 10;
    page.drawText("Assinaturas", { x: 40, y, size: 13, font, color: rgb(1, 0.48, 0) });
    y -= 15;

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    const assY = y - 100;

    // Técnico
    page.drawText("Técnico:", { x: 60, y: y + 60, size: 11, font });
    if (assinaturaTecnico) {
      const imgBytes = await fetch(assinaturaTecnico).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 60, y, width: 120, height: 60 });
    }

    // Cliente
    page.drawText("Cliente:", { x: 240, y: y + 60, size: 11, font });
    if (assinaturaCliente) {
      const imgBytes = await fetch(assinaturaCliente).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 240, y, width: 120, height: 60 });
    }

    // Treinamento
    page.drawText("Treinamento:", { x: 420, y: y + 60, size: 11, font });
    if (assinaturaTreinamento) {
      const imgBytes = await fetch(assinaturaTreinamento).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 420, y, width: 120, height: 60 });
    }

    y = 100;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 150,
      y: y - 15,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // === Gera o PDF ===
    const nomeArquivo = `${prefix}_Laudo_${nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();

  } catch (err) {
    console.error("Erro ao criar PDF:", err);
    alert("❌ Erro ao gerar PDF. Verifique as imagens ou tente novamente.");
  }
}

// === LINHA DIVISÓRIA ===
function drawLine(page, width, y) {
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.8,
    color: rgb(0.8, 0.8, 0.8)
  });
}

// === QUEBRA DE TEXTO ===
function quebraTexto(texto, max) {
  const palavras = texto.split(" ");
  const linhas = [];
  let atual = "";
  for (let p of palavras) {
    if ((atual + p).length > max) {
      linhas.push(atual);
      atual = p + " ";
    } else atual += p + " ";
  }
  if (atual) linhas.push(atual);
  return linhas;
}
