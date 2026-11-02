/* 운명코드 사주 기반 오늘의 운세 공통 계산 엔진.
 * 계산은 앱에 포함된 lunar.js의 절기 기준 사주팔자를 사용한다.
 * 세 캐릭터는 동일한 계산 사실을 공유하며 해설 관점만 달라진다.
 * 오행 단순 계수나 명리 해석으로 사건 발생을 예측하거나 점수를 만들지 않는다.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.UnmyeongDailySaju=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const GAN='甲乙丙丁戊己庚辛壬癸', ZHI='子丑寅卯辰巳午未申酉戌亥';
 const ELEMENTS=['목','화','토','금','수'];
 const PRODUCES={목:'화',화:'토',토:'금',금:'수',수:'목'};
 const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
 const BRANCH_ELEMENT={子:'수',丑:'토',寅:'목',卯:'목',辰:'토',巳:'화',午:'화',未:'토',申:'금',酉:'금',戌:'토',亥:'수'};
 const CLASH=['子午','丑未','寅申','卯酉','辰戌','巳亥'];
 const COMBINE=['子丑','寅亥','卯戌','辰酉','巳申','午未'];
 const THEMES={
  비견:['자기 기준과 주변의 기대','내 생각을 분명히 하되 타인의 의견도 확인해보세요.'],
  겁재:['경쟁과 협력의 균형','서두른 비교보다 함께 할 수 있는 부분을 찾아보세요.'],
  식신:['꾸준한 표현과 일상의 성과','작게 시작한 일을 차분하게 마무리해보세요.'],
  상관:['변화 욕구와 표현 방식','솔직한 말도 상대가 듣기 편한 방식으로 전해보세요.'],
  편재:['선택의 폭과 자원 관리','새로운 제안은 조건을 확인한 뒤 결정해보세요.'],
  정재:['일정과 재정의 안정적 관리','지출과 약속을 하나씩 점검해보세요.'],
  편관:['외부 요구와 책임의 압력','급한 일과 중요한 일을 구분해보세요.'],
  정관:['역할과 원칙의 정리','약속과 기준을 확인하면 판단이 더 명확해집니다.'],
  편인:['새로운 관점의 탐색','당장 결론 내기보다 필요한 정보를 더 찾아보세요.'],
  정인:['배움과 회복을 위한 정리','이미 알고 있는 내용을 복습하고 정리해보세요.']
 };
 function assertPillar(p,label){
  if(typeof p!=='string'||p.length!==2||!GAN.includes(p[0])||!ZHI.includes(p[1]))throw Error(label+' 간지 계산 결과를 확인할 수 없습니다.');
  return p;
 }
 function elementOfGan(gan){const i=GAN.indexOf(gan);if(i<0)throw Error('알 수 없는 천간: '+gan);return ELEMENTS[Math.floor(i/2)]}
 function tenGod(dayStem,otherStem){
  const d=elementOfGan(dayStem),o=elementOfGan(otherStem);
  const same=(GAN.indexOf(dayStem)%2)===(GAN.indexOf(otherStem)%2);
  if(d===o)return same?'비견':'겁재';
  if(PRODUCES[d]===o)return same?'식신':'상관';
  if(CONTROLS[d]===o)return same?'편재':'정재';
  if(CONTROLS[o]===d)return same?'편관':'정관';
  if(PRODUCES[o]===d)return same?'편인':'정인';
  throw Error('십성 계산에 실패했습니다.');
 }
 function branchRelation(a,b){
  if(a===b)return '같음';
  const pair=a+b;
  if(CLASH.some(p=>p===pair||p===b+a))return '충';
  if(COMBINE.some(p=>p===pair||p===b+a))return '합';
  return '일반';
 }
 function kstDateParts(at){
  const date=at instanceof Date?at:new Date(at==null?Date.now():at);
  if(Number.isNaN(date.getTime()))throw Error('날짜가 올바르지 않습니다.');
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const val=(kind)=>Number(parts.find(p=>p.type===kind).value);
  const y=val('year'),m=val('month'),d=val('day');
  return {year:y,month:m,day:d,key:String(y)+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')};
 }
 function todayLunar(SolarCtor,at){
  if(!SolarCtor||typeof SolarCtor.fromYmdHms!=='function')throw Error('만세력 라이브러리가 준비되지 않았습니다.');
  const date=kstDateParts(at);
  return {date,lunar:SolarCtor.fromYmdHms(date.year,date.month,date.day,12,0,0).getLunar()};
 }
 function calculate(input){
  if(!input||!input.birthLunar||!input.todayLunar)throw Error('출생 사주와 오늘의 일진 정보가 필요합니다.');
  const b=input.birthLunar.getEightChar(),t=input.todayLunar.getEightChar();
  const birth={
   year:assertPillar(b.getYear(),'출생 연주'),month:assertPillar(b.getMonth(),'출생 월주'),
   day:assertPillar(b.getDay(),'출생 일주'),time:input.unknownTime?null:assertPillar(b.getTime(),'출생 시주')
  };
  const today={year:assertPillar(t.getYear(),'오늘 연주'),month:assertPillar(t.getMonth(),'오늘 월주'),day:assertPillar(t.getDay(),'오늘 일주')};
  const dayStem=birth.day[0],todayStem=today.day[0];
  const counts={목:0,화:0,토:0,금:0,수:0};
  [birth.year,birth.month,birth.day,birth.time].filter(Boolean).forEach(p=>{counts[elementOfGan(p[0])]++;counts[BRANCH_ELEMENT[p[1]]]++});
  const result={
   dateKey:input.dateKey||null,
   birth, today, dayMaster:dayStem, dayMasterElement:elementOfGan(dayStem),
   todayElement:elementOfGan(todayStem),todayBranchElement:BRANCH_ELEMENT[today.day[1]],
   dayTenGod:tenGod(dayStem,todayStem),
   monthTenGod:tenGod(dayStem,today.month[0]),yearTenGod:tenGod(dayStem,today.year[0]),
   dayBranchRelation:branchRelation(birth.day[1],today.day[1]),
   elementCounts:counts,hasBirthTime:!input.unknownTime
  };
  return result;
 }
 function formatForReader(core,reader){
  if(!core||!THEMES[core.dayTenGod])throw Error('운세 계산 결과가 필요합니다.');
  const theme=THEMES[core.dayTenGod],relationship=core.dayBranchRelation;
  const note=relationship==='충'?'일지와 오늘 지지에 충이 있어, 명리 해석에서는 관계와 일정의 변화를 살피는 날로 읽습니다.':
   relationship==='합'?'일지와 오늘 지지에 합이 있어, 명리 해석에서는 협업과 연결의 흐름을 살펴봅니다.':
   relationship==='같음'?'일지와 오늘 지지가 같아, 자신의 익숙한 반응을 돌아보는 주제로 읽습니다.':
   '일지와 오늘 지지에 직접적인 육합·육충 관계는 나타나지 않습니다.';
  const fact='일간 '+core.dayMaster+'과 오늘 일진 '+core.today.day+'의 관계는 '+core.dayTenGod+'입니다.';
  const shared='오늘은 '+theme[0]+'을(를) 살펴보는 흐름으로 읽습니다.';
  const choices={
   lumi:{name:'루미',headline:'오늘의 운세 · 마음과 관계',sections:[
    {title:'오늘의 종합운',text:shared+' '+theme[1]},
    {title:'오늘의 관계운',text:note+' 대화에서는 상대의 실제 반응을 확인해보세요.'},
    {title:'오늘의 행운 포인트',text:'작은 실천: '+theme[1]}
   ]},
   nova:{name:'노바',headline:'오늘의 운세 · 일과 선택',sections:[
    {title:'오늘의 종합운',text:shared+' '+theme[1]},
    {title:'오늘의 직업운',text:'오늘의 '+core.dayTenGod+' 흐름을 역할과 일정에 연결해 살펴보세요. '+theme[1]},
    {title:'오늘의 재물운',text:'재물에 대한 확정적 예측이 아니라 지출과 계약 조건을 점검하는 참고 흐름입니다.'},
    {title:'오늘의 판단',text:theme[1]}
   ]},
   jeong:{name:'정연',headline:'오늘의 운세 · 명리 해석',sections:[
    {title:'오늘의 종합운',text:fact+' '+shared},
    {title:'십성과 일진',text:'오늘 '+core.today.day+'의 일간 대비 십성은 '+core.dayTenGod+', 이번 달 천간은 '+core.monthTenGod+', 올해 천간은 '+core.yearTenGod+'입니다.'},
    {title:'일지 관계',text:note},
    {title:'오늘의 조언',text:theme[1]}
   ]}
  };
  if(!Object.prototype.hasOwnProperty.call(choices,reader))throw Error('지원하지 않는 해설자입니다.');
  const chosen=choices[reader];
  return {reader,name:chosen.name,dateKey:core.dateKey,headline:chosen.headline,
   summary:shared,sections:chosen.sections,advice:theme[1],
   evidence:{birth:core.birth,today:core.today,dayMaster:core.dayMaster,
    tenGod:core.dayTenGod,monthTenGod:core.monthTenGod,yearTenGod:core.yearTenGod,
    dayBranchRelation:relationship,hasBirthTime:core.hasBirthTime}};
 }
 return {kstDateParts,todayLunar,calculate,formatForReader,tenGod,branchRelation,elementOfGan};
});
