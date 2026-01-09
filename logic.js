// ================= CONFIG =================
const API_URL = "https://project-n1s8.onrender.com/?num={num}&key=GOKU";
const MAX_RESULTS = 3;

// ================= ELEMENTS =================
const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentUl = document.getElementById("recent");
const darkToggle = document.getElementById("darkToggle");

// ================= HELPERS =================
function normalizeNumber(num) {
  num = num.replace(/\D/g, "");
  if (num.startsWith("91") && num.length > 10) {
    num = num.slice(2);
  }
  return num.length === 10 ? num : null;
}

function setStatus(msg, error = false) {
  statusDiv.innerHTML = error
    ? `<span class="error">❌ ${msg}</span>`
    : `<span class="loading">${msg}</span>`;
}

function addRecent(num) {
  let items = JSON.parse(localStorage.getItem("recent") || "[]");
  items = items.filter(n => n !== num);
  items.unshift(num);
  items = items.slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(items));
  renderRecent();
}

function renderRecent() {
  let items = JSON.parse(localStorage.getItem("recent") || "[]");
  recentUl.innerHTML = "";
  items.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    li.onclick = () => {
      input.value = n;
      searchBtn.click();
    };
    recentUl.appendChild(li);
  });
}

// ================= MAIN SEARCH =================
async function searchNumber() {
  const raw = input.value.trim();
  const number = normalizeNumber(raw);

  resultsDiv.innerHTML = "";
  if (!number) {
    setStatus("Invalid number", true);
    return;
  }

  setStatus("Loading...");
  addRecent(number);

  try {
    const res = await fetch(API_URL.replace("{num}", number));
    const data = await res.json();

    if (!data || !data.success || !Array.isArray(data.result) || data.result.length === 0) {
      setStatus("No data found", true);
      return;
    }

    statusDiv.innerHTML = "";

    let shown = 0;
    const seen = new Set();

    data.result.forEach(info => {
      if (shown >= MAX_RESULTS) return;

      const key = (info.name || "") + "|" + (info.father_name || "");
      if (seen.has(key)) return;
      seen.add(key);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        ${info.mobile ? `<p>📞 <b>Number:</b> ${info.mobile}</p>` : ""}
        ${info.alt_mobile ? `<p>☎️ <b>Alt:</b> ${info.alt_mobile}</p>` : ""}
        ${info.name ? `<p>👤 <b>Name:</b> ${info.name}</p>` : ""}
        ${info.father_name ? `<p>👨 <b>Father:</b> ${info.father_name}</p>` : ""}
        ${info.address ? `<p>🏠 <b>Address:</b> ${info.address}</p>` : ""}
        ${info.email ? `<p>📧 <b>Email:</b> ${info.email}</p>` : ""}
        ${info.id_number ? `<p>🪪 <b>ID:</b> ${info.id_number}</p>` : ""}
      `;

      resultsDiv.appendChild(card);
      shown++;
    });

  } catch (e) {
    console.error(e);
    setStatus("API error", true);
  }
}

// ================= EVENTS =================
searchBtn.onclick = searchNumber;

clearBtn.onclick = () => {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
};

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

// ================= INIT =================
renderRecent();
