/* 大秘 · 离线。代码走网络优先（上线就是新版），图片走缓存优先 */
var VER = 'dami-v1';
var SHELL = ['./', './index.html', './site.webmanifest', './favicon.ico',
             './icon/icon-192.png', './icon/icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VER).then(function(c){ return c.addAll(SHELL); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === VER ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('message', function(e){
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var isImg = /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(new URL(req.url).pathname);
  if (isImg){
    /* 缓存优先，后台悄悄更新 */
    e.respondWith(caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok) caches.open(VER).then(function(c){ c.put(req, res.clone()); });
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    }));
    return;
  }
  /* 代码：网络优先 */
  e.respondWith(fetch(req).then(function(res){
    if (res && res.ok && res.type === 'basic'){
      var cp = res.clone();
      caches.open(VER).then(function(c){ c.put(req, cp); });
    }
    return res;
  }).catch(function(){
    return caches.match(req).then(function(hit){ return hit || caches.match('./index.html'); });
  }));
});
