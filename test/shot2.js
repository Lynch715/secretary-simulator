const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const w of [1280, 390]){
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.evaluate(() => { localStorage.clear(); newGame({ seed: 7 }); while (G.month < 4){ if (G.scene && !G.sceneDone) Month.choose(0); Month.end(); } if (G.scene && !G.sceneDone) Month.choose(0); save(); UI.render(); });
    await p.screenshot({ path: `test/w4_${w}.png`, fullPage: true });
    await p.click('[data-end]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `test/vpre_${w}.png` });
    await p.click('[data-vote]'); await p.waitForTimeout(2200);
    await p.screenshot({ path: `test/vote_${w}.png` });
    await p.click('[data-ok]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `test/w5_${w}.png`, fullPage: true });
    await p.evaluate(() => { G.ending = 'mayor_moved'; UI.render(); });
    await p.screenshot({ path: `test/end_${w}.png`, fullPage: true });
    console.log(w, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  console.log(errs); await b.close();
})();
