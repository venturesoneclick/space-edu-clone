import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`BROWSER ERROR: ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.error(`NETWORK ERROR: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log("Navigating to http://localhost:5176...");
  try {
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle' });
    console.log("Navigation finished.");
    
    // Wait a couple seconds to catch any delayed errors
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error("Failed to load page:", e);
  }

  await browser.close();
})();
