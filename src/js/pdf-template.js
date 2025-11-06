// pdf-template.js
// Gera PDF profissional para os laudos Brivax

async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça");
}

async function gerarPDFBase(tipoSistema) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  // Cria o documento
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Cabeçalho
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(1, 0.48, 0),
  });

  page.drawText("BRIVAX - LAUDO TÉCNICO", {
    x: 50,
    y: height - 40,
    size: 18,
    color: rgb(1, 1, 1),
    font,
  });

  page.drawText(tipoSistema.toUpperCase(), {
    x: 50,
    y: height - 60,
    size: 12,
    color: rgb(1, 1, 1),
    font,
  });

  let y = height - 100;
  const marginLeft = 50;

  // Dados principais
  const dataHoje = new Date().toLocaleDateString("pt-BR");
  page.drawText(`Data: ${dataHoje}`, { x: marginLeft, y, size: 11, font });
  y -= 20;

  page.drawText(`Tipo de Sistema: ${tipoSistema}`, { x: marginLeft, y, size: 11, font });
  y -= 30;

  // Lista de itens com resultados
  const itens = document.querySelectorAll("#checklist .item");
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
    const label = item.querySelector("label").innerText;
    const selected = item.querySelector(".options .selected");
    const result = selected ? selected.innerText : "—";
    page.drawText(`${i + 1}. ${label} - ${result}`, {
      x: marginLeft,
      y,
      size: 10,
      font,
    });
    y -= 14;

    if (y < 120) {
      page.drawText("Continua...", { x: width - 100, y: 40, size: 9, font });
      y = height - 80;
      pdfDoc.addPage(page);
    }
  }

  // Espaço para assinaturas
  y -= 40;
  page.drawText("_________________________________", { x: marginLeft, y, size: 10, font });
  page.drawText("Técnico Responsável", { x: marginLeft, y: y - 12, size: 10, font });

  page.drawText("_________________________________", { x: width / 2 + 20, y, size: 10, font });
  page.drawText("Cliente / Responsável", { x: width / 2 + 20, y: y - 12, size: 10, font });

  y -= 60;
  page.drawText("_________________________________", { x: marginLeft, y, size: 10, font });
  page.drawText("Treinamento", { x: marginLeft, y: y - 12, size: 10, font });

  // Assinaturas
  const assTec = localStorage.getItem("assinatura_tecnico");
  const assCli = localStorage.getItem("assinatura_cliente");
  const assTre = localStorage.getItem("assinatura_treinamento");

  if (assTec) {
    const imgBytes = await fetch(assTec).then(r => r.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);
    page.drawImage(img, { x: marginLeft + 20, y: y + 60, width: 120, height: 40 });
  }
  if (assCli) {
    const imgBytes = await fetch(assCli).then(r => r.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);
    page.drawImage(img, { x: width / 2 + 40, y: y + 60, width: 120, height: 40 });
  }
  if (assTre) {
    const imgBytes = await fetch(assTre).then(r => r.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);
    page.drawImage(img, { x: marginLeft + 20, y: y + 5, width: 120, height: 40 });
  }

  // Rodapé
  page.drawText("Documento gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: marginLeft,
    y: 40,
    size: 9,
    font,
  });

  // Download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Laudo_${tipoSistema}_${dataHoje.replace(/\//g, "-")}.pdf`;
  link.click();

  alert("✅ PDF do laudo gerado com sucesso!");
}