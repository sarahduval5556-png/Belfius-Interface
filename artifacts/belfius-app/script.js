/* ===================== Belfius — script.js ===================== */

const VALID_USERNAME = "Andrea33";
const VALID_PASSWORD = "Moi12";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Page navigation ---------- */
function showPage(id) {
  $$(".page").forEach((p) => p.classList.remove("active"));
  $("#" + id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showView(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const target = document.querySelector(`.view[data-view="${name}"]`);
  if (target) target.classList.add("active");
  $$(".nav-item").forEach((n) => {
    n.classList.toggle("active", n.dataset.target === name);
  });
}

/* ---------- Login form ---------- */
const loginForm = $("#login-form");
const loginError = $("#login-error");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = $("#username").value.trim();
  const password = $("#password").value;

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    loginError.hidden = true;
    showPage("loading-page");
    setTimeout(() => {
      showPage("app-page");
      showView("home");
    }, 2400);
  } else {
    loginError.hidden = false;
    loginForm.classList.add("shake");
    setTimeout(() => loginForm.classList.remove("shake"), 350);
  }
});

/* ---------- Toggle password visibility ---------- */
const toggleBtn = $("#toggle-pwd");
toggleBtn.addEventListener("click", () => {
  const input = $("#password");
  const icon = toggleBtn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

/* ---------- Remember-me toggle ---------- */
const rememberToggle = $("#remember-toggle");
rememberToggle.addEventListener("click", () => {
  const next = rememberToggle.getAttribute("aria-pressed") !== "true";
  rememberToggle.setAttribute("aria-pressed", String(next));
});

/* ---------- Bottom nav ---------- */
$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.target));
});

/* Quick action buttons that navigate */
$$("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.go));
});

/* ---------- Balance visibility ---------- */
const eyeBtn = $("#eye-btn");
const balanceAmount = $("#balance-amount");
let balanceHidden = false;
const REAL_BALANCE = "1 750 000,00 €";
eyeBtn.addEventListener("click", () => {
  balanceHidden = !balanceHidden;
  balanceAmount.textContent = balanceHidden ? "•••••• €" : REAL_BALANCE;
  const icon = eyeBtn.querySelector("i");
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
});

/* ---------- Transfer form (BLOCKED) ---------- */
const transferForm = $("#transfer-form");
const transferError = $("#transfer-error");

transferForm.addEventListener("submit", (e) => {
  e.preventDefault();
  transferError.hidden = false;
  transferError.scrollIntoView({ behavior: "smooth", block: "center" });
  transferForm.classList.add("shake");
  setTimeout(() => transferForm.classList.remove("shake"), 350);
});

/* Hide the transfer error as user re-types */
["ben-name", "iban", "bic", "amount"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => { transferError.hidden = true; });
});

/* ---------- Logout ---------- */
function logout() {
  showPage("login-page");
  loginForm.reset();
  rememberToggle.setAttribute("aria-pressed", "false");
  showView("home");
}
$("#logout-btn").addEventListener("click", logout);
$("#logout-btn-2").addEventListener("click", logout);

/* ---------- Tiny shake animation injected at runtime ---------- */
const style = document.createElement("style");
style.textContent = `
  @keyframes shakeX {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
  .shake { animation: shakeX 0.32s ease; }
`;
document.head.appendChild(style);
