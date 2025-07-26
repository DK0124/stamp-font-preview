(function() {
  // 檢查是否已經掛載
  if (window._STAMP_WIDGET_LOADED) return;
  window._STAMP_WIDGET_LOADED = true;

  // 樣式
  var css = `
#stamp-preview-root * { box-sizing: border-box; }
#stamp-preview-root .stamp-preview-system {
  width: 100%; max-width: 600px; margin: 20px auto; padding: 20px;
  background: #fff; border-radius: 10px; box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft JhengHei", Arial, sans-serif;
}
#stamp-preview-root .preview-header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; margin-bottom: 25px; }
#stamp-preview-root .preview-header h2 { color: #333; font-size: 24px; margin-bottom: 8px; }
#stamp-preview-root .preview-header p { color: #666; font-size: 14px; }
#stamp-preview-root .preview-container {
  background: #f8f9fa; border-radius: 10px; padding: 40px; margin-bottom: 30px;
  text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center; position: relative;
}
#stamp-preview-root .stamp-display { position: relative; display: inline-flex; align-items: center; justify-content: center; background: white; transition: all 0.3s ease; }
#stamp-preview-root .stamp-display.方形 { width: 200px; height: 200px; border: 5px solid #dc3545; border-radius: 0; }
#stamp-preview-root .stamp-display.橢圓形 { width: 240px; height: 180px; border: 5px solid #dc3545; border-radius: 50%; }
#stamp-preview-root .stamp-display.長方形 { width: 250px; height: 150px; border: 5px solid #dc3545; border-radius: 0; }
#stamp-preview-root .stamp-text { font-size: 48px; font-weight: bold; color: #dc3545; position: relative; z-index: 2; line-height: 1.2; transition: all 0.3s ease; }
#stamp-preview-root .stamp-text.楷書 { font-family: KaiTi, "標楷體", "楷體", serif; }
#stamp-preview-root .stamp-text.隸書 { font-family: "隸書", LiSu, FangSong, serif; font-weight: normal; }
#stamp-preview-root .stamp-text.篆書 { font-family: "篆書", SimSun, "宋體", serif; letter-spacing: 2px; }
#stamp-preview-root .stamp-pattern { position: absolute; font-size: 24px; opacity: 0.3; z-index: 1; }
#stamp-preview-root .stamp-pattern.糖果 { top: 10px; right: 10px; }
#stamp-preview-root .stamp-pattern.愛心 { bottom: 10px; left: 50%; transform: translateX(-50%); }
#stamp-preview-root .stamp-pattern.小花 { top: 50%; right: 15px; transform: translateY(-50%); }
#stamp-preview-root .control-panel { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
#stamp-preview-root .control-section { margin-bottom: 20px; }
#stamp-preview-root .control-section:last-child { margin-bottom: 0; }
#stamp-preview-root .control-label { display: block; font-weight: bold; color: #333; margin-bottom: 10px; font-size: 14px; }
#stamp-preview-root .control-input, #stamp-preview-root .control-select {
  width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px;
  background-color: #fff; transition: border-color 0.3s ease;
}
#stamp-preview-root .control-input:focus, #stamp-preview-root .control-select:focus {
  outline: none; border-color: #80bdff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}
#stamp-preview-root .info-text {
  background: #e7f3ff; border-left: 4px solid #2196F3;
  padding: 12px 15px; margin-bottom: 20px; font-size: 14px; color: #0c5fb4; border-radius: 0 5px 5px 0;
}
@media (max-width: 480px) {
  #stamp-preview-root .stamp-preview-system { padding: 15px; }
  #stamp-preview-root .preview-container { padding: 20px; }
  #stamp-preview-root .stamp-display { transform: scale(0.8); }
  #stamp-preview-root .stamp-text { font-size: 36px; }
}
  `;
  var styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  // Widget HTML
  var root = document.getElementById('stamp-preview-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'stamp-preview-root';
    document.body.appendChild(root);
  }
  root.innerHTML = `
    <div class="stamp-preview-system">
      <div class="preview-header">
        <h2>🎯 印章客製化預覽</h2>
        <p>即時預覽您的印章效果，並同步到商品選項</p>
      </div>
      <div class="info-text">
        💡 提示：在下方輸入您想要的內容，預覽會即時更新，並且每次操作都會即時同步到商品頁面欄位。
      </div>
      <div class="preview-container">
        <div class="stamp-display 方形" id="stampDisplay">
          <span class="stamp-text 楷書" id="stampText">範例文字</span>
          <span class="stamp-pattern 糖果" id="stampPattern">🍬</span>
        </div>
      </div>
      <div class="control-panel">
        <div class="control-section">
          <label class="control-label">文字內容（最多6字）</label>
          <input type="text" class="control-input" id="textInput" placeholder="請輸入印章文字" maxlength="6" value="範例文字">
        </div>
        <div class="control-section">
          <label class="control-label">字體</label>
          <select class="control-select" id="fontSelect">
            <option value="楷書">楷書</option>
            <option value="隸書">隸書</option>
            <option value="篆書">篆書</option>
          </select>
        </div>
        <div class="control-section">
          <label class="control-label">形狀</label>
          <select class="control-select" id="shapeSelect">
            <option value="方形">方形</option>
            <option value="橢圓形">橢圓形</option>
            <option value="長方形">長方形</option>
          </select>
        </div>
        <div class="control-section">
          <label class="control-label">圖案</label>
          <select class="control-select" id="patternSelect">
            <option value="糖果">糖果</option>
            <option value="愛心">愛心</option>
            <option value="小花">小花</option>
          </select>
        </div>
      </div>
    </div>
  `;

  // 找label select
  function findBVShopSelect(labelText) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === labelText) {
        var select = labels[i].parentElement.querySelector('select');
        if (select) return select;
      }
    }
    return null;
  }

  // 預覽更新
  function updatePreview() {
    var text = root.querySelector('#textInput').value || '範例文字';
    var font = root.querySelector('#fontSelect').value;
    var shape = root.querySelector('#shapeSelect').value;
    var pattern = root.querySelector('#patternSelect').value;
    root.querySelector('#stampText').textContent = text;
    root.querySelector('#stampText').className = 'stamp-text ' + font;
    root.querySelector('#stampDisplay').className = 'stamp-display ' + shape;
    root.querySelector('#stampPattern').className = 'stamp-pattern ' + pattern;
    var patternIcons = { '糖果': '🍬', '愛心': '❤️', '小花': '🌸' };
    root.querySelector('#stampPattern').textContent = patternIcons[pattern] || '';
  }

  // 自動同步商品頁
  function autoSync() {
    try {
      var text = root.querySelector('#textInput').value;
      var font = root.querySelector('#fontSelect').value;
      var shape = root.querySelector('#shapeSelect').value;
      var pattern = root.querySelector('#patternSelect').value;
      var bvTextInput = document.querySelector('input[placeholder="輸入六字內"]');
      if (bvTextInput) {
        bvTextInput.value = text;
        bvTextInput.dispatchEvent(new Event('input', { bubbles: true }));
        bvTextInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var bvFontSelect = findBVShopSelect('字體');
      if (bvFontSelect) {
        bvFontSelect.value = font;
        bvFontSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var bvShapeSelect = findBVShopSelect('形狀');
      if (bvShapeSelect) {
        bvShapeSelect.value = shape;
        bvShapeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var bvPatternSelect = findBVShopSelect('圖案');
      if (bvPatternSelect) {
        bvPatternSelect.value = pattern;
        bvPatternSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (error) { }
  }

  // 綁定
  function bindAllControls() {
    root.querySelector('#textInput').addEventListener('input', function () {
      updatePreview();
      autoSync();
    });
    root.querySelector('#fontSelect').addEventListener('change', function () {
      updatePreview();
      autoSync();
    });
    root.querySelector('#shapeSelect').addEventListener('change', function () {
      updatePreview();
      autoSync();
    });
    root.querySelector('#patternSelect').addEventListener('change', function () {
      updatePreview();
      autoSync();
    });
  }

  // 初次進入同步商品值
  function syncFromProductPage() {
    var bvTextInput = document.querySelector('input[placeholder="輸入六字內"]');
    if (bvTextInput && bvTextInput.value) root.querySelector('#textInput').value = bvTextInput.value;
    var bvFontSelect = findBVShopSelect('字體');
    if (bvFontSelect && bvFontSelect.value) root.querySelector('#fontSelect').value = bvFontSelect.value;
    var bvShapeSelect = findBVShopSelect('形狀');
    if (bvShapeSelect && bvShapeSelect.value) root.querySelector('#shapeSelect').value = bvShapeSelect.value;
    var bvPatternSelect = findBVShopSelect('圖案');
    if (bvPatternSelect && bvPatternSelect.value) root.querySelector('#patternSelect').value = bvPatternSelect.value;
    updatePreview();
  }

  // 初始化
  bindAllControls();
  syncFromProductPage();

  // 保險用動態偵測
  setInterval(function () {
    if (document.querySelector('input[placeholder="輸入六字內"]')) {
      syncFromProductPage();
    }
  }, 5000);

})();
