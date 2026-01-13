const DEFAULT_READING_SPEED = 200;

export function initScrollTracking({ wordCount = 400, onComplete }) {
  const minActiveTimeMs = Math.ceil((wordCount / DEFAULT_READING_SPEED) * 60 * 1000);
  let activeTimeMs = 0;
  let lastTick = Date.now();
  let completed = false;

  const tick = () => {
    const now = Date.now();
    if (document.visibilityState === "visible") {
      activeTimeMs += now - lastTick;
    }
    lastTick = now;
  };

  const interval = window.setInterval(tick, 1000);

  const onScroll = () => {
    if (completed) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progress >= 0.9 && activeTimeMs >= minActiveTimeMs) {
      completed = true;
      if (onComplete) onComplete();
      cleanup();
    }
  };

  const onVisibility = () => {
    lastTick = Date.now();
  };

  const cleanup = () => {
    window.clearInterval(interval);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  return cleanup;
}
