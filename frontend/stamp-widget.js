/**
 * 印章預覽系統 - 安全加強版
 * @author DK0124
 * @version 12.0.0
 * @date 2025-01-31
 * @description 加強版權保護、優化載入速度、新增斷行控制
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window._STAMP_WIDGET_V12_LOADED) return;
    window._STAMP_WIDGET_V12_LOADED = true;
    
    // 🔒 安全防護模組
    const SecurityModule = {
        // 初始化所有安全措施
        init() {
            this.disableRightClick();
            this.disableTextSelection();
            this.disableDragDrop();
            this.disableDevTools();
            this.disablePrint();
            this.disableContextMenu();
            this.protectFonts();
            this.addWatermark();
            this.preventScreenshot();
        },
        
        // 禁用右鍵
        disableRightClick() {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showWarning('禁止右鍵操作');
                return false;
            });
        },
        
        // 禁用文字選擇
        disableTextSelection() {
            const style = document.createElement('style');
            style.textContent = `
                #stamp-custom-font-widget {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                }
                
                #stamp-custom-font-widget * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
            `;
            document.head.appendChild(style);
            
            // 防止通過 JavaScript 選擇
            document.addEventListener('selectstart', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        
        // 禁用拖曳
        disableDragDrop() {
            document.addEventListener('dragstart', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // 禁用圖片拖曳
            const style = document.createElement('style');
            style.textContent = `
                #stamp-custom-font-widget img,
                #stamp-custom-font-widget canvas {
                    -webkit-user-drag: none !important;
                    -khtml-user-drag: none !important;
                    -moz-user-drag: none !important;
                    -o-user-drag: none !important;
                    user-drag: none !important;
                    pointer-events: none !important;
                }
            `;
            document.head.appendChild(style);
        },
        
        // 偵測開發者工具
        disableDevTools() {
            let devtools = {open: false, orientation: null};
            const threshold = 160;
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        this.onDevToolsOpen();
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
            
            // 偵測 Console 是否開啟
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: () => {
                    devtools.open = true;
                    this.onDevToolsOpen();
                }
            });
            
            // 定期檢查
            setInterval(() => {
                console.log(element);
                console.clear();
            }, 1000);
        },
        
        // 開發者工具開啟時的處理
        onDevToolsOpen() {
            // 清空頁面內容
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; font-size: 24px;">
                    <div style="text-align: center;">
                        <h1>⚠️ 警告</h1>
                        <p>偵測到開發者工具</p>
                        <p>本系統內容受版權保護</p>
                        <p>請關閉開發者工具以繼續使用</p>
                    </div>
                </div>
            `;
            
            // 停止所有功能
            window.StampFontWidget = null;
        },
        
        // 禁用列印
        disablePrint() {
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    body {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // 攔截列印快捷鍵
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    this.showWarning('禁止列印');
                    return false;
                }
            });
        },
        
        // 禁用右鍵選單
        disableContextMenu() {
            // 禁用 Shift+F10
            document.addEventListener('keydown', (e) => {
                if (e.shiftKey && e.keyCode === 121) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // 禁用選單鍵
            document.addEventListener('keydown', (e) => {
                if (e.keyCode === 93) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        
        // 保護字體檔案
        protectFonts() {
            // 防止通過網路面板下載字體
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('.ttf') || 
                        entry.name.includes('.otf') || 
                        entry.name.includes('.woff')) {
                        console.warn('字體載入已被監控');
                    }
                }
            });
            observer.observe({ entryTypes: ['resource'] });
            
            // 混淆字體 URL
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && 
                    (url.includes('.ttf') || url.includes('.otf') || url.includes('.woff'))) {
                    // 記錄存取
                    console.warn('Font access monitored');
                }
                return originalFetch.apply(this, args);
            };
        },
        
        // 加入浮水印
        addWatermark() {
            const watermark = document.createElement('div');
            watermark.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999999;
                opacity: 0.05;
                font-size: 20px;
                color: #000;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            watermark.textContent = '© 2025 DK0124 - 版權所有';
            document.body.appendChild(watermark);
        },
        
        // 防止截圖
        preventScreenshot() {
            // 偵測 PrintScreen 鍵
            document.addEventListener('keyup', (e) => {
                if (e.keyCode === 44) {
                    this.showScreenshotWarning();
                }
            });
            
            // 偵測視窗失焦（可能在截圖）
            let screenshotTimer;
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    screenshotTimer = setTimeout(() => {
                        this.blurContent();
                    }, 100);
                } else {
                    clearTimeout(screenshotTimer);
                    this.unblurContent();
                }
            });
        },
        
        // 模糊內容
        blurContent() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (widget) {
                widget.style.filter = 'blur(20px)';
            }
        },
        
        // 取消模糊
        unblurContent() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (widget) {
                widget.style.filter = 'none';
            }
        },
        
        // 顯示警告
        showWarning(message) {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px 40px;
                border-radius: 8px;
                font-size: 18px;
                z-index: 999999;
                animation: fadeInOut 2s ease;
            `;
            warning.textContent = message;
            document.body.appendChild(warning);
            
            setTimeout(() => warning.remove(), 2000);
        },
        
        // 顯示截圖警告
        showScreenshotWarning() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-size: 48px;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 72px;">🚫</div>
                    <div>禁止截圖</div>
                    <div style="font-size: 24px; margin-top: 20px;">版權所有 © 2025 DK0124</div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            setTimeout(() => overlay.remove(), 3000);
        }
    };
    
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
    
    // 建立樣式
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
        
        /* 防止複製的額外樣式 */
        #stamp-custom-font-widget::selection {
            background: transparent !important;
        }
        
        #stamp-custom-font-widget::-moz-selection {
            background: transparent !important;
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 警告動畫 */
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
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
        
        /* Canvas 預覽樣式 - 防止儲存 */
        #stamp-custom-font-widget .scfw-main-canvas {
            display: block;
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
        
        /* 斷行控制 */
        #stamp-custom-font-widget .scfw-line-break-control {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e0e0e0;
        }
        
        #stamp-custom-font-widget .scfw-line-break-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        
        #stamp-custom-font-widget .scfw-line-break-toggle input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        #stamp-custom-font-widget .scfw-line-break-settings {
            display: none;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-line-break-settings.active {
            display: flex;
        }
        
        #stamp-custom-font-widget .scfw-line-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
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
        defaultFonts: [],
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
        fonts: [],
        shapes: [],
        colors: [],
        patterns: [],
        currentSelection: {
            text: '印章範例',
            font: null,
            fontId: null,
            shape: 'circle',
            pattern: 'none',
            color: '#e57373',
            category: 'all',
            enableLineBreak: false,
            line1: '',
            line2: ''
        },
        loadedFonts: {},
        fontNameMap: {},
        isLoading: false,
        elements: {},
        fontLoadErrors: {},
        updateTimeout: null,
        fontCache: new Map(), // 字體快取
        previewCache: new Map(), // 預覽快取
        
        // 初始化
        async init() {
            try {
                console.log('🚀 印章預覽系統開始初始化...');
                
                // 啟動安全防護
                SecurityModule.init();
                
                // 建立 HTML 結構
                this.createHTML();
                
                // 取得元素引用
                this.getElements();
                
                // 初始化 Canvas
                this.initMainCanvas();
                
                // 載入配置檔
                await this.loadConfig();
                
                // 初始化各元件
                this.initializeShapes();
                this.initializeColors();
                this.initializePatterns();
                
                // 綁定事件
                this.bindEvents();
                
                // 使用 requestIdleCallback 優化載入
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        this.generatePreviews();
                    });
                } else {
                    setTimeout(() => {
                        this.generatePreviews();
                    }, 100);
                }
                
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
                                
                                <!-- 斷行控制 -->
                                <div class="scfw-line-break-control">
                                    <div class="scfw-line-break-toggle">
                                        <input type="checkbox" id="scfw-enable-line-break">
                                        <label for="scfw-enable-line-break">啟用手動斷行</label>
                                    </div>
                                    <div class="scfw-line-break-settings" id="scfw-line-break-settings">
                                        <input type="text" 
                                               class="scfw-line-input" 
                                               id="scfw-line1"
                                               placeholder="第一行文字"
                                               maxlength="4">
                                        <input type="text" 
                                               class="scfw-line-input" 
                                               id="scfw-line2"
                                               placeholder="第二行文字"
                                               maxlength="4">
                                    </div>
                                </div>
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
                mainCanvas: widget.querySelector('#scfw-main-canvas'),
                enableLineBreak: widget.querySelector('#scfw-enable-line-break'),
                lineBreakSettings: widget.querySelector('#scfw-line-break-settings'),
                line1Input: widget.querySelector('#scfw-line1'),
                line2Input: widget.querySelector('#scfw-line2')
            };
        },
        
        // 初始化主 Canvas
        initMainCanvas() {
            const canvas = this.elements.mainCanvas;
            const dpr = window.devicePixelRatio || 1;
            
            const displayWidth = 250;
            const displayHeight = 250;
            
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            
            const ctx = canvas.getContext('2d', { 
                alpha: false, // 不透明背景，提升效能
                desynchronized: true // 非同步渲染
            });
            ctx.scale(dpr, dpr);
            
            // 防止右鍵儲存
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        },
        
        // 載入配置（優化版）
        async loadConfig() {
            try {
                console.log('📋 開始讀取配置檔...');
                
                // 使用快取
                const cachedConfig = sessionStorage.getItem('stamp_config_cache');
                if (cachedConfig) {
                    const cache = JSON.parse(cachedConfig);
                    if (Date.now() - cache.timestamp < 5 * 60 * 1000) { // 5分鐘快取
                        console.log('📦 使用快取配置');
                        this.processConfig(cache.data);
                        return;
                    }
                }
                
                const response = await fetch(CONFIG.CONFIG_URL + '?t=' + Date.now());
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const configData = await response.json();
                console.log('✅ 成功讀取配置檔');
                
                // 儲存快取
                sessionStorage.setItem('stamp_config_cache', JSON.stringify({
                    data: configData,
                    timestamp: Date.now()
                }));
                
                this.processConfig(configData);
                
            } catch (error) {
                console.error('❌ 無法讀取配置檔:', error);
                console.warn('⚠️ 使用預設配置');
                
                this.fonts = this.defaultFonts;
                this.shapes = this.defaultShapes;
                this.colors = this.defaultColors;
                this.patterns = this.defaultPatterns;
            }
        },
        
        // 處理配置
        processConfig(configData) {
            // 處理字體配置
            if (configData.fonts && Array.isArray(configData.fonts)) {
                this.fonts = configData.fonts.map((font, index) => {
                    const fontId = font.id || `font_${index + 1}`;
                    
                    const fontInfo = {
                        id: fontId,
                        name: font.name || font.displayName,
                        displayName: font.displayName || font.name,
                        category: font.category || 'custom',
                        filename: font.filename,
                        githubPath: font.githubPath,
                        weight: font.weight || 'normal'
                    };
                    
                    if (font.githubPath) {
                        fontInfo.fontUrl = `${CONFIG.BASE_URL}/${font.githubPath}`;
                    } else if (font.filename) {
                        fontInfo.fontUrl = `${CONFIG.FONTS_BASE_URL}/${font.filename}`;
                    }
                    
                    return fontInfo;
                });
            }
            
            // 處理其他配置
            this.shapes = configData.shapes || this.defaultShapes;
            this.colors = configData.colors || this.defaultColors;
            this.patterns = configData.patterns || this.defaultPatterns;
            
            // 設定預設選擇
            if (this.fonts.length > 0) {
                this.currentSelection.font = this.fonts[0];
                this.currentSelection.fontId = this.fonts[0].id;
            }
        },
        
        // 載入字體（優化版）
        async loadFont(fontData) {
            // 檢查快取
            if (this.fontCache.has(fontData.id)) {
                return this.fontCache.get(fontData.id);
            }
            
            if (this.loadedFonts[fontData.id]) {
                return this.loadedFonts[fontData.id];
            }
            
            try {
                const fontUrl = fontData.fontUrl || `${CONFIG.FONTS_BASE_URL}/${encodeURIComponent(fontData.filename)}`;
                const fontName = `StampFont_${fontData.id}`;
                
                // 使用 Promise.race 設定超時
                const loadPromise = new Promise(async (resolve, reject) => {
                    try {
                        const fontFace = new FontFace(
                            fontName, 
                            `url("${fontUrl}")`,
                            {
                                weight: fontData.weight || 'normal',
                                style: 'normal',
                                display: 'swap' // 優化字體載入
                            }
                        );
                        
                        await fontFace.load();
                        document.fonts.add(fontFace);
                        
                        const fontInfo = {
                            fontFace: fontFace,
                            fontName: fontName
                        };
                        
                        this.loadedFonts[fontData.id] = fontInfo;
                        this.fontNameMap[fontData.id] = fontName;
                        this.fontCache.set(fontData.id, fontInfo);
                        
                        resolve(fontInfo);
                    } catch (error) {
                        reject(error);
                    }
                });
                
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('字體載入超時')), 5000);
                });
                
                return await Promise.race([loadPromise, timeoutPromise]);
                
            } catch (error) {
                console.error(`❌ 字體載入失敗 ${fontData.displayName}:`, error);
                this.fontLoadErrors[fontData.id] = error.message;
                return null;
            }
        },
        
        // 建立預覽 Canvas（優化版）
        createPreviewCanvas(text, fontData, color) {
            // 檢查預覽快取
            const cacheKey = `${fontData.id}_${text}_${color}`;
            if (this.previewCache.has(cacheKey)) {
                return this.previewCache.get(cacheKey).cloneNode();
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });
            
            canvas.width = 400;
            canvas.height = 100;
            
            // 白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const fontName = this.fontNameMap[fontData.id] || `StampFont_${fontData.id}`;
            
            ctx.font = `40px ${fontName}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            
            // 快取預覽（限制快取大小）
            if (this.previewCache.size > 50) {
                const firstKey = this.previewCache.keys().next().value;
                this.previewCache.delete(firstKey);
            }
            this.previewCache.set(cacheKey, canvas);
            
            return canvas;
        },
        
        // 生成字體預覽（優化版）
        async generatePreviews() {
            this.isLoading = true;
            
            const text = this.currentSelection.text || '印章範例';
            this.elements.fontsGrid.innerHTML = '';
            
            // 分批載入字體
            const batchSize = 3;
            for (let i = 0; i < this.fonts.length; i += batchSize) {
                const batch = this.fonts.slice(i, i + batchSize);
                
                await Promise.all(batch.map(async (font) => {
                    const card = this.createFontCard(font);
                    this.elements.fontsGrid.appendChild(card);
                    
                    // 異步載入字體和預覽
                    this.loadFont(font).then((loaded) => {
                        if (loaded) {
                            const previewDiv = card.querySelector('.scfw-font-preview');
                            previewDiv.innerHTML = '';
                            
                            const canvas = this.createPreviewCanvas(
                                text.substring(0, 2) || '印', 
                                font, 
                                this.currentSelection.color
                            );
                            previewDiv.appendChild(canvas);
                        }
                    }).catch(error => {
                        const previewDiv = card.querySelector('.scfw-font-preview');
                        previewDiv.innerHTML = '<div class="scfw-font-error">載入失敗</div>';
                    });
                }));
                
                // 避免阻塞主執行緒
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            this.isLoading = false;
            
            // 初始更新主預覽
            if (this.currentSelection.font) {
                requestAnimationFrame(() => this.updateMainPreview());
            }
        },
        
        // 建立字體卡片
        createFontCard(fontData) {
            const card = document.createElement('div');
            card.className = 'scfw-font-item';
            card.setAttribute('data-id', fontData.id);
            card.dataset.fontId = fontData.id;
            card.dataset.fontName = fontData.name;
            card.dataset.category = fontData.category;
            card.style.position = 'relative';
            
            if (this.currentSelection.fontId === fontData.id) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <div class="scfw-font-preview">
                    <div class="scfw-loading-text">載入中...</div>
                </div>
                <div class="scfw-font-label">${fontData.displayName}</div>
            `;
            
            // Add click event
            card.addEventListener('click', () => {
                document.querySelectorAll('.scfw-font-item').forEach(c => {
                    c.classList.remove('selected');
                });
                
                card.classList.add('selected');
                this.currentSelection.fontId = fontData.id;
                this.currentSelection.font = fontData;
                this.updateMainPreview();
            });
            
            return card;
        },
        
        // 更新主預覽（支援斷行）
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
            
            const fontName = this.fontNameMap[this.currentSelection.fontId];
            ctx.fillStyle = this.currentSelection.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 處理斷行
            if (this.currentSelection.enableLineBreak && 
                (this.currentSelection.line1 || this.currentSelection.line2)) {
                // 手動斷行模式
                const line1 = this.currentSelection.line1 || '';
                const line2 = this.currentSelection.line2 || '';
                const fontSize = this.calculateFontSize(Math.max(line1.length, line2.length));
                const lineHeight = fontSize * 0.8;
                
                ctx.font = `bold ${fontSize}px ${fontName}`;
                
                if (line1) ctx.fillText(line1, centerX, centerY - lineHeight / 2);
                if (line2) ctx.fillText(line2, centerX, centerY + lineHeight / 2);
            } else {
                // 自動模式
                const text = this.currentSelection.text || '印章範例';
                let fontSize = 48;
                
                if (text.length === 1) {
                    fontSize = 72;
                } else if (text.length === 2) {
                    fontSize = 60;
                } else if (text.length >= 5) {
                    fontSize = 36;
                }
                
                ctx.font = `bold ${fontSize}px ${fontName}`;
                
                if (text.length > 2 && (this.currentSelection.shape === 'circle' || this.currentSelection.shape === 'square')) {
                    const half = Math.ceil(text.length / 2);
                    const line1 = text.substring(0, half);
                    const line2 = text.substring(half);
                    
                    ctx.font = `bold ${fontSize * 0.8}px ${fontName}`;
                    ctx.fillText(line1, centerX, centerY - 25);
                    ctx.fillText(line2, centerX, centerY + 25);
                } else {
                    ctx.fillText(text, centerX, centerY);
                }
            }
            
            ctx.restore();
        },
        
        // 計算字體大小
        calculateFontSize(charCount) {
            if (charCount <= 1) return 72;
            if (charCount === 2) return 60;
            if (charCount === 3) return 48;
            if (charCount === 4) return 40;
            return 36;
        },
        
        // 初始化形狀、顏色、圖案（保持原有）
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
        
        initializeColors() {
            const colorsGrid = this.elements.colorsGrid;
            colorsGrid.innerHTML = '';
            
            this.colors.forEach((color, index) => {
                const colorGroup = document.createElement('div');
                colorGroup.className = 'scfw-color-group';
                
                const mainColor = document.createElement('div');
                mainColor.className = 'scfw-color-main';
                if (index === 0) mainColor.classList.add('selected');
                mainColor.style.backgroundColor = color.main || color;
                mainColor.style.position = 'relative';
                mainColor.dataset.color = color.main || color;
                
                mainColor.addEventListener('click', () => {
                    colorsGrid.querySelectorAll('.scfw-color-main').forEach(el => el.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.currentSelection.color = color.main || color;
                    this.updateMainPreview();
                    
                    // 使用 debounce 更新預覽
                    if (this.colorUpdateTimeout) clearTimeout(this.colorUpdateTimeout);
                    this.colorUpdateTimeout = setTimeout(() => {
                        if (this.elements.fontsGrid.querySelectorAll('.scfw-font-item').length > 0) {
                            this.generatePreviews();
                        }
                    }, 500);
                });
                
                colorGroup.appendChild(mainColor);
                colorsGrid.appendChild(colorGroup);
            });
        },
        
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
        
        // 綁定事件
        bindEvents() {
            let inputTimeout;
            
            // 文字輸入（使用 debounce）
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                
                // 如果啟用斷行，同步更新斷行輸入
                if (this.currentSelection.enableLineBreak) {
                    this.syncLineBreakInputs();
                }
                
                if (this.elements.fontsGrid.querySelectorAll('.scfw-font-item').length > 0) {
                    clearTimeout(inputTimeout);
                    inputTimeout = setTimeout(() => {
                        this.generatePreviews();
                    }, 500);
                }
            });
            
            // 斷行控制
            this.elements.enableLineBreak.addEventListener('change', (e) => {
                this.currentSelection.enableLineBreak = e.target.checked;
                
                if (e.target.checked) {
                    this.elements.lineBreakSettings.classList.add('active');
                    this.syncLineBreakInputs();
                } else {
                    this.elements.lineBreakSettings.classList.remove('active');
                    this.currentSelection.line1 = '';
                    this.currentSelection.line2 = '';
                }
                
                this.updateMainPreview();
            });
            
            // 斷行輸入
            this.elements.line1Input.addEventListener('input', (e) => {
                this.currentSelection.line1 = e.target.value;
                this.updateMainPreview();
            });
            
            this.elements.line2Input.addEventListener('input', (e) => {
                this.currentSelection.line2 = e.target.value;
                this.updateMainPreview();
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
            
            // 防止複製快捷鍵
            document.addEventListener('keydown', (e) => {
                // 防止 Ctrl+A 全選
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    if (e.target.closest('#stamp-custom-font-widget')) {
                        e.preventDefault();
                        SecurityModule.showWarning('禁止選取內容');
                        return false;
                    }
                }
                
                // 防止 Ctrl+C 複製
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    if (e.target.closest('#stamp-custom-font-widget')) {
                        e.preventDefault();
                        SecurityModule.showWarning('禁止複製');
                        return false;
                    }
                }
                
                // 防止 Ctrl+S 儲存
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    SecurityModule.showWarning('禁止儲存');
                    return false;
                }
                
                // 防止 F12 開發者工具
                if (e.keyCode === 123) {
                    e.preventDefault();
                    return false;
                }
                
                // 防止 Ctrl+Shift+I
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                    e.preventDefault();
                    return false;
                }
                
                // 防止 Ctrl+Shift+J
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
                    e.preventDefault();
                    return false;
                }
                
                // 防止 Ctrl+U 檢視原始碼
                if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                    e.preventDefault();
                    SecurityModule.showWarning('禁止檢視原始碼');
                    return false;
                }
            });
            
            // 防止拖曳保存圖片
            this.elements.mainCanvas.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
            
            // 防止長按儲存（行動裝置）
            this.elements.mainCanvas.addEventListener('touchstart', (e) => {
                let timer;
                timer = setTimeout(() => {
                    SecurityModule.showWarning('禁止儲存圖片');
                }, 500);
                
                this.elements.mainCanvas.addEventListener('touchend', () => {
                    clearTimeout(timer);
                }, { once: true });
            });
        },
        
        // 同步斷行輸入
        syncLineBreakInputs() {
            const text = this.currentSelection.text || '';
            if (text.length <= 2) {
                this.elements.line1Input.value = text;
                this.elements.line2Input.value = '';
                this.currentSelection.line1 = text;
                this.currentSelection.line2 = '';
            } else {
                const half = Math.ceil(text.length / 2);
                this.elements.line1Input.value = text.substring(0, half);
                this.elements.line2Input.value = text.substring(half);
                this.currentSelection.line1 = text.substring(0, half);
                this.currentSelection.line2 = text.substring(half);
            }
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
        
        // 清理資源
        cleanup() {
            // 清理字體快取
            this.fontCache.clear();
            this.previewCache.clear();
            
            // 移除事件監聽
            document.removeEventListener('contextmenu', this.handleContextMenu);
            document.removeEventListener('selectstart', this.handleSelectStart);
            document.removeEventListener('dragstart', this.handleDragStart);
            
            // 清理字體
            Object.values(this.loadedFonts).forEach(fontInfo => {
                if (fontInfo.fontFace) {
                    document.fonts.delete(fontInfo.fontFace);
                }
            });
            
            this.loadedFonts = {};
            this.fontNameMap = {};
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
    
    // 暴露到全域（限制功能）
    window.StampFontWidget = {
        // 只暴露必要的公開方法
        updateText: (text) => {
            if (StampFontWidget.currentSelection) {
                StampFontWidget.currentSelection.text = text;
                StampFontWidget.updateMainPreview();
            }
        },
        // 防止存取內部方法
        get fonts() { return '無法存取'; },
        get config() { return '無法存取'; },
        get loadedFonts() { return '無法存取'; }
    };
    
    // 防止除錯
    (function() {
        const preventDebug = () => {
            debugger;
            setTimeout(preventDebug, 100);
        };
        // preventDebug(); // 可選：啟用會影響效能
    })();
    
    // 版本資訊（混淆）
    console.log('%c🎯 印章預覽系統 v12.0.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c© 2025 版權所有', 'color: #666;');
    console.log('%c⚠️ 警告：本系統受版權保護，禁止任何形式的複製或修改', 'color: #ff0000; font-weight: bold;');
    
})();
