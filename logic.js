// ====== ELEMENTS ======
const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentUl = document.getElementById("recent");

// ====== API ======
const API_URL = "https://ct-n1s8.onrender.com/api/lookup?number=";

// ====== EVENTS ======
searchBtn.addEventListener("click", searchNumber);
clearBtn.addEventListener("click", clearAll);

// ====== MAIN FUNCTION ======
async function searchNumber() {
  let number = input.value.trim();

  // remove spaces
  number = number.replace(/\s+/g, "");

  // remove +91 or 91
  if (number.startsWith("+91")) number = number.slice(3);
  if (number.startsWith("91") && number.length > 10) number = number.slice(-10);

  // validation
  if (!/^\d{10}$/.test(number)) {
    statusDiv.innerHTML = "❌ Enter valid 10-digit number";
    return;
  }

  statusDiv.innerHTML = "⏳ Loading...";
  resultsDiv.innerHTML = "";

  try {
    const res = await fetch(API_URL + number);
    const data = await res.json();

    // ---- IMPORTANT CHECK ----
    if (!data.success || !Array.isArray(data.result) || data.result.length === 0) {
      statusDiv.innerHTML = "❌ No data found";
      return;
    }

    statusDiv.innerHTML = "";
    showResults(data.result);
    addRecent(number);

  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = "❌ API error";
  }
}

// ====== SHOW RESULTS ======
function showResults(list) {
  resultsDiv.innerHTML = "";

  // duplicate filter (name + father)
  const seen = new Set();
  const filtered = [];

  for (let item of list) {
    const key = `${item.name}|${item.father_name}`;
    if (!seen.has(key)) {
      seen.add(key);
      filtered.push(item);
    }
    if (filtered.length === 3) break; // max 3
  }

  filtered.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";

    let html = `<b>Result ${index + 1}</b><br>`;

    if (item.name) html += `<b>Name:</b> ${item.name}<br>`;
    if (item.father_name) html += `<b>Father:</b> ${item.father_name}<br>`;
    if (item.mobile) html += `<b>Mobile:</b> ${item.mobile}<br>`;
    if (item.alt_mobile) html += `<b>Alt:</b> ${item.alt_mobile}<br>`;
    if (item.email) html += `<b>Email:</b> ${item.email}<br>`;
    if (item.circle) html += `<b>Circle:</b> ${item.circle}<br>`;
    if (item.address) html += `<b>Address:</b> ${item.address}<br>`;

    card.innerHTML = html;
    resultsDiv.appendChild(card);
  });
}

// ====== RECENT SEARCHES ======
function addRecent(num) {
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

// ====== CLEAR ======
function clearAll() {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
}

// load recent on refresh
renderRecent();
