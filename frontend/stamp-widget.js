/**
 * 印章預覽小工具 - 穩定版
 * @author DK0124
 * @version 4.0.0
 * @date 2025-01-29
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window.StampWidgetLoaded) return;
    window.StampWidgetLoaded = true;
    
    // 全域配置
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
    
    // 載入 Material Icons
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }
    
    // 樣式
    const styles = `
        /* 重置樣式 */
        #stamp-font-widget-container {
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            display: block;
        }
        
        #stamp-font-widget-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 主容器 */
        .sw-container {
            background: #f5f5f5;
            border-radius: 12px;
            padding: 20px;
            max-width: 100%;
        }
        
        /* 載入狀態 */
        .sw-loading {
            text-align: center;
            padding: 60px 20px;
        }
        
        .sw-loading-spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: sw-spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes sw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 錯誤狀態 */
        .sw-error {
            text-align: center;
            padding: 40px 20px;
            color: #e74c3c;
        }
        
        .sw-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        /* 預覽區 */
        .sw-preview-section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .sw-preview-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .sw-preview-canvas {
            display: inline-block;
            margin: 20px 0;
        }
        
        /* 控制區 */
        .sw-controls {
            display: grid;
            gap: 20px;
        }
        
        .sw-control-group {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .sw-control-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* 文字輸入 */
        .sw-text-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 16px;
            text-align: center;
            transition: border-color 0.3s;
        }
        
        .sw-text-input:focus {
            outline: none;
            border-color: #3498db;
        }
        
        /* 選項網格 */
        .sw-option-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
        }
        
        .sw-option-item {
            background: #f8f8f8;
            border: 2px solid transparent;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .sw-option-item:hover {
            background: #e8e8e8;
            transform: translateY(-2px);
        }
        
        .sw-option-item.selected {
            background: #e3f2fd;
            border-color: #2196f3;
        }
        
        /* 字體項目 */
        .sw-font-item {
            position: relative;
        }
        
        .sw-font-preview {
            font-size: 24px;
            margin-bottom: 8px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .sw-font-name {
            font-size: 12px;
            color: #666;
        }
        
        /* 形狀項目 */
        .sw-shape-preview {
            width: 60px;
            height: 60px;
            border: 3px solid #333;
            margin: 0 auto 8px;
        }
        
        .sw-shape-name {
            font-size: 12px;
            color: #666;
        }
        
        /* 顏色項目 */
        .sw-color-preview {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            margin: 0 auto 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .sw-color-name {
            font-size: 12px;
            color: #666;
        }
        
        /* 下載按鈕 */
        .sw-download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 20px;
        }
        
        .sw-download-btn:hover {
            background: #229954;
        }
        
        .sw-download-btn:active {
            transform: scale(0.98);
        }
        
        /* 響應式 */
        @media (max-width: 768px) {
            .sw-option-grid {
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            }
            
            .sw-font-preview {
                font-size: 20px;
            }
            
            .sw-shape-preview,
            .sw-color-preview {
                width: 50px;
                height: 50px;
            }
        }
        
        /* 防止文字選取 */
        .no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    `;
    
    // 注入樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // 工具函數
    const Utils = {
        // URL 編碼（處理中文檔名）
        encodeFilePath(path) {
            return path.split('/').map(part => encodeURIComponent(part)).join('/');
        },
        
        // 建立完整的 GitHub Raw URL
        getGitHubRawUrl(path) {
            if (!path) return null;
            // 如果已經是完整 URL，直接返回
            if (path.startsWith('http')) return path;
            // 否則建立完整 URL
            const encodedPath = this.encodeFilePath(path);
            return `${CONFIG.BASE_URL}/${encodedPath}`;
        },
        
        // 安全的 JSON 解析
        safeJsonParse(str, defaultValue = null) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return defaultValue;
            }
        },
        
        // 防抖函數
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
    
    // 主要類別
    class StampWidget {
        constructor(containerId) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            
            if (!this.container) {
                console.error(`找不到容器: ${containerId}`);
                return;
            }
            
            // 初始化狀態
            this.config = null;
            this.currentSelection = {
                text: '範例印章',
                font: null,
                shape: null,
                color: null,
                pattern: null
            };
            
            this.loadedFonts = new Map();
            this.canvas = null;
            this.ctx = null;
            
            // 開始初始化
            this.init();
        }
        
        async init() {
            try {
                // 顯示載入狀態
                this.showLoading();
                
                // 載入設定
                const configLoaded = await this.loadConfig();
                if (!configLoaded) {
                    throw new Error('無法載入設定檔');
                }
                
                // 檢查是否有資料
                if (!this.hasData()) {
                    this.showEmpty();
                    return;
                }
                
                // 建立介面
                this.render();
                
                // 初始化 Canvas
                this.initCanvas();
                
                // 載入資源
                await this.loadResources();
                
                // 套用安全設定
                this.applySecuritySettings();
                
                // 初始預覽
                this.updatePreview();
                
            } catch (error) {
                console.error('初始化失敗:', error);
                this.showError(error.message);
            }
        }
        
        async loadConfig() {
            try {
                const response = await fetch(CONFIG.CONFIG_URL + '?t=' + Date.now());
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const config = await response.json();
                console.log('設定載入成功:', config);
                
                this.config = config;
                
                // 設定預設選項
                if (config.fonts?.length > 0) {
                    this.currentSelection.font = config.fonts[0];
                }
                if (config.shapes?.length > 0) {
                    this.currentSelection.shape = config.shapes[0];
                }
                if (config.colors?.length > 0) {
                    this.currentSelection.color = config.colors[0];
                }
                
                return true;
                
            } catch (error) {
                console.error('載入設定失敗:', error);
                return false;
            }
        }
        
        hasData() {
            return this.config && (
                this.config.fonts?.length > 0 ||
                this.config.shapes?.length > 0 ||
                this.config.colors?.length > 0
            );
        }
        
        showLoading() {
            this.container.innerHTML = `
                <div class="sw-container">
                    <div class="sw-loading">
                        <div class="sw-loading-spinner"></div>
                        <div>載入印章系統中...</div>
                    </div>
                </div>
            `;
        }
        
        showEmpty() {
            this.container.innerHTML = `
                <div class="sw-container">
                    <div class="sw-error">
                        <div class="material-icons sw-error-icon">inbox</div>
                        <div>尚未設定任何內容</div>
                        <div style="color: #666; font-size: 14px; margin-top: 8px;">
                            請先到後台管理系統上傳資源
                        </div>
                    </div>
                </div>
            `;
        }
        
        showError(message) {
            this.container.innerHTML = `
                <div class="sw-container">
                    <div class="sw-error">
                        <div class="material-icons sw-error-icon">error_outline</div>
                        <div>載入失敗</div>
                        <div style="color: #666; font-size: 14px; margin-top: 8px;">${message}</div>
                        <button class="sw-download-btn" style="background: #e74c3c; margin-top: 20px;" onclick="location.reload()">
                            <span class="material-icons">refresh</span>
                            重新載入
                        </button>
                    </div>
                </div>
            `;
        }
        
        render() {
            const widgetId = `widget_${Date.now()}`;
            
            this.container.innerHTML = `
                <div class="sw-container">
                    <!-- 預覽區 -->
                    <div class="sw-preview-section">
                        <h2 class="sw-preview-title">
                            <span class="material-icons">verified</span>
                            印章預覽
                        </h2>
                        <div class="sw-preview-canvas">
                            <canvas id="preview-canvas-${widgetId}" width="200" height="200" style="border: 1px solid #e0e0e0; border-radius: 8px;"></canvas>
                        </div>
                        <div>
                            <button class="sw-download-btn" id="download-btn-${widgetId}">
                                <span class="material-icons">download</span>
                                下載印章
                            </button>
                        </div>
                    </div>
                    
                    <!-- 控制區 -->
                    <div class="sw-controls">
                        <!-- 文字輸入 -->
                        <div class="sw-control-group">
                            <div class="sw-control-title">
                                <span class="material-icons">edit</span>
                                印章文字
                            </div>
                            <input type="text" 
                                   class="sw-text-input" 
                                   id="text-input-${widgetId}"
                                   placeholder="輸入印章文字" 
                                   maxlength="6" 
                                   value="${this.currentSelection.text}">
                        </div>
                        
                        <!-- 字體選擇 -->
                        ${this.config.fonts?.length > 0 ? `
                        <div class="sw-control-group">
                            <div class="sw-control-title">
                                <span class="material-icons">text_fields</span>
                                選擇字體
                            </div>
                            <div class="sw-option-grid" id="fonts-grid-${widgetId}">
                                ${this.renderFonts(widgetId)}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 形狀選擇 -->
                        ${this.config.shapes?.length > 0 ? `
                        <div class="sw-control-group">
                            <div class="sw-control-title">
                                <span class="material-icons">category</span>
                                選擇形狀
                            </div>
                            <div class="sw-option-grid" id="shapes-grid-${widgetId}">
                                ${this.renderShapes(widgetId)}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 顏色選擇 -->
                        ${this.config.colors?.length > 0 ? `
                        <div class="sw-control-group">
                            <div class="sw-control-title">
                                <span class="material-icons">palette</span>
                                選擇顏色
                            </div>
                            <div class="sw-option-grid" id="colors-grid-${widgetId}">
                                ${this.renderColors(widgetId)}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // 綁定事件
            this.bindEvents(widgetId);
        }
        
        renderFonts(widgetId) {
            return this.config.fonts.map((font, index) => `
                <div class="sw-option-item sw-font-item ${index === 0 ? 'selected' : ''}" 
                     data-font-index="${index}">
                    <div class="sw-font-preview" id="font-preview-${widgetId}-${index}">
                        <span style="opacity: 0.5;">載入中...</span>
                    </div>
                    <div class="sw-font-name">${font.displayName || font.name}</div>
                </div>
            `).join('');
        }
        
        renderShapes(widgetId) {
            return this.config.shapes.map((shape, index) => {
                let shapeStyle = '';
                
                switch(shape.name) {
                    case '圓形':
                        shapeStyle = 'border-radius: 50%;';
                        break;
                    case '橢圓形':
                        shapeStyle = 'border-radius: 50%; width: 80px; height: 55px;';
                        break;
                    case '長方形':
                        shapeStyle = 'width: 80px; height: 55px;';
                        break;
                    case '圓角方形':
                        shapeStyle = 'border-radius: 12px;';
                        break;
                }
                
                return `
                    <div class="sw-option-item ${index === 0 ? 'selected' : ''}" 
                         data-shape-index="${index}">
                        <div class="sw-shape-preview" style="${shapeStyle}"></div>
                        <div class="sw-shape-name">${shape.name}</div>
                    </div>
                `;
            }).join('');
        }
        
        renderColors(widgetId) {
            return this.config.colors.map((color, index) => `
                <div class="sw-option-item ${index === 0 ? 'selected' : ''}" 
                     data-color-index="${index}">
                    <div class="sw-color-preview" style="background-color: ${color.main};"></div>
                    <div class="sw-color-name">${color.name}</div>
                </div>
            `).join('');
        }
        
        bindEvents(widgetId) {
            // 文字輸入
            const textInput = document.getElementById(`text-input-${widgetId}`);
            if (textInput) {
                textInput.addEventListener('input', Utils.debounce((e) => {
                    this.currentSelection.text = e.target.value || '範例印章';
                    this.updatePreview();
                }, 300));
            }
            
            // 字體選擇
            const fontsGrid = document.getElementById(`fonts-grid-${widgetId}`);
            if (fontsGrid) {
                fontsGrid.addEventListener('click', (e) => {
                    const fontItem = e.target.closest('.sw-font-item');
                    if (fontItem) {
                        const index = parseInt(fontItem.dataset.fontIndex);
                        this.selectFont(index, widgetId);
                    }
                });
            }
            
            // 形狀選擇
            const shapesGrid = document.getElementById(`shapes-grid-${widgetId}`);
            if (shapesGrid) {
                shapesGrid.addEventListener('click', (e) => {
                    const shapeItem = e.target.closest('.sw-option-item');
                    if (shapeItem) {
                        const index = parseInt(shapeItem.dataset.shapeIndex);
                        this.selectShape(index, widgetId);
                    }
                });
            }
            
            // 顏色選擇
            const colorsGrid = document.getElementById(`colors-grid-${widgetId}`);
            if (colorsGrid) {
                colorsGrid.addEventListener('click', (e) => {
                    const colorItem = e.target.closest('.sw-option-item');
                    if (colorItem) {
                        const index = parseInt(colorItem.dataset.colorIndex);
                        this.selectColor(index, widgetId);
                    }
                });
            }
            
            // 下載按鈕
            const downloadBtn = document.getElementById(`download-btn-${widgetId}`);
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.downloadStamp();
                });
            }
        }
        
        initCanvas() {
            const canvas = this.container.querySelector('canvas');
            if (canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
            }
        }
        
        async loadResources() {
            // 載入字體
            if (this.config.fonts?.length > 0) {
                await this.loadFonts();
            }
        }
        
        async loadFonts() {
            const widgetId = this.container.querySelector('canvas').id.split('-')[2];
            
            for (let i = 0; i < this.config.fonts.length; i++) {
                const font = this.config.fonts[i];
                const success = await this.loadFont(font);
                
                // 更新預覽
                const preview = document.getElementById(`font-preview-${widgetId}-${i}`);
                if (preview) {
                    if (success) {
                        preview.innerHTML = `<span style="font-family: 'CustomFont${font.id}', serif;">${this.currentSelection.text.substring(0, 2) || '印'}</span>`;
                    } else {
                        preview.innerHTML = `<span style="color: #e74c3c;">載入失敗</span>`;
                    }
                }
            }
        }
        
        async loadFont(fontData) {
            try {
                // 檢查是否已載入
                if (this.loadedFonts.has(fontData.id)) {
                    return true;
                }
                
                // 建立字體 URL
                let fontUrl = null;
                if (fontData.githubPath) {
                    fontUrl = Utils.getGitHubRawUrl(fontData.githubPath);
                } else if (fontData.filename) {
                    fontUrl = Utils.getGitHubRawUrl(`assets/fonts/${fontData.filename}`);
                }
                
                if (!fontUrl) {
                    console.error('字體缺少路徑:', fontData);
                    return false;
                }
                
                console.log('載入字體:', fontData.name, 'from:', fontUrl);
                
                // 建立 @font-face
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`,
                    `url("${fontUrl}")`,
                    {
                        weight: fontData.weight || 'normal',
                        style: 'normal'
                    }
                );
                
                // 載入字體
                await fontFace.load();
                document.fonts.add(fontFace);
                
                this.loadedFonts.set(fontData.id, fontFace);
                console.log('字體載入成功:', fontData.name);
                
                return true;
                
            } catch (error) {
                console.error('載入字體失敗:', fontData.name, error);
                return false;
            }
        }
        
        selectFont(index, widgetId) {
            if (index >= 0 && index < this.config.fonts.length) {
                this.currentSelection.font = this.config.fonts[index];
                
                // 更新選中狀態
                const fontsGrid = document.getElementById(`fonts-grid-${widgetId}`);
                if (fontsGrid) {
                    fontsGrid.querySelectorAll('.sw-font-item').forEach((item, i) => {
                        item.classList.toggle('selected', i === index);
                    });
                }
                
                this.updatePreview();
            }
        }
        
        selectShape(index, widgetId) {
            if (index >= 0 && index < this.config.shapes.length) {
                this.currentSelection.shape = this.config.shapes[index];
                
                // 更新選中狀態
                const shapesGrid = document.getElementById(`shapes-grid-${widgetId}`);
                if (shapesGrid) {
                    shapesGrid.querySelectorAll('.sw-option-item').forEach((item, i) => {
                        item.classList.toggle('selected', i === index);
                    });
                }
                
                this.updatePreview();
            }
        }
        
        selectColor(index, widgetId) {
            if (index >= 0 && index < this.config.colors.length) {
                this.currentSelection.color = this.config.colors[index];
                
                // 更新選中狀態
                const colorsGrid = document.getElementById(`colors-grid-${widgetId}`);
                if (colorsGrid) {
                    colorsGrid.querySelectorAll('.sw-option-item').forEach((item, i) => {
                        item.classList.toggle('selected', i === index);
                    });
                }
                
                this.updatePreview();
            }
        }
        
        updatePreview() {
            if (!this.canvas || !this.ctx) return;
            
            const ctx = this.ctx;
            const canvas = this.canvas;
            
            // 清空畫布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 設定樣式
            const color = this.currentSelection.color?.main || '#dc3545';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 4;
            
            // 繪製形狀
            const shape = this.currentSelection.shape;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const size = Math.min(canvas.width, canvas.height) * 0.8;
            
            ctx.save();
            
            if (shape) {
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
                        ctx.strokeRect(centerX - size * 0.6, centerY - size * 0.4, size * 1.2, size * 0.8);
                        break;
                        
                    case '圓角方形':
                        this.roundRect(ctx, centerX - size / 2, centerY - size / 2, size, size, 20);
                        ctx.stroke();
                        break;
                        
                    default:
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                        ctx.stroke();
                }
            }
            
            // 繪製文字
            const font = this.currentSelection.font;
            const text = this.currentSelection.text;
            
            if (text) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 設定字體
                const fontSize = size * 0.25;
                if (font && this.loadedFonts.has(font.id)) {
                    ctx.font = `${font.weight || 'normal'} ${fontSize}px CustomFont${font.id}, serif`;
                } else {
                    ctx.font = `${fontSize}px serif`;
                }
                
                // 繪製文字
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
        
        downloadStamp() {
            if (!this.canvas) return;
            
            // 建立高解析度版本
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            // 設定為 2x 解析度
            const scale = 2;
            downloadCanvas.width = this.canvas.width * scale;
            downloadCanvas.height = this.canvas.height * scale;
            
            downloadCtx.scale(scale, scale);
            
            // 白色背景
            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 複製當前畫布內容
            downloadCtx.drawImage(this.canvas, 0, 0);
            
            // 下載
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `印章_${this.currentSelection.text}_${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        }
        
        applySecuritySettings() {
            // 從設定載入安全設定
            const settings = this.config.frontendSecurity || {};
            
            // 禁止選取文字
            if (settings.disableTextSelect !== false) {
                this.container.classList.add('no-select');
            }
            
            // 禁用右鍵
            if (settings.disableRightClick !== false) {
                this.container.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
            
            // 禁止拖曳
            if (settings.disableDrag !== false) {
                this.container.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
        }
    }
    
    // 自動初始化
    function autoInit() {
        const container = document.getElementById('stamp-font-widget-container');
        if (container && !container.dataset.initialized) {
            container.dataset.initialized = 'true';
            new StampWidget('stamp-font-widget-container');
        }
    }
    
    // 當 DOM 載入完成時初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 0);
    }
    
    // 公開 API
    window.StampWidget = StampWidget;
    
})();

console.log('印章預覽小工具 v4.0.0 已載入');
