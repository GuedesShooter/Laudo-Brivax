// === Funções principais para geração dos PDFs da Brivax ===

async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio", "Fire");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça", "Smoke");
}

// === Função base ===
async function gerarPDFBase(tipoSistema, prefix) {
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let y = height - 60;

    // === Cabeçalho com logo e título ===
    const logoUrl = "../assets/brivax-logo.png";
    try {
      const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
      const logoImg = await pdfDoc.embedPng(logoBytes);
      const logoScaled = logoImg.scale(80 / logoImg.height);
      page.drawImage(logoImg, { x: 40, y: y - 30, width: logoScaled.width, height: logoScaled.height });
    } catch {
      // ignora se logo não encontrado
    }

    page.drawText(`BRIVAX - Laudo Técnico de ${tipoSistema}`, {
      x: 150,
      y: y - 10,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 70;

    // === Informações gerais ===
    const info = {
      entrega: document.getElementById("dataEntrega")?.value || "",
      laudo: document.getElementById("dataLaudo")?.value || "",
      loja: document.getElementById("nomeLoja")?.value || "",
      local: document.getElementById("localInstalacao")?.value || "",
      tecnico: document.getElementById("nomeTecnico")?.value || "",
      ajudante: document.getElementById("nomeAjudante")?.value || ""
    };

    const linhas = [
      `Data de Entrega: ${info.entrega}`,
      `Data do Laudo: ${info.laudo}`,
      `Loja: ${info.loja}`,
      `Local: ${info.local}`,
      `Técnico Responsável: ${info.tecnico}`,
      `Ajudante: ${info.ajudante}`
    ];

    page.setFontSize(11);
    for (const linha of linhas) {
      page.drawText(linha, { x: 40, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 15;
    }

    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    });
    y -= 25;

    // === Loop pelos itens do checklist ===
    const itens = document.querySelectorAll(".item");
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const titulo = item.querySelector("h3")?.textContent || `Item ${i + 1}`;
      const botoes = item.querySelectorAll(".options button.selected");
      const obs = item.querySelector("textarea")?.value || "";
      const imagens = item.querySelectorAll(".preview img");

      // título
      if (y < 120) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
      page.drawText(titulo, { x: 40, y, size: 12, font, color: rgb(0, 0, 0) });
      y -= 14;

      // botões
      botoes.forEach(b => {
        const txt = b.textContent.trim();
        page.drawText(`• ${txt}`, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 12;
      });

      // observações
      if (obs.trim() !== "") {
        const linhasObs = quebrarTexto(`Obs: ${obs}`, 90);
        linhasObs.forEach(l => {
          page.drawText(l, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
          y -= 12;
        });
      }

      // imagens
      for (let img of imagens) {
        if (y < 180) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
        const bytes = await fetch(img.src).then(r => r.arrayBuffer());
        const imgEmbed = await pdfDoc.embedJpg(bytes);
        const scale = 150 / imgEmbed.height;
        page.drawImage(imgEmbed, { x: 50, y: y - 150, width: imgEmbed.width * scale, height: imgEmbed.height * scale });
        y -= 160;
      }

      y -= 15;
    }

    // === Assinaturas ===
    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    });
    y -= 80;

    const assinaturaTec = localStorage.getItem("assinatura_tecnico");
    const assinaturaCli = localStorage.getItem("assinatura_cliente");
    const assinaturaTre = localStorage.getItem("assinatura_treinamento");

    const assinaturaSet = [
      { label: "Técnico", img: assinaturaTec, x: 50 },
      { label: "Cliente", img: assinaturaCli, x: 220 },
      { label: "Treinamento", img: assinaturaTre, x: 390 }
    ];

    assinaturaSet.forEach(a => {
      page.drawText(`Assinatura do ${a.label}:`, { x: a.x, y: y + 60, size: 10, font });
      if (a.img) {
        try {
          const bytes = fetch(a.img).then(r => r.arrayBuffer());
          bytes.then(b => {
            pdfDoc.embedPng(b).then(imgEmbed => {
              page.drawImage(imgEmbed, { x: a.x, y, width: 120, height: 60 });
            });
          });
        } catch {}
      }
    });

    y -= 120;
    page.drawText("Gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
      x: 100,
      y,
      size: 9,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });

    // === Geração e Download ===
    const nomeLoja = info.loja.replace(/\s+/g, "_") || "SemNome";
    const data = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const nomeArquivo = `Laudo_${prefix}_${nomeLoja}_${data}.pdf`;

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);

  } catch (e) {
    console.error("Erro ao criar PDF:", e);
    alert("❌ Erro ao gerar o PDF. Verifique o console.");
  }
}

// === Função auxiliar para quebra de texto ===
function quebrarTexto(texto, max) {
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
