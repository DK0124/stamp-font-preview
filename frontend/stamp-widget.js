/**
 * 印章字體預覽系統 Widget - 後台控制版
 * @author DK0124
 * @version 5.1.0
 * @date 2025-01-29
 * @description 完全依賴後台資料和設定的印章預覽系統
 */

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
        
        /* 防止選取樣式（根據後台設定動態應用） */
        .no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }
        
        /* 浮水印樣式 */
        .stamp-watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
            opacity: 0.08;
            user-select: none;
        }
        
        .watermark-text {
            position: absolute;
            transform: rotate(-45deg);
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.5);
            text-align: center;
            white-space: nowrap;
            letter-spacing: 2px;
            text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
        }
        
        /* 截圖保護層 */
        #screenshot-protection {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
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
            font-weight: normal;
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
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.7);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item img {
            width: 32px;
            height: 32px;
            object-fit: contain;
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
        
        /* 空白狀態 */
        #stamp-custom-font-widget .scfw-empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
        
        #stamp-custom-font-widget .scfw-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        #stamp-custom-font-widget .scfw-empty-message {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        #stamp-custom-font-widget .scfw-empty-hint {
            font-size: 14px;
            opacity: 0.7;
        }
        
        /* 錯誤狀態 */
        #stamp-custom-font-widget .scfw-error-state {
            text-align: center;
            padding: 40px;
            background: rgba(239, 83, 80, 0.1);
            border-radius: 12px;
            color: #ef5350;
        }
        
        #stamp-custom-font-widget .scfw-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        #stamp-custom-font-widget .scfw-error-message {
            font-size: 16px;
            margin-bottom: 16px;
        }
        
        #stamp-custom-font-widget .scfw-retry-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #ef5350;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-retry-btn:hover {
            background: #e53935;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
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
                    
                    <div class="scfw-categories" id="scfw-categories">
                        <!-- 動態生成分類 -->
                    </div>
                    
                    <div class="scfw-fonts-grid" id="scfw-fonts-grid">
                        <div class="scfw-loading">
                            <div class="scfw-loading-spinner"></div>
                            <div class="scfw-loading-text">正在載入設定...</div>
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
        CONFIG_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json',
        SECURITY_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/security-config.json',
        GITHUB_RAW_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/',
        
        // 從後台載入的資料（初始為空）
        availableFonts: [],
        shapes: [],
        borderStyles: [
            { id: 'solid', name: '實線', style: 'solid' },
            { id: 'double', name: '雙線', style: 'double' },
            { id: 'dashed', name: '虛線', style: 'dashed' },
            { id: 'dotted', name: '點線', style: 'dotted' }
        ],
        colorGroups: [],
        patterns: [],
        categories: [],
        securitySettings: {},

        currentSelection: {
            text: '印章範例',
            font: '',
            fontId: null,
            shape: '',
            borderStyle: 'solid',
            pattern: 'none',
            color: '#DC143C',
            category: 'all'
        },

        loadedFonts: {},
        isLoading: false,
        configLoaded: false,
        bvShopListeners: [],
        protectionHandlers: {},

        // 初始化       
        init: async function() {
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
                mainPreview: widget.querySelector('#scfw-main-preview'),
                categoriesContainer: widget.querySelector('#scfw-categories')
            };

            // 顯示載入狀態
            this.showLoadingState();

            try {
                // 先載入安全設定
                await this.loadSecuritySettings();
                
                // 再載入主設定
                const configSuccess = await this.loadCustomConfig();
                
                if (!configSuccess) {
                    throw new Error('無法載入設定檔');
                }
                
                // 檢查是否有資料
                if (this.availableFonts.length === 0 && 
                    this.shapes.length === 0 && 
                    this.colorGroups.length === 0) {
                    this.showEmptyState();
                    return;
                }
                
                // 初始化所有元件
                this.initializeCategories();
                this.initializeShapes();
                this.initializeBorderStyles();
                this.initializeColors();
                this.initializePatterns();
                this.bindEvents();
                
                // 設定預設值
                this.setDefaultValues();
                
                // 更新預覽
                this.updateMainPreview();
                
                // 載入字體
                await this.loadAllFonts();
                
                // 設定 BVShop 整合
                setTimeout(() => {
                    this.setupBVShopListeners();
                    this.loadFromBVShop();
                }, 500);
                
            } catch (error) {
                console.error('初始化失敗:', error);
                this.showErrorState(error.message);
            }
        },

        // 載入安全設定
        loadSecuritySettings: async function() {
            try {
                const response = await fetch(this.SECURITY_URL + '?t=' + Date.now());
                if (response.ok) {
                    this.securitySettings = await response.json();
                    console.log('安全設定已載入:', this.securitySettings);
                    this.applySecuritySettings();
                } else {
                    // 如果沒有安全設定檔，使用預設值
                    this.securitySettings = {
                        preventScreenshot: false,
                        enableWatermark: false,
                        disableRightClick: false,
                        disableTextSelect: false,
                        disableDevTools: false,
                        watermarkText: '© 2025 印章系統',
                        watermarkInterval: 60
                    };
                }
            } catch (error) {
                console.error('載入安全設定失敗:', error);
                // 使用預設值
                this.securitySettings = {
                    preventScreenshot: false,
                    enableWatermark: false,
                    disableRightClick: false,
                    disableTextSelect: false,
                    disableDevTools: false,
                    watermarkText: '© 2025 印章系統',
                    watermarkInterval: 60
                };
            }
        },

        // 應用安全設定
        applySecuritySettings: function() {
            const settings = this.securitySettings;
            
            // 防止選取文字
            if (settings.disableTextSelect) {
                document.getElementById('stamp-custom-font-widget').classList.add('no-select');
                document.addEventListener('selectstart', this.preventSelectHandler);
            }
            
            // 防止右鍵
            if (settings.disableRightClick) {
                document.addEventListener('contextmenu', this.preventRightClickHandler);
            }
            
            // 防止截圖
            if (settings.preventScreenshot) {
                document.addEventListener('visibilitychange', this.screenshotProtectionHandler);
                
                // 防止 PrintScreen
                document.addEventListener('keydown', (e) => {
                    if (e.keyCode === 44) {
                        e.preventDefault();
                        this.showScreenshotProtection();
                        return false;
                    }
                });
            }
            
            // 防止開發者工具
            if (settings.disableDevTools) {
                this.setupDevToolsDetection();
            }
            
            // 啟用浮水印
            if (settings.enableWatermark) {
                this.generateWatermark();
                // 定期更新浮水印
                setInterval(() => {
                    this.updateWatermark();
                }, (settings.watermarkInterval || 60) * 1000);
            }
            
            // 防止拖曳
            document.addEventListener('dragstart', (e) => {
                if (e.target.tagName === 'IMG' || e.target.closest('#stamp-custom-font-widget')) {
                    e.preventDefault();
                }
            });
        },

        // 各種防護處理器
        preventSelectHandler: function(e) {
            if (e.target.closest('#stamp-custom-font-widget')) {
                e.preventDefault();
            }
        },

        preventRightClickHandler: function(e) {
            if (e.target.closest('#stamp-custom-font-widget')) {
                e.preventDefault();
            }
        },

        screenshotProtectionHandler: function() {
            if (document.hidden) {
                StampFontWidget.showScreenshotProtection();
            }
        },

        showScreenshotProtection: function() {
            let protection = document.getElementById('screenshot-protection');
            if (!protection) {
                protection = document.createElement('div');
                protection.id = 'screenshot-protection';
                protection.textContent = '系統已暫停顯示';
                document.body.appendChild(protection);
            }
            
            protection.style.display = 'flex';
            
            setTimeout(() => {
                protection.style.display = 'none';
            }, 3000);
        },

        // 開發者工具偵測
        setupDevToolsDetection: function() {
            let devtools = { open: false };
            const threshold = 160;
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        if (this.securitySettings.disableDevTools) {
                            alert('偵測到開發者工具，頁面將關閉');
                            window.location.href = 'about:blank';
                        }
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
            
            // 禁用 F12 等快捷鍵
            document.addEventListener('keydown', (e) => {
                if (e.keyCode === 123 || // F12
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
                    (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                    e.preventDefault();
                    return false;
                }
            });
        },

        // 生成浮水印
        generateWatermark: function() {
            const existingWatermark = document.querySelector('.stamp-watermark');
            if (existingWatermark) {
                existingWatermark.remove();
            }
            
            const watermarkLayer = document.createElement('div');
            watermarkLayer.className = 'stamp-watermark';
            
            const watermarkText = this.securitySettings.watermarkText || '© 2025 印章系統';
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const watermarkWidth = 300;
            const watermarkHeight = 150;
            const cols = Math.ceil(screenWidth / watermarkWidth) + 1;
            const rows = Math.ceil(screenHeight / watermarkHeight) + 1;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const watermarkItem = document.createElement('div');
                    watermarkItem.className = 'watermark-text';
                    watermarkItem.style.cssText = `
                        left: ${col * watermarkWidth}px;
                        top: ${row * watermarkHeight}px;
                        width: ${watermarkWidth}px;
                        height: ${watermarkHeight}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    
                    const timestamp = new Date().toLocaleString('zh-TW');
                    watermarkItem.innerHTML = `
                        <div>
                            <div>${watermarkText}</div>
                            <div style="font-size: 10px; margin-top: 5px; opacity: 0.7;">${timestamp}</div>
                        </div>
                    `;
                    
                    watermarkLayer.appendChild(watermarkItem);
                }
            }
            
            document.body.appendChild(watermarkLayer);
        },

        // 更新浮水印
        updateWatermark: function() {
            const watermarkItems = document.querySelectorAll('.watermark-text');
            const timestamp = new Date().toLocaleString('zh-TW');
            
            watermarkItems.forEach(item => {
                const timeDiv = item.querySelector('div > div:last-child');
                if (timeDiv) {
                    timeDiv.textContent = timestamp;
                }
            });
        },

        // 顯示載入狀態
        showLoadingState: function() {
            if (this.elements.fontsGrid) {
                this.elements.fontsGrid.innerHTML = `
                    <div class="scfw-loading">
                        <div class="scfw-loading-spinner"></div>
                        <div class="scfw-loading-text">正在載入設定...</div>
                    </div>
                `;
            }
        },

        // 顯示空白狀態
        showEmptyState: function() {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (!widget) return;
            
            widget.innerHTML = `
                <div class="scfw-empty-state">
                    <div class="scfw-empty-icon material-icons">inbox</div>
                    <div class="scfw-empty-message">尚未設定任何內容</div>
                    <div class="scfw-empty-hint">請先到後台上傳字體、形狀、顏色等資源</div>
                </div>
            `;
        },

        // 顯示錯誤狀態
        showErrorState: function(message) {
            const widget = document.getElementById('stamp-custom-font-widget');
            if (!widget) return;
            
            widget.innerHTML = `
                <div class="scfw-error-state">
                    <div class="scfw-error-icon material-icons">error_outline</div>
                    <div class="scfw-error-message">載入失敗：${message}</div>
                    <button class="scfw-retry-btn" onclick="location.reload()">
                        <span class="material-icons">refresh</span>
                        重新載入
                    </button>
                </div>
            `;
        },

        // 從 GitHub 載入自訂設定
        loadCustomConfig: async function() {
            try {
                console.log('開始載入設定檔...');
                const response = await fetch(this.CONFIG_URL + '?t=' + Date.now());
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const config = await response.json();
                console.log('成功載入設定:', config);
                
                // 載入字體
                if (config.fonts && Array.isArray(config.fonts)) {
                    this.availableFonts = config.fonts.map(font => ({
                        id: font.id || Date.now() + Math.random(),
                        name: font.name,
                        displayName: font.displayName || font.name,
                        category: font.category || 'custom',
                        filename: font.filename,
                        githubPath: font.githubPath,
                        weight: font.weight || 'normal',
                        systemFont: false
                    }));
                    console.log(`載入了 ${this.availableFonts.length} 個字體`);
                }
                
                // 載入形狀
                if (config.shapes && Array.isArray(config.shapes)) {
                    this.shapes = config.shapes.map(shape => ({
                        id: shape.id || shape.name,
                        name: shape.name,
                        class: shape.class || shape.name,
                        githubPath: shape.githubPath
                    }));
                    console.log(`載入了 ${this.shapes.length} 個形狀`);
                }
                
                // 載入顏色
                if (config.colors && Array.isArray(config.colors)) {
                    this.colorGroups = config.colors.map(color => ({
                        id: color.id || Date.now() + Math.random(),
                        name: color.name,
                        main: color.main,
                        shades: color.shades || [color.main]
                    }));
                    console.log(`載入了 ${this.colorGroups.length} 個顏色組`);
                }
                
                // 載入圖案
                if (config.patterns && Array.isArray(config.patterns)) {
                    this.patterns = config.patterns.map(pattern => ({
                        id: pattern.id || pattern.name,
                        name: pattern.name,
                        githubPath: pattern.githubPath
                    }));
                    console.log(`載入了 ${this.patterns.length} 個圖案`);
                }
                
                // 提取所有分類
                const categoriesSet = new Set(['all']);
                this.availableFonts.forEach(font => {
                    if (font.category) {
                        categoriesSet.add(font.category);
                    }
                });
                this.categories = Array.from(categoriesSet);
                
                this.configLoaded = true;
                console.log('設定載入完成');
                return true;
                
            } catch (error) {
                console.error('載入設定失敗:', error);
                this.configLoaded = false;
                return false;
            }
        },

        // 以下其他方法保持不變...
        // (包括 initializeCategories, initializeShapes, initializeBorderStyles, 
        //  initializeColors, initializePatterns, setDefaultValues, 
        //  updateBorderStyleColors, updateMainPreview, loadFont, 
        //  createFontCard, loadAllFonts, updateAllFontPreviews, 
        //  filterFonts, searchFonts, selectFontByName, 
        //  setupBVShopListeners, syncToBVShop, findBVSelect, 
        //  bindEvents, loadFromBVShop, createExternalPreview, 
        //  updateExternalPreview, updateAllExternalPreviews 等方法)
        // 這些方法的程式碼與之前相同，不需要修改
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

console.log('印章小工具 v5.1.0 已載入 - 後台控制安全設定版本');
console.log('作者: DK0124');
console.log('更新時間: 2025-01-29');
