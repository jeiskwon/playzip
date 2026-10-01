(function(){
 const STORE='https://play.google.com/store/apps/details?id=io.github.jeiskwon.playzip';
 window.playzipAppLink=function(url){return 'intent://open?url='+encodeURIComponent(url)+'#Intent;scheme=playzip;package=io.github.jeiskwon.playzip;S.browser_fallback_url='+encodeURIComponent(STORE)+';end';};
 window.renderPlayzipShared=function(){
 const params=new URLSearchParams(location.hash.slice(1)),raw=params.get('s');
 if(!raw)return false;
 let data;try{if(raw.length>12000)throw Error();data=JSON.parse(decodeURIComponent(escape(atob(raw))));if(data.v!==1||!Array.isArray(data.lines)||data.lines.length!==3||!['lumi','nova','jeong'].includes(data.reader))throw Error();}catch(e){return false;}
 const app=document.querySelector('.app');if(app)app.hidden=true;
 const card=document.createElement('main');card.className='shared-result';card.style.cssText='max-width:620px;margin:auto;padding:24px 20px 48px;color:#332d43;font-family:system-ui;line-height:1.75';
 function add(tag,text,parent=card){const e=document.createElement(tag);e.textContent=String(text||'').slice(0,2500);parent.appendChild(e);return e;}
 add('small','PLAYZIP · 친구가 공유한 사주');
 const img=document.createElement('img');img.src=(app?'characters/':'../characters/')+data.reader+'-c.webp';img.alt={lumi:'루미',nova:'노바',jeong:'정연'}[data.reader];img.style.cssText='display:block;width:110px;height:126px;object-fit:contain;margin:18px auto';card.appendChild(img);
 add('h1',data.title).style.cssText='font-size:25px;line-height:1.4';
 add('p','공유한 사람이 받은 핵심 해석이에요.');const ul=add('ul','');data.lines.forEach(x=>add('li',x,ul));
 add('h3','오늘 해볼 한 가지');add('p',data.action);
 if(data.detail){const more=add('details','');add('summary','해석 더 보기',more);add('p',data.detail,more);}
 add('p','사주와 운세는 재미와 자기성찰을 위한 참고 콘텐츠예요.').style.cssText='font-size:12px;color:#82788c';
 const button=add('a',app?'나도 사주 보기':'PLAYZIP에서 나도 사주 보기');button.style.cssText='display:block;padding:14px;background:#7954be;color:white;border-radius:16px;text-decoration:none;text-align:center;font-weight:700;margin-top:24px';
 if(app){button.href='#';button.onclick=e=>{e.preventDefault();history.replaceState(null,'',location.pathname);card.remove();app.hidden=false;};}else button.href=window.playzipAppLink('https://jeiskwon.github.io/playzip/saju/');
 if(!app){const store=add('a','앱 설치하기 · Google Play');store.href=STORE;store.style.cssText='display:block;text-align:center;margin:14px;color:#7954be';}
 document.body.prepend(card);return true;
 };
})();
