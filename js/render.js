export function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function createElement(tag, { text, html, ...attrs } = {}) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (html) el.innerHTML = html;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

export function renderArticleCard(article) {
  const card = createElement("article");
  const heading = createElement("h2");
  const link = createElement("a", {
    text: article.title,
    href: `article.html?slug=${encodeURIComponent(article.slug)}`,
  });
  heading.appendChild(link);
  card.appendChild(heading);
  card.appendChild(createElement("p", { text: article.summary }));
  card.appendChild(
    createElement("p", {
      html: `<small>${article.section} · ${article.publishedAt}</small>`,
    })
  );
  return card;
}
