// === GERAÇÃO DE LAUDOS BRIVAX ===
async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça", "Smoke");
}

async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 🧹 Limpa caracteres não suportados
    const sanitizeText = (texto) =>
      (texto || "")
        .replace(/₂/g, "2")
        .replace(/₃/g, "3")
        .replace(/₄/g, "4")
        .replace(/[^\x00-\x7FÀ-ÿ\s.,:;!?()ºª°-]/g, "");

    // 🧾 Função que lê múltiplos possíveis IDs
    function getValue(...ids) {
      for (const id of ids) {
        const el = document.querySelector(`#${id}`);
        if (el && el.value.trim()) return el.value.trim();
      }
      return "Não informado";
    }

    // === Cria página ===
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 60;

    // === Cabeçalho ===
    page.drawText(sanitizeText(`BRIVAX - Laudo de ${tipoSistema}`), {
      x: 40,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // === Informações gerais ===
    const info = {
      dataEntrega: getValue("dataEntrega", "entrega"),
      dataLaudo: getValue("dataLaudo", "laudo"),
      nomeLoja: getValue("nomeLoja", "lojaNome", "loja"),
      localInstalacao: getValue("localInstalacao", "enderecoInstalacao", "local"),
      nomeTecnico: getValue("nomeTecnico", "tecnicoResponsavel", "tecnico"),
      nomeAjudante: getValue("nomeAjudante", "ajudanteNome", "ajudante"),
    };

    const infoLines = [
      `Data de Entrega: ${info.dataEntrega}`,
      `Data do Laudo: ${info.dataLaudo}`,
      `Loja: ${info.nomeLoja}`,
      `Local da Instalação: ${info.localInstalacao}`,
      `Técnico Responsável: ${info.nomeTecnico}`,
      `Ajudante: ${info.nomeAjudante}`,
    ];

    infoLines.forEach((line) => {
      page.drawText(sanitizeText(line), { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 15;
    });

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 20;

    // === Checklists ===
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = sanitizeText(item.querySelector("h3")?.textContent || `Item ${i + 1}`);
      const observacoes = sanitizeText(item.querySelector("textarea")?.value || "");
      const imagens = item.querySelectorAll(".preview img");

      // Título do item
      page.drawText(`${titulo}`, { x: 40, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
      y -= 15;

      // === Imagens ===
      for (let img of imagens) {
        if (y < 180) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }

        try {
          let imgEmbed;
          if (img.src.startsWith("data:")) {
            const base64 = img.src.split(",")[1];
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            imgEmbed = await pdfDoc.embedJpg(bytes);
          } else if (img.src.startsWith("blob:")) {
            const res = await fetch(img.src);
            const blobData = await res.blob();
            const buf = await blobData.arrayBuffer();
            imgEmbed = await pdfDoc.embedJpg(buf);
          } else {
            const imgBytes = await fetch(img.src).then((r) => r.arrayBuffer());
            imgEmbed = await pdfDoc.embedJpg(imgBytes);
          }

          const scaled = imgEmbed.scale(140 / imgEmbed.height);
          page.drawImage(imgEmbed, {
            x: 60,
            y: y - 140,
            width: scaled.width,
            height: scaled.height,
          });
          y -= 150;
        } catch (err) {
          console.warn("Erro ao inserir imagem:", err);
        }
      }

      // === Respostas de Teste e Funcionamento ===
      const grupos = item.querySelectorAll(".options");
      let respostasTexto = "";
      grupos.forEach((grupo) => {
        const selecionado = grupo.querySelector(".selected");
        if (selecionado) respostasTexto += `${selecionado.textContent.trim()} `;
      });

      if (respostasTexto.trim()) {
        page.drawText(`Observação: Teste feito e está ${respostasTexto.includes("Não") ? "NÃO funcionando." : "funcionando."}`, {
          x: 60,
          y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 14;
      }

      // === Observações adicionais ===
      if (observacoes.trim()) {
        const texto = `Obs: ${observacoes}`;
        const linhas = quebraTexto(sanitizeText(texto), 80);
        linhas.forEach((l) => {
          page.drawText(l, { x: 60, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      y -= 10;
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }
    }

    // === Assinaturas ===
    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    y -= 20;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
    y -= 50;

    if (assinaturaTecnico) await desenharAssinatura(pdfDoc, page, assinaturaTecnico, "Técnico", 60, y);
    if (assinaturaCliente) await desenharAssinatura(pdfDoc, page, assinaturaCliente, "Cliente", 230, y);
    if (assinaturaTreinamento) await desenharAssinatura(pdfDoc, page, assinaturaTreinamento, "Treinamento", 400, y);

    y -= 110;
    page.drawText("Gerado automaticamente pelo Sistema Brivax Laudos Técnicos", {
      x: 120,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const nomeArquivo = `${prefix}_Laudo_${info.nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();

    // Download local
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
  } catch (error) {
    console.error("Erro ao criar PDF:", error);
    alert("Erro ao gerar o PDF. Verifique as imagens e tente novamente.");
  }
}

// === Função para desenhar assinaturas ===
async function desenharAssinatura(pdfDoc, page, dataURL, label, x, y) {
  const { rgb, StandardFonts } = PDFLib;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Assinatura do ${label}:`, { x, y: y + 65, size: 11, font, color: rgb(0, 0, 0) });

  try {
    const base64 = dataURL.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const imgEmbed = await pdfDoc.embedPng(bytes);
    page.drawImage(imgEmbed, { x, y, width: 120, height: 60 });
  } catch (err) {
    console.warn(`Erro ao inserir assinatura ${label}:`, err);
  }
}

// === Quebra de texto ===
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
