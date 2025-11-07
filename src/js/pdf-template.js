// === BRIVAX LAUDO PROFISSIONAL ===
// Geração de PDF Monocromático Profissional
// Funciona para Sistema de Incêndio (Fire)

async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // ===== Cabeçalho =====
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`BRIVAX - Laudo Técnico de ${tipoSistema}`, {
      x: 40,
      y: y - 10,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    y -= 60;

    page.setFont(font);
    page.setFontSize(10);

    // ===== Dados do Cliente =====
    const nomeCliente = document.getElementById("nomeCliente")?.value || "";
    const responsavelEntrega = document.getElementById("responsavelEntrega")?.value || "";
    const cnpjCliente = document.getElementById("cnpjCliente")?.value || "";
    const telefoneCliente = document.getElementById("telefoneCliente")?.value || "";
    const enderecoInstalacao = document.getElementById("enderecoInstalacao")?.value || "";
    const cidadeInstalacao = document.getElementById("cidadeInstalacao")?.value || "";
    const dataEntrega = document.getElementById("dataEntrega")?.value || "";
    const dataLaudo = document.getElementById("dataLaudo")?.value || "";

    const infoCliente = [
      ["Cliente / Contrato:", nomeCliente],
      ["Responsável no Local:", responsavelEntrega],
      ["CNPJ:", cnpjCliente],
      ["Telefone:", telefoneCliente],
      ["Endereço da Instalação:", enderecoInstalacao],
      ["Cidade:", cidadeInstalacao],
      ["Data de Entrega:", dataEntrega],
      ["Data do Laudo:", dataLaudo],
    ];

    infoCliente.forEach(([label, valor]) => {
      page.drawText(label, { x: 40, y, size: 10, font: fontBold });
      page.drawText(valor || "-", { x: 200, y, size: 10, font });
      y -= 15;
    });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 25;

    // ===== Dados da Empresa =====
    const infoEmpresa = [
      ["Empresa:", "BRIVAX SISTEMAS DE COMBATE A INCÊNDIO"],
      ["CNPJ:", "34.810.076/0001-02"],
      ["Especialidade:", "Sistemas de combate e detecção de incêndio"],
      ["E-mail:", "brivax.adm@gmail.com"],
      ["Telefone Comercial:", "(83) 98827-7180"],
    ];

    infoEmpresa.forEach(([label, valor]) => {
      page.drawText(label, { x: 40, y, size: 10, font: fontBold });
      page.drawText(valor, { x: 200, y, size: 10, font });
      y -= 15;
    });

    y -= 20;

    // ===== Checklist =====
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoesSelecionados = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      if (y < 120) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }

      page.drawText(`${i + 1}. ${titulo}`, {
        x: 40,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 12;

      botoesSelecionados.forEach((btn) => {
        page.drawText(`- ${btn.textContent}`, { x: 55, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 10;
      });

      if (observacoes.trim() !== "") {
        page.drawText(`Obs: ${observacoes}`, { x: 55, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 12;
      }

      for (let img of imagens) {
        if (y < 150) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }
        try {
          const imgBytes = await fetch(img.src).then((res) => res.arrayBuffer());
          const imgEmbed = await pdfDoc.embedJpg(imgBytes);
          const scaled = imgEmbed.scale(150 / imgEmbed.height);
          page.drawImage(imgEmbed, { x: 50, y: y - 150, width: scaled.width, height: scaled.height });
          y -= 160;
        } catch (err) {
          console.warn("Erro ao adicionar imagem:", err);
        }
      }

      y -= 10;
      page.drawLine({
        start: { x: 40, y },
        end: { x: width - 40, y },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 20;
    }

    // ===== Assinaturas =====
    if (y < 200) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 100;
    }

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    const drawAssinatura = async (x, label, assinatura) => {
      page.drawText(label, { x, y: y + 60, size: 10, font: fontBold });
      if (assinatura) {
        try {
          const imgBytes = await fetch(assinatura).then((r) => r.arrayBuffer());
          const imgEmbed = await pdfDoc.embedPng(imgBytes);
          page.drawImage(imgEmbed, { x, y, width: 120, height: 50 });
        } catch {
          page.drawText("[Assinatura não carregada]", { x, y: y + 20, size: 9, font });
        }
      }
    };

    await drawAssinatura(50, "Assinatura do Técnico", assinaturaTecnico);
    await drawAssinatura(230, "Assinatura do Cliente", assinaturaCliente);
    await drawAssinatura(410, "Treinamento", assinaturaTreinamento);

    y -= 80;
    page.drawText("Sistema Brivax Laudos Técnicos © 2025", {
      x: width / 2 - 100,
      y,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // ===== Salvar PDF =====
    const nomeArquivo = `${prefix}_Laudo_${nomeCliente.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();

  } catch (e) {
    console.error("Erro ao criar PDF:", e);
    alert("Erro ao gerar o PDF. Verifique as imagens e tente novamente.");
  }
}
