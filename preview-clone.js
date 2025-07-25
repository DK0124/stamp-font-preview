// preview-clone.js
(function(){
  var srcSelector = '#stamp-preview-root .preview-container';
  var destId = 'stamp-preview-copy';

  function syncPreviewCopy() {
    var src = document.querySelector(srcSelector);
    var dest = document.getElementById(destId);
    if (src && dest) {
      dest.innerHTML = src.innerHTML;
      dest.className = src.className;
    }
  }

  // 初始同步一次
  syncPreviewCopy();

  // 主控件操作時同步
  ['input', 'change'].forEach(function(evt){
    ['#textInput','#fontSelect','#shapeSelect','#patternSelect'].forEach(function(sel){
      var el = document.querySelector('#stamp-preview-root ' + sel);
      if (el) el.addEventListener(evt, syncPreviewCopy);
    });
  });

  // 保險用，定時同步
  setInterval(syncPreviewCopy, 500);
})();
