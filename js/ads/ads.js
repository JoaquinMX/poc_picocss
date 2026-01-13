import { config } from "../config.js";

export function initAds({ context, entitlements } = {}) {
  if (!config.ads.enabled) return;
  const isSubscriber = Boolean(entitlements?.level === "subscriber");
  if (isSubscriber) {
    suppressAds();
    return;
  }

  const slots = document.querySelectorAll("[data-ad-slot]");
  slots.forEach((slot) => {
    slot.textContent = `Ad slot: ${slot.dataset.adSlot} (${context || "general"})`;
  });
}

function suppressAds() {
  const slots = document.querySelectorAll("[data-ad-slot]");
  slots.forEach((slot) => {
    slot.textContent = "Ad-free for subscribers.";
  });
}
