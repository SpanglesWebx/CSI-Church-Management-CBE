const puppeteer = require("puppeteer");

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: "new",   // ⭐ Fix headless warning
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
  });

  return browser;
}

module.exports = { launchBrowser };