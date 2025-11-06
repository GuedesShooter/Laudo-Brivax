// === pdf-template.js ===
// Template visual do PDF Brivax Laudos
// Requer: PDF-LIB (https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js)

async function gerarPDFBrivax(dados) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const logoUrl = "./../../assets/brivax-logo.png";
  const logoBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
  const logoImage = await doc.embedPng(logoBytes);

  // === Cabeçalho ===
  const headerColor = rgb(0.85, 0.85, 0.85);
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: headerColor });
  page.drawImage(logoImage, { x: 30, y: height - 70, width: 60, height: 60 });
  page.drawText("Brivax Sistemas de Combate a Incêndio", {
    x: 110,
    y: height - 50,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(dados.titulo, {
    x: 110,
    y: height - 65,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // === Corpo ===
  let y = height - 110;
  page.drawText(`Laudo Nº: ${dados.numero}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Loja: ${dados.loja}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Data da Instalação: ${dados.dataEntrega}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Técnico: ${dados.tecnicoResponsavel}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Ajudante: ${dados.ajudanteResponsavel}`, { x: 40, y, size: 10, font });

  y -= 30;
  page.drawText("Checklist e Fotos:", { x: 40, y, size: 12, font, color: rgb(1, 0.45, 0) });
  y -= 15;

  for (const item of dados.itens) {
    if (y < 150) {
      const newPage = doc.addPage([595, 842]);
      y = 800;
    }
    page.drawText(`${item.nome}`, { x: 40, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 14;
    if (item.observacao) {
      page.drawText(`Obs: ${item.observacao}`, { x: 50, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 12;
    }

    // Exibe até 4 imagens em duas colunas
    if (item.fotos && item.fotos.length) {
      let x = 40;
      for (let i = 0; i < item.fotos.length; i++) {
        if (i % 2 === 0 && i !== 0) {
          y -= 110;
          x = 40;
        }
        const imgBytes = await fetch(item.fotos[i]).then(r => r.arrayBuffer());
        const img = await doc.embedJpg(imgBytes);
        page.drawImage(img, { x, y: y - 100, width: 240, height: 100 });
        x += 260;
      }
      y -= 120;
    }
    y -= 10;
  }

  // === Rodapé ===
  page.drawLine({ start: { x: 40, y: 60 }, end: { x: width - 40, y: 60 }, thickness: 0.5 });
  page.drawText("Assinatura Técnico", { x: 80, y: 45, size: 10, font });
  page.drawText("Assinatura Cliente", { x: 380, y: 45, size: 10, font });

  page.drawText("Brivax Sistemas de Combate a Incêndio – Todos os direitos reservados", {
    x: 80,
    y: 25,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}
