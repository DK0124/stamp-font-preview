/**
 * 印章字體預覽系統 Widget - 響應式優化版
 * @author DK0124
 * @version 4.0.0
 * @date 2025-01-28
 * @description 針對商品頁面優化的響應式印章預覽系統
 */
// 載入防護模組
(function() {
    const script = document.createElement('script');
    script.src = 'frontend-protection.js';
    document.head.appendChild(script);
})();

(function() {
    // 防止重複載入
    if (window._STAMP_FONT_WIDGET_LOADED) return;
    window._STAMP_FONT_WIDGET_LOADED = true;

    // Material Icons 載入
    if (!document.querySelector('link[href*="Material+Icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(iconLink);
    }

    // 建立樣式
    const styles = `
        /* 基礎樣式與顏色變數 */
        :root {
            --primary-bg: #dde5d6;
            --accent-color: #9fb28e;
            --secondary-bg: #f7ecd5;
            --dark-color: #84736a;
            --glass-bg: rgba(221, 229, 214, 0.6);
            --glass-border: rgba(159, 178, 142, 0.2);
            --shadow-color: rgba(132, 115, 106, 0.1);
            --text-primary: #84736a;
            --text-secondary: rgba(132, 115, 106, 0.7);
            --hover-bg: rgba(159, 178, 142, 0.1);
            --selected-bg: rgba(159, 178, 142, 0.2);
        }
        
        /* 主容器 - 適應商品頁面 */
        #stamp-custom-font-widget {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Microsoft JhengHei", sans-serif;
            background: var(--primary-bg);
            border-radius: 16px;
            padding: 16px;
            position: relative;
            overflow: hidden;
            max-width: 100%;
            box-sizing: border-box;
        }
        
        #stamp-custom-font-widget::before {
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
        }
        
        #stamp-custom-font-widget * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* 玻璃效果通用樣式 */
        .glass-effect {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            box-shadow: 
                0 8px 32px var(--shadow-color),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        /* 頂部預覽區 - 簡化版 */
        #stamp-custom-font-widget .scfw-preview-section {
            position: relative;
            z-index: 1;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-preview-container {
            background: linear-gradient(135deg, var(--accent-color) 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-preview-title {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-preview-title .material-icons {
            font-size: 20px;
        }
        
        #stamp-custom-font-widget .scfw-stamp-preview-wrapper {
            display: inline-block;
            padding: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            position: relative;
            z-index: 1;
        }
        
        #stamp-custom-font-widget .scfw-stamp-display {
            position: relative;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 主內容區 - 單欄式佈局 */
        #stamp-custom-font-widget .scfw-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            position: relative;
            z-index: 1;
        }
        
        /* 字體選擇區 */
        #stamp-custom-font-widget .scfw-fonts-section {
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        #stamp-custom-font-widget .scfw-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        
        #stamp-custom-font-widget .scfw-section-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-section-title .material-icons {
            font-size: 24px;
            color: var(--accent-color);
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
            color: var(--text-secondary);
            font-size: 18px;
        }
        
        #stamp-custom-font-widget .scfw-search-input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-primary);
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-search-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.8);
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 分類標籤 */
        #stamp-custom-font-widget .scfw-categories {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        
        #stamp-custom-font-widget .scfw-categories::-webkit-scrollbar {
            display: none;
        }
        
        #stamp-custom-font-widget .scfw-category {
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid transparent;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        #stamp-custom-font-widget .scfw-category:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px var(--shadow-color);
        }
        
        #stamp-custom-font-widget .scfw-category.active {
            background: var(--accent-color);
            color: white;
        }
        
        /* 字體網格 - 優化空間 */
        #stamp-custom-font-widget .scfw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
            overflow-y: auto;
            max-height: 400px;
            padding-right: 4px;
        }
        
        #stamp-custom-font-widget .scfw-font-item {
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            text-align: center;
        }
        
        #stamp-custom-font-widget .scfw-font-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px var(--shadow-color);
            border-color: var(--glass-border);
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            width: 20px;
            height: 20px;
            background: var(--accent-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            font-size: 24px;
            color: var(--text-primary);
            margin-bottom: 8px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #stamp-custom-font-widget .scfw-font-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        /* 標籤頁樣式 */
        #stamp-custom-font-widget .scfw-options-tabs {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
        }
        
        #stamp-custom-font-widget .scfw-tabs-header {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        
        #stamp-custom-font-widget .scfw-tabs-header::-webkit-scrollbar {
            display: none;
        }
        
        #stamp-custom-font-widget .scfw-tab-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid transparent;
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        #stamp-custom-font-widget .scfw-tab-btn .material-icons {
            font-size: 18px;
        }
        
        #stamp-custom-font-widget .scfw-tab-btn:hover {
            background: rgba(255, 255, 255, 0.8);
            transform: translateY(-1px);
        }
        
        #stamp-custom-font-widget .scfw-tab-btn.active {
            background: var(--accent-color);
            color: white;
        }
        
        #stamp-custom-font-widget .scfw-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        #stamp-custom-font-widget .scfw-tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* 文字輸入 */
        #stamp-custom-font-widget .scfw-text-input {
            width: 100%;
            padding: 12px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            font-size: 16px;
            color: var(--text-primary);
            text-align: center;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-text-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.8);
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.1);
        }
        
        /* 形狀選擇 */
        #stamp-custom-font-widget .scfw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 16px;
        }
        
        #stamp-custom-font-widget .scfw-shape-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.5);
            border: 2px solid transparent;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-shape-item:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.8);
        }
        
        #stamp-custom-font-widget .scfw-shape-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 40px;
            height: 40px;
            border: 2px solid var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-shape-label {
            font-size: 10px;
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        /* 邊框樣式 */
        #stamp-custom-font-widget .scfw-border-styles {
            display: flex;
            gap: 8px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            overflow-x: auto;
        }
        
        #stamp-custom-font-widget .scfw-border-style {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        
        #stamp-custom-font-widget .scfw-border-style:hover {
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.8);
        }
        
        #stamp-custom-font-widget .scfw-border-style.selected {
            background: var(--accent-color);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-border-style svg {
            width: 28px;
            height: 28px;
        }
        
        /* 顏色選擇 */
        #stamp-custom-font-widget .scfw-colors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-color-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected {
            transform: scale(1.1);
            box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.2),
                inset 0 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        #stamp-custom-font-widget .scfw-color-shades {
            display: flex;
            gap: 3px;
        }
        
        #stamp-custom-font-widget .scfw-color-shade {
            width: 12px;
            height: 12px;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-color-shade:hover {
            transform: scale(1.3);
        }
        
        /* 圖案選擇 */
        #stamp-custom-font-widget .scfw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.5);
            border: 2px solid transparent;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.7);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-pattern-svg {
            width: 28px;
            height: 28px;
            opacity: 0.7;
            color: var(--text-primary);
        }
        
        #stamp-custom-font-widget .scfw-pattern-none {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
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
            border: 3px solid var(--glass-border);
            border-top-color: var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* 滾動條美化 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: var(--glass-border);
            border-radius: 10px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-color);
        }
        
        /* 手機版優化 */
        @media (max-width: 640px) {
            #stamp-custom-font-widget {
                padding: 12px;
                border-radius: 12px;
            }
            
            #stamp-custom-font-widget .scfw-preview-container {
                padding: 16px;
            }
            
            #stamp-custom-font-widget .scfw-stamp-display > div {
                transform: scale(0.8);
            }
            
            #stamp-custom-font-widget .scfw-fonts-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                max-height: 300px;
            }
            
            #stamp-custom-font-widget .scfw-font-item {
                padding: 12px;
            }
            
            #stamp-custom-font-widget .scfw-font-preview {
                font-size: 20px;
                height: 32px;
            }
            
            #stamp-custom-font-widget .scfw-shapes-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            #stamp-custom-font-widget .scfw-colors-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            #stamp-custom-font-widget .scfw-patterns-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            #stamp-custom-font-widget .scfw-tab-btn {
                padding: 6px 10px;
                font-size: 12px;
            }
            
            #stamp-custom-font-widget .scfw-tab-btn .material-icons {
                font-size: 16px;
            }
        }
        
        /* 極小螢幕優化 */
        @media (max-width: 375px) {
            #stamp-custom-font-widget .scfw-fonts-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-stamp-display > div {
                transform: scale(0.7);
            }
            
            #stamp-custom-font-widget .scfw-shapes-grid,
            #stamp-custom-font-widget .scfw-colors-grid,
            #stamp-custom-font-widget .scfw-patterns-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;

    // 建立 HTML 結構
    const html = `
        <div id="stamp-custom-font-widget">
            <!-- 預覽區 -->
            <div class="scfw-preview-section">
                <div class="scfw-preview-container">
                    <h2 class="scfw-preview-title">
                        <span class="material-icons">verified</span>
                        印章即時預覽
                    </h2>
                    <div class="scfw-stamp-preview-wrapper">
                        <div class="scfw-stamp-display" id="scfw-main-preview">
                            <!-- 動態生成預覽 -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 主內容 -->
            <div class="scfw-content">
                <!-- 字體選擇區 -->
                <div class="scfw-fonts-section glass-effect">
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
                        <button class="scfw-category active" data-category="all">全部</button>
                        <button class="scfw-category" data-category="traditional">傳統</button>
                        <button class="scfw-category" data-category="handwrite">手寫</button>
                        <button class="scfw-category" data-category="modern">現代</button>
                    </div>
                    
                    <div class="scfw-fonts-grid" id="scfw-fonts-grid">
                        <div class="scfw-loading">
                            <div class="scfw-loading-spinner"></div>
                            <div class="scfw-loading-text">正在載入字體...</div>
                        </div>
                    </div>
                </div>
                
                <!-- 選項標籤頁 -->
                <div class="scfw-options-tabs glass-effect">
                    <div class="scfw-tabs-header">
                        <button class="scfw-tab-btn active" data-tab="text">
                            <span class="material-icons">edit</span>
                            <span>文字</span>
                        </button>
                        <button class="scfw-tab-btn" data-tab="shape">
                            <span class="material-icons">category</span>
                            <span>形狀</span>
                        </button>
                        <button class="scfw-tab-btn" data-tab="color">
                            <span class="material-icons">palette</span>
                            <span>顏色</span>
                        </button>
                        <button class="scfw-tab-btn" data-tab="pattern">
                            <span class="material-icons">stars</span>
                            <span>圖案</span>
                        </button>
                    </div>
                    
                    <div class="scfw-tabs-content">
                        <!-- 文字標籤頁 -->
                        <div class="scfw-tab-content active" data-tab="text">
                            <input type="text" 
                                   class="scfw-text-input" 
                                   id="scfw-text"
                                   placeholder="輸入印章文字（最多6字）"
                                   maxlength="6"
                                   value="印章範例">
                        </div>
                        
                        <!-- 形狀標籤頁 -->
                        <div class="scfw-tab-content" data-tab="shape">
                            <div class="scfw-shapes-grid" id="scfw-shapes-grid">
                                <!-- 動態生成 -->
                            </div>
                            <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary); font-weight: 500;">邊框樣式</div>
                            <div class="scfw-border-styles" id="scfw-border-styles">
                                <!-- 動態生成 -->
                            </div>
                        </div>
                        
                        <!-- 顏色標籤頁 -->
                        <div class="scfw-tab-content" data-tab="color">
                            <div class="scfw-colors-grid" id="scfw-colors-grid">
                                <!-- 動態生成 -->
                            </div>
                        </div>
                        
                        <!-- 圖案標籤頁 -->
                        <div class="scfw-tab-content" data-tab="pattern">
                            <div class="scfw-patterns-grid" id="scfw-patterns-grid">
                                <!-- 動態生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 圖案 SVG 定義
    const patternSVGs = {
        none: '',
        flower: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2C16 2 12 6 12 10C12 12 13 13 14 13C13 14 12 15 10 15C6 15 2 11 2 11C2 11 6 15 10 15C12 15 13 14 13 13C14 14 15 15 17 15C21 15 25 11 25 11C25 11 21 15 17 15C15 15 14 14 14 13C15 13 16 12 16 10C16 6 20 2 20 2C20 2 16 6 16 10C16 14 20 18 20 18C20 18 16 14 16 10C16 6 12 2 12 2C12 2 16 6 16 10C16 14 12 18 12 18C12 18 16 14 16 10C16 6 20 2 20 2L16 2Z"/>
        </svg>`,
        heart: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 28C16 28 3 20 3 11C3 7 6 4 9 4C12 4 14 6 16 8C18 6 20 4 23 4C26 4 29 7 29 11C29 20 16 28 16 28Z"/>
        </svg>`,
        star: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2L20 12L30 12L22 18L26 28L16 22L6 28L10 18L2 12L12 12Z"/>
        </svg>`,
        leaf: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2C16 2 8 4 8 12C8 18 12 22 16 22C20 22 24 18 24 12C24 4 16 2 16 2ZM16 22L16 30"/>
        </svg>`,
        butterfly: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 16C16 16 12 12 8 12C4 12 2 16 2 20C2 24 4 26 8 26C12 26 16 22 16 16ZM16 16C16 16 20 12 24 12C28 12 30 16 30 20C30 24 28 26 24 26C20 26 16 22 16 16ZM16 16L16 8"/>
        </svg>`,
        moon: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M20 4C12 4 6 10 6 18C6 26 12 32 20 32C24 32 28 30 30 26C28 28 26 28 24 28C16 28 10 22 10 14C10 10 12 6 16 4C18 4 20 4 20 4Z"/>
        </svg>`,
        sun: `<svg viewBox="0 0 32 32" fill="currentColor">
            <circle cx="16" cy="16" r="6"/>
            <path d="M16 0L16 6M16 26L16 32M32 16L26 16M6 16L0 16M26 6L22 10M10 22L6 26M26 26L22 22M10 10L6 6"/>
        </svg>`
    };

    // 注入樣式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 尋找容器並注入 HTML
    const container = document.getElementById('stamp-font-widget-container') || 
                     document.getElementById('stamp-preview-root') ||
                     document.body;
    
    const widgetDiv = document.createElement('div');
    widgetDiv.innerHTML = html;
    container.appendChild(widgetDiv);

    // Widget 主要邏輯
    const StampFontWidget = {
        // 配置
        availableFonts: [
            { id: 1, name: '粉圓體', filename: '粉圓體全繁體.ttf', displayName: '粉圓體', category: 'modern' },
            { id: 2, name: '粒線體不等寬', filename: '粒線體不等寬全繁體.ttf', displayName: '粒線體(不等寬)', category: 'modern' },
            { id: 3, name: '粒線體等寬', filename: '粒線體等寬全繁體.ttf', displayName: '粒線體(等寬)', category: 'modern' },
            { id: 4, name: '粗線體不等寬', filename: '粗線體不等寬版 全繁體.ttf', displayName: '粗線體(不等寬)', category: 'modern' },
            { id: 5, name: '粗線體等寬', filename: '粗線體等寬版 全繁體.ttf', displayName: '粗線體(等寬)', category: 'modern' },
            { id: 6, name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf', displayName: '胖西手寫體', category: 'handwrite' },
            { id: 7, name: '辰宇落雁體', filename: '辰宇落雁體 不等寬版全繁體.ttf', displayName: '辰宇落雁體', category: 'handwrite' },
            { id: 8, name: '楷書', filename: '', displayName: '楷書', systemFont: 'KaiTi, "標楷體", serif', category: 'traditional' },
            { id: 9, name: '隸書', filename: '', displayName: '隸書', systemFont: '"隸書", FangSong, serif', category: 'traditional' },
            { id: 10, name: '篆書', filename: '', displayName: '篆書', systemFont: 'SimSun, "宋體", serif', category: 'traditional' }
        ],

        shapes: [
            { id: 'circle', name: '圓形', class: '圓形' },
            { id: 'square', name: '方形', class: '方形' },
            { id: 'ellipse', name: '橢圓形', class: '橢圓形' },
            { id: 'rectangle', name: '長方形', class: '長方形' }
        ],

        borderStyles: [
            { id: 'solid', name: '實線', style: 'solid' },
            { id: 'double', name: '雙線', style: 'double' },
            { id: 'dashed', name: '虛線', style: 'dashed' },
            { id: 'dotted', name: '點線', style: 'dotted' }
        ],

        colorGroups: [
            { 
                main: '#e57373', 
                name: '珊瑚紅',
                shades: ['#ef9a9a', '#e57373', '#ef5350', '#e53935']
            },
            { 
                main: '#9fb28e', 
                name: '抹茶綠',
                shades: ['#b5c4a7', '#9fb28e', '#8fa77b', '#7f9969']
            },
            { 
                main: '#64b5f6', 
                name: '天空藍',
                shades: ['#90caf9', '#64b5f6', '#42a5f5', '#2196f3']
            },
            { 
                main: '#ffb74d', 
                name: '琥珀黃',
                shades: ['#ffcc80', '#ffb74d', '#ffa726', '#ff9800']
            }
        ],

        patterns: [
            { id: 'none', name: '無' },
            { id: 'flower', name: '花朵' },
            { id: 'heart', name: '愛心' },
            { id: 'star', name: '星星' },
            { id: 'leaf', name: '葉子' },
            { id: 'butterfly', name: '蝴蝶' },
            { id: 'moon', name: '月亮' },
            { id: 'sun', name: '太陽' }
        ],

        GITHUB_RAW_URL: 'https://raw.githubusercontent.com/DK0124/font-preview-system/main/fonts/',

        currentSelection: {
            text: '印章範例',
            font: '粗線體不等寬',          // 原本是 '楷書'
            fontId: 4,                      // 原本是 8，改為 4（粗線體不等寬的 ID）
            shape: 'circle',                // 保持圓形
            borderStyle: 'solid',           
            pattern: 'none',                // 保持無圖案
            color: '#ff9800',               // 原本是 '#e57373'，改為深黃色（琥珀黃的深色）
            category: 'all'
        },

        loadedFonts: {},
        isLoading: false,
        bvShopListeners: [],

        // 初始化
        init: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (!widget) return;

            this.elements = {
                textInput: widget.querySelector('#scfw-text'),
                fontSearch: widget.querySelector('#scfw-font-search'),
                fontsGrid: widget.querySelector('#scfw-fonts-grid'),
                shapesGrid: widget.querySelector('#scfw-shapes-grid'),
                borderStyles: widget.querySelector('#scfw-border-styles'),
                colorsGrid: widget.querySelector('#scfw-colors-grid'),
                patternsGrid: widget.querySelector('#scfw-patterns-grid'),
                mainPreview: widget.querySelector('#scfw-main-preview')
            };

            this.initializeShapes();
            this.initializeBorderStyles();
            this.initializeColors();
            this.initializePatterns();
            this.bindEvents();
            this.updateMainPreview();

            setTimeout(() => {
                this.setupBVShopListeners();
                this.loadFromBVShop();
                this.loadAllFonts();
            }, 500);
        },

        // 初始化形狀
        initializeShapes: function() {
            const shapesGrid = this.elements.shapesGrid;
            
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
                        shapeStyle = 'border-radius: 50%;';
                        dimensions = 'width: 50px; height: 35px;';
                        break;
                    case 'rectangle':
                        dimensions = 'width: 50px; height: 35px;';
                        break;
                }
                
                item.innerHTML = `
                    <div class="scfw-shape-preview" style="${shapeStyle} ${dimensions}"></div>
                    <span class="scfw-shape-label">${shape.name}</span>
                `;
                
                item.addEventListener('click', () => {
                    shapesGrid.querySelectorAll('.scfw-shape-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.shape = shape.id;
                    this.updateMainPreview();
                    this.syncToBVShop('shape', shape.class);
                });
                
                shapesGrid.appendChild(item);
            });
        },

        // 初始化邊框樣式
        initializeBorderStyles: function() {
            const container = this.elements.borderStyles;
            
            this.borderStyles.forEach((style, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-border-style';
                if (index === 0) item.classList.add('selected');
                item.dataset.style = style.id;
                
                const strokeDasharray = style.id === 'dashed' ? '6,3' : 
                                       style.id === 'dotted' ? '2,2' : '0';
                
                item.innerHTML = `
                    <svg viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" 
                                stroke="${this.currentSelection.color}" 
                                stroke-width="2" 
                                stroke-dasharray="${strokeDasharray}"/>
                    </svg>
                `;
                
                item.addEventListener('click', () => {
                    container.querySelectorAll('.scfw-border-style').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.borderStyle = style.style;
                    this.updateMainPreview();
                });
                
                container.appendChild(item);
            });
        },

        // 初始化顏色
        initializeColors: function() {
            const colorsGrid = this.elements.colorsGrid;
            
            this.colorGroups.forEach((group, index) => {
                const colorGroup = document.createElement('div');
                colorGroup.className = 'scfw-color-group';
                
                const mainColor = document.createElement('div');
                mainColor.className = 'scfw-color-main';
                
                // 判斷是否為琥珀黃色系，如果是則預設選中
                if (group.main === '#ffb74d') {
                    mainColor.classList.add('selected');
                    // 同時設定當前選擇為深黃色（琥珀黃的最深色）
                    this.currentSelection.color = '#ff9800';
                }
                
                mainColor.style.backgroundColor = group.main;
                mainColor.dataset.color = group.main;
                
                mainColor.addEventListener('click', () => {
                    colorsGrid.querySelectorAll('.scfw-color-main').forEach(el => el.classList.remove('selected'));
                    mainColor.classList.add('selected');
                    this.currentSelection.color = group.main;
                    this.updateMainPreview();
                    this.updateBorderStyleColors();
                    this.syncToBVShop('color', group.main);
                });
                
                const shades = document.createElement('div');
                shades.className = 'scfw-color-shades';
                
                group.shades.forEach((shade, shadeIndex) => {
                    const shadeDiv = document.createElement('div');
                    shadeDiv.className = 'scfw-color-shade';
                    shadeDiv.style.backgroundColor = shade;
                    shadeDiv.dataset.color = shade;
                    
                    // 如果是琥珀黃色系的最深色，觸發點擊以設定為預設
                    if (group.main === '#ffb74d' && shade === '#ff9800' && !this._colorInitialized) {
                        setTimeout(() => {
                            shadeDiv.click();
                            this._colorInitialized = true;
                        }, 100);
                    }
                    
                    shadeDiv.addEventListener('click', () => {
                        colorsGrid.querySelectorAll('.scfw-color-main').forEach(el => el.classList.remove('selected'));
                        mainColor.classList.add('selected');
                        this.currentSelection.color = shade;
                        this.updateMainPreview();
                        this.updateBorderStyleColors();
                        this.syncToBVShop('color', shade);
                    });
                    
                    shades.appendChild(shadeDiv);
                });
                
                colorGroup.appendChild(mainColor);
                colorGroup.appendChild(shades);
                colorsGrid.appendChild(colorGroup);
            });
            
            // 初始化時更新邊框顏色為深黃色
            setTimeout(() => {
                this.updateBorderStyleColors();
            }, 200);
        },
        // 初始化圖案
        initializePatterns: function() {
            const patternsGrid = this.elements.patternsGrid;
            
            this.patterns.forEach((pattern, index) => {
                const item = document.createElement('div');
                item.className = 'scfw-pattern-item';
                if (index === 0) item.classList.add('selected');
                item.dataset.pattern = pattern.id;
                
                if (pattern.id === 'none') {
                    item.innerHTML = '<span class="scfw-pattern-none">無</span>';
                } else {
                    item.innerHTML = `<div class="scfw-pattern-svg">${patternSVGs[pattern.id]}</div>`;
                }
                
                item.addEventListener('click', () => {
                    patternsGrid.querySelectorAll('.scfw-pattern-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                    this.syncToBVShop('pattern', pattern.id === 'none' ? '' : pattern.name);
                });
                
                patternsGrid.appendChild(item);
            });
        },

        // 更新邊框樣式顏色
        updateBorderStyleColors: function() {
            const borderStyles = this.elements.borderStyles.querySelectorAll('svg circle');
            borderStyles.forEach(circle => {
                circle.setAttribute('stroke', this.currentSelection.color);
            });
        },

        // 更新主預覽
        updateMainPreview: function() {
            const preview = this.elements.mainPreview;
            const font = this.availableFonts.find(f => f.id === this.currentSelection.fontId);
            const pattern = this.patterns.find(p => p.id === this.currentSelection.pattern);
            
            let shapeStyle = '';
            let dimensions = 'width: 150px; height: 150px;';
            
            switch(this.currentSelection.shape) {
                case 'circle':
                    shapeStyle = 'border-radius: 50%;';
                    break;
                case 'ellipse':
                    shapeStyle = 'border-radius: 50%;';
                    dimensions = 'width: 180px; height: 130px;';
                    break;
                case 'rectangle':
                    dimensions = 'width: 180px; height: 120px;';
                    break;
            }
            
            const fontFamily = font ? (font.systemFont || `CustomFont${font.id}`) : 'serif';
            
            preview.innerHTML = `
                <div style="
                    ${dimensions}
                    border: 4px ${this.currentSelection.borderStyle} ${this.currentSelection.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: white;
                    ${shapeStyle}
                ">
                    <span style="
                        font-family: ${fontFamily};
                        font-size: 36px;
                        color: ${this.currentSelection.color};
                        text-align: center;
                        padding: 0 10px;
                    ">${this.currentSelection.text}</span>
                    ${pattern && pattern.id !== 'none' ? `
                        <div style="
                            position: absolute;
                            bottom: 10px;
                            right: 10px;
                            width: 24px;
                            height: 24px;
                            opacity: 0.3;
                            color: ${this.currentSelection.color};
                        ">${patternSVGs[pattern.id]}</div>
                    ` : ''}
                </div>
            `;
        },

        // 載入字體
        loadFont: async function(fontData) {
            if (fontData.systemFont) {
                return true;
            }
            
            if (this.loadedFonts[fontData.id]) {
                return this.loadedFonts[fontData.id];
            }
            
            try {
                const fontUrl = this.GITHUB_RAW_URL + encodeURIComponent(fontData.filename);
                const fontFace = new FontFace(
                    `CustomFont${fontData.id}`, 
                    `url(${fontUrl})`
                );
                
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loadedFonts[fontData.id] = fontFace;
                
                return fontFace;
            } catch (error) {
                console.error(`載入字體失敗 ${fontData.name}:`, error);
                return null;
            }
        },

        // 創建字體卡片
        createFontCard: function(fontData) {
            const item = document.createElement('div');
            item.className = 'scfw-font-item';
            item.dataset.fontId = fontData.id;
            item.dataset.fontName = fontData.name;
            item.dataset.category = fontData.category;
            
            if (fontData.id === this.currentSelection.fontId) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="scfw-font-preview">
                    <span style="opacity: 0.3;">載入中...</span>
                </div>
                <div class="scfw-font-label">${fontData.displayName}</div>
            `;
            
            // 載入字體後更新
            this.loadFont(fontData).then((loaded) => {
                if (loaded) {
                    const preview = item.querySelector('.scfw-font-preview');
                    preview.innerHTML = `
                        <span style="font-family: ${fontData.systemFont || `CustomFont${fontData.id}`};">
                            ${this.currentSelection.text}
                        </span>
                    `;
                }
            });
            
            item.addEventListener('click', () => {
                const widget = document.getElementById('stamp-custom-font-widget');
                widget.querySelectorAll('.scfw-font-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                this.currentSelection.font = fontData.name;
                this.currentSelection.fontId = fontData.id;
                
                this.updateMainPreview();
                this.syncToBVShop('font', fontData.name);
            });
            
            return item;
        },

        // 載入所有字體
        loadAllFonts: async function() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.elements.fontsGrid.innerHTML = `
                <div class="scfw-loading">
                    <div class="scfw-loading-spinner"></div>
                    <div class="scfw-loading-text">正在載入字體...</div>
                </div>
            `;
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.elements.fontsGrid.innerHTML = '';
            
            for (const fontData of this.availableFonts) {
                const card = this.createFontCard(fontData);
                this.elements.fontsGrid.appendChild(card);
            }
            
            this.isLoading = false;
            
            setTimeout(() => {
                const fontSelect = this.findBVSelect('字體');
                if (fontSelect && fontSelect.value) {
                    this.selectFontByName(fontSelect.value);
                } else {
                    // 如果沒有 BV Shop 的選擇，使用預設的粗線體不等寬
                    this.selectFontByName('粗線體不等寬');
                }
            }, 100);
        },

        // 更新所有字體預覽
        updateAllFontPreviews: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            widget.querySelectorAll('.scfw-font-preview span').forEach(span => {
                span.textContent = this.currentSelection.text || '印章範例';
            });
        },

        // 篩選字體
        filterFonts: function(category) {
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
        searchFonts: function(keyword) {
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

        // 根據字體名稱選中
        selectFontByName: function(fontName) {
            const widget = document.getElementById('stamp-custom-font-widget');
            
            widget.querySelectorAll('.scfw-font-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            const fontData = this.availableFonts.find(f => f.name === fontName);
            if (fontData) {
                const targetItem = widget.querySelector(`[data-font-name="${fontName}"]`);
                if (targetItem) {
                    targetItem.classList.add('selected');
                    this.currentSelection.font = fontName;
                    this.currentSelection.fontId = fontData.id;
                    
                    this.updateMainPreview();
                }
            }
        },

        // 設定 BV SHOP 監聽器
        setupBVShopListeners: function() {
            this.bvShopListeners.forEach(listener => {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            this.bvShopListeners = [];

            const fontSelect = this.findBVSelect('字體');
            if (fontSelect) {
                const fontHandler = (e) => {
                    this.selectFontByName(e.target.value);
                };
                fontSelect.addEventListener('change', fontHandler);
                this.bvShopListeners.push({ element: fontSelect, event: 'change', handler: fontHandler });
            }
            
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput) {
                const textHandler = (e) => {
                    this.elements.textInput.value = e.target.value;
                    this.currentSelection.text = e.target.value;
                    this.updateMainPreview();
                    this.updateAllFontPreviews();
                };
                textInput.addEventListener('input', textHandler);
                this.bvShopListeners.push({ element: textInput, event: 'input', handler: textHandler });
            }
            
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect) {
                const shapeHandler = (e) => {
                    const shape = this.shapes.find(s => s.class === e.target.value);
                    if (shape) {
                        this.elements.shapesGrid.querySelectorAll('.scfw-shape-item').forEach(item => {
                            item.classList.remove('selected');
                            if (item.dataset.shape === shape.id) {
                                item.classList.add('selected');
                            }
                        });
                        this.currentSelection.shape = shape.id;
                        this.updateMainPreview();
                    }
                };
                shapeSelect.addEventListener('change', shapeHandler);
                this.bvShopListeners.push({ element: shapeSelect, event: 'change', handler: shapeHandler });
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect) {
                const patternHandler = (e) => {
                    const patternName = e.target.value;
                    const pattern = this.patterns.find(p => p.name === patternName) || this.patterns[0];
                    this.elements.patternsGrid.querySelectorAll('.scfw-pattern-item').forEach(item => {
                        item.classList.remove('selected');
                        if (item.dataset.pattern === pattern.id) {
                            item.classList.add('selected');
                        }
                    });
                    this.currentSelection.pattern = pattern.id;
                    this.updateMainPreview();
                };
                patternSelect.addEventListener('change', patternHandler);
                this.bvShopListeners.push({ element: patternSelect, event: 'change', handler: patternHandler });
            }
            
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect) {
                const colorHandler = (e) => {
                    const selectedColor = e.target.value;
                    const colorMap = {
                        '朱紅': '#e57373',
                        '黑色': '#84736a',
                        '藍色': '#64b5f6',
                        '綠色': '#9fb28e'
                    };
                    const actualColor = colorMap[selectedColor] || '#e57373';
                    
                    this.elements.colorsGrid.querySelectorAll('.scfw-color-main').forEach(c => {
                        c.classList.remove('selected');
                        if (c.dataset.color === actualColor) {
                            c.classList.add('selected');
                        }
                    });
                    
                    this.currentSelection.color = actualColor;
                    this.updateMainPreview();
                    this.updateBorderStyleColors();
                };
                colorSelect.addEventListener('change', colorHandler);
                this.bvShopListeners.push({ element: colorSelect, event: 'change', handler: colorHandler });
            }
        },

        // 同步到 BV SHOP
        syncToBVShop: function(field, value) {
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
                            const colorTextMap = {
                                '#e57373': '朱紅',
                                '#84736a': '黑色',
                                '#64b5f6': '藍色',
                                '#9fb28e': '綠色'
                            };
                            const colorText = colorTextMap[value] || '朱紅';
                            colorSelect.value = colorText;
                            colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        break;
                }
            } catch (error) {
                console.error('同步錯誤:', error);
            }
        },

        // 尋找 BV SHOP 選擇器
        findBVSelect: function(labelText) {
            const labels = document.querySelectorAll('label');
            for (let label of labels) {
                if (label.textContent.trim() === labelText) {
                    const select = label.parentElement.querySelector('select');
                    if (select) return select;
                }
            }
            return null;
        },

        // 綁定事件
        bindEvents: function() {
            // 文字輸入
            this.elements.textInput.addEventListener('input', (e) => {
                this.currentSelection.text = e.target.value || '印章範例';
                this.updateMainPreview();
                this.updateAllFontPreviews();
                this.syncToBVShop('text', e.target.value);
            });
            
            // 字體搜尋
            this.elements.fontSearch.addEventListener('input', (e) => {
                this.searchFonts(e.target.value);
            });
            
            // 分類按鈕
            document.querySelectorAll('.scfw-category').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.scfw-category').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentSelection.category = btn.dataset.category;
                    this.filterFonts(btn.dataset.category);
                });
            });
            
            // 標籤頁切換
            const tabBtns = document.querySelectorAll('.scfw-tab-btn');
            const tabContents = document.querySelectorAll('.scfw-tab-content');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.dataset.tab;
                    
                    // 切換按鈕狀態
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // 切換內容顯示
                    tabContents.forEach(content => {
                        if (content.dataset.tab === targetTab) {
                            content.classList.add('active');
                        } else {
                            content.classList.remove('active');
                        }
                    });
                });
            });
        },

        // 從 BV SHOP 載入初始值
        loadFromBVShop: function() {
            const textInput = document.querySelector('input[placeholder="輸入六字內"]');
            if (textInput && textInput.value) {
                this.elements.textInput.value = textInput.value;
                this.currentSelection.text = textInput.value;
            }
            
            const shapeSelect = this.findBVSelect('形狀');
            if (shapeSelect && shapeSelect.value) {
                const shape = this.shapes.find(s => s.class === shapeSelect.value);
                if (shape) {
                    this.currentSelection.shape = shape.id;
                    this.elements.shapesGrid.querySelectorAll('.scfw-shape-item').forEach(item => {
                        item.classList.remove('selected');
                        if (item.dataset.shape === shape.id) {
                            item.classList.add('selected');
                        }
                    });
                }
            }
            
            const patternSelect = this.findBVSelect('圖案');
            if (patternSelect && patternSelect.value) {
                const pattern = this.patterns.find(p => p.name === patternSelect.value);
                if (pattern) {
                    this.currentSelection.pattern = pattern.id;
                    this.elements.patternsGrid.querySelectorAll('.scfw-pattern-item').forEach(item => {
                        item.classList.remove('selected');
                        if (item.dataset.pattern === pattern.id) {
                            item.classList.add('selected');
                        }
                    });
                }
            }
            
            const colorSelect = this.findBVSelect('顏色');
            if (colorSelect && colorSelect.value) {
                const colorMap = {
                    '朱紅': '#e57373',
                    '黑色': '#84736a',
                    '藍色': '#64b5f6',
                    '綠色': '#9fb28e'
                };
                this.currentSelection.color = colorMap[colorSelect.value] || '#e57373';
                this.elements.colorsGrid.querySelectorAll('.scfw-color-main').forEach(c => {
                    c.classList.remove('selected');
                    if (c.dataset.color === this.currentSelection.color) {
                        c.classList.add('selected');
                    }
                });
            }
            
            const fontSelect = this.findBVSelect('字體');
            if (fontSelect && fontSelect.value) {
                this.selectFontByName(fontSelect.value);
            }
            
            this.updateMainPreview();
            this.updateBorderStyleColors();
        }
    };

    // 初始化 Widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            StampFontWidget.init();
        });
    } else {
        StampFontWidget.init();
    }

    // 暴露到全域以供除錯
    window.StampFontWidget = StampFontWidget;

})();
