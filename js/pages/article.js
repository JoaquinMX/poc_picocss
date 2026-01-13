import { apiFetch } from "../api.js";
import { clearChildren, createElement, renderArticleCard } from "../render.js";
import { initTracker } from "../analytics/tracker.js";
import { initScrollTracking } from "../analytics/scroll.js";
import { initAds } from "../ads/ads.js";
import { getEntitlements, applyPaywall } from "../auth/entitlements.js";

export async function initArticle() {
  const slug = new URLSearchParams(window.location.search).get("slug") || "demo-article";
  const contentEl = document.getElementById("article-content");
  const relatedEl = document.getElementById("related-stories");
  const paywallEl = document.getElementById("article-paywall");

  try {
    const data = await apiFetch(`/api/articles/${slug}`);
    renderArticle(data);

    const entitlements = await getEntitlements();
    applyPaywall({
      article: data,
      entitlements,
      contentEl,
      paywallEl,
    });

    initTracker({
      article: data,
    });

    initScrollTracking({
      wordCount: data.wordCount || 400,
      onComplete: () => {
        initTracker({
          article: data,
          event: "complete",
        });
      },
    });

    renderRelated(relatedEl, data.related || []);
    initAds({ context: "article", entitlements });
  } catch (error) {
    if (contentEl) {
      contentEl.textContent = "Unable to load this story.";
    }
  }
}

function renderArticle(article) {
  const titleEl = document.getElementById("article-title");
  const deckEl = document.getElementById("article-deck");
  const authorEl = document.getElementById("article-author");
  const dateEl = document.getElementById("article-date");
  const kickerEl = document.getElementById("article-kicker");
  const captionEl = document.getElementById("article-caption");
  const tagsEl = document.getElementById("article-tags");
  const contentEl = document.getElementById("article-content");

  if (titleEl) titleEl.textContent = article.title;
  if (deckEl) deckEl.textContent = article.summary;
  if (authorEl) authorEl.textContent = `By ${article.author}`;
  if (dateEl) {
    dateEl.textContent = article.publishedAt;
    dateEl.setAttribute("datetime", article.publishedAt);
  }
  if (kickerEl) kickerEl.textContent = article.section;
  if (captionEl) captionEl.textContent = article.hero?.caption || "";

  if (tagsEl) {
    const tagParagraph = tagsEl.querySelector("p") || createElement("p");
    tagParagraph.textContent = (article.tags || []).join(", ") || "—";
    tagsEl.appendChild(tagParagraph);
  }

  if (contentEl) {
    clearChildren(contentEl);
    (article.content || []).forEach((paragraph) => {
      contentEl.appendChild(createElement("p", { text: paragraph }));
    });
  }
}

function renderRelated(container, related) {
  if (!container) return;
  clearChildren(container);
  if (!related.length) {
    container.textContent = "No related stories yet.";
    return;
  }
  related.forEach((article) => {
    container.appendChild(renderArticleCard(article));
  });
}
