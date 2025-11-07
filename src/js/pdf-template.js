// === GERAÇÃO DE LAUDO BRIVAX ===
async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // === Função de sanitização ===
    const sanitizeText = (texto) =>
      (texto || "")
        .replace(/₂/g, "2")
        .replace(/₃/g, "3")
        .replace(/₄/g, "4")
        .replace(/[^\x00-\x7FÀ-ÿ\s.,:;!?()/ºª°-]/g, "");

    // === Captura automática de campos ===
    const allFields = {};
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      const id = el.id?.toLowerCase();
      if (id) allFields[id] = el.value?.trim() || "";
    });

    // === Cabeçalho ===
    page.drawRectangle({ x: 0, y: y - 25, width, height: 40, color: rgb(0, 0, 0) });
    page.drawText(`BRIVAX - Laudo de ${tipoSistema}`, {
      x: 40,
      y: y - 10,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    y -= 70;

    // === Bloco do Cliente ===
    const info = {
      nomeCliente: allFields["nomecliente"] || "Não informado",
      responsavelEntrega: allFields["responsavelentrega"] || "Não informado",
      cnpjCliente: allFields["cnpjcliente"] || "Não informado",
      telefoneCliente: allFields["telefonecliente"] || "Não informado",
      enderecoInstalacao: allFields["enderecoinstalacao"] || "Não informado",
      cidadeInstalacao: allFields["cidadeinstalacao"] || "Não informado",
      dataEntrega: allFields["dataentrega"] || "Não informado",
      dataLaudo: allFields["datalaudo"] || "Não informado",
      nomeLoja: allFields["nomeloja"] || "Não informado",
      nomeTecnico: allFields["nometecnico"] || "Não informado",
      nomeAjudante: allFields["nomeajudante"] || "Não informado",
    };

    page.drawText("DADOS DO CLIENTE", { x: 40, y, size: 13, font: fontBold });
    y -= 18;

    const clienteLines = [
      `Cliente / Contrato: ${info.nomeCliente}`,
      `Responsável no Local: ${info.responsavelEntrega}`,
      `CNPJ: ${info.cnpjCliente}`,
      `Telefone: ${info.telefoneCliente}`,
      `Endereço: ${info.enderecoInstalacao}`,
      `Cidade: ${info.cidadeInstalacao}`,
    ];
    clienteLines.forEach((line) => {
      page.drawText(sanitizeText(line), { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 14;
    });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 20;

    // === Dados da Empresa Brivax ===
    page.drawText("EMPRESA RESPONSÁVEL", { x: 40, y, size: 13, font: fontBold });
    y -= 18;
    const empresaLines = [
      "Brivax Sistemas de Combate a Incêndio",
      "CNPJ: 34.810.076/0001-02",
      "E-mail: brivax.adm@gmail.com",
      "Telefone: (83) 98827-7180",
    ];
    empresaLines.forEach((line) => {
      page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 14;
    });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 20;

    // === Checklist ===
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoes = item.querySelectorAll(".options button.selected");
      const observacoes = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      // Título
      page.drawText(sanitizeText(titulo), { x: 40, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
      y -= 16;

      // Teste e funcionamento
      if (botoes.length > 0) {
        botoes.forEach((btn) => {
          const label = btn.closest(".options").previousElementSibling?.textContent?.trim() || "";
          page.drawText(sanitizeText(`- ${btn.textContent}`), { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      // Observações
      if (observacoes.trim() !== "") {
        const linhasObs = observacoes.split("\n");
        linhasObs.forEach((linha) => {
          page.drawText(sanitizeText(`Obs: ${linha}`), { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 12;
        });
      }

      // Imagens
      for (const img of imagens) {
        try {
          const imgBytes = await fetch(img.src).then((r) => r.arrayBuffer());
          const imgEmbed = await pdfDoc.embedJpg(imgBytes);
          const scaled = imgEmbed.scale(150 / imgEmbed.height);
          if (y < 180) {
            page = pdfDoc.addPage([595, 842]);
            y = height - 60;
          }
          page.drawImage(imgEmbed, { x: 50, y: y - 150, width: scaled.width, height: scaled.height });
          y -= 160;
        } catch (e) {
          console.warn("Erro ao adicionar imagem:", e);
        }
      }

      y -= 20;
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }
    }

    // === Assinaturas ===
    y -= 40;
    page.drawText("Assinatura do Técnico:", { x: 60, y: y + 70, size: 11, font });
    page.drawText("Assinatura do Cliente:", { x: 230, y: y + 70, size: 11, font });
    page.drawText("Treinamento:", { x: 400, y: y + 70, size: 11, font });

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    const assinaturas = [
      { data: assinaturaTecnico, x: 60 },
      { data: assinaturaCliente, x: 230 },
      { data: assinaturaTreinamento, x: 400 },
    ];

    for (const a of assinaturas) {
      if (a.data) {
        try {
          const imgBytes = await fetch(a.data).then((r) => r.arrayBuffer());
          const imgEmbed = await pdfDoc.embedPng(imgBytes);
          page.drawImage(imgEmbed, { x: a.x, y, width: 120, height: 60 });
        } catch (e) {
          console.warn("Erro ao adicionar assinatura:", e);
        }
      }
    }

    y -= 100;
    page.drawText("Gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 160,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // === Download automático ===
    const nomeArquivo = `${prefix}_Laudo_${info.nomeCliente.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
  } catch (error) {
    console.error("Erro ao criar PDF:", error);
    alert("Ocorreu um erro ao gerar o PDF.");
  }
}
