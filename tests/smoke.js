// Drives the real page in a real browser. Run: node tests/smoke.js
const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  const requests = [];
  page.on('request', r => { if (!r.url().startsWith('file:')) requests.push(r.url()); });
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));

  // 1. log a dose from a vial, pick a site
  await page.click('[data-tab=vials]');
  await page.fill('#vlabel', 'Batch A'); await page.fill('#vcomp', 'TestCompound'); await page.fill('#vtotal', '10');
  await page.click('#vialForm button[type=submit]');
  await page.click('[data-tab=log]');
  await page.fill('#compound', 'TestCompound'); await page.fill('#amount', '2');
  await page.selectOption('#unit', 'mg');
  await page.selectOption('#vial', { index: 1 });
  await page.click('[data-site="abd-l"]');
  // typed values must survive the map re-render
  assert.strictEqual(await page.inputValue('#compound'), 'TestCompound');
  await page.click('#doseForm button[type=submit]');
  assert.ok((await page.textContent('main')).includes('TestCompound 2 mg'), 'dose appears in history');

  // 2. vial was deducted, site is now red
  await page.click('[data-tab=vials]');
  assert.ok((await page.textContent('main')).includes('8 of 10 mg left'), 'vial deducted');
  await page.click('[data-tab=sites]');
  assert.ok(await page.$('.site.bad[data-site="abd-l"]'), 'used site is red');
  assert.ok(await page.$('.site.ok[data-site="abd-r"]'), 'unused site is green');

  // 3. deleting the dose gives the vial amount back
  await page.click('[data-tab=log]');
  await page.click('[data-act=delDose]');
  await page.click('[data-tab=vials]');
  assert.ok((await page.textContent('main')).includes('10 of 10 mg left'), 'vial restored on delete');

  // 4. weight, unit switch keeps the same stored value
  await page.click('[data-tab=progress]');
  await page.fill('#wval', '200'); await page.click('#wForm button[type=submit]');
  await page.click('[data-tab=more]');
  await page.selectOption('#unitSel', 'kg');
  await page.click('[data-tab=progress]');
  assert.ok((await page.textContent('main')).includes('90.7 kg'), '200 lb shows as 90.7 kg');

  // 5. hostile text is shown as text, never run
  await page.click('[data-tab=progress]');
  await page.fill('#sxwhat', '<img src=x onerror=window.__pwned=1>');
  await page.click('#sxForm button[type=submit]');
  assert.strictEqual(await page.evaluate(() => window.__pwned), undefined, 'no script injection');

  // 6. backup round trip
  await page.click('[data-tab=more]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=export]')]);
  const file = await dl.path();
  await page.click('[data-act=wipe]');
  await page.click('[data-tab=vials]');
  assert.ok(!(await page.textContent('main')).includes('Batch A'), 'wiped');
  await page.click('[data-tab=more]');
  await page.setInputFiles('#imp', file);
  await page.waitForTimeout(300);
  await page.click('[data-tab=vials]');
  assert.ok((await page.textContent('main')).includes('Batch A'), 'restored from backup');

  // 7. report opens
  await page.click('[data-tab=more]');
  await page.click('[data-act=report][data-days="0"]');
  assert.ok((await page.textContent('#report')).includes('Pep Journal report'));

  assert.deepStrictEqual(errors, [], 'no page errors: ' + errors.join('; '));
  assert.deepStrictEqual(requests, [], 'no network requests: ' + requests.join(', '));
  console.log('PASS: all smoke checks');
  await browser.close();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
