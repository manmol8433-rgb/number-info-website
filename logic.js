const API_URL = "https://project-n1s8.onrender.com/?num={num}&key=GOKU";
const MAX_RESULTS = 4;
const MAX_ALT_LEVEL = 3;

const input = document.getElementById("numberInput");
const resultsBox = document.getElementById("results");
const statusBox = document.getElementById("status");
const recentBox = document.getElementById("recent");

/* Utils */
function normalize(n) {
  n = String(n).replace(/\D/g, "");
  if (n.startsWith("91") && n.length > 10) n = n.slice(2);
  return n.length === 10 ? n : null;
}

function dedupKey(info) {
  return (info.name || "") + "|" + (info.father_name || "");
}

/* Main Search */
async function searchNumber() {
  const mainNum = normalize(input.value);
  if (!mainNum) {
    statusBox.innerHTML = "❌ Invalid number";
    return;
  }

  statusBox.innerHTML = "⏳ Loading...";
  resultsBox.innerHTML = "";

  const queue = [mainNum];
  const visited = {};
  const seen = {};
  let collected = [];

  for (let i = 0; i < queue.length && i < MAX_ALT_LEVEL; i++) {
    const num = queue[i];
    if (visited[num]) continue;
    visited[num] = true;

    try {
      const res = await fetch(API_URL.replace("{num}", num));
      const data = await res.json();
      if (!data.result) continue;

      for (const info of data.result) {
        const key = dedupKey(info);
        if (seen[key]) continue;
        seen[key] = true;
        collected.push(info);

        ["mobile", "alt_mobile"].forEach(k => {
          const alt = normalize(info[k]);
          if (alt && !visited[alt]) queue.push(alt);
        });

        if (collected.length >= MAX_RESULTS) break;
      }
    } catch {}
  }

  if (collected.length === 0) {
    statusBox.innerHTML = "❌ No data found";
    return;
  }

  statusBox.innerHTML = "✅ Result found";

  collected.forEach(info => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      ${info.mobile ? `<b>📞</b> ${info.mobile}<br>` : ""}
      ${info.alt_mobile ? `<b>☎️</b> ${info.alt_mobile}<br>` : ""}
      ${info.name ? `<b>👤</b> ${info.name}<br>` : ""}
      ${info.father_name ? `<b>👨</b> ${info.father_name}<br>` : ""}
      ${info.address ? `<b>🏠</b> ${info.address}<br>` : ""}
      ${info.email ? `<b>📧</b> ${info.email}<br>` : ""}
      ${info.id_number ? `<b>🪪</b> ${info.id_number}<br>` : ""}
    `;
    resultsBox.appendChild(div);
  });

  addRecent(mainNum);
}

/* Recent */
function addRecent(num) {
  const li = document.createElement("li");
  li.textContent = num;
  recentBox.prepend(li);
}

/* Events */
document.getElementById("searchBtn").onclick = searchNumber;

document.getElementById("clearBtn").onclick = () => {
  resultsBox.innerHTML = "";
  statusBox.innerHTML = "";
  input.value = "";
};

document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("light");
};
