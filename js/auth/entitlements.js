import { apiFetch } from "../api.js";
import { getCache, setCache } from "../state.js";

const METER_KEY = "pico_news_meter";

export async function getEntitlements() {
  const cached = getCache("entitlements");
  if (cached) return cached;

  try {
    const data = await apiFetch("/api/entitlements");
    setCache("entitlements", data, 300000);
    return data;
  } catch (error) {
    const fallback = { level: "guest" };
    setCache("entitlements", fallback, 60000);
    return fallback;
  }
}

export function applyPaywall({ article, entitlements, contentEl, paywallEl }) {
  if (!article) return;
  const access = article.access || "free";
  const isSubscriber = entitlements?.level === "subscriber";

  if (access === "free" || isSubscriber) {
    updatePaywall(paywallEl, "Full access granted.");
    return;
  }

  if (access === "metered") {
    const reads = incrementMeter();
    if (reads <= (article.freeReads || 3)) {
      updatePaywall(paywallEl, `Metered access: ${reads} of ${article.freeReads || 3} free reads.`);
      return;
    }
    showTeaser(contentEl);
    updatePaywall(paywallEl, "Your free reads are used up. Subscribe to continue.");
    return;
  }

  if (access === "subscriber_only") {
    showTeaser(contentEl);
    updatePaywall(paywallEl, "Subscribers only. Unlock the full story.");
  }
}

function incrementMeter() {
  const stored = Number(localStorage.getItem(METER_KEY) || 0) + 1;
  localStorage.setItem(METER_KEY, stored);
  return stored;
}

function showTeaser(contentEl) {
  if (!contentEl) return;
  const paragraphs = contentEl.querySelectorAll("p");
  paragraphs.forEach((paragraph, index) => {
    if (index > 1) {
      paragraph.style.display = "none";
    }
  });
}

function updatePaywall(paywallEl, message) {
  if (!paywallEl) return;
  const text = paywallEl.querySelector("p") || document.createElement("p");
  text.textContent = message;
  paywallEl.appendChild(text);

  const link = document.createElement("a");
  link.href = "subscribe.html";
  link.textContent = "Subscribe now";
  paywallEl.appendChild(link);
}
