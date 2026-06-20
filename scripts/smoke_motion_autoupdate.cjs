const { chromium } = require('playwright');

const BASE_API = 'http://localhost:5175/api';
const BASE_WEB = process.env.E2E_BASE || 'http://localhost:5500';

const log = (msg) => console.log(msg);

async function apiJson(path, options = {}) {
  const resp = await fetch(`${BASE_API}${path}`, options);
  const data = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, data };
}

(async () => {
  const results = [];
  const pass = (name, details = '') => {
    results.push({ name, status: 'PASS', details });
    log(`PASS: ${name}${details ? ' - ' + details : ''}`);
  };
  const fail = (name, err) => {
    const details = String(err?.message || err || 'Unknown error');
    results.push({ name, status: 'FAIL', details });
    log(`FAIL: ${name} - ${details}`);
  };

  const nonce = Date.now();
  const categoryTitle = `QA Motion Category ${nonce}`;
  const designTitle = `QA Motion Design ${nonce}`;

  try {
    let token = '';

    try {
      const loginAttempts = [
        { username: 'admin', password: 'admin123' },
        { username: 'admin', password: 'Admin@1234' },
        { username: 'admin954809@gmail.com', password: 'Admin@1234' },
        { email: 'admin', password: 'admin123' },
        { email: 'admin', password: 'Admin@1234' },
        { email: 'admin954809@gmail.com', password: 'Admin@1234' }
      ];

      let login = null;
      let lastMessage = '';
      for (const attempt of loginAttempts) {
        login = await apiJson('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt)
        });
        
        if (login.ok && login.data?.token) {
          token = login.data.token;
          pass('Admin API login');
          break;
        } else if (login.ok && login.data?.twoFactorRequired && login.data?.challengeId && login.data?.debugCode) {
          // Handle 2FA verification
          const verifyResponse = await apiJson('/auth/login/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: login.data.challengeId,
              code: login.data.debugCode
            })
          });
          
          if (verifyResponse.ok && verifyResponse.data?.token) {
            token = verifyResponse.data.token;
            pass('Admin API login with 2FA');
            break;
          } else {
            lastMessage = verifyResponse.data?.message || '2FA verification failed';
          }
        } else {
          lastMessage = login.data?.message || 'Invalid credentials';
        }
      }

      if (!token) throw new Error(lastMessage || 'Unable to acquire admin token');
      pass('Admin API login', 'token acquired');
    } catch (e) {
      fail('Admin API login', e);
      throw e;
    }

    let createdCategoryId = '';
    try {
      const createCategory = await apiJson('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: categoryTitle,
          description: 'Auto-created for motion smoke validation',
          image: '/hero-bg.webp',
          status: 'active'
        })
      });

      if (!createCategory.ok) throw new Error(createCategory.data?.message || `Create category failed (${createCategory.status})`);
      createdCategoryId = createCategory.data?.category?.id || '';
      if (!createdCategoryId) throw new Error('Category id missing in create response');
      pass('Create category', createdCategoryId);
    } catch (e) {
      fail('Create category', e);
      throw e;
    }

    let createdDesignId = '';
    try {
      let createDesign = null;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        createDesign = await apiJson('/designs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `${designTitle} #${attempt}`,
            description: 'Auto-created for motion smoke validation',
            categoryId: createdCategoryId,
            price: 99999,
            previewImage: '/hero-bg.webp',
            modelUrl: ''
          })
        });
        if (createDesign.ok) break;
      }

      if (!createDesign || !createDesign.ok) {
        throw new Error(`Create design failed (${createDesign?.status || 'n/a'}): ${JSON.stringify(createDesign?.data || {})}`);
      }
      createdDesignId = createDesign.data?.designId || '';
      if (!createdDesignId) throw new Error('Design id missing in create response');
      pass('Create design', createdDesignId);
    } catch (e) {
      fail('Create design', e);
      throw e;
    }

    try {
      const categoriesResp = await apiJson('/categories');
      if (!categoriesResp.ok) throw new Error(`Categories fetch failed (${categoriesResp.status})`);
      const category = (categoriesResp.data?.categories || []).find((c) => c.id === createdCategoryId || c.title === categoryTitle);
      if (!category) throw new Error('Created category missing in GET /categories');
      if (category.motion3d !== true) throw new Error(`Expected category.motion3d=true, got ${String(category.motion3d)}`);
      pass('Category motion3d in API', 'motion3d=true');
    } catch (e) {
      fail('Category motion3d in API', e);
      throw e;
    }

    try {
      const designsResp = await apiJson('/designs');
      if (!designsResp.ok) throw new Error(`Designs fetch failed (${designsResp.status})`);
      const designs = Array.isArray(designsResp.data) ? designsResp.data : (designsResp.data?.designs || []);
      const design = designs.find((d) => d.id === createdDesignId || d.title === designTitle);
      if (!design) throw new Error('Created design missing in GET /designs');
      if (design.motion3d !== true) throw new Error(`Expected design.motion3d=true, got ${String(design.motion3d)}`);
      pass('Design motion3d in API', 'motion3d=true');
    } catch (e) {
      fail('Design motion3d in API', e);
      throw e;
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

    const gotoWithRetry = async (path, options = {}) => {
      let lastError = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          await page.goto(`${BASE_WEB}${path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 45000,
            ...options,
          });
          return;
        } catch (error) {
          lastError = error;
          await page.waitForTimeout(1000);
        }
      }
      throw lastError || new Error(`Failed to navigate to ${path}`);
    };

    try {
      const evaluateMotionCoverage = async () => page.evaluate(() => {
        const motionMarked = Array.from(document.querySelectorAll('img.motion-3d'));
        const dataMarked = Array.from(document.querySelectorAll('img[data-motion3d="true"]'));
        const missing = dataMarked.filter((img) => !img.classList.contains('motion-3d'));
        return {
          managedCount: Math.max(motionMarked.length, dataMarked.length),
          missingManagedMotionCount: missing.length
        };
      });

      await gotoWithRetry('/gallery');
      await page.waitForFunction(() => {
        const loadingText = (document.body?.textContent || '').toLowerCase();
        if (loadingText.includes('loading...')) return false;
        return document.querySelectorAll('[data-action="nav"]').length > 0 || document.querySelectorAll('img').length > 0;
      }, { timeout: 25000 }).catch(() => null);
      await page.waitForTimeout(1200);
      let { managedCount, missingManagedMotionCount } = await evaluateMotionCoverage();

      // Some builds render gallery cards without immediate <img> nodes; fallback to showroom where managed images are guaranteed.
      if (managedCount === 0) {
        await gotoWithRetry('/showroom');
        await page.waitForFunction(() => {
          const loadingText = (document.body?.textContent || '').toLowerCase();
          if (loadingText.includes('loading...')) return false;
          return document.querySelectorAll('[data-action="select-showroom-room"]').length > 0 || document.querySelectorAll('img').length > 0;
        }, { timeout: 25000 }).catch(() => null);
        await page.waitForTimeout(1000);
        ({ managedCount, missingManagedMotionCount } = await evaluateMotionCoverage());
      }

      if (managedCount === 0) {
        throw new Error('No managed images found for motion validation');
      }

      if (missingManagedMotionCount > 0) {
        throw new Error(`Managed images missing motion-3d class: ${missingManagedMotionCount}`);
      }

      pass('Frontend auto motion class', `validated ${managedCount} managed images with motion-3d`);
    } catch (e) {
      fail('Frontend auto motion class', e);
      throw e;
    } finally {
      await browser.close();
    }

    log('\n--- Motion Smoke Summary ---');
    for (const r of results) {
      log(`${r.status} | ${r.name} | ${r.details || ''}`);
    }
    process.exit(results.some((r) => r.status === 'FAIL') ? 2 : 0);
  } catch (fatal) {
    log('\n--- Motion Smoke Summary ---');
    for (const r of results) {
      log(`${r.status} | ${r.name} | ${r.details || ''}`);
    }
    log(`FATAL: ${String(fatal?.message || fatal)}`);
    process.exit(3);
  }
})();
