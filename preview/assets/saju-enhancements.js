/* 운명코드: local-only five-person profiles and two-person basic 사주 */
(function(){
'use strict';
const PEOPLE_KEY='unmyeongcode.saju.people.v1',ACTIVE_KEY='unmyeongcode.saju.activePerson.v1',MIGRATION_KEY='unmyeongcode.saju.people.migrated.v1';
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function savedPersonName(p){return String(p&&(p.koreanFullName||p.nickname)||'').trim()}
function personKey(p){
 const name=savedPersonName(p).normalize('NFC').toLocaleLowerCase('ko-KR');
 if(!name)return '';
 return [name,p.calendar||'solar',Number(p.y)||0,Number(p.m)||0,Number(p.d)||0,p.leap?'leap':'normal'].join('|');
}
function readSavedProfiles(){
 let rows=[];try{rows=JSON.parse(localStorage.getItem(PEOPLE_KEY)||'[]')}catch(_){}
 if(!Array.isArray(rows))rows=[];
 rows=rows.filter(p=>p&&personKey(p)&&Number(p.y)>0).slice(0,5);
 if(!localStorage.getItem(MIGRATION_KEY)){
  localStorage.setItem(MIGRATION_KEY,'1');
  try{
   const legacy=rows.length?null:JSON.parse(localStorage.getItem(USER_PROFILE_KEY)||localStorage.getItem(LEGACY_JEONG_PROFILE_KEY)||'null');
   if(legacy&&personKey(legacy)&&Number(legacy.y)>0){
    rows=[{...legacy,pinned:false,updatedAt:Date.now()}];
    localStorage.setItem(PEOPLE_KEY,JSON.stringify(rows));
   }
  }catch(_){}
 }
 return rows;
}
window.readSavedProfiles=readSavedProfiles;window.personKey=personKey;window.savedPersonName=savedPersonName;
window.readUserProfile=function(){
 const rows=readSavedProfiles(),active=localStorage.getItem(ACTIVE_KEY);
 return rows.find(p=>personKey(p)===active)||rows[0]||null;
};
window.saveUserProfileData=function(p,makeActive=true){
 try{
  if(!personKey(p))throw Error('이름이나 별명을 입력해주세요.');
  const key=personKey(p),rows=readSavedProfiles(),previous=rows.find(x=>personKey(x)===key);
  let others=rows.filter(x=>personKey(x)!==key);
  if(others.length>=5){
   const evict=others.map((p,i)=>({p,i})).reverse().find(x=>!x.p.pinned);
   if(!evict)throw Error('저장된 5명이 모두 고정돼 있습니다. 고정 하나를 해제한 후 추가해주세요.');
   others.splice(evict.i,1);
  }
  const entry={...p,pinned:!!(previous&&previous.pinned),updatedAt:Date.now()};
  const all=[entry,...others].slice(0,5);
  localStorage.setItem(PEOPLE_KEY,JSON.stringify(all));
  if(makeActive){
   localStorage.setItem(ACTIVE_KEY,key);
   localStorage.setItem(USER_PROFILE_KEY,JSON.stringify(entry));
  }
  renderSavedPeopleList();return true;
 }catch(e){$('error').textContent=e.message||String(e);return false}
};
window.deleteUserProfile=function(){
 const current=window.readUserProfile();if(!current)return;
 removePerson(personKey(current));
};
function removePerson(key){
 const rows=readSavedProfiles().filter(p=>personKey(p)!==key);
 localStorage.setItem(PEOPLE_KEY,JSON.stringify(rows));
 if(localStorage.getItem(ACTIVE_KEY)===key){
  localStorage.setItem(ACTIVE_KEY,rows.length?personKey(rows[0]):'');
  if(!rows.length)localStorage.removeItem(USER_PROFILE_KEY);
  else localStorage.setItem(USER_PROFILE_KEY,JSON.stringify(rows[0]));
 }
 renderSavedPeopleList();
}
function togglePin(key){
 const rows=readSavedProfiles(),p=rows.find(x=>personKey(x)===key);
 if(!p)return;
 p.pinned=!p.pinned;
 localStorage.setItem(PEOPLE_KEY,JSON.stringify(rows));
 renderSavedPeopleList();
}
function renderSavedPeopleList(){
 const box=$('savedPeopleList');if(!box)return;
 box.replaceChildren();
 const rows=readSavedProfiles();
 if(!rows.length){const empty=document.createElement('p');empty.className='savedPeopleHint';empty.textContent='저장된 정보가 없습니다. 이름을 입력하고 결과를 보면 자동 저장됩니다.';box.appendChild(empty);return}
 rows.forEach(p=>{
  const row=document.createElement('div');row.className='savedPersonRow';
  const load=document.createElement('button');load.type='button';load.textContent=savedPersonName(p)+' · '+p.y+'.'+p.m+'.'+p.d;
  load.onclick=()=>{fillProfileForm(p);localStorage.setItem(ACTIVE_KEY,personKey(p));setWizardStep(profileWizardStep(p,selectedChar));renderSavedPeopleList()};
  const pin=document.createElement('button');pin.type='button';pin.className=p.pinned?'pinned':'';pin.textContent=p.pinned?'고정됨':'고정';
  pin.setAttribute('aria-label',savedPersonName(p)+' '+(p.pinned?'고정 해제':'고정'));pin.onclick=()=>togglePin(personKey(p));
  const del=document.createElement('button');del.type='button';del.textContent='삭제';del.setAttribute('aria-label',savedPersonName(p)+' 삭제');
  del.onclick=()=>{if(confirm(savedPersonName(p)+'님의 정보를 목록에서 삭제할까요?'))removePerson(personKey(p))};
  row.append(load,pin,del);box.appendChild(row);
 });
}
window.renderSavedPeopleList=renderSavedPeopleList;
function resetPersonFields(){
 calendar='solar';selectedGender='';
 for(const id of ['year','month','day','hour','minute','koreanFullName','nickname'])$(id).value='';
 for(const id of ['leap','unknownTime','useNameAnalysis'])$(id).checked=false;
 $('hour').disabled=false;$('minute').disabled=false;
 $('solarBtn').classList.add('active');$('lunarBtn').classList.remove('active');$('leapWrap').classList.add('hide');
 $('maleBtn').classList.remove('active');$('femaleBtn').classList.remove('active');
 selectedNameHanja=[];selectedNameMeanings=[];$('hanjaPicker').innerHTML='';
 updateNameAnalysisState();setSelectedHanja();setWizardStep(1);
 const hint=$('birthStep').querySelector('.savedProfileHint');if(hint)hint.remove();
}
$('newPersonBtn').onclick=()=>{resetPersonFields();$('birthStep').scrollIntoView({behavior:'smooth',block:'start'})};
document.querySelectorAll('.character').forEach(card=>card.addEventListener('click',renderSavedPeopleList));
const validateStep=window.validateWizardStep;
window.validateWizardStep=function(step){
 if(Number(step)===3&&!($('koreanFullName').value.trim()||$('nickname').value.trim()))
  throw Error('자동 저장을 위해 이름이나 별명을 입력해주세요.');
 return validateStep(step);
};
renderSavedPeopleList();

function renderCompatForm(){
 const box=$('compatPerson');if(!box)return;
 const ownName=($('koreanFullName').value||$('nickname').value||'첫 번째 사람').trim();
 const ownKey=personKey({koreanFullName:ownName,calendar:calendar,y:Number($('year').value),m:Number($('month').value),d:Number($('day').value),leap:$('leap').checked});
 const saved=readSavedProfiles().filter(p=>personKey(p)!==ownKey);
 box.innerHTML='<h4>두 번째 사람의 사주 정보</h4>'+
  '<label class="field"><span>저장된 사람 불러오기</span><select id="compatSavedSelect"><option value="">직접 입력</option>'+
  saved.map((p,i)=>'<option value="'+i+'">'+esc(savedPersonName(p))+' · '+p.y+'.'+p.m+'.'+p.d+'</option>').join('')+
  '</select></label>'+
  '<label class="field"><span>이름 (필수)</span><input id="compatName" maxlength="20" placeholder="상대방 이름"></label>'+
  '<div class="field"><span>생년월일</span><div class="compatGrid"><input id="compatYear" inputmode="numeric" placeholder="연도"><input id="compatMonth" inputmode="numeric" placeholder="월"><input id="compatDay" inputmode="numeric" placeholder="일"></div></div>'+
  '<div class="field"><span>양력/음력</span><select id="compatCalendar"><option value="solar">양력</option><option value="lunar">음력</option></select><label class="check"><input id="compatLeap" type="checkbox"> 음력 윤달</label></div>'+
  '<div class="field"><span>태어난 시각 (선택)</span><div class="compatGrid"><input id="compatHour" inputmode="numeric" placeholder="시"><input id="compatMinute" inputmode="numeric" placeholder="분"><span class="compatSmall">모르면 비워두세요.</span></div></div>'+
  '<p class="compatSmall">두 사람의 기본 사주(일주·오행)를 비교합니다. 생년월일 외의 정보는 필수가 아닙니다.</p>';
 $('compatSavedSelect').onchange=()=>{
  const idx=$('compatSavedSelect').value;if(idx==='')return;
  const p=saved[Number(idx)];if(!p)return;
  $('compatName').value=savedPersonName(p);
  for(const [id,value] of [['compatYear',p.y],['compatMonth',p.m],['compatDay',p.d],['compatHour',p.unknown?'':p.h],['compatMinute',p.unknown?'':p.mi]])$(id).value=value??'';
  $('compatCalendar').value=p.calendar||'solar';$('compatLeap').checked=!!p.leap;
 };
}
window.renderCompatForm=renderCompatForm;
function readCompatPerson(){
 const p={
  koreanFullName:$('compatName').value.trim(),nickname:'',
  y:Number($('compatYear').value),m:Number($('compatMonth').value),d:Number($('compatDay').value),
  calendar:$('compatCalendar').value,leap:$('compatLeap').checked,
  unknown:!$('compatHour').value.trim(),h:$('compatHour').value.trim()?Number($('compatHour').value):null,
  mi:$('compatHour').value.trim()?Number($('compatMinute').value||0):null,
  gender:'',useNameAnalysis:false
 };
 if(!p.koreanFullName)throw Error('궁합을 볼 두 번째 사람의 이름을 입력해주세요.');
 validate(p.y,p.m,p.d,p.unknown?12:p.h,p.unknown?0:p.mi);
 if(p.calendar==='lunar')validLunarDate(p.y,p.m,p.d,p.unknown?12:p.h,p.unknown?0:p.mi,p.leap);
 return p;
}
window.renderCompatibility=function(y,m,d,h,mi,unknown){
 const other=readCompatPerson();
 const firstName=($('koreanFullName').value.trim()||$('nickname').value.trim()||'첫 번째 사람');
 const selfEc=lunarFor(y,m,d,h,mi).getEightChar();
 const otherEc=profileLunar(other).getEightChar();
 const selfStem=selfEc.getDay()[0],otherStem=otherEc.getDay()[0];
 const selfP=[selfEc.getYear(),selfEc.getMonth(),selfEc.getDay(),unknown?null:selfEc.getTime()];
 const otherP=[otherEc.getYear(),otherEc.getMonth(),otherEc.getDay(),other.unknown?null:otherEc.getTime()];
 const selfElements=countElements(selfP),otherElements=countElements(otherP);
 const s=stemMeta[selfStem]||['-','-',''],o=stemMeta[otherStem]||['-','-',''];
 const common=Object.keys(selfElements).filter(k=>selfElements[k]&&otherElements[k]);
 const overlap=common.length?'두 분 모두 사주에 '+common.join('·')+' 기운이 나타납니다.':'두 분의 오행 분포가 서로 다르게 나타납니다.';
 const difference=s[0]===o[0]?'일간의 오행이 같아 비슷한 방식으로 상황을 받아들일 수 있습니다.':'일간의 오행이 달라 생각과 반응의 차이를 이해하는 대화가 중요합니다.';
 const box=$('compatResult');
 box.innerHTML='<h3>두 사람의 기본 사주 비교</h3><div class="compatCards">'+
  [['첫 번째',firstName,selfEc,s,selfElements],['두 번째',other.koreanFullName,otherEc,o,otherElements]].map(v=>
   '<article><span>'+v[0]+'</span><b>'+esc(v[1])+'</b><div>일주 '+esc(gzKo(v[2].getDay()))+'</div><div>일간 '+esc(v[3][0])+'</div><small>목 '+v[4].목+' · 화 '+v[4].화+' · 토 '+v[4].토+' · 금 '+v[4].금+' · 수 '+v[4].수+'</small></article>').join('')+
  '</div><p>'+esc(overlap)+'</p><p>'+esc(difference)+'</p><p class="compatSmall">궁합은 관계의 성패나 미래를 확정하는 판정이 아니라 서로를 이해하기 위한 참고 콘텐츠입니다.</p>';
 $('resultTitle').textContent=firstName+'님과 '+other.koreanFullName+'님의 궁합';
 $('modeLabel').textContent='루미 · 두 사람의 사주';
 setQuickTake([overlap,difference,'서로의 다른 부분을 대화로 확인해보세요.'],'오늘 상대에게 마음을 전할 말 한 가지를 골라보세요.');
 // Newly entered partners are eligible for the same five-person auto-save.
 const known=readSavedProfiles().find(p=>personKey(p)===personKey(other));
 if(!known)window.saveUserProfileData(other,false);
};
})();