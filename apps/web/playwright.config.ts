import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", workers: 1, retries: 0, timeout: 60000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3000", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    { command: "npm run start -w @pokecard/api", cwd: "../..", url: "http://127.0.0.1:3001/api/health", reuseExistingServer: false, timeout: 60000 },
    { command: "npm run start -w @pokecard/web", cwd: "../..", url: "http://localhost:3000", reuseExistingServer: false, timeout: 60000 },
  ],
});
