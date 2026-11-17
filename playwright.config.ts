import fs from 'fs';
import { defineConfig } from '@playwright/test';

const preinstalledChromium = '/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(preinstalledChromium) ? preinstalledChromium : undefined);

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
});
