/**
 * 印章預覽系統 - 後台資料整合版
 * @author DK0124
 * @version 10.0.0
 * @date 2025-01-29
 * @description 完整整合後台 admin 系統的印章預覽小工具
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window._STAMP_WIDGET_V10_LOADED) return;
    window._STAMP_WIDGET_V10_LOADED = true;
    
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
        }
    };
    
    // 建立樣式 - 基於成功版本
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
        
        /* 載入提示 */
        #stamp-custom-font-widget .scfw-loading-container {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-loading {
            text-align: center;
            padding: 60px;
            color: #999;
        }
        
        #stamp-custom-font-widget .scfw-loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 16px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #9fb28e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 錯誤提示 */
        #stamp-custom-font-widget .scfw-error {
            text-align: center;
            padding: 40px;
            color: #e57373;
        }
        
        #stamp-custom-font-widget .scfw-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        /* 標籤頁 */
        #stamp-custom-font-widget .scfw-tabs {
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-tab-header {
            display: flex;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-tab-button {
            padding: 12px 24px;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            font-size: 15px;
            font-weight: 600;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-tab-button:hover {
            color: #333;
        }
        
        #stamp-custom-font-widget .scfw-tab-button.active {
            color: #9fb28e;
            border-bottom-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-tab-content {
            display: none;
        }
        
        #stamp-custom-font-widget .scfw-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
            border-color: #9fb28e;
            background: #f0fff4;
        }
        
        #stamp-custom-font-widget .scfw-font-card.selected::after {
            content: '✓';
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: #9fb28e;
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
        
        #stamp-custom-font-widget .scfw-stamp-text {
            font-size: 40px;
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
        
        #stamp-custom-font-widget .scfw-font-name {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            background: #f0f0f0;
            color: #333;
            border-top: 1px solid #e0e0e0;
        }
        
        #stamp-custom-font-widget .scfw-font-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            color: #999;
        }
        
        /* 形狀網格 */
        #stamp-custom-font-widget .scfw-shape-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
        }
        
        #stamp-custom-font-widget .scfw-shape-item {
            aspect-ratio: 1;
            background: #f8f9fa;
            border: 2px solid #ddd;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-shape-item:hover {
            transform: scale(1.05);
            border-color: #B5D5B0;
        }
        
        #stamp-custom-font-widget .scfw-shape-item.selected {
            background: #f0fff4;
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        #stamp-custom-font-widget .scfw-shape-label {
            font-size: 12px;
            font-weight: 500;
            color: #555;
        }
        
        /* 顏色網格 */
        #stamp-custom-font-widget .scfw-color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-color-item {
            text-align: center;
            cursor: pointer;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 60px;
            height: 60px;
            margin: 0 auto 8px;
            border-radius: 12px;
            transition: all 0.3s;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        #stamp-custom-font-widget .scfw-color-item.selected .scfw-color-main {
            transform: scale(1.1);
            box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.2),
                inset 0 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        #stamp-custom-font-widget .scfw-color-item.selected .scfw-color-main::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        #stamp-custom-font-widget .scfw-color-name {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        /* 圖案網格 */
        #stamp-custom-font-widget .scfw-pattern-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: #f8f9fa;
            border: 2px solid #ddd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            transform: scale(1.05);
            border-color: #B5D5B0;
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
        
        /* 主預覽區 */
        #stamp-custom-font-widget .scfw-main-preview {
            background: linear-gradient(135deg, #9fb28e 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-main-preview-title {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-main-canvas-wrapper {
            display: inline-block;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-main-canvas {
            cursor: zoom-in;
            transition: transform 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-main-canvas:hover {
            transform: scale(1.05);
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
            
            #stamp-custom-font-widget .scfw-tab-header {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            #stamp-custom-font-widget .scfw-tab-button {
                white-space: nowrap;
                flex-shrink: 0;
            }
        }
    `;
    
    // 注入樣式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Widget 主類
    class StampWidget {
        constructor() {
            this.config = null;
            this.currentSelection = {
                text: '印章預覽',
                font: null,
                fontId: null,
                shape: null,
                shapeId: null,
                pattern: null,
                patternId: null,
                color: null,
                colorId: null
            };
            this.loadedFonts = {};
            this.elements = {};
            this.canvas = null;
            this.ctx = null;
            this.bvShopListeners = [];
            
            this.init();
        }
        
        async init() {
            try {
                // 建立容器
                this.createContainer();
                
                // 顯示載入狀態
                this.showLoading();
                
                // 載入配置
                await this.loadConfig();
                
                // 建立 UI
                this.buildUI();
                
                // 綁定事件
                this.bindEvents();
                
                // 設定 BV Shop 監聽
                setTimeout(() => {
                    this.setupBVShopListeners();
                    this.loadFromBVShop();
                }, 500);
                
            } catch (error) {
                console.error('初始化失敗:', error);
                this.showError(error.message);
            }
        }
        
        createContainer() {
            const container = document.getElementById('stamp-font-widget-container') || 
                           document.getElementById('stamp-preview-root') ||
                           document.body;
            
            const widgetDiv = document.createElement('div');
            widgetDiv.id = 'stamp-widget-container';
            container.appendChild(widgetDiv);
            
            this.container = widgetDiv;
        }
        
        showLoading() {
            this.container.innerHTML = `
                <div id="stamp-custom-font-widget">
                    <div class="scfw-loading-container">
                        <div class="scfw-loading">
                            <div class="scfw-loading-spinner"></div>
                            <div>正在載入印章系統...</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        showError(message) {
            this.container.innerHTML = `
                <div id="stamp-custom-font-widget">
                    <div class="scfw-error">
                        <div class="scfw-error-icon">⚠️</div>
                        <div>載入失敗：${message}</div>
                    </div>
                </div>
            `;
        }
        
        async loadConfig() {
            const response = await fetch(CONFIG.CONFIG_URL + '?t=' + Date.now());
            if (!response.ok) {
                throw new Error('無法載入配置檔案');
            }
            
            this.config = await response.json();
            console.log('配置載入成功:', this.config);
            
            // 設定預設值
            if (this.config.fonts?.length > 0) {
                this.currentSelection.font = this.config.fonts[0];
                this.currentSelection.fontId = 0;
            }
            
            if (this.config.shapes?.length > 0) {
                this.currentSelection.shape = this.config.shapes[0];
                this.currentSelection.shapeId = 0;
            }
            
            if (this.config.colors?.length > 0) {
                this.currentSelection.color = this.config.colors[0];
                this.currentSelection.colorId = 0;
            }
        }
        
        buildUI() {
            const html = `
                <div id="stamp-custom-font-widget">
                    <!-- 標題 -->
                    <div class="scfw-header">
                        <h2 class="scfw-title">🎯 印章即時預覽系統</h2>
                        <p class="scfw-subtitle">選擇您喜愛的樣式，打造專屬印章</p>
                    </div>
                    
                    <!-- 主預覽區 -->
                    <div class="scfw-main-preview">
                        <h3 class="scfw-main-preview-title">印章預覽</h3>
                        <div class="scfw-main-canvas-wrapper">
                            <canvas id="scfw-main-canvas" 
                                    class="scfw-main-canvas" 
                                    width="250" 
                                    height="250">
                            </canvas>
                        </div>
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
                                       value="${this.currentSelection.text}">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 標籤頁 -->
                    <div class="scfw-tabs">
                        <div class="scfw-tab-header">
                            <button class="scfw-tab-button active" data-tab="fonts">字體</button>
                            <button class="scfw-tab-button" data-tab="shapes">形狀</button>
                            <button class="scfw-tab-button" data-tab="colors">顏色</button>
                            <button class="scfw-tab-button" data-tab="patterns">圖案</button>
                        </div>
                        
                        <!-- 字體內容 -->
                        <div class="scfw-tab-content active" data-tab="fonts">
                            <div class="scfw-font-grid" id="scfw-font-grid">
                                <div class="scfw-loading">
                                    <div class="scfw-loading-spinner"></div>
                                    <div>正在載入字體...</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 形狀內容 -->
                        <div class="scfw-tab-content" data-tab="shapes">
                            <div class="scfw-shape-grid" id="scfw-shape-grid">
                                ${this.renderShapes()}
                            </div>
                        </div>
                        
                        <!-- 顏色內容 -->
                        <div class="scfw-tab-content" data-tab="colors">
                            <div class="scfw-color-grid" id="scfw-color-grid">
                                ${this.renderColors()}
                            </div>
                        </div>
                        
                        <!-- 圖案內容 -->
                        <div class="scfw-tab-content" data-tab="patterns">
                            <div class="scfw-pattern-grid" id="scfw-pattern-grid">
                                ${this.renderPatterns()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.container.innerHTML = html;
            
            // 儲存元素引用
            this.elements = {
                widget: document.getElementById('stamp-custom-font-widget'),
                textInput: document.getElementById('scfw-text'),
                canvas: document.getElementById('scfw-main-canvas'),
                fontGrid: document.getElementById('scfw-font-grid'),
                shapeGrid: document.getElementById('scfw-shape-grid'),
                colorGrid: document.getElementById('scfw-color-grid'),
                patternGrid: document.getElementById('scfw-pattern-grid')
            };
            
            // 初始化 Canvas
            this.initCanvas();
            
            // 載入字體
            this.loadAllFonts();
            
            // 更新預覽
            this.updateMainPreview();
        }
        
        renderShapes() {
            if (!this.config.shapes?.length) return '<div class="scfw-loading">無可用形狀</div>';
            
            return this.config.shapes.map((shape, index) => {
                let preview = '';
                if (shape.githubPath) {
                    preview = `<img src="${CONFIG.BASE_URL}/${shape.githubPath}" alt="${shape.name}">`;
                } else {
                    // 使用 CSS 繪製基本形狀
                    let style = '';
                    switch(shape.name) {
                        case '圓形':
                            style = 'border: 3px solid #9fb28e; border-radius: 50%; width: 50px; height: 50px;';
                            break;
                        case '橢圓形':
                            style = 'border: 3px solid #9fb28e; border-radius: 50%; width: 60px; height: 40px;';
                            break;
                        case '長方形':
                            style = 'border: 3px solid #9fb28e; width: 60px; height: 40px;';
                            break;
                        case '方形':
                            style = 'border: 3px solid #9fb28e; width: 50px; height: 50px;';
                            break;
                        default:
                            style = 'border: 3px solid #9fb28e; border-radius: 12px; width: 50px; height: 50px;';
                    }
                    preview = `<div style="${style}"></div>`;
                }
                
                return `
                    <div class="scfw-shape-item ${index === this.currentSelection.shapeId ? 'selected' : ''}" 
                         data-shape-index="${index}">
                        <div class="scfw-shape-preview">${preview}</div>
                        <div class="scfw-shape-label">${shape.name}</div>
                    </div>
                `;
            }).join('');
        }
        
        renderColors() {
            if (!this.config.colors?.length) return '<div class="scfw-loading">無可用顏色</div>';
            
            return this.config.colors.map((color, index) => `
                <div class="scfw-color-item ${index === this.currentSelection.colorId ? 'selected' : ''}" 
                     data-color-index="${index}">
                    <div class="scfw-color-main" style="background: ${color.main}"></div>
                    <div class="scfw-color-name">${color.name}</div>
                </div>
            `).join('');
        }
        
        renderPatterns() {
            const items = ['<div class="scfw-pattern-item selected" data-pattern-index="-1"><div class="scfw-pattern-preview"><span style="font-size: 14px; color: #999;">無</span></div></div>'];
            
            if (this.config.patterns?.length) {
                this.config.patterns.forEach((pattern, index) => {
                    let preview = '';
                    if (pattern.githubPath) {
                        preview = `<img src="${CONFIG.BASE_URL}/${pattern.githubPath}" alt="${pattern.name}">`;
                    } else {
                        preview = `<span style="font-size: 12px; color: #999;">?</span>`;
                    }
                    
                    items.push(`
                        <div class="scfw-pattern-item" data-pattern-index="${index}">
                            <div class="scfw-pattern-preview">${preview}</div>
                        </div>
                    `);
                });
            }
            
            return items.join('');
        }
        
        initCanvas() {
            this.canvas = this.elements.canvas;
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            
            // 設定高解析度
            const dpr = window.devicePixelRatio || 1;
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
        
        async loadAllFonts() {
            const fontGrid = this.elements.fontGrid;
            if (!fontGrid) return;
            
            // 清空載入狀態
            fontGrid.innerHTML = '';
            
            // 建立所有字體卡片
            for (let i = 0; i < this.config.fonts.length; i++) {
                const font = this.config.fonts[i];
                const card = this.createFontCard(font, i);
                fontGrid.appendChild(card);
                
                // 異步載入字體
                this.loadFont(font, i);
            }
        }
        
        createFontCard(font, index) {
            const card = document.createElement('div');
            card.className = 'scfw-font-card';
            if (index === this.currentSelection.fontId) card.classList.add('selected');
            card.dataset.fontIndex = index;
            card.dataset.fontName = font.displayName || font.name;
            
            card.innerHTML = `
                <div class="scfw-stamp-preview">
                    <div class="scfw-font-loading">載入中...</div>
                </div>
                <div class="scfw-font-name">${font.displayName || font.name}</div>
            `;
            
            // 點擊事件
            card.addEventListener('click', () => {
                this.selectFont(index);
            });
            
            return card;
        }
        
        async loadFont(fontData, index) {
            try {
                const preview = this.elements.fontGrid.querySelector(`[data-font-index="${index}"] .scfw-stamp-preview`);
                if (!preview) return;
                
                // 系統字體
                if (fontData.systemFont) {
                    this.loadedFonts[fontData.id] = { systemFont: fontData.systemFont };
                    this.updateFontPreview(preview, fontData, index);
                    return;
                }
                
                // 檢查是否已載入
                if (this.loadedFonts[fontData.id]) {
                    this.updateFontPreview(preview, fontData, index);
                    return;
                }
                
                // 載入自訂字體
                let fontUrl = null;
                if (fontData.githubPath) {
                    fontUrl = `${CONFIG.BASE_URL}/${fontData.githubPath}`;
                } else if (fontData.filename) {
                    fontUrl = `${CONFIG.BASE_URL}/assets/fonts/${fontData.filename}`;
                }
                
                if (!fontUrl) {
                    throw new Error('無效的字體路徑');
                }
                
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`,
                    `url("${fontUrl}")`,
                    {
                        weight: fontData.weight || 'normal',
                        style: 'normal'
                    }
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                
                this.loadedFonts[fontData.id] = fontFace;
                this.updateFontPreview(preview, fontData, index);
                
            } catch (error) {
                console.error(`載入字體失敗: ${fontData.name}`, error);
                const preview = this.elements.fontGrid.querySelector(`[data-font-index="${index}"] .scfw-stamp-preview`);
                if (preview) {
                    preview.innerHTML = '<span style="color: #e57373; font-size: 14px;">載入失敗</span>';
                }
            }
        }
        
        updateFontPreview(preview, fontData, index) {
            const shape = this.currentSelection.shape || this.config.shapes[0];
            const color = this.currentSelection.color || this.config.colors[0];
            const pattern = this.currentSelection.pattern;
            
            let stampClass = '方形';
            if (shape.name === '圓形') stampClass = '圓形';
            else if (shape.name === '橢圓形') stampClass = '橢圓形';
            else if (shape.name === '長方形') stampClass = '長方形';
            
            preview.innerHTML = `
                <div class="scfw-stamp ${stampClass}" style="
                    width: 160px;
                    height: 160px;
                    border: 4px solid ${color.main || '#dc3545'};
                    ${stampClass === '圓形' || stampClass === '橢圓形' ? 'border-radius: 50%;' : ''}
                    ${stampClass === '橢圓形' ? 'width: 190px; height: 150px;' : ''}
                    ${stampClass === '長方形' ? 'width: 200px; height: 140px;' : ''}
                ">
                    <span class="scfw-stamp-text" style="
                        font-family: ${fontData.systemFont || `CustomFont${fontData.id}`};
                        color: ${color.main || '#dc3545'};
                    ">
                        ${this.currentSelection.text.substring(0, 2) || '印'}
                    </span>
                    ${pattern && pattern.name ? `
                        <span class="scfw-stamp-pattern">
                            ${this.getPatternSymbol(pattern.name)}
                        </span>
                    ` : ''}
                </div>
            `;
        }
        
        getPatternSymbol(name) {
            const patterns = {
                '糖果': '🍬',
                '愛心': '❤️',
                '小花': '🌸',
                '星星': '⭐',
                '月亮': '🌙',
                '太陽': '☀️'
            };
            return patterns[name] || '';
        }
        
        selectFont(index) {
            // 更新選中狀態
            this.elements.fontGrid.querySelectorAll('.scfw-font-card').forEach((card, i) => {
                card.classList.toggle('selected', i === index);
            });
            
            // 更新選擇
            this.currentSelection.font = this.config.fonts[index];
            this.currentSelection.fontId = index;
            
            // 更新所有預覽
            this.updateAllPreviews();
            
            // 同步到 BV Shop
            this.syncToBVShop('font', this.currentSelection.font.name);
        }
        
        bindEvents() {
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章預覽';
                this.updateAllPreviews();
                this.syncToBVShop('text', e.target.value);
            });
            
            // 標籤頁切換
            this.elements.widget.querySelectorAll('.scfw-tab-button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;
                    
                    // 更新按鈕狀態
                    this.elements.widget.querySelectorAll('.scfw-tab-button').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    
                    // 更新內容顯示
                    this.elements.widget.querySelectorAll('.scfw-tab-content').forEach(content => {
                        content.classList.toggle('active', content.dataset.tab === tab);
                    });
                });
            });
            
            // 形狀選擇
            this.elements.shapeGrid.addEventListener('click', (e) => {
                const item = e.target.closest('.scfw-shape-item');
                if (item) {
                    const index = parseInt(item.dataset.shapeIndex);
                    this.selectShape(index);
                }
            });
            
            // 顏色選擇
            this.elements.colorGrid.addEventListener('click', (e) => {
                const item = e.target.closest('.scfw-color-item');
                if (item) {
                    const index = parseInt(item.dataset.colorIndex);
                    this.selectColor(index);
                }
            });
            
            // 圖案選擇
            this.elements.patternGrid.addEventListener('click', (e) => {
                const item = e.target.closest('.scfw-pattern-item');
                if (item) {
                    const index = parseInt(item.dataset.patternIndex);
                    this.selectPattern(index);
                }
            });
            
            // Canvas 雙擊放大
            this.elements.canvas.addEventListener('dblclick', () => {
                this.showPreviewModal();
            });
        }
        
        selectShape(index) {
            this.elements.shapeGrid.querySelectorAll('.scfw-shape-item').forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.shape = this.config.shapes[index];
            this.currentSelection.shapeId = index;
            
            this.updateAllPreviews();
            this.syncToBVShop('shape', this.currentSelection.shape.name);
        }
        
        selectColor(index) {
            this.elements.colorGrid.querySelectorAll('.scfw-color-item').forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.color = this.config.colors[index];
            this.currentSelection.colorId = index;
            
            this.updateAllPreviews();
            this.syncToBVShop('color', this.currentSelection.color.name);
        }
        
        selectPattern(index) {
            this.elements.patternGrid.querySelectorAll('.scfw-pattern-item').forEach((item) => {
                const itemIndex = parseInt(item.dataset.patternIndex);
                item.classList.toggle('selected', itemIndex === index);
            });
            
            if (index === -1) {
                this.currentSelection.pattern = null;
                this.currentSelection.patternId = null;
            } else {
                this.currentSelection.pattern = this.config.patterns[index];
                this.currentSelection.patternId = index;
            }
            
            this.updateAllPreviews();
            this.syncToBVShop('pattern', this.currentSelection.pattern?.name || '');
        }
        
        updateAllPreviews() {
            // 更新主預覽
            this.updateMainPreview();
            
            // 更新所有字體預覽
            this.config.fonts?.forEach((font, index) => {
                const preview = this.elements.fontGrid.querySelector(`[data-font-index="${index}"] .scfw-stamp-preview`);
                if (preview && this.loadedFonts[font.id]) {
                    this.updateFontPreview(preview, font, index);
                }
            });
        }
        
        updateMainPreview() {
            const ctx = this.ctx;
            if (!ctx) return;
            
            const width = 250;
            const height = 250;
            
            // 清空畫布
            ctx.clearRect(0, 0, width, height);
            
            // 檢查是否有完整選擇
            if (!this.currentSelection.font || !this.currentSelection.shape || !this.currentSelection.color) {
                ctx.save();
                ctx.fillStyle = '#999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('請選擇字體、形狀和顏色', width / 2, height / 2);
                ctx.restore();
                return;
            }
            
            // 繪製印章
            const color = this.currentSelection.color.main || '#dc3545';
            const shape = this.currentSelection.shape;
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;
            
            ctx.save();
            
            // 設定樣式
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 5;
            
            // 繪製形狀
            switch (shape.name) {
                case '圓形':
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case '橢圓形':
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case '長方形':
                    ctx.strokeRect(centerX - size * 0.55, centerY - size * 0.35, size * 1.1, size * 0.7);
                    break;
                    
                case '方形':
                    ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
                    break;
                    
                case '圓角方形':
                    this.roundRect(ctx, centerX - size / 2, centerY - size / 2, size, size, 20);
                    ctx.stroke();
                    break;
            }
            
            ctx.restore();
            
            // 繪製圖案
            if (this.currentSelection.pattern?.githubPath) {
                const patternImg = new Image();
                patternImg.src = `${CONFIG.BASE_URL}/${this.currentSelection.pattern.githubPath}`;
                patternImg.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = 0.15;
                    
                    // 根據形狀裁剪
                    ctx.beginPath();
                    switch (shape.name) {
                        case '圓形':
                            ctx.arc(centerX, centerY, size / 2 - 3, 0, Math.PI * 2);
                            break;
                        case '橢圓形':
                            ctx.ellipse(centerX, centerY, size * 0.6 - 3, size * 0.4 - 3, 0, 0, Math.PI * 2);
                            break;
                        case '長方形':
                            ctx.rect(centerX - size * 0.55 + 3, centerY - size * 0.35 + 3, size * 1.1 - 6, size * 0.7 - 6);
                            break;
                        case '方形':
                            ctx.rect(centerX - size / 2 + 3, centerY - size / 2 + 3, size - 6, size - 6);
                            break;
                        case '圓角方形':
                            this.roundRect(ctx, centerX - size / 2 + 3, centerY - size / 2 + 3, size - 6, size - 6, 17);
                            break;
                    }
                    ctx.clip();
                    
                    // 平鋪圖案
                    const pattern = ctx.createPattern(patternImg, 'repeat');
                    ctx.fillStyle = pattern;
                    ctx.fillRect(0, 0, width, height);
                    
                    ctx.restore();
                    
                    // 重新繪製文字
                    this.drawText(ctx, centerX, centerY, size);
                };
            }
            
            // 繪製文字
            this.drawText(ctx, centerX, centerY, size);
        }
        
        drawText(ctx, centerX, centerY, size) {
            const font = this.currentSelection.font;
            const text = this.currentSelection.text;
            const color = this.currentSelection.color.main || '#dc3545';
            
            if (!text) return;
            
            ctx.save();
            
            // 設定文字樣式
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            
            // 計算字體大小
            let fontSize = size * 0.25;
            
            if (text.length === 1) {
                fontSize = size * 0.45;
            } else if (text.length === 2) {
                fontSize = size * 0.35;
            } else if (text.length >= 5) {
                fontSize = size * 0.2;
            }
            
            // 設定字體
            if (font) {
                if (font.systemFont) {
                    ctx.font = `${font.weight || 'bold'} ${fontSize}px ${font.systemFont}`;
                } else if (this.loadedFonts[font.id]) {
                    ctx.font = `${font.weight || 'bold'} ${fontSize}px CustomFont${font.id}, serif`;
                } else {
                    ctx.font = `bold ${fontSize}px serif`;
                }
            } else {
                ctx.font = `bold ${fontSize}px serif`;
            }
            
            // 繪製文字
            if (text.length > 2 && this.currentSelection.shape && 
                (this.currentSelection.shape.name === '圓形' || this.currentSelection.shape.name === '方形')) {
                // 分行顯示
                const half = Math.ceil(text.length / 2);
                const line1 = text.substring(0, half);
                const line2 = text.substring(half);
                
                const lineHeight = fontSize * 1.2;
                ctx.fillText(line1, centerX, centerY - lineHeight / 2);
                ctx.fillText(line2, centerX, centerY + lineHeight / 2);
            } else {
                // 單行顯示
                ctx.fillText(text, centerX, centerY);
            }
            
            ctx.restore();
        }
        
        roundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
        
        showPreviewModal() {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 16px; padding: 30px; max-width: 90vw; max-height: 90vh; overflow: auto;">
                    <h2 style="text-align: center; margin-bottom: 24px; color: #333;">印章預覽</h2>
                    <canvas id="modal-canvas" width="500" height="500" style="
                        display: block;
                        margin: 0 auto 24px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        max-width: 100%;
                        height: auto;
                    "></canvas>
                    <div style="text-align: center;">
                        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                            padding: 12px 24px;
                            background: #f0f0f0;
                            border: none;
                            border-radius: 6px;
                            font-size: 16px;
                            cursor: pointer;
                            margin-right: 12px;
                        ">關閉</button>
                        <button onclick="window.stampWidgetInstance.downloadImage()" style="
                            padding: 12px 24px;
                            background: #9fb28e;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 16px;
                            cursor: pointer;
                        ">下載圖片</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 保存實例引用
            window.stampWidgetInstance = this;
            
            // 繪製大尺寸預覽
            const modalCanvas = document.getElementById('modal-canvas');
            const modalCtx = modalCanvas.getContext('2d');
            modalCtx.scale(2, 2);
            
            // 暫存當前畫布
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            this.canvas = modalCanvas;
            this.ctx = modalCtx;
            this.updateMainPreview();
            
            // 恢復原畫布
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            // 點擊背景關閉
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        downloadImage() {
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            // 設定高解析度
            downloadCanvas.width = 1000;
            downloadCanvas.height = 1000;
            downloadCtx.scale(4, 4);
            
            // 白色背景
            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, 250, 250);
            
            // 暫存當前畫布
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            // 使用下載畫布重新繪製
            this.canvas = downloadCanvas;
            this.ctx = downloadCtx;
            this.updateMainPreview();
            
            // 恢復原畫布
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            // 下載
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `印章_${this.currentSelection.text}_${new Date().toISOString().split('T')[0]}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        
        // BV Shop 整合功能
        setupBVShopListeners() {
            // 清除舊的監聽器
            this.bvShopListeners.forEach(listener => {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            this.bvShopListeners = [];
            
            // 監聽字體選擇
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
                    this.selectShapeByName(e.target.value);
                };
                shapeSelect.addEventListener('change', shapeHandler);
                this.bvShopListeners.push({ element: shapeSelect, event: 'change', handler: shapeHandler });
            }
            
            // 監聽圖案選擇
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect) {
                const patternHandler = (e) => {
                    this.selectPatternByName(e.target.value);
                };
                patternSelect.addEventListener('change', patternHandler);
                this.bvShopListeners.push({ element: patternSelect, event: 'change', handler: patternHandler });
            }
            
            // 監聽顏色選擇
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect) {
                const colorHandler = (e) => {
                    this.selectColorByName(e.target.value);
                };
                colorSelect.addEventListener('change', colorHandler);
                this.bvShopListeners.push({ element: colorSelect, event: 'change', handler: colorHandler });
            }
        }
        
        selectFontByName(fontName) {
            const index = this.config.fonts.findIndex(f => f.name === fontName);
            if (index !== -1) {
                this.selectFont(index);
            }
        }
        
        selectShapeByName(shapeName) {
            const index = this.config.shapes.findIndex(s => s.name === shapeName);
            if (index !== -1) {
                this.selectShape(index);
            }
        }
        
        selectColorByName(colorName) {
            const index = this.config.colors.findIndex(c => c.name === colorName);
            if (index !== -1) {
                this.selectColor(index);
            }
        }
        
        selectPatternByName(patternName) {
            if (!patternName) {
                this.selectPattern(-1);
            } else {
                const index = this.config.patterns.findIndex(p => p.name === patternName);
                if (index !== -1) {
                    this.selectPattern(index);
                }
            }
        }
        
        syncToBVShop(field, value) {
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
                            colorSelect.value = value;
                            colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                }
            } catch (error) {
                console.error('同步錯誤:', error);
            }
        }
        
        findBVSelect(labelText) {
            const labels = document.querySelectorAll('label');
            for (let label of labels) {
                if (label.textContent.trim() === labelText) {
                    const select = label.parentElement.querySelector('select');
                    if (select) return select;
                }
            }
            return null;
        }
        
        loadFromBVShop() {
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput && textInput.value) {
                this.elements.textInput.value = textInput.value;
                this.currentSelection.text = textInput.value;
            }
            
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect && shapeSelect.value) {
                this.selectShapeByName(shapeSelect.value);
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect && patternSelect.value) {
                this.selectPatternByName(patternSelect.value);
            }
            
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect && colorSelect.value) {
                this.selectColorByName(colorSelect.value);
            }
            
            const fontSelect = this.findBVSelect('字體');
            if (fontSelect && fontSelect.value) {
                setTimeout(() => {
                    this.selectFontByName(fontSelect.value);
                }, 500);
            }
            
            // 延遲更新預覽，確保所有資源載入完成
            setTimeout(() => {
                this.updateAllPreviews();
            }, 1000);
        }
        
        // 前台安全防護整合
        applyFrontendSecurity() {
            try {
                // 從 localStorage 讀取後台設定的安全配置
                const securitySettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
                
                // 如果後台有設定，則套用
                if (Object.keys(securitySettings).length > 0) {
                    this.setupSecurityMeasures(securitySettings);
                } else if (this.config?.frontendSecurity) {
                    // 使用從 GitHub 載入的配置
                    this.setupSecurityMeasures(this.config.frontendSecurity);
                } else {
                    // 使用預設安全設定
                    this.setupSecurityMeasures({
                        preventScreenshot: true,
                        enableWatermark: true,
                        disableRightClick: true,
                        disableTextSelect: true,
                        disableDevTools: true,
                        disablePrint: true,
                        disableDrag: true,
                        blurOnLoseFocus: false
                    });
                }
            } catch (error) {
                console.error('套用安全設定失敗:', error);
            }
        }
        
        setupSecurityMeasures(settings) {
            // 防止截圖
            if (settings.preventScreenshot !== false) {
                this.preventScreenshot(settings);
            }
            
            // 啟用浮水印
            if (settings.enableWatermark !== false) {
                this.enableWatermark(settings);
            }
            
            // 禁用右鍵
            if (settings.disableRightClick !== false) {
                this.disableRightClick();
            }
            
            // 禁止文字選取
            if (settings.disableTextSelect !== false) {
                this.disableTextSelect();
            }
            
            // 偵測開發者工具
            if (settings.disableDevTools !== false) {
                this.detectDevTools(settings);
            }
            
            // 禁止列印
            if (settings.disablePrint !== false) {
                this.disablePrint();
            }
            
            // 禁止拖曳
            if (settings.disableDrag !== false) {
                this.disableDrag();
            }
            
            // 失焦模糊
            if (settings.blurOnLoseFocus) {
                this.enableBlurOnLoseFocus();
            }
        }
        
        preventScreenshot(settings) {
            // 創建防截圖層
            const protectionLayer = document.createElement('div');
            protectionLayer.id = 'stamp-screenshot-protection';
            protectionLayer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: black;
                color: white;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                pointer-events: none;
            `;
            protectionLayer.innerHTML = settings.screenshotWarning || '禁止截圖 - 版權所有';
            document.body.appendChild(protectionLayer);
            
            // 監聽截圖快捷鍵
            document.addEventListener('keydown', (e) => {
                // PrintScreen, Cmd+Shift+3/4/5 (Mac), Windows+Shift+S
                if (e.key === 'PrintScreen' || 
                    (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
                    (e.ctrlKey && e.shiftKey && e.key === 'S')) {
                    e.preventDefault();
                    protectionLayer.style.display = 'flex';
                    setTimeout(() => {
                        protectionLayer.style.display = 'none';
                    }, 3000);
                }
            });
        }
        
        enableWatermark(settings) {
            const watermarkContainer = document.createElement('div');
            watermarkContainer.id = 'stamp-watermark-layer';
            watermarkContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                overflow: hidden;
            `;
            
            const createWatermarks = () => {
                watermarkContainer.innerHTML = '';
                const text = settings.watermarkText || '© 2025 印章系統 - 版權所有';
                const fontSize = settings.watermarkFontSize || 10;
                const opacity = settings.watermarkOpacity || 0.03;
                
                for (let i = 0; i < 100; i++) {
                    const watermark = document.createElement('div');
                    watermark.style.cssText = `
                        position: absolute;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                        transform: rotate(${-45 + Math.random() * 90}deg);
                        font-size: ${fontSize}px;
                        color: rgba(0, 0, 0, ${opacity});
                        white-space: nowrap;
                        user-select: none;
                    `;
                    watermark.textContent = text;
                    watermarkContainer.appendChild(watermark);
                }
            };
            
            createWatermarks();
            document.body.appendChild(watermarkContainer);
            
            // 定期更新浮水印位置
            const interval = (settings.watermarkInterval || 60) * 1000;
            setInterval(createWatermarks, interval);
        }
        
        disableRightClick() {
            this.elements.widget.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }
        
        disableTextSelect() {
            this.elements.widget.style.userSelect = 'none';
            this.elements.widget.style.webkitUserSelect = 'none';
            this.elements.widget.style.mozUserSelect = 'none';
            this.elements.widget.style.msUserSelect = 'none';
            
            this.elements.widget.addEventListener('selectstart', (e) => {
                e.preventDefault();
                return false;
            });
        }
        
        detectDevTools(settings) {
            const element = new Image();
            let devtoolsOpen = false;
            
            Object.defineProperty(element, 'id', {
                get: function() {
                    devtoolsOpen = true;
                    throw new Error();
                }
            });
            
            const checkDevTools = () => {
                devtoolsOpen = false;
                console.log(element);
                
                if (devtoolsOpen) {
                    const warning = settings.devToolsWarning || 
                        '警告：偵測到開發者工具！\n本系統內容受版權保護，禁止任何形式的複製或修改。';
                    alert(warning);
                    
                    // 模糊內容
                    this.elements.widget.style.filter = 'blur(10px)';
                    setTimeout(() => {
                        this.elements.widget.style.filter = '';
                    }, 5000);
                }
            };
            
            setInterval(checkDevTools.bind(this), 1000);
        }
        
        disablePrint() {
            // CSS 列印樣式
            const printStyle = document.createElement('style');
            printStyle.textContent = `
                @media print {
                    #stamp-custom-font-widget {
                        display: none !important;
                    }
                    body::before {
                        content: "此內容無法列印 - 版權所有";
                        display: block;
                        text-align: center;
                        font-size: 24px;
                        padding: 50px;
                    }
                }
            `;
            document.head.appendChild(printStyle);
            
            // 監聽列印事件
            window.addEventListener('beforeprint', (e) => {
                console.warn('嘗試列印被阻止');
            });
        }
        
        disableDrag() {
            // 禁止拖曳圖片
            this.elements.widget.querySelectorAll('img').forEach(img => {
                img.draggable = false;
                img.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
            });
            
            // 禁止拖曳 canvas
            if (this.elements.canvas) {
                this.elements.canvas.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
        }
        
        enableBlurOnLoseFocus() {
            let blurTimeout;
            
            window.addEventListener('blur', () => {
                blurTimeout = setTimeout(() => {
                    this.elements.widget.style.filter = 'blur(5px)';
                    this.elements.widget.style.opacity = '0.5';
                }, 100);
            });
            
            window.addEventListener('focus', () => {
                clearTimeout(blurTimeout);
                this.elements.widget.style.filter = '';
                this.elements.widget.style.opacity = '';
            });
        }
    }
    
    // 初始化 Widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new StampWidget();
        });
    } else {
        new StampWidget();
    }
    
    // 版本資訊
    console.log('%c🎯 印章預覽系統 v10.0.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c📅 最後更新: 2025-01-29', 'color: #666;');
    console.log('%c👤 作者: DK0124', 'color: #666;');
    console.log('%c🔧 GitHub: https://github.com/DK0124/stamp-font-preview', 'color: #0066cc;');
    
})();
