// === GERAÇÃO DE PDF BRIVAX ===
// Atualizado: Revisão completa com limpeza de caracteres, cabeçalho detalhado e layout profissional monocromático

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

    // 🧹 Sanitiza caracteres incompatíveis com WinAnsi
    const sanitizeText = (texto) =>
      (texto || "")
        .replace(/₂/g, "2")
        .replace(/₃/g, "3")
        .replace(/₄/g, "4")
        .replace(/[^\x00-\x7FÀ-ÿ\s.,:;!?()ºª°-]/g, "");

    // === Página inicial ===
    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // Cabeçalho
    page.drawText(sanitizeText(`BRIVAX - Laudo de ${tipoSistema}`), {
      x: 40,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    // === Informações gerais ===
    const dataEntrega = document.getElementById("dataEntrega")?.value || "";
    const dataLaudo = document.getElementById("dataLaudo")?.value || "";
    const nomeLoja = document.getElementById("nomeLoja")?.value || "";
    const localInstalacao = document.getElementById("localInstalacao")?.value || "";
    const nomeTecnico = document.getElementById("nomeTecnico")?.value || "";
    const nomeAjudante = document.getElementById("nomeAjudante")?.value || "";

    const infoCliente = [
      `Cliente: ${nomeLoja}`,
      `Local de Instalação: ${localInstalacao}`,
      `Data de Entrega do Serviço: ${dataEntrega}`,
      `Data do Laudo: ${dataLaudo}`,
      `Técnico Responsável: ${nomeTecnico}`,
      `Ajudante: ${nomeAjudante}`,
    ];

    infoCliente.forEach((linha) => {
      page.drawText(sanitizeText(linha), {
        x: 40,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 16;
    });

    y -= 15;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    y -= 30;

    // === Informações da empresa ===
    const infoEmpresa = [
      "Empresa: Brivax Sistemas de Combate a Incêndio",
      "CNPJ: 34.810.076/0001-02",
      "Especializada em sistemas de combate e detecção de incêndio",
      "Contato: brivax.adm@gmail.com | (83) 98827-7180",
    ];

    infoEmpresa.forEach((linha) => {
      page.drawText(sanitizeText(linha), {
        x: 40,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 14;
    });

    y -= 20;

    // === Checklist e imagens ===
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

      page.drawText(sanitizeText(titulo), {
        x: 40,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 15;

      // Botões Sim/Não
      botoesSelecionados.forEach((btn) => {
        const label = btn.parentNode.previousElementSibling?.textContent || "";
        page.drawText(sanitizeText(`${label}: ${btn.textContent}`), {
          x: 50,
          y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 12;
      });

      // Observações
      if (observacoes.trim() !== "") {
        const texto = `Observações: ${observacoes}`;
        const linhas = quebraTexto(sanitizeText(texto), 85);
        linhas.forEach((linha) => {
          page.drawText(linha, {
            x: 50,
            y,
            size: 10,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 12;
        });
      }

      // Imagens
      for (let img of imagens) {
        if (y < 160) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 60;
        }

        try {
          const imgBytes = await fetch(img.src).then((res) => res.arrayBuffer());
          const imgEmbed = await pdfDoc.embedJpg(imgBytes);
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
    }

    // === Assinaturas ===
    y -= 30;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 40;

    const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
    const assinaturaCliente = localStorage.getItem("assinatura_cliente");
    const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

    // Desenha assinaturas
    const drawAssinatura = async (label, imgData, x) => {
      page.drawText(sanitizeText(label), { x, y: y + 70, size: 10, font });
      if (imgData) {
        try {
          const bytes = await fetch(imgData).then((r) => r.arrayBuffer());
          const img = await pdfDoc.embedPng(bytes);
          page.drawImage(img, { x, y, width: 120, height: 60 });
        } catch {
          console.warn(`Erro ao carregar assinatura de ${label}`);
        }
      }
    };

    await drawAssinatura("Assinatura do Técnico", assinaturaTecnico, 60);
    await drawAssinatura("Assinatura do Cliente", assinaturaCliente, 230);
    await drawAssinatura("Treinamento", assinaturaTreinamento, 400);

    y -= 110;
    page.drawText("Gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: width / 2 - 160,
      y,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // === Finaliza e baixa ===
    const nomeArquivo = `${prefix}_Laudo_${nomeLoja.replace(/\s+/g, "_") || "SemNome"}.pdf`;
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
  } catch (e) {
    console.error("Erro ao criar PDF:", e);
    alert("Erro ao gerar o PDF. Verifique o console.");
  }
}

// === Função auxiliar de quebra de texto ===
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
