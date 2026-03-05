const puppeteer = require("puppeteer");

async function launchBrowser() {
  return puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
}

module.exports = { launchBrowser };