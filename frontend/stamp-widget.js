/**
 * 印章預覽小工具 - 完整 UI/UX 設計版
 * @author DK0124
 * @version 5.0.0
 * @date 2025-01-29
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window.StampWidgetLoaded) return;
    window.StampWidgetLoaded = true;
    
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
    
    // 載入 Google Fonts 和 Material Icons
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const links = [
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap'
            }
        ];
        
        links.forEach(link => {
            const element = document.createElement('link');
            Object.assign(element, link);
            document.head.appendChild(element);
        });
    }
    
    // 完整的樣式設計
    const styles = `
        /* CSS 變數定義 */
        :root {
            --sw-primary: #2563eb;
            --sw-primary-hover: #1d4ed8;
            --sw-primary-light: #dbeafe;
            --sw-secondary: #64748b;
            --sw-success: #10b981;
            --sw-danger: #ef4444;
            --sw-warning: #f59e0b;
            --sw-info: #3b82f6;
            --sw-dark: #1e293b;
            --sw-light: #f8fafc;
            --sw-white: #ffffff;
            --sw-gray-50: #f8fafc;
            --sw-gray-100: #f1f5f9;
            --sw-gray-200: #e2e8f0;
            --sw-gray-300: #cbd5e1;
            --sw-gray-400: #94a3b8;
            --sw-gray-500: #64748b;
            --sw-gray-600: #475569;
            --sw-gray-700: #334155;
            --sw-gray-800: #1e293b;
            --sw-gray-900: #0f172a;
            --sw-border-radius: 12px;
            --sw-border-radius-sm: 8px;
            --sw-border-radius-lg: 16px;
            --sw-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --sw-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --sw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            --sw-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --sw-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --sw-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* 重置樣式 */
        #stamp-font-widget-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 主容器 */
        .stamp-widget {
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--sw-gray-700);
            line-height: 1.6;
            background: var(--sw-gray-50);
            border-radius: var(--sw-border-radius-lg);
            overflow: hidden;
            box-shadow: var(--sw-shadow-xl);
            position: relative;
        }
        
        /* 頂部裝飾條 */
        .stamp-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--sw-primary) 0%, var(--sw-info) 50%, var(--sw-primary) 100%);
            background-size: 200% 100%;
            animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* 標題區 */
        .sw-header {
            background: var(--sw-white);
            padding: 24px;
            border-bottom: 1px solid var(--sw-gray-200);
        }
        
        .sw-header-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--sw-gray-800);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .sw-header-title .material-icons {
            font-size: 32px;
            color: var(--sw-primary);
        }
        
        .sw-header-subtitle {
            color: var(--sw-gray-500);
            font-size: 14px;
            margin-top: 4px;
            margin-left: 44px;
        }
        
        /* 內容區 */
        .sw-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0;
        }
        
        /* 預覽區 */
        .sw-preview-section {
            background: linear-gradient(135deg, var(--sw-primary-light) 0%, var(--sw-gray-100) 100%);
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            position: relative;
            overflow: hidden;
        }
        
        /* 背景裝飾 */
        .sw-preview-section::before {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            top: -150px;
            right: -150px;
        }
        
        .sw-preview-section::after {
            content: '';
            position: absolute;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            bottom: -100px;
            left: -100px;
        }
        
        /* Canvas 容器 */
        .sw-canvas-container {
            background: var(--sw-white);
            border-radius: var(--sw-border-radius-lg);
            padding: 30px;
            box-shadow: var(--sw-shadow-xl);
            position: relative;
            z-index: 1;
            transition: var(--sw-transition);
        }
        
        .sw-canvas-container:hover {
            transform: translateY(-4px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .sw-canvas {
            display: block;
            border-radius: var(--sw-border-radius);
            background: var(--sw-white);
        }
        
        /* 下載按鈕 */
        .sw-download-btn {
            margin-top: 24px;
            padding: 12px 32px;
            background: var(--sw-primary);
            color: var(--sw-white);
            border: none;
            border-radius: var(--sw-border-radius);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: var(--sw-transition);
            box-shadow: var(--sw-shadow-md);
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .sw-download-btn:hover {
            background: var(--sw-primary-hover);
            transform: translateY(-2px);
            box-shadow: var(--sw-shadow-lg);
        }
        
        .sw-download-btn:active {
            transform: translateY(0);
            box-shadow: var(--sw-shadow);
        }
        
        .sw-download-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
            z-index: -1;
        }
        
        .sw-download-btn:active::before {
            width: 300px;
            height: 300px;
        }
        
        /* 控制區 */
        .sw-controls-section {
            background: var(--sw-white);
            padding: 32px;
        }
        
        /* 控制項卡片 */
        .sw-control-card {
            background: var(--sw-gray-50);
            border: 1px solid var(--sw-gray-200);
            border-radius: var(--sw-border-radius);
            padding: 24px;
            margin-bottom: 24px;
            transition: var(--sw-transition);
        }
        
        .sw-control-card:hover {
            box-shadow: var(--sw-shadow-md);
            border-color: var(--sw-gray-300);
        }
        
        .sw-control-card:last-child {
            margin-bottom: 0;
        }
        
        .sw-control-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--sw-gray-200);
        }
        
        .sw-control-icon {
            width: 40px;
            height: 40px;
            background: var(--sw-primary-light);
            border-radius: var(--sw-border-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--sw-primary);
        }
        
        .sw-control-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--sw-gray-800);
        }
        
        /* 文字輸入 */
        .sw-text-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            border: 2px solid var(--sw-gray-300);
            border-radius: var(--sw-border-radius-sm);
            background: var(--sw-white);
            color: var(--sw-gray-800);
            transition: var(--sw-transition);
            text-align: center;
            font-weight: 500;
        }
        
        .sw-text-input:focus {
            outline: none;
            border-color: var(--sw-primary);
            box-shadow: 0 0 0 3px var(--sw-primary-light);
        }
        
        .sw-text-input::placeholder {
            color: var(--sw-gray-400);
        }
        
        /* 選項網格 */
        .sw-option-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
        }
        
        /* 選項項目 */
        .sw-option-item {
            background: var(--sw-white);
            border: 2px solid var(--sw-gray-200);
            border-radius: var(--sw-border-radius);
            padding: 16px;
            cursor: pointer;
            transition: var(--sw-transition);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .sw-option-item:hover {
            border-color: var(--sw-primary);
            transform: translateY(-2px);
            box-shadow: var(--sw-shadow-md);
        }
        
        .sw-option-item.selected {
            background: var(--sw-primary-light);
            border-color: var(--sw-primary);
            box-shadow: var(--sw-shadow-md);
        }
        
        .sw-option-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: var(--sw-primary);
            color: var(--sw-white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            animation: scale-in 0.3s ease;
        }
        
        @keyframes scale-in {
            from {
                transform: scale(0);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        /* 字體預覽 */
        .sw-font-preview {
            font-size: 28px;
            margin-bottom: 12px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--sw-gray-800);
        }
        
        .sw-font-name {
            font-size: 12px;
            color: var(--sw-gray-600);
            font-weight: 500;
        }
        
        /* 形狀預覽 */
        .sw-shape-preview {
            width: 80px;
            height: 80px;
            border: 3px solid var(--sw-gray-700);
            margin: 0 auto 12px;
            position: relative;
        }
        
        .sw-shape-name {
            font-size: 14px;
            color: var(--sw-gray-700);
            font-weight: 500;
        }
        
        /* 顏色預覽 */
        .sw-color-preview {
            width: 80px;
            height: 80px;
            border-radius: var(--sw-border-radius);
            margin: 0 auto 12px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .sw-color-preview::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%);
            transform: translateX(-100%);
            transition: transform 0.6s;
        }
        
        .sw-option-item:hover .sw-color-preview::after {
            transform: translateX(100%);
        }
        
        .sw-color-name {
            font-size: 14px;
            color: var(--sw-gray-700);
            font-weight: 500;
        }
        
        /* 載入狀態 */
        .sw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 500px;
            padding: 40px;
        }
        
        .sw-loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid var(--sw-gray-200);
            border-top-color: var(--sw-primary);
            border-radius: 50%;
            animation: sw-spin 1s linear infinite;
            margin-bottom: 24px;
        }
        
        @keyframes sw-spin {
            to { transform: rotate(360deg); }
        }
        
        .sw-loading-text {
            font-size: 18px;
            color: var(--sw-gray-600);
            font-weight: 500;
        }
        
        /* 錯誤狀態 */
        .sw-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 500px;
            padding: 40px;
            text-align: center;
        }
        
        .sw-error-icon {
            font-size: 72px;
            color: var(--sw-danger);
            margin-bottom: 24px;
        }
        
        .sw-error-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--sw-gray-800);
            margin-bottom: 12px;
        }
        
        .sw-error-message {
            font-size: 16px;
            color: var(--sw-gray-600);
            margin-bottom: 24px;
            max-width: 400px;
        }
        
        .sw-retry-btn {
            padding: 12px 24px;
            background: var(--sw-danger);
            color: var(--sw-white);
            border: none;
            border-radius: var(--sw-border-radius-sm);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: var(--sw-transition);
            box-shadow: var(--sw-shadow-md);
        }
        
        .sw-retry-btn:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: var(--sw-shadow-lg);
        }
        
        /* 空白狀態 */
        .sw-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 500px;
            padding: 40px;
            text-align: center;
        }
        
        .sw-empty-icon {
            font-size: 72px;
            color: var(--sw-gray-400);
            margin-bottom: 24px;
        }
        
        .sw-empty-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--sw-gray-700);
            margin-bottom: 12px;
        }
        
        .sw-empty-message {
            font-size: 16px;
            color: var(--sw-gray-500);
            max-width: 400px;
        }
        
        /* 提示訊息 */
        .sw-tooltip {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--sw-gray-800);
            color: var(--sw-white);
            padding: 12px 24px;
            border-radius: var(--sw-border-radius-sm);
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--sw-shadow-xl);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
        }
        
        .sw-tooltip.show {
            opacity: 1;
            transform: translateX(-50%) translateY(-8px);
        }
        
        /* 響應式設計 */
        @media (min-width: 768px) {
            .sw-content {
                grid-template-columns: 1fr 1fr;
            }
            
            .sw-preview-section {
                min-height: 600px;
            }
            
            .sw-controls-section {
                max-height: 600px;
                overflow-y: auto;
            }
            
            .sw-controls-section::-webkit-scrollbar {
                width: 8px;
            }
            
            .sw-controls-section::-webkit-scrollbar-track {
                background: var(--sw-gray-100);
                border-radius: 4px;
            }
            
            .sw-controls-section::-webkit-scrollbar-thumb {
                background: var(--sw-gray-400);
                border-radius: 4px;
            }
            
            .sw-controls-section::-webkit-scrollbar-thumb:hover {
                background: var(--sw-gray-500);
            }
        }
        
        @media (min-width: 1024px) {
            .sw-option-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            }
        }
        
        @media (max-width: 767px) {
            .sw-header {
                padding: 20px;
            }
            
            .sw-header-title {
                font-size: 20px;
            }
            
            .sw-preview-section {
                padding: 24px;
                min-height: 300px;
            }
            
            .sw-controls-section {
                padding: 20px;
            }
            
            .sw-control-card {
                padding: 20px;
            }
            
            .sw-option-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 12px;
            }
            
            .sw-font-preview {
                font-size: 24px;
            }
            
            .sw-shape-preview,
            .sw-color-preview {
                width: 60px;
                height: 60px;
            }
        }
        
        /* 防止文字選取 */
        .no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
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
            font-size: 14px;
            font-weight: 600;
            color: #000;
            transform: rotate(-45deg);
            white-space: nowrap;
            font-family: Arial, sans-serif;
        }
        
        /* 載入動畫效果 */
        .sw-fade-in {
            animation: sw-fadeIn 0.3s ease;
        }
        
        @keyframes sw-fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* 脈動效果 */
        .sw-pulse {
            animation: sw-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes sw-pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
    `;
    
    // 注入樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // 工具函數
    const Utils = {
        // URL 編碼處理
        encodeFilePath(path) {
            return path.split('/').map(part => encodeURIComponent(part)).join('/');
        },
        
        // 取得 GitHub Raw URL
        getGitHubRawUrl(path) {
            if (!path) return null;
            if (path.startsWith('http')) return path;
            const encodedPath = this.encodeFilePath(path);
            return `${CONFIG.BASE_URL}/${encodedPath}`;
        },
        
        // 防抖
        debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },
        
        // 顯示提示訊息
        showTooltip(message) {
            let tooltip = document.querySelector('.sw-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'sw-tooltip';
                document.body.appendChild(tooltip);
            }
            
            tooltip.textContent = message;
            tooltip.classList.add('show');
            
            setTimeout(() => {
                tooltip.classList.remove('show');
            }, 3000);
        }
    };
    
    // 主類別
    class StampWidget {
        constructor(containerId) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            
            if (!this.container) {
                console.error(`找不到容器: ${containerId}`);
                return;
            }
            
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
            
            this.init();
        }
        
        async init() {
            try {
                this.showLoading();
                
                const configLoaded = await this.loadConfig();
                if (!configLoaded) {
                    throw new Error('無法載入設定檔');
                }
                
                if (!this.hasData()) {
                    this.showEmpty();
                    return;
                }
                
                this.render();
                this.initCanvas();
                await this.loadResources();
                this.bindEvents();
                this.applySecuritySettings();
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
                
                // 設定預設值
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
                <div class="stamp-widget">
                    <div class="sw-loading">
                        <div class="sw-loading-spinner"></div>
                        <div class="sw-loading-text">正在載入印章系統...</div>
                    </div>
                </div>
            `;
        }
        
        showEmpty() {
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <div class="sw-empty">
                        <div class="material-icons sw-empty-icon">inbox</div>
                        <div class="sw-empty-title">尚未設定內容</div>
                        <div class="sw-empty-message">
                            請先到後台管理系統上傳字體、形狀、顏色等資源
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
                        <div class="sw-error-title">載入失敗</div>
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
            const widgetId = `sw_${Date.now()}`;
            
            this.container.innerHTML = `
                <div class="stamp-widget">
                    <!-- 標題 -->
                    <div class="sw-header">
                        <h1 class="sw-header-title">
                            <span class="material-icons">verified</span>
                            印章製作系統
                        </h1>
                        <p class="sw-header-subtitle">自訂您的專屬印章樣式</p>
                    </div>
                    
                    <div class="sw-content">
                        <!-- 預覽區 -->
                        <div class="sw-preview-section">
                            <div class="sw-canvas-container">
                                <canvas id="canvas-${widgetId}" 
                                        class="sw-canvas" 
                                        width="250" 
                                        height="250">
                                </canvas>
                            </div>
                            <button class="sw-download-btn" id="download-${widgetId}">
                                <span class="material-icons">download</span>
                                下載印章圖片
                            </button>
                        </div>
                        
                        <!-- 控制區 -->
                        <div class="sw-controls-section">
                            <!-- 文字輸入 -->
                            <div class="sw-control-card sw-fade-in">
                                <div class="sw-control-header">
                                    <div class="sw-control-icon">
                                        <span class="material-icons">edit</span>
                                    </div>
                                    <div class="sw-control-title">印章文字</div>
                                </div>
                                <input type="text" 
                                       class="sw-text-input" 
                                       id="text-${widgetId}"
                                       placeholder="請輸入印章文字（最多6字）" 
                                       maxlength="6" 
                                       value="${this.currentSelection.text}">
                            </div>
                            
                            <!-- 字體選擇 -->
                            ${this.config.fonts?.length > 0 ? `
                            <div class="sw-control-card sw-fade-in" style="animation-delay: 0.1s;">
                                <div class="sw-control-header">
                                    <div class="sw-control-icon">
                                        <span class="material-icons">text_fields</span>
                                    </div>
                                    <div class="sw-control-title">選擇字體</div>
                                </div>
                                <div class="sw-option-grid" id="fonts-${widgetId}">
                                    ${this.renderFonts(widgetId)}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 形狀選擇 -->
                            ${this.config.shapes?.length > 0 ? `
                            <div class="sw-control-card sw-fade-in" style="animation-delay: 0.2s;">
                                <div class="sw-control-header">
                                    <div class="sw-control-icon">
                                        <span class="material-icons">category</span>
                                    </div>
                                    <div class="sw-control-title">選擇形狀</div>
                                </div>
                                <div class="sw-option-grid" id="shapes-${widgetId}">
                                    ${this.renderShapes(widgetId)}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 顏色選擇 -->
                            ${this.config.colors?.length > 0 ? `
                            <div class="sw-control-card sw-fade-in" style="animation-delay: 0.3s;">
                                <div class="sw-control-header">
                                    <div class="sw-control-icon">
                                        <span class="material-icons">palette</span>
                                    </div>
                                    <div class="sw-control-title">選擇顏色</div>
                                </div>
                                <div class="sw-option-grid" id="colors-${widgetId}">
                                    ${this.renderColors(widgetId)}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            this.widgetId = widgetId;
        }
        
        renderFonts(widgetId) {
            return this.config.fonts.map((font, index) => `
                <div class="sw-option-item ${index === 0 ? 'selected' : ''}" 
                     data-font-index="${index}">
                    <div class="sw-font-preview sw-pulse" id="font-preview-${index}">
                        載入中...
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
                        shapeStyle = 'border-radius: 50%; width: 100px; height: 70px;';
                        break;
                    case '長方形':
                        shapeStyle = 'width: 100px; height: 70px;';
                        break;
                    case '圓角方形':
                        shapeStyle = 'border-radius: 16px;';
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
                    <div class="sw-color-preview" style="background: ${color.main};"></div>
                    <div class="sw-color-name">${color.name}</div>
                </div>
            `).join('');
        }
        
        bindEvents() {
            const widgetId = this.widgetId;
            
            // 文字輸入
            const textInput = document.getElementById(`text-${widgetId}`);
            if (textInput) {
                textInput.addEventListener('input', Utils.debounce((e) => {
                    this.currentSelection.text = e.target.value || '範例印章';
                    this.updatePreview();
                    this.updateFontPreviews();
                }, 300));
            }
            
            // 字體選擇
            const fontsGrid = document.getElementById(`fonts-${widgetId}`);
            if (fontsGrid) {
                fontsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.fontIndex);
                        this.selectFont(index);
                    }
                });
            }
            
            // 形狀選擇
            const shapesGrid = document.getElementById(`shapes-${widgetId}`);
            if (shapesGrid) {
                shapesGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.shapeIndex);
                        this.selectShape(index);
                    }
                });
            }
            
            // 顏色選擇
            const colorsGrid = document.getElementById(`colors-${widgetId}`);
            if (colorsGrid) {
                colorsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.colorIndex);
                        this.selectColor(index);
                    }
                });
            }
            
            // 下載按鈕
            const downloadBtn = document.getElementById(`download-${widgetId}`);
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.downloadStamp();
                });
            }
        }
        
        initCanvas() {
            const canvas = document.getElementById(`canvas-${this.widgetId}`);
            if (canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                
                // 設定高解析度
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                this.ctx.scale(dpr, dpr);
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
            }
        }
        
        async loadResources() {
            if (this.config.fonts?.length > 0) {
                await this.loadFonts();
            }
        }
        
        async loadFonts() {
            for (let i = 0; i < this.config.fonts.length; i++) {
                const font = this.config.fonts[i];
                const success = await this.loadFont(font);
                
                const preview = document.getElementById(`font-preview-${i}`);
                if (preview) {
                    preview.classList.remove('sw-pulse');
                    if (success) {
                        preview.style.fontFamily = `CustomFont${font.id}, serif`;
                        preview.textContent = this.currentSelection.text.substring(0, 2) || '印';
                    } else {
                        preview.innerHTML = '<span style="color: var(--sw-danger); font-size: 14px;">載入失敗</span>';
                    }
                }
            }
        }
        
        async loadFont(fontData) {
            try {
                if (this.loadedFonts.has(fontData.id)) {
                    return true;
                }
                
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
                
                this.loadedFonts.set(fontData.id, fontFace);
                console.log('字體載入成功:', fontData.name);
                
                return true;
                
            } catch (error) {
                console.error('載入字體失敗:', fontData.name, error);
                return false;
            }
        }
        
        selectFont(index) {
            if (index >= 0 && index < this.config.fonts.length) {
                this.currentSelection.font = this.config.fonts[index];
                
                document.querySelectorAll(`#fonts-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        selectShape(index) {
            if (index >= 0 && index < this.config.shapes.length) {
                this.currentSelection.shape = this.config.shapes[index];
                
                document.querySelectorAll(`#shapes-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        selectColor(index) {
            if (index >= 0 && index < this.config.colors.length) {
                this.currentSelection.color = this.config.colors[index];
                
                document.querySelectorAll(`#colors-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        updateFontPreviews() {
            this.config.fonts?.forEach((font, index) => {
                const preview = document.getElementById(`font-preview-${index}`);
                if (preview && preview.style.fontFamily) {
                    preview.textContent = this.currentSelection.text.substring(0, 2) || '印';
                }
            });
        }
        
        updatePreview() {
            if (!this.canvas || !this.ctx) return;
            
            const ctx = this.ctx;
            const width = 250;
            const height = 250;
            
            // 清空畫布
            ctx.clearRect(0, 0, width, height);
            
            // 設定樣式
            const color = this.currentSelection.color?.main || '#2563eb';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 5;
            
            // 繪製形狀
            const shape = this.currentSelection.shape;
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;
            
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
                        ctx.strokeRect(centerX - size * 0.55, centerY - size * 0.35, size * 1.1, size * 0.7);
                        break;
                        
                    case '圓角方形':
                        this.roundRect(ctx, centerX - size / 2, centerY - size / 2, size, size, 25);
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
                
                const fontSize = size * 0.2;
                if (font && this.loadedFonts.has(font.id)) {
                    ctx.font = `${font.weight || 'normal'} ${fontSize}px CustomFont${font.id}, serif`;
                } else {
                    ctx.font = `${fontSize}px serif`;
                }
                
                // 根據文字長度調整
                if (text.length > 4) {
                    ctx.font = ctx.font.replace(/\d+px/, `${fontSize * 0.8}px`);
                }
                
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
            
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            const scale = 3;
            downloadCanvas.width = 250 * scale;
            downloadCanvas.height = 250 * scale;
            
            downloadCtx.scale(scale, scale);
            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, 250, 250);
            
            // 重新繪製高解析度版本
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            this.canvas = downloadCanvas;
            this.ctx = downloadCtx;
            this.updatePreview();
            
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            // 下載
            downloadCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `印章_${this.currentSelection.text}_${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                Utils.showTooltip('印章圖片已下載');
            }, 'image/png');
        }
        
        applySecuritySettings() {
            const settings = this.config.frontendSecurity || {};
            
            if (settings.disableTextSelect !== false) {
                this.container.classList.add('no-select');
            }
            
            if (settings.disableRightClick !== false) {
                this.container.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    Utils.showTooltip('右鍵功能已被禁用');
                    return false;
                });
            }
            
            if (settings.enableWatermark !== false) {
                this.createWatermark();
            }
        }
        
        createWatermark() {
            const watermark = document.createElement('div');
            watermark.className = 'sw-watermark';
            
            const text = this.config.frontendSecurity?.watermarkText || '© 2025 印章系統';
            
            for (let i = 0; i < 50; i++) {
                const span = document.createElement('span');
                span.className = 'sw-watermark-text';
                span.style.left = `${Math.random() * 100}%`;
                span.style.top = `${Math.random() * 100}%`;
                span.textContent = text;
                watermark.appendChild(span);
            }
            
            document.body.appendChild(watermark);
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
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 0);
    }
    
    window.StampWidget = StampWidget;
    
})();

console.log('印章預覽小工具 v5.0.0 已載入 - 完整 UI/UX 版');
