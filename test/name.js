const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:800} });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.evaluate(()=>localStorage.clear()); await p.reload();
  await p.fill('#nm', '欧阳明远'); await p.click('[data-go="new"]');
  const bad = await p.evaluate(() => {
    var hits = [];
    for (var m = 0; m < 60 && !G.ending; m++){
      ['war','post','ppl','file'].forEach(function(t){ G.tab = t; UI.render(); var h = (document.getElementById('app').innerHTML + Array.from(document.querySelectorAll('.mask')).map(function(x){return x.innerHTML}).join('')); if (/\{SUR\}|\{ME\}|刘/.test(h)) hits.push(G.month + ':' + t + ':' + (h.match(/.{0,20}(\{SUR\}|\{ME\}|刘).{0,10}/)||[''])[0]); });
      G.tab = 'war';
      if (G.scene && !G.sceneDone){ var o=SCENES[G.scene].opts; Month.choose(Math.floor(Math.random()*o.length)); if(!G.sceneDone) Month.choose(0);} if (G.scene2 && !G.scene2Done){ var o2=SCENES[G.scene2].opts; Month.choose(Math.floor(Math.random()*o2.length),2); if(!G.scene2Done) Month.choose(0,2);} UI.render();
      var h2 = (document.getElementById('app').innerHTML + Array.from(document.querySelectorAll('.mask')).map(function(x){return x.innerHTML}).join('')); if (/\{SUR\}|\{ME\}|刘/.test(h2)) hits.push(G.month + ':res:' + (h2.match(/.{0,20}(\{SUR\}|\{ME\}|刘).{0,10}/)||[''])[0]);
      Month.end();
    }
    if (G.ending){ UI.render(); var h3 = (document.getElementById('app').innerHTML + Array.from(document.querySelectorAll('.mask')).map(function(x){return x.innerHTML}).join('')); if (/\{SUR\}|刘/.test(h3)) hits.push('end:' + (h3.match(/.{0,20}(\{SUR\}|刘).{0,10}/)||[''])[0]); }
    return { hits: hits.slice(0, 10), name: G.name, sur: surname(G.name), month: G.month, sample: fill('小{SUR}，{SUR}敏') };
  });
  console.log(JSON.stringify(bad, null, 1), errs);
  await b.close();
})();
