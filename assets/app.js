(() => {
  const ICONS = { flight: "✈️", move: "🚃", see: "🍁", food: "🍜", rest: "☕", hotel: "🏨", shop: "🛍️" };
  const HOME_IDS = new Set(["hotel1", "yuen"]);

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const params = new URLSearchParams(location.search);
  const PLAN_KEYS = Object.keys(PLANS);
  const SINGLE_PLAN = PLAN_KEYS.length === 1;
  const state = {
    plan: PLANS[params.get("plan")] ? params.get("plan") : (PLANS[localStorage.getItem("plan")] ? localStorage.getItem("plan") : PLAN_KEYS[0]),
    tab: "schedule",
    mapDay: "all",
  };

  const gmapSearch = (p) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q)}`;
  const gmapDir = (from, to, mode) =>
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from.q)}&destination=${encodeURIComponent(to.q)}&travelmode=${mode}`;
  const gmapDay = (day) => {
    const r = dedupe(day.route).map((id) => PLACES[id]);
    const url = new URL("https://www.google.com/maps/dir/");
    url.searchParams.set("api", "1");
    url.searchParams.set("origin", r[0].q);
    url.searchParams.set("destination", r[r.length - 1].q);
    if (r.length > 2) url.searchParams.set("waypoints", r.slice(1, -1).map((p) => p.q).join("|"));
    if (day.mode === "driving") url.searchParams.set("travelmode", "driving");
    return url.toString();
  };
  const dedupe = (ids) => ids.filter((id, i) => id !== ids[i - 1]);

  /* ---------- D-day ---------- */
  function renderDday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(TRIP.start + "T00:00:00");
    const end = new Date(TRIP.end + "T00:00:00");
    const diff = Math.round((start - today) / 86400000);
    let text;
    if (diff > 0) text = `D-${diff}`;
    else if (today <= end) text = `여행 ${1 - diff}일차`;
    else text = "다녀왔어요";
    $("#dday").textContent = text;
  }

  /* ---------- 일정안 선택 ---------- */
  function renderPlanSwitch() {
    if (SINGLE_PLAN) return;
    $("#planSwitch").innerHTML = Object.entries(PLANS)
      .map(([key, p]) => `<button class="plan-btn ${key === state.plan ? "active" : ""}" data-plan="${key}"><b>${p.name}</b><small>${esc(p.title)}</small></button>`)
      .join("");
  }

  function setPlan(key) {
    state.plan = key;
    state.mapDay = "all";
    localStorage.setItem("plan", key);
    const url = new URL(location.href);
    url.searchParams.set("plan", key);
    history.replaceState(null, "", url);
    renderPlanSwitch();
    renderSchedule();
    if (map) renderMap();
  }

  /* ---------- 일정 탭 ---------- */
  const yen = (n) => `¥${n.toLocaleString("ko-KR")}`;
  const manwon = (y) => `${(Math.round((y * TRIP.krwPerYen) / 1000) / 10).toLocaleString("ko-KR")}만원`;
  const sumCost = (day) => (day.cost || []).reduce((a, [, v]) => a + v, 0);

  function costHtml(day) {
    if (!day.cost) return "";
    return `
      <details class="cost">
        <summary><span>💴 예상 비용 (4인)</span><b>약 ${yen(Math.round(sumCost(day) / 100) * 100)}</b><small class="krw">${manwon(sumCost(day))}</small></summary>
        <ul>${day.cost.map(([label, v]) => `<li><span>${esc(label)}</span><span>${yen(v)}</span></li>`).join("")}</ul>
      </details>`;
  }

  function renderSchedule() {
    const plan = PLANS[state.plan];
    const total = plan.days.reduce((a, d) => a + sumCost(d), 0);
    const fatigue = [1, 2, 3, 4, 5].map((n) => `<i class="${n <= plan.fatigue ? "on" : ""}"></i>`).join("");
    $("#planSummary").innerHTML = `
      <div class="card summary">
        <h2>${SINGLE_PLAN ? "확정 일정" : plan.name} · ${esc(plan.title)}</h2>
        <p>${esc(plan.summary)}</p>
        <div class="meta">
          <div><span>하이라이트</span>${esc(plan.highlight)}</div>
          <div><span>렌터카</span>${esc(plan.car)}</div>
          <div><span>피로도</span><b class="fatigue">${fatigue}</b></div>
          <div><span>공유</span><button class="btn" id="shareBtn" style="padding:2px 8px">🔗 링크 공유</button></div>
          ${total ? `<div class="total"><span>현지 예상 경비 (4인 · 5일)</span><b>약 ${yen(Math.round(total / 1000) * 1000)}</b> <small>약 ${manwon(total)} · 1인 약 ${yen(Math.round(total / 4 / 100) * 100)}</small>${plan.costNote ? `<em>${esc(plan.costNote)}</em>` : ""}<em>총 예산 ${(TRIP.budgetKrw / 10000).toLocaleString("ko-KR")}만원 (항공 포함) · 환율 100엔 = 약 ${Math.round(TRIP.krwPerYen * 100)}원 기준</em></div>` : ""}
        </div>
        <div class="proscons">
          <div class="pro"><b>좋은 점</b><ul>${plan.pros.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
          <div class="con"><b>고려할 점</b><ul>${plan.cons.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        </div>
      </div>`;

    $("#days").innerHTML = plan.days
      .map((day, i) => {
        const color = DAY_COLORS[i % DAY_COLORS.length];
        const items = day.items
          .map((it) => `
            <li class="${it.type}">
              <span class="t-time">${esc(it.time)}</span>
              <span class="t-icon">${ICONS[it.type] || "•"}</span>
              <span class="t-text">${esc(it.text)}${it.note ? `<span class="t-note">${esc(it.note)}</span>` : ""}</span>
            </li>`)
          .join("");
        return `
          <article class="card day open reveal" data-day="${i}" style="--day:${color}">
            <button class="day-head" data-toggle="${i}">
              <span class="day-badge"><b>${esc(day.date)}</b><small>${esc(day.dow)}</small></span>
              <span class="day-title"><small>${i + 1}일차</small><div>${esc(day.title)}</div></span>
              <span class="chev">▼</span>
            </button>
            <div class="day-body"><div><div class="day-inner">
              <ul class="timeline">${items}</ul>
              ${costHtml(day)}
              <div class="day-foot">
                <button class="btn solid" data-goto-map="${i}">🗺️ 지도에서 동선 보기</button>
                <a class="btn" href="${gmapDay(day)}" target="_blank" rel="noopener">구글맵 열기</a>
              </div>
            </div></div></div>
          </article>`;
      })
      .join("");
    observeReveal();
  }

  /* ---------- 단풍 효과 ---------- */
  const LEAF_COLORS = ["#d62d20", "#b3261e", "#e0561b", "#d9a11b", "#f0c043", "#8c1c13"];
  const LEAF_PATH = "M50 2 L56 20 L66 14 L63 34 L80 24 L76 38 L96 40 L82 52 L88 58 L64 62 L66 72 L52 66 L52 98 L48 98 L48 66 L34 72 L36 62 L12 58 L18 52 L4 40 L24 38 L20 24 L37 34 L34 14 L44 20 Z";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  function leafEl(cls) {
    const el = document.createElement("span");
    el.className = cls;
    const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
    el.innerHTML = `<svg viewBox="0 0 100 100"><path d="${LEAF_PATH}" fill="${color}"/></svg>`;
    el.style.setProperty("--size", `${rand(14, 28)}px`);
    el.style.setProperty("--spin", `${rand(-540, 540)}deg`);
    el.style.setProperty("--sway", `${rand(2, 4)}s`);
    return el;
  }

  function initLeaves() {
    if (reducedMotion) return;
    const box = $("#leaves");
    for (let i = 0; i < 14; i++) {
      const el = leafEl("leaf");
      el.style.left = `${rand(0, 100)}%`;
      el.style.setProperty("--dur", `${rand(7, 14)}s`);
      el.style.setProperty("--delay", `${rand(-14, 0)}s`);
      el.style.setProperty("--drift", `${rand(-60, 80)}px`);
      el.style.opacity = rand(0.55, 0.95);
      box.appendChild(el);
    }
    $("#hero").addEventListener("click", (e) => {
      const rect = box.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        const el = leafEl("leaf burst");
        const angle = rand(0, Math.PI * 2);
        const dist = rand(60, 160);
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
        el.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
        el.style.setProperty("--by", `${Math.sin(angle) * dist + 60}px`);
        el.style.setProperty("--dur", `${rand(1.4, 2.4)}s`);
        el.addEventListener("animationend", () => el.remove());
        box.appendChild(el);
      }
    });
  }

  let revealObserver;
  function observeReveal() {
    const els = document.querySelectorAll(".reveal:not(.shown)");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("shown"));
      return;
    }
    revealObserver ||= new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("shown");
        revealObserver.unobserve(en.target);
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => revealObserver.observe(el));
  }

  async function share() {
    const url = location.href;
    const title = `${TRIP.title} · ${PLANS[state.plan].name}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch (_) { /* 취소 */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("링크를 복사했어요. 카톡에 붙여넣기 하세요!");
    } catch (_) {
      prompt("아래 링크를 복사하세요", url);
    }
  }

  /* ---------- 지도 탭 ---------- */
  let map, layer;

  function initMap() {
    map = L.map("map", { zoomControl: true, tap: true }).setView([43.06, 141.35], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layer = L.layerGroup().addTo(map);

    const Locate = L.Control.extend({
      options: { position: "topright" },
      onAdd() {
        const btn = L.DomUtil.create("button", "btn");
        btn.textContent = "📍 내 위치";
        btn.style.boxShadow = "0 1px 4px rgba(0,0,0,.3)";
        L.DomEvent.on(btn, "click", (e) => {
          L.DomEvent.stop(e);
          map.locate({ setView: true, maxZoom: 16 });
        });
        return btn;
      },
    });
    map.addControl(new Locate());
    let me;
    map.on("locationfound", (e) => {
      if (me) me.remove();
      me = L.circleMarker(e.latlng, { radius: 8, color: "#fff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1 }).addTo(map);
    });
    map.on("locationerror", () => alert("위치를 가져올 수 없어요. 위치 권한을 확인해 주세요."));
  }

  function pinIcon(label, color, home) {
    return L.divIcon({
      className: "",
      html: `<div class="pin ${home ? "home" : ""}" style="background:${color}"><span>${label}</span></div>`,
      iconSize: [28, 28],
      iconAnchor: home ? [14, 14] : [14, 28],
      popupAnchor: [0, -26],
    });
  }

  // 일차별로 마커 번호를 매김 (숙소는 🏠, 같은 장소는 한 번만)
  function buildDayStops(day) {
    const seen = new Map();
    let n = 0;
    dedupe(day.route).forEach((id) => {
      if (seen.has(id)) return;
      seen.set(id, HOME_IDS.has(id) ? "🏠" : String(++n));
    });
    return seen;
  }

  function renderMap() {
    const plan = PLANS[state.plan];
    const days = plan.days;

    $("#dayChips").innerHTML =
      `<button class="chip ${state.mapDay === "all" ? "active" : ""}" data-mapday="all">전체</button>` +
      days
        .map((d, i) => `<button class="chip ${String(state.mapDay) === String(i) ? "active" : ""}" data-mapday="${i}"><i style="background:${DAY_COLORS[i]}"></i>${esc(d.date)} ${esc(d.title.split(" · ")[0])}</button>`)
        .join("");
    const activeChip = $("#dayChips .chip.active");
    $("#dayChips").scrollLeft = activeChip.offsetLeft - 16;

    layer.clearLayers();
    const bounds = [];
    const markers = {};
    const indices = state.mapDay === "all" ? days.map((_, i) => i) : [Number(state.mapDay)];

    indices.forEach((i) => {
      const day = days[i];
      const color = DAY_COLORS[i];
      const route = dedupe(day.route);
      const latlngs = route.map((id) => [PLACES[id].lat, PLACES[id].lng]);
      L.polyline(latlngs, {
        color,
        weight: 4,
        opacity: 0.85,
        dashArray: day.mode === "driving" ? null : "8 8",
      }).addTo(layer);

      const labels = buildDayStops(day);
      labels.forEach((label, id) => {
        const p = PLACES[id];
        const home = HOME_IDS.has(id);
        if (state.mapDay === "all" && markers[id]) return;
        const m = L.marker([p.lat, p.lng], {
          icon: pinIcon(state.mapDay === "all" && !home ? "" : label, color, home),
          zIndexOffset: home ? 500 : 0,
        })
          .bindPopup(`<b>${esc(p.name)}</b><br><a href="${gmapSearch(p)}" target="_blank" rel="noopener">구글맵에서 보기 ↗</a>`)
          .addTo(layer);
        markers[id] = m;
        bounds.push([p.lat, p.lng]);
      });
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });

    // 하단 버튼
    if (state.mapDay === "all") {
      $("#mapActions").innerHTML = `<p class="hint" style="margin:0">일차를 선택하면 순서 번호와 구간별 길찾기가 나와요. 점선은 대중교통·도보, 실선은 차량 이동입니다.</p>`;
    } else {
      const day = days[state.mapDay];
      $("#mapActions").innerHTML = `
        <a class="btn solid" href="${gmapDay(day)}" target="_blank" rel="noopener">구글맵에서 하루 동선 열기 ↗</a>`;
    }

    // 장소 목록
    const listHtml = indices
      .map((i) => {
        const day = days[i];
        const color = DAY_COLORS[i];
        const route = dedupe(day.route);
        const labels = buildDayStops(day);
        const mode = day.mode === "driving" ? "driving" : "transit";
        const rows = route
          .map((id, k) => {
            const p = PLACES[id];
            const label = labels.get(id);
            const prev = k > 0 ? PLACES[route[k - 1]] : null;
            const link = prev
              ? `<a href="${gmapDir(prev, p, mode)}" target="_blank" rel="noopener">${mode === "driving" ? "🚗" : "🚃"} 길찾기</a>`
              : `<a href="${gmapSearch(p)}" target="_blank" rel="noopener">출발 ↗</a>`;
            return `
              <li>
                <span class="num" style="background:${HOME_IDS.has(id) ? "#2b2420" : color}">${label}</span>
                <span class="name" data-focus="${id}">${esc(p.name)}${prev ? `<small>${esc(prev.name)}에서</small>` : ""}</span>
                ${link}
              </li>`;
          })
          .join("");
        return (indices.length > 1 ? `<li class="day-sep">${i + 1}일차 · ${esc(day.date)} ${esc(day.title)}</li>` : "") + rows;
      })
      .join("");
    $("#stopList").innerHTML = listHtml;
    $("#stopList").onclick = (e) => {
      const id = e.target.closest("[data-focus]")?.dataset.focus;
      if (!id || !markers[id]) return;
      map.setView(markers[id].getLatLng(), 15);
      markers[id].openPopup();
      $("#map").scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }

  /* ---------- 준비 탭 ---------- */
  function renderInfo() {
    const checked = JSON.parse(localStorage.getItem("checklist") || "{}");
    $("#info").innerHTML = `
      <div class="card info">
        <h3>✈️ 항공편</h3>
        ${TRIP.flights
          .map((f) => `
            <div class="flight">
              <div><small>${f.label} · ${f.no}</small><b>${esc(f.from)} → ${esc(f.to)}</b></div>
              <div style="text-align:right"><small>${esc(f.dep)}</small><b>도착 ${esc(f.arr)}</b></div>
            </div>`)
          .join("")}
      </div>

      <div class="card info">
        <h3>🏨 숙소</h3>
        ${TRIP.hotels
          .map((h) => `
            <div class="hotel">
              <b>${esc(h.name)}</b>
              <p>${esc(h.period)} · ${esc(h.note)}</p>
              <div class="taxi"><small>택시 기사님께 보여주세요</small>${esc(h.address)}</div>
              <a class="btn" href="${gmapSearch(PLACES[h.place])}" target="_blank" rel="noopener">구글맵에서 보기 ↗</a>
            </div>`)
          .join("")}
      </div>

      <div class="card info">
        <h3>💡 알아두면 좋은 것</h3>
        <dl class="tips">${TIPS.map((t) => `<dt>${esc(t.title)}</dt><dd>${esc(t.text)}</dd>`).join("")}</dl>
      </div>

      <div class="card info checklist">
        <h3>✅ 준비 체크리스트 <small id="checkCount" style="color:var(--muted);font-weight:500;font-size:13px"></small></h3>
        <div class="progress"><div id="checkBar"></div></div>
        ${CHECKLIST.map((c, i) => `<label><input type="checkbox" data-check="${i}" ${checked[i] ? "checked" : ""}><span>${esc(c)}</span></label>`).join("")}
        <p class="hint">체크 표시는 각자 휴대폰에만 저장돼요.</p>
      </div>`;
    updateProgress();
  }

  function updateProgress() {
    const done = document.querySelectorAll("[data-check]:checked").length;
    $("#checkCount").textContent = `${done} / ${CHECKLIST.length}`;
    $("#checkBar").style.width = `${(done / CHECKLIST.length) * 100}%`;
  }

  /* ---------- 맛집 탭 ---------- */
  const foodLink = (o) => (o.cid ? `https://maps.google.com/?cid=${o.cid}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.q)}`);
  const loadPicks = () => JSON.parse(localStorage.getItem("foodPicks") || "{}");
  const priceText = (p) => `1인 ${yen(p[0])}~${p[1].toLocaleString("ko-KR")} (약 ${manwon(p[0]).replace("만원", "")}~${manwon(p[1])})`;

  function renderFood() {
    const picks = loadPicks();
    const done = FOOD.matches.filter((m) => picks[m.id] !== undefined).length;
    const matches = FOOD.matches
      .map((m) => {
        const picked = picks[m.id];
        const opts = m.options
          .map((o, k) => `
            <button class="opt ${picked === k ? "picked" : ""} ${picked !== undefined && picked !== k ? "dim" : ""}" data-pick="${m.id}:${k}">
              <span class="opt-letter">${k ? "B" : "A"}</span>
              <b>${esc(o.name)}</b>
              ${o.price ? `<span class="opt-price">${priceText(o.price)}</span>` : ""}
              <span class="opt-desc">${esc(o.desc)}</span>
              ${o.extra ? `<span class="opt-tag">추천 추가</span>` : ""}
            </button>`)
          .join(`<span class="vs">VS</span>`);
        return `
          <article class="card match reveal">
            <div class="match-head"><small>${esc(m.when)}</small><b>${esc(m.title)}</b>${picked !== undefined ? `<i>✔ 골랐어요</i>` : ""}</div>
            ${m.note ? `<p class="match-note">${esc(m.note)}</p>` : ""}
            <div class="opts">${opts}</div>
            <div class="opt-links">${m.options.map((o, k) => `<a href="${foodLink(o)}" target="_blank" rel="noopener">${k ? "B" : "A"} 구글맵 ↗</a>`).join("")}</div>
          </article>`;
      })
      .join("");

    $("#food").innerHTML = `
      <div class="card food-intro">
        <h2>🍜 맛집 고르기</h2>
        <p>둘 중 먹고 싶은 쪽을 누르세요. 다 고르면 아래 버튼으로 결과를 카톡에 보내주세요.</p>
        <label class="food-name">고르는 사람 <input id="foodName" placeholder="예: 엄마" value="${esc(localStorage.getItem("foodName") || "")}"></label>
        <div class="progress"><div style="width:${(done / FOOD.matches.length) * 100}%"></div></div>
        <small class="hint">${done} / ${FOOD.matches.length} 선택</small>
      </div>
      ${matches}
      <div class="food-actions">
        <button class="btn solid" id="foodShare">📤 결과 보내기</button>
        <button class="btn" id="foodReset">다시 고르기</button>
      </div>
      <div class="card info">
        <h3>📌 그 외 저장한 곳</h3>
        <ul class="extras">${FOOD.extras.map((x) => `<li><a href="${foodLink(x)}" target="_blank" rel="noopener">${esc(x.name)} ↗</a><span>${esc(x.desc)}</span></li>`).join("")}</ul>
      </div>`;
    observeReveal();
  }

  async function shareFood() {
    const picks = loadPicks();
    const who = localStorage.getItem("foodName") || "익명";
    const lines = FOOD.matches.map((m) => `· ${m.when} ${m.title}: ${picks[m.id] !== undefined ? m.options[picks[m.id]].name : "(안 고름)"}`);
    const text = `🍁 삿포로 맛집 투표 — ${who}\n${lines.join("\n")}`;
    if (navigator.share) {
      try { await navigator.share({ title: "삿포로 맛집 투표", text }); } catch (_) { /* 취소 */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("결과를 복사했어요. 카톡에 붙여넣기 하세요!");
    } catch (_) {
      prompt("아래 내용을 복사하세요", text);
    }
  }

  /* ---------- 탭 ---------- */
  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${tab}`));
    $("#planSwitch").classList.toggle("hidden", SINGLE_PLAN || tab !== "schedule");
    if (tab === "food") renderFood();
    if (tab === "map") {
      if (!map) initMap();
      map.invalidateSize();
      renderMap();
    }
    window.scrollTo({ top: 0 });
  }

  /* ---------- 이벤트 ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab],[data-plan],[data-toggle],[data-goto-map],[data-mapday],[data-pick],#shareBtn,#foodShare,#foodReset");
    if (!t) return;
    if (t.dataset.pick) {
      const [id, k] = t.dataset.pick.split(":");
      const picks = loadPicks();
      if (picks[id] === Number(k)) delete picks[id];
      else picks[id] = Number(k);
      localStorage.setItem("foodPicks", JSON.stringify(picks));
      const y = window.scrollY;
      renderFood();
      document.querySelectorAll("#food .reveal").forEach((el) => el.classList.add("shown"));
      window.scrollTo({ top: y });
    } else if (t.id === "foodShare") shareFood();
    else if (t.id === "foodReset") {
      if (!confirm("고른 내용을 모두 지울까요?")) return;
      localStorage.removeItem("foodPicks");
      renderFood();
    } else if (t.dataset.tab) setTab(t.dataset.tab);
    else if (t.dataset.plan) setPlan(t.dataset.plan);
    else if (t.dataset.toggle !== undefined) t.closest(".day").classList.toggle("open");
    else if (t.dataset.gotoMap !== undefined) {
      state.mapDay = Number(t.dataset.gotoMap);
      setTab("map");
    } else if (t.dataset.mapday !== undefined) {
      state.mapDay = t.dataset.mapday === "all" ? "all" : Number(t.dataset.mapday);
      renderMap();
    } else if (t.id === "shareBtn") share();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "foodName") localStorage.setItem("foodName", e.target.value.trim());
  });

  document.addEventListener("change", (e) => {
    if (e.target.dataset.check === undefined) return;
    const checked = JSON.parse(localStorage.getItem("checklist") || "{}");
    checked[e.target.dataset.check] = e.target.checked;
    localStorage.setItem("checklist", JSON.stringify(checked));
    updateProgress();
  });

  initLeaves();
  renderDday();
  renderPlanSwitch();
  $("#planSwitch").classList.toggle("hidden", SINGLE_PLAN);
  renderSchedule();
  renderInfo();
  if (location.hash === "#food") setTab("food");
})();
