const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const w of [1280, 390]){
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.evaluate(() => { localStorage.clear(); newGame({ seed: 11, bossType: 'shrewd' }); while (G.month < 3){ if (G.scene && !G.sceneDone) Month.choose(0); Month.end(); } Month.choose(0); save(); UI.render(); });
    // 打听 方静仪
    await p.click('[data-act="modi"]'); await p.click('.pitem:has-text("方静仪")');
    await p.click('[data-prop="talk"]'); await p.click('.pitem:has-text("罗明川")');
    await p.click('[data-prop="give"]'); await p.click('.pitem >> nth=0');
    await p.screenshot({ path: `test/n_war_${w}.png`, fullPage: true });
    await p.click('[data-tab="ppl"]'); await p.screenshot({ path: `test/n_ppl_${w}.png`, fullPage: true });
    console.log(w, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  console.log(errs); await b.close();
})();
