// === 📄 pdf-template.js ===
// Gera PDF profissional e envia por e-mail e WhatsApp

async function gerarEEnviarLaudo(dados) {
  const { PDFDocument, rgb } = PDFLib;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // === 🎨 Layout básico ===
  const margem = 40;
  let y = height - 60;

  // Cor e fontes
  const corPrincipal = rgb(0.3, 0.3, 0.3);
  const fontSizeNormal = 11;

  // === 🧱 Cabeçalho ===
  const logoUrl = "../assets/brivax-logo.png";
  try {
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImg = await doc.embedPng(logoBytes);
    const logoWidth = 100;
    const logoHeight = 40;
    page.drawImage(logoImg, {
      x: margem,
      y: y - logoHeight,
      width: logoWidth,
      height: logoHeight
    });
  } catch (err) {
    console.warn("Logo não encontrada:", err);
  }

  page.drawText("BRIVAX SISTEMAS DE COMBATE A INCÊNDIO", {
    x: margem + 120,
    y: y - 10,
    size: 14,
    color: corPrincipal,
  });

  y -= 60;
  page.drawLine({
    start: { x: margem, y },
    end: { x: width - margem, y },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 20;

  // === 🧾 Informações gerais ===
  const info = [
    `Laudo Nº: ${dados.numero || "N/D"}`,
    `Tipo: ${dados.titulo || "N/D"}`,
    `Loja: ${dados.loja || "N/D"}`,
    `Local: ${dados.local || "N/D"}`,
    `Data Laudo: ${dados.dataLaudo || "N/D"}`,
    `Data Entrega: ${dados.dataEntrega || "N/D"}`,
    `Técnico: ${dados.tecnicoResponsavel || "N/D"}`,
    `Ajudante: ${dados.ajudanteResponsavel || "N/D"}`,
    `Telefone: ${dados.telefoneCliente || "N/D"}`,
    `E-mail: ${dados.emailCliente || "N/D"}`
  ];

  info.forEach((line, i) => {
    page.drawText(line, {
      x: margem,
      y: y - i * 14,
      size: fontSizeNormal,
      color: corPrincipal,
    });
  });

  y -= info.length * 14 + 10;
  page.drawLine({
    start: { x: margem, y },
    end: { x: width - margem, y },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 25;

  // === 🧰 Itens do Laudo ===
  for (const item of dados.itens) {
    const nome = item.nome || "Item";
    const obs = item.observacao || "";
    page.drawText(nome, { x: margem, y, size: 12, color: rgb(0, 0, 0) });
    y -= 14;

    if (obs) {
      page.drawText("Observação: " + obs, { x: margem + 10, y, size: fontSizeNormal });
      y -= 16;
    }

    if (item.fotos && item.fotos.length > 0) {
      for (const foto of item.fotos) {
        try {
          const imgBytes = await fetch(foto).then(r => r.arrayBuffer());
          const img = await doc.embedPng(imgBytes);
          const iw = 150;
          const ih = 100;
          if (y - ih < 100) {
            page = doc.addPage([595, 842]);
            y = height - 60;
          }
          page.drawImage(img, {
            x: margem + 10,
            y: y - ih,
            width: iw,
            height: ih
          });
          y -= ih + 10;
        } catch (e) {
          console.warn("Erro ao inserir imagem:", e);
        }
      }
    }

    y -= 10;
    if (y < 100) {
      page = doc.addPage([595, 842]);
      y = height - 60;
    }
  }

  // === ✍️ Assinaturas ===
  y -= 20;
  page.drawLine({
    start: { x: margem, y },
    end: { x: width - margem, y },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 40;

  if (dados.assinaturas?.tecnico) {
    const imgBytes = await fetch(dados.assinaturas.tecnico).then(r => r.arrayBuffer());
    const img = await doc.embedPng(imgBytes);
    page.drawImage(img, { x: margem, y: y - 40, width: 120, height: 40 });
  }
  if (dados.assinaturas?.cliente) {
    const imgBytes = await fetch(dados.assinaturas.cliente).then(r => r.arrayBuffer());
    const img = await doc.embedPng(imgBytes);
    page.drawImage(img, { x: 220, y: y - 40, width: 120, height: 40 });
  }
  if (dados.assinaturas?.treinamento) {
    const imgBytes = await fetch(dados.assinaturas.treinamento).then(r => r.arrayBuffer());
    const img = await doc.embedPng(imgBytes);
    page.drawImage(img, { x: 400, y: y - 40, width: 120, height: 40 });
  }

  page.drawText("Técnico", { x: margem + 40, y: y - 50, size: 10 });
  page.drawText("Cliente", { x: 260, y: y - 50, size: 10 });
  page.drawText("Treinamento", { x: 440, y: y - 50, size: 10 });

  // === Rodapé ===
  page.drawLine({
    start: { x: margem, y: 60 },
    end: { x: width - margem, y: 60 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText("Gerado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: margem,
    y: 45,
    size: 9,
    color: rgb(0.5, 0.5, 0.5),
  });

  // === 💾 Exportar PDF ===
  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const nomeArquivo = `Laudo_${dados.tipo.replace(/\s/g, "_")}_${dados.loja || "Loja"}.pdf`;

  // Download automático
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();

  // Envio de e-mail
  const assunto = `Laudo Loja ${dados.loja} - ${dados.dataLaudo || ""}`;
  const corpoEmail =
    `Olá,\n\nSegue em anexo o laudo de entrega de serviço.\n\n` +
    `Loja: ${dados.loja}\nSistema: ${dados.tipo}\nData: ${dados.dataLaudo}\n\n` +
    `Qualquer dúvida, estamos à disposição.\n\nEquipe Brivax.`;

  const mailto = `mailto:${dados.emailCliente}?cc=brivax.adm@gmail.com&subject=${encodeURIComponent(
    assunto
  )}&body=${encodeURIComponent(corpoEmail)}`;
  window.open(mailto);

  // Envio via WhatsApp (se informado)
  if (dados.telefoneCliente) {
    const msg = `Olá, aqui é a Brivax 👋\nSegue o laudo da loja *${dados.loja}* (${dados.tipo}) enviado por e-mail.\nQualquer dúvida, estamos à disposição.`;
    const zap = `https://wa.me/${dados.telefoneCliente.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(zap);
  }
}