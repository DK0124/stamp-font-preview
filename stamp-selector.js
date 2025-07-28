// stamp-selector.js
// 印章選擇器 Widget v1.0
// 確保在各種載入情況下都能正常執行

(function() {
    'use strict';
    
    console.log('[Stamp Selector] Script loaded');
    
    // 主要初始化函數
    function initStampSelector() {
        console.log('[Stamp Selector] Initializing...');
        
        const container = document.getElementById('stamp-selector-root');
        if (!container) {
            console.error('[Stamp Selector] Container #stamp-selector-root not found');
            return false;
        }
        
        // 防止重複初始化
        if (container.hasAttribute('data-initialized')) {
            console.log('[Stamp Selector] Already initialized');
            return false;
        }
        
        container.setAttribute('data-initialized', 'true');
        console.log('[Stamp Selector] Container found, building UI...');
        
        // 注入樣式
        if (!document.getElementById('stamp-selector-styles')) {
            const styles = `
                #stamp-selector-root {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
                    background: #f5f6fa;
                    padding: 20px;
                    border-radius: 12px;
                    min-height: 500px;
                }
                
                #stamp-selector-root * {
                    box-sizing: border-box;
                }
                
                #stamp-selector-root .preview-section {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 20px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                }
                
                #stamp-selector-root .stamp-preview {
                    width: 150px;
                    height: 150px;
                    border: 4px solid #e74c3c;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    background: white;
                    font-size: 36px;
                    color: #e74c3c;
                    font-weight: bold;
                    font-family: KaiTi, "標楷體", serif;
                }
                
                #stamp-selector-root .controls {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                }
                
                #stamp-selector-root input {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    margin: 10px 0;
                }
                
                #stamp-selector-root .font-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 10px;
                    margin: 20px 0;
                }
                
                #stamp-selector-root .font-card {
                    background: #f8f9fa;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                #stamp-selector-root .font-card:hover {
                    border-color: #3498db;
                    transform: translateY(-2px);
                }
                
                #stamp-selector-root .font-card.selected {
                    background: #e3f2fd;
                    border-color: #3498db;
                }
                
                #stamp-selector-root .color-options {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                #stamp-selector-root .color-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 3px solid transparent;
                    transition: all 0.3s;
                }
                
                #stamp-selector-root .color-box.selected {
                    border-color: #333;
                    transform: scale(1.1);
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.id = 'stamp-selector-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
            console.log('[Stamp Selector] Styles injected');
        }
        
        // 創建 HTML
        container.innerHTML = `
            <div class="preview-section">
                <h2 style="text-align: center; margin-bottom: 20px;">印章預覽</h2>
                <div class="stamp-preview" id="stamp-preview">
                    印章
                </div>
            </div>
            
            <div class="controls">
                <h3>印章文字</h3>
                <input type="text" id="stamp-text-input" placeholder="輸入印章文字" value="印章" maxlength="6">
                
                <h3 style="margin-top: 20px;">選擇字體</h3>
                <div class="font-options">
                    <div class="font-card selected" data-font="KaiTi" style="font-family: KaiTi, '標楷體', serif;">
                        <div style="font-size: 24px; margin-bottom: 5px;">印章</div>
                        <small>楷書</small>
                    </div>
                    <div class="font-card" data-font="SimSun" style="font-family: SimSun, '宋體', serif;">
                        <div style="font-size: 24px; margin-bottom: 5px;">印章</div>
                        <small>宋體</small>
                    </div>
                    <div class="font-card" data-font="SimHei" style="font-family: SimHei, '微軟正黑體', sans-serif;">
                        <div style="font-size: 24px; margin-bottom: 5px;">印章</div>
                        <small>黑體</small>
                    </div>
                </div>
                
                <h3 style="margin-top: 20px;">選擇顏色</h3>
                <div class="color-options">
                    <div class="color-box selected" style="background: #e74c3c;" data-color="#e74c3c"></div>
                    <div class="color-box" style="background: #3498db;" data-color="#3498db"></div>
                    <div class="color-box" style="background: #27ae60;" data-color="#27ae60"></div>
                    <div class="color-box" style="background: #2c3e50;" data-color="#2c3e50"></div>
                </div>
            </div>
        `;
        
        console.log('[Stamp Selector] HTML created');
        
        // 綁定事件
        const preview = document.getElementById('stamp-preview');
        const textInput = document.getElementById('stamp-text-input');
        
        if (!preview || !textInput) {
            console.error('[Stamp Selector] Required elements not found');
            return false;
        }
        
        // 文字輸入事件
        textInput.addEventListener('input', function(e) {
            const text = e.target.value || '印章';
            preview.textContent = text;
            
            // 更新所有字體卡片的預覽文字
            container.querySelectorAll('.font-card > div').forEach(div => {
                div.textContent = text;
            });
        });
        
        // 字體選擇事件
        container.querySelectorAll('.font-card').forEach(card => {
            card.addEventListener('click', function() {
                container.querySelectorAll('.font-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                const font = this.dataset.font;
                preview.style.fontFamily = this.style.fontFamily;
                console.log('[Stamp Selector] Font changed to:', font);
            });
        });
        
        // 顏色選擇事件
        container.querySelectorAll('.color-box').forEach(box => {
            box.addEventListener('click', function() {
                container.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                const color = this.dataset.color;
                preview.style.color = color;
                preview.style.borderColor = color;
                console.log('[Stamp Selector] Color changed to:', color);
            });
        });
        
        console.log('[Stamp Selector] Initialization complete!');
        return true;
    }
    
    // 嘗試多種初始化時機
    function tryInit() {
        if (initStampSelector()) {
            return;
        }
        
        // 如果失敗，稍後再試
        setTimeout(tryInit, 100);
    }
    
    // 1. 如果 DOM 已經載入完成
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[Stamp Selector] DOM ready, init immediately');
        tryInit();
    } 
    // 2. 等待 DOMContentLoaded
    else {
        console.log('[Stamp Selector] Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', tryInit);
    }
    
    // 3. 備用方案：window.onload
    window.addEventListener('load', function() {
        console.log('[Stamp Selector] Window loaded, ensuring init');
        tryInit();
    });
    
    // 4. 暴露手動初始化方法
    window.initStampSelector = initStampSelector;
    
})();

// 立即執行檢查
console.log('[Stamp Selector] Script execution complete');
