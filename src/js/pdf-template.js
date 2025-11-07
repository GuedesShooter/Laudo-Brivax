// =============================
// ✅ TEMPLATE DE GERAÇÃO DE PDF BRIVAX
// Compatível com celular e desktop
// =============================

async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça", "Smoke");
}

// === FUNÇÃO PRINCIPAL ===
async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    // 🔤 Fonte nativa (sem precisar do fontkit)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 📄 Nova página
    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // 🔶 Cabeçalho
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(1, 0.48, 0) });
    page.drawText(`BRIVAX - Laudo de ${tipoSistema}`, {
      x: 40,
      y: y - 10,
      size: 16,
      font,
      color: rgb(1, 1, 1),
    });
    y -= 70;

    // 🧾 Informações gerais
    const dataEntrega = document.getElementById("dataEntrega")?.value || "";
    const dataLaudo = document.getElementById("dataLaudo")?.value || "";
    const nomeLoja = document.getElementById("nomeLoja")?.value || "";
    const localInstalacao = document.getElementById("localInstalacao")?.value || "";
    const nomeTecnico = document.getElementById("nomeTecnico")?.value || "";
    const nomeAjudante = document.getElementById("nomeAjudante")?.value || "";

    const info = [
      `Data de Entrega: ${dataEntrega}`,
      `Data do Laudo: ${dataLaudo}`,
      `Loja: ${nomeLoja}`,
      `Local da Instalação: ${localInstalacao}`,
      `Técnico: ${nomeTecnico}`,
      `Ajudante: ${nomeAjudante}`,
    ];

    info.forEach(line => {
      page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 15;
    });

    y -= 10;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;

    // 🔹 Itens
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoes = item.querySelectorAll(".options button.selected");
      const obs = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      if (y < 150) { page = pdfDoc.addPage([595, 842]); y = height - 60; }

      page.drawText(titulo, { x: 40, y, size: 12, font, color: rgb(1, 0.48, 0) });
      y -= 15;

      botoes.forEach(btn => {
        const label = btn.parentNode.querySelector("label")?.textContent || "";
        page.drawText(`${label} ${btn.textContent}`, { x: 50, y, size: 10, font });
        y -= 12;
      });

      if (obs.trim() !== "") {
        const linhas = quebraTexto(`Obs: ${obs}`, 80);
        linhas.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font });
          y -= 12;
        });
      }

      for (let img of imagens) {
        if (y < 200) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
        const imgBytes = await fetch(img.src).then(r => r.arrayBuffer());
        const embed = await pdfDoc.embedJpg(imgBytes);
        const scaled = embed.scale(150 / embed.height);
        page.drawImage(embed, { x: 50, y: y - 150, width: scaled.width, height: scaled.height });
        y -= 160;
      }

      y -= 20;
    }

    // ✍️ Assinaturas
    y -= 40;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 50;

    const assinaturaTec = localStorage.getItem("assinatura_tecnico");
    const assinaturaCli = localStorage.getItem("assinatura_cliente");
    const assinaturaTre = localStorage.getItem("assinatura_treinamento");

    if (assinaturaTec) {
      const bytes = await fetch(assinaturaTec).then(r => r.arrayBuffer());
      const embed = await pdfDoc.embedPng(bytes);
      page.drawText("Assinatura do Técnico", { x: 70, y: y + 70, size: 10, font });
      page.drawImage(embed, { x: 50, y, width: 120, height: 60 });
    }

    if (assinaturaCli) {
      const bytes = await fetch(assinaturaCli).then(r => r.arrayBuffer());
      const embed = await pdfDoc.embedPng(bytes);
      page.drawText("Assinatura do Cliente", { x: 260, y: y + 70, size: 10, font });
      page.drawImage(embed, { x: 250, y, width: 120, height: 60 });
    }

    if (assinaturaTre) {
      const bytes = await fetch(assinaturaTre).then(r => r.arrayBuffer());
      const embed = await pdfDoc.embedPng(bytes);
      page.drawText("Treinamento", { x: 430, y: y + 70, size: 10, font });
      page.drawImage(embed, { x: 420, y, width: 120, height: 60 });
    }

    y -= 100;
    page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 150,
      y,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // 💾 Download automático
    const nomeArquivo = `${prefix}_Laudo_${nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();

  } catch (err) {
    console.error("Erro ao criar PDF:", err);
    alert("❌ Erro ao criar PDF. Veja o console para detalhes.");
  }
}

// 🔠 Função auxiliar para quebrar texto longo
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
