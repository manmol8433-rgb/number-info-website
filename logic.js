const API_URL = "https://project-n1s8.onrender.com/?num=";

const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultBox = document.getElementById("result");
const recentBox = document.getElementById("recent");

searchBtn.addEventListener("click", searchNumber);
clearBtn.addEventListener("click", clearAll);

function normalizeNumber(num) {
  num = num.trim();
  if (num.startsWith("91") && num.length > 10) {
    num = num.slice(-10);
  }
  return num;
}

async function searchNumber() {
  let num = normalizeNumber(input.value);

  if (!/^\d{10}$/.test(num)) {
    resultBox.innerHTML = "❌ Invalid number";
    return;
  }

  resultBox.innerHTML = "⏳ Loading...";

  try {
    const res = await fetch(API_URL + num);
    const data = await res.json();

    if (!data || !data.success || !Array.isArray(data.result) || data.result.length === 0) {
      resultBox.innerHTML = "❌ No data found";
      return;
    }

    showResults(data.result);
    saveRecent(num);

  } catch (e) {
    resultBox.innerHTML = "❌ API error";
  }
}

function showResults(list) {
  let html = "";

  list.slice(0, 4).forEach((info, i) => {
    html += `
      <div class="card">
        <h3>${i === 0 ? "🔍 Searched Number" : "🔁 Related Number"}</h3>
        ${info.mobile ? `<p><b>📞 Number:</b> ${info.mobile}</p>` : ""}
        ${info.alt_mobile ? `<p><b>☎️ Alt:</b> ${info.alt_mobile}</p>` : ""}
        ${info.name ? `<p><b>👤 Name:</b> ${info.name}</p>` : ""}
        ${info.father_name ? `<p><b>👨 Father:</b> ${info.father_name}</p>` : ""}
        ${info.address ? `<p><b>🏠 Address:</b> ${info.address}</p>` : ""}
        ${info.email ? `<p><b>📧 Email:</b> ${info.email}</p>` : ""}
        ${info.id_number ? `<p><b>🪪 ID:</b> ${info.id_number}</p>` : ""}
      </div>
    `;
  });

  resultBox.innerHTML = html;
}

function saveRecent(num) {
  let list = JSON.parse(localStorage.getItem("recent")) || [];
  list = [num, ...list.filter(n => n !== num)].slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(list));
  renderRecent();
}

function renderRecent() {
  let list = JSON.parse(localStorage.getItem("recent")) || [];
  recentBox.innerHTML = list.map(n => `<div>${n}</div>`).join("");
}

function clearAll() {
  input.value = "";
  resultBox.innerHTML = "";
}
renderRecent();
    
