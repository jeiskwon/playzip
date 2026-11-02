/* End-to-end browser parity checks for the static 운명코드 web package. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const PORT=process.env.UNMYEONG_WEB_PORT||'8977';
const base='http://127.0.0.1:'+PORT+'/playzip/preview/';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [width,height] of [[360,740],[390,844],[430,932]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[],missing=[];
   page.on('pageerror',e=>errors.push('shell: '+e.message));
   page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:'+PORT+'/playzip/'))missing.push(r.status()+' '+r.url())});
   await page.goto(base,{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('#homePane .service').count(),3,'all three home cards');
   const imgs=await page.locator('.service img').evaluateAll(items=>items.map(i=>({url:i.currentSrc,w:i.naturalWidth,ok:i.complete})));
   assert(imgs.every(x=>x.w>0&&x.ok),'all native home art must load '+JSON.stringify(imgs));
   await page.locator('nav [data-section=saju]').click();
   await page.waitForFunction(()=>document.getElementById('moduleFrame')?.contentWindow?.document?.querySelectorAll('.character').length===3);
   const saju=page.frameLocator('#moduleFrame');
   assert.equal(await saju.locator('.character').count(),3);
   const imgsReader=await saju.locator('.character .readerArt img').evaluateAll(items=>items.map(i=>i.naturalWidth));
   assert(imgsReader.every(n=>n>0),'selected characters load '+imgsReader.join());
   await saju.locator('.character[data-char=lumi]').click();
   await saju.locator('#pageTitle').evaluate(()=>{
     selectedTopic='mood';selectedGender='male';
     document.getElementById('nickname').value='웹테스트';
     render(1980,5,15,10,0,false);
   });
   assert.equal(await saju.locator('#dailyFortune .dailyTag').innerText(),'오늘의 운세');
   await saju.locator('#shareBtn').evaluate(el=>{
     window.__unmyeongTestShare=[];
     Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__unmyeongTestShare.push(data)}});
     el.click();
   });
   await page.waitForTimeout(100);
   const sharePayload=await saju.locator('#shareBtn').evaluate(()=>window.__unmyeongTestShare[0]);
   assert(sharePayload && sharePayload.url.includes('/assets/saju_v2.html#s='),'web saju sharing points to this website instead of old Android link');

   await page.waitForTimeout(140);
   await page.locator('nav [data-section=home]').click();
   await page.locator('#homeRecent .recent-entry').waitFor();
   await page.locator('nav [data-section=history]').click();
   assert(await page.locator('.hist-entry').count()>=1,'local history saved');
   await page.locator('nav [data-section=tarot]').click();
   const tarot=page.frameLocator('#moduleFrame');
   await tarot.locator('#tarot-start-btn').waitFor();
   await tarot.locator('#tarot-start-btn').click();
   assert(await tarot.locator('.tarot-card').count()>0,'tarot started');
   await page.locator('nav [data-section=nabti]').click();
   const nabti=page.frameLocator('#moduleFrame');
   await nabti.locator('#nabti-start-btn').waitFor();
   await nabti.locator('#nabti-start-btn').click();
   assert(await nabti.locator('#nabti-root').innerText(),'naBTI started');
   await page.locator('#toolbarAction').click();
   assert(await page.locator('#homePane').isVisible(),'return home via native-style top action');
   assert(missing.length===0,'missing assets: '+missing.join('; '));
   assert(errors.length===0,'JavaScript exceptions: '+errors.join('; '));
   console.log('WEB '+width+'x'+height+' PASS: home, art, saju daily, history, tarot, naBTI, return home');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
