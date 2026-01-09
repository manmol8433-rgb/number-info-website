const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentDiv = document.getElementById("recent");

const API_URL = "https://ct-n1s8.onrender.com";

searchBtn.onclick = () => searchNumber();
clearBtn.onclick = clearAll;

async function searchNumber() {
  let number = input.value.trim();

  if (!number) {
    statusDiv.innerHTML = "❌ Enter number";
    return;
  }

  // remove +91 or 91
  number = number.replace(/^(\+91|91)/, "");
  number = number.replace(/\s+/g, "");

  statusDiv.innerHTML = "⏳ Loading...";
  resultsDiv.innerHTML = "";

  try {
    const response = await fetch(API_URL + "/" + number);
    const data = await response.json();

    if (!data || !data.success || !data.result || data.result.length === 0) {
      statusDiv.innerHTML = "❌ No data found";
      return;
    }

    statusDiv.innerHTML = "✅ Data found";
    showResults(data.result);
    saveRecent(number);

  } catch (e) {
    console.error(e);
    statusDiv.innerHTML = "❌ API error";
  }
}

function showResults(list) {
  resultsDiv.innerHTML = "";

  const used = new Set();
  let count = 0;

  for (let item of list) {
    const key = item.name + item.father_name;
    if (used.has(key)) continue;
    used.add(key);

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p><b>Name:</b> ${item.name || "-"}</p>
      <p><b>Father:</b> ${item.father_name || "-"}</p>
      <p><b>Mobile:</b> ${item.mobile || "-"}</p>
      ${item.alt_mobile ? `<p><b>Alt:</b> ${item.alt_mobile}</p>` : ""}
      ${item.circle ? `<p><b>Circle:</b> ${item.circle}</p>` : ""}
      ${item.address ? `<p><b>Address:</b> ${item.address}</p>` : ""}
    `;

    resultsDiv.appendChild(div);
    count++;
    if (count === 3) break;
  }
}

function saveRecent(num) {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recent = [num, ...recent.filter(n => n !== num)].slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  const recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recentDiv.innerHTML = recent.map(n => `<li>${n}</li>`).join("");
}

function clearAll() {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
}

renderRecent();
        
