const { chromium } = require('playwright');
async function endMonth(p){
  await p.click('[data-end]');
  for (let i = 0; i < 6; i++){
    await p.waitForTimeout(250);
    const v = await p.$('[data-vote]'); if (v){ await v.click(); await p.waitForTimeout(2200); continue; }
    const k = await p.$('[data-ok]'); if (k){ await k.click(); continue; }
    if (!(await p.$('.mask'))) break;
  }
}
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const w of [390, 1280]){
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(w + ' console ' + m.text()); });
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.evaluate(() => localStorage.clear());
    await p.reload();
    await p.screenshot({ path: `test/t_${w}.png`, fullPage: true });
    await p.click('[data-go="new"]');
    await p.screenshot({ path: `test/m1_${w}.png`, fullPage: true });
    await p.click('[data-opt="1"]');
    // do an action
    await p.click('[data-act="modi"]'); await p.click('.pitem >> nth=2');
    await p.click('[data-act="xia"]'); await p.click('.pitem >> nth=0');
    await p.screenshot({ path: `test/m1b_${w}.png`, fullPage: true });
    await endMonth(p);
    // month 2
    await p.click('[data-opt="2"]');
    await p.click('[data-prop="give"]').catch(()=>{});
    await p.click('.pitem >> nth=0').catch(()=>{});
    await p.screenshot({ path: `test/m2_${w}.png`, fullPage: true });
    await p.click('[data-end]');
    await p.waitForTimeout(300);
    await p.screenshot({ path: `test/m2hr_${w}.png`, fullPage: false });
    const ok = await p.$('[data-ok]'); if (ok) await ok.click();
    await p.waitForTimeout(200);
    // play to month 4 vote
    for (let i = 0; i < 2; i++){ const o = await p.$('[data-opt]:not([disabled])'); if (o) await o.click(); await endMonth(p); }
    await p.screenshot({ path: `test/m4_${w}.png`, fullPage: true });
    const o4 = await p.$('[data-opt]:not([disabled])'); if (o4) await o4.click();
    await p.click('[data-end]'); await p.waitForTimeout(300);
    const v = await p.$('[data-vote]'); if (v){ await v.click(); await p.waitForTimeout(2200); await p.screenshot({ path: `test/vote_${w}.png` }); }
    for (let i = 0; i < 5; i++){ const k = await p.$('[data-ok]'); if (k){ await k.click(); await p.waitForTimeout(300); } else break; }
    await p.screenshot({ path: `test/m5_${w}.png`, fullPage: true });
    for (const t of ['post','ppl','file']){ await p.click(`[data-tab="${t}"]`); await p.screenshot({ path: `test/${t}_${w}.png`, fullPage: true }); }
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(w, 'overflow', sw);
  }
  console.log('errors', errs);
  await b.close();
})();
