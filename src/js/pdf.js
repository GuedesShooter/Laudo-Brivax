function gerarPDF(tipoSistema) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const nomeLoja = document.getElementById("nomeLoja").value;
  const local = document.getElementById("local").value;
  const obs = document.getElementById("observacoes").value;
  const emailCliente = document.getElementById("emailCliente").value;
  const telefone = document.getElementById("telefoneCliente").value;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("BRIVAX LAUDOS TÉCNICOS", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Laudo - Sistema de ${tipoSistema}`, 105, 35, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Loja: ${nomeLoja}`, 20, 50);
  doc.text(`Local: ${local}`, 20, 58);
  doc.text(`Telefone: ${telefone}`, 20, 66);
  doc.text("Observações:", 20, 78);
  doc.setFont("helvetica", "normal");
  doc.text(obs || "Nenhuma observação registrada.", 20, 86, { maxWidth: 170 });

  // Assinaturas
  const imgTec = document.getElementById("assinaturaTecnico").toDataURL("image/png");
  const imgCli = document.getElementById("assinaturaCliente").toDataURL("image/png");
  doc.text("Assinatura do Técnico:", 20, 130);
  doc.addImage(imgTec, "PNG", 20, 135, 70, 30);
  doc.text("Assinatura do Cliente:", 110, 130);
  doc.addImage(imgCli, "PNG", 110, 135, 70, 30);

  doc.setFontSize(9);
  doc.text("Enviado automaticamente pelo sistema Brivax Laudos Técnicos", 105, 270, { align: "center" });

  // Salvar e enviar
  const nomeArquivo = `Laudo_${tipoSistema}_${nomeLoja.replace(/\s+/g, "_")}.pdf`;
  const pdfBase64 = doc.output("datauristring");
  doc.save(nomeArquivo);

  // Abrir email pronto
  const assunto = `Brivax Laudos - ${nomeLoja} (${tipoSistema})`;
  const corpoEmail = `
    Prezado(a),<br><br>
    Segue em anexo o laudo técnico referente ao sistema de ${tipoSistema.toLowerCase()}.<br>
    Loja: ${nomeLoja}<br>
    Local: ${local}<br><br>
    Atenciosamente,<br>
    <b>Equipe Brivax</b>
  `;
  const mailto = `mailto:${emailCliente}?cc=brivax.adm@gmail.com&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
  window.location.href = mailto;
}
