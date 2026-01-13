import { apiFetch } from "../api.js";

export function initSubscribe() {
  const button = document.getElementById("subscribe-cta");
  const status = document.getElementById("subscribe-status");
  if (!button) return;

  button.addEventListener("click", async () => {
    if (status) status.textContent = "Redirecting to checkout…";
    button.disabled = true;
    try {
      const response = await apiFetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "monthly" }),
      });
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      throw new Error("Missing checkout url");
    } catch (error) {
      if (status) {
        status.textContent = "Checkout is unavailable. Please try again later.";
      }
      button.disabled = false;
    }
  });
}
