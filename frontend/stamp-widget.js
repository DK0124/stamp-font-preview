/**
 * 印章預覽小工具 - 完整整合版
 * @author DK0124
 * @version 8.0.0
 * @date 2025-01-29
 * @description 基於成功經驗改造，完全對應後台資料的印章預覽系統
 */

(function() {
    'use strict';
    
    // 防止重複載入
    if (window.StampWidgetV8Loaded) return;
    window.StampWidgetV8Loaded = true;
    
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
    
    // 載入必要資源
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }
    
    // 建立樣式 - 使用特定ID確保作用域
    const styles = `
        /* 重置容器樣式 */
        #stamp-widget-v8 {
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Microsoft JhengHei', sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        #stamp-widget-v8 * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 主容器 */
        #stamp-widget-v8 .sw-container {
            background: #dde5d6;
            border-radius: 16px;
            padding: 20px;
            position: relative;
            overflow: hidden;
            width: 100%;
            --sw-primary-bg: #dde5d6;
            --sw-accent: #9fb28e;
            --sw-secondary: #f7ecd5;
            --sw-text-primary: #84736a;
            --sw-text-secondary: rgba(132, 115, 106, 0.7);
            --sw-glass-bg: rgba(255, 255, 255, 0.7);
            --sw-glass-border: rgba(159, 178, 142, 0.2);
            --sw-shadow: 0 8px 32px rgba(132, 115, 106, 0.1);
        }
        
        /* 背景裝飾 */
        #stamp-widget-v8 .sw-container::before {
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
        #stamp-widget-v8 .sw-wrapper {
            position: relative;
            z-index: 1;
        }
        
        /* 預覽區 */
        #stamp-widget-v8 .sw-preview-section {
            background: linear-gradient(135deg, var(--sw-accent) 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 24px;
        }
        
        #stamp-widget-v8 .sw-preview-title {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #stamp-widget-v8 .sw-preview-title .material-icons {
            font-size: 22px;
        }
        
        #stamp-widget-v8 .sw-stamp-wrapper {
            display: inline-block;
            padding: 24px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
        }
        
        #stamp-widget-v8 .sw-stamp-display {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Canvas 樣式 */
        #stamp-widget-v8 .sw-canvas {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            cursor: zoom-in;
            transition: transform 0.3s ease;
        }
        
        #stamp-widget-v8 .sw-canvas:hover {
            transform: scale(1.05);
        }
        
        /* 卡片樣式 */
        #stamp-widget-v8 .sw-card {
            background: var(--sw-glass-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--sw-glass-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: var(--sw-shadow);
        }
        
        #stamp-widget-v8 .sw-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(132, 115, 106, 0.1);
        }
        
        #stamp-widget-v8 .sw-card-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--sw-text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        #stamp-widget-v8 .sw-card-title .material-icons {
            font-size: 24px;
            color: var(--sw-accent);
        }
        
        /* 文字輸入 */
        #stamp-widget-v8 .sw-text-input {
            width: 100%;
            padding: 12px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid transparent;
            border-radius: 8px;
            font-size: 16px;
            color: var(--sw-text-primary);
            text-align: center;
            transition: all 0.3s;
        }
        
        #stamp-widget-v8 .sw-text-input:focus {
            outline: none;
            background: white;
            border-color: var(--sw-accent);
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 搜尋框 */
        #stamp-widget-v8 .sw-search-container {
            position: relative;
            margin-bottom: 16px;
        }
        
        #stamp-widget-v8 .sw-search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--sw-text-secondary);
            font-size: 18px;
        }
        
        #stamp-widget-v8 .sw-search-input {
            width: 100%;
            padding: 10px 10px 10px 40px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid transparent;
            border-radius: 8px;
            font-size: 14px;
            color: var(--sw-text-primary);
            transition: all 0.3s;
        }
        
        #stamp-widget-v8 .sw-search-input:focus {
            outline: none;
            background: white;
            border-color: var(--sw-accent);
        }
        
        /* 分類標籤 */
        #stamp-widget-v8 .sw-categories {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        
        #stamp-widget-v8 .sw-categories::-webkit-scrollbar {
            display: none;
        }
        
        #stamp-widget-v8 .sw-category {
            padding: 6px 16px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid transparent;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: var(--sw-text-primary);
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        #stamp-widget-v8 .sw-category:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
        }
        
        #stamp-widget-v8 .sw-category.active {
            background: var(--sw-accent);
            color: white;
        }
        
        /* 選項網格 */
        #stamp-widget-v8 .sw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 4px;
        }
        
        #stamp-widget-v8 .sw-font-item {
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
            position: relative;
        }
        
        #stamp-widget-v8 .sw-font-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(132, 115, 106, 0.1);
            border-color: var(--sw-glass-border);
        }
        
        #stamp-widget-v8 .sw-font-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--sw-accent);
        }
        
        #stamp-widget-v8 .sw-font-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: var(--sw-accent);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
        }
        
        #stamp-widget-v8 .sw-font-preview {
            font-size: 28px;
            color: var(--sw-text-primary);
            margin-bottom: 8px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: normal;
        }
        
        #stamp-widget-v8 .sw-font-label {
            font-size: 13px;
            font-weight: 500;
            color: var(--sw-text-secondary);
        }
        
        /* 標籤頁 */
        #stamp-widget-v8 .sw-tabs {
            background: rgba(255, 255, 255, 0.5);
            border-radius: 12px;
            padding: 16px;
        }
        
        #stamp-widget-v8 .sw-tabs-header {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        
        #stamp-widget-v8 .sw-tabs-header::-webkit-scrollbar {
            display: none;
        }
        
        #stamp-widget-v8 .sw-tab-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid transparent;
            border-radius: 8px;
            font-size: 14px;
            color: var(--sw-text-primary);
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        #stamp-widget-v8 .sw-tab-btn:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
        }
        
        #stamp-widget-v8 .sw-tab-btn.active {
            background: var(--sw-accent);
            color: white;
        }
        
        #stamp-widget-v8 .sw-tab-btn .material-icons {
            font-size: 18px;
        }
        
        #stamp-widget-v8 .sw-tab-content {
            display: none;
        }
        
        #stamp-widget-v8 .sw-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* 形狀選擇 */
        #stamp-widget-v8 .sw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
        }
        
        #stamp-widget-v8 .sw-shape-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
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
        
        #stamp-widget-v8 .sw-shape-item:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.8);
        }
        
        #stamp-widget-v8 .sw-shape-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--sw-accent);
        }
        
        #stamp-widget-v8 .sw-shape-preview {
            width: 50px;
            height: 50px;
            border: 2px solid var(--sw-accent);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-widget-v8 .sw-shape-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        #stamp-widget-v8 .sw-shape-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--sw-text-secondary);
        }
        
        /* 顏色選擇 */
        #stamp-widget-v8 .sw-colors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
        
        #stamp-widget-v8 .sw-color-item {
            text-align: center;
            cursor: pointer;
        }
        
        #stamp-widget-v8 .sw-color-main {
            width: 50px;
            height: 50px;
            margin: 0 auto 8px;
            border-radius: 12px;
            transition: all 0.3s;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-widget-v8 .sw-color-main:hover {
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-widget-v8 .sw-color-item.selected .sw-color-main {
            transform: scale(1.1);
            box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.2),
                inset 0 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        #stamp-widget-v8 .sw-color-item.selected .sw-color-main::after {
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
        
        #stamp-widget-v8 .sw-color-name {
            font-size: 12px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        /* 圖案選擇 */
        #stamp-widget-v8 .sw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
        
        #stamp-widget-v8 .sw-pattern-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        #stamp-widget-v8 .sw-pattern-item:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.8);
        }
        
        #stamp-widget-v8 .sw-pattern-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--sw-accent);
        }
        
        #stamp-widget-v8 .sw-pattern-preview {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-widget-v8 .sw-pattern-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            opacity: 0.7;
        }
        
        /* 載入狀態 */
        #stamp-widget-v8 .sw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 12px;
        }
        
        #stamp-widget-v8 .sw-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--sw-glass-border);
            border-top-color: var(--sw-accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* 下載按鈕 */
        #stamp-widget-v8 .sw-download-section {
            text-align: center;
            margin-top: 24px;
        }
        
        #stamp-widget-v8 .sw-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--sw-accent);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
        }
        
        #stamp-widget-v8 .sw-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(159, 178, 142, 0.3);
        }
        
        #stamp-widget-v8 .sw-btn .material-icons {
            font-size: 20px;
        }
        
        /* 滾動條美化 */
        #stamp-widget-v8 ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        #stamp-widget-v8 ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        #stamp-widget-v8 ::-webkit-scrollbar-thumb {
            background: var(--sw-glass-border);
            border-radius: 3px;
        }
        
        #stamp-widget-v8 ::-webkit-scrollbar-thumb:hover {
            background: var(--sw-accent);
        }
        
        /* 響應式設計 */
        @media (max-width: 768px) {
            #stamp-widget-v8 .sw-container {
                padding: 16px;
            }
            
            #stamp-widget-v8 .sw-fonts-grid {
                grid-template-columns: repeat(2, 1fr);
                max-height: 300px;
            }
            
            #stamp-widget-v8 .sw-shapes-grid,
            #stamp-widget-v8 .sw-colors-grid,
            #stamp-widget-v8 .sw-patterns-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            #stamp-widget-v8 .sw-canvas {
                width: 200px !important;
                height: 200px !important;
            }
        }
        
        @media (max-width: 480px) {
            #stamp-widget-v8 .sw-fonts-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-widget-v8 .sw-shapes-grid,
            #stamp-widget-v8 .sw-colors-grid,
            #stamp-widget-v8 .sw-patterns-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* 防止選取樣式 */
        #stamp-widget-v8.no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }
    `;
    
    // 注入樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // 主要類別
    class StampWidget {
        constructor(containerId) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            
            if (!this.container) {
                console.error(`找不到容器: ${containerId}`);
                return;
            }
            
            // 初始化資料
            this.config = null;
            this.currentSelection = {
                text: '範例',
                font: null,
                shape: null,
                color: null,
                pattern: null,
                category: 'all'
            };
            
            this.loadedFonts = new Map();
            this.elements = {};
            
            // 開始初始化
            this.init();
        }
        
        async init() {
            try {
                // 顯示載入狀態
                this.showLoading();
                
                // 載入配置
                await this.loadConfig();
                
                // 檢查資料
                if (!this.hasData()) {
                    this.showEmpty();
                    return;
                }
                
                // 建立介面
                this.render();
                
                // 初始化功能
                this.initElements();
                this.bindEvents();
                
                // 初始化 Canvas
                this.initCanvas();
                
                // 載入資源
                await this.loadResources();
                
                // 套用安全設定
                this.applySecuritySettings();
                
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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const config = await response.json();
                console.log('設定載入成功:', config);
                
                this.config = config;
                return true;
                
            } catch (error) {
                console.error('載入設定失敗:', error);
                throw error;
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
                <div id="stamp-widget-v8">
                    <div class="sw-container">
                        <div class="sw-loading">
                            <div class="sw-loading-spinner"></div>
                            <div>正在載入印章系統...</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        showError(message) {
            this.container.innerHTML = `
                <div id="stamp-widget-v8">
                    <div class="sw-container">
                        <div style="text-align: center; padding: 40px; color: #e57373;">
                            <div class="material-icons" style="font-size: 48px; margin-bottom: 16px;">error_outline</div>
                            <div style="font-size: 18px; margin-bottom: 8px;">載入失敗</div>
                            <div style="font-size: 14px;">${message}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        showEmpty() {
            this.container.innerHTML = `
                <div id="stamp-widget-v8">
                    <div class="sw-container">
                        <div style="text-align: center; padding: 40px; color: #84736a;">
                            <div class="material-icons" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">inbox</div>
                            <div style="font-size: 18px; margin-bottom: 8px;">尚未設定內容</div>
                            <div style="font-size: 14px;">請先到後台管理系統上傳資源</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        render() {
            const widgetId = `sw_${Date.now()}`;
            this.widgetId = widgetId;
            
            // 建立主要 HTML 結構
            const html = `
                <div id="stamp-widget-v8">
                    <div class="sw-container">
                        <div class="sw-wrapper">
                            <!-- 預覽區 -->
                            <div class="sw-preview-section">
                                <h3 class="sw-preview-title">
                                    <span class="material-icons">verified</span>
                                    印章即時預覽
                                </h3>
                                <div class="sw-stamp-wrapper">
                                    <div class="sw-stamp-display">
                                        <canvas id="canvas-${widgetId}" 
                                                class="sw-canvas" 
                                                width="300" 
                                                height="300">
                                        </canvas>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 文字輸入卡片 -->
                            <div class="sw-card">
                                <div class="sw-card-header">
                                    <div class="sw-card-title">
                                        <span class="material-icons">edit</span>
                                        印章文字
                                    </div>
                                </div>
                                <input type="text" 
                                       class="sw-text-input" 
                                       id="text-${widgetId}"
                                       placeholder="請輸入印章文字（最多6字）" 
                                       maxlength="6" 
                                       value="${this.currentSelection.text}">
                            </div>
                            
                            <!-- 字體選擇卡片 -->
                            ${this.renderFontsCard(widgetId)}
                            
                            <!-- 選項標籤頁 -->
                            <div class="sw-tabs">
                                <div class="sw-tabs-header">
                                    <button class="sw-tab-btn active" data-tab="shape">
                                        <span class="material-icons">category</span>
                                        <span>形狀</span>
                                    </button>
                                    <button class="sw-tab-btn" data-tab="color">
                                        <span class="material-icons">palette</span>
                                        <span>顏色</span>
                                    </button>
                                    <button class="sw-tab-btn" data-tab="pattern">
                                        <span class="material-icons">texture</span>
                                        <span>圖案</span>
                                    </button>
                                </div>
                                
                                <div class="sw-tabs-content">
                                    <!-- 形狀標籤頁 -->
                                    <div class="sw-tab-content active" data-tab="shape">
                                        ${this.renderShapesGrid(widgetId)}
                                    </div>
                                    
                                    <!-- 顏色標籤頁 -->
                                    <div class="sw-tab-content" data-tab="color">
                                        ${this.renderColorsGrid(widgetId)}
                                    </div>
                                    
                                    <!-- 圖案標籤頁 -->
                                    <div class="sw-tab-content" data-tab="pattern">
                                        ${this.renderPatternsGrid(widgetId)}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 下載區域 -->
                            <div class="sw-download-section">
                                <button class="sw-btn" id="download-${widgetId}">
                                    <span class="material-icons">download</span>
                                    下載印章圖片
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.container.innerHTML = html;
        }
        
        renderFontsCard(widgetId) {
            if (!this.config.fonts?.length) return '';
            
            // 提取分類
            const categories = new Set(['all']);
            this.config.fonts.forEach(font => {
                if (font.category) categories.add(font.category);
            });
            
            return `
                <div class="sw-card">
                    <div class="sw-card-header">
                        <div class="sw-card-title">
                            <span class="material-icons">text_fields</span>
                            選擇字體
                        </div>
                    </div>
                    
                    ${categories.size > 2 ? `
                    <div class="sw-categories" id="font-categories-${widgetId}">
                        ${Array.from(categories).map(cat => `
                            <button class="sw-category ${cat === 'all' ? 'active' : ''}" 
                                    data-category="${cat}">
                                ${cat === 'all' ? '全部' : 
                                  cat === 'traditional' ? '傳統' :
                                  cat === 'modern' ? '現代' :
                                  cat === 'handwrite' ? '手寫' :
                                  cat === 'custom' ? '自訂' : cat}
                            </button>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="sw-search-container">
                        <span class="material-icons sw-search-icon">search</span>
                        <input type="text" 
                               class="sw-search-input" 
                               id="font-search-${widgetId}"
                               placeholder="搜尋字體...">
                    </div>
                    
                    <div class="sw-fonts-grid" id="fonts-grid-${widgetId}">
                        <div class="sw-loading">
                            <div class="sw-loading-spinner"></div>
                            <div>正在載入字體...</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        renderShapesGrid(widgetId) {
            if (!this.config.shapes?.length) return '<div style="padding: 20px; text-align: center;">無可用形狀</div>';
            
            return `
                <div class="sw-shapes-grid" id="shapes-grid-${widgetId}">
                    ${this.config.shapes.map((shape, index) => {
                        let shapePreview = '';
                        
                        if (shape.githubPath) {
                            const imgUrl = `${CONFIG.BASE_URL}/${shape.githubPath}`;
                            shapePreview = `<img src="${imgUrl}" alt="${shape.name}">`;
                        } else {
                            // 預設形狀樣式
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
                            shapePreview = `<div style="${style}"></div>`;
                        }
                        
                        return `
                            <div class="sw-shape-item" data-shape-index="${index}">
                                <div class="sw-shape-preview">${shapePreview}</div>
                                <div class="sw-shape-label">${shape.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        renderColorsGrid(widgetId) {
            if (!this.config.colors?.length) return '<div style="padding: 20px; text-align: center;">無可用顏色</div>';
            
            return `
                <div class="sw-colors-grid" id="colors-grid-${widgetId}">
                    ${this.config.colors.map((color, index) => `
                        <div class="sw-color-item" data-color-index="${index}">
                            <div class="sw-color-main" 
                                 style="background: ${color.main}"
                                 data-color="${color.main}"></div>
                            <div class="sw-color-name">${color.name}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        renderPatternsGrid(widgetId) {
            const hasPatterns = this.config.patterns?.length > 0;
            
            return `
                <div class="sw-patterns-grid" id="patterns-grid-${widgetId}">
                    <div class="sw-pattern-item selected" data-pattern-index="-1">
                        <div class="sw-pattern-preview">
                            <span style="font-size: 14px; color: #84736a;">無</span>
                        </div>
                    </div>
                    ${hasPatterns ? this.config.patterns.map((pattern, index) => {
                        let preview = '';
                        if (pattern.githubPath) {
                            const imgUrl = `${CONFIG.BASE_URL}/${pattern.githubPath}`;
                            preview = `<img src="${imgUrl}" alt="${pattern.name}">`;
                        } else {
                            preview = `<span style="font-size: 12px; color: #84736a;">?</span>`;
                        }
                        
                        return `
                            <div class="sw-pattern-item" data-pattern-index="${index}">
                                <div class="sw-pattern-preview">${preview}</div>
                            </div>
                        `;
                    }).join('') : ''}
                </div>
            `;
        }
        
        initElements() {
            const widgetId = this.widgetId;
            
            this.elements = {
                textInput: document.getElementById(`text-${widgetId}`),
                fontSearch: document.getElementById(`font-search-${widgetId}`),
                fontCategories: document.getElementById(`font-categories-${widgetId}`),
                fontsGrid: document.getElementById(`fonts-grid-${widgetId}`),
                shapesGrid: document.getElementById(`shapes-grid-${widgetId}`),
                colorsGrid: document.getElementById(`colors-grid-${widgetId}`),
                patternsGrid: document.getElementById(`patterns-grid-${widgetId}`),
                canvas: document.getElementById(`canvas-${widgetId}`),
                downloadBtn: document.getElementById(`download-${widgetId}`)
            };
        }
        
        bindEvents() {
            // 文字輸入
            if (this.elements.textInput) {
                this.elements.textInput.addEventListener('input', (e) => {
                    this.currentSelection.text = e.target.value || '範例';
                    this.updatePreview();
                    this.updateFontPreviews();
                });
            }
            
            // 字體搜尋
            if (this.elements.fontSearch) {
                this.elements.fontSearch.addEventListener('input', (e) => {
                    this.searchFonts(e.target.value);
                });
            }
            
            // 字體分類
            if (this.elements.fontCategories) {
                this.elements.fontCategories.addEventListener('click', (e) => {
                    if (e.target.classList.contains('sw-category')) {
                        this.elements.fontCategories.querySelectorAll('.sw-category').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        e.target.classList.add('active');
                        this.filterFonts(e.target.dataset.category);
                    }
                });
            }
            
            // 字體選擇
            if (this.elements.fontsGrid) {
                this.elements.fontsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-font-item');
                    if (item) {
                        const index = parseInt(item.dataset.fontIndex);
                        this.selectFont(index);
                    }
                });
            }
            
            // 形狀選擇
            if (this.elements.shapesGrid) {
                this.elements.shapesGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-shape-item');
                    if (item) {
                        const index = parseInt(item.dataset.shapeIndex);
                        this.selectShape(index);
                    }
                });
            }
            
            // 顏色選擇
            if (this.elements.colorsGrid) {
                this.elements.colorsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-color-item');
                    if (item) {
                        const index = parseInt(item.dataset.colorIndex);
                        this.selectColor(index);
                    }
                });
            }
            
            // 圖案選擇
            if (this.elements.patternsGrid) {
                this.elements.patternsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-pattern-item');
                    if (item) {
                        const index = parseInt(item.dataset.patternIndex);
                        this.selectPattern(index);
                    }
                });
            }
            
            // 標籤頁切換
            const tabBtns = document.querySelectorAll('#stamp-widget-v8 .sw-tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.dataset.tab;
                    
                    // 切換按鈕狀態
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // 切換內容
                    document.querySelectorAll('#stamp-widget-v8 .sw-tab-content').forEach(content => {
                        if (content.dataset.tab === targetTab) {
                            content.classList.add('active');
                        } else {
                            content.classList.remove('active');
                        }
                    });
                });
            });
            
            // 下載按鈕
            if (this.elements.downloadBtn) {
                this.elements.downloadBtn.addEventListener('click', () => {
                    this.downloadStamp();
                });
            }
            
            // Canvas 雙擊放大
            if (this.elements.canvas) {
                this.elements.canvas.addEventListener('dblclick', () => {
                    this.showPreviewModal();
                });
            }
        }
        
        initCanvas() {
            const canvas = this.elements.canvas;
            if (!canvas) return;
            
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
        
        async loadResources() {
            // 載入字體
            if (this.config.fonts?.length > 0) {
                await this.loadFonts();
            }
        }
        
        async loadFonts() {
            const fontsGrid = this.elements.fontsGrid;
            if (!fontsGrid) return;
            
            // 清空載入狀態
            fontsGrid.innerHTML = '';
            
            // 顯示所有字體項目
            for (let i = 0; i < this.config.fonts.length; i++) {
                const font = this.config.fonts[i];
                const fontItem = document.createElement('div');
                fontItem.className = 'sw-font-item';
                fontItem.dataset.fontIndex = i;
                fontItem.dataset.fontName = font.displayName || font.name;
                fontItem.dataset.fontCategory = font.category || 'custom';
                
                fontItem.innerHTML = `
                    <div class="sw-font-preview" id="font-preview-${this.widgetId}-${i}">
                        <span style="opacity: 0.3;">載入中...</span>
                    </div>
                    <div class="sw-font-label">${font.displayName || font.name}</div>
                `;
                
                fontsGrid.appendChild(fontItem);
                
                // 異步載入字體
                this.loadFont(font, i);
            }
        }
        
        async loadFont(fontData, index) {
            try {
                const preview = document.getElementById(`font-preview-${this.widgetId}-${index}`);
                if (!preview) return;
                
                // 檢查是否已載入
                if (this.loadedFonts.has(fontData.id)) {
                    preview.innerHTML = `<span style="font-family: CustomFont${fontData.id}, serif; font-weight: ${fontData.weight || 'normal'};">
                        ${this.currentSelection.text.substring(0, 2) || '印'}
                    </span>`;
                    return;
                }
                
                // 系統字體
                if (fontData.systemFont) {
                    this.loadedFonts.set(fontData.id, { systemFont: fontData.systemFont });
                    preview.innerHTML = `<span style="font-family: ${fontData.systemFont}; font-weight: ${fontData.weight || 'normal'};">
                        ${this.currentSelection.text.substring(0, 2) || '印'}
                    </span>`;
                    return;
                }
                
                // 自訂字體
                let fontUrl = null;
                if (fontData.githubPath) {
                    fontUrl = `${CONFIG.BASE_URL}/${fontData.githubPath}`;
                } else if (fontData.filename) {
                    fontUrl = `${CONFIG.BASE_URL}/assets/fonts/${fontData.filename}`;
                }
                
                if (!fontUrl) {
                    preview.innerHTML = '<span style="color: #e57373; font-size: 14px;">無效字體</span>';
                    return;
                }
                
                // 載入字體
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
                
                preview.innerHTML = `<span style="font-family: CustomFont${fontData.id}, serif; font-weight: ${fontData.weight || 'normal'};">
                    ${this.currentSelection.text.substring(0, 2) || '印'}
                </span>`;
                
            } catch (error) {
                console.error(`載入字體失敗: ${fontData.name}`, error);
                const preview = document.getElementById(`font-preview-${this.widgetId}-${index}`);
                if (preview) {
                    preview.innerHTML = '<span style="color: #e57373; font-size: 14px;">載入失敗</span>';
                }
            }
        }
        
        filterFonts(category) {
            const fontItems = document.querySelectorAll('#stamp-widget-v8 .sw-font-item');
            
            fontItems.forEach(item => {
                if (category === 'all' || item.dataset.fontCategory === category) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }
        
        searchFonts(query) {
            const fontItems = document.querySelectorAll('#stamp-widget-v8 .sw-font-item');
            const lowerQuery = query.toLowerCase();
            
            fontItems.forEach(item => {
                const fontName = item.dataset.fontName.toLowerCase();
                if (fontName.includes(lowerQuery)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }
        
        selectFont(index) {
            if (index >= 0 && index < this.config.fonts.length) {
                this.currentSelection.font = this.config.fonts[index];
                
                // 更新選中狀態
                document.querySelectorAll('#stamp-widget-v8 .sw-font-item').forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        selectShape(index) {
            if (index >= 0 && index < this.config.shapes.length) {
                this.currentSelection.shape = this.config.shapes[index];
                
                // 更新選中狀態
                document.querySelectorAll('#stamp-widget-v8 .sw-shape-item').forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        selectColor(index) {
            if (index >= 0 && index < this.config.colors.length) {
                this.currentSelection.color = this.config.colors[index];
                
                // 更新選中狀態
                document.querySelectorAll('#stamp-widget-v8 .sw-color-item').forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
            }
        }
        
        selectPattern(index) {
            if (index === -1) {
                this.currentSelection.pattern = null;
            } else if (index >= 0 && index < this.config.patterns.length) {
                this.currentSelection.pattern = this.config.patterns[index];
            }
            
            // 更新選中狀態
            document.querySelectorAll('#stamp-widget-v8 .sw-pattern-item').forEach((item) => {
                const itemIndex = parseInt(item.dataset.patternIndex);
                item.classList.toggle('selected', itemIndex === index);
            });
            
            this.updatePreview();
        }
        
        updateFontPreviews() {
            const text = this.currentSelection.text.substring(0, 2) || '印';
            
            this.config.fonts?.forEach((font, index) => {
                const preview = document.querySelector(`#font-preview-${this.widgetId}-${index} span`);
                if (preview && !preview.style.opacity) {
                    preview.textContent = text;
                }
            });
        }
        
        updatePreview() {
            const canvas = this.elements.canvas;
            const ctx = this.ctx;
            if (!canvas || !ctx) return;
            
            const width = 300;
            const height = 300;
            
            // 清空畫布
            ctx.clearRect(0, 0, width, height);
            
            // 檢查是否有選擇
            if (!this.currentSelection.font || !this.currentSelection.shape || !this.currentSelection.color) {
                ctx.save();
                ctx.fillStyle = '#a09389';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('請選擇字體、形狀和顏色', width / 2, height / 2);
                ctx.restore();
                return;
            }
            
            // 繪製印章
            const color = this.currentSelection.color.main || '#9fb28e';
            const shape = this.currentSelection.shape;
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;
            
            ctx.save();
            
            // 設定樣式
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 6;
            
            // 陰影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
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
                    
                case '圓角方形':
                    this.roundRect(ctx, centerX - size / 2, centerY - size / 2, size, size, 30);
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
                    ctx.globalAlpha = 0.1;
                    
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
                        case '圓角方形':
                            this.roundRect(ctx, centerX - size / 2 + 3, centerY - size / 2 + 3, size - 6, size - 6, 27);
                            break;
                    }
                    ctx.clip();
                    
                    // 建立圖案
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
            const color = this.currentSelection.color.main || '#9fb28e';
            
            if (!text) return;
            
            ctx.save();
            
            // 設定文字樣式
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            
            // 計算字體大小
            let fontSize = size * 0.22;
            
            if (text.length === 1) {
                fontSize = size * 0.4;
            } else if (text.length === 2) {
                fontSize = size * 0.3;
            } else if (text.length >= 5) {
                fontSize = size * 0.18;
            }
            
            // 設定字體
            if (font) {
                if (font.systemFont) {
                    ctx.font = `${font.weight || 'normal'} ${fontSize}px ${font.systemFont}`;
                } else if (this.loadedFonts.has(font.id)) {
                    ctx.font = `${font.weight || 'normal'} ${fontSize}px CustomFont${font.id}, serif`;
                } else {
                    ctx.font = `${fontSize}px serif`;
                }
            } else {
                ctx.font = `${fontSize}px serif`;
            }
            
            // 繪製文字
            if (text.length > 2 && this.currentSelection.shape && 
                (this.currentSelection.shape.name === '圓形' || this.currentSelection.shape.name === '圓角方形')) {
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
            // 建立模態框
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
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                border-radius: 16px;
                padding: 24px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            `;
            
            modalContent.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="margin-bottom: 24px; color: #84736a;">印章預覽</h2>
                    <canvas id="modal-canvas" width="600" height="600" style="
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        margin-bottom: 24px;
                        max-width: 100%;
                        height: auto;
                    "></canvas>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                            padding: 12px 24px;
                            background: #f0f0f0;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            cursor: pointer;
                        ">
                            關閉
                        </button>
                        <button onclick="window.StampWidgetInstance.downloadStamp('png')" style="
                            padding: 12px 24px;
                            background: #9fb28e;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            cursor: pointer;
                        ">
                            下載 PNG
                        </button>
                        <button onclick="window.StampWidgetInstance.downloadStamp('jpg')" style="
                            padding: 12px 24px;
                            background: #9fb28e;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            cursor: pointer;
                        ">
                            下載 JPG
                        </button>
                    </div>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 保存實例引用
            window.StampWidgetInstance = this;
            
            // 繪製大尺寸預覽
            const modalCanvas = document.getElementById('modal-canvas');
            const modalCtx = modalCanvas.getContext('2d');
            modalCtx.scale(2, 2);
            
            // 暫存當前畫布
            const originalCanvas = this.elements.canvas;
            const originalCtx = this.ctx;
            
            this.elements.canvas = modalCanvas;
            this.ctx = modalCtx;
            this.updatePreview();
            
            // 恢復原畫布
            this.elements.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            // 點擊背景關閉
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // ESC 關閉
            const closeOnEsc = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeOnEsc);
                }
            };
            document.addEventListener('keydown', closeOnEsc);
        }
        
        downloadStamp(format = 'png') {
            if (!this.elements.canvas) return;
            
            // 檢查是否有完整選擇
            if (!this.currentSelection.font || !this.currentSelection.shape || !this.currentSelection.color) {
                alert('請先選擇字體、形狀和顏色');
                return;
            }
            
            // 建立高解析度版本
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            
            // 設定為 3x 解析度
            const scale = 3;
            downloadCanvas.width = 300 * scale;
            downloadCanvas.height = 300 * scale;
            
            downloadCtx.scale(scale, scale);
            
            // 根據格式設定背景
            if (format === 'jpg') {
                downloadCtx.fillStyle = 'white';
                downloadCtx.fillRect(0, 0, 300, 300);
            }
            
            // 暫存當前畫布
            const originalCanvas = this.elements.canvas;
            const originalCtx = this.ctx;
            
            // 使用高解析度畫布重新繪製
            this.elements.canvas = downloadCanvas;
            this.ctx = downloadCtx;
            this.updatePreview();
            
            // 恢復原畫布
            this.elements.canvas = originalCanvas;
            this.ctx = originalCtx;
            
            // 下載檔案
            setTimeout(() => {
                const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                const quality = format === 'jpg' ? 0.95 : 1.0;
                
                downloadCanvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    
                    // 檔名包含選擇的資訊
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                    const fontName = this.currentSelection.font?.name || '預設';
                    const shapeName = this.currentSelection.shape?.name || '預設';
                    const colorName = this.currentSelection.color?.name || '預設';
                    
                    a.download = `印章_${this.currentSelection.text}_${fontName}_${shapeName}_${colorName}_${timestamp}.${format}`;
                    
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    // 關閉模態框
                    const modal = document.querySelector('[style*="position: fixed"]');
                    if (modal) modal.remove();
                    
                }, mimeType, quality);
            }, 100);
        }
        
        applySecuritySettings() {
            const settings = this.config?.frontendSecurity || {};
            const widget = document.getElementById('stamp-widget-v8');
            
            if (!widget) return;
            
            // 禁止文字選取
            if (settings.disableTextSelect !== false) {
                widget.classList.add('no-select');
            }
            
            // 禁用右鍵選單
            if (settings.disableRightClick !== false) {
                widget.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
            }
            
            // 禁止拖曳
            if (settings.disableDrag !== false) {
                widget.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                // 防止圖片拖曳
                widget.querySelectorAll('img').forEach(img => {
                    img.draggable = false;
                });
            }
            
            // 啟用浮水印
            if (settings.enableWatermark !== false) {
                this.createWatermark(settings);
            }
            
            // 防止截圖
            if (settings.preventScreenshot !== false) {
                this.enableScreenshotProtection(settings);
            }
            
            // 偵測開發者工具
            if (settings.disableDevTools !== false) {
                this.detectDevTools(settings);
            }
            
            // 禁止列印
            if (settings.disablePrint !== false) {
                window.addEventListener('beforeprint', (e) => {
                    e.preventDefault();
                    alert('列印功能已被禁用');
                    return false;
                });
            }
        }
        
        createWatermark(settings) {
            const text = settings.watermarkText || '© 2025 印章系統 - 版權所有';
            const fontSize = settings.watermarkFontSize || 14;
            const opacity = settings.watermarkOpacity || 0.03;
            
            // 建立浮水印樣式
            const watermarkStyle = document.createElement('style');
            watermarkStyle.textContent = `
                #stamp-widget-v8::after {
                    content: '${text}';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: ${fontSize}px;
                    color: rgba(0, 0, 0, ${opacity});
                    pointer-events: none;
                    white-space: nowrap;
                    user-select: none;
                }
            `;
            document.head.appendChild(watermarkStyle);
        }
        
        enableScreenshotProtection(settings) {
            // PrintScreen 鍵偵測
            document.addEventListener('keyup', (e) => {
                if (e.key === 'PrintScreen') {
                    const widget = document.getElementById('stamp-widget-v8');
                    if (widget) {
                        widget.style.filter = 'blur(20px)';
                        setTimeout(() => {
                            widget.style.filter = '';
                        }, 3000);
                    }
                    alert(settings.screenshotWarning || '禁止截圖 - 版權所有');
                }
            });
            
            // 偵測截圖快捷鍵組合
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                    alert(settings.screenshotWarning || '禁止截圖 - 版權所有');
                }
            });
        }
        
        detectDevTools(settings) {
            let devtoolsOpen = false;
            
            const detect = () => {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    if (!devtoolsOpen) {
                        devtoolsOpen = true;
                        console.clear();
                        console.log('%c' + (settings.devToolsWarning || '警告：偵測到開發者工具！'), 
                            'color: red; font-size: 20px; font-weight: bold;');
                    }
                } else {
                    devtoolsOpen = false;
                }
            };
            
            setInterval(detect, 500);
            
            // 防止 F12
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    }
    
    // 自動初始化
    function autoInit() {
        // 尋找所有容器
        const containers = document.querySelectorAll('[id^="stamp-font-widget"], #stamp-font-widget-container, #stamp-preview-root');
        
        containers.forEach(container => {
            if (!container.dataset.initialized) {
                container.dataset.initialized = 'true';
                new StampWidget(container.id);
            }
        });
    }
    
    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 0);
    }
    
    // 監聽動態插入的容器
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.id && (node.id.includes('stamp-font-widget') || node.id === 'stamp-preview-root')) {
                        if (!node.dataset.initialized) {
                            node.dataset.initialized = 'true';
                            new StampWidget(node.id);
                        }
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 公開 API
    window.StampWidget = StampWidget;
    
    // 版本資訊
    console.log('%c🎯 印章預覽系統 v8.0.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c👤 作者: DK0124', 'color: #84736a;');
    console.log('%c📅 最後更新: 2025-01-29', 'color: #84736a;');
    console.log('%c🔗 GitHub: https://github.com/DK0124/stamp-font-preview', 'color: #64b5f6;');
    
})();
