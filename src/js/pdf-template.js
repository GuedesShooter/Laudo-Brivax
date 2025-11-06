// === PDF Template Brivax - Sistema de Laudos ===
// Usa PDF-LIB para gerar laudos técnicos profissionais
// Compatível com FireSystemChecklist e SmokeSystemChecklist

let numeroLaudo = 34; // começa no 034

async function gerarPDFFire() {
  await gerarPDFBase("Sistema de Incêndio");
}

async function gerarPDFSmoke() {
  await gerarPDFBase("Sistema de Fumaça");
}

async function gerarPDFBase(tipoSistema) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  // Criar documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 vertical
  const { height } = page.getSize();
  const margin = 50;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cores
  const orange = rgb(1, 0.48, 0);
  const gray = rgb(0.2, 0.2, 0.2);

  // Cabeçalho
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: 595.28,
    height: 80,
    color: orange,
  });

  // Logo
  try {
    const logoBytes = await fetch("../assets/brivax-logo.png").then(r => r.arrayBuffer());
    const logo = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logo, { x: 40, y: height - 70, width: 90, height: 60 });
  } catch {
    page.drawText("BRIVAX", { x: 40, y: height - 40, size: 28, font: bold, color: rgb(1, 1, 1) });
  }

  page.drawText(`Laudo Técnico - ${tipoSistema}`, {
    x: 150,
    y: height - 40,
    size: 20,
    font: bold,
    color: rgb(1, 1, 1),
  });

  // Número do laudo
  const num = numeroLaudo.toString().padStart(3, "0");
  page.drawText(`Nº ${num}`, { x: 500, y: height - 40, size: 14, font: bold, color: rgb(1, 1, 1) });

  numeroLaudo++;

  // Dados gerais
  const nomeLoja = document.getElementById("nomeLoja")?.value || "";
  const localInstalacao = document.getElementById("localInstalacao")?.value || "";
  const nomeTecnico = document.getElementById("nomeTecnico")?.value || "";
  const nomeAjudante = document.getElementById("nomeAjudante")?.value || "";
  const dataEntrega = document.getElementById("dataEntrega")?.value || "";
  const dataLaudo = document.getElementById("dataLaudo")?.value || "";

  let cursor = height - 120;
  const lineHeight = 18;

  page.drawText("INFORMAÇÕES GERAIS", { x: margin, y: cursor, size: 13, font: bold, color: gray });
  cursor -= 15;

  const info = [
    `Data de Entrega do Serviço: ${dataEntrega || "—"}`,
    `Data do Laudo: ${dataLaudo || "—"}`,
    `Nome da Loja: ${nomeLoja || "—"}`,
    `Local da Instalação: ${localInstalacao || "—"}`,
    `Técnico Responsável: ${nomeTecnico || "—"}`,
    `Ajudante: ${nomeAjudante || "—"}`
  ];

  info.forEach(line => {
    cursor -= lineHeight;
    page.drawText(line, { x: margin, y: cursor, size: 11, font });
  });

  // Espaçamento
  cursor -= 20;
  page.drawLine({
    start: { x: margin, y: cursor },
    end: { x: 545, y: cursor },
    thickness: 1,
    color: gray
  });

  cursor -= 30;
  page.drawText("RESUMO DO LAUDO", { x: margin, y: cursor, size: 13, font: bold, color: gray });
  cursor -= 15;
  page.drawText("O presente documento certifica a instalação, teste e entrega do sistema descrito acima, conforme normas vigentes.", {
    x: margin,
    y: cursor,
    size: 11,
    font,
    maxWidth: 500,
  });

  // Assinaturas
  const assinaturaTecnico = localStorage.getItem("assinatura_tecnico");
  const assinaturaCliente = localStorage.getItem("assinatura_cliente");
  const assinaturaTreinamento = localStorage.getItem("assinatura_treinamento");

  cursor -= 120;

  if (assinaturaTecnico) {
    const sigBytes = await fetch(assinaturaTecnico).then(r => r.arrayBuffer());
    const sigImg = await pdfDoc.embedPng(sigBytes);
    page.drawImage(sigImg, { x: margin, y: cursor, width: 150, height: 60 });
  }
  if (assinaturaCliente) {
    const sigBytes = await fetch(assinaturaCliente).then(r => r.arrayBuffer());
    const sigImg = await pdfDoc.embedPng(sigBytes);
    page.drawImage(sigImg, { x: 230, y: cursor, width: 150, height: 60 });
  }
  if (assinaturaTreinamento) {
    const sigBytes = await fetch(assinaturaTreinamento).then(r => r.arrayBuffer());
    const sigImg = await pdfDoc.embedPng(sigBytes);
    page.drawImage(sigImg, { x: 410, y: cursor, width: 150, height: 60 });
  }

  cursor -= 20;
  page.drawText("Técnico", { x: margin + 50, y: cursor, size: 10, font });
  page.drawText("Cliente", { x: 280, y: cursor, size: 10, font });
  page.drawText("Treinamento", { x: 460, y: cursor, size: 10, font });

  // Rodapé
  page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: margin,
    y: 40,
    size: 9,
    font,
    color: gray
  });

  // Gerar e baixar
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Laudo_${tipoSistema.replace(/\s+/g, "_")}_${num}.pdf`;
  link.click();
}