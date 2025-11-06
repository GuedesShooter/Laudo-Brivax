// === pdf-template.js ===
// Template visual do PDF Brivax Laudos (incêndio / fumaça)
// Requer: PDF-LIB (https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js)  [oai_citation:0‡GitHub](https://github.com/Hopding/pdf-lib?utm_source=chatgpt.com)

async function gerarPDFBrivax(dados) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 tamanho
  const { width, height } = page.getSize();

  // Fonte
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Logo
  const logoUrl = "./assets/brivax-logo.png"; // caminho relativo ao html
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
    color: rgb(0,0,0)
  });
  page.drawText(dados.titulo, {
    x: 110,
    y: height - 65,
    size: 10,
    font,
    color: rgb(0.2,0.2,0.2)
  });

  // === Identificação inicial ===
  let y = height - 110;
  page.drawText(`Laudo Nº: ${dados.numero}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Loja: ${dados.loja}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Local da Instalação: ${dados.local}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Data do Laudo: ${dados.dataLaudo}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Data de Entrega: ${dados.dataEntrega}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Técnico: ${dados.tecnicoResponsavel}`, { x: 40, y, size: 10, font });
  y -= 20;
  page.drawText(`Ajudante: ${dados.ajudanteResponsavel}`, { x: 40, y, size: 10, font });
  y -= 30;

  page.drawText("Checklist e Fotos:", { x: 40, y, size: 12, font, color: rgb(1,0.45,0) });
  y -= 15;

  // === Itens com fotos e observações ===
  for (const item of dados.itens) {
    if (y < 150) {
      // nova página
      const newPage = doc.addPage([595, 842]);
      y = height - 80;
    }

    page.drawText(`${item.nome}`, { x: 40, y, size: 10, font, color: rgb(0,0,0) });
    y -= 14;

    if (item.observacao) {
      page.drawText(`Obs: ${item.observacao}`, { x: 50, y, size: 9, font, color: rgb(0.3,0.3,0.3) });
      y -= 12;
    }

    if (item.fotos && item.fotos.length > 0) {
      let x = 40;
      for (let i = 0; i < item.fotos.length; i++) {
        const fotoUrl = item.fotos[i];
        const imgBytes = await fetch(fotoUrl).then(r => r.arrayBuffer());
        const img = await doc.embedJpg(imgBytes);

        page.drawImage(img, {
          x: x,
          y: y - 150,
          width: 150,   // largura ~150px conforme você pediu
          height: 150
        });

        x += 160; // espaçamento entre colunas
        if ((i+1) % 2 === 0) {
          y -= 160;
          x = 40;
        }
      }
      y -= 170;
    }

    y -= 10;
  }

  // === Rodapé ===
  page.drawLine({ start: { x: 40, y: 60 }, end: { x: width - 40, y: 60 }, thickness: 0.5 });
  page.drawText("Assinatura Técnico", { x: 80, y: 45, size: 10, font });
  page.drawText("Assinatura Cliente", { x: 380, y: 45, size: 10, font });

  page.drawText("Brivax Sistemas de Combate a Incêndio – Todos os direitos reservados", {
    x: 80, y: 25, size: 8, font, color: rgb(0.4,0.4,0.4)
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}

// Função auxiliar para download + envio
async function gerarEEnviarLaudo(dados) {
  const pdfBytes = await gerarPDFBrivax(dados);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const fileName = `Laudo_${dados.numero}_${dados.loja.replace(/\s+/g, "_")}.pdf`;
  const url = URL.createObjectURL(blob);

  // download automático
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  // preparo do e-mail
  const assunto = `Laudo Loja ${dados.loja} - ${dados.dataLaudo}`;
  const corpo = `Olá,\n\nSegue abaixo o PDF do laudo de entrega de serviço.\nQualquer dúvida estamos à disposição.\nA equipe Brivax agradece!`;
  window.open(`mailto:${dados.emailCliente}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);

  // WhatsApp
  const telefone = dados.telefoneCliente.replace(/\D/g, "");
  if (telefone) {
    const msg = `Olá! Aqui é da Brivax. Seu laudo técnico está pronto ✅\nEnviamos o PDF do laudo de entrega do serviço para conferência.`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`, "_blank");
  }
}