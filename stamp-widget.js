/**
 * 印章字體預覽系統 Widget - 視覺化增強版
 * @author DK0124
 * @version 2.0.0
 * @date 2025-01-28
 * @description 完整視覺化印章設計系統，主體以字體展示，形狀/顏色/圖案以圖像選擇
 */

(function() {
    // 防止重複載入
    if (window._STAMP_FONT_WIDGET_LOADED) return;
    window._STAMP_FONT_WIDGET_LOADED = true;

    // 建立樣式
    const styles = `
        /* 重置與基礎樣式 */
        #stamp-custom-font-widget {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
            background: #f8f9fa;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            margin: 20px 0;
            position: relative;
            isolation: isolate;
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 頂部預覽區 */
        #stamp-custom-font-widget .scfw-preview-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-preview-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #stamp-custom-font-widget .scfw-main-preview {
            background: white;
            border-radius: 20px;
            padding: 60px;
            display: inline-block;
            position: relative;
            z-index: 1;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        #stamp-custom-font-widget .scfw-preview-stamp {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        /* 主要佈局網格 */
        #stamp-custom-font-widget .scfw-main-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 25px;
            margin-top: 30px;
        }
        
        /* 字體選擇區（左側主要區域） */
        #stamp-custom-font-widget .scfw-font-section {
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        
        #stamp-custom-font-widget .scfw-section-title {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-section-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: bold;
        }
        
        /* 字體搜尋 */
        #stamp-custom-font-widget .scfw-font-search {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #e1e8ed;
            border-radius: 12px;
            font-size: 16px;
            margin-bottom: 20px;
            transition: all 0.3s;
            background: #f8f9fa;
        }
        
        #stamp-custom-font-widget .scfw-font-search:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
        }
        
        /* 字體分類 */
        #stamp-custom-font-widget .scfw-font-categories {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        
        #stamp-custom-font-widget .scfw-category-btn {
            padding: 10px 20px;
            border: 2px solid #e1e8ed;
            background: white;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            color: #5a6c7d;
        }
        
        #stamp-custom-font-widget .scfw-category-btn:hover {
            border-color: #667eea;
            color: #667eea;
        }
        
        #stamp-custom-font-widget .scfw-category-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }
        
        /* 字體網格 */
        #stamp-custom-font-widget .scfw-font-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            max-height: 600px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        #stamp-custom-font-widget .scfw-font-card {
            background: #f8f9fa;
            border: 3px solid transparent;
            border-radius: 16px;
            padding: 25px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-font-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 0;
        }
        
        #stamp-custom-font-widget .scfw-font-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }
        
        #stamp-custom-font-widget .scfw-font-card.selected {
            border-color: #667eea;
            background: white;
            box-shadow: 0 10px 30px rgba(102,126,234,0.2);
        }
        
        #stamp-custom-font-widget .scfw-font-card.selected::before {
            opacity: 0.05;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            position: relative;
            z-index: 1;
            font-size: 32px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        #stamp-custom-font-widget .scfw-font-name {
            position: relative;
            z-index: 1;
            font-size: 14px;
            font-weight: 600;
            color: #5a6c7d;
        }
        
        /* 右側選項面板 */
        #stamp-custom-font-widget .scfw-options-panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        #stamp-custom-font-widget .scfw-option-section {
            background: white;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        
        #stamp-custom-font-widget .scfw-option-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        #stamp-custom-font-widget .scfw-option-icon {
            width: 32px;
            height: 32px;
            background: #f0f3f7;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        
        /* 文字輸入 */
        #stamp-custom-font-widget .scfw-text-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e8ed;
            border-radius: 12px;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s;
            background: #f8f9fa;
        }
        
        #stamp-custom-font-widget .scfw-text-input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
        }
        
        /* 形狀選擇 */
        #stamp-custom-font-widget .scfw-shape-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        #stamp-custom-font-widget .scfw-shape-card {
            aspect-ratio: 1;
            background: #f8f9fa;
            border: 3px solid transparent;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-shape-card:hover {
            transform: scale(1.05);
            border-color: #e1e8ed;
        }
        
        #stamp-custom-font-widget .scfw-shape-card.selected {
            background: white;
            border-color: #667eea;
            box-shadow: 0 5px 20px rgba(102,126,234,0.2);
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 70px;
            height: 70px;
            border: 3px solid #e74c3c;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-shape-name {
            font-size: 12px;
            font-weight: 600;
            color: #5a6c7d;
        }
        
        /* 形狀變化（邊框樣式） */
        #stamp-custom-font-widget .scfw-border-styles {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            overflow-x: auto;
            padding: 5px;
        }
        
        #stamp-custom-font-widget .scfw-border-style {
            min-width: 60px;
            height: 60px;
            background: #f8f9fa;
            border: 2px solid transparent;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-border-style:hover {
            transform: scale(1.1);
        }
        
        #stamp-custom-font-widget .scfw-border-style.selected {
            background: white;
            border-color: #667eea;
        }
        
        /* 顏色選擇 */
        #stamp-custom-font-widget .scfw-color-palette {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        #stamp-custom-font-widget .scfw-color-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-color-main::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover::before {
            width: 100%;
            height: 100%;
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected {
            border-color: #2c3e50;
            transform: scale(1.1);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        #stamp-custom-font-widget .scfw-color-shades {
            display: flex;
            gap: 4px;
        }
        
        #stamp-custom-font-widget .scfw-color-shade {
            width: 14px;
            height: 14px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-color-shade:hover {
            transform: scale(1.3);
        }
        
        /* 圖案選擇 */
        #stamp-custom-font-widget .scfw-pattern-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: #f8f9fa;
            border: 2px solid transparent;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 28px;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            transform: scale(1.1);
            background: white;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: white;
            border-color: #667eea;
            box-shadow: 0 5px 15px rgba(102,126,234,0.2);
        }
        
        #stamp-custom-font-widget .scfw-pattern-none {
            font-size: 14px;
            color: #95a5a6;
            font-weight: 600;
        }
        
        /* 滾動條美化 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 8px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: #f1f3f5;
            border-radius: 10px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: #dee2e6;
            border-radius: 10px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: #adb5bd;
        }
        
        /* 載入動畫 */
        #stamp-custom-font-widget .scfw-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 16px;
        }
        
        #stamp-custom-font-widget .scfw-loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        #stamp-custom-font-widget .scfw-loading-text {
            margin-top: 20px;
            color: #5a6c7d;
            font-size: 14px;
            font-weight: 500;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 響應式設計 */
        @media (max-width: 968px) {
            #stamp-custom-font-widget .scfw-main-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-font-grid {
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                max-height: 400px;
            }
        }
        
        @media (max-width: 568px) {
            #stamp-custom-font-widget {
                padding: 20px;
            }
            
            #stamp-custom-font-widget .scfw-font-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-shape-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            #stamp-custom-font-widget .scfw-color-palette {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    `;

    // 建立 HTML 結構
    const html = `
        <div id="stamp-custom-font-widget">
            <!-- 頂部預覽區 -->
            <div class="scfw-preview-header">
                <h2 style="font-size: 28px; margin-bottom: 30px; font-weight: 600;">🎯 印章即時預覽</h2>
                <div class="scfw-main-preview">
                    <div class="scfw-preview-stamp" id="scfw-main-preview">
                        <!-- 動態生成的印章預覽 -->
                    </div>
                </div>
            </div>
            
            <!-- 主要內容區 -->
            <div class="scfw-main-grid">
                <!-- 左側：字體選擇（主要區域） -->
                <div class="scfw-font-section">
                    <div class="scfw-section-title">
                        <div class="scfw-section-icon">字</div>
                        <span>選擇印章字體</span>
                    </div>
                    
                    <input type="text" 
                           class="scfw-font-search" 
                           id="scfw-font-search" 
                           placeholder="🔍 搜尋字體名稱...">
                    
                    <div class="scfw-font-categories">
                        <button class="scfw-category-btn active" data-category="all">全部</button>
                        <button class="scfw-category-btn" data-category="traditional">傳統</button>
                        <button class="scfw-category-btn" data-category="handwrite">手寫</button>
                        <button class="scfw-category-btn" data-category="modern">現代</button>
                    </div>
                    
                    <div class="scfw-font-grid" id="scfw-font-grid">
                        <div class="scfw-loading-overlay">
                            <div class="scfw-loading-spinner"></div>
                            <div class="scfw-loading-text">正在載入字體...</div>
                        </div>
                    </div>
                </div>
                
                <!-- 右側：選項面板 -->
                <div class="scfw-options-panel">
                    <!-- 文字輸入 -->
                    <div class="scfw-option-section">
                        <div class="scfw-option-title">
                            <div class="scfw-option-icon">✏️</div>
                            <span>印章文字</span>
                        </div>
                        <input type="text" 
                               class="scfw-text-input" 
                               id="scfw-text" 
                               placeholder="輸入印章文字（最多6字）" 
                               maxlength="6" 
                               value="印章範例">
                    </div>
                    
                    <!-- 形狀選擇 -->
                    <div class="scfw-option-section">
                        <div class="scfw-option-title">
                            <div class="scfw-option-icon">◼</div>
                            <span>印章形狀</span>
                        </div>
                        <div class="scfw-shape-grid" id="scfw-shape-grid">
                            <!-- 動態生成形狀選項 -->
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <div style="font-size: 14px; color: #5a6c7d; margin-bottom: 10px; font-weight: 600;">邊框樣式</div>
                            <div class="scfw-border-styles" id="scfw-border-styles">
                                <!-- 動態生成邊框樣式 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- 顏色選擇 -->
                    <div class="scfw-option-section">
                        <div class="scfw-option-title">
                            <div class="scfw-option-icon">🎨</div>
                            <span>印章顏色</span>
                        </div>
                        <div class="scfw-color-palette" id="scfw-color-palette">
                            <!-- 動態生成顏色選項 -->
                        </div>
                    </div>
                    
                    <!-- 圖案選擇 -->
                    <div class="scfw-option-section">
                        <div class="scfw-option-title">
                            <div class="scfw-option-icon">✨</div>
                            <span>裝飾圖案</span>
                        </div>
                        <div class="scfw-pattern-grid" id="scfw-pattern-grid">
                            <!-- 動態生成圖案選項 -->
                        </div>
                    </div>
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
        // 字體清單配置（加入分類）
        availableFonts: [
            { id: 1, name: '粉圓體', filename: '粉圓體全繁體.ttf', displayName: '粉圓體', category: 'modern' },
            { id: 2, name: '粒線體不等寬', filename: '粒線體不等寬全繁體.ttf', displayName: '粒線體(不等寬)', category: 'modern' },
            { id: 3, name: '粒線體等寬', filename: '粒線體等寬全繁體.ttf', displayName: '粒線體(等寬)', category: 'modern' },
            { id: 4, name: '粗線體不等寬', filename: '粗線體不等寬版 全繁體.ttf', displayName: '粗線體(不等寬)', category: 'modern' },
            { id: 5, name: '粗線體等寬', filename: '粗線體等寬版 全繁體.ttf', displayName: '粗線體(等寬)', category: 'modern' },
            { id: 6, name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf', displayName: '胖西手寫體', category: 'handwrite' },
            { id: 7, name: '辰宇落雁體', filename: '辰宇落雁體 不等寬版全繁體.ttf', displayName: '辰宇落雁體', category: 'handwrite' },
            { id: 8, name: '楷書', filename: '', displayName: '楷書', systemFont: 'KaiTi, "標楷體", serif', category: 'traditional' },
            { id: 9, name: '隸書', filename: '', displayName: '隸書', systemFont: '"隸書", FangSong, serif', category: 'traditional' },
            { id: 10, name: '篆書', filename: '', displayName: '篆書', systemFont: 'SimSun, "宋體", serif', category: 'traditional' }
        ],

        // 形狀配置
        shapes: [
            { id: 'circle', name: '圓形', class: '圓形' },
            { id: 'square', name: '方形', class: '方形' },
            { id: 'ellipse', name: '橢圓形', class: '橢圓形' },
            { id: 'rectangle', name: '長方形', class: '長方形' }
        ],

        // 邊框樣式
        borderStyles: [
            { id: 'solid', name: '實線', style: 'solid' },
            { id: 'double', name: '雙線', style: 'double' },
            { id: 'dashed', name: '虛線', style: 'dashed' },
            { id: 'dotted', name: '點線', style: 'dotted' }
        ],

        // 顏色配置（包含色階）
        colorGroups: [
            { 
                main: '#dc3545', 
                name: '朱紅',
                shades: ['#a02128', '#dc3545', '#e25563', '#e87581']
            },
            { 
                main: '#0066cc', 
                name: '藍色',
                shades: ['#004499', '#0066cc', '#3385ff', '#66a3ff']
            },
            { 
                main: '#28a745', 
                name: '綠色',
                shades: ['#1e7e34', '#28a745', '#48b461', '#68c17d']
            },
            { 
                main: '#ffc107', 
                name: '金黃',
                shades: ['#d39e00', '#ffc107', '#ffca2c', '#ffd454']
            }
        ],

        // 圖案配置
        patterns: [
            { id: 'none', emoji: '', name: '無' },
            { id: 'flower', emoji: '🌸', name: '櫻花' },
            { id: 'heart', emoji: '❤️', name: '愛心' },
            { id: 'star', emoji: '⭐', name: '星星' },
            { id: 'leaf', emoji: '🍀', name: '幸運草' },
            { id: 'butterfly', emoji: '🦋', name: '蝴蝶' },
            { id: 'moon', emoji: '🌙', name: '月亮' },
            { id: 'sun', emoji: '☀️', name: '太陽' }
        ],

        GITHUB_RAW_URL: 'https://raw.githubusercontent.com/DK0124/font-preview-system/main/fonts/',

        currentSelection: {
            text: '印章範例',
            font: '楷書',
            fontId: 8,
            shape: 'circle',
            borderStyle: 'solid',
            pattern: 'none',
            color: '#dc3545',
            category: 'all'
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
                fontSearch: widget.querySelector('#scfw-font-search'),
                fontGrid: widget.querySelector('#scfw-font-grid'),
                shapeGrid: widget.querySelector('#scfw-shape-grid'),
                borderStyles: widget.querySelector('#scfw-border-styles'),
                colorPalette: widget.querySelector('#scfw-color-palette'),
                patternGrid: widget.querySelector('#scfw-pattern-grid'),
                mainPreview: widget.querySelector('#scfw-main-preview')
            };

            // 初始化各個部分
            this.initializeShapes();
            this.initializeBorderStyles();
            this.initializeColors();
            this.initializePatterns();
            this.bindEvents();
            this.updateMainPreview();
            
            // 延遲載入
            setTimeout(() => {
                this.setupBVShopListeners();
                this.loadFromBVShop();
                this.loadAllFonts();
            }, 500);
        },

        // 初始化形狀選項
        initializeShapes: function() {
            const shapeGrid = this.elements.shapeGrid;
            
            this.shapes.forEach((shape, index) => {
                const card = document.createElement('div');
                card.className = 'scfw-shape-card';
                if (index === 0) card.classList.add('selected');
                card.dataset.shape = shape.id;
                
                card.innerHTML = `
                    <div class="scfw-shape-preview" style="
                        ${shape.id === 'circle' ? 'border-radius: 50%;' : ''}
                        ${shape.id === 'ellipse' ? 'border-radius: 50%; width: 85px; height: 65px;' : ''}
                        ${shape.id === 'rectangle' ? 'width: 85px; height: 60px;' : ''}
                    "></div>
                    <span class="scfw-shape-name">${shape.name}</span>
                `;
                
                card.addEventListener('click', () => {
                    shapeGrid.querySelectorAll('.scfw-shape-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.currentSelection.shape = shape.id;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                    this.syncToBVShop('shape', shape.class);
                });
                
                shapeGrid.appendChild(card);
            });
        },

        // 初始化邊框樣式
        initializeBorderStyles: function() {
            const borderContainer = this.elements.borderStyles;
            
            this.borderStyles.forEach((style, index) => {
                const btn = document.createElement('div');
                btn.className = 'scfw-border-style';
                if (index === 0) btn.classList.add('selected');
                btn.dataset.style = style.id;
                
                btn.innerHTML = `
                    <svg width="40" height="40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#e74c3c" stroke-width="3" 
                                stroke-dasharray="${style.id === 'dashed' ? '8,4' : style.id === 'dotted' ? '2,3' : '0'}"/>
                    </svg>
                `;
                
                btn.addEventListener('click', () => {
                    borderContainer.querySelectorAll('.scfw-border-style').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.currentSelection.borderStyle = style.style;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                });
                
                borderContainer.appendChild(btn);
            });
        },

        // 初始化顏色選項
        initializeColors: function() {
            const colorPalette = this.elements.colorPalette;
            
            this.colorGroups.forEach((colorGroup, index) => {
                const group = document.createElement('div');
                group.className = 'scfw-color-group';
                
                // 主顏色
                const mainColor = document.createElement('div');
                mainColor.className = 'scfw-color-main';
                if (index === 0) mainColor.classList.add('selected');
                mainColor.style.backgroundColor = colorGroup.main;
                mainColor.dataset.color = colorGroup.main;
                
                // 色階
                const shades = document.createElement('div');
                shades.className = 'scfw-color-shades';
                
                colorGroup.shades.forEach(shade => {
                    const shadeDiv = document.createElement('div');
                    shadeDiv.className = 'scfw-color-shade';
                    shadeDiv.style.backgroundColor = shade;
                    shadeDiv.dataset.color = shade;
                    
                    shadeDiv.addEventListener('click', () => {
                        colorPalette.querySelectorAll('.scfw-color-main').forEach(c => c.classList.remove('selected'));
                        mainColor.classList.add('selected');
                        this.currentSelection.color = shade;
                        this.updateMainPreview();
                        this.updateAllPreviews();
                        this.syncToBVShop('color', shade);
                    });
                    
                    shades.appendChild(shadeDiv);
                });
                
                mainColor.addEventListener('click', () => {
                    colorPalette.querySelectorAll('.scfw-color-main').forEach(c => c.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.currentSelection.color = colorGroup.main;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                    this.syncToBVShop('color', colorGroup.main);
                });
                
                group.appendChild(mainColor);
                group.appendChild(shades);
                colorPalette.appendChild(group);
            });
        },

        // 初始化圖案選項
        initializePatterns: function() {
            const patternGrid = this.elements.patternGrid;
            
            this.patterns.forEach((pattern, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-pattern-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.pattern = pattern.id;
                
                if (pattern.id === 'none') {
                    item.innerHTML = '<span class="scfw-pattern-none">無</span>';
                } else {
                    item.innerHTML = pattern.emoji;
                }
                
                item.addEventListener('click', () => {
                    patternGrid.querySelectorAll('.scfw-pattern-item').forEach(p => p.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                    const patternName = pattern.id === 'none' ? '' : pattern.name;
                    this.syncToBVShop('pattern', patternName);
                });
                
                patternGrid.appendChild(item);
            });
        },

        // 更新主預覽
        updateMainPreview: function() {
            const preview = this.elements.mainPreview;
            const shape = this.shapes.find(s => s.id === this.currentSelection.shape);
            const pattern = this.patterns.find(p => p.id === this.currentSelection.pattern);
            const font = this.availableFonts.find(f => f.id === this.currentSelection.fontId);
            
            let shapeStyle = '';
            let dimensions = 'width: 180px; height: 180px;';
            
            switch(this.currentSelection.shape) {
                case 'circle':
                    shapeStyle = 'border-radius: 50%;';
                    break;
                case 'square':
                    shapeStyle = 'border-radius: 0;';
                    break;
                case 'ellipse':
                    shapeStyle = 'border-radius: 50%;';
                    dimensions = 'width: 220px; height: 160px;';
                    break;
                case 'rectangle':
                    shapeStyle = 'border-radius: 0;';
                    dimensions = 'width: 220px; height: 150px;';
                    break;
            }
            
            const fontFamily = font ? (font.systemFont || `CustomFont${font.id}`) : 'serif';
            
            preview.innerHTML = `
                <div style="
                    ${dimensions}
                    border: 5px ${this.currentSelection.borderStyle} ${this.currentSelection.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: white;
                    ${shapeStyle}
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                ">
                    <span style="
                        font-family: ${fontFamily};
                        font-size: 48px;
                        color: ${this.currentSelection.color};
                        font-weight: bold;
                        text-align: center;
                    ">${this.currentSelection.text}</span>
                    ${pattern && pattern.id !== 'none' ? `
                        <span style="
                            position: absolute;
                            bottom: 15px;
                            right: 15px;
                            font-size: 28px;
                            opacity: 0.4;
                        ">${pattern.emoji}</span>
                    ` : ''}
                </div>
            `;
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
            card.dataset.category = fontData.category;
            
            if (fontData.id === this.currentSelection.fontId) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <div class="scfw-font-preview">
                    <span style="opacity: 0.3;">載入中...</span>
                </div>
                <div class="scfw-font-name">${fontData.displayName}</div>
            `;
            
            // 載入字體後更新預覽
            this.loadFont(fontData).then((loaded) => {
                if (loaded) {
                    const previewDiv = card.querySelector('.scfw-font-preview');
                    previewDiv.innerHTML = `
                        <span style="
                            font-family: ${fontData.systemFont || `CustomFont${fontData.id}`};
                        ">${this.currentSelection.text || '印章範例'}</span>
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
                
                this.updateMainPreview();
                this.updateAllPreviews();
                this.syncToBVShop('font', fontData.name);
            });
            
            return card;
        },

        // 更新所有預覽
        updateAllPreviews: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            widget.querySelectorAll('.scfw-font-preview span').forEach(span => {
                span.textContent = this.currentSelection.text || '印章範例';
            });
        },

        // 載入所有字體
        loadAllFonts: async function() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.elements.fontGrid.innerHTML = '<div class="scfw-loading-overlay"><div class="scfw-loading-spinner"></div><div class="scfw-loading-text">正在載入字體...</div></div>';
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.elements.fontGrid.innerHTML = '';
            
            for (const fontData of this.availableFonts) {
                const card = this.createFontCard(fontData);
                this.elements.fontGrid.appendChild(card);
            }
            
            this.isLoading = false;
            
            setTimeout(() => {
                const fontSelect = this.findBVSelect('字體');
                if (fontSelect && fontSelect.value) {
                    this.selectFontByName(fontSelect.value);
                }
            }, 100);
        },

        // 篩選字體
        filterFonts: function(category) {
            const cards = this.elements.fontGrid.querySelectorAll('.scfw-font-card');
            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        },

        // 搜尋字體
        searchFonts: function(keyword) {
            const cards = this.elements.fontGrid.querySelectorAll('.scfw-font-card');
            const lowerKeyword = keyword.toLowerCase();
            
            cards.forEach(card => {
                const fontName = card.querySelector('.scfw-font-name').textContent.toLowerCase();
                if (fontName.includes(lowerKeyword)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        },

        // 根據字體名稱選中卡片
        selectFontByName: function(fontName) {
            const widget = document.getElementById('stamp-custom-font-widget');
            
            widget.querySelectorAll('.scfw-font-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const fontData = this.availableFonts.find(f => f.name === fontName);
            if (fontData) {
                const targetCard = widget.querySelector(`[data-font-name="${fontName}"]`);
                if (targetCard) {
                    targetCard.classList.add('selected');
                    this.currentSelection.font = fontName;
                    this.currentSelection.fontId = fontData.id;
                    
                    this.updateMainPreview();
                    this.updateAllPreviews();
                }
            }
        },

        // 設定 BV SHOP 監聽器
        setupBVShopListeners: function() {
            this.bvShopListeners.forEach(listener => {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            this.bvShopListeners = [];

            const fontSelect = this.findBVSelect('字體');
            if (fontSelect) {
                const fontHandler = (e) => {
                    const selectedFont = e.target.value;
                    this.selectFontByName(selectedFont);
                };
                fontSelect.addEventListener('change', fontHandler);
                this.bvShopListeners.push({ element: fontSelect, event: 'change', handler: fontHandler });
            }
            
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput) {
                const textHandler = (e) => {
                    this.elements.textInput.value = e.target.value;
                    this.currentSelection.text = e.target.value;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                };
                textInput.addEventListener('input', textHandler);
                this.bvShopListeners.push({ element: textInput, event: 'input', handler: textHandler });
            }
            
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect) {
                const shapeHandler = (e) => {
                    const shape = this.shapes.find(s => s.class === e.target.value);
                    if (shape) {
                        this.elements.shapeGrid.querySelectorAll('.scfw-shape-card').forEach(card => {
                            card.classList.remove('selected');
                            if (card.dataset.shape === shape.id) {
                                card.classList.add('selected');
                            }
                        });
                        this.currentSelection.shape = shape.id;
                        this.updateMainPreview();
                        this.updateAllPreviews();
                    }
                };
                shapeSelect.addEventListener('change', shapeHandler);
                this.bvShopListeners.push({ element: shapeSelect, event: 'change', handler: shapeHandler });
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect) {
                const patternHandler = (e) => {
                    const patternName = e.target.value;
                    const pattern = this.patterns.find(p => p.name === patternName) || this.patterns[0];
                    this.elements.patternGrid.querySelectorAll('.scfw-pattern-item').forEach(item => {
                        item.classList.remove('selected');
                        if (item.dataset.pattern === pattern.id) {
                            item.classList.add('selected');
                        }
                    });
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                };
                patternSelect.addEventListener('change', patternHandler);
                this.bvShopListeners.push({ element: patternSelect, event: 'change', handler: patternHandler });
            }
            
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect) {
                const colorHandler = (e) => {
                    const selectedColor = e.target.value;
                    const colorMap = {
                        '朱紅': '#dc3545',
                        '黑色': '#000000',
                        '藍色': '#0066cc',
                        '綠色': '#28a745'
                    };
                    const actualColor = colorMap[selectedColor] || '#dc3545';
                    
                    this.elements.colorPalette.querySelectorAll('.scfw-color-main').forEach(c => {
                        c.classList.remove('selected');
                        if (c.dataset.color === actualColor) {
                            c.classList.add('selected');
                        }
                    });
                    
                    this.currentSelection.color = actualColor;
                    this.updateMainPreview();
                    this.updateAllPreviews();
                };
                colorSelect.addEventListener('change', colorHandler);
                this.bvShopListeners.push({ element: colorSelect, event: 'change', handler: colorHandler });
            }
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
                            const colorTextMap = {
                                '#dc3545': '朱紅',
                                '#000000': '黑色',
                                '#0066cc': '藍色',
                                '#28a745': '綠色'
                            };
                            const colorText = colorTextMap[value] || '朱紅';
                            colorSelect.value = colorText;
                            colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                }
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
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                this.updateMainPreview();
                this.updateAllPreviews();
                this.syncToBVShop('text', e.target.value);
            });
            
            // 字體搜尋
            this.elements.fontSearch.addEventListener('input', (e) => {
                this.searchFonts(e.target.value);
            });
            
            // 分類按鈕
            document.querySelectorAll('.scfw-category-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.scfw-category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentSelection.category = btn.dataset.category;
                    this.filterFonts(btn.dataset.category);
                });
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
                const shape = this.shapes.find(s => s.class === shapeSelect.value);
                if (shape) {
                    this.currentSelection.shape = shape.id;
                }
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect && patternSelect.value) {
                const pattern = this.patterns.find(p => p.name === patternSelect.value);
                if (pattern) {
                    this.currentSelection.pattern = pattern.id;
                }
            }
            
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect && colorSelect.value) {
                const colorMap = {
                    '朱紅': '#dc3545',
                    '黑色': '#000000',
                    '藍色': '#0066cc',
                    '綠色': '#28a745'
                };
                this.currentSelection.color = colorMap[colorSelect.value] || '#dc3545';
            }
            
            const fontSelect = this.findBVSelect('字體');
            if (fontSelect && fontSelect.value) {
                this.selectFontByName(fontSelect.value);
            }
            
            this.updateMainPreview();
            this.updateAllPreviews();
        }
    };

    // 初始化 Widget
    StampFontWidget.init();

    // 暴露到全域以供除錯
    window.StampFontWidget = StampFontWidget;

})();
