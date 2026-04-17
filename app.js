const sites = window.SITES_DATA || [];
const stats = window.SITE_STATS || { totalSites: 0, primaryCategories: 0, allTags: [] };

const gallery = document.querySelector("#gallery");
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
const refreshRandomButton = document.querySelector("#refresh-random");
const recommendBadge = document.querySelector("#recommend-badge");

const selectedTags = new Set();
let searchTerm = "";
let hasRandomized = false;

const tagOrder = stats.allTags || [];

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
  randomDescription.textContent = site.description || "这是一个等待你点开的有趣网站。";
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

function render() {
  buildTagFilters();

  if (!selectedTags.size) {
    wallTitle.textContent = "未选择标签";
    resultSummary.textContent = "先选择一个或多个标签，再开始浏览网站。";
    gallery.innerHTML = `<section class="category-section"><p class="empty-state">还没有选择标签，因此这里不会默认展示全部网站。先点一个感兴趣的标签吧。</p></section>`;
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

pickRandomSite();
render();
