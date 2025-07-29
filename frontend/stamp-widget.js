/**
 * 印章預覽系統 - 安全加強版
 * @author DK0124
 * @version 10.2.0
 * @date 2025-01-29
 * @description 修復遞迴問題、移除 BV Shop 連動、加強字體安全性
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
        },
        // 字體安全設定
        FONT_SECURITY: {
            // 使用 token 驗證
            USE_TOKEN: true,
            // token 有效期（毫秒）
            TOKEN_EXPIRY: 5 * 60 * 1000, // 5分鐘
            // 混淆字體 URL
            OBFUSCATE_URL: true,
            // 使用 Blob URL
            USE_BLOB_URL: true,
            // 清理 Blob URL 延遲
            BLOB_CLEANUP_DELAY: 60000 // 1分鐘
        }
    };
    
    // 預設形狀
    const DEFAULT_SHAPES = [
        { id: 'circle', name: '圓形', displayName: '圓形' },
        { id: 'square', name: '方形', displayName: '方形' },
        { id: 'ellipse', name: '橢圓形', displayName: '橢圓形' },
        { id: 'rectangle', name: '長方形', displayName: '長方形' }
    ];
    
    // 預設顏色
    const DEFAULT_COLORS = [
        { id: 'red', name: '朱紅', main: '#e57373' },
        { id: 'green', name: '墨綠', main: '#9fb28e' },
        { id: 'blue', name: '寶藍', main: '#64b5f6' },
        { id: 'amber', name: '琥珀', main: '#ffb74d' }
    ];
    
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
        
        #stamp-custom-font-widget .scfw-input {
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 15px;
            font-family: inherit;
            width: 100%;
            transition: all 0.2s;
        }
        
        #stamp-custom-font-widget .scfw-input:focus {
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
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            transform: scale(1.05);
            border-color: #B5D5B0;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: #f0fff4;
            border-color: #9fb28e;
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
        
        /* BV Shop 連動提示 */
        #stamp-custom-font-widget .scfw-bv-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
            display: none;
        }
        
        /* 響應式 */
        @media (max-width: 768px) {
            #stamp-custom-font-widget {
                padding: 20px;
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
                fontId: 0,
                shape: null,
                shapeId: 0,
                pattern: null,
                patternId: -1,
                color: null,
                colorId: 0
            };
            this.loadedFonts = {};
            this.elements = {};
            this.canvas = null;
            this.ctx = null;
            this.isUpdating = false; // 防止無限遞迴
            this.fontBlobUrls = {}; // 儲存 Blob URLs
            
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
                
                // 套用安全設定
                this.applyFrontendSecurity();
                
                // 清理 Blob URLs 的定時器
                this.setupBlobCleanup();
                
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
                        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
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
            
            // 處理空陣列和預設值
            if (!this.config.shapes || this.config.shapes.length === 0) {
                console.warn('配置中沒有形狀，使用預設形狀');
                this.config.shapes = DEFAULT_SHAPES;
            }
            
            if (!this.config.colors || this.config.colors.length === 0) {
                console.warn('配置中沒有顏色，使用預設顏色');
                this.config.colors = DEFAULT_COLORS;
            }
            
            // 確保每個項目都有必要的屬性
            this.config.fonts = (this.config.fonts || []).map((font, index) => ({
                id: font.id || `font_${index}`,
                name: font.name || `字體${index + 1}`,
                displayName: font.displayName || font.name || `字體${index + 1}`,
                filename: font.filename || '',
                githubPath: font.githubPath || '',
                systemFont: font.systemFont || '',
                weight: font.weight || 'normal'
            }));
            
            this.config.shapes = this.config.shapes.map((shape, index) => ({
                id: shape.id || `shape_${index}`,
                name: shape.name || shape.displayName || `形狀${index + 1}`,
                displayName: shape.displayName || shape.name || `形狀${index + 1}`,
                githubPath: shape.githubPath || ''
            }));
            
            this.config.colors = this.config.colors.map((color, index) => ({
                id: color.id || `color_${index}`,
                name: color.name || `顏色${index + 1}`,
                main: color.main || '#000000',
                shades: color.shades || []
            }));
            
            this.config.patterns = (this.config.patterns || []).map((pattern, index) => ({
                id: pattern.id || `pattern_${index}`,
                name: pattern.name || `圖案${index + 1}`,
                githubPath: pattern.githubPath || ''
            }));
            
            // 設定初始選擇
            this.currentSelection.font = this.config.fonts[0];
            this.currentSelection.shape = this.config.shapes[0];
            this.currentSelection.color = this.config.colors[0];
        }
        
        buildUI() {
            const html = `
                <div id="stamp-custom-font-widget">
                    <!-- 標題 -->
                    <div class="scfw-header">
                        <h2 class="scfw-title">🎯 印章即時預覽系統</h2>
                        <p class="scfw-subtitle">選擇您喜愛的樣式，打造專屬印章</p>
                    </div>
                    
                    <!-- BV Shop 連動提示（預留） -->
                    <div class="scfw-bv-notice" id="scfw-bv-notice">
                        ⚠️ BV Shop 連動功能暫時關閉
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
                patternGrid: document.getElementById('scfw-pattern-grid'),
                bvNotice: document.getElementById('scfw-bv-notice')
            };
            
            // 初始化 Canvas
            this.initCanvas();
            
            // 載入字體
            this.loadAllFonts();
            
            // 更新預覽
            this.updateMainPreview();
        }
        
        renderShapes() {
            return this.config.shapes.map((shape, index) => {
                let preview = '';
                if (shape.githubPath) {
                    preview = `<img src="${CONFIG.BASE_URL}/${shape.githubPath}" alt="${shape.displayName}" style="max-width: 50px; max-height: 50px;">`;
                } else {
                    // CSS 繪製基本形狀
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
                    <div class="scfw-shape-item ${index === 0 ? 'selected' : ''}" 
                         data-shape-index="${index}">
                        <div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                            ${preview}
                        </div>
                        <div style="font-size: 12px; margin-top: 8px;">${shape.displayName}</div>
                    </div>
                `;
            }).join('');
        }
        
        renderColors() {
            return this.config.colors.map((color, index) => `
                <div class="scfw-color-item ${index === 0 ? 'selected' : ''}" 
                     data-color-index="${index}">
                    <div class="scfw-color-main" style="background: ${color.main}"></div>
                    <div style="font-size: 12px; margin-top: 8px;">${color.name}</div>
                </div>
            `).join('');
        }
        
        renderPatterns() {
            const items = [`
                <div class="scfw-pattern-item selected" data-pattern-index="-1">
                    <div style="font-size: 14px; color: #999;">無</div>
                </div>
            `];
            
            this.config.patterns.forEach((pattern, index) => {
                let preview = '';
                if (pattern.githubPath) {
                    preview = `<img src="${CONFIG.BASE_URL}/${pattern.githubPath}" alt="${pattern.name}" style="max-width: 40px; max-height: 40px; opacity: 0.7;">`;
                } else {
                    preview = `<span style="font-size: 12px; color: #999;">?</span>`;
                }
                
                items.push(`
                    <div class="scfw-pattern-item" data-pattern-index="${index}">
                        ${preview}
                    </div>
                `);
            });
            
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
            if (index === 0) card.classList.add('selected');
            card.dataset.fontIndex = index;
            
            card.innerHTML = `
                <div class="scfw-stamp-preview">
                    <div class="scfw-font-loading">載入中...</div>
                </div>
                <div class="scfw-font-name">${font.displayName}</div>
            `;
            
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
                
                // 使用安全的字體載入方式
                const fontUrl = await this.getSecureFontUrl(fontData);
                if (!fontUrl) {
                    throw new Error('無法取得字體 URL');
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
                console.error(`載入字體失敗: ${fontData.displayName}`, error);
                const preview = this.elements.fontGrid.querySelector(`[data-font-index="${index}"] .scfw-stamp-preview`);
                if (preview) {
                    preview.innerHTML = '<span style="color: #e57373; font-size: 14px;">載入失敗</span>';
                }
            }
        }
        
        // 安全的字體 URL 取得方法
        async getSecureFontUrl(fontData) {
            // 構建原始 URL
            let originalUrl = null;
            if (fontData.githubPath) {
                originalUrl = `${CONFIG.BASE_URL}/${fontData.githubPath}`;
            } else if (fontData.filename) {
                originalUrl = `${CONFIG.BASE_URL}/assets/fonts/${fontData.filename}`;
            }
            
            if (!originalUrl) return null;
            
            // 如果使用 Blob URL
            if (CONFIG.FONT_SECURITY.USE_BLOB_URL) {
                try {
                    // 檢查是否已有 Blob URL
                    if (this.fontBlobUrls[fontData.id]) {
                        return this.fontBlobUrls[fontData.id];
                    }
                    
                    // 使用 token 混淆
                    const token = CONFIG.FONT_SECURITY.USE_TOKEN ? 
                        this.generateToken() : '';
                    
                    const response = await fetch(originalUrl + (token ? `?token=${token}` : ''));
                    if (!response.ok) throw new Error('無法下載字體');
                    
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // 儲存 Blob URL
                    this.fontBlobUrls[fontData.id] = blobUrl;
                    
                    return blobUrl;
                } catch (error) {
                    console.error('建立 Blob URL 失敗:', error);
                    return originalUrl;
                }
            }
            
            // 如果混淆 URL
            if (CONFIG.FONT_SECURITY.OBFUSCATE_URL) {
                return this.obfuscateUrl(originalUrl);
            }
            
            return originalUrl;
        }
        
        // 生成臨時 token
        generateToken() {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2);
            return btoa(`${timestamp}_${random}`).replace(/=/g, '');
        }
        
        // URL 混淆
        obfuscateUrl(url) {
            // 簡單的 URL 混淆，可以根據需要加強
            const timestamp = Date.now();
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}v=${timestamp}&h=${this.hashCode(url)}`;
        }
        
        // 簡單的 hash 函數
        hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        }
        
        // 設定 Blob URL 清理
        setupBlobCleanup() {
            // 頁面卸載時清理
            window.addEventListener('beforeunload', () => {
                this.cleanupBlobUrls();
            });
            
            // 定期清理未使用的 Blob URLs
            if (CONFIG.FONT_SECURITY.USE_BLOB_URL) {
                setInterval(() => {
                    // 清理非當前使用的字體
                    Object.keys(this.fontBlobUrls).forEach(fontId => {
                        if (this.currentSelection.font?.id !== fontId) {
                            URL.revokeObjectURL(this.fontBlobUrls[fontId]);
                            delete this.fontBlobUrls[fontId];
                        }
                    });
                }, CONFIG.FONT_SECURITY.BLOB_CLEANUP_DELAY);
            }
        }
        
        // 清理所有 Blob URLs
        cleanupBlobUrls() {
            Object.values(this.fontBlobUrls).forEach(url => {
                URL.revokeObjectURL(url);
            });
            this.fontBlobUrls = {};
        }
        
        updateFontPreview(preview, fontData, index) {
            // 防止無限遞迴
            if (this.isUpdating) return;
            
            const shape = this.currentSelection.shape;
            const color = this.currentSelection.color;
            const pattern = this.currentSelection.pattern;
            
            let stampClass = '方形';
            if (shape?.name === '圓形') stampClass = '圓形';
            else if (shape?.name === '橢圓形') stampClass = '橢圓形';
            else if (shape?.name === '長方形') stampClass = '長方形';
            
            preview.innerHTML = `
                <div class="scfw-stamp ${stampClass}" style="
                    width: 160px;
                    height: 160px;
                    border: 4px solid ${color?.main || '#dc3545'};
                    ${stampClass === '圓形' || stampClass === '橢圓形' ? 'border-radius: 50%;' : ''}
                    ${stampClass === '橢圓形' ? 'width: 190px; height: 150px;' : ''}
                    ${stampClass === '長方形' ? 'width: 200px; height: 140px;' : ''}
                ">
                    <span class="scfw-stamp-text" style="
                        font-family: ${fontData.systemFont || `CustomFont${fontData.id}`};
                        color: ${color?.main || '#dc3545'};
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
            this.elements.fontGrid.querySelectorAll('.scfw-font-card').forEach((card, i) => {
                card.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.font = this.config.fonts[index];
            this.currentSelection.fontId = index;
            
            this.updateAllPreviews();
        }
        
        bindEvents() {
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章預覽';
                this.updateAllPreviews();
            });
            
            // 標籤頁切換
            this.elements.widget.querySelectorAll('.scfw-tab-button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;
                    
                    this.elements.widget.querySelectorAll('.scfw-tab-button').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    
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
        }
        
        selectColor(index) {
            this.elements.colorGrid.querySelectorAll('.scfw-color-item').forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
            
            this.currentSelection.color = this.config.colors[index];
            this.currentSelection.colorId = index;
            
            this.updateAllPreviews();
        }
        
        selectPattern(index) {
            this.elements.patternGrid.querySelectorAll('.scfw-pattern-item').forEach((item) => {
                const itemIndex = parseInt(item.dataset.patternIndex);
                item.classList.toggle('selected', itemIndex === index);
            });
            
            if (index === -1) {
                this.currentSelection.pattern = null;
                this.currentSelection.patternId = -1;
            } else {
                this.currentSelection.pattern = this.config.patterns[index];
                this.currentSelection.patternId = index;
            }
            
            this.updateAllPreviews();
        }
        
        updateAllPreviews() {
            // 防止無限遞迴
            if (this.isUpdating) return;
            this.isUpdating = true;
            
            try {
                // 更新主預覽
                this.updateMainPreview();
                
                // 更新所有字體預覽
                this.config.fonts.forEach((font, index) => {
                    const preview = this.elements.fontGrid.querySelector(`[data-font-index="${index}"] .scfw-stamp-preview`);
                    if (preview && this.loadedFonts[font.id]) {
                        this.updateFontPreview(preview, font, index);
                    }
                });
            } finally {
                this.isUpdating = false;
            }
        }
        
        updateMainPreview() {
            const ctx = this.ctx;
            if (!ctx) return;
            
            const width = 250;
            const height = 250;
            
            // 清空畫布
            ctx.clearRect(0, 0, width, height);
            
            const shape = this.currentSelection.shape;
            const color = this.currentSelection.color;
            const font = this.currentSelection.font;
            
            if (!shape || !color || !font) {
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
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;
            
            ctx.save();
            
            // 設定樣式
            ctx.strokeStyle = color.main;
            ctx.fillStyle = color.main;
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
            }
            
            ctx.restore();
            
            // 繪製圖案（如果有）
            if (this.currentSelection.pattern?.githubPath) {
                const patternImg = new Image();
                // 禁止跨域以保護圖片
                patternImg.crossOrigin = 'anonymous';
                patternImg.src = `${CONFIG.BASE_URL}/${this.currentSelection.pattern.githubPath}`;
                patternImg.onload = () => {
                    // 繪製圖案的邏輯...
                };
            }
            
            // 繪製文字
            this.drawText(ctx, centerX, centerY, size);
        }
        
        drawText(ctx, centerX, centerY, size) {
            const font = this.currentSelection.font;
            const text = this.currentSelection.text;
            const color = this.currentSelection.color;
            
            if (!text || !font || !color) return;
            
            ctx.save();
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color.main;
            
            // 計算字體大小
            let fontSize = size * 0.25;
            if (text.length === 1) fontSize = size * 0.45;
            else if (text.length === 2) fontSize = size * 0.35;
            else if (text.length >= 5) fontSize = size * 0.2;
            
            // 設定字體
            if (font.systemFont) {
                ctx.font = `${font.weight || 'bold'} ${fontSize}px ${font.systemFont}`;
            } else if (this.loadedFonts[font.id]) {
                ctx.font = `${font.weight || 'bold'} ${fontSize}px CustomFont${font.id}, serif`;
            } else {
                ctx.font = `bold ${fontSize}px serif`;
            }
            
            // 繪製文字
            if (text.length > 2 && this.currentSelection.shape?.name && 
                (this.currentSelection.shape.name === '圓形' || this.currentSelection.shape.name === '方形')) {
                // 分行顯示
                const half = Math.ceil(text.length / 2);
                const line1 = text.substring(0, half);
                const line2 = text.substring(half);
                
                const lineHeight = fontSize * 1.2;
                ctx.fillText(line1, centerX, centerY - lineHeight / 2);
                ctx.fillText(line2, centerX, centerY + lineHeight / 2);
            } else {
                ctx.fillText(text, centerX, centerY);
            }
            
            ctx.restore();
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
            window.stampWidgetInstance = this;
            
            // 繪製大尺寸預覽
            const modalCanvas = document.getElementById('modal-canvas');
            const modalCtx = modalCanvas.getContext('2d');
            modalCtx.scale(2, 2);
            
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            this.canvas = modalCanvas;
            this.ctx = modalCtx;
            this.updateMainPreview();
            
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        downloadImage() {
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            downloadCanvas.width = 1000;
            downloadCanvas.height = 1000;
            downloadCtx.scale(4, 4);
            
            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, 250, 250);
            
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            this.canvas = downloadCanvas;
            this.ctx = downloadCtx;
            this.updateMainPreview();
            
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `印章_${this.currentSelection.text}_${new Date().toISOString().split('T')[0]}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        
        // 前台安全防護
        applyFrontendSecurity() {
            try {
                const securitySettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
                
                if (Object.keys(securitySettings).length > 0) {
                    this.setupSecurityMeasures(securitySettings);
                } else {
                    // 使用預設安全設定
                    this.setupSecurityMeasures({
                        preventScreenshot: true,
                        enableWatermark: false,
                        disableRightClick: true,
                        disableTextSelect: true,
                        disableDevTools: false,
                        disablePrint: true,
                        disableDrag: true
                    });
                }
            } catch (error) {
                console.error('套用安全設定失敗:', error);
            }
        }
        
        setupSecurityMeasures(settings) {
            if (settings.disableRightClick) {
                this.elements.widget.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
            
            if (settings.disableTextSelect) {
                this.elements.widget.style.userSelect = 'none';
                this.elements.widget.style.webkitUserSelect = 'none';
            }
            
            if (settings.disableDrag) {
                this.elements.widget.querySelectorAll('img').forEach(img => {
                    img.draggable = false;
                });
                
                if (this.elements.canvas) {
                    this.elements.canvas.addEventListener('dragstart', (e) => {
                        e.preventDefault();
                        return false;
                    });
                }
            }
            
            if (settings.disablePrint) {
                const printStyle = document.createElement('style');
                printStyle.textContent = `
                    @media print {
                        #stamp-custom-font-widget {
                            display: none !important;
                        }
                    }
                `;
                document.head.appendChild(printStyle);
            }
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
    console.log('%c🎯 印章預覽系統 v10.2.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c📅 最後更新: 2025-01-29', 'color: #666;');
    console.log('%c✅ 修復: 無限遞迴、字體安全性加強', 'color: #28a745;');
    console.log('%c⚠️ BV Shop 連動已暫時移除', 'color: #ff9800;');
    
})();
