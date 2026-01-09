const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentDiv = document.getElementById("recent");

const API_BASE = "https://ct-n1s8.onrender.com"; // tumhara API base

// ================= SEARCH =================
searchBtn.addEventListener("click", searchNumber);

async function searchNumber() {
  let number = input.value.trim();

  if (!number) {
    showStatus("❌ Enter a number", "error");
    return;
  }

  // +91 remove
  if (number.startsWith("91") && number.length > 10) {
    number = number.slice(-10);
  }

  showStatus("⏳ Loading...", "loading");
  resultsDiv.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/${number}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) throw new Error("API response not OK");

    const data = await res.json();

    if (!data.success || !data.result || data.result.length === 0) {
      showStatus("❌ No data found", "error");
      return;
    }

    showStatus("✅ Data found", "success");
    renderResults(data.result);
    saveRecent(number);

  } catch (err) {
    console.error(err);
    showStatus("❌ API error", "error");
  }
}

// ================= RENDER RESULTS =================
function renderResults(list) {
  resultsDiv.innerHTML = "";

  // max 3 unique results
  const unique = [];
  for (let item of list) {
    const key = `${item.name}-${item.father_name}`;
    if (!unique.some(u => u.key === key)) {
      unique.push({ key, item });
    }
    if (unique.length === 3) break;
  }

  unique.forEach(({ item }) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p><b>Name:</b> ${item.name || "N/A"}</p>
      <p><b>Father:</b> ${item.father_name || "N/A"}</p>
      <p><b>Mobile:</b> ${item.mobile || "N/A"}</p>
      ${item.alt_mobile ? `<p><b>Alt:</b> ${item.alt_mobile}</p>` : ""}
      ${item.circle ? `<p><b>Circle:</b> ${item.circle}</p>` : ""}
      ${item.address ? `<p><b>Address:</b> ${item.address}</p>` : ""}
    `;

    resultsDiv.appendChild(div);
  });
}

// ================= STATUS =================
function showStatus(text, type) {
  statusDiv.innerHTML = text;
  statusDiv.className = type;
}

// ================= RECENT =================
function saveRecent(num) {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recent = [num, ...recent.filter(n => n !== num)].slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recentDiv.innerHTML = recent.map(n => `<li>${n}</li>`).join("");
}

renderRecent();

// ================= CLEAR =================
clearBtn.addEventListener("click", () => {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
});
