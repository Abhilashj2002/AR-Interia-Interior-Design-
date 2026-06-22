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
  ['/dashboard', '09-invoice.png', 'invoice'],
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
  }, user);
}

async function ready(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function openChatbot(page) {
  const selectors = [
    '[aria-label*="chat" i]',
    'button:has-text("Chat")',
    'button:has-text("AI")',
    '.chatbot button',
  ];

  for (const selector of selectors) {
    const button = page.locator(selector).first();
    if (await button.count()) {
      try {
        await button.click({ timeout: 1500 });
        await page.waitForTimeout(1200);
        return;
      } catch {
        // Try the next likely control.
      }
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
  const candidates = [
    'text=Invoice',
    'text=Invoices',
    'text=Payments',
  ];

  for (const selector of candidates) {
    const item = page.locator(selector).first();
    if (await item.count()) {
      try {
        await item.click({ timeout: 1500 });
        await page.waitForTimeout(1200);
        return;
      } catch {
        // Keep dashboard visible if invoice controls are absent.
      }
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

  if (mode === 'admin') await setCurrentUser(page, adminUser);
  if (mode === 'customer' || mode === 'invoice') await setCurrentUser(page, customerUser);

  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  await ready(page);

  if (mode === 'chatbot') await openChatbot(page);
  if (mode === 'category') await openCategory(page);
  if (mode === 'invoice') await openInvoiceArea(page);

  await page.screenshot({
    path: path.join(OUT_DIR, fileName),
    fullPage: false,
  });
  await page.close();
}

await browser.close();
console.log(`Captured ${shots.length} README screenshots in ${OUT_DIR}`);
