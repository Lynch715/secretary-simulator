/* 头像资源、人物解锁和旧存档兼容回归。node test/portraits.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
let code = '';
for (const dir of ['data', 'js']) {
  for (const f of fs.readdirSync(path.join(root, 'src', dir)).sort()) {
    if (f.endsWith('.js') && !f.startsWith('95-')) code += fs.readFileSync(path.join(root, 'src', dir, f), 'utf8') + '\n';
  }
}
let storage = {};
const ctx = {console, Math, JSON, Object, Date, Number, setTimeout,
  localStorage: {setItem: (k,v) => storage[k] = v, getItem: k => storage[k] || null}};
vm.createContext(ctx); vm.runInContext(code, ctx);
const run = s => vm.runInContext(s, ctx);
run('newGame({seed:1234,bossType:"steady"})');
// Original start-of-game acquaintance list: art additions must not unlock people.
const original = ['boss','mayor','vice1','depsec','jiwei','zuzhi','zhengfa','xuanchuan','mishuzhang','tongzhan','gaoxin',
  'chengguan','gangkou','qingchuan','baisha','meiling','cg_quzhang','qc_xianzhang','bs_fuxian','gk_fuquzhang',
  'fagai','zhujian','caizheng','gongan','guazhi','keshang','msz_mishu','fuzhuren','me','wife','sister'];
for (const d of ctx.PEOPLE_DEF) {
  assert.strictEqual(ctx.G.people[d.id].met, original.includes(d.id) || !!d.cw, d.id + ' acquaintance changed');
  assert.strictEqual(run('faceOf(' + JSON.stringify(d.id) + ')'), d.id);
  assert(fs.existsSync(path.join(root, 'assets', 'p_' + d.id + '.webp')), d.id + ' missing portrait');
}
console.log('PASS all 65 fixed people have art without changing initial acquaintance');
assert.strictEqual(run('faceOf("dev_a")'), 'dev_a');
assert(fs.existsSync(path.join(root, 'assets', 'p_dev_a.webp')));
console.log('PASS existing developer portrait is wired into scenes');
const initial = run('JSON.stringify(savePayload())');
run('restoreGame(JSON.parse(' + JSON.stringify(initial) + '))');
assert.strictEqual(run('JSON.stringify(savePayload())'), initial);
console.log('PASS save/load preserves all state');
ctx.NEW_STANDING.forEach((d, i) => {
  // Existing saves already contain ns + name, with no added portrait field.
  ctx.G.people['ns' + i] = {id:'ns' + i, n:d.n, ns:1, met:true, p:'组织部长'};
  assert.strictEqual(run('faceOf("ns' + i + '")'), d.face);
  assert(fs.existsSync(path.join(root, 'assets', 'p_' + d.face + '.webp')));
  assert(run('face("ns' + i + '")').includes('assets/p_' + d.face + '.webp'));
});
assert.strictEqual(run('faceOf("unknown")'), null);
console.log('PASS all 4 dynamic successor portraits resolve in legacy saves');
run('newGame({seed:1234,bossType:"steady"});Grip.remove("vice1","jw")');
assert.strictEqual(run('faceOf("ns0")'), 'ns_weichanghe');
console.log('PASS real standing-committee replacement uses correct portrait');
