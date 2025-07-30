/**
 * 印章預覽系統 - Canvas 渲染版
 * @author DK0124
 * @version 11.3.0
 * @date 2025-01-30
 * @description 使用 Canvas 確保字體正確渲染
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window._STAMP_WIDGET_V11_LOADED) return;
    window._STAMP_WIDGET_V11_LOADED = true;
    
    // 載入 Material Icons
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }
    
    // 配置
    const CONFIG = {
        GITHUB_OWNER: 'DK0124',
        GITHUB_REPO: 'stamp-font-preview',
        GITHUB_BRANCH: 'main',
        get BASE_URL() {
            return `https://raw.githubusercontent.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/${this.GITHUB_BRANCH}`;
        },
        get CONFIG_URL() {
            return `${this.BASE_URL}/config/stamp-config.json`;
        },
        // 資源路徑
        get FONTS_BASE_URL() {
            return `${this.BASE_URL}/assets/fonts`;
        },
        get PATTERNS_BASE_URL() {
            return `${this.BASE_URL}/assets/patterns`;
        },
        get SHAPES_BASE_URL() {
            return `${this.BASE_URL}/assets/shapes`;
        }
    };
    
    // 建立樣式（保持原有樣式，這裡只顯示關鍵部分）
    const styles = `
        /* 基礎樣式 */
        #stamp-custom-font-widget {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif;
            background: #ffffff;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.1);
            margin: 20px 0;
            position: relative;
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 標題區 */
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
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        /* 主預覽區 */
        #stamp-custom-font-widget .scfw-preview-section {
            margin-bottom: 32px;
        }
        
        #stamp-custom-font-widget .scfw-preview-container {
            background: linear-gradient(135deg, #9fb28e 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-preview-title {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-stamp-preview-wrapper {
            display: inline-block;
            padding: 30px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-stamp-display {
            position: relative;
            transition: all 0.3s ease;
        }
        
        /* Canvas 預覽樣式 */
        #stamp-custom-font-widget .scfw-main-canvas {
            display: block;
            cursor: pointer;
        }
        
        /* 內容區 */
        #stamp-custom-font-widget .scfw-content {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 24px;
        }
        
        /* 字體選擇區 */
        #stamp-custom-font-widget .scfw-fonts-section {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 24px;
        }
        
        #stamp-custom-font-widget .scfw-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* 搜尋框 */
        #stamp-custom-font-widget .scfw-search-container {
            position: relative;
            margin-bottom: 16px;
        }
        
        #stamp-custom-font-widget .scfw-search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 18px;
        }
        
        #stamp-custom-font-widget .scfw-search-input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-search-input:focus {
            outline: none;
            border-color: #9fb28e;
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 分類標籤 */
        #stamp-custom-font-widget .scfw-categories {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        #stamp-custom-font-widget .scfw-category {
            padding: 8px 16px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            font-size: 13px;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-category:hover {
            border-color: #9fb28e;
            color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-category.active {
            background: #9fb28e;
            color: white;
            border-color: #9fb28e;
        }
        
        /* 字體網格 */
        #stamp-custom-font-widget .scfw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
            max-height: 500px;
            overflow-y: auto;
            padding-right: 8px;
        }
        
        #stamp-custom-font-widget .scfw-font-item {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-font-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #B5D5B0;
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected {
            background: #f0fff4;
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: #9fb28e;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-font-preview canvas {
            max-width: 100%;
            height: auto;
        }
        
        #stamp-custom-font-widget .scfw-font-label {
            font-size: 13px;
            font-weight: 500;
            color: #666;
        }
        
        /* 右側選項面板 */
        #stamp-custom-font-widget .scfw-options-panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        #stamp-custom-font-widget .scfw-option-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
        }
        
        #stamp-custom-font-widget .scfw-option-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-weight: 600;
            font-size: 15px;
            color: #333;
        }
        
        #stamp-custom-font-widget .scfw-option-header .material-icons {
            font-size: 20px;
            color: #9fb28e;
        }
        
        /* 文字輸入 */
        #stamp-custom-font-widget .scfw-text-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            text-align: center;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-text-input:focus {
            outline: none;
            border-color: #9fb28e;
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 形狀選擇 */
        #stamp-custom-font-widget .scfw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-shape-item {
            aspect-ratio: 1;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-shape-item:hover {
            border-color: #B5D5B0;
            transform: scale(1.05);
        }
        
        #stamp-custom-font-widget .scfw-shape-item.selected {
            background: #f0fff4;
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview-border {
            width: 50px;
            height: 50px;
            border: 3px solid #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-shape-label {
            font-size: 12px;
            color: #666;
        }
        
        /* 顏色選擇 */
        #stamp-custom-font-widget .scfw-colors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-color-group {
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 48px;
            height: 48px;
            margin: 0 auto 8px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected {
            transform: scale(1.1);
            box-shadow: 
                0 4px 12px rgba(0, 0, 0, 0.2),
                inset 0 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        /* 圖案選擇 */
        #stamp-custom-font-widget .scfw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            border-color: #B5D5B0;
            transform: scale(1.05);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: #f0fff4;
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-pattern-preview {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-pattern-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            opacity: 0.7;
        }
        
        #stamp-custom-font-widget .scfw-pattern-none {
            font-size: 12px;
            color: #999;
        }
        
        /* 載入動畫 */
        #stamp-custom-font-widget .scfw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-loading-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #f0f0f0;
            border-top-color: #9fb28e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        #stamp-custom-font-widget .scfw-loading-text {
            color: #999;
            font-size: 14px;
        }
        
        /* 字體載入錯誤提示 */
        #stamp-custom-font-widget .scfw-font-error {
            color: #e57373;
            font-size: 12px;
            margin-top: 4px;
        }
        
        /* 滾動條 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 6px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 3px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 3px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: #ccc;
        }
        
        /* 響應式 */
        @media (max-width: 768px) {
            #stamp-custom-font-widget .scfw-content {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-fonts-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    // 注入樣式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Widget 主類
    const StampFontWidget = {
        // 預設配置
        defaultFonts: [
            { id: 'font_1', name: '粉圓體', filename: '粉圓體全繁體.ttf', displayName: '粉圓體', category: 'modern' },
            { id: 'font_2', name: '粒線體不等寬', filename: '粒線體不等寬全繁體.ttf', displayName: '粒線體(不等寬)', category: 'modern' },
            { id: 'font_3', name: '粒線體等寬', filename: '粒線體等寬全繁體.ttf', displayName: '粒線體(等寬)', category: 'modern' },
            { id: 'font_4', name: '粗線體不等寬', filename: '粗線體不等寬版 全繁體.ttf', displayName: '粗線體(不等寬)', category: 'modern' },
            { id: 'font_5', name: '粗線體等寬', filename: '粗線體等寬版 全繁體.ttf', displayName: '粗線體(等寬)', category: 'modern' },
            { id: 'font_6', name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf', displayName: '胖西手寫體', category: 'handwrite' },
            { id: 'font_7', name: '辰宇落雁體', filename: '辰宇落雁體 不等寬版全繁體.ttf', displayName: '辰宇落雁體', category: 'handwrite' },
            { id: 'font_8', name: '楷書', displayName: '楷書', systemFont: 'KaiTi, "標楷體", serif', category: 'traditional' },
            { id: 'font_9', name: '隸書', displayName: '隸書', systemFont: '"隸書", FangSong, serif', category: 'traditional' },
            { id: 'font_10', name: '篆書', displayName: '篆書', systemFont: 'SimSun, "宋體", serif', category: 'traditional' }
        ],
        
        defaultShapes: [
            { id: 'circle', name: '圓形', filename: 'circle.svg' },
            { id: 'square', name: '方形', filename: 'square.svg' },
            { id: 'ellipse', name: '橢圓形', filename: 'ellipse.svg' },
            { id: 'rectangle', name: '長方形', filename: 'rectangle.svg' }
        ],
        
        defaultColors: [
            { main: '#e57373', name: '珊瑚紅' },
            { main: '#9fb28e', name: '抹茶綠' },
            { main: '#64b5f6', name: '天空藍' },
            { main: '#ffb74d', name: '琥珀黃' }
        ],
        
        defaultPatterns: [
            { id: 'none', name: '無', filename: '' },
            { id: 'flower', name: '花朵', filename: 'flower.svg' },
            { id: 'heart', name: '愛心', filename: 'heart.svg' },
            { id: 'star', name: '星星', filename: 'star.svg' }
        ],
        
        // 狀態
        config: null,
        currentSelection: {
            text: '印章範例',
            font: null,
            fontId: null,
            shape: 'circle',
            pattern: 'none',
            color: '#e57373',
            category: 'all'
        },
        loadedFonts: {},
        isLoading: false,
        elements: {},
        fontLoadErrors: {},
        
        // 初始化
        async init() {
            try {
                console.log('🚀 印章預覽系統開始初始化...');
                
                // 建立 HTML 結構
                this.createHTML();
                
                // 取得元素引用
                this.getElements();
                
                // 嘗試載入配置，失敗則使用預設值
                await this.loadConfig();
                
                // 初始化各元件
                this.initializeShapes();
                this.initializeColors();
                this.initializePatterns();
                
                // 綁定事件
                this.bindEvents();
                
                // 更新預覽
                this.updateMainPreview();
                
                // 載入字體
                setTimeout(() => {
                    this.loadAllFonts();
                }, 100);
                
                console.log('✅ 印章預覽系統初始化完成');
                
            } catch (error) {
                console.error('❌ Widget 初始化失敗:', error);
            }
        },
        
        // 建立 HTML（修改主預覽部分）
        createHTML() {
            const container = document.getElementById('stamp-font-widget-container') || 
                           document.getElementById('stamp-preview-root') ||
                           document.body;
            
            const html = `
                <div id="stamp-custom-font-widget">
                    <!-- 標題 -->
                    <div class="scfw-header">
                        <h2 class="scfw-title">
                            <span class="material-icons">verified</span>
                            印章即時預覽系統
                        </h2>
                        <p class="scfw-subtitle">選擇您喜愛的樣式，打造專屬印章</p>
                    </div>
                    
                    <!-- 預覽區 -->
                    <div class="scfw-preview-section">
                        <div class="scfw-preview-container">
                            <h3 class="scfw-preview-title">
                                <span class="material-icons">visibility</span>
                                印章預覽
                            </h3>
                            <div class="scfw-stamp-preview-wrapper">
                                <div class="scfw-stamp-display" id="scfw-main-preview">
                                    <canvas id="scfw-main-canvas" class="scfw-main-canvas" width="250" height="250"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 主內容 -->
                    <div class="scfw-content">
                        <!-- 字體選擇區 -->
                        <div class="scfw-fonts-section">
                            <div class="scfw-section-header">
                                <h3 class="scfw-section-title">
                                    <span class="material-icons">text_fields</span>
                                    選擇字體
                                </h3>
                            </div>
                            
                            <div class="scfw-search-container">
                                <span class="material-icons scfw-search-icon">search</span>
                                <input type="text" 
                                       class="scfw-search-input" 
                                       id="scfw-font-search"
                                       placeholder="搜尋字體...">
                            </div>
                            
                            <div class="scfw-categories">
                                <button class="scfw-category active" data-category="all">
                                    全部
                                </button>
                                <button class="scfw-category" data-category="traditional">
                                    傳統
                                </button>
                                <button class="scfw-category" data-category="handwrite">
                                    手寫
                                </button>
                                <button class="scfw-category" data-category="modern">
                                    現代
                                </button>
                            </div>
                            
                            <div class="scfw-fonts-grid" id="scfw-fonts-grid">
                                <div class="scfw-loading">
                                    <div class="scfw-loading-spinner"></div>
                                    <div class="scfw-loading-text">正在載入字體...</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 選項面板 -->
                        <div class="scfw-options-panel">
                            <!-- 文字輸入 -->
                            <div class="scfw-option-card">
                                <div class="scfw-option-header">
                                    <span class="material-icons">edit</span>
                                    印章文字
                                </div>
                                <input type="text" 
                                       class="scfw-text-input" 
                                       id="scfw-text"
                                       placeholder="輸入印章文字"
                                       maxlength="6"
                                       value="印章範例">
                            </div>
                            
                            <!-- 形狀選擇 -->
                            <div class="scfw-option-card">
                                <div class="scfw-option-header">
                                    <span class="material-icons">category</span>
                                    印章形狀
                                </div>
                                <div class="scfw-shapes-grid" id="scfw-shapes-grid">
                                    <!-- 動態生成 -->
                                </div>
                            </div>
                            
                            <!-- 顏色選擇 -->
                            <div class="scfw-option-card">
                                <div class="scfw-option-header">
                                    <span class="material-icons">palette</span>
                                    印章顏色
                                </div>
                                <div class="scfw-colors-grid" id="scfw-colors-grid">
                                    <!-- 動態生成 -->
                                </div>
                            </div>
                            
                            <!-- 圖案選擇 -->
                            <div class="scfw-option-card">
                                <div class="scfw-option-header">
                                    <span class="material-icons">stars</span>
                                    裝飾圖案
                                </div>
                                <div class="scfw-patterns-grid" id="scfw-patterns-grid">
                                    <!-- 動態生成 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const widgetDiv = document.createElement('div');
            widgetDiv.innerHTML = html;
            container.appendChild(widgetDiv);
        },
        
        // 取得元素引用（修改）
        getElements() {
            const widget = document.getElementById('stamp-custom-font-widget');
            this.elements = {
                widget: widget,
                textInput: widget.querySelector('#scfw-text'),
                fontSearch: widget.querySelector('#scfw-font-search'),
                fontsGrid: widget.querySelector('#scfw-fonts-grid'),
                shapesGrid: widget.querySelector('#scfw-shapes-grid'),
                colorsGrid: widget.querySelector('#scfw-colors-grid'),
                patternsGrid: widget.querySelector('#scfw-patterns-grid'),
                mainPreview: widget.querySelector('#scfw-main-preview'),
                mainCanvas: widget.querySelector('#scfw-main-canvas')
            };
        },
        
        // 載入配置（保持不變）
        async loadConfig() {
            try {
                console.log('📋 開始載入配置檔案...');
                const response = await fetch(CONFIG.CONFIG_URL + '?t=' + Date.now());
                if (response.ok) {
                    const data = await response.json();
                    this.config = data;
                    console.log('✅ 配置載入成功:', data);
                    
                    // 處理字體配置
                    if (data.fonts && data.fonts.length > 0) {
                        this.fonts = data.fonts.map((font, index) => ({
                            ...font,
                            id: font.id || `font_${index}`,
                            displayName: font.displayName || font.name,
                            category: font.category || 'custom'
                        }));
                    } else {
                        this.fonts = this.defaultFonts;
                    }
                    
                    // 處理形狀配置
                    if (data.shapes && data.shapes.length > 0) {
                        this.shapes = data.shapes.map((shape, index) => ({
                            ...shape,
                            id: shape.id || `shape_${index}`
                        }));
                    } else {
                        this.shapes = this.defaultShapes;
                    }
                    
                    // 處理顏色配置
                    if (data.colors && data.colors.length > 0) {
                        this.colors = data.colors;
                    } else {
                        this.colors = this.defaultColors;
                    }
                    
                    // 處理圖案配置
                    if (data.patterns && data.patterns.length > 0) {
                        this.patterns = [
                            { id: 'none', name: '無', filename: '' },
                            ...data.patterns.map((pattern, index) => ({
                                ...pattern,
                                id: pattern.id || `pattern_${index}`
                            }))
                        ];
                    } else {
                        this.patterns = this.defaultPatterns;
                    }
                    
                } else {
                    throw new Error('無法載入配置');
                }
            } catch (error) {
                console.warn('⚠️ 使用預設配置:', error);
                this.fonts = this.defaultFonts;
                this.shapes = this.defaultShapes;
                this.colors = this.defaultColors;
                this.patterns = this.defaultPatterns;
            }
            
            // 設定預設選擇
            if (this.fonts.length > 0) {
                this.currentSelection.font = this.fonts[0];
                this.currentSelection.fontId = this.fonts[0].id;
            }
            
            console.log('📦 最終字體列表:', this.fonts);
        },
        
        // 初始化形狀（保持不變）
        initializeShapes() {
            const shapesGrid = this.elements.shapesGrid;
            shapesGrid.innerHTML = '';
            
            this.shapes.forEach((shape, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-shape-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.shape = shape.id;
                
                // 判斷是使用圖片還是 CSS 繪製
                let preview = '';
                if (shape.filename || shape.githubPath) {
                    // 使用圖片
                    const imgUrl = shape.githubPath ? 
                        `${CONFIG.BASE_URL}/${shape.githubPath}` : 
                        `${CONFIG.SHAPES_BASE_URL}/${shape.filename}`;
                    preview = `<img src="${imgUrl}" alt="${shape.name}">`;
                } else {
                    // 使用 CSS 繪製
                    let shapeStyle = '';
                    let dimensions = '';
                    
                    switch(shape.id) {
                        case 'circle':
                            shapeStyle = 'border-radius: 50%;';
                            break;
                        case 'ellipse':
                            shapeStyle = 'border-radius: 50%; width: 60px; height: 40px;';
                            break;
                        case 'rectangle':
                            dimensions = 'width: 60px; height: 40px;';
                            break;
                    }
                    preview = `<div class="scfw-shape-preview-border" style="${shapeStyle} ${dimensions}"></div>`;
                }
                
                item.innerHTML = `
                    <div class="scfw-shape-preview">${preview}</div>
                    <span class="scfw-shape-label">${shape.name}</span>
                `;
                
                item.addEventListener('click', () => {
                    shapesGrid.querySelectorAll('.scfw-shape-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.shape = shape.id;
                    this.updateMainPreview();
                });
                
                shapesGrid.appendChild(item);
            });
        },
        
        // 初始化顏色（保持不變）
        initializeColors() {
            const colorsGrid = this.elements.colorsGrid;
            colorsGrid.innerHTML = '';
            
            this.colors.forEach((color, index) => {
                const colorGroup = document.createElement('div');
                colorGroup.className = 'scfw-color-group';
                
                const mainColor = document.createElement('div');
                mainColor.className = 'scfw-color-main';
                if (index === 0) mainColor.classList.add('selected');
                mainColor.style.backgroundColor = color.main;
                mainColor.style.position = 'relative';
                mainColor.dataset.color = color.main;
                
                mainColor.addEventListener('click', () => {
                    colorsGrid.querySelectorAll('.scfw-color-main').forEach(el => el.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.currentSelection.color = color.main;
                    this.updateMainPreview();
                });
                
                colorGroup.appendChild(mainColor);
                colorsGrid.appendChild(colorGroup);
            });
        },
        
        // 初始化圖案（保持不變）
        initializePatterns() {
            const patternsGrid = this.elements.patternsGrid;
            patternsGrid.innerHTML = '';
            
            this.patterns.forEach((pattern, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-pattern-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.pattern = pattern.id;
                
                if (pattern.id === 'none') {
                    item.innerHTML = '<span class="scfw-pattern-none">無</span>';
                } else {
                    // 使用圖片
                    const imgUrl = pattern.githubPath ? 
                        `${CONFIG.BASE_URL}/${pattern.githubPath}` : 
                        pattern.filename ? `${CONFIG.PATTERNS_BASE_URL}/${pattern.filename}` : '';
                    
                    if (imgUrl) {
                        item.innerHTML = `<div class="scfw-pattern-preview"><img src="${imgUrl}" alt="${pattern.name}"></div>`;
                    } else {
                        item.innerHTML = `<span class="scfw-pattern-none">${pattern.name}</span>`;
                    }
                }
                
                item.addEventListener('click', () => {
                    patternsGrid.querySelectorAll('.scfw-pattern-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                });
                
                patternsGrid.appendChild(item);
            });
        },
        
        // 載入字體（使用另一個 repo 的邏輯）
        async loadFont(fontData) {
            if (this.loadedFonts[fontData.id]) {
                return this.loadedFonts[fontData.id];
            }
            
            try {
                // 系統字體直接返回
                if (fontData.systemFont) {
                    this.loadedFonts[fontData.id] = { systemFont: fontData.systemFont };
                    return this.loadedFonts[fontData.id];
                }
                
                // 建構字體 URL
                let fontUrl = null;
                if (fontData.githubPath) {
                    fontUrl = `${CONFIG.BASE_URL}/${fontData.githubPath}`;
                } else if (fontData.filename) {
                    fontUrl = `${CONFIG.FONTS_BASE_URL}/${encodeURIComponent(fontData.filename)}`;
                }
                
                if (!fontUrl) throw new Error('無字體路徑');
                
                console.log(`🔄 載入字體: ${fontData.displayName} from ${fontUrl}`);
                
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`, 
                    `url("${fontUrl}")`
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loadedFonts[fontData.id] = fontFace;
                
                console.log(`✅ 字體載入成功: ${fontData.displayName}`);
                return fontFace;
                
            } catch (error) {
                console.error(`❌ 載入字體失敗 ${fontData.displayName}:`, error);
                this.fontLoadErrors[fontData.id] = error.message;
                return null;
            }
        },
        
        // 建立預覽 Canvas（新增方法）
        createPreviewCanvas(text, fontData, color) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 設定 Canvas 大小
            canvas.width = 200;
            canvas.height = 60;
            
            // 清空 Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 設定字體和樣式
            let fontFamily;
            if (fontData.systemFont) {
                fontFamily = fontData.systemFont;
            } else {
                fontFamily = `CustomFont${fontData.id}`;
            }
            
            ctx.font = `32px ${fontFamily}`;
            ctx.fillStyle = color || '#333333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 繪製文字
            ctx.fillText(text.substring(0, 2) || '印', canvas.width / 2, canvas.height / 2);
            
            return canvas;
        },
        
        // 建立字體卡片（修改為使用 Canvas）
        createFontCard(fontData) {
            const item = document.createElement('div');
            item.className = 'scfw-font-item';
            item.dataset.fontId = fontData.id;
            item.dataset.fontName = fontData.name;
            item.dataset.category = fontData.category;
            item.style.position = 'relative';
            
            if (fontData.id === this.currentSelection.fontId) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="scfw-font-preview">
                    <span style="opacity: 0.3;">載入中...</span>
                </div>
                <div class="scfw-font-label">${fontData.displayName}</div>
            `;
            
            // 點擊事件
            item.addEventListener('click', () => {
                // 如果字體載入失敗，不允許選擇
                if (this.fontLoadErrors[fontData.id]) {
                    alert(`無法選擇此字體：${this.fontLoadErrors[fontData.id]}`);
                    return;
                }
                
                this.elements.widget.querySelectorAll('.scfw-font-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                this.currentSelection.font = fontData;
                this.currentSelection.fontId = fontData.id;
                
                this.updateMainPreview();
            });
            
            // 異步載入字體並建立預覽
            this.loadFont(fontData).then(() => {
                const previewDiv = item.querySelector('.scfw-font-preview');
                previewDiv.innerHTML = '';
                
                // 使用 Canvas 建立預覽
                const canvas = this.createPreviewCanvas(
                    this.currentSelection.text, 
                    fontData, 
                    this.currentSelection.color
                );
                previewDiv.appendChild(canvas);
                
            }).catch(error => {
                const previewDiv = item.querySelector('.scfw-font-preview');
                previewDiv.innerHTML = '<div style="color: #e57373; font-size: 14px;">載入失敗</div>';
            });
            
            return item;
        },
        
        // 載入所有字體
        async loadAllFonts() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.elements.fontsGrid.innerHTML = `
                <div class="scfw-loading">
                    <div class="scfw-loading-spinner"></div>
                    <div class="scfw-loading-text">正在載入字體...</div>
                </div>
            `;
            
            console.log('🚀 開始載入所有字體...');
            
            // 短暫延遲以顯示載入動畫
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.elements.fontsGrid.innerHTML = '';
            
            // 依序建立字體卡片
            for (const fontData of this.fonts) {
                const card = this.createFontCard(fontData);
                this.elements.fontsGrid.appendChild(card);
            }
            
            this.isLoading = false;
        },
        
        // 更新主預覽（使用 Canvas）
        updateMainPreview() {
            const canvas = this.elements.mainCanvas;
            const ctx = canvas.getContext('2d');
            const font = this.currentSelection.font;
            
            // 清空 Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 繪製印章形狀
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const size = 180;
            
            ctx.save();
            
            // 設定樣式
            ctx.strokeStyle = this.currentSelection.color;
            ctx.lineWidth = 5;
            
            // 繪製形狀
            switch(this.currentSelection.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case 'ellipse':
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case 'rectangle':
                    ctx.strokeRect(centerX - size * 0.55, centerY - size * 0.35, size * 1.1, size * 0.7);
                    break;
                    
                case 'square':
                    ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
                    break;
            }
            
            ctx.restore();
            
            // 繪製文字
            if (font) {
                ctx.save();
                
                let fontFamily;
                if (font.systemFont) {
                    fontFamily = font.systemFont;
                } else if (this.loadedFonts[font.id]) {
                    fontFamily = `CustomFont${font.id}`;
                } else {
                    fontFamily = 'serif';
                }
                
                ctx.font = `bold 48px ${fontFamily}`;
                ctx.fillStyle = this.currentSelection.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 根據文字長度調整
                const text = this.currentSelection.text;
                if (text.length > 2 && (this.currentSelection.shape === 'circle' || this.currentSelection.shape === 'square')) {
                    // 分行顯示
                    const half = Math.ceil(text.length / 2);
                    const line1 = text.substring(0, half);
                    const line2 = text.substring(half);
                    
                    ctx.font = `bold 36px ${fontFamily}`;
                    ctx.fillText(line1, centerX, centerY - 25);
                    ctx.fillText(line2, centerX, centerY + 25);
                } else {
                    // 單行顯示
                    ctx.fillText(text, centerX, centerY);
                }
                
                ctx.restore();
            }
            
            // 繪製圖案
            const pattern = this.patterns.find(p => p.id === this.currentSelection.pattern);
            if (pattern && pattern.id !== 'none') {
                const imgUrl = pattern.githubPath ? 
                    `${CONFIG.BASE_URL}/${pattern.githubPath}` : 
                    pattern.filename ? `${CONFIG.PATTERNS_BASE_URL}/${pattern.filename}` : '';
                
                if (imgUrl) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.save();
                        ctx.globalAlpha = 0.2;
                        ctx.drawImage(img, canvas.width - 50, canvas.height - 50, 32, 32);
                        ctx.restore();
                    };
                    img.src = imgUrl;
                }
            }
        },
        
        // 更新所有字體預覽（使用 Canvas）
        updateAllFontPreviews() {
            this.elements.widget.querySelectorAll('.scfw-font-item').forEach(item => {
                const fontId = item.dataset.fontId;
                const fontData = this.fonts.find(f => f.id === fontId);
                
                if (fontData && this.loadedFonts[fontId]) {
                    const previewDiv = item.querySelector('.scfw-font-preview');
                    previewDiv.innerHTML = '';
                    
                    const canvas = this.createPreviewCanvas(
                        this.currentSelection.text,
                        fontData,
                        this.currentSelection.color
                    );
                    previewDiv.appendChild(canvas);
                }
            });
        },
        
        // 篩選字體
        filterFonts(category) {
            const items = this.elements.fontsGrid.querySelectorAll('.scfw-font-item');
            items.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        },
        
        // 搜尋字體
        searchFonts(keyword) {
            const items = this.elements.fontsGrid.querySelectorAll('.scfw-font-item');
            const lowerKeyword = keyword.toLowerCase();
            
            items.forEach(item => {
                const fontName = item.querySelector('.scfw-font-label').textContent.toLowerCase();
                if (fontName.includes(lowerKeyword)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        },
        
        // 綁定事件（修改）
        bindEvents() {
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                this.updateMainPreview();
                this.updateAllFontPreviews();
            });
            
            // 字體搜尋
            this.elements.fontSearch.addEventListener('input', (e) => {
                this.searchFonts(e.target.value);
            });
            
            // 分類按鈕
            this.elements.widget.querySelectorAll('.scfw-category').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.elements.widget.querySelectorAll('.scfw-category').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentSelection.category = btn.dataset.category;
                    this.filterFonts(btn.dataset.category);
                });
            });
            
            // Canvas 點擊事件（可選）
            this.elements.mainCanvas.addEventListener('click', () => {
                // 可以加入下載功能等
                console.log('Canvas clicked');
            });
        }
    };
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            StampFontWidget.init();
        });
    } else {
        StampFontWidget.init();
    }
    
    // 暴露到全域
    window.StampFontWidget = StampFontWidget;
    
    // 版本資訊
    console.log('%c🎯 印章預覽系統 v11.3.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c📅 最後更新: 2025-01-30', 'color: #666;');
    console.log('%c✅ 使用 Canvas 渲染確保字體正確顯示', 'color: #28a745;');
    console.log('%c📁 字體路徑: ' + CONFIG.FONTS_BASE_URL, 'color: #0066cc;');
    
})();
