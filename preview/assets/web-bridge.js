/* 운명코드 웹 전용 어댑터.
 * Android 앱에서는 이 파일을 로드하지 않으며 사주·타로·나BTI 계산은 기존 소스 그대로 사용.
 */
(function(){
'use strict';
if(window.__UNMYEONG_WEB_BRIDGE__)return;
window.__UNMYEONG_WEB_BRIDGE__=true;
const FRAME_SOURCE='unmyeongcode-web';
const root=(function(){try{return window.parent!==window&&window.parent.location.origin===location.origin?window.parent:null}catch(e){return null}})();
const FILES={saju:'saju_v2.html',tarot:'tech-asset/index.html',nabti:'nabti/index.html'};
const FALLBACK_STORE='unmyeongcode.web.history.v1';
function route(type,url){
 const raw=String(url||'');
 const path=location.pathname;
 const assetsRoot=path.includes('/tech-asset/')||path.includes('/nabti/')?new URL('../',location.href):new URL('./',location.href);
 if(raw.startsWith('app://saju-v2'))return new URL(FILES.saju,assetsRoot).href;
 const oldSaju=raw.match(/^https:\/\/jeiskwon\.github\.io\/playzip\/saju\/?(#.*)?$/i);
 if(oldSaju)return new URL(FILES.saju+(oldSaju[1]||''),assetsRoot).href;
 const oldTarot=raw.match(/^https:\/\/jeiskwon\.github\.io\/(?:playzip\/)?tech-asset\/?(\?.*)?$/i);
 if(oldTarot)return new URL(FILES.tarot+(oldTarot[1]||''),assetsRoot).href;
 const oldNabti=raw.match(/^https:\/\/jeiskwon\.github\.io\/nabti\/?(\?.*)?$/i);
 if(oldNabti)return new URL(FILES.nabti+(oldNabti[1]||''),assetsRoot).href;
 return raw||location.href;
}
function emit(message){
 if(root){root.postMessage({source:FRAME_SOURCE,...message},location.origin);return;}
 if(message.type==='saveResult'){
  try{const list=JSON.parse(localStorage.getItem(FALLBACK_STORE)||'[]');list.unshift({kind:message.kind,title:message.title,detail:message.detail,url:message.url,timestamp:Date.now()});localStorage.setItem(FALLBACK_STORE,JSON.stringify(list.slice(0,5)))}catch(_){}
 }
}
async function share(title,description,url){
 const target=route(null,url)||location.href;
 const data={title:String(title||'운명코드'),text:String(description||''),url:target};
 if(navigator.share){try{await navigator.share(data);return}catch(e){if(e&&e.name==='AbortError')return}}
 const copy=[data.title,data.text,data.url].filter(Boolean).join('\n');
 let done=false;
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(copy);done=true;}}catch(_){}
 if(!done){
  const input=document.createElement('textarea');input.value=copy;input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();
  try{done=document.execCommand('copy')}catch(_){}input.remove();
 }
 alert(done?'결과와 공유 링크를 클립보드에 복사했습니다.':'이 브라우저에서는 자동 복사가 제한됩니다. 주소창의 URL을 복사해 공유해주세요.');
}
function store(kind,title,detail,url){
 emit({type:'saveResult',kind:String(kind||'운명코드'),title:String(title||'결과'),detail:String(detail||''),url:route(kind,url)});
}
function saveDataUrl(dataUrl,fileName){
 if(typeof dataUrl!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,/.test(dataUrl))return;
 const a=document.createElement('a');a.href=dataUrl;a.download=String(fileName||'unmyeongcode-result.png').replace(/[\\/:*?"<>|]/g,'_');document.body.appendChild(a);a.click();a.remove();
}
window.AndroidPlayzip={
 shareToKakao:(title,description,url)=>{void share(title,description,url)},
 shareResultToKakao:(title,description,url)=>{void share(title,description,url)},
 saveResult:store,
 saveDataUrl
};
window.AndroidSaju={
 saveResult:(title,detail,url)=>store('사주',title,detail,url),
 shareResultKakao:(title,description,url)=>{void share(title,description,url)},
 shareKakao:(title,description,url)=>{void share(title,description,url)}
};
window.unmyeongWebHome=function(){emit({type:'openHome'})};
let lastResult='';
function txt(selector){const el=document.querySelector(selector);return el?String(el.innerText||el.textContent||'').trim():''}
function capture(){
 try{
  const p=location.pathname;
  let kind='',title='',detail='';
  if(p.includes('/tech-asset/')){
   if(document.querySelector('.tarot-result-frame,.tarot-pos-block')){kind='타로';title=txt('.tarot-card-name')||txt('.tarot-title')||'타로 결과';detail=txt('.tarot-nickname-tag')||txt('.tarot-pos-meaning')||txt('.tarot-sub');}
  }else if(p.includes('/nabti/')){
   if(document.querySelector('.nabti-result-frame')){kind='나BTI';title=(txt('.nabti-type-code')+' '+txt('.nabti-type-name')).trim()||'나BTI 결과';detail=txt('.nabti-blurb')||txt('.nabti-nickname-tag');}
  }
  if(kind&&title){
   const key=kind+'|'+title+'|'+detail;
   if(lastResult!==key){lastResult=key;store(kind,title,detail,window.__PLAYZIP_RESULT_URL__||location.href)}
  }
 }catch(e){}
}
function attach(){
 if(!document.documentElement)return;
 const observer=new MutationObserver(()=>{clearTimeout(window.__unmyeongObserveTimer);window.__unmyeongObserveTimer=setTimeout(capture,160)});
 observer.observe(document.body||document.documentElement,{subtree:true,childList:true});
 setTimeout(capture,400);
 // App's original "more content" links return to the web home instead of Android intents.
 document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href]');
  if(!a)return;
  const href=a.getAttribute('href')||'';
  if(href==='https://jeiskwon.github.io/playzip/'||href==='https://jeiskwon.github.io/playzip'){
   e.preventDefault();window.unmyeongWebHome();
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
})();