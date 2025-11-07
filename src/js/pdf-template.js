// === FUNÇÃO PRINCIPAL DE GERAÇÃO DE LAUDO (BRIVAX) ===
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

    // Função para limpar caracteres não suportados
    const sanitizeText = (texto) =>
      (texto || "")
        .replace(/₂/g, "2")
        .replace(/₃/g, "3")
        .replace(/₄/g, "4")
        .replace(/[^\x00-\x7FÀ-ÿ\s.,:;!?()ºª°-]/g, "");

    // === CRIA A PÁGINA PRINCIPAL ===
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 60;

    // === CABEÇALHO ===
    page.drawText(sanitizeText(`BRIVAX - Laudo de ${tipoSistema}`), {
      x: 40,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // === INFORMAÇÕES DO CLIENTE ===
    const info = {
      dataEntrega: document.querySelector("#dataEntrega")?.value || "Não informado",
      dataLaudo: document.querySelector("#dataLaudo")?.value || "Não informado",
      nomeLoja: document.querySelector("#nomeLoja")?.value || "Não informado",
      localInstalacao: document.querySelector("#localInstalacao")?.value || "Não informado",
      nomeTecnico: document.querySelector("#nomeTecnico")?.value || "Não informado",
      nomeAjudante: document.querySelector("#nomeAjudante")?.value || "Não informado",
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

    // === CHECKLIST ===
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = sanitizeText(item.querySelector("h3")?.textContent || `Item ${i + 1}`);
      const observacoes = sanitizeText(item.querySelector("textarea")?.value || "");
      const imagens = item.querySelectorAll(".preview img");

      page.drawText(`${titulo}`, { x: 40, y, size: 12, font: fontBold, color: rgb(0, 0, 0) });
      y -= 15;

      // === BOTÕES DE TESTE / FUNCIONAMENTO ===
      const grupos = item.querySelectorAll(".options");
      grupos.forEach((grupo) => {
        const selecionado = grupo.querySelector(".selected");
        if (selecionado) {
          const label = grupo.previousSibling?.textContent?.trim() || "";
          page.drawText(sanitizeText(`${label} ${selecionado.textContent}`), {
            x: 50,
            y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          y -= 12;
        }
      });

      // === OBSERVAÇÕES ===
      if (observacoes.trim() !== "") {
        const texto = `Obs: ${observacoes}`;
        const linhas = quebraTexto(sanitizeText(texto), 80);
        linhas.forEach((l) => {
          page.drawText(l, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      // === IMAGENS ===
      for (let img of imagens) {
        if (y < 150) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }

        try {
          let imgEmbed = null;

          if (img.src.startsWith("data:")) {
            const base64 = img.src.split(",")[1];
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            imgEmbed = await pdfDoc.embedJpg(bytes);
          } else if (img.src.startsWith("blob:")) {
            const response = await fetch(img.src);
            const blobData = await response.blob();
            const arrayBuffer = await blobData.arrayBuffer();
            imgEmbed = await pdfDoc.embedJpg(arrayBuffer);
          } else {
            const imgBytes = await fetch(img.src).then((res) => res.arrayBuffer());
            imgEmbed = await pdfDoc.embedJpg(imgBytes);
          }

          const scaled = imgEmbed.scale(150 / imgEmbed.height);
          page.drawImage(imgEmbed, {
            x: 50,
            y: y - 150,
            width: scaled.width,
            height: scaled.height,
          });
          y -= 160;
        } catch (error) {
          console.warn("Erro ao adicionar imagem:", error);
        }
      }

      y -= 20;
      if (y < 100) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 60;
      }
    }

    // === ASSINATURAS ===
    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    y -= 30;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 60;

    if (assinaturaTecnico) await desenharAssinatura(pdfDoc, page, assinaturaTecnico, "Técnico", 60, y);
    if (assinaturaCliente) await desenharAssinatura(pdfDoc, page, assinaturaCliente, "Cliente", 230, y);
    if (assinaturaTreinamento)
      await desenharAssinatura(pdfDoc, page, assinaturaTreinamento, "Treinamento", 400, y);

    y -= 120;
    page.drawText("Gerado automaticamente pelo Sistema Brivax Laudos Técnicos", {
      x: 120,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const nomeArquivo = `${prefix}_Laudo_${info.nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();

    // === DOWNLOAD LOCAL ===
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

// === FUNÇÃO DE ASSINATURA ===
async function desenharAssinatura(pdfDoc, page, dataURL, label, x, y) {
  const { rgb, StandardFonts } = PDFLib;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Assinatura do ${label}:`, { x, y: y + 70, size: 11, font, color: rgb(0, 0, 0) });

  try {
    const base64 = dataURL.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const imgEmbed = await pdfDoc.embedPng(bytes);
    page.drawImage(imgEmbed, { x, y, width: 120, height: 60 });
  } catch (err) {
    console.warn(`Erro ao inserir assinatura ${label}:`, err);
  }
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
