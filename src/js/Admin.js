window.onload = function() {
  const users = JSON.parse(localStorage.getItem("brivaxUsers")) || [];
  const tbody = document.querySelector("#usersTable tbody");
  const laudosContainer = document.getElementById("laudosContainer");

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Nenhum usuário cadastrado.</td></tr>`;
    return;
  }

  users.forEach((user, index) => {
    const status = user.ativo !== false ? "Ativo" : "Inativo";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.nome} ${user.sobrenome}</td>
      <td>${user.celular}</td>
      <td>${status}</td>
      <td>
        <button class="enable" onclick="ativarUsuario(${index}, true)">Ativar</button>
        <button class="disable" onclick="ativarUsuario(${index}, false)">Desativar</button>
        <button class="edit" onclick="alterarSenha(${index})">Alterar Senha</button>
        <button class="history" onclick="verHistorico('${user.username}')">Laudos</button>
      </td>
    `;
    tbody.appendChild(row);
  });
};

function ativarUsuario(index, ativo) {
  const users = JSON.parse(localStorage.getItem("brivaxUsers")) || [];
  users[index].ativo = ativo;
  localStorage.setItem("brivaxUsers", JSON.stringify(users));
  alert(ativo ? "Usuário ativado!" : "Usuário desativado!");
  location.reload();
}

function alterarSenha(index) {
  const nova = prompt("Digite a nova senha:");
  if (!nova) return;
  const users = JSON.parse(localStorage.getItem("brivaxUsers")) || [];
  users[index].password = nova;
  localStorage.setItem("brivaxUsers", JSON.stringify(users));
  alert("Senha alterada com sucesso!");
}

function verHistorico(username) {
  const laudos = JSON.parse(localStorage.getItem("brivaxLaudos")) || [];
  const userLaudos = laudos.filter(l => l.username === username);

  const container = document.getElementById("laudosContainer");
  container.innerHTML = `<h4>Laudos de ${username}</h4>`;

  if (userLaudos.length === 0) {
    container.innerHTML += "<p>Nenhum laudo encontrado.</p>";
    return;
  }

  userLaudos.forEach(l => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ddd";
    div.style.padding = "6px 0";
    div.innerHTML = `
      <strong>Data:</strong> ${l.data}<br>
      <strong>Loja:</strong> ${l.loja}<br>
      <strong>Sistema:</strong> ${l.sistema}<br>
    `;
    container.appendChild(div);
  });
}
