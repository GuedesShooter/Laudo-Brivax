async function gerarLaudoFire() {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  const nomeLoja = document.getElementById("nomeLoja").value || "Loja";
  const tecnico = document.getElementById("tecnicoResponsavel").value || "-";
  const ajudante = document.getElementById("ajudanteResponsavel").value || "-";
  const dataLaudo = document.getElementById("dataLaudo").value || new Date().toLocaleDateString();
  const dataEntrega = document.getElementById("dataEntrega").value || "-";
  const emailCliente = document.getElementById("emailCliente").value || "brivax.adm@gmail.com";
  const telefoneCliente = document.getElementById("telefoneCliente").value || "";

  // cria PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // cabeçalho
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(1, 0.48, 0) });
  page.drawText("BRIVAX SISTEMAS DE COMBATE A INCÊNDIO", {
    x: 40, y: height - 50, size: 14, font, color: rgb(1, 1, 1),
  });

  // informações
  page.drawText(`Laudo Nº 034 - Sistema de Incêndio`, { x: 40, y: height - 110, size: 12, font });
  page.drawText(`Loja: ${nomeLoja}`, { x: 40, y: height - 130, size: 11, font });
  page.drawText(`Técnico: ${tecnico}`, { x: 40, y: height - 150, size: 11, font });
  page.drawText(`Ajudante: ${ajudante}`, { x: 40, y: height - 170, size: 11, font });
  page.drawText(`Data do Laudo: ${dataLaudo}`, { x: 40, y: height - 190, size: 11, font });
  page.drawText(`Entrega da Instalação: ${dataEntrega}`, { x: 40, y: height - 210, size: 11, font });

  // rodapé
  page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: 40, y: 30, size: 9, font, color: rgb(0.4, 0.4, 0.4),
  });

  // salva PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const nomeArquivo = `Laudo_Incendio_${nomeLoja.replace(/\s+/g, "_")}.pdf`;

  // download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();

  // e-mail
  const assunto = `Laudo ${nomeLoja} - Sistema de Incêndio (${dataLaudo})`;
  const corpo = `Olá, segue abaixo o PDF do laudo de entrega de serviço.\nQualquer dúvida estamos à disposição.\n\nEquipe Brivax agradece!`;
  const mailto = `mailto:${emailCliente}?cc=brivax.adm@gmail.com&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  window.open(mailto, "_blank");

  // WhatsApp
  if (telefoneCliente) {
    const numero = telefoneCliente.replace(/\D/g, "");
    const msg = `Olá! Segue o laudo da loja ${nomeLoja} (${dataLaudo}).`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  }
}
