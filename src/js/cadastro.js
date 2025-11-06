function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const celular = document.getElementById("celular").value.trim();
  const username = document.getElementById("username").value.trim().toUpperCase().replace(/\s+/g, "");
  const senha = document.getElementById("senha").value.trim();
  const confirmaSenha = document.getElementById("confirmaSenha").value.trim();

  if (!nome || !sobrenome || !celular || !username || !senha || !confirmaSenha) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (senha !== confirmaSenha) {
    alert("As senhas não conferem!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("brivaxUsers")) || [];

  if (users.some(u => u.username === username)) {
    alert("Esse nome de usuário já está cadastrado!");
    return;
  }

  users.push({ nome, sobrenome, celular, username, password: senha, tipo: "usuario" });
  localStorage.setItem("brivaxUsers", JSON.stringify(users));

  alert("Usuário cadastrado com sucesso!");
  window.location.href = "LoginScreen.html";
}
