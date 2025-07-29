/**
 * 印章預覽小工具 - 卡片化 UI 版本
 * @author DK0124
 * @version 3.0.0
 * @date 2025-01-29
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window.StampWidgetLoaded) return;
    window.StampWidgetLoaded = true;
    
    // 全域配置
    const CONFIG = {
        GITHUB_BASE: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/',
        CONFIG_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json',
        ASSETS_BASE: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/assets/'
    };
    
    // 載入 Material Icons
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }
    
    // 樣式定義
    const styles = `
        /* CSS 變數 */
        :root {
            --sw-primary: #9fb28e;
            --sw-primary-hover: #8fa07e;
            --sw-primary-light: rgba(159, 178, 142, 0.1);
            --sw-secondary: #f7ecd5;
            --sw-background: #dde5d6;
            --sw-card-bg: rgba(255, 255, 255, 0.95);
            --sw-text-primary: #84736a;
            --sw-text-secondary: #a09389;
            --sw-border: rgba(132, 115, 106, 0.1);
            --sw-shadow: 0 8px 32px rgba(132, 115, 106, 0.1);
            --sw-shadow-hover: 0 12px 40px rgba(132, 115, 106, 0.15);
            --sw-radius: 16px;
            --sw-radius-sm: 12px;
            --sw-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 容器重置 */
        #stamp-font-widget-container {
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--sw-text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        #stamp-font-widget-container * {
            box-sizing: border-box;
        }
        
        /* 主容器 */
        .stamp-widget {
            background: var(--sw-background);
            border-radius: var(--sw-radius);
            padding: 24px;
            position: relative;
            overflow: hidden;
            max-width: 100%;
            margin: 0 auto;
        }
        
        .stamp-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(159, 178, 142, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(247, 236, 213, 0.15) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        
        /* 內容包裝 */
        .stamp-widget-content {
            position: relative;
            z-index: 1;
            display: grid;
            gap: 24px;
        }
        
        /* 預覽卡片 */
        .sw-preview-card {
            background: var(--sw-card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: var(--sw-radius);
            padding: 32px;
            box-shadow: var(--sw-shadow);
            border: 1px solid var(--sw-border);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .sw-preview-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(159, 178, 142, 0.05) 100%);
            pointer-events: none;
        }
        
        .sw-preview-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--sw-text-primary);
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .sw-preview-title .material-icons {
            color: var(--sw-primary);
            font-size: 24px;
        }
        
        .sw-stamp-preview {
            display: inline-block;
            position: relative;
            z-index: 1;
            transition: var(--sw-transition);
        }
        
        .sw-stamp-preview:hover {
            transform: scale(1.05);
        }
        
        .sw-stamp-display {
            position: relative;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 150px;
            min-height: 150px;
        }
        
        /* 選項卡片容器 */
        .sw-options-container {
            display: grid;
            gap: 20px;
        }
        
        /* 選項卡片 */
        .sw-option-card {
            background: var(--sw-card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: var(--sw-radius);
            padding: 20px;
            box-shadow: var(--sw-shadow);
            border: 1px solid var(--sw-border);
            transition: var(--sw-transition);
        }
        
        .sw-option-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--sw-shadow-hover);
        }
        
        .sw-option-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--sw-border);
        }
        
        .sw-option-icon {
            width: 40px;
            height: 40px;
            background: var(--sw-primary-light);
            border-radius: var(--sw-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--sw-primary);
        }
        
        .sw-option-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--sw-text-primary);
            flex: 1;
        }
        
        /* 文字輸入 */
        .sw-text-input {
            width: 100%;
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            font-size: 16px;
            text-align: center;
            color: var(--sw-text-primary);
            transition: var(--sw-transition);
            font-weight: 500;
        }
        
        .sw-text-input:focus {
            outline: none;
            background: white;
            border-color: var(--sw-primary);
            box-shadow: 0 0 0 4px var(--sw-primary-light);
        }
        
        .sw-text-input::placeholder {
            color: var(--sw-text-secondary);
            opacity: 0.7;
        }
        
        /* 字體網格 */
        .sw-fonts-search {
            position: relative;
            margin-bottom: 16px;
        }
        
        .sw-fonts-search input {
            width: 100%;
            padding: 10px 16px 10px 40px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid var(--sw-border);
            border-radius: var(--sw-radius-sm);
            font-size: 14px;
            transition: var(--sw-transition);
        }
        
        .sw-fonts-search input:focus {
            outline: none;
            background: white;
            border-color: var(--sw-primary);
        }
        
        .sw-fonts-search .material-icons {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--sw-text-secondary);
            font-size: 20px;
        }
        
        .sw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
            max-height: 300px;
            overflow-y: auto;
            padding: 4px;
        }
        
        .sw-font-item {
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: var(--sw-transition);
            position: relative;
            overflow: hidden;
        }
        
        .sw-font-item:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .sw-font-item.selected {
            background: var(--sw-primary-light);
            border-color: var(--sw-primary);
        }
        
        .sw-font-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 20px;
            height: 20px;
            background: var(--sw-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .sw-font-preview {
            font-size: 24px;
            margin-bottom: 8px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .sw-font-name {
            font-size: 12px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        /* 形狀選擇 */
        .sw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
        
        .sw-shape-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: var(--sw-transition);
            position: relative;
        }
        
        .sw-shape-item:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.05);
        }
        
        .sw-shape-item.selected {
            background: var(--sw-primary-light);
            border-color: var(--sw-primary);
        }
        
        .sw-shape-preview {
            width: 40px;
            height: 40px;
            border: 3px solid var(--sw-primary);
        }
        
        .sw-shape-name {
            font-size: 11px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        /* 顏色選擇 */
        .sw-colors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 12px;
        }
        
        .sw-color-item {
            text-align: center;
            cursor: pointer;
        }
        
        .sw-color-preview {
            width: 48px;
            height: 48px;
            margin: 0 auto 8px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: var(--sw-transition);
            position: relative;
            overflow: hidden;
        }
        
        .sw-color-preview:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .sw-color-preview.selected {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        
        .sw-color-preview.selected::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        
        .sw-color-name {
            font-size: 11px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        /* 圖案選擇 */
        .sw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 12px;
        }
        
        .sw-pattern-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--sw-transition);
            overflow: hidden;
        }
        
        .sw-pattern-item:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.05);
        }
        
        .sw-pattern-item.selected {
            background: var(--sw-primary-light);
            border-color: var(--sw-primary);
        }
        
        .sw-pattern-item img {
            width: 32px;
            height: 32px;
            object-fit: contain;
            opacity: 0.8;
        }
        
        .sw-pattern-none {
            font-size: 12px;
            font-weight: 600;
            color: var(--sw-text-secondary);
        }
        
        /* 下載按鈕 */
        .sw-download-section {
            margin-top: 20px;
            text-align: center;
        }
        
        .sw-download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            background: var(--sw-primary);
            color: white;
            border: none;
            border-radius: var(--sw-radius-sm);
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--sw-transition);
            box-shadow: 0 4px 12px rgba(159, 178, 142, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .sw-download-btn:hover {
            background: var(--sw-primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(159, 178, 142, 0.4);
        }
        
        .sw-download-btn:active {
            transform: translateY(0);
        }
        
        .sw-download-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .sw-download-btn:active::before {
            width: 300px;
            height: 300px;
        }
        
        /* 載入狀態 */
        .sw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            gap: 16px;
        }
        
        .sw-loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--sw-border);
            border-top-color: var(--sw-primary);
            border-radius: 50%;
            animation: sw-spin 1s linear infinite;
        }
        
        @keyframes sw-spin {
            to { transform: rotate(360deg); }
        }
        
        .sw-loading-text {
            color: var(--sw-text-secondary);
            font-size: 16px;
        }
        
        /* 錯誤狀態 */
        .sw-error {
            text-align: center;
            padding: 60px;
            color: #e74c3c;
        }
        
        .sw-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.8;
        }
        
        .sw-error-message {
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .sw-retry-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: var(--sw-radius-sm);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: var(--sw-transition);
        }
        
        .sw-retry-btn:hover {
            background: #c0392b;
            transform: translateY(-1px);
        }
        
        /* 滾動條美化 */
        .sw-fonts-grid::-webkit-scrollbar,
        .sw-shapes-grid::-webkit-scrollbar,
        .sw-colors-grid::-webkit-scrollbar,
        .sw-patterns-grid::-webkit-scrollbar {
            width: 6px;
        }
        
        .sw-fonts-grid::-webkit-scrollbar-track,
        .sw-shapes-grid::-webkit-scrollbar-track,
        .sw-colors-grid::-webkit-scrollbar-track,
        .sw-patterns-grid::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
        }
        
        .sw-fonts-grid::-webkit-scrollbar-thumb,
        .sw-shapes-grid::-webkit-scrollbar-thumb,
        .sw-colors-grid::-webkit-scrollbar-thumb,
        .sw-patterns-grid::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
        }
        
        .sw-fonts-grid::-webkit-scrollbar-thumb:hover,
        .sw-shapes-grid::-webkit-scrollbar-thumb:hover,
        .sw-colors-grid::-webkit-scrollbar-thumb:hover,
        .sw-patterns-grid::-webkit-scrollbar-thumb:hover {
            background: var(--sw-primary);
        }
        
        /* 防止文字選取（根據後台設定） */
        .sw-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* 浮水印 */
        .sw-watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.03;
        }
        
        .sw-watermark-text {
            position: absolute;
            font-size: 12px;
            font-weight: 600;
            color: #000;
            transform: rotate(-45deg);
            white-space: nowrap;
        }
        
        /* 響應式設計 */
        @media (min-width: 768px) {
            .sw-options-container {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .sw-fonts-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            }
        }
        
        @media (min-width: 1024px) {
            .stamp-widget-content {
                grid-template-columns: 1fr 2fr;
                gap: 32px;
            }
            
            .sw-preview-card {
                position: sticky;
                top: 20px;
                align-self: start;
            }
            
            .sw-options-container {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 480px) {
            .stamp-widget {
                padding: 16px;
            }
            
            .sw-fonts-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                max-height: 240px;
            }
            
            .sw-shapes-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .sw-colors-grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .sw-patterns-grid {
                grid-template-columns: repeat(4, 1fr);
            }
            
            .sw-stamp-display {
                transform: scale(0.8);
            }
        }
    `;
    
    // 注入樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // 主類
    class StampWidget {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error('找不到容器:', containerId);
                return;
            }
            
            this.config = null;
            this.securitySettings = null;
            this.currentSelection = {
                text: '範例印章',
                font: null,
                shape: null,
                color: null,
                pattern: null
            };
            this.loadedFonts = new Map();
            
            this.init();
        }
        
        async init() {
            try {
                this.showLoading();
                
                // 載入設定
                await this.loadConfig();
                
                // 檢查資料
                if (!this.config || 
                    (!this.config.fonts?.length && 
                     !this.config.shapes?.length && 
                     !this.config.colors?.length)) {
                    this.showEmpty();
                    return;
                }
                
                // 載入安全設定
                this.loadSecuritySettings();
                
                // 建立 UI
                this.render();
                
                // 套用安全設定
                this.applySecuritySettings();
                
                // 載入字體
                await this.loadAllFonts();
                
                // 更新預覽
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
                    throw new Error('無法載入設定檔');
                }
                
                this.config = await response.json();
                console.log('設定載入成功:', this.config);
                
                // 設定預設值
                if (this.config.fonts?.length > 0) {
                    this.currentSelection.font = this.config.fonts[0];
                }
                if (this.config.shapes?.length > 0) {
                    this.currentSelection.shape = this.config.shapes[0];
                }
                if (this.config.colors?.length > 0) {
                    this.currentSelection.color = this.config.colors[0];
                }
                
            } catch (error) {
                console.error('載入設定失敗:', error);
                throw error;
            }
        }
        
        loadSecuritySettings() {
            // 從設定中載入前台安全設定
            if (this.config.frontendSecurity) {
                this.securitySettings = this.config.frontendSecurity;
            } else {
                // 從 localStorage 載入（如果有）
                try {
                    this.securitySettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
                } catch (e) {
                    this.securitySettings = {};
                }
            }
        }
        
        applySecuritySettings() {
            if (!this.securitySettings) return;
            
            const settings = this.securitySettings;
            
            // 禁止選取文字
            if (settings.disableTextSelect !== false) {
                this.container.classList.add('sw-no-select');
                document.addEventListener('selectstart', (e) => {
                    if (e.target.closest('#' + this.container.id)) {
                        e.preventDefault();
                    }
                });
            }
            
            // 禁用右鍵
            if (settings.disableRightClick !== false) {
                this.container.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showMessage('右鍵功能已被禁用');
                    return false;
                });
            }
            
            // 禁止拖曳
            if (settings.disableDrag !== false) {
                this.container.addEventListener('dragstart', (e) => {
                    if (e.target.tagName === 'IMG' || e.target.closest('.sw-stamp-display')) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
            
            // 啟用浮水印
            if (settings.enableWatermark !== false) {
                this.createWatermark();
                // 定期更新浮水印
                setInterval(() => {
                    this.updateWatermark();
                }, (settings.watermarkInterval || 60) * 1000);
            }
            
            // 防截圖保護
            if (settings.preventScreenshot !== false) {
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        this.showScreenshotWarning();
                    }
                });
                
                // 監聽截圖快捷鍵
                document.addEventListener('keydown', (e) => {
                    // PrintScreen
                    if (e.key === 'PrintScreen') {
                        e.preventDefault();
                        this.showScreenshotWarning();
                    }
                    // Windows: Win + Shift + S
                    if ((e.metaKey || e.key === 'Meta') && e.shiftKey && e.key === 's') {
                        e.preventDefault();
                        this.showScreenshotWarning();
                    }
                    // Mac: Cmd + Shift + 3/4/5
                    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
                        e.preventDefault();
                        this.showScreenshotWarning();
                    }
                });
            }
            
            // 偵測開發者工具
            if (settings.disableDevTools !== false) {
                this.detectDevTools();
            }
            
            // 禁止列印
            if (settings.disablePrint !== false) {
                window.addEventListener('beforeprint', (e) => {
                    e.preventDefault();
                    this.showMessage('列印功能已被禁用');
                    return false;
                });
                
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 'p') {
                        e.preventDefault();
                        this.showMessage('列印功能已被禁用');
                        return false;
                    }
                });
            }
            
            // 失焦模糊
            if (settings.blurOnLoseFocus) {
                window.addEventListener('blur', () => {
                    this.container.style.filter = 'blur(10px)';
                });
                
                window.addEventListener('focus', () => {
                    this.container.style.filter = 'none';
                });
            }
        }
        
        detectDevTools() {
            let devtools = { open: false };
            const threshold = 160;
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        this.showDevToolsWarning();
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
        }
        
        createWatermark() {
            const watermark = document.createElement('div');
            watermark.className = 'sw-watermark';
            watermark.id = 'sw-watermark-' + this.container.id;
            
            const text = this.securitySettings.watermarkText || '© 2025 印章系統';
            const fontSize = this.securitySettings.watermarkFontSize || 12;
            
            // 生成隨機分布的浮水印
            for (let i = 0; i < 50; i++) {
                const span = document.createElement('span');
                span.className = 'sw-watermark-text';
                span.style.cssText = `
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: ${fontSize}px;
                `;
                span.textContent = text;
                watermark.appendChild(span);
            }
            
            document.body.appendChild(watermark);
        }
        
        updateWatermark() {
            const watermark = document.getElementById('sw-watermark-' + this.container.id);
            if (watermark) {
                const timestamp = new Date().toLocaleString('zh-TW');
                watermark.querySelectorAll('.sw-watermark-text').forEach(span => {
                    span.textContent = `${this.securitySettings.watermarkText || '© 2025 印章系統'} - ${timestamp}`;
                });
            }
        }
        
        showScreenshotWarning() {
            const warning = document.createElement('div');
            warning.style.cssText = `
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
                flex-direction: column;
                z-index: 999999;
                font-size: 24px;
            `;
            warning.innerHTML = `
                <div class="material-icons" style="font-size: 72px; margin-bottom: 20px;">no_photography</div>
                <div>${this.securitySettings.screenshotWarning || '禁止截圖'}</div>
            `;
            
            document.body.appendChild(warning);
            
            setTimeout(() => {
                warning.remove();
            }, 3000);
        }
        
        showDevToolsWarning() {
            console.clear();
            console.log(
                '%c' + (this.securitySettings.devToolsWarning || '警告：偵測到開發者工具！'),
                'color: red; font-size: 30px; font-weight: bold;'
            );
            
            this.showMessage('偵測到開發者工具');
        }
        
        showMessage(message) {
            const msg = document.createElement('div');
            msg.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 999999;
                animation: slideIn 0.3s ease;
            `;
            msg.textContent = message;
            
            document.body.appendChild(msg);
            
            setTimeout(() => {
                msg.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => msg.remove(), 300);
            }, 2000);
        }
        
        showLoading() {
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <div class="sw-loading">
                        <div class="sw-loading-spinner"></div>
                        <div class="sw-loading-text">載入印章系統中...</div>
                    </div>
                </div>
            `;
        }
        
        showEmpty() {
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <div class="sw-error">
                        <div class="material-icons sw-error-icon">inbox</div>
                        <div class="sw-error-message">尚未設定任何內容</div>
                        <div style="color: var(--sw-text-secondary); font-size: 14px;">
                            請先到後台管理系統上傳資源
                        </div>
                    </div>
                </div>
            `;
        }
        
        showError(message) {
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <div class="sw-error">
                        <div class="material-icons sw-error-icon">error_outline</div>
                        <div class="sw-error-message">${message}</div>
                        <button class="sw-retry-btn" onclick="location.reload()">
                            <span class="material-icons">refresh</span>
                            重新載入
                        </button>
                    </div>
                </div>
            `;
        }
        
        render() {
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <div class="stamp-widget-content">
                        <!-- 預覽卡片 -->
                        <div class="sw-preview-card">
                            <h2 class="sw-preview-title">
                                <span class="material-icons">verified</span>
                                印章預覽
                            </h2>
                            <div class="sw-stamp-preview">
                                <div class="sw-stamp-display" id="stamp-preview-${this.container.id}">
                                    <!-- 動態生成 -->
                                </div>
                            </div>
                            <div class="sw-download-section">
                                <button class="sw-download-btn" onclick="window.stampWidget_${this.container.id}.downloadStamp()">
                                    <span class="material-icons">download</span>
                                    下載印章
                                </button>
                            </div>
                        </div>
                        
                        <!-- 選項卡片容器 -->
                        <div class="sw-options-container">
                            <!-- 文字輸入卡片 -->
                            <div class="sw-option-card">
                                <div class="sw-option-header">
                                    <div class="sw-option-icon">
                                        <span class="material-icons">edit</span>
                                    </div>
                                    <div class="sw-option-title">印章文字</div>
                                </div>
                                <input type="text" 
                                       class="sw-text-input" 
                                       placeholder="輸入印章文字"
                                       maxlength="6"
                                       value="${this.currentSelection.text}"
                                       onchange="window.stampWidget_${this.container.id}.updateText(this.value)">
                            </div>
                            
                            <!-- 字體選擇卡片 -->
                            ${this.config.fonts?.length ? `
                            <div class="sw-option-card">
                                <div class="sw-option-header">
                                    <div class="sw-option-icon">
                                        <span class="material-icons">text_fields</span>
                                    </div>
                                    <div class="sw-option-title">選擇字體</div>
                                </div>
                                <div class="sw-fonts-search">
                                    <span class="material-icons">search</span>
                                    <input type="text" 
                                           placeholder="搜尋字體..."
                                           oninput="window.stampWidget_${this.container.id}.searchFonts(this.value)">
                                </div>
                                <div class="sw-fonts-grid" id="fonts-grid-${this.container.id}">
                                    ${this.renderFonts()}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 形狀選擇卡片 -->
                            ${this.config.shapes?.length ? `
                            <div class="sw-option-card">
                                <div class="sw-option-header">
                                    <div class="sw-option-icon">
                                        <span class="material-icons">category</span>
                                    </div>
                                    <div class="sw-option-title">選擇形狀</div>
                                </div>
                                <div class="sw-shapes-grid">
                                    ${this.renderShapes()}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 顏色選擇卡片 -->
                            ${this.config.colors?.length ? `
                            <div class="sw-option-card">
                                <div class="sw-option-header">
                                    <div class="sw-option-icon">
                                        <span class="material-icons">palette</span>
                                    </div>
                                    <div class="sw-option-title">選擇顏色</div>
                                </div>
                                <div class="sw-colors-grid">
                                    ${this.renderColors()}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 圖案選擇卡片 -->
                            ${this.config.patterns?.length ? `
                            <div class="sw-option-card">
                                <div class="sw-option-header">
                                    <div class="sw-option-icon">
                                        <span class="material-icons">texture</span>
                                    </div>
                                    <div class="sw-option-title">選擇圖案</div>
                                </div>
                                <div class="sw-patterns-grid">
                                    ${this.renderPatterns()}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // 儲存實例到全域
            window[`stampWidget_${this.container.id}`] = this;
        }
        
        renderFonts() {
            return this.config.fonts.map((font, index) => `
                <div class="sw-font-item ${index === 0 ? 'selected' : ''}" 
                     data-font-id="${font.id}"
                     onclick="window.stampWidget_${this.container.id}.selectFont('${font.id}')">
                    <div class="sw-font-preview" id="font-preview-${font.id}">
                        <span style="opacity: 0.3;">載入中...</span>
                    </div>
                    <div class="sw-font-name">${font.displayName || font.name}</div>
                </div>
            `).join('');
        }
        
        renderShapes() {
            return this.config.shapes.map((shape, index) => {
                let shapeStyle = '';
                let dimensions = '';
                
                switch(shape.name) {
                    case '圓形':
                        shapeStyle = 'border-radius: 50%;';
                        break;
                    case '橢圓形':
                        shapeStyle = 'border-radius: 50%;';
                        dimensions = 'width: 50px; height: 35px;';
                        break;
                    case '長方形':
                        dimensions = 'width: 50px; height: 35px;';
                        break;
                    case '圓角方形':
                        shapeStyle = 'border-radius: 8px;';
                        break;
                }
                
                return `
                    <div class="sw-shape-item ${index === 0 ? 'selected' : ''}"
                         onclick="window.stampWidget_${this.container.id}.selectShape('${shape.id}')">
                        <div class="sw-shape-preview" style="${shapeStyle} ${dimensions}"></div>
                        <div class="sw-shape-name">${shape.name}</div>
                    </div>
                `;
            }).join('');
        }
        
        renderColors() {
            return this.config.colors.map((color, index) => `
                <div class="sw-color-item"
                     onclick="window.stampWidget_${this.container.id}.selectColor('${color.id}')">
                    <div class="sw-color-preview ${index === 0 ? 'selected' : ''}"
                         style="background-color: ${color.main};"
                         data-color-id="${color.id}"></div>
                    <div class="sw-color-name">${color.name}</div>
                </div>
            `).join('');
        }
        
        renderPatterns() {
            let html = `
                <div class="sw-pattern-item selected"
                     onclick="window.stampWidget_${this.container.id}.selectPattern(null)">
                    <span class="sw-pattern-none">無</span>
                </div>
            `;
            
            if (this.config.patterns) {
                html += this.config.patterns.map(pattern => {
                    const imgUrl = pattern.githubPath ? 
                        `${CONFIG.GITHUB_BASE}${pattern.githubPath}` : '';
                    
                    return `
                        <div class="sw-pattern-item"
                             onclick="window.stampWidget_${this.container.id}.selectPattern('${pattern.id}')">
                            ${imgUrl ? 
                                `<img src="${imgUrl}" alt="${pattern.name}">` :
                                `<span class="sw-pattern-none">${pattern.name}</span>`
                            }
                        </div>
                    `;
                }).join('');
            }
            
            return html;
        }
        
        async loadAllFonts() {
            if (!this.config.fonts) return;
            
            for (const font of this.config.fonts) {
                await this.loadFont(font);
            }
        }
        
        async loadFont(fontData) {
            try {
                if (this.loadedFonts.has(fontData.id)) {
                    return this.loadedFonts.get(fontData.id);
                }
                
                let fontUrl;
                if (fontData.githubPath) {
                    fontUrl = `${CONFIG.GITHUB_BASE}${fontData.githubPath}`;
                } else if (fontData.filename) {
                    fontUrl = `${CONFIG.ASSETS_BASE}fonts/${fontData.filename}`;
                } else {
                    console.error('字體缺少路徑:', fontData);
                    return null;
                }
                
                const fontFace = new FontFace(
                    `StampFont${fontData.id}`,
                    `url(${fontUrl})`,
                    {
                        weight: fontData.weight || 'normal',
                        style: 'normal'
                    }
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loadedFonts.set(fontData.id, fontFace);
                
                // 更新預覽
                const preview = document.getElementById(`font-preview-${fontData.id}`);
                if (preview) {
                    preview.innerHTML = `
                        <span style="font-family: StampFont${fontData.id}, serif; font-weight: ${fontData.weight || 'normal'};">
                            ${this.currentSelection.text.substring(0, 2) || '印章'}
                        </span>
                    `;
                }
                
                return fontFace;
                
            } catch (error) {
                console.error('載入字體失敗:', fontData.name, error);
                
                // 顯示錯誤
                const preview = document.getElementById(`font-preview-${fontData.id}`);
                if (preview) {
                    preview.innerHTML = '<span style="color: #e74c3c;">載入失敗</span>';
                }
                
                return null;
            }
        }
        
        updateText(text) {
            this.currentSelection.text = text || '範例印章';
            this.updatePreview();
            this.updateAllFontPreviews();
        }
        
        updateAllFontPreviews() {
            if (!this.config.fonts) return;
            
            this.config.fonts.forEach(font => {
                const preview = document.querySelector(`#font-preview-${font.id} span`);
                if (preview && !preview.style.opacity) {
                    preview.textContent = this.currentSelection.text.substring(0, 2) || '印章';
                }
            });
        }
        
        selectFont(fontId) {
            const font = this.config.fonts.find(f => f.id == fontId);
            if (!font) return;
            
            this.currentSelection.font = font;
            
            // 更新選中狀態
            document.querySelectorAll(`#fonts-grid-${this.container.id} .sw-font-item`).forEach(item => {
                item.classList.toggle('selected', item.dataset.fontId == fontId);
            });
            
            this.updatePreview();
        }
        
        selectShape(shapeId) {
            const shape = this.config.shapes.find(s => s.id == shapeId);
            if (!shape) return;
            
            this.currentSelection.shape = shape;
            
            // 更新選中狀態
            this.container.querySelectorAll('.sw-shape-item').forEach(item => {
                item.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            
            this.updatePreview();
        }
        
        selectColor(colorId) {
            const color = this.config.colors.find(c => c.id == colorId);
            if (!color) return;
            
            this.currentSelection.color = color;
            
            // 更新選中狀態
            this.container.querySelectorAll('.sw-color-preview').forEach(item => {
                item.classList.toggle('selected', item.parentElement.querySelector('[data-color-id]')?.dataset.colorId == colorId);
            });
            
            this.updatePreview();
        }
        
        selectPattern(patternId) {
            if (patternId) {
                const pattern = this.config.patterns.find(p => p.id == patternId);
                this.currentSelection.pattern = pattern;
            } else {
                this.currentSelection.pattern = null;
            }
            
            // 更新選中狀態
            this.container.querySelectorAll('.sw-pattern-item').forEach(item => {
                item.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            
            this.updatePreview();
        }
        
        searchFonts(keyword) {
            const items = this.container.querySelectorAll('.sw-font-item');
            const lowerKeyword = keyword.toLowerCase();
            
            items.forEach(item => {
                const fontName = item.querySelector('.sw-font-name').textContent.toLowerCase();
                item.style.display = fontName.includes(lowerKeyword) ? 'block' : 'none';
            });
        }
        
        updatePreview() {
            const preview = document.getElementById(`stamp-preview-${this.container.id}`);
            if (!preview) return;
            
            const { text, font, shape, color, pattern } = this.currentSelection;
            
            let shapeStyle = '';
            let dimensions = 'width: 180px; height: 180px;';
            
            if (shape) {
                switch(shape.name) {
                    case '圓形':
                        shapeStyle = 'border-radius: 50%;';
                        break;
                    case '橢圓形':
                        shapeStyle = 'border-radius: 50%;';
                        dimensions = 'width: 220px; height: 160px;';
                        break;
                    case '長方形':
                        dimensions = 'width: 220px; height: 150px;';
                        break;
                    case '圓角方形':
                        shapeStyle = 'border-radius: 20px;';
                        break;
                }
            }
            
            const fontFamily = font ? `StampFont${font.id}, serif` : 'serif';
            const fontColor = color?.main || '#dc3545';
            
            let patternHtml = '';
            if (pattern && pattern.githubPath) {
                const patternUrl = `${CONFIG.GITHUB_BASE}${pattern.githubPath}`;
                patternHtml = `
                    <img style="
                        position: absolute;
                        bottom: 10px;
                        right: 10px;
                        width: 30px;
                        height: 30px;
                        opacity: 0.3;
                        object-fit: contain;
                    " src="${patternUrl}" alt="">
                `;
            }
            
            preview.innerHTML = `
                <div style="
                    ${dimensions}
                    border: 5px solid ${fontColor};
                    ${shapeStyle}
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: white;
                ">
                    <span style="
                        font-family: ${fontFamily};
                        font-size: 42px;
                        color: ${fontColor};
                        font-weight: ${font?.weight || 'normal'};
                        text-align: center;
                        padding: 0 20px;
                        line-height: 1.2;
                    ">${text}</span>
                    ${patternHtml}
                </div>
            `;
        }
        
        downloadStamp() {
            const preview = document.querySelector(`#stamp-preview-${this.container.id} > div`);
            if (!preview) return;
            
            // 創建 canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const width = preview.offsetWidth;
            const height = preview.offsetHeight;
            
            // 設置高解析度
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(scale, scale);
            
            // 繪製背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // 取得樣式
            const computedStyle = window.getComputedStyle(preview);
            const borderRadius = computedStyle.borderRadius;
            const borderWidth = parseInt(computedStyle.borderWidth);
            const borderColor = this.currentSelection.color?.main || '#dc3545';
            
            // 繪製邊框形狀
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            
            if (this.currentSelection.shape?.name === '圓形') {
                ctx.beginPath();
                ctx.arc(width/2, height/2, Math.min(width, height)/2 - borderWidth/2, 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.currentSelection.shape?.name === '橢圓形') {
                ctx.beginPath();
                ctx.ellipse(width/2, height/2, width/2 - borderWidth/2, height/2 - borderWidth/2, 0, 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.currentSelection.shape?.name === '圓角方形' && borderRadius) {
                const radius = parseInt(borderRadius);
                this.roundRect(ctx, borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth, radius);
                ctx.stroke();
            } else {
                ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
            }
            
            // 繪製文字
            const textElement = preview.querySelector('span');
            if (textElement) {
                const textStyle = window.getComputedStyle(textElement);
                ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`;
                ctx.fillStyle = borderColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.currentSelection.text, width/2, height/2);
            }
            
            // 繪製圖案
            const patternImg = preview.querySelector('img');
            if (patternImg && patternImg.complete) {
                ctx.globalAlpha = 0.3;
                ctx.drawImage(patternImg, width - 40, height - 40, 30, 30);
                ctx.globalAlpha = 1;
            }
            
            // 下載
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `印章_${this.currentSelection.text}_${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                this.showMessage('印章已下載');
            }, 'image/png');
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
    }
    
    // 自動初始化
    function autoInit() {
        const container = document.getElementById('stamp-font-widget-container');
        if (container) {
            new StampWidget('stamp-font-widget-container');
        }
    }
    
    // 當 DOM 載入完成時初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
    
    // 暴露到全域供手動初始化
    window.StampWidget = StampWidget;
    
})();

console.log('印章預覽小工具 v3.0.0 已載入');
console.log('作者: DK0124');
console.log('更新時間: 2025-01-29');
