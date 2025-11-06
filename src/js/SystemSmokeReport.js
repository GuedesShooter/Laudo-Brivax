// === 💨 BRIVAX - SISTEMA DE FUMAÇA (versão funcional simplificada) ===
// Gera o PDF, baixa localmente e envia cópia pro GitHub

async function gerarLaudoSmoke() {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  // === Campos principais ===
  const nomeLoja = document.getElementById("nomeLoja").value || "Não informado";
  const tecnico = document.getElementById("tecnico").value || "Não informado";
  const ajudante = document.getElementById("ajudante").value || "Não informado";
  const dataLaudo = new Date().toLocaleDateString("pt-BR");

  // === Cria documento PDF ===
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // === Cabeçalho ===
  page.drawText("BRIVAX SISTEMAS DE COMBATE A INCÊNDIO", {
    x: 50, y: height - 60, size: 16, font, color: rgb(1, 0.4, 0)
  });
  page.drawText("Laudo Técnico - Sistema de Detecção de Fumaça", {
    x: 50, y: height - 85, size: 13, font
  });
  page.drawText(`Data: ${dataLaudo}`, { x: 420, y: height - 85, size: 11, font });

  const info = [
    `Loja: ${nomeLoja}`,
    `Técnico responsável: ${tecnico}`,
    `Ajudante: ${ajudante}`
  ];
  let posY = height - 130;
  info.forEach(linha => {
    page.drawText(linha, { x: 50, y: posY, size: 11, font });
    posY -= 15;
  });

  // === Assinaturas ===
  posY -= 100;
  const assinaturaTec = localStorage.getItem("assinatura_tecnico");
  const assinaturaCli = localStorage.getItem("assinatura_cliente");
  const assinaturaTre = localStorage.getItem("assinatura_treinamento");

  if (assinaturaTec) {
    const imgTec = await pdfDoc.embedPng(assinaturaTec);
    page.drawImage(imgTec, { x: 60, y: posY, width: 150, height: 60 });
    page.drawText("Técnico", { x: 100, y: posY - 15, size: 10, font });
  }
  if (assinaturaCli) {
    const imgCli = await pdfDoc.embedPng(assinaturaCli);
    page.drawImage(imgCli, { x: 350, y: posY, width: 150, height: 60 });
    page.drawText("Cliente", { x: 400, y: posY - 15, size: 10, font });
  }
  if (assinaturaTre) {
    posY -= 100;
    const imgTre = await pdfDoc.embedPng(assinaturaTre);
    page.drawImage(imgTre, { x: 200, y: posY, width: 150, height: 60 });
    page.drawText("Treinamento", { x: 240, y: posY - 15, size: 10, font });
  }

  // === Rodapé ===
  page.drawText("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", {
    x: 90, y: 30, size: 9, font, color: rgb(0.4, 0.4, 0.4)
  });

  // === Salvar PDF local ===
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const nomeArquivo = `Laudo_Fumaca_${nomeLoja.replace(/\s+/g, "_")}_${dataLaudo.replace(/\//g, "-")}.pdf`;

  // Download automático
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();

  // === Enviar pro GitHub ===
  const GITHUB_TOKEN = "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";
  const REPO = "GuedesShooter/Laudo-Brivax";
  const PATH = `laudos/${nomeArquivo}`;

  const content = await blobToBase64(blob);

  try {
    const getResp = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`);
    const fileData = await getResp.json();
    const sha = fileData.sha || null;

    const resp = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Laudo automático ${nomeArquivo}`,
        content,
        sha
      })
    });

    if (resp.ok) {
      alert("✅ Laudo salvo no GitHub e baixado com sucesso!");
    } else {
      alert("⚠️ Laudo baixado localmente, mas falhou ao enviar pro GitHub.");
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Laudo baixado, mas não foi possível salvar no GitHub.");
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}