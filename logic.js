// ================== ELEMENTS ==================
const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentUl = document.getElementById("recent");
const darkBtn = document.getElementById("darkToggle");

// ================== API CONFIG ==================
const API_BASE = "https://ct-n1s8.onrender.com/?num=";
const API_KEY = "&key=GOKU";
const MAX_RESULTS = 3;

// ================== EVENTS ==================
searchBtn.addEventListener("click", searchNumber);
clearBtn.addEventListener("click", clearAll);

// ================== MAIN SEARCH ==================
async function searchNumber() {
  let number = input.value.trim();

  // clean input
  number = number.replace(/\s+/g, "");
  if (number.startsWith("+91")) number = number.slice(3);
  if (number.startsWith("91") && number.length > 10) number = number.slice(-10);

  if (!/^\d{10}$/.test(number)) {
    statusDiv.innerHTML = "❌ Enter valid 10-digit number";
    return;
  }

  statusDiv.innerHTML = "⏳ Loading...";
  resultsDiv.innerHTML = "";

  try {
    const res = await fetch(API_BASE + number + API_KEY);

    if (!res.ok) {
      throw new Error("Network error");
    }

    const data = await res.json();

    if (!data.success || !Array.isArray(data.result) || data.result.length === 0) {
      statusDiv.innerHTML = "❌ No data found";
      return;
    }

    statusDiv.innerHTML = "";
    renderResults(data.result);
    saveRecent(number);

  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = "❌ API error";
  }
}

// ================== RENDER RESULTS ==================
function renderResults(list) {
  resultsDiv.innerHTML = "";

  const seen = new Set();
  let count = 0;

  for (let info of list) {
    if (count >= MAX_RESULTS) break;

    const key = (info.name || "") + "|" + (info.father_name || "");
    if (seen.has(key)) continue;
    seen.add(key);

    const card = document.createElement("div");
    card.className = "card";

    let html = `<b>Result ${count + 1}</b><br>`;

    if (info.mobile) html += `<b>Mobile:</b> ${info.mobile}<br>`;
    if (info.alt_mobile) html += `<b>Alt:</b> ${info.alt_mobile}<br>`;
    if (info.name) html += `<b>Name:</b> ${info.name}<br>`;
    if (info.father_name) html += `<b>Father:</b> ${info.father_name}<br>`;
    if (info.address) html += `<b>Address:</b> ${info.address}<br>`;
    if (info.email) html += `<b>Email:</b> ${info.email}<br>`;
    if (info.id_number) html += `<b>ID:</b> ${info.id_number}<br>`;

    card.innerHTML = html;
    resultsDiv.appendChild(card);
    count++;
  }
}

// ================== RECENT SEARCH ==================
function saveRecent(num) {
  let arr = JSON.parse(localStorage.getItem("recent") || "[]");
  arr = arr.filter(n => n !== num);
  arr.unshift(num);
  arr = arr.slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(arr));
  renderRecent();
}

function renderRecent() {
  recentUl.innerHTML = "";
  const arr = JSON.parse(localStorage.getItem("recent") || "[]");

  arr.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    li.onclick = () => {
      input.value = n;
      searchNumber();
    };
    recentUl.appendChild(li);
  });
}

// ================== CLEAR ==================
function clearAll() {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
}

// ================== DARK MODE ==================
darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// init
renderRecent();
              
