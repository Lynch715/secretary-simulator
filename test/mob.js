const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const w of [360, 414]){
    const ctx = await b.newContext({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.screenshot({ path: `test/m_title_${w}.png`, fullPage: true });
    await p.evaluate(() => { newGame({ seed: 31 }); while (G.month < 12){ if (G.scene && !G.sceneDone) Month.choose(0); if (G.scene2 && !G.scene2Done) Month.choose(0, 2); Month.end(); } save(); UI.render(); });
    await p.screenshot({ path: `test/m_war_${w}.png`, fullPage: false });
    await p.screenshot({ path: `test/m_warfull_${w}.png`, fullPage: true });
    await p.click('[data-prop="talk"]'); await p.screenshot({ path: `test/m_pick_${w}.png` }); await p.click('[data-x]');
    for (const t of ['post','ppl','file']){ await p.click(`[data-tab="${t}"]`); await p.screenshot({ path: `test/m_${t}_${w}.png`, fullPage: false }); }
    await p.click('[data-tab="war"]');
    await p.evaluate(() => { if (G.scene && !G.sceneDone) Month.choose(0); if (G.scene2 && !G.scene2Done) Month.choose(0, 2); UI.render(); });
    await p.click('[data-end]'); await p.waitForTimeout(300);
    const v = await p.$('[data-vote]'); if (v){ await v.click(); await p.waitForTimeout(2200); } await p.screenshot({ path: `test/m_meet_${w}.png` });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(w, 'overflow', sw, await p.evaluate(() => G.month));
  }
  console.log(errs); await b.close();
})();
