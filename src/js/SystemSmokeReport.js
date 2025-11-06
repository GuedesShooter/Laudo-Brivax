// === 💨 BRIVAX - SISTEMA DE FUMAÇA ===
// Geração e envio do PDF de laudo técnico

async function gerarLaudoSmoke() {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const nomeLoja = document.getElementById("nomeLoja").value || "Não informado";
  const tecnico = document.getElementById("tecnico").value || "Não informado";
  const ajudante = document.getElementById("ajudante").value || "Não informado";
  const dataLaudo = new Date().toLocaleDateString("pt-BR");
  const emailCliente = document.getElementById("emailCliente").value;
  const telefoneCliente = document.getElementById("telefoneCliente").value;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("BRIVAX SISTEMAS DE COMBATE A INCÊNDIO", {
    x: 50, y: height - 60, size: 16, font, color: rgb(1, 0.4, 0)
  });
  page.drawText("Laudo Técnico - Sistema de Detecção de Fumaça", {
    x: 50, y: height - 85, size: 13, font, color: rgb(0, 0, 0)
  });
  page.drawText(`Data: ${dataLaudo}`, { x: 420, y: height - 85, size: 11, font });
  page.drawText(`Laudo nº 034`, { x: 420, y: height - 100, size: 11, font });

  const info = [
    `Loja: ${nomeLoja}`,
    `Técnico responsável: ${tecnico}`,
    `Ajudante: ${ajudante}`,
    `E-mail: ${emailCliente || "não informado"}`,
    `Telefone: ${telefoneCliente || "não informado"}`
  ];
  let posY = height - 130;
  info.forEach(linha => {
    page.drawText(linha, { x: 50, y: posY, size: 11, font });
    posY -= 15;
  });

  posY -= 20;
  page.drawText("Observações e Testes Realizados:", { x: 50, y: posY, size: 12, font, color: rgb(1, 0.3, 0) });
  posY -= 15;
  page.drawText(
    "Foram inspecionados todos os detectores, botoeiras e centrais do sistema de fumaça. " +
    "O sistema encontra-se em pleno funcionamento, conforme normas técnicas vigentes.",
    { x: 50, y: posY, size: 10, font, maxWidth: 480 }
  );

  posY -= 100;
  const assinaturaTec = localStorage.getItem("assinatura_tecnico");
  const assinaturaCli = localStorage.getItem("assinatura_cliente");
  const assinaturaTre = localStorage.getItem("assinatura_treinamento");

  if (assinaturaTec) {
    const imgTec = await pdfDoc.embedPng(assinaturaTec);
    page.drawImage(imgTec, { x: 60, y: posY, width: 150, height: 60 });
    page.drawText("Assinatura do Técnico", { x: 80, y: posY - 15, size: 10, font });
  }
  if (assinaturaCli) {
    const imgCli = await pdfDoc.embedPng(assinaturaCli);
    page.drawImage(imgCli, { x: 350, y: posY, width: 150, height: 60 });
    page.drawText("Assinatura do Cliente", { x: 380, y: posY - 15, size: 10, font });
  }

  if (assinaturaTre) {
    posY -= 100;
    const imgTre = await pdfDoc.embedPng(assinaturaTre);
    page.drawImage(imgTre, { x: 200, y: posY, width: 150, height: 60 });
    page.drawText("Assinatura do Treinamento", { x: 215, y: posY - 15, size: 10, font });
  }

  page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: 90, y: 30, size: 9, font, color: rgb(0.4, 0.4, 0.4)
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const nomeArquivo = `Laudo_Fumaca_${nomeLoja.replace(/\s+/g, "_")}.pdf`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();

  setTimeout(() => {
    const assunto = `Laudo ${nomeLoja} - Sistema de Fumaça (${dataLaudo})`;
    const corpo = `Olá, segue abaixo o PDF do laudo de entrega de serviço.\n\nPor favor, anexe o arquivo ${nomeArquivo} que foi baixado automaticamente.\n\nQualquer dúvida estamos à disposição.\n\nEquipe Brivax agradece!`;
    const mailto = `mailto:${emailCliente}?cc=brivax.adm@gmail.com&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(mailto, "_blank");
  }, 1200);

  if (telefoneCliente) {
    const numero = telefoneCliente.replace(/\D/g, "");
    const msg = `Olá! Segue o laudo da loja ${nomeLoja} (${dataLaudo}). O PDF foi baixado automaticamente e pode ser enviado como anexo.`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  }
}