import fs from "node:fs";

const raw = fs.readFileSync("source.json", "utf8").replace(/^\uFEFF/, "");
const source = JSON.parse(raw);

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[#a-zA-Z0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const items = source
  .map((entry) => {
    const tags = String(entry.kind_name || "")
      .split("&")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      id: entry.id,
      title: stripHtml(entry.title) || "未命名站点",
      url: entry.href,
      description: stripHtml(entry.slogan),
      originalCategory: entry.kind_name,
      primaryTag: tags[0] || "未分类",
      tags,
    };
  })
  .sort((a, b) => {
    const groupCompare = a.primaryTag.localeCompare(b.primaryTag, "zh-CN");
    if (groupCompare !== 0) return groupCompare;
    return a.title.localeCompare(b.title, "zh-CN");
  });

const stats = {
  totalSites: items.length,
  primaryCategories: [...new Set(items.map((item) => item.primaryTag))].length,
  allTags: [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  ),
};

const output = `window.SITES_DATA = ${JSON.stringify(items, null, 2)};\nwindow.SITE_STATS = ${JSON.stringify(
  stats,
  null,
  2,
)};\n`;

fs.writeFileSync("sites-data.js", output, "utf8");

console.log(`Generated ${items.length} items across ${stats.primaryCategories} primary categories.`);
