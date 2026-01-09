// ===== ELEMENTS =====
const input = document.getElementById("numberInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");
const recentList = document.getElementById("recent");
const darkBtn = document.getElementById("darkToggle");

// ===== API =====
const API_URL = "https://ct-n1s8.onrender.com/?number=";

// ===== SEARCH =====
searchBtn.addEventListener("click", searchNumber);

async function searchNumber() {
  let number = input.value.trim();

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
    const res = await fetch(API_URL + number);
    const data = await res.json();

    if (!data.success || !data.result || data.result.length === 0) {
      statusDiv.innerHTML = "❌ No data found";
      return;
    }

    statusDiv.innerHTML = "";
    showResults(data.result);
    addRecent(number);

  } catch (e) {
    console.error(e);
    statusDiv.innerHTML = "❌ API error";
  }
}

// ===== SHOW RESULTS =====
function showResults(list) {
  list.slice(0, 3).forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>Record ${i + 1}</b><br>
      Name: ${item.name || "-"}<br>
      Father: ${item.father_name || "-"}<br>
      Mobile: ${item.mobile || "-"}<br>
      Alt: ${item.alt_mobile || "-"}<br>
      Circle: ${item.circle || "-"}<br>
      Address: ${item.address || "-"}
    `;
    resultsDiv.appendChild(div);
  });
}

// ===== RECENT =====
function addRecent(num) {
  const li = document.createElement("li");
  li.textContent = num;
  recentList.prepend(li);
}

// ===== CLEAR =====
clearBtn.addEventListener("click", () => {
  input.value = "";
  resultsDiv.innerHTML = "";
  statusDiv.innerHTML = "";
});

// ===== DARK MODE =====
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
  
