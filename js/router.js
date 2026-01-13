import { initHome } from "./pages/home.js";
import { initArticle } from "./pages/article.js";
import { initSubscribe } from "./pages/subscribe.js";

const routes = {
  home: initHome,
  article: initArticle,
  subscribe: initSubscribe,
};

export function initRouter() {
  const page = document.body.dataset.page;
  if (!page || !routes[page]) return;
  routes[page]();
}
