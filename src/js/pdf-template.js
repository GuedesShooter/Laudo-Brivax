// ===============================
// 📄 BRIVAX - PDF TEMPLATE FINAL
// ===============================

async function gerarPDFFire() {
  try {
    await gerarPDFBase("Sistema de Incêndio", "Fire");
  } catch (err) {
    console.error("Erro ao gerar PDF Fire:", err);
    alert("❌ Erro ao gerar PDF de incêndio.");
  }
}

async function gerarPDFSmoke() {
  try {
    await gerarPDFBase("Sistema de Fumaça", "Smoke");
  } catch (err) {
    console.error("Erro ao gerar PDF Smoke:", err);
    alert("❌ Erro ao gerar PDF de fumaça.");
  }
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    let { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = height - 60;

    // 🧯 Cabeçalho
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(1, 0.48, 0) });
    page.drawText(`BRIVAX - Laudo de ${tipoSistema}`, {
      x: 40,
      y: y - 10,
      size: 16,
      font,
      color: rgb(1, 1, 1),
    });

    y -= 70;
    page.setFont(font);
    page.setFontSize(11);

    // 🧾 Informações gerais
    const dataEntrega = document.getElementById("dataEntrega")?.value || "—";
    const dataLaudo = document.getElementById("dataLaudo")?.value || "—";
    const nomeLoja = document.getElementById("nomeLoja")?.value || "—";
    const localInstalacao = document.getElementById("localInstalacao")?.value || "—";
    const nomeTecnico = document.getElementById("nomeTecnico")?.value || "—";
    const nomeAjudante = document.getElementById("nomeAjudante")?.value || "—";

    const infoLines = [
      `Data de Entrega: ${dataEntrega}`,
      `Data do Laudo: ${dataLaudo}`,
      `Loja: ${nomeLoja}`,
      `Local da Instalação: ${localInstalacao}`,
      `Técnico Responsável: ${nomeTecnico}`,
      `Ajudante: ${nomeAjudante}`,
    ];

    infoLines.forEach(line => {
      page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 16;
    });

    y -= 10;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 20;

    // 🧩 Itens do checklist
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoesSelecionados = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      page.drawText(titulo, { x: 40, y, size: 12, font, color: rgb(1, 0.48, 0) });
      y -= 15;

      botoesSelecionados.forEach(btn => {
        page.drawText(`${btn.textContent}`, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 12;
      });

      if (observacoes.trim() !== "") {
        const texto = `Obs: ${observacoes}`;
        const linhas = quebraTexto(texto, 80);
        linhas.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      for (let img of imagens) {
        if (y < 150) {
          page = pdfDoc.addPage([595, 842]);
          const size = page.getSize();
          width = size.width;
          height = size.height;
          y = height - 60;
        }
        const imgBytes = await fetch(img.src).then(res => res.arrayBuffer());
        const imgEmbed = await pdfDoc.embedJpg(imgBytes);
        const scaled = imgEmbed.scale(150 / imgEmbed.height);
        page.drawImage(imgEmbed, { x: 50, y: y - 150, width: scaled.width, height: scaled.height });
        y -= 160;
      }

      y -= 20;
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        const size = page.getSize();
        width = size.width;
        height = size.height;
        y = height - 60;
      }
    }

    // ✍️ Assinaturas
    y -= 30;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 40;

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    page.drawText("Assinatura do Técnico:", { x: 60, y: y + 70, size: 11, font });
    if (assinaturaTecnico) {
      const imgBytes = await fetch(assinaturaTecnico).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 60, y, width: 120, height: 60 });
    }

    page.drawText("Assinatura do Cliente:", { x: 230, y: y + 70, size: 11, font });
    if (assinaturaCliente) {
      const imgBytes = await fetch(assinaturaCliente).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 230, y, width: 120, height: 60 });
    }

    page.drawText("Treinamento:", { x: 400, y: y + 70, size: 11, font });
    if (assinaturaTreinamento) {
      const imgBytes = await fetch(assinaturaTreinamento).then(r => r.arrayBuffer());
      const imgEmbed = await pdfDoc.embedPng(imgBytes);
      page.drawImage(imgEmbed, { x: 400, y, width: 120, height: 60 });
    }

    y -= 100;
    page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 150,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const nomeArquivo = `${prefix}_Laudo_${nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();

    // 📥 Download automático
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("✅ PDF gerado e pronto para download!");
  } catch (error) {
    console.error("Erro ao criar PDF:", error);
    alert("❌ Ocorreu um erro ao criar o PDF. Verifique o console.");
  }
}

// 🔠 Quebra texto longo para PDF
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