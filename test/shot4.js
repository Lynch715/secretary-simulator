const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const w of [1280, 390]){
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.evaluate(() => { localStorage.clear(); newGame({ seed: 21 }); while (G.month < 9 || !G.scene2){ if (G.scene && !G.sceneDone) Month.choose(0); if (G.scene2 && !G.scene2Done) Month.choose(0, 2); Month.end(); if (G.month > 40) break; } save(); UI.render(); });
    await p.screenshot({ path: `test/v_war_${w}.png`, fullPage: true });
    await p.click('[data-tab="ppl"]'); await p.screenshot({ path: `test/v_ppl_${w}.png`, fullPage: true });
    await p.click('[data-tab="post"]'); await p.screenshot({ path: `test/v_post_${w}.png`, fullPage: true });
    await p.click('[data-tab="war"]');
    const nb = await p.$('[data-prop="nom"]:not([disabled])');
    if (nb){ await nb.click(); await p.click('.pitem >> nth=0'); await p.waitForTimeout(200); await p.screenshot({ path: `test/v_nom_${w}.png` }); await p.keyboard.press('Escape'); }
    // play until a topic meeting
    await p.evaluate(() => { UI.close(); while (!Month.topicDue() && G.month < 50){ if (G.scene && !G.sceneDone) Month.choose(0); if (G.scene2 && !G.scene2Done) Month.choose(0, 2); Month.end(); } if (G.scene && !G.sceneDone) Month.choose(0); if (G.scene2 && !G.scene2Done) Month.choose(0, 2); save(); UI.render(); });
    await p.screenshot({ path: `test/v_topic_${w}.png`, fullPage: true });
    await p.click('[data-end]'); await p.waitForTimeout(300);
    const v = await p.$('[data-vote]'); if (v){ await v.click(); await p.waitForTimeout(2200); await p.screenshot({ path: `test/v_tvote_${w}.png` }); }
    console.log(w, await p.evaluate(() => [G.month, document.documentElement.scrollWidth - innerWidth]));
  }
  console.log(errs); await b.close();
})();
