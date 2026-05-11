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

const viewHistory = ["home"];

function showView(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const target = document.querySelector(`.view[data-view="${name}"]`);
  if (target) {
    target.classList.add("active");
    if (viewHistory[viewHistory.length - 1] !== name) viewHistory.push(name);
  }
  syncBottomNav(name);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncBottomNav(name) {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((t) => t.classList.remove("active"));
  // Map non-tab views to home for highlight purposes
  const navMap = {
    home: "home",
    accounts: "accounts",
    transfer: "transfer",
    profile: "profile",
    savings: "home",
    credits: "home",
    insurance: "home",
  };
  const target = navMap[name] || "home";
  const tab = document.querySelector(`.nav-tab[data-nav="${target}"]`);
  if (tab) tab.classList.add("active");
}

function goBack() {
  if (viewHistory.length > 1) {
    viewHistory.pop();
    const prev = viewHistory[viewHistory.length - 1];
    $$(".view").forEach((v) => v.classList.remove("active"));
    document.querySelector(`.view[data-view="${prev}"]`)?.classList.add("active");
  } else {
    showView("home");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
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

/* ---------- Section card / menu navigation ---------- */
$$("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.go));
});
$$("[data-menu-go]").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeAllDrawers();
    showView(btn.dataset.menuGo);
  });
});
$$("[data-back]").forEach((btn) => btn.addEventListener("click", goBack));

/* Bottom nav tabs */
$$(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.nav));
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

/* ---------- Transfer form (BLOCKED + notification trigger) ---------- */
const transferForm = $("#transfer-form");
const transferError = $("#transfer-error");

transferForm.addEventListener("submit", (e) => {
  e.preventDefault();
  transferError.hidden = false;
  transferError.scrollIntoView({ behavior: "smooth", block: "center" });
  transferForm.classList.add("shake");
  setTimeout(() => transferForm.classList.remove("shake"), 350);

  // Trigger notification: bell badge + add transaction notification
  triggerTransferNotification({
    name: $("#ben-name").value.trim() || "—",
    amount: $("#amount").value || "0,00",
    iban: $("#iban").value.trim() || "—",
  });
});

["ben-name", "iban", "bic", "amount"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => { transferError.hidden = true; });
});

/* ---------- Notification system ---------- */
const bellBtn = $("#bell-btn");
const bellDot = $("#bell-dot");
const notifListTx = $("#notif-list-tx");

function triggerTransferNotification({ name, amount, iban }) {
  bellDot.hidden = false;

  // Remove placeholder if present
  notifListTx.querySelector(".notif-item.placeholder")?.remove();

  const li = document.createElement("li");
  li.className = "notif-item";
  li.innerHTML = `
    <div class="notif-icon"><i class="fa-solid fa-paper-plane"></i></div>
    <div class="notif-body">
      <p class="notif-title">Tentative de virement bloquée</p>
      <p class="notif-text">Vers ${escapeHtml(name)} (${escapeHtml(iban)}) — ${escapeHtml(amount)} €</p>
      <p class="notif-time">${formatNow()}</p>
    </div>
  `;
  notifListTx.prepend(li);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNow() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Aujourd'hui · ${hh}:${mm}`;
}

/* ---------- Drawers ---------- */
const backdrop = $("#drawer-backdrop");
const drawers = {
  notif: $("#notif-drawer"),
  search: $("#search-drawer"),
  support: $("#support-drawer"),
  menu: $("#menu-drawer"),
};

function openDrawer(key) {
  closeAllDrawers();
  backdrop.hidden = false;
  drawers[key].hidden = false;
  document.body.style.overflow = "hidden";
}

function closeAllDrawers() {
  backdrop.hidden = true;
  Object.values(drawers).forEach((d) => (d.hidden = true));
  document.body.style.overflow = "";
}

bellBtn.addEventListener("click", () => {
  openDrawer("notif");
  // Hide notification dot when bell is opened
  bellDot.hidden = true;
});

$("#search-btn").addEventListener("click", () => openDrawer("search"));
$("#support-btn").addEventListener("click", () => openDrawer("support"));
$("#hamburger-btn").addEventListener("click", () => openDrawer("menu"));

backdrop.addEventListener("click", closeAllDrawers);
$$("[data-close-drawer]").forEach((btn) => btn.addEventListener("click", closeAllDrawers));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDrawers();
});

