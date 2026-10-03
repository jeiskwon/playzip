/* Bundled, offline character art only. KST schedules and artwork come from the bundled character catalog. */
(function(global){
  'use strict';
  const schedules=(global.PlayzipCharacterThemeCatalog||{}).schedules||[];
  function monthDay(date){return new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit'}).format(date).split('/').join('-');}
  function select(type,base,date,entries){
    const day=monthDay(date);
    for(const entry of entries){
      if(!entry.enabled || !/^\d{2}-\d{2}$/.test(entry.start) || !/^\d{2}-\d{2}$/.test(entry.end))continue;
      const active=entry.start<=entry.end ? day>=entry.start&&day<=entry.end : day>=entry.start||day<=entry.end;
      const art=entry.art&&entry.art[type];
      if(active&&typeof art==='string'&&/^\.\.\/characters\/nabti-a\/themes\/[a-z0-9-]+\/[A-Z]{4}\.webp$/.test(art))return art;
    }
    return base;
  }
  function current(date){
    const day=monthDay(date||new Date());
    return schedules.find(e=>e.enabled&&(e.start<=e.end ? day>=e.start&&day<=e.end : day>=e.start||day<=e.end))||null;
  }
  function asset(path){
    return global.PlayzipCharacterAssetRoot && path.startsWith('../characters/')
      ? global.PlayzipCharacterAssetRoot+path.slice(3) : path;
  }
  global.PlayzipCharacters={resolve:(type,base)=>asset(select(type,base,new Date(),schedules)),select,monthDay,current,asset};
})(typeof window==='undefined'?globalThis:window);
