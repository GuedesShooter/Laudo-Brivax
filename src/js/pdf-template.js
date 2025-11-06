// === 📄 pdf-template.js ===
// Gera PDF profissional e envia por e-mail e WhatsApp
// Agora com numeração sequencial automática (inicia em 034)

async function gerarEEnviarLaudo(dados) {
  const { PDFDocument, rgb } = PDFLib;

  // === 🔢 Controle de numeração sequencial ===
  let numeroAtual = parseInt(localStorage.getItem("brivaxNumeroLaudo")) || 34;
  dados.numero = numeroAtual.toString().padStart(3, "0");
  localStorage.setItem("brivaxNumeroLaudo", numeroAtual + 1);

  const doc = await PDFDocument.create();
  let page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const margem = 40;
  let y = height - 60;
  const corPrincipal = rgb(0.3, 0.3, 0.3);
  const fontSizeNormal = 11;

  // === 🧱 Cabeçalho ===
  try {
    const logoBytes = await fetch("../assets/brivax-logo.png").then(res => res.arrayBuffer());
    const logoImg = await doc.embedPng(logoBytes);
    page.drawImage(logoImg, { x: margem, y: y - 40, width: 100, height: 40 });
  } catch {
    console.warn("Logo não encontrada");
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
    `Laudo Nº: ${dados.numero}`,
    `Tipo: ${dados.titulo}`,
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
    page.drawText(line, { x: margem, y: y - i * 14, size: fontSizeNormal, color: corPrincipal });
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

    if (item.fotos?.length) {
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

          page.drawImage(img, { x: margem + 10, y: y - ih, width: iw, height: ih });
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

  const assinaturaY = y - 40;

  if (dados.assinaturas?.tecnico) {
    const bytes = await fetch(dados.assinaturas.tecnico).then(r => r.arrayBuffer());
    const img = await doc.embedPng(bytes);
    page.drawImage(img, { x: margem, y: assinaturaY, width: 120, height: 40 });
  }
  if (dados.assinaturas?.cliente) {
    const bytes = await fetch(dados.assinaturas.cliente).then(r => r.arrayBuffer());
    const img = await doc.embedPng(bytes);
    page.drawImage(img, { x: 220, y: assinaturaY, width: 120, height: 40 });
  }
  if (dados.assinaturas?.treinamento) {
    const bytes = await fetch(dados.assinaturas.treinamento).then(r => r.arrayBuffer());
    const img = await doc.embedPng(bytes);
    page.drawImage(img, { x: 400, y: assinaturaY, width: 120, height: 40 });
  }

  page.drawText("Técnico", { x: margem + 40, y: assinaturaY - 12, size: 10 });
  page.drawText("Cliente", { x: 260, y: assinaturaY - 12, size: 10 });
  page.drawText("Treinamento", { x: 440, y: assinaturaY - 12, size: 10 });

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
  const nomeArquivo = `Laudo_${dados.numero}_${dados.tipo.replace(/\s/g, "_")}_${dados.loja || "Loja"}.pdf`;

  // Download automático
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();

  // === ✉️ Envio de e-mail ===
  const assunto = `Laudo Loja ${dados.loja} - Nº ${dados.numero}`;
  const corpoEmail =
    `Olá,\n\nSegue em anexo o laudo de entrega de serviço.\n\n` +
    `Loja: ${dados.loja}\nSistema: ${dados.tipo}\nNúmero: ${dados.numero}\nData: ${dados.dataLaudo}\n\n` +
    `Qualquer dúvida, estamos à disposição.\n\nEquipe Brivax.`;

  const mailto = `mailto:${dados.emailCliente}?cc=brivax.adm@gmail.com&subject=${encodeURIComponent(
    assunto
  )}&body=${encodeURIComponent(corpoEmail)}`;
  window.open(mailto);

  // === 💬 Envio via WhatsApp ===
  if (dados.telefoneCliente) {
    const msg = `Olá, aqui é a Brivax 👋\nSegue o laudo *${dados.numero}* da loja *${dados.loja}* (${dados.tipo}) enviado por e-mail.\nQualquer dúvida, estamos à disposição.`;
    const zap = `https://wa.me/${dados.telefoneCliente.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(zap);
  }
}