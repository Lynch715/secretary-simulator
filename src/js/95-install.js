/* ── 95-install：装到桌面 + 离线。跟玩法无关，放在最后 ──
   Chrome / Edge 能一点就装；Safari 没这个接口，只能给路径 */
(function(){
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;  /* 无头跑局时跳过 */
  var KEY = 'dami_install';
  var deferred = null, armed = false, reloading = false;
  var ua = navigator.userAgent;
  var isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/.test(ua);
  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) ||
                   navigator.standalone === true;

  function seen(){ try { return localStorage.getItem(KEY); } catch (e){ return null; } }
  function mark(v){ try { localStorage.setItem(KEY, v); } catch (e){} }

  function panel(html){
    var d = document.createElement('div');
    d.className = 'inst-mask';
    d.innerHTML = '<div class="inst-box">' + html + '</div>';
    document.body.appendChild(d);
    d.addEventListener('click', function(e){ if (e.target === d) close(d); });
    return d;
  }
  function close(d){ if (d && d.parentNode) d.parentNode.removeChild(d); }

  function offer(){
    if (standalone || document.querySelector('.inst-mask')) return;
    var body, box;
    if (deferred){
      body = '<h3>放一个到桌面</h3><p>装上之后不用开浏览器，断网也能接着办这个月的事。</p>' +
             '<div class="inst-row"><button class="inst-yes">装上</button>' +
             '<button class="inst-no">以后再说</button></div>';
    } else if (isIOS){
      body = '<h3>放一个到主屏幕</h3><p>点底部的分享按钮，往下找「添加到主屏幕」，右上角点添加。</p>' +
             '<div class="inst-row"><button class="inst-no">知道了</button></div>';
    } else if (isSafari){
      body = '<h3>放一个到程序坞</h3><p>菜单栏「文件」，往下找「添加到程序坞」。</p>' +
             '<div class="inst-row"><button class="inst-no">知道了</button></div>';
    } else { return; }
    box = panel(body);
    var yes = box.querySelector('.inst-yes'), no = box.querySelector('.inst-no');
    if (yes) yes.onclick = function(){ close(box); doInstall(); };
    if (no) no.onclick = function(){ mark('dismissed'); close(box); };
  }

  function doInstall(){
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function(r){
      mark(r && r.outcome === 'accepted' ? 'installed' : 'dismissed');
      deferred = null;
    });
  }

  /* 界面出来之后再等四十五秒。一进来就弹很烦 */
  function arm(){
    if (armed || standalone) return;
    var st = seen();
    if (st === 'dismissed' || st === 'installed') return;
    armed = true;
    var t = setInterval(function(){
      if (document.querySelector('.tabs')){ clearInterval(t); setTimeout(offer, 45000); }
    }, 2000);
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault(); deferred = e; arm();
  });
  if (isSafari || isIOS) window.addEventListener('load', arm);
  window.addEventListener('appinstalled', function(){ mark('installed'); });

  /* 设置里常驻一个入口 */
  window.installOffer = function(){
    if (standalone){ if (window.UI && UI.toast) UI.toast('已经装好了'); return; }
    mark(''); offer();
  };

  /* 离线 */
  if (location.protocol.indexOf('http') === 0 && 'serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./sw.js').then(function(reg){
        reg.addEventListener('updatefound', function(){
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function(){
            if (nw.state === 'installed' && navigator.serviceWorker.controller){
              var box = panel('<h3>有新版本</h3><p>刷新之后是新的。这一局的存档不会丢。</p>' +
                '<div class="inst-row"><button class="inst-yes">刷新</button>' +
                '<button class="inst-no">待会儿</button></div>');
              box.querySelector('.inst-yes').onclick = function(){
                if (reg.waiting) reg.waiting.postMessage('skipWaiting');
                close(box);
              };
              box.querySelector('.inst-no').onclick = function(){ close(box); };
            }
          });
        });
      }).catch(function(){});
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        if (reloading) return;
        reloading = true;
        location.reload();
      });
    });
  }
})();
