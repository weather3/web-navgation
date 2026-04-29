const sites = window.SITES_DATA || [];
const stats = window.SITE_STATS || { totalSites: 0, primaryCategories: 0, allTags: [] };

const gallery = document.querySelector("#gallery");
const discoveryDriftLayer = document.querySelector("#discovery-drift-layer");
const tagFilters = document.querySelector("#tag-filters");
const resultSummary = document.querySelector("#result-summary");
const wallTitle = document.querySelector("#wall-title");
const searchInput = document.querySelector("#search-input");
const clearFilterButton = document.querySelector("#clear-filter");
const randomTitle = document.querySelector("#random-title");
const randomDescription = document.querySelector("#random-description");
const randomTags = document.querySelector("#random-tags");
const randomUrl = document.querySelector("#random-url");
const randomLink = document.querySelector("#random-link");
const recommendIcon = document.querySelector(".recommend-icon");
const refreshRandomButton = document.querySelector("#refresh-random");
const recommendBadge = document.querySelector("#recommend-badge");

const selectedTags = new Set();
let searchTerm = "";
let hasRandomized = false;
let driftTimer = null;

const tagOrder = stats.allTags || [];
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelector("#total-sites").textContent = stats.totalSites;
document.querySelector("#total-groups").textContent = tagOrder.length;

const categoryTheme = {
  工具: "theme-tool",
  生活: "theme-life",
  实用: "theme-practical",
  艺术: "theme-art",
};

function normalize(text) {
  return String(text || "").toLowerCase();
}

function matchesSite(site) {
  const haystack = normalize(
    [site.title, site.description, site.url, site.originalCategory, site.tags.join(" ")].join(" "),
  );
  const searchMatched = !searchTerm || haystack.includes(searchTerm);
  const tagMatched = [...selectedTags].every((tag) => site.tags.includes(tag));
  return searchMatched && tagMatched;
}

function buildTagFilters() {
  tagFilters.innerHTML = "";
  tagOrder.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = tag;
    button.addEventListener("click", () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
      } else {
        selectedTags.add(tag);
      }
      render();
    });
    if (selectedTags.has(tag)) button.classList.add("is-active");
    tagFilters.appendChild(button);
  });
}

function setRandomSite(site) {
  if (!site) return;
  randomTitle.textContent = site.title;
  randomDescription.textContent = site.description || "这是一个等你点开的有趣网站。";
  randomUrl.textContent = new URL(site.url).hostname;
  randomLink.href = site.url;
  randomTags.innerHTML = site.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  recommendBadge.textContent = hasRandomized ? "随机推荐" : "今日推荐";
}

function renderCards(items) {
  return items
    .map(
      (site) => `
        <a class="site-card" href="${site.url}" target="_blank" rel="noreferrer">
          <div class="site-meta">
            <span>#${String(site.id).padStart(3, "0")}</span>
          </div>
          <h3>${site.title}</h3>
          <p class="site-desc">${site.description || "暂无简介"}</p>
          <div class="site-url">${new URL(site.url).hostname}</div>
        </a>`,
    )
    .join("");
}

function pickRandomSite() {
  const index = Math.floor(Math.random() * sites.length);
  setRandomSite(sites[index]);
}

function getSiteHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
}

