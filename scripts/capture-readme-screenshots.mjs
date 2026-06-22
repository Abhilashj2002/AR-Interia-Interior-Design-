import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.README_SCREENSHOT_BASE_URL || 'http://127.0.0.1:5500';
const API_URL = process.env.README_SCREENSHOT_API_URL || 'http://localhost:5175/api';
const OUT_DIR = path.resolve('screenshots');

const shots = [
  ['/', '01-home-hero.png'],
  ['/gallery', '02-gallery.png'],
  ['/services', '03-services.png'],
  ['/portfolio', '04-portfolio.png'],
  ['/admin', '05-admin-dashboard.png', 'admin'],
  ['/services', '06-category.png', 'category'],
  ['/', '07-chatbot.png', 'chatbot'],
  ['/dashboard', '08-customer-user.png', 'customer'],
  ['/admin', '09-invoice.png', 'admin-invoice'],
];

async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (data?.twoFactorRequired && data?.challengeId && data?.debugCode) {
    const verifyResponse = await fetch(`${API_URL}/auth/login/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId: data.challengeId, code: data.debugCode }),
    });
    if (!verifyResponse.ok) return null;
    const verified = await verifyResponse.json();
    if (!verified?.token || !verified?.customer) return null;
    return {
      ...verified.customer,
      token: verified.token,
    };
  }

  if (!data?.token || !data?.customer) return null;
  return {
    ...data.customer,
    token: data.token,
  };
}

async function setCurrentUser(page, user) {
  if (!user) return;
  await page.addInitScript((currentUser) => {
    localStorage.setItem('ar_interia_users_current', JSON.stringify(currentUser));
    if (currentUser?.token) {
      localStorage.setItem('ar_interia_token', currentUser.token);
    }
  }, user);
}

async function ready(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function openChatbot(page) {
  const bubble = page.locator('#aria-chat-bubble');
  if (await bubble.count()) {
    try {
      await bubble.click({ timeout: 2000 });
      await page.waitForSelector('#aria-chat-panel', { state: 'visible', timeout: 4000 });
      await page.waitForTimeout(500);
    } catch {
      // Keep going; the panel may already be open or the app may need a retry.
    }
  }

  const input = page.locator('#aria-chat-input');
  const sendButton = page.locator('#aria-send-btn');
  if (await input.count() && await sendButton.count()) {
    try {
      await input.fill('Show me a modern living room concept.');
      await sendButton.click({ timeout: 2000 });
      await page.waitForTimeout(1800);
    } catch {
      // If sending fails, keep the open panel for the screenshot.
    }
  }
}

async function openCategory(page) {
  const candidates = [
    'text=Kitchen',
    'text=Living',
    'text=Bedroom',
    '[data-category]',
  ];

  for (const selector of candidates) {
    const item = page.locator(selector).first();
    if (await item.count()) {
      try {
        await item.click({ timeout: 1500 });
        await page.waitForTimeout(1500);
        return;
      } catch {
        // Keep the services page screenshot if no category card opens.
      }
    }
  }
}

async function openInvoiceArea(page) {
  const createSampleButton = page.locator('[data-action="create-sample-invoice"]');
  if (await createSampleButton.count()) {
    try {
      await createSampleButton.click({ timeout: 2000 });
      await page.waitForTimeout(1800);
    } catch {
      // Keep going; the screenshot can still fall back to the invoice section.
    }
  }

  const loadButton = page.locator('[data-action="customer-load-invoices"]');
  if (await loadButton.count()) {
    try {
      await loadButton.click({ timeout: 2000 });
      await page.waitForTimeout(1800);
    } catch {
      // Keep the dashboard visible if invoice loading fails.
    }
  }

  const invoiceList = page.locator('#recent-invoices');
  if (await invoiceList.count()) {
    try {
      await page.waitForFunction(() => {
        const node = document.getElementById('recent-invoices');
        const text = node?.textContent || '';
        return text.trim().length > 0 && !text.includes('No invoices loaded yet');
      }, { timeout: 4000 });
    } catch {
      // Some environments do not have invoice data; still capture the section itself.
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });

const adminUser = await login('admin@gmail.com', 'Admin@1234');
const customerUser = await login('demo@example.com', 'Demo@1234')
  || await login('customer@example.com', 'Customer@1234')
  || await login('rahul.sharma@email.com', 'customer123')
  || await login('priya.patel@email.com', 'customer123')
  || {
    id: 'cust-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    username: 'rahul.sharma',
    role: 'customer',
    phone: '+91 98765 10001',
  };

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});

for (const [route, fileName, mode] of shots) {
  const page = await context.newPage();

  if (mode === 'admin' || mode === 'admin-invoice') await setCurrentUser(page, adminUser);
  if (mode === 'customer') await setCurrentUser(page, customerUser);

  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  await ready(page);

  if (mode === 'chatbot') await openChatbot(page);
  if (mode === 'category') await openCategory(page);
  if (mode === 'invoice') await openInvoiceArea(page);

  if (mode === 'chatbot') {
    const panel = page.locator('#aria-chat-panel');
    if (await panel.count()) {
      await panel.screenshot({ path: path.join(OUT_DIR, fileName) });
    } else {
      await page.screenshot({ path: path.join(OUT_DIR, fileName), fullPage: false });
    }
  } else if (mode === 'admin-invoice') {
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find((el) =>
        (el.textContent || '').includes('Invoices & Receipts')
      );
      heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUT_DIR, fileName),
      fullPage: false,
    });
  } else {
    await page.screenshot({
      path: path.join(OUT_DIR, fileName),
      fullPage: false,
    });
  }
  await page.close();
}

await browser.close();
console.log(`Captured ${shots.length} README screenshots in ${OUT_DIR}`);
