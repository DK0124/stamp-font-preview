(function(){
  // 全域樣式，只要出現在 .preview-container 裡都吃得到
  var css = `
.preview-container {
  background: #f8f9fa; border-radius: 10px; padding: 40px; margin-bottom: 30px;
  text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center; position: relative;
}
.stamp-display { position: relative; display: inline-flex; align-items: center; justify-content: center; background: white; transition: all 0.3s ease; }
.stamp-display.方形 { width: 200px; height: 200px; border: 5px solid #dc3545; border-radius: 0; }
.stamp-display.橢圓形 { width: 240px; height: 180px; border: 5px solid #dc3545; border-radius: 50%; }
.stamp-display.長方形 { width: 250px; height: 150px; border: 5px solid #dc3545; border-radius: 0; }
.stamp-text { font-size: 48px; font-weight: bold; color: #dc3545; position: relative; z-index: 2; line-height: 1.2; transition: all 0.3s ease; }
.stamp-text.楷書 { font-family: KaiTi, "標楷體", "楷體", serif; }
.stamp-text.隸書 { font-family: "隸書", LiSu, FangSong, serif; font-weight: normal; }
.stamp-text.篆書 { font-family: "篆書", SimSun, "宋體", serif; letter-spacing: 2px; }
.stamp-pattern { position: absolute; font-size: 24px; opacity: 0.3; z-index: 1; }
.stamp-pattern.糖果 { top: 10px; right: 10px; }
.stamp-pattern.愛心 { bottom: 10px; left: 50%; transform: translateX(-50%); }
.stamp-pattern.小花 { top: 50%; right: 15px; transform: translateY(-50%); }
@media (max-width: 480px) {
  .preview-container { padding: 20px; }
  .stamp-display { transform: scale(0.8); }
  .stamp-text { font-size: 36px; }
}
  `;
  // 只注入一次
  if (!window.__STAMP_PREVIEW_CLONE_CSS) {
    var styleTag = document.createElement('style');
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
    window.__STAMP_PREVIEW_CLONE_CSS = true;
  }

  // 來源 selector
  var srcSelector = '#stamp-preview-root .preview-container';
  var destId = 'stamp-preview-copy';

  function clonePreviewContainer() {
    var src = document.querySelector(srcSelector);
    var dest = document.getElementById(destId);
    if (src && dest) {
      dest.innerHTML = '';
      var clone = src.cloneNode(true);
      clone.querySelectorAll('[id]').forEach(function(el){
        el.removeAttribute('id');
      });
      dest.appendChild(clone);
      dest.className = src.className;
    }
  }

  clonePreviewContainer();

  ['input', 'change'].forEach(function(evt){
    ['#textInput','#fontSelect','#shapeSelect','#patternSelect'].forEach(function(sel){
      var el = document.querySelector('#stamp-preview-root ' + sel);
      if (el) el.addEventListener(evt, clonePreviewContainer);
    });
  });

  setInterval(clonePreviewContainer, 500);
})();