function createDiscoveryCard(site) {
  const card = document.createElement("a");
  const entryOptions = ["left", "right", "bottom"];
  const entry = window.matchMedia("(max-width: 640px)").matches
    ? "mobile"
    : entryOptions[Math.floor(Math.random() * entryOptions.length)];

  card.className = "discovery-card";
  card.href = site.url;
  card.target = "_blank";
  card.rel = "noreferrer";
  card.dataset.entry = entry;
  card.style.setProperty("--duration", `${7 + Math.random() * 3}s`);
  card.style.setProperty("--tilt", `${Math.random() * 4 - 2}deg`);
  card.style.setProperty("--top", `${48 + Math.random() * 32}vh`);
  card.style.setProperty("--left", `${12 + Math.random() * 64}vw`);
  card.setAttribute("aria-label", `打开 ${site.title}`);

  const kicker = document.createElement("div");
  kicker.className = "discovery-kicker";

  const label = document.createElement("span");
  label.textContent = "漂流索引";

  const number = document.createElement("span");
  number.className = "discovery-number";
  number.textContent = `#${String(site.id).padStart(3, "0")}`;

  const title = document.createElement("strong");
  title.className = "discovery-title";
  title.textContent = site.title;

  const description = document.createElement("p");
  description.className = "discovery-description";
  description.textContent = site.description || getSiteHost(site.url);

  kicker.append(label, number);
  card.append(kicker, title, description);
  card.addEventListener("animationend", () => card.remove());

  return card;
}

function spawnDiscoveryCard() {
  if (!discoveryDriftLayer || !sites.length || reducedMotionQuery.matches || document.hidden) return;

  const activeCards = discoveryDriftLayer.querySelectorAll(".discovery-card");
  const maxCards = window.matchMedia("(max-width: 640px)").matches ? 1 : 3;
  if (activeCards.length >= maxCards) return;

  const site = sites[Math.floor(Math.random() * sites.length)];
  discoveryDriftLayer.appendChild(createDiscoveryCard(site));
}

function initDiscoveryDrift() {
  if (!discoveryDriftLayer || !sites.length || reducedMotionQuery.matches) return;

  window.setTimeout(spawnDiscoveryCard, 1800);
  driftTimer = window.setInterval(spawnDiscoveryCard, 5200);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && driftTimer) {
      window.clearInterval(driftTimer);
      driftTimer = null;
      return;
    }

    if (!document.hidden && !driftTimer && !reducedMotionQuery.matches) {
      driftTimer = window.setInterval(spawnDiscoveryCard, 5200);
    }
  });
}

function render() {
  buildTagFilters();

  if (!selectedTags.size) {
    wallTitle.textContent = "未选择标签";
    resultSummary.textContent = "先选择一个或多个标签，再开始浏览网站。";
    gallery.innerHTML = `<section class="category-section"><p class="empty-state">还没有选择标签，因此这里不会展示网站。先点一个感兴趣的标签吧。</p></section>`;
    return;
  }

  const filtered = sites.filter(matchesSite);
  wallTitle.textContent = [...selectedTags].join(" / ");
  if (!filtered.length) {
    resultSummary.textContent = `已选择 ${selectedTags.size} 个标签，但没有匹配到网站。`;
    gallery.innerHTML = `<section class="category-section"><p class="empty-state">这些标签组合暂时没有结果。试试减少标签，或换个关键词。</p></section>`;
    return;
  }

  const activeThemes = [...selectedTags].map((tag) => categoryTheme[tag]).filter(Boolean);
  const themeClass = activeThemes[0] || "";
  resultSummary.textContent = `已选择 ${selectedTags.size} 个标签，当前找到 ${filtered.length} 个网站。`;

  gallery.innerHTML = `
    <section class="category-section ${themeClass}">
      <div class="site-grid">
        ${renderCards(filtered)}
      </div>
    </section>
  `;
}

searchInput.addEventListener("input", (event) => {
  searchTerm = normalize(event.target.value.trim());
  render();
});

clearFilterButton.addEventListener("click", () => {
  selectedTags.clear();
  searchTerm = "";
  searchInput.value = "";
  render();
});

refreshRandomButton.addEventListener("click", () => {
  hasRandomized = true;
  pickRandomSite();
});

function initCompassPointerTracking() {
  if (!recommendIcon || !window.matchMedia("(pointer: fine)").matches) return;

  window.addEventListener(
    "pointermove",
    (event) => {
      const rect = recommendIcon.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
      recommendIcon.style.setProperty("--compass-angle", `${angle - 45}deg`);
    },
    { passive: true },
  );
}

initCompassPointerTracking();
initDiscoveryDrift();
pickRandomSite();
render();
