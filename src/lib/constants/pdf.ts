/**
 * Loopback host Puppeteer uses to reach this same server's `/print` page.
 * Never the public URL: the server may not be reachable through its own
 * domain from inside the container, and the export token must not leave it.
 */
export const PDF_RENDER_LOOPBACK_HOST = "127.0.0.1";

/** Upper bound for loading `/print` in headless Chromium before giving up. */
export const PDF_RENDER_TIMEOUT_MS = 30_000;

/**
 * Chromium flags for running inside a container as a non-root user:
 * no sandbox (no user namespaces), and /tmp instead of the tiny /dev/shm.
 */
export const PDF_CHROMIUM_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];
