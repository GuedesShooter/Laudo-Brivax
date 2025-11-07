// ==========================
// 📄 pdf-template.js - v5 (Final)
// BRIVAX Laudo Técnico - Monocromático com imagens e acentos
// ==========================

async function gerarPDFFire() {
  await gerarPDFBase("Sistema Contra Incêndio", "Fire");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça", "Smoke");
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const fontkit = window.fontkit;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // === 🔤 Fonte OpenSans que suporta acentos ===
    const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts/apache/opensans/OpenSans-Regular.ttf";
    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 60;

    // 🧯 Cabeçalho
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(0, 0, 0) });
    page.drawText(`BRIVAX - Laudo de ${tipoSistema}`, {
      x: 40,
      y: y - 10,
      size: 16,
      font: customFont,
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

    const infoLines = [
      `Data de Entrega: ${dataEntrega}`,
      `Data do Laudo: ${dataLaudo}`,
      `Nome da Loja: ${nomeLoja}`,
      `Local de Instalação: ${localInstalacao}`,
      `Técnico Responsável: ${nomeTecnico}`,
      `Ajudante: ${nomeAjudante}`,
    ];

    infoLines.forEach(line => {
      page.drawText(line, { x: 40, y, size: 11, font: customFont, color: rgb(0, 0, 0) });
      y -= 16;
    });

    y -= 10;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 20;

    // 🧩 Checklist
    const itens = document.querySelectorAll(".item");

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoesSelecionados = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      page.drawText(titulo, { x: 40, y, size: 12, font: customFont, color: rgb(0, 0, 0) });
      y -= 15;

      botoesSelecionados.forEach(btn => {
        page.drawText(`• ${btn.textContent}`, { x: 50, y, size: 10, font: customFont, color: rgb(0.1, 0.1, 0.1) });
        y -= 12;
      });

      if (observacoes.trim() !== "") {
        const texto = `Obs: ${observacoes}`;
        const linhas = quebraTexto(texto, 90);
        linhas.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2) });
          y -= 12;
        });
      }

      // 🖼️ Inserir imagens reais
      for (let img of imagens) {
        if (y < 160) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }
        const imgBytes = await fetch(img.src).then(r => r.arrayBuffer());
        let imgEmbed;
        if (img.src.startsWith("data:image/png")) {
          imgEmbed = await pdfDoc.embedPng(imgBytes);
        } else {
          imgEmbed = await pdfDoc.embedJpg(imgBytes);
        }
        const ratio = 150 / imgEmbed.height;
        const imgWidth = imgEmbed.width * ratio;
        const imgHeight = imgEmbed.height * ratio;
        page.drawImage(imgEmbed, { x: 50, y: y - imgHeight, width: imgWidth, height: imgHeight });
        y -= imgHeight + 10;
      }

      y -= 10;
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }
    }

    // ✍️ Assinaturas (como imagem)
    y -= 40;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 40;

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    const drawAssinatura = async (assinatura, label, posX) => {
      page.drawText(label, { x: posX, y: y + 70, size: 10, font: customFont, color: rgb(0, 0, 0) });
      if (assinatura) {
        const bytes = await fetch(assinatura).then(r => r.arrayBuffer());
        const img = await pdfDoc.embedPng(bytes);
        page.drawImage(img, { x: posX, y, width: 120, height: 60 });
      } else {
        page.drawText("❌ Não assinada", { x: posX, y: y + 50, size: 9, font: customFont, color: rgb(0.4, 0.4, 0.4) });
      }
    };

    await drawAssinatura(assinaturaTecnico, "Assinatura do Técnico", 50);
    await drawAssinatura(assinaturaCliente, "Assinatura do Cliente", 230);
    await drawAssinatura(assinaturaTreinamento, "Treinamento", 410);

    y -= 100;
    page.drawText("Gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 160,
      y,
      size: 9,
      font: customFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // 📥 Download
    const nomeArquivo = `${prefix}_Laudo_${nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();

  } catch (e) {
    console.error("Erro ao criar PDF:", e);
    alert("❌ Erro ao gerar o PDF. Verifique os dados e tente novamente.");
  }
}

// 🔠 Quebra texto longo
function quebraTexto(texto, max) {
  const palavras = texto.split(" ");
  const linhas = [];
  let atual = "";
  for (let p of palavras) {
    if ((atual + p).length > max) {
      linhas.push(atual.trim());
      atual = p + " ";
    } else atual += p + " ";
  }
  if (atual) linhas.push(atual.trim());
  return linhas;
}
