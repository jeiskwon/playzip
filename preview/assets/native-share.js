// Native bridge only: no remote JavaScript is needed to render or share app content.
window.Kakao = {
 init: function(){}, isInitialized: function(){return true;},
 Share: { sendDefault: function(o){
  var c=o.content||{},l=c.link||{};
  if(!window.AndroidPlayzip) throw new Error('Native sharing unavailable');
  AndroidPlayzip.shareResultToKakao(String(c.title||'PLAYZIP'),String(c.description||''),String(l.mobileWebUrl||l.webUrl||'https://jeiskwon.github.io/playzip/'),String(c.imageUrl||''));
 }}
};
