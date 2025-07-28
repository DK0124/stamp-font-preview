// stamp-selector.js
(function() {
    // 防止重複載入
    if (window._STAMP_SELECTOR_LOADED) return;
    window._STAMP_SELECTOR_LOADED = true;

    // 注入 CSS
    const injectStyles = () => {
        const styleId = 'stamp-selector-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            /* 所有 CSS 樣式 */
            #stamp-selector-root * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            #stamp-selector-root {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
                background: #f5f6fa;
                color: #2c3e50;
                padding: 20px;
                border-radius: 20px;
            }

            /* 預覽區 */
            #stamp-selector-root .preview-section {
                background: white;
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            }

            #stamp-selector-root .live-preview {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 250px;
                background: #fafbfc;
                border-radius: 15px;
            }

            /* 主選擇區 */
            #stamp-selector-root .selection-area {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 20px;
            }

            /* 字體選擇 */
            #stamp-selector-root .font-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 15px;
                max-height: 500px;
                overflow-y: auto;
            }

            #stamp-selector-root .font-card {
                background: #fafbfc;
                border: 3px solid transparent;
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }

            #stamp-selector-root .font-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            }

            #stamp-selector-root .font-card.selected {
                border-color: #3498db;
                background: #e3f2fd;
            }

            /* 選項面板 */
            #stamp-selector-root .option-section {
                background: white;
                border-radius: 20px;
                padding: 25px;
                margin-bottom: 20px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            }

            /* 形狀選擇 */
            #stamp-selector-root .shape-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }

            #stamp-selector-root .shape-card {
                aspect-ratio: 1;
                background: #fafbfc;
                border: 3px solid transparent;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
            }

            #stamp-selector-root .shape-card.selected {
                border-color: #3498db;
                background: #e3f2fd;
            }

            /* 顏色選擇 */
            #stamp-selector-root .color-palette {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                margin-top: 15px;
            }

            #stamp-selector-root .color-main {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.3s;
            }

            #stamp-selector-root .color-main.selected {
                border-color: #2c3e50;
                transform: scale(1.1);
            }

            /* 響應式設計 */
            @media (max-width: 768px) {
                #stamp-selector-root .selection-area {
                    grid-template-columns: 1fr;
                }
                
                #stamp-selector-root .font-grid {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    };

    // 創建 HTML 結構
    const createHTML = () => {
        return `
            <div class="preview-section">
                <h2 style="text-align: center; margin-bottom: 30px;">印章即時預覽</h2>
                <div class="live-preview">
                    <div id="stamp-preview-container">
                        <!-- 動態生成預覽 -->
                    </div>
                </div>
            </div>

            <div class="selection-area">
                <!-- 字體選擇區 -->
                <div class="font-selection" style="background: white; border-radius: 20px; padding: 30px;">
                    <h3 style="margin-bottom: 20px;">選擇字體</h3>
                    <div class="font-grid" id="font-grid">
                        <!-- 動態生成字體卡片 -->
                    </div>
                </div>

                <!-- 選項面板 -->
                <div class="options-panel">
                    <!-- 文字輸入 -->
                    <div class="option-section">
                        <h4>印章文字</h4>
                        <input type="text" id="stamp-text" placeholder="輸入文字" maxlength="6" 
                               style="width: 100%; padding: 10px; margin-top: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>

                    <!-- 形狀選擇 -->
                    <div class="option-section">
                        <h4>印章形狀</h4>
                        <div class="shape-options" id="shape-options">
                            <!-- 動態生成形狀選項 -->
                        </div>
                    </div>

                    <!-- 顏色選擇 -->
                    <div class="option-section">
                        <h4>印章顏色</h4>
                        <div class="color-palette" id="color-palette">
                            <!-- 動態生成顏色選項 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // 主要邏輯類
    class StampSelector {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error('找不到容器元素:', containerId);
                return;
            }

            this.state = {
                text: '印章範例',
                font: '楷書',
                fontFamily: 'KaiTi',
                shape: 'circle',
                color: '#e74c3c',
                pattern: null
            };

            this.fonts = [
                { name: '楷書', family: 'KaiTi, "標楷體", serif' },
                { name: '隸書', family: '"隸書", FangSong, serif' },
                { name: '宋體', family: 'SimSun, "宋體", serif' },
                { name: '黑體', family: 'SimHei, "微軟正黑體", sans-serif' }
            ];

            this.shapes = [
                { id: 'circle', name: '圓形', svg: 'M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0' },
                { id: 'square', name: '方形', svg: 'M 10,10 h 80 v 80 h -80 z' },
                { id: 'rounded', name: '圓角方', svg: 'M 20,10 h 60 a 10,10 0 0 1 10,10 v 60 a 10,10 0 0 1 -10,10 h -60 a 10,10 0 0 1 -10,-10 v -60 a 10,10 0 0 1 10,-10' },
                { id: 'ellipse', name: '橢圓形', svg: 'M 50,50 m -40,0 a 40,30 0 1,0 80,0 a 40,30 0 1,0 -80,0' }
            ];

            this.colors = [
                { main: '#e74c3c', shades: ['#c0392b', '#e74c3c', '#ec7063'] },
                { main: '#3498db', shades: ['#2980b9', '#3498db', '#5dade2'] },
                { main: '#27ae60', shades: ['#229954', '#27ae60', '#52be80'] },
                { main: '#f1c40f', shades: ['#f39c12', '#f1c40f', '#f4d03f'] },
                { main: '#2c3e50', shades: ['#1c2833', '#2c3e50', '#34495e'] }
            ];

            this.init();
        }

        init() {
            // 注入樣式
            injectStyles();

            // 創建 HTML
            this.container.innerHTML = createHTML();

            // 初始化各個部分
            this.initFonts();
            this.initShapes();
            this.initColors();
            this.initTextInput();
            this.updatePreview();

            // 綁定到全域以供外部訪問
            window.stampSelector = this;
        }

        initFonts() {
            const fontGrid = document.getElementById('font-grid');
            
            this.fonts.forEach((font, index) => {
                const card = document.createElement('div');
                card.className = 'font-card';
                if (index === 0) card.classList.add('selected');
                
                card.innerHTML = `
                    <div style="font-family: ${font.family}; font-size: 24px; margin-bottom: 10px;">
                        ${this.state.text}
                    </div>
                    <div style="font-size: 14px; color: #7f8c8d;">${font.name}</div>
                `;
                
                card.addEventListener('click', () => {
                    document.querySelectorAll('.font-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.state.font = font.name;
                    this.state.fontFamily = font.family;
                    this.updatePreview();
                    this.triggerChange();
                });
                
                fontGrid.appendChild(card);
            });
        }

        initShapes() {
            const shapeOptions = document.getElementById('shape-options');
            
            this.shapes.forEach((shape, index) => {
                const card = document.createElement('div');
                card.className = 'shape-card';
                if (index === 0) card.classList.add('selected');
                
                card.innerHTML = `
                    <svg width="60" height="60" viewBox="0 0 100 100">
                        <path d="${shape.svg}" fill="none" stroke="#e74c3c" stroke-width="3"/>
                    </svg>
                    <span style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">${shape.name}</span>
                `;
                
                card.addEventListener('click', () => {
                    document.querySelectorAll('.shape-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.state.shape = shape.id;
                    this.updatePreview();
                    this.triggerChange();
                });
                
                shapeOptions.appendChild(card);
            });
        }

        initColors() {
            const colorPalette = document.getElementById('color-palette');
            
            this.colors.forEach((colorGroup, index) => {
                const group = document.createElement('div');
                group.className = 'color-group';
                
                const mainColor = document.createElement('div');
                mainColor.className = 'color-main';
                if (index === 0) mainColor.classList.add('selected');
                mainColor.style.backgroundColor = colorGroup.main;
                
                mainColor.addEventListener('click', () => {
                    document.querySelectorAll('.color-main').forEach(c => c.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.state.color = colorGroup.main;
                    this.updatePreview();
                    this.triggerChange();
                });
                
                group.appendChild(mainColor);
                colorPalette.appendChild(group);
            });
        }

        initTextInput() {
            const textInput = document.getElementById('stamp-text');
            textInput.value = this.state.text;
            
            textInput.addEventListener('input', (e) => {
                this.state.text = e.target.value || '印章範例';
                this.updatePreview();
                this.updateFontPreviews();
                this.triggerChange();
            });
        }

        updateFontPreviews() {
            document.querySelectorAll('.font-card').forEach((card, index) => {
                const previewText = card.querySelector('div');
                previewText.textContent = this.state.text;
            });
        }

        updatePreview() {
            const container = document.getElementById('stamp-preview-container');
            const shape = this.shapes.find(s => s.id === this.state.shape);
            
            let shapeStyle = '';
            switch(this.state.shape) {
                case 'circle':
                    shapeStyle = 'border-radius: 50%;';
                    break;
                case 'square':
                    shapeStyle = 'border-radius: 0;';
                    break;
                case 'rounded':
                    shapeStyle = 'border-radius: 15%;';
                    break;
                case 'ellipse':
                    shapeStyle = 'border-radius: 50%; width: 200px; height: 150px;';
                    break;
            }
            
            container.innerHTML = `
                <div style="
                    width: 180px;
                    height: 180px;
                    border: 4px solid ${this.state.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    ${shapeStyle}
                ">
                    <span style="
                        font-family: ${this.state.fontFamily};
                        font-size: 48px;
                        color: ${this.state.color};
                        font-weight: bold;
                    ">${this.state.text}</span>
                </div>
            `;
        }

        triggerChange() {
            // 觸發自訂事件，讓外部程式可以監聽變化
            const event = new CustomEvent('stampChange', { 
                detail: this.state 
            });
            this.container.dispatchEvent(event);
        }

        // 取得當前狀態
        getState() {
            return { ...this.state };
        }

        // 設定狀態
        setState(newState) {
            this.state = { ...this.state, ...newState };
            this.updatePreview();
        }
    }

    // 自動初始化或等待手動初始化
    document.addEventListener('DOMContentLoaded', () => {
        const autoInit = document.querySelector('[data-stamp-selector-auto]');
        if (autoInit) {
            new StampSelector(autoInit.id);
        }
    });

    // 暴露到全域
    window.StampSelector = StampSelector;
})();
