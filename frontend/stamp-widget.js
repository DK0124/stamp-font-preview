/**
 * 印章預覽系統 - 優化版
 * @author DK0124
 * @version 11.6.0
 * @date 2025-01-30
 * @description 修正 Canvas 警告並優化字體載入
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
    
    // 建立樣式（保持原有，這裡只顯示關鍵部分）
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
            width: 250px;
            height: 250px;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
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
            { id: 1, name: '粉圓體', filename: '粉圓體全繁體.ttf', displayName: '粉圓體', category: 'modern' },
            { id: 2, name: '粒線體不等寬', filename: '粒線體不等寬全繁體.ttf', displayName: '粒線體(不等寬)', category: 'modern' },
            { id: 3, name: '粒線體等寬', filename: '粒線體等寬全繁體.ttf', displayName: '粒線體(等寬)', category: 'modern' },
            { id: 4, name: '粗線體不等寬', filename: '粗線體不等寬版 全繁體.ttf', displayName: '粗線體(不等寬)', category: 'modern' },
            { id: 5, name: '粗線體等寬', filename: '粗線體等寬版 全繁體.ttf', displayName: '粗線體(等寬)', category: 'modern' },
            { id: 6, name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf', displayName: '胖西手寫體', category: 'handwrite' },
            { id: 7, name: '辰宇落雁體', filename: '辰宇落雁體 不等寬版全繁體.ttf', displayName: '辰宇落雁體', category: 'handwrite' }
        ],
        
        defaultShapes: [
            { id: 'circle', name: '圓形' },
            { id: 'square', name: '方形' },
            { id: 'ellipse', name: '橢圓形' },
            { id: 'rectangle', name: '長方形' }
        ],
        
        defaultColors: [
            { main: '#e57373', name: '珊瑚紅' },
            { main: '#9fb28e', name: '抹茶綠' },
            { main: '#64b5f6', name: '天空藍' },
            { main: '#ffb74d', name: '琥珀黃' }
        ],
        
        defaultPatterns: [
            { id: 'none', name: '無', filename: '' }
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
        updateTimeout: null,
        
        // 初始化
        async init() {
            try {
                console.log('🚀 印章預覽系統開始初始化...');
                
                // 建立 HTML 結構
                this.createHTML();
                
                // 取得元素引用
                this.getElements();
                
                // 初始化 Canvas
                this.initMainCanvas();
                
                // 嘗試載入配置，失敗則使用預設值
                await this.loadConfig();
                
                // 初始化各元件
                this.initializeShapes();
                this.initializeColors();
                this.initializePatterns();
                
                // 綁定事件
                this.bindEvents();
                
                // 載入字體
                setTimeout(() => {
                    this.generatePreviews();
                }, 100);
                
                console.log('✅ 印章預覽系統初始化完成');
                
            } catch (error) {
                console.error('❌ Widget 初始化失敗:', error);
            }
        },
        
        // 建立 HTML
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
                                    <canvas id="scfw-main-canvas" class="scfw-main-canvas"></canvas>
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
        
        // 取得元素引用
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
        
        // 初始化主 Canvas
        initMainCanvas() {
            const canvas = this.elements.mainCanvas;
            const dpr = window.devicePixelRatio || 1;
            
            // 設定顯示大小
            const displayWidth = 250;
            const displayHeight = 250;
            
            // 設定實際大小（考慮 DPR）
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            
            // 設定 CSS 大小
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            
            // 取得 context 並縮放
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
        },
        
        // 載入配置
        async loadConfig() {
            try {
                console.log('📋 載入預設配置...');
                this.fonts = this.defaultFonts;
                this.shapes = this.defaultShapes;
                this.colors = this.defaultColors;
                this.patterns = this.defaultPatterns;
                
                // 設定預設選擇
                if (this.fonts.length > 0) {
                    this.currentSelection.font = this.fonts[0];
                    this.currentSelection.fontId = this.fonts[0].id;
                }
            } catch (error) {
                console.error('配置載入錯誤:', error);
            }
        },
        
        // 初始化形狀
        initializeShapes() {
            const shapesGrid = this.elements.shapesGrid;
            shapesGrid.innerHTML = '';
            
            this.shapes.forEach((shape, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-shape-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.shape = shape.id;
                
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
                
                item.innerHTML = `
                    <div class="scfw-shape-preview">
                        <div class="scfw-shape-preview-border" style="${shapeStyle} ${dimensions}"></div>
                    </div>
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
        
        // 初始化顏色
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
                    
                    // 更新所有字體預覽的顏色
                    if (this.elements.fontsGrid.querySelectorAll('.scfw-font-item').length > 0) {
                        this.generatePreviews();
                    }
                });
                
                colorGroup.appendChild(mainColor);
                colorsGrid.appendChild(colorGroup);
            });
        },
        
        // 初始化圖案
        initializePatterns() {
            const patternsGrid = this.elements.patternsGrid;
            patternsGrid.innerHTML = '';
            
            this.patterns.forEach((pattern, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-pattern-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.pattern = pattern.id;
                
                item.innerHTML = '<span class="scfw-pattern-none">無</span>';
                
                item.addEventListener('click', () => {
                    patternsGrid.querySelectorAll('.scfw-pattern-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                });
                
                patternsGrid.appendChild(item);
            });
        },
        
        // 載入字體（參考另一個 repo 的方式）
        async loadFont(fontData) {
            if (this.loadedFonts[fontData.id]) {
                return this.loadedFonts[fontData.id];
            }
            
            try {
                const fontUrl = `${CONFIG.FONTS_BASE_URL}/${encodeURIComponent(fontData.filename)}`;
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`, 
                    `url(${fontUrl})`
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loadedFonts[fontData.id] = fontFace;
                
                console.log(`✅ 字體載入成功: ${fontData.displayName}`);
                return fontFace;
                
            } catch (error) {
                console.error(`Failed to load font ${fontData.name}:`, error);
                this.fontLoadErrors[fontData.id] = error.message;
                return null;
            }
        },
        
        // 建立預覽 Canvas（參考另一個 repo）
        createPreviewCanvas(text, fontData, color) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 400;
            canvas.height = 100;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set font and style
            ctx.font = `40px CustomFont${fontData.id}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw text
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            return canvas;
        },
        
        // 生成所有字體預覽（參考另一個 repo 的方式）
        async generatePreviews() {
            this.isLoading = true;
            
            const text = this.currentSelection.text || '印章範例';
            this.elements.fontsGrid.innerHTML = '';
            
            for (const font of this.fonts) {
                const card = document.createElement('div');
                card.className = 'scfw-font-item';
                card.setAttribute('data-id', font.id);
                card.dataset.fontId = font.id;
                card.dataset.fontName = font.name;
                card.dataset.category = font.category;
                card.style.position = 'relative';
                
                if (this.currentSelection.fontId === font.id) {
                    card.classList.add('selected');
                }
                
                card.innerHTML = `
                    <div class="scfw-font-preview">
                        <div class="scfw-loading-text">載入中...</div>
                    </div>
                    <div class="scfw-font-label">${font.displayName}</div>
                `;
                
                // Add click event
                card.addEventListener('click', () => {
                    document.querySelectorAll('.scfw-font-item').forEach(c => {
                        c.classList.remove('selected');
                    });
                    
                    card.classList.add('selected');
                    this.currentSelection.fontId = font.id;
                    this.currentSelection.font = font;
                    this.updateMainPreview();
                });
                
                this.elements.fontsGrid.appendChild(card);
                
                // Load font and create preview asynchronously
                this.loadFont(font).then(() => {
                    const previewDiv = card.querySelector('.scfw-font-preview');
                    previewDiv.innerHTML = '';
                    
                    const canvas = this.createPreviewCanvas(
                        text.substring(0, 2) || '印', 
                        font, 
                        this.currentSelection.color
                    );
                    previewDiv.appendChild(canvas);
                }).catch(error => {
                    const previewDiv = card.querySelector('.scfw-font-preview');
                    previewDiv.innerHTML = '<div class="scfw-font-error">載入失敗</div>';
                });
            }
            
            this.isLoading = false;
            
            // 初始更新主預覽
            if (this.currentSelection.font) {
                this.updateMainPreview();
            }
        },
        
        // 更新主預覽
        updateMainPreview() {
            if (!this.currentSelection.font || !this.loadedFonts[this.currentSelection.fontId]) {
                return;
            }
            
            const canvas = this.elements.mainCanvas;
            const ctx = canvas.getContext('2d');
            const displayWidth = parseInt(canvas.style.width);
            const displayHeight = parseInt(canvas.style.height);
            
            // Clear canvas
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            
            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, displayWidth, displayHeight);
            
            // Draw shape
            const centerX = displayWidth / 2;
            const centerY = displayHeight / 2;
            const size = 180;
            
            ctx.save();
            ctx.strokeStyle = this.currentSelection.color;
            ctx.lineWidth = 5;
            
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
            
            // Draw text
            ctx.save();
            ctx.font = `bold 48px CustomFont${this.currentSelection.fontId}`;
            ctx.fillStyle = this.currentSelection.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const text = this.currentSelection.text || '印章範例';
            
            if (text.length > 2 && (this.currentSelection.shape === 'circle' || this.currentSelection.shape === 'square')) {
                const half = Math.ceil(text.length / 2);
                const line1 = text.substring(0, half);
                const line2 = text.substring(half);
                
                ctx.font = `bold 36px CustomFont${this.currentSelection.fontId}`;
                ctx.fillText(line1, centerX, centerY - 25);
                ctx.fillText(line2, centerX, centerY + 25);
            } else {
                ctx.fillText(text, centerX, centerY);
            }
            
            ctx.restore();
        },
        
        // 綁定事件
        bindEvents() {
            let inputTimeout;
            
            // 文字輸入（使用 debounce）
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                
                if (this.elements.fontsGrid.querySelectorAll('.scfw-font-item').length > 0) {
                    clearTimeout(inputTimeout);
                    inputTimeout = setTimeout(() => {
                        this.generatePreviews();
                    }, 500);
                }
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
    console.log('%c🎯 印章預覽系統 v11.6.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c📅 最後更新: 2025-01-30', 'color: #666;');
    console.log('%c✅ 採用另一個 repo 的成功載入邏輯', 'color: #28a745;');
    console.log('%c✅ 修正 Canvas willReadFrequently 警告', 'color: #28a745;');
    
})();
