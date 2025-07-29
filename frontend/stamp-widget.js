/**
 * 印章預覽小工具 - 結合成功經驗的最終版
 * @author DK0124
 * @version 9.0.0
 * @date 2025-01-29
 * @description 基於成功的 v1.2.1 架構，整合後台資料的完整印章預覽系統
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window._STAMP_WIDGET_V9_LOADED) return;
    window._STAMP_WIDGET_V9_LOADED = true;
    
    // 載入 Material Icons
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }
    
    // 建立樣式
    const styles = `
        /* 獨立樣式系統 - 使用成功版本的架構 */
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
            font-size: 24px;
            color: #333;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-title .material-icons {
            color: #9fb28e;
            font-size: 28px;
        }
        
        #stamp-custom-font-widget .scfw-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        /* 主預覽區 */
        #stamp-custom-font-widget .scfw-main-preview {
            background: linear-gradient(135deg, #9fb28e 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 25px;
            text-align: center;
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
        
        /* 控制區 */
        #stamp-custom-font-widget .scfw-controls {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-control-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
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
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        #stamp-custom-font-widget .scfw-label .material-icons {
            font-size: 18px;
            color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-input {
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            font-family: inherit;
            width: 100%;
            transition: all 0.2s;
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-input:focus {
            outline: none;
            border-color: #9fb28e;
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 選項卡片 */
        #stamp-custom-font-widget .scfw-section {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-section-header {
            background: #f8f9fa;
            padding: 15px 20px;
            font-weight: bold;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-section-header .material-icons {
            color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-section-content {
            padding: 20px;
        }
        
        /* 字體網格 */
        #stamp-custom-font-widget .scfw-font-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 15px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 5px;
        }
        
        #stamp-custom-font-widget .scfw-font-card {
            background: white;
            border: 3px solid #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            text-align: center;
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
            top: 8px;
            right: 8px;
            width: 26px;
            height: 26px;
            background: #9fb28e;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            z-index: 10;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            padding: 30px 15px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #333;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-font-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            color: #999;
        }
        
        #stamp-custom-font-widget .scfw-font-name {
            padding: 12px;
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            background: #f0f0f0;
            color: #333;
            border-top: 1px solid #e0e0e0;
        }
        
        /* 形狀網格 */
        #stamp-custom-font-widget .scfw-shape-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
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
            width: 50px;
            height: 50px;
            border: 3px solid #9fb28e;
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
        
        /* 載入動畫 */
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
            border-top: 4px solid #9fb28e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 滾動條美化 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 6px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 3px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: #999;
        }
        
        /* 響應式 */
        @media (max-width: 768px) {
            #stamp-custom-font-widget {
                padding: 20px;
            }
            
            #stamp-custom-font-widget .scfw-font-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            #stamp-custom-font-widget .scfw-shape-grid,
            #stamp-custom-font-widget .scfw-color-grid,
            #stamp-custom-font-widget .scfw-pattern-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @media (max-width: 480px) {
            #stamp-custom-font-widget .scfw-font-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* 防止外部樣式影響 */
        #stamp-custom-font-widget img {
            max-width: 100%;
            height: auto;
            vertical-align: middle;
        }
        
        #stamp-custom-font-widget button {
            font-family: inherit;
        }
    `;
    
    // 注入樣式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
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
    
    // 主 Widget 類
    const StampFontWidget = {
        config: null,
        currentSelection: {
            text: '印章預覽',
            font: null,
            fontId: null,
            shape: null,
            shapeId: null,
            pattern: null,
            patternId: null,
            color: null,
            colorId: null
        },
        loadedFonts: {},
        elements: {},
        canvas: null,
        ctx: null,
        isLoading: false,
        
        // 初始化
        async init() {
            try {
                // 顯示載入狀態
                this.showInitialLoading();
                
                // 載入配置
                await this.loadConfig();
                
                // 建立 UI
                this.buildUI();
                
                // 初始化 Canvas
                this.initCanvas();
                
                // 綁定事件
                this.bindEvents();
                
                // 載入資源
                await this.loadResources();
                
                // 更新預覽
                this.updateMainPreview();
                
            } catch (error) {
                console.error('初始化失敗:', error);
                this.showError(error.message);
            }
        },
        
        // 顯示初始載入狀態
        showInitialLoading() {
            const container = document.getElementById('stamp-font-widget-container') || 
                           document.getElementById('stamp-preview-root') ||
                           document.body;
            
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'stamp-widget-loading';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #9fb28e; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <div style="margin-top: 16px; color: #666;">正在載入印章系統...</div>
                </div>
            `;
            container.appendChild(loadingDiv);
        },
        
        // 載入配置
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
        },
        
        // 建立 UI
        buildUI() {
            // 移除載入狀態
            const loadingDiv = document.getElementById('stamp-widget-loading');
            if (loadingDiv) loadingDiv.remove();
            
            // 建立主 HTML
            const html = `
                <div id="stamp-custom-font-widget">
                    <!-- 標題 -->
                    <div class="scfw-header">
                        <h2 class="scfw-title">
                            <span class="material-icons">verified</span>
                            印章即時預覽系統
                        </h2>
                        <p class="scfw-subtitle">自訂您的專屬印章</p>
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
                    
                    <!-- 文字輸入 -->
                    <div class="scfw-controls">
                        <div class="scfw-control-grid">
                            <div class="scfw-control">
                                <label class="scfw-label">
                                    <span class="material-icons">edit</span>
                                    印章文字
                                </label>
                                <input type="text" 
                                       class="scfw-input" 
                                       id="scfw-text" 
                                       placeholder="請輸入文字（最多6字）" 
                                       maxlength="6" 
                                       value="${this.currentSelection.text}">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 字體選擇 -->
                    ${this.renderFontSection()}
                    
                    <!-- 形狀選擇 -->
                    ${this.renderShapeSection()}
                    
                    <!-- 顏色選擇 -->
                    ${this.renderColorSection()}
                    
                    <!-- 圖案選擇 -->
                    ${this.renderPatternSection()}
                </div>
            `;
            
            // 尋找容器並插入
            const container = document.getElementById('stamp-font-widget-container') || 
                           document.getElementById('stamp-preview-root') ||
                           document.body;
            
            const widgetDiv = document.createElement('div');
            widgetDiv.innerHTML = html;
            container.appendChild(widgetDiv);
            
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
        },
        
        // 渲染字體區塊
        renderFontSection() {
            if (!this.config.fonts?.length) return '';
            
            return `
                <div class="scfw-section">
                    <div class="scfw-section-header">
                        <span class="material-icons">text_fields</span>
                        選擇字體
                    </div>
                    <div class="scfw-section-content">
                        <div class="scfw-font-grid" id="scfw-font-grid">
                            <div class="scfw-loading-overlay">
                                <div class="scfw-loading-spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 渲染形狀區塊
        renderShapeSection() {
            if (!this.config.shapes?.length) return '';
            
            return `
                <div class="scfw-section">
                    <div class="scfw-section-header">
                        <span class="material-icons">category</span>
                        選擇形狀
                    </div>
                    <div class="scfw-section-content">
                        <div class="scfw-shape-grid" id="scfw-shape-grid">
                            ${this.config.shapes.map((shape, index) => this.createShapeItem(shape, index)).join('')}
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 渲染顏色區塊
        renderColorSection() {
            if (!this.config.colors?.length) return '';
            
            return `
                <div class="scfw-section">
                    <div class="scfw-section-header">
                        <span class="material-icons">palette</span>
                        選擇顏色
                    </div>
                    <div class="scfw-section-content">
                        <div class="scfw-color-grid" id="scfw-color-grid">
                            ${this.config.colors.map((color, index) => this.createColorItem(color, index)).join('')}
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 渲染圖案區塊
        renderPatternSection() {
            return `
                <div class="scfw-section">
                    <div class="scfw-section-header">
                        <span class="material-icons">texture</span>
                        選擇圖案 (選填)
                    </div>
                    <div class="scfw-section-content">
                        <div class="scfw-pattern-grid" id="scfw-pattern-grid">
                            <div class="scfw-pattern-item selected" data-pattern-index="-1">
                                <div class="scfw-pattern-preview">
                                    <span style="font-size: 14px; color: #999;">無</span>
                                </div>
                            </div>
                            ${this.config.patterns?.map((pattern, index) => this.createPatternItem(pattern, index)).join('') || ''}
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 建立形狀項目
        createShapeItem(shape, index) {
            let preview = '';
            if (shape.githubPath) {
                preview = `<img src="${CONFIG.BASE_URL}/${shape.githubPath}" alt="${shape.name}">`;
            } else {
                // 使用 CSS 繪製基本形狀
                let style = '';
                switch(shape.name) {
                    case '圓形':
                        style = 'border-radius: 50%;';
                        break;
                    case '橢圓形':
                        style = 'border-radius: 50%; width: 60px; height: 40px;';
                        break;
                    case '長方形':
                        style = 'width: 60px; height: 40px;';
                        break;
                    case '圓角方形':
                        style = 'border-radius: 12px;';
                        break;
                }
                preview = `<div style="${style}"></div>`;
            }
            
            return `
                <div class="scfw-shape-item ${index === 0 ? 'selected' : ''}" data-shape-index="${index}">
                    <div class="scfw-shape-preview">${preview}</div>
                    <div class="scfw-shape-label">${shape.name}</div>
                </div>
            `;
        },
        
        // 建立顏色項目
        createColorItem(color, index) {
            return `
                <div class="scfw-color-item ${index === 0 ? 'selected' : ''}" data-color-index="${index}">
                    <div class="scfw-color-main" style="background: ${color.main}"></div>
                    <div class="scfw-color-name">${color.name}</div>
                </div>
            `;
        },
        
        // 建立圖案項目
        createPatternItem(pattern, index) {
            let preview = '';
            if (pattern.githubPath) {
                preview = `<img src="${CONFIG.BASE_URL}/${pattern.githubPath}" alt="${pattern.name}">`;
            } else {
                preview = `<span style="font-size: 12px; color: #999;">?</span>`;
            }
            
            return `
                <div class="scfw-pattern-item" data-pattern-index="${index}">
                    <div class="scfw-pattern-preview">${preview}</div>
                </div>
            `;
        },
        
        // 初始化 Canvas
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
        },
        
        // 載入資源
        async loadResources() {
            // 載入字體
            if (this.config.fonts?.length > 0) {
                await this.loadAllFonts();
            }
        },
        
        // 載入所有字體
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
        },
        
        // 建立字體卡片
        createFontCard(font, index) {
            const card = document.createElement('div');
            card.className = 'scfw-font-card';
            if (index === 0) card.classList.add('selected');
            card.dataset.fontIndex = index;
            card.dataset.fontName = font.displayName || font.name;
            
            card.innerHTML = `
                <div class="scfw-font-preview" id="scfw-font-preview-${index}">
                    <div class="scfw-font-loading">載入中...</div>
                </div>
                <div class="scfw-font-name">${font.displayName || font.name}</div>
            `;
            
            // 點擊事件
            card.addEventListener('click', () => {
                this.selectFont(index);
            });
            
            return card;
        },
        
        // 載入單個字體
        async loadFont(fontData, index) {
            try {
                const preview = document.getElementById(`scfw-font-preview-${index}`);
                if (!preview) return;
                
                // 系統字體
                if (fontData.systemFont) {
                    this.loadedFonts[fontData.id] = { systemFont: fontData.systemFont };
                    preview.innerHTML = `
                        <span style="font-family: ${fontData.systemFont}; font-weight: ${fontData.weight || 'normal'};">
                            ${this.currentSelection.text.substring(0, 2) || '印'}
                        </span>
                    `;
                    return;
                }
                
                // 檢查是否已載入
                if (this.loadedFonts[fontData.id]) {
                    preview.innerHTML = `
                        <span style="font-family: CustomFont${fontData.id}, serif; font-weight: ${fontData.weight || 'normal'};">
                            ${this.currentSelection.text.substring(0, 2) || '印'}
                        </span>
                    `;
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
                
                preview.innerHTML = `
                    <span style="font-family: CustomFont${fontData.id}, serif; font-weight: ${fontData.weight || 'normal'};">
                        ${this.currentSelection.text.substring(0, 2) || '印'}
                    </span>
                `;
                
            } catch (error) {
                console.error(`載入字體失敗: ${fontData.name}`, error);
                const preview = document.getElementById(`scfw-font-preview-${index}`);
                if (preview) {
                    preview.innerHTML = '<span style="color: #e57373; font-size: 14px;">載入失敗</span>';
                }
            }
        },
        
        // 選擇字體
        selectFont(index) {
            // 更新選中狀態
            this.elements.fontGrid.querySelectorAll('.scfw-font-card').forEach((card, i) => {
                card.classList.toggle('selected', i === index);
            });
            
            // 更新選擇
            this.currentSelection.font = this.config.fonts[index];
            this.currentSelection.fontId = index;
            
            // 更新預覽
            this.updateMainPreview();
        },
        
        // 綁定事件
        bindEvents() {
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章預覽';
                this.updateMainPreview();
                this.updateAllFontPreviews();
            });
            
            // 形狀選擇
            if (this.elements.shapeGrid) {
                this.elements.shapeGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.scfw-shape-item');
                    if (item) {
                        const index = parseInt(item.dataset.shapeIndex);
                        this.selectShape(index);
                    }
                });
            }
            
            // 顏色選擇
            if (this.elements.colorGrid) {
                this.elements.colorGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.scfw-color-item');
                    if (item) {
                        const index = parseInt(item.dataset.colorIndex);
                        this.selectColor(index);
                    }
                });
            }
            
            // 圖案選擇
            if (this.elements.patternGrid) {
                this.elements.patternGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.scfw-pattern-item');
                    if (item) {
                        const index = parseInt(item.dataset.patternIndex);
                        this.selectPattern(index);
                    }
                });
            }
            
            // Canvas 雙擊放大
            this.elements.canvas.addEventListener('dblclick', () => {
                this.showPreviewModal();
            });
        },
        
        // 選擇形狀
        selectShape(index) {
            this.elements.shapeGrid.querySelectorAll('.scfw-shape-item').forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.shape = this.config.shapes[index];
            this.currentSelection.shapeId = index;
            
            this.updateMainPreview();
        },
        
        // 選擇顏色
        selectColor(index) {
            this.elements.colorGrid.querySelectorAll('.scfw-color-item').forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.color = this.config.colors[index];
            this.currentSelection.colorId = index;
            
            this.updateMainPreview();
        },
        
        // 選擇圖案
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
            
            this.updateMainPreview();
        },
        
        // 更新所有字體預覽
        updateAllFontPreviews() {
            const text = this.currentSelection.text.substring(0, 2) || '印';
            
            this.config.fonts?.forEach((font, index) => {
                const preview = document.querySelector(`#scfw-font-preview-${index} span`);
                if (preview && !preview.parentElement.querySelector('.scfw-font-loading')) {
                    preview.textContent = text;
                }
            });
        },
        
        // 更新主預覽
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
        },
        
        // 繪製文字
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
        },
        
        // 圓角矩形
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
        },
        
        // 顯示預覽模態框
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
                        <button onclick="window.StampFontWidget.downloadImage()" style="
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
        },
        
        // 下載圖片
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
        },
        
        // 顯示錯誤
        showError(message) {
            const container = document.getElementById('stamp-font-widget-container') || 
                           document.getElementById('stamp-preview-root') ||
                           document.body;
            
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 3px 15px rgba(0,0,0,0.1);">
                    <div style="color: #e57373; font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <div style="font-size: 18px; color: #333; margin-bottom: 8px;">載入失敗</div>
                    <div style="font-size: 14px; color: #666;">${message}</div>
                </div>
            `;
        }
    };
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            StampFontWidget.init();
        });
    } else {
        setTimeout(() => {
            StampFontWidget.init();
        }, 0);
    }
    
    // 暴露到全域
    window.StampFontWidget = StampFontWidget;
    
})();
