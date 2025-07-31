/**
 * 印章預覽系統 v13.0.0 - 效能優化版
 * @author DK0124
 * @version 13.0.0
 * @date 2025-07-31
 * @description 可配置安全功能、優化UI/UX、提升載入速度
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window._STAMP_WIDGET_V13_LOADED) return;
    window._STAMP_WIDGET_V13_LOADED = true;
    
    // 🔒 安全防護模組（可配置版）
    const SecurityModule = {
        settings: {},
        
        // 初始化安全設定
        async init() {
            // 載入安全設定
            await this.loadSettings();
            
            // 根據設定啟用相應功能
            if (this.settings.disableRightClick !== false) this.disableRightClick();
            if (this.settings.disableTextSelect !== false) this.disableTextSelection();
            if (this.settings.disableDrag !== false) this.disableDragDrop();
            if (this.settings.detectDevTools) this.disableDevTools();
            if (this.settings.disablePrint !== false) this.disablePrint();
            if (this.settings.disableShortcuts !== false) this.disableShortcuts();
            if (this.settings.enableWatermark) this.addWatermark();
            if (this.settings.preventScreenshot) this.preventScreenshot();
            if (this.settings.encryptFontPath !== false) this.protectFonts();
        },
        
        // 載入安全設定
        async loadSettings() {
            try {
                // 先嘗試從配置檔載入
                const configUrl = `https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json?t=${Date.now()}`;
                const response = await fetch(configUrl);
                
                if (response.ok) {
                    const config = await response.json();
                    if (config.securitySettings) {
                        this.settings = config.securitySettings;
                        return;
                    }
                }
            } catch (e) {
                console.warn('無法載入安全設定，使用預設值');
            }
            
            // 預設設定
            this.settings = {
                disableRightClick: true,
                disableTextSelect: true,
                disableDrag: true,
                disablePrint: true,
                disableShortcuts: true,
                detectDevTools: false,
                preventScreenshot: false,
                enableWatermark: false,
                encryptFontPath: true,
                requireFontToken: false
            };
        },
        
        // 各項安全功能實作
        disableRightClick() {
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                    this.showWarning(this.settings.rightClickWarning || '禁止右鍵操作');
                    return false;
                }
            });
        },
        
        disableTextSelection() {
            const style = document.createElement('style');
            style.textContent = `
                #stamp-custom-font-widget,
                #stamp-custom-font-widget * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                }
            `;
            document.head.appendChild(style);
            
            document.addEventListener('selectstart', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        
        disableDragDrop() {
            document.addEventListener('dragstart', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        
        disableDevTools() {
            let devtools = {open: false};
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
        },
        
        onDevToolsOpen() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (widget) {
                widget.innerHTML = `
                    <div style="padding: 50px; text-align: center; color: #999;">
                        <h2>${this.settings.devToolsWarningTitle || '⚠️ 警告'}</h2>
                        <p>${this.settings.devToolsWarning || '偵測到開發者工具！<br>本系統內容受版權保護。'}</p>
                    </div>
                `;
            }
        },
        
        disablePrint() {
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    #stamp-custom-font-widget {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        disableShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.target.closest('#stamp-custom-font-widget')) {
                    // 禁用複製、儲存、列印等快捷鍵
                    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 's', 'p'].includes(e.key.toLowerCase())) {
                        e.preventDefault();
                        const actions = {
                            'a': '選取',
                            'c': '複製',
                            's': '儲存',
                            'p': '列印'
                        };
                        this.showWarning(`禁止${actions[e.key.toLowerCase()]}操作`);
                        return false;
                    }
                }
            });
        },
        
        addWatermark() {
            const watermark = document.createElement('div');
            watermark.id = 'stamp-watermark';
            watermark.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: ${this.settings.watermarkFontSize || 20}px;
                color: rgba(0, 0, 0, ${this.settings.watermarkOpacity || 0.05});
                pointer-events: none;
                z-index: 999999;
                white-space: nowrap;
                font-weight: bold;
                user-select: none;
            `;
            watermark.textContent = this.settings.watermarkText || '© 2025 印章系統 - 版權所有';
            document.body.appendChild(watermark);
        },
        
        preventScreenshot() {
            document.addEventListener('keyup', (e) => {
                if (e.keyCode === 44) {
                    this.showScreenshotWarning();
                }
            });
            
            if (this.settings.blurOnLoseFocus) {
                document.addEventListener('visibilitychange', () => {
                    const widget = document.getElementById('stamp-custom-font-widget');
                    if (widget) {
                        widget.style.filter = document.hidden ? 'blur(20px)' : 'none';
                    }
                });
            }
        },
        
        protectFonts() {
            // 攔截字體請求
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const url = args[0];
                if (typeof url === 'string' && 
                    (url.includes('.ttf') || url.includes('.otf') || url.includes('.woff'))) {
                    
                    // 檢查是否有有效的訪問令牌
                    if (SecurityModule.settings.requireFontToken) {
                        const token = SecurityModule.getFontToken(url);
                        if (!token || !SecurityModule.validateToken(token)) {
                            console.warn('無效的字體訪問令牌');
                            throw new Error('Unauthorized font access');
                        }
                    }
                }
                return originalFetch.apply(this, args);
            };
        },
        
        getFontToken(url) {
            // 從 URL 或 session 中獲取令牌
            const urlParams = new URLSearchParams(url.split('?')[1]);
            return urlParams.get('token') || sessionStorage.getItem('font_access_token');
        },
        
        validateToken(token) {
            try {
                const decoded = JSON.parse(atob(token));
                return decoded.expires > Date.now();
            } catch (e) {
                return false;
            }
        },
        
        showWarning(message) {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(244, 67, 54, 0.95);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 999999;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            warning.textContent = message;
            document.body.appendChild(warning);
            
            setTimeout(() => {
                warning.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => warning.remove(), 300);
            }, 2000);
        },
        
        showScreenshotWarning() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-size: 24px;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 72px; margin-bottom: 20px;">🚫</div>
                    <div>${this.settings.screenshotWarning || '禁止截圖 - 版權所有'}</div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => overlay.remove(), 500);
            }, 2500);
        }
    };
    
    // 🎨 UI 優化模組
    const UIModule = {
        // 建立現代化 UI
        createModernUI() {
            // 載入 Google Fonts
            if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap';
                document.head.appendChild(fontLink);
            }
            
            // 載入 Material Icons
            if (!document.querySelector('link[href*="Material+Icons"]')) {
                const iconLink = document.createElement('link');
                iconLink.rel = 'stylesheet';
                iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
                document.head.appendChild(iconLink);
            }
        },
        
        // 動畫效果
        addAnimations() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                
                .scfw-animate-in {
                    animation: fadeIn 0.3s ease forwards;
                }
                
                .scfw-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
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
    
    // 建立樣式（現代化設計）
    const styles = `
        /* 基礎樣式 */
        #stamp-custom-font-widget {
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #ffffff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            margin: 20px auto;
            max-width: 1400px;
            position: relative;
            opacity: 0;
            animation: fadeIn 0.5s ease forwards;
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 標題區 */
        #stamp-custom-font-widget .scfw-header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 40px;
        }
        
        #stamp-custom-font-widget .scfw-title {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-title .material-icons {
            font-size: 32px;
            color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-subtitle {
            font-size: 16px;
            color: #666;
            font-weight: 300;
        }
        
        /* 主預覽區 - 優化設計 */
        #stamp-custom-font-widget .scfw-preview-section {
            margin-bottom: 40px;
        }
        
        #stamp-custom-font-widget .scfw-preview-container {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-preview-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            animation: pulse 20s linear infinite;
        }
        
        #stamp-custom-font-widget .scfw-preview-title {
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            position: relative;
            z-index: 1;
        }
        
        #stamp-custom-font-widget .scfw-stamp-preview-wrapper {
            display: inline-block;
            padding: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease;
        }
        
        #stamp-custom-font-widget .scfw-stamp-preview-wrapper:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-stamp-display {
            position: relative;
        }
        
        /* Canvas 樣式 */
        #stamp-custom-font-widget .scfw-main-canvas {
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }
        
        /* 內容區 - 響應式網格 */
        #stamp-custom-font-widget .scfw-content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 30px;
        }
        
        /* 字體選擇區 - 卡片設計 */
        #stamp-custom-font-widget .scfw-fonts-section {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 30px;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        
        #stamp-custom-font-widget .scfw-section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        #stamp-custom-font-widget .scfw-section-title .material-icons {
            color: #9fb28e;
        }
        
        /* 搜尋框 - 現代化設計 */
        #stamp-custom-font-widget .scfw-search-container {
            position: relative;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 20px;
        }
        
        #stamp-custom-font-widget .scfw-search-input {
            width: 100%;
            padding: 14px 20px 14px 48px;
            border: 2px solid transparent;
            background: white;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        #stamp-custom-font-widget .scfw-search-input:focus {
            outline: none;
            border-color: #9fb28e;
            box-shadow: 0 4px 12px rgba(159, 178, 142, 0.15);
        }
        
        /* 分類標籤 - 藥丸設計 */
        #stamp-custom-font-widget .scfw-categories {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        
        #stamp-custom-font-widget .scfw-category {
            padding: 10px 20px;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
        }
        
        #stamp-custom-font-widget .scfw-category:hover {
            border-color: #9fb28e;
            color: #9fb28e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(159, 178, 142, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-category.active {
            background: #9fb28e;
            color: white;
            border-color: #9fb28e;
            box-shadow: 0 4px 12px rgba(159, 178, 142, 0.25);
        }
        
        /* 字體網格 - 優化卡片 */
        #stamp-custom-font-widget .scfw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
            max-height: 600px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        #stamp-custom-font-widget .scfw-font-item {
            background: white;
            border: 2px solid transparent;
            border-radius: 16px;
            padding: 25px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
            position: relative;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
            animation-delay: var(--delay, 0);
        }
        
        #stamp-custom-font-widget .scfw-font-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected {
            background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
            border-color: #9fb28e;
            box-shadow: 0 10px 30px rgba(159, 178, 142, 0.2);
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::after {
            content: '';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            background: #9fb28e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 0.5s ease;
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::before {
            content: '✓';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-font-preview canvas {
            max-width: 100%;
            height: auto;
        }
        
        #stamp-custom-font-widget .scfw-font-label {
            font-size: 15px;
            font-weight: 500;
            color: #333;
            margin-top: 10px;
        }
        
        /* 載入骨架屏 */
        #stamp-custom-font-widget .scfw-font-skeleton {
            height: 60px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        /* 右側選項面板 - 現代化設計 */
        #stamp-custom-font-widget .scfw-options-panel {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        #stamp-custom-font-widget .scfw-option-card {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 25px;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-option-card:hover {
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        
        #stamp-custom-font-widget .scfw-option-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            font-weight: 600;
            font-size: 16px;
            color: #2c3e50;
        }
        
        #stamp-custom-font-widget .scfw-option-header .material-icons {
            font-size: 24px;
            color: #9fb28e;
        }
        
        /* 文字輸入 - 優化設計 */
        #stamp-custom-font-widget .scfw-text-input {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid transparent;
            background: white;
            border-radius: 12px;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        #stamp-custom-font-widget .scfw-text-input:focus {
            outline: none;
            border-color: #9fb28e;
            box-shadow: 0 4px 12px rgba(159, 178, 142, 0.15);
        }
        
        /* 斷行控制 - 新設計 */
        #stamp-custom-font-widget .scfw-line-break-control {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }
        
        #stamp-custom-font-widget .scfw-line-break-toggle {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            cursor: pointer;
        }
        
        #stamp-custom-font-widget .scfw-toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background: #e0e0e0;
            border-radius: 12px;
            transition: background 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 10px;
            transition: transform 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        #stamp-custom-font-widget input[type="checkbox"]:checked + .scfw-toggle-switch {
            background: #9fb28e;
        }
        
        #stamp-custom-font-widget input[type="checkbox"]:checked + .scfw-toggle-switch::after {
            transform: translateX(24px);
        }
        
        #stamp-custom-font-widget input[type="checkbox"] {
            display: none;
        }
        
        #stamp-custom-font-widget .scfw-line-break-settings {
            display: none;
            gap: 12px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-line-break-settings.active {
            display: flex;
            opacity: 1;
        }
        
        #stamp-custom-font-widget .scfw-line-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            text-align: center;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-line-input:focus {
            outline: none;
            border-color: #9fb28e;
        }
        
        /* 形狀選擇 - 優化網格 */
        #stamp-custom-font-widget .scfw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        #stamp-custom-font-widget .scfw-shape-item {
            aspect-ratio: 1;
            background: white;
            border: 2px solid #e0e0e0;
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
        
        #stamp-custom-font-widget .scfw-shape-item:hover {
            border-color: #9fb28e;
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(159, 178, 142, 0.2);
        }
        
        #stamp-custom-font-widget .scfw-shape-item.selected {
            background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-shape-preview-border {
            width: 50px;
            height: 50px;
            border: 3px solid #9fb28e;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-shape-label {
            font-size: 13px;
            color: #666;
            font-weight: 500;
        }
        
        /* 顏色選擇 - 優化設計 */
        #stamp-custom-font-widget .scfw-colors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        #stamp-custom-font-widget .scfw-color-group {
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 56px;
            height: 56px;
            margin: 0 auto 10px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover {
            transform: translateY(-3px) scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected {
            transform: scale(1.15);
            box-shadow: 
                0 8px 25px rgba(0, 0, 0, 0.2),
                inset 0 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        #stamp-custom-font-widget .scfw-color-label {
            font-size: 13px;
            color: #666;
            font-weight: 500;
        }
        
        /* 圖案選擇 - 現代化設計 */
        #stamp-custom-font-widget .scfw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            border-color: #9fb28e;
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(159, 178, 142, 0.2);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
            border-color: #9fb28e;
        }
        
        #stamp-custom-font-widget .scfw-pattern-preview {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-pattern-none {
            font-size: 13px;
            color: #999;
        }
        
        /* 載入動畫 */
        #stamp-custom-font-widget .scfw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            gap: 16px;
        }
        
        #stamp-custom-font-widget .scfw-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f0f0f0;
            border-top-color: #9fb28e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        #stamp-custom-font-widget .scfw-loading-text {
            color: #999;
            font-size: 16px;
            font-weight: 300;
        }
        
        /* 滾動條美化 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 8px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 4px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 4px;
            transition: background 0.3s;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: #ccc;
        }
        
        /* 響應式設計 */
        @media (max-width: 1024px) {
            #stamp-custom-font-widget .scfw-content {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-options-panel {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
        }
        
        @media (max-width: 768px) {
            #stamp-custom-font-widget {
                padding: 20px;
            }
            
            #stamp-custom-font-widget .scfw-title {
                font-size: 24px;
            }
            
            #stamp-custom-font-widget .scfw-fonts-grid {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 15px;
            }
            
            #stamp-custom-font-widget .scfw-options-panel {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-preview-container {
                padding: 40px 20px;
            }
        }
        
        /* 圖案位置樣式 */
        #stamp-custom-font-widget .scfw-pattern-positions {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        #stamp-custom-font-widget .scfw-pattern-corner {
            position: absolute;
            width: 30px;
            height: 30px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-corner.top-left {
            top: 10px;
            left: 10px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-corner.top-right {
            top: 10px;
            right: 10px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-corner.bottom-left {
            bottom: 10px;
            left: 10px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-corner.bottom-right {
            bottom: 10px;
            right: 10px;
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
        previewSettings: {},
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
            line2: '',
            fontSize: 48,
            lineHeight: 1.2,
            borderWidth: 5,
            patternPositions: []
        },
        loadedFonts: {},
        fontNameMap: {},
        isLoading: false,
        elements: {},
        fontLoadErrors: {},
        updateTimeout: null,
        fontCache: new Map(),
        previewCache: new Map(),
        renderQueue: [],
        isRendering: false,
        
        // 初始化
        async init() {
            try {
                console.log('🚀 印章預覽系統 v13.0.0 開始初始化...');
                
                // 初始化 UI
                UIModule.createModernUI();
                UIModule.addAnimations();
                
                // 初始化安全模組
                await SecurityModule.init();
                
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
                    }, { timeout: 2000 });
                } else {
                    setTimeout(() => {
                        this.generatePreviews();
                    }, 100);
                }
                
                console.log('✅ 印章預覽系統初始化完成');
                
            } catch (error) {
                console.error('❌ Widget 初始化失敗:', error);
                this.showError('系統初始化失敗，請重新整理頁面');
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
                                    <div class="scfw-pattern-positions" id="scfw-pattern-positions"></div>
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
                                <span style="font-size: 14px; color: #999;">
                                    共 <span id="scfw-font-count">0</span> 種字體
                                </span>
                            </div>
                            
                            <div class="scfw-search-container">
                                <span class="material-icons scfw-search-icon">search</span>
                                <input type="text" 
                                       class="scfw-search-input" 
                                       id="scfw-font-search"
                                       placeholder="搜尋字體名稱...">
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
                                       maxlength="8"
                                       value="印章範例">
                                
                                <!-- 斷行控制 -->
                                <div class="scfw-line-break-control">
                                    <label class="scfw-line-break-toggle">
                                        <input type="checkbox" id="scfw-enable-line-break">
                                        <div class="scfw-toggle-switch"></div>
                                        <span>啟用手動斷行</span>
                                    </label>
                                    <div class="scfw-line-break-settings" id="scfw-line-break-settings">
                                        <input type="text" 
                                               class="scfw-line-input" 
                                               id="scfw-line1"
                                               placeholder="第一行"
                                               maxlength="4">
                                        <input type="text" 
                                               class="scfw-line-input" 
                                               id="scfw-line2"
                                               placeholder="第二行"
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
                line2Input: widget.querySelector('#scfw-line2'),
                fontCount: widget.querySelector('#scfw-font-count'),
                patternPositions: widget.querySelector('#scfw-pattern-positions')
            };
        },
        
        // 初始化主 Canvas
        initMainCanvas() {
            const canvas = this.elements.mainCanvas;
            const settings = this.previewSettings;
            
            // 根據設定調整畫布大小
            const width = settings.canvasSize?.width || 250;
            const height = settings.canvasSize?.height || 250;
            
            // 根據品質設定 DPR
            let dpr = window.devicePixelRatio || 1;
            if (settings.quality === 'low') dpr = 1;
            else if (settings.quality === 'medium') dpr = Math.min(dpr, 2);
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            
            const ctx = canvas.getContext('2d', { 
                alpha: false,
                desynchronized: settings.quality === 'low'
            });
            ctx.scale(dpr, dpr);
            
            // 設定抗鋸齒
            ctx.imageSmoothingEnabled = settings.antiAlias !== false;
            ctx.imageSmoothingQuality = settings.quality || 'high';
        },
        
        // 載入配置（優化版）
        async loadConfig() {
            try {
                console.log('📋 開始讀取配置檔...');
                
                // 使用快取
                const cacheKey = 'stamp_config_cache_v13';
                const cachedConfig = sessionStorage.getItem(cacheKey);
                
                if (cachedConfig) {
                    const cache = JSON.parse(cachedConfig);
                    if (Date.now() - cache.timestamp < 10 * 60 * 1000) { // 10分鐘快取
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
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    data: configData,
                    timestamp: Date.now()
                }));
                
                this.processConfig(configData);
                
            } catch (error) {
                console.error('❌ 無法讀取配置檔:', error);
                console.warn('⚠️ 使用預設配置');
                this.useDefaultConfig();
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
                        weight: font.weight || 'normal',
                        protected: font.protected || false,
                        securePath: font.securePath,
                        accessToken: font.accessToken
                    };
                    
                    // 處理字體 URL
                    if (font.protected && font.securePath && SecurityModule.settings.encryptFontPath) {
                        // 使用加密路徑
                        fontInfo.fontUrl = `${CONFIG.BASE_URL}/api/fonts/${font.securePath}`;
                        if (font.accessToken) {
                            fontInfo.fontUrl += `?token=${font.accessToken}`;
                        }
                    } else if (font.githubPath) {
                        fontInfo.fontUrl = `${CONFIG.BASE_URL}/${font.githubPath}`;
                    } else if (font.filename) {
                        fontInfo.fontUrl = `${CONFIG.FONTS_BASE_URL}/${font.filename}`;
                    }
                    
                    return fontInfo;
                });
                
                // 更新字體數量
                if (this.elements.fontCount) {
                    this.elements.fontCount.textContent = this.fonts.length;
                }
            }
            
            // 處理其他配置
            this.shapes = configData.shapes || this.defaultShapes;
            this.colors = configData.colors || this.defaultColors;
            this.patterns = configData.patterns || this.defaultPatterns;
            
            // 處理預覽設定
            if (configData.previewSettings) {
                this.previewSettings = configData.previewSettings;
                this.currentSelection.fontSize = configData.previewSettings.fontSize?.default || 48;
                this.currentSelection.lineHeight = configData.previewSettings.lineHeight?.default || 1.2;
                this.currentSelection.borderWidth = configData.previewSettings.borderWidth?.default || 5;
                this.currentSelection.patternPositions = configData.previewSettings.patternPositions || [];
                
                // 重新初始化 Canvas
                this.initMainCanvas();
            }
            
            // 設定預設選擇
            if (this.fonts.length > 0) {
                this.currentSelection.font = this.fonts[0];
                this.currentSelection.fontId = this.fonts[0].id;
            }
        },
        
        // 使用預設配置
        useDefaultConfig() {
            this.fonts = this.defaultFonts;
            this.shapes = this.defaultShapes;
            this.colors = this.defaultColors;
            this.patterns = this.defaultPatterns;
            this.previewSettings = {
                fontSize: { min: 24, max: 72, default: 48 },
                lineHeight: { min: 0.8, max: 2, default: 1.2 },
                borderWidth: { min: 1, max: 10, default: 5 },
                canvasSize: { width: 250, height: 250 },
                quality: 'high',
                antiAlias: true,
                patternPositions: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
            };
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
                const fontUrl = fontData.fontUrl;
                const fontName = `StampFont_${fontData.id}`;
                
                // 使用 Web Workers 載入字體（如果支援）
                const fontFace = new FontFace(
                    fontName, 
                    `url("${fontUrl}")`,
                    {
                        weight: fontData.weight || 'normal',
                        style: 'normal',
                        display: 'swap'
                    }
                );
                
                // 設定超時
                const loadPromise = fontFace.load();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('字體載入超時')), 8000);
                });
                
                await Promise.race([loadPromise, timeoutPromise]);
                
                document.fonts.add(fontFace);
                
                const fontInfo = {
                    fontFace: fontFace,
                    fontName: fontName
                };
                
                this.loadedFonts[fontData.id] = fontInfo;
                this.fontNameMap[fontData.id] = fontName;
                this.fontCache.set(fontData.id, fontInfo);
                
                return fontInfo;
                
            } catch (error) {
                console.error(`❌ 字體載入失敗 ${fontData.displayName}:`, error);
                this.fontLoadErrors[fontData.id] = error.message;
                return null;
            }
        },
        
        // 生成字體預覽（優化版）
        async generatePreviews() {
            this.isLoading = true;
            
            const text = this.currentSelection.text || '印章範例';
            this.elements.fontsGrid.innerHTML = '';
            
            // 建立載入中的骨架屏
            const skeletonCount = Math.min(this.fonts.length, 6);
            for (let i = 0; i < skeletonCount; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'scfw-font-item';
                skeleton.innerHTML = `
                    <div class="scfw-font-skeleton"></div>
                    <div class="scfw-font-label" style="width: 80%; height: 20px; background: #f0f0f0; border-radius: 4px; margin: 0 auto;"></div>
                `;
                this.elements.fontsGrid.appendChild(skeleton);
            }
            
            // 分批載入字體
            const batchSize = 4;
            const batches = [];
            
            for (let i = 0; i < this.fonts.length; i += batchSize) {
                batches.push(this.fonts.slice(i, i + batchSize));
            }
            
            // 逐批處理
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                
                // 如果是第一批，先清空骨架屏
                if (batchIndex === 0) {
                    this.elements.fontsGrid.innerHTML = '';
                }
                
                await Promise.all(batch.map(async (font, indexInBatch) => {
                    const globalIndex = batchIndex * batchSize + indexInBatch;
                    const card = this.createFontCard(font, globalIndex);
                    this.elements.fontsGrid.appendChild(card);
                    
                    // 載入字體並生成預覽
                    this.loadFontAndPreview(font, card);
                }));
                
                // 批次間短暫延遲，避免阻塞
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            
            this.isLoading = false;
            
            // 初始更新主預覽
            if (this.currentSelection.font) {
                this.updateMainPreview();
            }
        },
        
        // 載入字體並生成預覽
        async loadFontAndPreview(font, card) {
            try {
                const loaded = await this.loadFont(font);
                if (loaded) {
                    const previewDiv = card.querySelector('.scfw-font-preview');
                    const previewText = this.currentSelection.text.substring(0, 2) || '印章';
                    
                    // 檢查預覽快取
                    const cacheKey = `${font.id}_${previewText}_${this.currentSelection.color}`;
                    let canvas;
                    
                    if (this.previewCache.has(cacheKey)) {
                        canvas = this.previewCache.get(cacheKey).cloneNode();
                    } else {
                        canvas = this.createPreviewCanvas(previewText, font, this.currentSelection.color);
                        
                        // 限制快取大小
                        if (this.previewCache.size > 100) {
                            const firstKey = this.previewCache.keys().next().value;
                            this.previewCache.delete(firstKey);
                        }
                        this.previewCache.set(cacheKey, canvas);
                    }
                    
                    previewDiv.innerHTML = '';
                    previewDiv.appendChild(canvas);
                }
            } catch (error) {
                const previewDiv = card.querySelector('.scfw-font-preview');
                previewDiv.innerHTML = '<div style="color: #999; font-size: 14px;">載入失敗</div>';
            }
        },
        
        // 建立字體卡片
        createFontCard(fontData, index) {
            const card = document.createElement('div');
            card.className = 'scfw-font-item';
            card.setAttribute('data-id', fontData.id);
            card.dataset.fontId = fontData.id;
            card.dataset.fontName = fontData.name;
            card.dataset.category = fontData.category;
            card.style.setProperty('--delay', `${index * 50}ms`);
            
            if (this.currentSelection.fontId === fontData.id) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <div class="scfw-font-preview">
                    <div class="scfw-font-skeleton"></div>
                </div>
                <div class="scfw-font-label">${fontData.displayName}</div>
            `;
            
            // 點擊事件
            card.addEventListener('click', () => {
                // 移除其他選中狀態
                document.querySelectorAll('.scfw-font-item').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // 設定選中狀態
                card.classList.add('selected');
                this.currentSelection.fontId = fontData.id;
                this.currentSelection.font = fontData;
                
                // 更新主預覽
                this.updateMainPreview();
            });
            
            return card;
        },
        
        // 建立預覽 Canvas
        createPreviewCanvas(text, fontData, color) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });
            
            const dpr = this.previewSettings.quality === 'low' ? 1 : 2;
            canvas.width = 200 * dpr;
            canvas.height = 80 * dpr;
            canvas.style.width = '200px';
            canvas.style.height = '80px';
            
            ctx.scale(dpr, dpr);
            
            // 白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 80);
            
            const fontName = this.fontNameMap[fontData.id] || `StampFont_${fontData.id}`;
            
            ctx.font = `bold 36px ${fontName}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText(text, 100, 40);
            
            return canvas;
        },
        
        // 更新主預覽（優化版）
        updateMainPreview() {
            if (!this.currentSelection.font || !this.loadedFonts[this.currentSelection.fontId]) {
                return;
            }
            
            // 使用 requestAnimationFrame 優化渲染
            if (this.updateTimeout) {
                cancelAnimationFrame(this.updateTimeout);
            }
            
            this.updateTimeout = requestAnimationFrame(() => {
                this.renderMainPreview();
            });
        },
        
        // 渲染主預覽
        renderMainPreview() {
            const canvas = this.elements.mainCanvas;
            const ctx = canvas.getContext('2d');
            const displayWidth = parseInt(canvas.style.width);
            const displayHeight = parseInt(canvas.style.height);
            
            // 清除畫布
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            
            // 白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, displayWidth, displayHeight);
            
            // 繪製形狀
            const centerX = displayWidth / 2;
            const centerY = displayHeight / 2;
            const size = Math.min(displayWidth, displayHeight) * 0.7;
            
            ctx.save();
            ctx.strokeStyle = this.currentSelection.color;
            ctx.lineWidth = this.currentSelection.borderWidth || this.previewSettings.borderWidth?.default || 5;
            
            // 根據形狀繪製
            this.drawShape(ctx, this.currentSelection.shape, centerX, centerY, size);
            
            ctx.restore();
            
            // 繪製文字
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
                const lineHeight = fontSize * (this.currentSelection.lineHeight || 1.2);
                
                ctx.font = `bold ${fontSize}px ${fontName}`;
                
                if (line1) ctx.fillText(line1, centerX, centerY - lineHeight / 2);
                if (line2) ctx.fillText(line2, centerX, centerY + lineHeight / 2);
            } else {
                // 自動模式
                const text = this.currentSelection.text || '印章範例';
                let fontSize = this.calculateFontSize(text.length);
                
                ctx.font = `bold ${fontSize}px ${fontName}`;
                
                // 自動斷行處理
                if (text.length > 2 && (this.currentSelection.shape === 'circle' || this.currentSelection.shape === 'square')) {
                    const half = Math.ceil(text.length / 2);
                    const line1 = text.substring(0, half);
                    const line2 = text.substring(half);
                    
                    const lineHeight = fontSize * (this.currentSelection.lineHeight || 1.2);
                    ctx.font = `bold ${fontSize * 0.8}px ${fontName}`;
                    ctx.fillText(line1, centerX, centerY - lineHeight * 0.4);
                    ctx.fillText(line2, centerX, centerY + lineHeight * 0.4);
                } else {
                    ctx.fillText(text, centerX, centerY);
                }
            }
            
            ctx.restore();
            
            // 繪製圖案（如果有）
            if (this.currentSelection.pattern !== 'none') {
                this.drawPatterns(ctx, centerX, centerY, size);
            }
        },
        
        // 繪製形狀
        drawShape(ctx, shape, centerX, centerY, size) {
            switch(shape) {
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
                default:
                    // 自訂形狀
                    const customShape = this.shapes.find(s => s.id === shape);
                    if (customShape && customShape.githubPath) {
                        // 載入並繪製自訂形狀
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, centerX - size/2, centerY - size/2, size, size);
                        };
                        img.src = `${CONFIG.BASE_URL}/${customShape.githubPath}`;
                    }
            }
        },
        
        // 繪製圖案
        drawPatterns(ctx, centerX, centerY, size) {
            const positions = this.currentSelection.patternPositions || this.previewSettings.patternPositions || [];
            const pattern = this.patterns.find(p => p.id === this.currentSelection.pattern);
            
            if (!pattern || !pattern.githubPath) return;
            
            const img = new Image();
            img.onload = () => {
                const patternSize = 30;
                
                positions.forEach(pos => {
                    let x, y;
                    
                    switch(pos) {
                        case 'topLeft':
                            x = centerX - size/2 + 20;
                            y = centerY - size/2 + 20;
                            break;
                        case 'topRight':
                            x = centerX + size/2 - 20 - patternSize;
                            y = centerY - size/2 + 20;
                            break;
                        case 'bottomLeft':
                            x = centerX - size/2 + 20;
                            y = centerY + size/2 - 20 - patternSize;
                            break;
                        case 'bottomRight':
                            x = centerX + size/2 - 20 - patternSize;
                            y = centerY + size/2 - 20 - patternSize;
                            break;
                    }
                    
                    ctx.drawImage(img, x, y, patternSize, patternSize);
                });
            };
            
            img.src = `${CONFIG.BASE_URL}/${pattern.githubPath}`;
        },
        
        // 計算字體大小
        calculateFontSize(charCount) {
            const settings = this.previewSettings.fontSize || {};
            const min = settings.min || 24;
            const max = settings.max || 72;
            const defaultSize = settings.default || 48;
            
            if (charCount <= 1) return max;
            if (charCount === 2) return defaultSize * 1.2;
            if (charCount === 3) return defaultSize;
            if (charCount === 4) return defaultSize * 0.85;
            if (charCount === 5) return defaultSize * 0.7;
            if (charCount === 6) return defaultSize * 0.6;
            
            return Math.max(min, defaultSize * 0.5);
        },
        
        // 初始化各元件
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
                
                // 檢查是否有自訂形狀圖片
                if (shape.githubPath) {
                    item.innerHTML = `
                        <div class="scfw-shape-preview">
                            <img src="${CONFIG.BASE_URL}/${shape.githubPath}" 
                                 style="width: 50px; height: 50px; object-fit: contain;"
                                 alt="${shape.name}">
                        </div>
                        <span class="scfw-shape-label">${shape.name}</span>
                    `;
                } else {
                    item.innerHTML = `
                        <div class="scfw-shape-preview">
                            <div class="scfw-shape-preview-border" style="${shapeStyle} ${dimensions}"></div>
                        </div>
                        <span class="scfw-shape-label">${shape.name}</span>
                    `;
                }
                
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
                mainColor.dataset.color = color.main || color;
                
                mainColor.addEventListener('click', () => {
                    colorsGrid.querySelectorAll('.scfw-color-main').forEach(el => el.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.currentSelection.color = color.main || color;
                    this.updateMainPreview();
                    
                    // 使用 debounce 更新預覽
                    if (this.colorUpdateTimeout) clearTimeout(this.colorUpdateTimeout);
                    this.colorUpdateTimeout = setTimeout(() => {
                        this.updateAllPreviews();
                    }, 300);
                });
                
                const label = document.createElement('div');
                label.className = 'scfw-color-label';
                label.textContent = color.name || '自訂色';
                
                colorGroup.appendChild(mainColor);
                colorGroup.appendChild(label);
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
                
                if (pattern.id === 'none' || !pattern.githubPath) {
                    item.innerHTML = `
                        <div class="scfw-pattern-preview">
                            <span class="scfw-pattern-none">無</span>
                        </div>
                    `;
                } else {
                    item.innerHTML = `
                        <div class="scfw-pattern-preview">
                            <img src="${CONFIG.BASE_URL}/${pattern.githubPath}" 
                                 style="width: 100%; height: 100%; object-fit: contain;"
                                 alt="${pattern.name}">
                        </div>
                    `;
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
        
        // 更新所有預覽
        updateAllPreviews() {
            const currentCategory = this.currentSelection.category;
            const searchKeyword = this.elements.fontSearch.value.toLowerCase();
            
            // 更新每個字體預覽的顏色
            document.querySelectorAll('.scfw-font-item').forEach(card => {
                const fontId = card.dataset.fontId;
                const font = this.fonts.find(f => f.id == fontId);
                
                if (font) {
                    const previewDiv = card.querySelector('.scfw-font-preview');
                    const previewText = this.currentSelection.text.substring(0, 2) || '印章';
                    
                    // 清除快取以強制重新生成
                    const oldCacheKey = `${font.id}_${previewText}_*`;
                    for (const key of this.previewCache.keys()) {
                        if (key.startsWith(oldCacheKey.replace('*', ''))) {
                            this.previewCache.delete(key);
                        }
                    }
                    
                    // 重新生成預覽
                    if (this.loadedFonts[font.id]) {
                        const canvas = this.createPreviewCanvas(previewText, font, this.currentSelection.color);
                        previewDiv.innerHTML = '';
                        previewDiv.appendChild(canvas);
                    }
                }
            });
        },
        
        // 綁定事件
        bindEvents() {
            let inputTimeout;
            
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                
                if (this.currentSelection.enableLineBreak) {
                    this.syncLineBreakInputs();
                }
                
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(() => {
                    this.updateMainPreview();
                    this.updateAllPreviews();
                }, 300);
            });
            
            // 斷行控制
            this.elements.enableLineBreak.addEventListener('change', (e) => {
                this.currentSelection.enableLineBreak = e.target.checked;
                
                if (e.target.checked) {
                    this.elements.lineBreakSettings.classList.add('active');
                    setTimeout(() => {
                        this.elements.lineBreakSettings.style.opacity = '1';
                    }, 10);
                    this.syncLineBreakInputs();
                } else {
                    this.elements.lineBreakSettings.style.opacity = '0';
                    setTimeout(() => {
                        this.elements.lineBreakSettings.classList.remove('active');
                    }, 300);
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
            
            // 防止安全相關的事件（根據設定）
            if (SecurityModule.settings.disableShortcuts) {
                this.bindSecurityEvents();
            }
        },
        
        // 綁定安全相關事件
        bindSecurityEvents() {
            // 已由 SecurityModule 處理
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
            
            // 更新搜尋結果數量
            const visibleCount = Array.from(items).filter(item => item.style.display !== 'none').length;
            this.elements.fontCount.textContent = `${visibleCount} / ${this.fonts.length}`;
        },
        
        // 顯示錯誤訊息
        showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #f44336;
                color: white;
                padding: 20px 40px;
                border-radius: 8px;
                font-size: 16px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
        },
        
        // 清理資源
        cleanup() {
            // 清理快取
            this.fontCache.clear();
            this.previewCache.clear();
            
            // 取消動畫
            if (this.updateTimeout) {
                cancelAnimationFrame(this.updateTimeout);
            }
            
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
        version: '13.0.0',
        // 只暴露必要的公開方法
        updateText: (text) => {
            if (StampFontWidget.currentSelection && typeof text === 'string') {
                StampFontWidget.elements.textInput.value = text;
                StampFontWidget.currentSelection.text = text;
                StampFontWidget.updateMainPreview();
            }
        },
        getSelection: () => {
            // 返回唯讀的選擇狀態
            return {
                text: StampFontWidget.currentSelection.text,
                font: StampFontWidget.currentSelection.font?.displayName,
                shape: StampFontWidget.currentSelection.shape,
                color: StampFontWidget.currentSelection.color,
                pattern: StampFontWidget.currentSelection.pattern
            };
        },
        // 防止存取內部資源
        get fonts() { return '受保護資源'; },
        get config() { return '受保護資源'; },
        get loadedFonts() { return '受保護資源'; }
    };
    
    // 效能監控（開發模式）
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('%c🎯 印章預覽系統 v13.0.0 - 開發模式', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
        
        // 效能監控
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    console.log(`⏱️ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        perfObserver.observe({ entryTypes: ['measure'] });
        
        // 記錄初始化時間
        performance.mark('widget-init-start');
        const originalInit = StampFontWidget.init;
        StampFontWidget.init = async function() {
            await originalInit.call(this);
            performance.mark('widget-init-end');
            performance.measure('Widget 初始化', 'widget-init-start', 'widget-init-end');
        };
    } else {
        // 生產環境
        console.log('%c⚠️ 警告', 'font-size: 24px; font-weight: bold; color: #f44336;');
        console.log('%c本系統受版權保護，禁止任何形式的複製、修改或反向工程。', 'font-size: 14px; color: #666;');
        console.log('%c© 2025 DK0124 - 保留所有權利', 'font-size: 12px; color: #999;');
    }
    
})();
