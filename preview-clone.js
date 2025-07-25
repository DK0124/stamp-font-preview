(function(){
  // 來源 selector
  var srcSelector = '#stamp-preview-root .preview-container';
  // 目標區塊 id
  var destId = 'stamp-preview-copy';

  function clonePreviewContainer() {
    var src = document.querySelector(srcSelector);
    var dest = document.getElementById(destId);
    if (src && dest) {
      // 完整 clone 範本節點
      // 這樣 class、內容、內部所有屬性都一樣
      dest.innerHTML = '';
      var clone = src.cloneNode(true);  // true = 連內容全部複製
      // 移除 id，避免多個元素有同 id（因為不能有重複 id）
      clone.querySelectorAll('[id]').forEach(function(el){
        el.removeAttribute('id');
      });
      // 把 clone 節點塞進去
      dest.appendChild(clone);
      // 設定 className 保持樣式
      dest.className = src.className;
    }
  }

  // 初始化複製一次
  clonePreviewContainer();

  // 主元件有互動時也同步
  ['input', 'change'].forEach(function(evt){
    ['#textInput','#fontSelect','#shapeSelect','#patternSelect'].forEach(function(sel){
      var el = document.querySelector('#stamp-preview-root ' + sel);
      if (el) el.addEventListener(evt, clonePreviewContainer);
    });
  });

  // 定時保險同步（動態渲染也OK）
  setInterval(clonePreviewContainer, 500);
})();
