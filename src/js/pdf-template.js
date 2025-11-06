// ==========================================
// ✅ BRIVAX - PDF TEMPLATE FINAL iPhone Safe
// ==========================================

async function gerarPDFFire() {
  try {
    alert("⏳ Gerando PDF, aguarde...");
    await gerarPDFBase("Sistema de Incêndio", "Fire");
  } catch (err) {
    console.error("Erro ao gerar PDF Fire:", err);
    alert("❌ Erro ao gerar PDF de incêndio.");
  }
}

async function gerarPDFSmoke() {
  try {
    alert("⏳ Gerando PDF, aguarde...");
    await gerarPDFBase("Sistema de Fumaça", "Smoke");
  } catch (err) {
    console.error("Erro ao gerar PDF Smoke:", err);
    alert("❌ Erro ao gerar PDF de fumaça.");
  }
}

function limparTextoPDF(txt) {
  if (!txt) return "";
  return txt
    .replace(/₀/g, "0")
    .replace(/₁/g, "1")
    .replace(/₂/g, "2")
    .replace(/₃/g, "3")
    .replace(/₄/g, "4")
    .replace(/₅/g, "5")
    .replace(/₆/g, "6")
    .replace(/₇/g, "7")
    .replace(/₈/g, "8")
    .replace(/₉/g, "9")
    .replace(/[^\x00-\x7F]/g, ""); // remove outros caracteres unicode
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    let { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = height - 60;

    // Cabeçalho
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(1, 0.48, 0) });
    page.drawText(limparTextoPDF(`BRIVAX - Laudo de ${tipoSistema}`), {
      x: 40,
      y: y - 10,
      size: 16,
      font,
      color: rgb(1, 1, 1),
    });

    y -= 70;
    page.setFont(font);
    page.setFontSize(11);

    // Informações gerais
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
      page.drawText(limparTextoPDF(line), { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 16;
    });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 20;

    // Itens checklist
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoesSelecionados = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        const size = page.getSize();
        width = size.width;
        height = size.height;
        y = height - 60;
      }

      page.drawText(limparTextoPDF(titulo), { x: 40, y, size: 12, font, color: rgb(1, 0.48, 0) });
      y -= 15;

      botoesSelecionados.forEach(btn => {
        page.drawText(limparTextoPDF(btn.textContent), { x: 50, y, size: 10, font });
        y -= 12;
      });

      if (observacoes.trim() !== "") {
        const texto = limparTextoPDF(`Obs: ${observacoes}`);
        const linhas = quebraTexto(texto, 80);
        linhas.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font });
          y -= 12;
        });
      }

      for (let img of imagens) {
        if (!img.src) continue;
        if (y < 200) {
          page = pdfDoc.addPage([595, 842]);
          const size = page.getSize();
          width = size.width;
          height = size.height;
          y = height - 60;
        }
        try {
          const imgBytes = await fetch(img.src).then(res => res.arrayBuffer());
          const imgEmbed = await pdfDoc.embedJpg(imgBytes);
          const scaled = imgEmbed.scale(150 / imgEmbed.height);
          page.drawImage(imgEmbed, {
            x: 50,
            y: y - 150,
            width: scaled.width,
            height: scaled.height,
          });
          y -= 160;
        } catch (e) {
          console.warn("⚠️ Erro ao carregar imagem:", e);
        }
      }

      y -= 10;
    }

    // Assinaturas
    y -= 30;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 40;

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    const desenharAssinatura = async (imgData, x, label) => {
      page.drawText(limparTextoPDF(label), { x, y: y + 70, size: 11, font });
      if (!imgData) return;
      try {
        const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
        const imgEmbed = await pdfDoc.embedPng(imgBytes);
        page.drawImage(imgEmbed, { x, y, width: 120, height: 60 });
      } catch (e) {
        console.warn("⚠️ Erro na assinatura:", e);
      }
    };

    await desenharAssinatura(assinaturaTecnico, 60, "Assinatura do Técnico:");
    await desenharAssinatura(assinaturaCliente, 230, "Assinatura do Cliente:");
    await desenharAssinatura(assinaturaTreinamento, 400, "Treinamento:");

    // Rodapé
    y -= 100;
    page.drawText(limparTextoPDF("Enviado automaticamente pelo sistema Brivax Laudos Técnicos"), {
      x: width / 2 - 150,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const nomeArquivo = `${prefix}_Laudo_${limparTextoPDF(nomeLoja.replace(/\s+/g, "_")) || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();

    // iPhone-safe: abre PDF em nova aba
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfURL = URL.createObjectURL(blob);
    window.open(pdfURL, "_blank");

    alert("✅ PDF gerado e aberto no navegador!");
  } catch (error) {
    console.error("Erro ao criar PDF:", error);
    alert("❌ Ocorreu um erro ao criar o PDF. Verifique o console.");
  }
}

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
