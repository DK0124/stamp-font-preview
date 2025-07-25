/**
 * 印章字體預覽系統 Widget
 * @author DK0124
 * @version 1.2.1
 * @date 2025-01-26
 * @description 整合印章預覽與自訂字體的完整系統，支援雙向同步，自動載入字體
 */

(function() {
    // 防止重複載入
    if (window._STAMP_FONT_WIDGET_LOADED) return;
    window._STAMP_FONT_WIDGET_LOADED = true;

    // 建立樣式
    const styles = `
        /* 獨立樣式系統 */
        #stamp-custom-font-widget {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
            background: #ffffff;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.1);
            margin: 20px 0;
            position: relative;
            isolation: isolate;
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 標題 */
        #stamp-custom-font-widget .scfw-header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-title {
            font-size: 22px;
            color: #333;
            margin-bottom: 8px;
        }
        
        #stamp-custom-font-widget .scfw-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        /* 控制區 */
        #stamp-custom-font-widget .scfw-controls {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-control-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 15px;
            align-items: end;
        }
        
        #stamp-custom-font-widget .scfw-control {
            display: flex;
            flex-direction: column;
        }
        
        #stamp-custom-font-widget .scfw-label {
            font-size: 14px;
            font-weight: bold;
            color: #555;
            margin-bottom: 8px;
        }
        
        #stamp-custom-font-widget .scfw-input,
        #stamp-custom-font-widget .scfw-select {
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 15px;
            font-family: inherit;
            width: 100%;
            transition: all 0.2s;
        }
        
        #stamp-custom-font-widget .scfw-input:focus,
        #stamp-custom-font-widget .scfw-select:focus {
            outline: none;
            border-color: #80bdff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        
        /* 字體網格 */
        #stamp-custom-font-widget .scfw-font-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            min-height: 200px;
        }
        
        #stamp-custom-font-widget .scfw-font-card {
            background: white;
            border: 3px solid #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-font-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
            border-color: #B5D5B0;
        }
        
        #stamp-custom-font-widget .scfw-font-card.selected {
            border-color: #28a745;
            background: #f0fff4;
        }
        
        #stamp-custom-font-widget .scfw-font-card.selected::after {
            content: '✓';
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            z-index: 10;
        }
        
        /* 印章預覽 */
        #stamp-custom-font-widget .scfw-stamp-preview {
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            background: #fafafa;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-stamp {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        #stamp-custom-font-widget .scfw-stamp.方形 {
            width: 160px;
            height: 160px;
            border: 4px solid #dc3545;
            border-radius: 0;
        }
        
        #stamp-custom-font-widget .scfw-stamp.圓形,
        #stamp-custom-font-widget .scfw-stamp.橢圓形 {
            width: 160px;
            height: 160px;
            border: 4px solid #dc3545;
            border-radius: 50%;
        }
        
        #stamp-custom-font-widget .scfw-stamp.橢圓形 {
            width: 190px;
            height: 150px;
        }
        
        #stamp-custom-font-widget .scfw-stamp.長方形 {
            width: 200px;
            height: 140px;
            border: 4px solid #dc3545;
            border-radius: 0;
        }
        
        #stamp-custom-font-widget .scfw-stamp-text {
            font-size: 40px;
            color: #dc3545;
            font-weight: bold;
            line-height: 1.2;
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-stamp-pattern {
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 20px;
            opacity: 0.4;
        }
        
        /* 字體名稱 */
        #stamp-custom-font-widget .scfw-font-name {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            background: #f0f0f0;
            color: #333;
            border-top: 1px solid #e0e0e0;
        }
        
        /* 載入中 */
        #stamp-custom-font-widget .scfw-loading {
            text-align: center;
            padding: 60px;
            color: #999;
        }
        
        #stamp-custom-font-widget .scfw-font-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            color: #999;
        }
        
        /* 同步狀態 */
        #stamp-custom-font-widget .scfw-sync-status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            display: none;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        /* 載入提示 */
        #stamp-custom-font-widget .scfw-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        
        #stamp-custom-font-widget .scfw-loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #B5D5B0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* 響應式 */
        @media (max-width: 768px) {
            #stamp-custom-font-widget .scfw-control-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-font-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            #stamp-custom-font-widget .scfw-stamp {
                transform: scale(0.85);
            }
        }
    `;

    // 建立 HTML 結構（移除載入按鈕）
    const html = `
        <div id="stamp-custom-font-widget">
            <!-- 同步狀態 -->
            <div class="scfw-sync-status" id="scfw-sync-status">✅ 已同步</div>
            
            <!-- 主容器 -->
            <div class="scfw-header">
                <h2 class="scfw-title">🎯 印章字體即時預覽系統</h2>
                <p class="scfw-subtitle">使用自訂字體，即時預覽並同步到商品選項</p>
            </div>
            
            <!-- 控制區 -->
            <div class="scfw-controls">
                <div class="scfw-control-grid">
                    <div class="scfw-control">
                        <label class="scfw-label">印章文字</label>
                        <input type="text" 
                               class="scfw-input" 
                               id="scfw-text" 
                               placeholder="輸入文字（最多6字）" 
                               maxlength="6" 
                               value="印章預覽">
                    </div>
                    
                    <div class="scfw-control">
                        <label class="scfw-label">印章形狀</label>
                        <select class="scfw-select" id="scfw-shape">
                            <option value="方形">方形</option>
                            <option value="圓形">圓形</option>
                            <option value="橢圓形">橢圓形</option>
                            <option value="長方形">長方形</option>
                        </select>
                    </div>
                    
                    <div class="scfw-control">
                        <label class="scfw-label">裝飾圖案</label>
                        <select class="scfw-select" id="scfw-pattern">
                            <option value="">無</option>
                            <option value="糖果">糖果</option>
                            <option value="愛心">愛心</option>
                            <option value="小花">小花</option>
                        </select>
                    </div>
                    
                    <div class="scfw-control">
                        <label class="scfw-label">文字顏色</label>
                        <select class="scfw-select" id="scfw-color">
                            <option value="#dc3545">朱紅</option>
                            <option value="#000000">黑色</option>
                            <option value="#0066cc">藍色</option>
                            <option value="#28a745">綠色</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- 字體網格 -->
            <div class="scfw-font-grid" id="scfw-font-grid">
                <div class="scfw-loading-overlay">
                    <div class="scfw-loading-spinner"></div>
                </div>
            </div>
        </div>
    `;

    // 注入樣式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 尋找容器並注入 HTML
    const container = document.getElementById('stamp-font-widget-container') || 
                     document.getElementById('stamp-preview-root') ||
                     document.body;
    
    const widgetDiv = document.createElement('div');
    widgetDiv.innerHTML = html;
    container.appendChild(widgetDiv);

    // Widget 主要邏輯
    const StampFontWidget = {
        // 字體清單配置
        availableFonts: [
            { id: 1, name: '粉圓體', filename: '粉圓體全繁體.ttf', displayName: '粉圓體' },
            { id: 2, name: '粒線體不等寬', filename: '粒線體不等寬全繁體.ttf', displayName: '粒線體(不等寬)' },
            { id: 3, name: '粒線體等寬', filename: '粒線體等寬全繁體.ttf', displayName: '粒線體(等寬)' },
            { id: 4, name: '粗線體不等寬', filename: '粗線體不等寬版 全繁體.ttf', displayName: '粗線體(不等寬)' },
            { id: 5, name: '粗線體等寬', filename: '粗線體等寬版 全繁體.ttf', displayName: '粗線體(等寬)' },
            { id: 6, name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf', displayName: '胖西手寫體' },
            { id: 7, name: '辰宇落雁體', filename: '辰宇落雁體 不等寬版全繁體.ttf', displayName: '辰宇落雁體' },
            { id: 8, name: '楷書', filename: '', displayName: '楷書', systemFont: 'KaiTi, "標楷體", serif' },
            { id: 9, name: '隸書', filename: '', displayName: '隸書', systemFont: '"隸書", FangSong, serif' },
            { id: 10, name: '篆書', filename: '', displayName: '篆書', systemFont: 'SimSun, "宋體", serif' }
        ],

        GITHUB_RAW_URL: 'https://raw.githubusercontent.com/DK0124/font-preview-system/main/fonts/',
        
        patterns: {
            '糖果': '🍬',
            '愛心': '❤️',
            '小花': '🌸'
        },

        // 顏色對應表
        colorMap: {
            '朱紅': '#dc3545',
            '黑色': '#000000',
            '藍色': '#0066cc',
            '綠色': '#28a745'
        },

        colorTextMap: {
            '#dc3545': '朱紅',
            '#000000': '黑色',
            '#0066cc': '藍色',
            '#28a745': '綠色'
        },

        currentSelection: {
            text: '印章預覽',
            font: '',
            fontId: null,
            shape: '方形',
            pattern: '',
            color: '#dc3545'
        },

        loadedFonts: {},
        isLoading: false,
        bvShopListeners: [],

        // 初始化
        init: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (!widget) return;

            this.elements = {
                textInput: widget.querySelector('#scfw-text'),
                shapeSelect: widget.querySelector('#scfw-shape'),
                patternSelect: widget.querySelector('#scfw-pattern'),
                colorSelect: widget.querySelector('#scfw-color'),
                fontGrid: widget.querySelector('#scfw-font-grid'),
                syncStatus: document.getElementById('scfw-sync-status')
            };

            this.bindEvents();
            
            // 延遲載入初始值並設定監聽器
            setTimeout(() => {
                this.setupBVShopListeners();
                this.loadFromBVShop();
                // 自動載入所有字體
                this.loadAllFonts();
            }, 500);
        },

        // 設定 BV SHOP 監聽器
        setupBVShopListeners: function() {
            // 清除舊的監聽器
            this.bvShopListeners.forEach(listener => {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            this.bvShopListeners = [];

            // 監聽字體選擇變化
            const fontSelect = this.findBVSelect('字體');
            if (fontSelect) {
                const fontHandler = (e) => {
                    const selectedFont = e.target.value;
                    this.selectFontByName(selectedFont);
                };
                fontSelect.addEventListener('change', fontHandler);
                this.bvShopListeners.push({ element: fontSelect, event: 'change', handler: fontHandler });
            }
            
            // 監聽文字輸入
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput) {
                const textHandler = (e) => {
                    this.elements.textInput.value = e.target.value;
                    this.currentSelection.text = e.target.value;
                    this.updateAllPreviews();
                };
                textInput.addEventListener('input', textHandler);
                this.bvShopListeners.push({ element: textInput, event: 'input', handler: textHandler });
            }
            
            // 監聽形狀選擇
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect) {
                const shapeHandler = (e) => {
                    this.elements.shapeSelect.value = e.target.value;
                    this.currentSelection.shape = e.target.value;
                    this.updateAllPreviews();
                };
                shapeSelect.addEventListener('change', shapeHandler);
                this.bvShopListeners.push({ element: shapeSelect, event: 'change', handler: shapeHandler });
            }
            
            // 監聽圖案選擇
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect) {
                const patternHandler = (e) => {
                    this.elements.patternSelect.value = e.target.value;
                    this.currentSelection.pattern = e.target.value;
                    this.updateAllPreviews();
                };
                patternSelect.addEventListener('change', patternHandler);
                this.bvShopListeners.push({ element: patternSelect, event: 'change', handler: patternHandler });
            }
            
            // 監聽顏色選擇
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect) {
                const colorHandler = (e) => {
                    const selectedColor = e.target.value;
                    const actualColor = this.colorMap[selectedColor] || '#dc3545';
                    this.elements.colorSelect.value = actualColor;
                    this.currentSelection.color = actualColor;
                    this.updateAllPreviews();
                };
                colorSelect.addEventListener('change', colorHandler);
                this.bvShopListeners.push({ element: colorSelect, event: 'change', handler: colorHandler });
            }
        },

        // 根據字體名稱選中卡片
        selectFontByName: function(fontName) {
            const widget = document.getElementById('stamp-custom-font-widget');
            
            // 先清除所有選中狀態
            widget.querySelectorAll('.scfw-font-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 找到對應的字體卡片並選中
            const fontData = this.availableFonts.find(f => f.name === fontName);
            if (fontData) {
                const targetCard = widget.querySelector(`[data-font-name="${fontName}"]`);
                if (targetCard) {
                    targetCard.classList.add('selected');
                    this.currentSelection.font = fontName;
                    this.currentSelection.fontId = fontData.id;
                    
                    // 更新所有預覽
                    this.updateAllPreviews();
                }
            }
        },

        // 載入字體
        loadFont: async function(fontData) {
            if (fontData.systemFont) {
                return true;
            }
            
            if (this.loadedFonts[fontData.id]) {
                return this.loadedFonts[fontData.id];
            }
            
            try {
                const fontUrl = this.GITHUB_RAW_URL + encodeURIComponent(fontData.filename);
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`, 
                    `url(${fontUrl})`
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loadedFonts[fontData.id] = fontFace;
                
                return fontFace;
            } catch (error) {
                console.error(`載入字體失敗 ${fontData.name}:`, error);
                return null;
            }
        },

        // 創建字體卡片
        createFontCard: function(fontData) {
            const card = document.createElement('div');
            card.className = 'scfw-font-card';
            card.dataset.fontId = fontData.id;
            card.dataset.fontName = fontData.name;
            
            card.innerHTML = `
                <div class="scfw-stamp-preview">
                    <div class="scfw-font-loading">載入中...</div>
                </div>
                <div class="scfw-font-name">${fontData.displayName}</div>
            `;
            
            // 載入字體後更新預覽
            this.loadFont(fontData).then((loaded) => {
                if (loaded) {
                    const previewDiv = card.querySelector('.scfw-stamp-preview');
                    previewDiv.innerHTML = `
                        <div class="scfw-stamp ${this.currentSelection.shape}">
                            <span class="scfw-stamp-text" style="
                                font-family: ${fontData.systemFont || `CustomFont${fontData.id}`};
                                color: ${this.currentSelection.color};
                            ">
                                ${this.currentSelection.text || '範例'}
                            </span>
                            <span class="scfw-stamp-pattern">
                                ${this.patterns[this.currentSelection.pattern] || ''}
                            </span>
                        </div>
                    `;
                }
            });
            
            // 點擊事件
            card.addEventListener('click', () => {
                const widget = document.getElementById('stamp-custom-font-widget');
                widget.querySelectorAll('.scfw-font-card').forEach(c => 
                    c.classList.remove('selected')
                );
                
                card.classList.add('selected');
                
                this.currentSelection.font = fontData.name;
                this.currentSelection.fontId = fontData.id;
                
                this.syncToBVShop('font', fontData.name);
            });
            
            return card;
        },

        // 更新所有預覽
        updateAllPreviews: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            widget.querySelectorAll('.scfw-font-card').forEach(card => {
                const fontId = parseInt(card.dataset.fontId);
                const fontData = this.availableFonts.find(f => f.id === fontId);
                
                if (fontData) {
                    const stampEl = card.querySelector('.scfw-stamp');
                    const textEl = card.querySelector('.scfw-stamp-text');
                    const patternEl = card.querySelector('.scfw-stamp-pattern');
                    
                    if (stampEl && textEl && patternEl) {
                        stampEl.className = 'scfw-stamp ' + this.currentSelection.shape;
                        textEl.textContent = this.currentSelection.text || '範例';
                        textEl.style.color = this.currentSelection.color;
                        patternEl.textContent = this.patterns[this.currentSelection.pattern] || '';
                    }
                }
            });
        },

        // 載入所有字體
        loadAllFonts: async function() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.elements.fontGrid.innerHTML = '<div class="scfw-loading-overlay"><div class="scfw-loading-spinner"></div></div>';
            
            // 稍微延遲以顯示載入動畫
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.elements.fontGrid.innerHTML = '';
            
            for (const fontData of this.availableFonts) {
                const card = this.createFontCard(fontData);
                this.elements.fontGrid.appendChild(card);
            }
            
            this.isLoading = false;
            
            // 載入完成後，如果 BV SHOP 已有選擇，同步選中
            setTimeout(() => {
                const fontSelect = this.findBVSelect('字體');
                if (fontSelect && fontSelect.value) {
                    this.selectFontByName(fontSelect.value);
                }
            }, 100);
        },

        // 顯示同步狀態
        showSyncStatus: function() {
            this.elements.syncStatus.style.display = 'block';
            setTimeout(() => {
                this.elements.syncStatus.style.display = 'none';
            }, 2000);
        },

        // 同步到 BV SHOP
        syncToBVShop: function(field, value) {
            try {
                switch(field) {
                    case 'text':
                        const textInput = document.querySelector('input[placeholder="輸入六字內"]');
                        if (textInput) {
                            textInput.value = value;
                            textInput.dispatchEvent(new Event('input', { bubbles: true }));
                            textInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                        
                    case 'font':
                        const fontSelect = this.findBVSelect('字體');
                        if (fontSelect) {
                            let foundOption = false;
                            for (let i = 0; i < fontSelect.options.length; i++) {
                                if (fontSelect.options[i].text === value || 
                                    fontSelect.options[i].value === value) {
                                    fontSelect.selectedIndex = i;
                                    foundOption = true;
                                    break;
                                }
                            }
                            
                            if (foundOption) {
                                fontSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                        break;
                        
                    case 'shape':
                        const shapeSelect = this.findBVSelect('形狀');
                        if (shapeSelect) {
                            shapeSelect.value = value;
                            shapeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                        
                    case 'pattern':
                        const patternSelect = this.findBVSelect('圖案');
                        if (patternSelect) {
                            patternSelect.value = value || '';
                            patternSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                        
                    case 'color':
                        const colorSelect = this.findBVSelect('顏色');
                        if (colorSelect) {
                            const colorText = this.colorTextMap[value] || '朱紅';
                            colorSelect.value = colorText;
                            colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                }
                
                this.showSyncStatus();
            } catch (error) {
                console.error('同步錯誤:', error);
            }
        },

        // 尋找 BV SHOP 選擇器
        findBVSelect: function(labelText) {
            const labels = document.querySelectorAll('label');
            for (let label of labels) {
                if (label.textContent.trim() === labelText) {
                    const select = label.parentElement.querySelector('select');
                    if (select) return select;
                }
            }
            return null;
        },

        // 綁定事件
        bindEvents: function() {
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value;
                this.updateAllPreviews();
                this.syncToBVShop('text', e.target.value);
            });
            
            this.elements.shapeSelect.addEventListener('change', (e) => {
                this.currentSelection.shape = e.target.value;
                this.updateAllPreviews();
                this.syncToBVShop('shape', e.target.value);
            });
            
            this.elements.patternSelect.addEventListener('change', (e) => {
                this.currentSelection.pattern = e.target.value;
                this.updateAllPreviews();
                this.syncToBVShop('pattern', e.target.value);
            });
            
            this.elements.colorSelect.addEventListener('change', (e) => {
                this.currentSelection.color = e.target.value;
                this.updateAllPreviews();
                this.syncToBVShop('color', e.target.value);
            });
        },

        // 從 BV SHOP 載入初始值
        loadFromBVShop: function() {
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput && textInput.value) {
                this.elements.textInput.value = textInput.value;
                this.currentSelection.text = textInput.value;
            }
            
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect && shapeSelect.value) {
                this.elements.shapeSelect.value = shapeSelect.value;
                this.currentSelection.shape = shapeSelect.value;
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect && patternSelect.value) {
                this.elements.patternSelect.value = patternSelect.value;
                this.currentSelection.pattern = patternSelect.value;
            }
            
            // 載入顏色
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect && colorSelect.value) {
                const actualColor = this.colorMap[colorSelect.value] || '#dc3545';
                this.elements.colorSelect.value = actualColor;
                this.currentSelection.color = actualColor;
            }
            
            // 重要：同步字體選擇
            const fontSelect = this.findBVSelect('字體');
            if (fontSelect && fontSelect.value) {
                this.selectFontByName(fontSelect.value);
            }
            
            this.updateAllPreviews();
        }
    };

    // 初始化 Widget
    StampFontWidget.init();

    // 暴露到全域以供除錯
    window.StampFontWidget = StampFontWidget;

})();
