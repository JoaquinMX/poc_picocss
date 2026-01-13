import { apiFetch } from "../api.js";
import { clearChildren, renderArticleCard } from "../render.js";
import { setCache, getCache } from "../state.js";
import { initAds } from "../ads/ads.js";

export async function initHome() {
  const listEl = document.getElementById("article-list");
  if (!listEl) return;

  const cached = getCache("home-feed");
  if (cached) {
    renderFeed(listEl, cached);
  }

  try {
    const data = await apiFetch("/api/articles");
    const feed = data?.items || [];
    setCache("home-feed", feed, 300000);
    renderFeed(listEl, feed);
  } catch (error) {
    listEl.textContent = "Unable to load articles right now.";
  }

  initAds({ context: "home" });
}

function renderFeed(listEl, feed) {
  clearChildren(listEl);
  if (!feed.length) {
    listEl.textContent = "No stories yet.";
    return;
  }

  feed.forEach((article) => {
    listEl.appendChild(renderArticleCard(article));
  });
}
