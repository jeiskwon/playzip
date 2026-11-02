// Compact, image-first Kakao result cards for the PLAYZIP saju readers.
// The URL carries only a short, non-sensitive summary; it never includes birth data.
(function (root) {
  'use strict';
  var BASE = new URL('./', location.href).href;
  var READERS = ['lumi', 'nova', 'jeong'];
  function compact(text, max) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
  }
  function makeCard(input) {
    if (!input || READERS.indexOf(input.reader) < 0) {
      throw new Error('Unsupported 운명코드 saju reader');
    }
    var lines = (Array.isArray(input.lines) ? input.lines : []).map(function (x) {
      return String(x || '');
    }).filter(function (x) { return x.trim().length > 0; }).slice(0, 3);
    while (lines.length < 3) lines.push('운명코드에서 오늘의 운세를 확인해보세요.');
    var title = compact(input.title || '운명코드 오늘의 운세', 32);
    var description = compact(input.description || lines[0], 90);
    var resultUrl = '';
    // Keep the actual Kakao feed link short while retaining three result highlights.
    [20, 16, 14, 12, 10, 8].some(function (limit) {
      var data = {
        v: 1,
        reader: input.reader,
        title: compact(title, Math.min(32, limit + 8)),
        lines: lines.map(function (line) { return compact(line, limit); }),
        action: compact(input.action || '오늘 나에게 필요한 한 가지를 실천해보세요.', limit),
        detail: ''
      };
      var payload = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      resultUrl = BASE + 'saju_v2.html#s=' + encodeURIComponent(payload);
      return resultUrl.length <= 460;
    });
    if (resultUrl.length > 460) throw new Error('Saju share link exceeds size limit');
    return {
      title: title,
      description: description,
      url: resultUrl,
      imageUrl: 'https://jeiskwon.github.io/playzip/share-art/saju/' + input.reader + '-v2.jpg'
    };
  }
  root.playzipMakeSajuShareCard = makeCard;
})(window);
