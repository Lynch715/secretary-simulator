var src = require('fs').readFileSync(__dirname + '/sim.js', 'utf8').replace(/var N = \+process[\s\S]*$/, '');
eval(src);
['smart','dirty'].forEach(function(st){
  var mp=[0,0,0], mh=0, gr=0, jcz=0, mlv=0, n=60, vac=0, own1=0;
  for (var i=0;i<n;i++){ var G=play(st, 5000+i); G.mg=G.mg||{a:0,b:0,c:0}; mp[0]+=G.mg.a; mp[1]+=G.mg.b; mp[2]+=G.mg.c; gr+=(G.flags.gray||0); if (A.own('jcz')||A.own('jw_fu')) jcz++; mlv+=A.Grip.level('mayor'); own1 += Object.keys(G.posts).filter(function(k){return G.posts[k]&&A.camp(G.posts[k])===1;}).length; }
  console.log(st, 'mayor parts', mp.map(function(x){return (x/n).toFixed(1);}), 'lvl', (mlv/n).toFixed(2), 'gray', (gr/n).toFixed(1), 'jcz/jwfu own', jcz/n, 'own posts', (own1/n).toFixed(1));
});
