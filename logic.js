/* ========== CONFIG ========== */
const API_KEY = "GOKU";
const MAX_DEPTH = 3;
const MAX_RESULTS = 4;
const TIMEOUT = 4000;

/* ========== HELPERS ========== */
function cleanNum(n) {
  n = (n || "").replace(/\D/g, "");
  if (n.startsWith("91") && n.length > 10) n = n.slice(2);
  return n.length === 10 ? n : null;
}

function personKey(i) {
  return ((i.name || "").toLowerCase().trim()) +
         "|" +
         ((i.father_name || "").toLowerCase().trim());
}

function toggleDark() {
  document.getElementById("app").classList.toggle("dark");
}

function copyText(t) {
  navigator.clipboard.writeText(t);
  alert("Copied");
}

function clearAll() {
  document.getElementById("result").innerHTML = "";
  document.getElementById("loader").style.display = "none";
}

function addHistory(n) {
  let h = JSON.parse(localStorage.getItem("history") || "[]");
  if (!h.includes(n)) h.unshift(n);
  h = h.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(h));
  document.getElementById("history").innerHTML = h.join("<br>");
}

/* ========== API CALL ========== */
async function callAPI(num) {
  const raw =
    "https://project-n1s8.onrender.com/?num=" + num + "&key=" + API_KEY;

  const url =
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(raw);

  try {
    const c = new AbortController();
    setTimeout(() => c.abort(), TIMEOUT);

    const r = await fetch(url, { signal: c.signal });
    let d = await r.json();

    if (typeof d === "string") d = JSON.parse(d);
    if (d && d.contents) d = JSON.parse(d.contents);

    return d;
  } catch {
    return null;
  }
}

/* ========== MAIN SEARCH ========== */
async function search() {
  const input = document.getElementById("number").value.trim();
  const start = cleanNum(input);
  const out = document.getElementById("result");

  if (!start) {
    out.innerHTML = "<div class='error'>Enter a valid 10-digit number</div>";
    return;
  }

  out.innerHTML = "";
  document.getElementById("loader").style.display = "block";
  addHistory(start);

  let queue = [{ n: start, d: 0 }];
  let seenNums = { [start]: true };
  let seenPeople = {};
  let results = [];

  for (let i = 0; i < queue.length; i++) {
    if (results.length >= MAX_RESULTS) break;

    const { n, d } = queue[i];
    if (d > MAX_DEPTH) continue;

    const data = await callAPI(n);
    if (!data || !Array.isArray(data.result)) continue;

    for (const info of data.result) {
      const key = personKey(info);
      if (seenPeople[key]) continue;

      seenPeople[key] = true;
      results.push(info);

      ["mobile", "alt_mobile"].forEach(x => {
        const cn = cleanNum(info[x]);
        if (cn && !seenNums[cn]) {
          seenNums[cn] = true;
          queue.push({ n: cn, d: d + 1 });
        }
      });

      if (results.length >= MAX_RESULTS) break;
    }
  }

  document.getElementById("loader").style.display = "none";

  if (!results.length) {
    out.innerHTML = "<div class='error'>No data found</div>";
    return;
  }

  results.forEach((i, idx) => {
    out.innerHTML += `
      <div class="card">
        <div class="title">${idx === 0 ? "🟢 SEARCHED" : "🟡 RELATED"}</div>
        ${i.mobile ? `📞 ${cleanNum(i.mobile)} <span class="copy" onclick="copyText('${cleanNum(i.mobile)}')">📋</span><br>` : ""}
        ${i.alt_mobile ? `☎️ ${cleanNum(i.alt_mobile)}<br>` : ""}
        ${i.name ? `👤 ${i.name}<br>` : ""}
        ${i.father_name ? `👨 ${i.father_name}<br>` : ""}
        ${i.address ? `🏠 ${i.address}<br>` : ""}
        ${i.email ? `📧 ${i.email}<br>` : ""}
        ${i.id_number ? `🪪 ${i.id_number}<br>` : ""}
      </div>
    `;
  });
          }

