import { apiFetch } from "../api.js";
import { config } from "../config.js";

const queue = [];
let heartbeatId = null;
let lastArticleId = null;

export function initTracker({ article, event = "view" }) {
  if (!article?.id) return;
  if (event === "view" && lastArticleId === article.id) return;

  lastArticleId = article.id;
  track(event, article);

  if (event === "view") {
    startHeartbeat(article);
    bindFlush();
  }
}

export function track(event, article, data = {}) {
  if (Math.random() > config.analyticsSampleRate) return;

  queue.push({
    event,
    articleId: article.id,
    slug: article.slug,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

function startHeartbeat(article) {
  stopHeartbeat();
  heartbeatId = window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    track("heartbeat", article);
    flush();
  }, config.analytics.heartbeatIntervalMs);
}

function stopHeartbeat() {
  if (heartbeatId) {
    clearInterval(heartbeatId);
    heartbeatId = null;
  }
}

async function flush() {
  if (!queue.length) return;
  const payload = queue.splice(0, queue.length);

  const body = JSON.stringify({ events: payload });
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const ok = navigator.sendBeacon("/api/events", blob);
    if (!ok) {
      await apiFetch("/api/events", {
        method: "POST",
        body,
      });
    }
    return;
  }

  await apiFetch("/api/events", {
    method: "POST",
    body,
  });
}

function bindFlush() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
      stopHeartbeat();
    }
  });
  window.addEventListener("beforeunload", () => {
    flush();
    stopHeartbeat();
  });
}