/* ---------- Profile photo upload ---------- */
const avatarEditBtn = $("#avatar-edit");
const avatarInput = $("#avatar-input");
const avatar = $("#avatar");

avatarEditBtn.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    avatar.style.backgroundImage = `url('${ev.target.result}')`;
    avatar.textContent = "";
  };
  reader.readAsDataURL(file);
});

/* ---------- Logout ---------- */
function logout() {
  closeAllDrawers();
  showPage("login-page");
  loginForm.reset();
  rememberToggle.setAttribute("aria-pressed", "false");
  bellDot.hidden = true;
  showView("home");
  viewHistory.length = 0;
  viewHistory.push("home");
}
$("#logout-btn").addEventListener("click", logout);
$("#logout-btn-2").addEventListener("click", logout);

/* ---------- Ad carousel ---------- */
const adSlides = $("#ad-slides");
const adDots = $("#ad-dots");
const totalAds = adSlides.children.length;
let currentAd = 0;

// Build dots
for (let i = 0; i < totalAds; i++) {
  const dot = document.createElement("button");
  dot.className = "ad-dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", `Slide ${i + 1}`);
  dot.addEventListener("click", () => goToAd(i));
  adDots.appendChild(dot);
}

function goToAd(index) {
  currentAd = (index + totalAds) % totalAds;
  adSlides.style.transform = `translateX(-${currentAd * 100}%)`;
  $$(".ad-dot").forEach((d, i) => d.classList.toggle("active", i === currentAd));
}

let adTimer = setInterval(() => goToAd(currentAd + 1), 4500);

// Pause on hover (desktop)
$("#ad-carousel").addEventListener("mouseenter", () => clearInterval(adTimer));
$("#ad-carousel").addEventListener("mouseleave", () => {
  adTimer = setInterval(() => goToAd(currentAd + 1), 4500);
});

/* ---------- Statut du compte — barre de déblocage ---------- */
(function () {
  const bar = document.getElementById("unlock-bar-fill");
  const pct = document.getElementById("unlock-pct");
  const errBox = document.getElementById("unlock-error");
  const btnSupport = document.getElementById("btn-support");
  const popupOverlay = document.getElementById("unlock-popup-overlay");
  const popupDismiss = document.getElementById("popup-dismiss");
  const popupCloseBtn = document.getElementById("popup-close-btn");

  if (!bar) return;

  // Progression par paliers (simule des "coups" avec transition 0.3s)
  // On monte de 0 → 80 % en plusieurs étapes pour que la barre ne soit pas trop fluide
  const steps = [5, 12, 20, 28, 35, 42, 50, 57, 65, 72, 80];
  let stepIndex = 0;
  let done = false;

  // Délai entre chaque palier (ms) — aléatoire pour paraître réel
  const delays = [420, 550, 480, 600, 520, 380, 640, 560, 480, 520, 0];

  function runNextStep() {
    if (stepIndex >= steps.length || done) return;
    const val = steps[stepIndex];
    const delay = delays[stepIndex] || 500;
    stepIndex++;

    setTimeout(() => {
      bar.style.width = val + "%";
      pct.textContent = val + " %";

      if (val < 80) {
        runNextStep();
      } else {
        // 80 % atteint — arrêt brutal
        done = true;
        // Pause courte, puis affichage erreur
        setTimeout(() => {
          bar.classList.add("error-state");
          pct.style.color = "var(--danger)";
          errBox.hidden = false;
          btnSupport.hidden = false;
          // Pop-up s'ouvre automatiquement
          setTimeout(() => {
            popupOverlay.hidden = false;
            document.body.style.overflow = "hidden";
          }, 600);
        }, 350);
      }
    }, delay);
  }

  // Démarrer la progression 1,8 s après le chargement du dashboard
  // (on déclenche dès que la vue home est visible)
  function startUnlockAnimation() {
    if (stepIndex === 0) {
      setTimeout(runNextStep, 1800);
    }
  }

  // S'assurer que l'animation se lance sur la vue home (active au login)
  startUnlockAnimation();

  // Fermer le pop-up
  function closePopup() {
    popupOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  if (popupDismiss) popupDismiss.addEventListener("click", closePopup);
  if (popupCloseBtn) popupCloseBtn.addEventListener("click", closePopup);
  if (popupOverlay) {
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) closePopup();
    });
  }
})();

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
