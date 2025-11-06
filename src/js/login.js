// === Login.js (com sincronização automática do GitHub) ===

// 🔁 Configuração da sincronização
const GITHUB_JSON_URL = "https://raw.githubusercontent.com/GuedesShooter/Laudo-Brivax/refs/heads/main/brivaxUsers.json";

// Função para baixar e atualizar o banco local automaticamente
async function sincronizarBancoLocal(auto = false) {
  try {
    const resp = await fetch(GITHUB_JSON_URL + "?t=" + Date.now());
    const data = await resp.json();

    if (Array.isArray(data)) {
      localStorage.setItem("brivaxUsers", JSON.stringify(data));
      if (!auto) alert("✅ Banco de usuários atualizado do GitHub!");
      else console.log("AutoSync: banco atualizado com sucesso do GitHub");
    } else {
      console.warn("Aviso: formato inesperado do JSON remoto.");
    }
  } catch (err) {
    console.error("Erro ao sincronizar banco:", err);
    if (!auto) alert("⚠️ Falha ao atualizar banco do GitHub (modo offline)");
  }
}

// === Função principal de login ===
function login() {
  const username = document.getElementById("username").value.trim().toUpperCase();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("rememberMe")?.checked || false;

  if (!username || !password) {
    alert("Por favor, preencha usuário e senha.");
    return;
  }

  // Lê os usuários locais
  const users = JSON.parse(localStorage.getItem("brivaxUsers")) || [];

  // Verifica se existe o usuário e se a senha está correta
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    if (remember) {
      localStorage.setItem("brivaxRememberUser", JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem("brivaxRememberUser");
    }

    localStorage.setItem("brivaxUserLogado", JSON.stringify(user));

    if (user.username === "ADM" || user.tipo === "admin") {
      alert("Bem-vindo, Administrador!");
      window.location.href = "AdminScreen.html";
    } else {
      alert(`Bem-vindo, ${user.nome}!`);
      window.location.href = "SelectSystemScreen.html";
    }
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// === Auto preencher se lembrar de mim ===
window.onload = async function() {
  // 1️⃣ Sincroniza automaticamente o banco
  await sincronizarBancoLocal(true);

  // 2️⃣ Preenche usuário/senha lembrados (se houver)
  const remembered = JSON.parse(localStorage.getItem("brivaxRememberUser"));
  if (remembered) {
    document.getElementById("username").value = remembered.username;
    document.getElementById("password").value = remembered.password;
    const checkbox = document.getElementById("rememberMe");
    if (checkbox) checkbox.checked = true;
  }
};
