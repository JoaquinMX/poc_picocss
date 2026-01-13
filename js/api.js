import { config } from "./config.js";

const defaultHeaders = {
  "Content-Type": "application/json",
};

export async function apiFetch(path, { retries = 2, ...options } = {}) {
  const url = `${config.apiBaseUrl}${path}`;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      attempt += 1;
      if (attempt > retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }

  return null;
}
