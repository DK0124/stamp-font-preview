/**
 * 印章字體預覽系統 Widget - Apple Glass Design
 * @author DK0124
 * @version 3.0.0
 * @date 2025-01-28
 * @description 採用 Apple 玻璃質感設計的印章預覽系統
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
        
        /* 主容器 */
        #stamp-custom-font-widget {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
            background: var(--primary-bg);
            border-radius: 24px;
            padding: 32px;
            position: relative;
            overflow: hidden;
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
        
        /* 頂部預覽區 */
        #stamp-custom-font-widget .scfw-preview-section {
            position: relative;
            z-index: 1;
            margin-bottom: 32px;
        }
        
        #stamp-custom-font-widget .scfw-preview-container {
            background: linear-gradient(135deg, var(--accent-color) 0%, rgba(159, 178, 142, 0.8) 100%);
            border-radius: 20px;
            padding: 48px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-preview-container::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: 
                radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-20px, -20px) rotate(180deg); }
        }
        
        #stamp-custom-font-widget .scfw-preview-title {
            color: white;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-preview-title .material-icons {
            font-size: 24px;
            opacity: 0.9;
        }
        
        #stamp-custom-font-widget .scfw-stamp-preview-wrapper {
            display: inline-block;
            padding: 40px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            position: relative;
            z-index: 1;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-stamp-display {
            position: relative;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 主內容區 */
        #stamp-custom-font-widget .scfw-content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 24px;
            position: relative;
            z-index: 1;
        }
        
        /* 字體選擇區 */
        #stamp-custom-font-widget .scfw-fonts-section {
            border-radius: 20px;
            padding: 32px;
            display: flex;
            flex-direction: column;
        }
        
        #stamp-custom-font-widget .scfw-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
        }
        
        #stamp-custom-font-widget .scfw-section-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-section-title .material-icons {
            font-size: 28px;
            color: var(--accent-color);
        }
        
        /* 搜尋框 */
        #stamp-custom-font-widget .scfw-search-container {
            position: relative;
            margin-bottom: 20px;
        }
        
        #stamp-custom-font-widget .scfw-search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
            font-size: 20px;
        }
        
        #stamp-custom-font-widget .scfw-search-input {
            width: 100%;
            padding: 14px 16px 14px 48px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            font-size: 16px;
            color: var(--text-primary);
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-search-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.8);
            border-color: var(--accent-color);
            box-shadow: 0 0 0 4px rgba(159, 178, 142, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-search-input::placeholder {
            color: var(--text-secondary);
        }
        
        /* 分類標籤 */
        #stamp-custom-font-widget .scfw-categories {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        
        #stamp-custom-font-widget .scfw-category {
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid transparent;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-category::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--accent-color);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-category:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--shadow-color);
        }
        
        #stamp-custom-font-widget .scfw-category.active {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-category span {
            position: relative;
            z-index: 1;
        }
        
        /* 字體網格 */
        #stamp-custom-font-widget .scfw-fonts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
            overflow-y: auto;
            max-height: 600px;
            padding-right: 8px;
            flex: 1;
        }
        
        #stamp-custom-font-widget .scfw-font-item {
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: 16px;
            padding: 24px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-font-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, var(--hover-bg) 100%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-font-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px var(--shadow-color);
            border-color: var(--glass-border);
        }
        
        #stamp-custom-font-widget .scfw-font-item:hover::before {
            opacity: 1;
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
            box-shadow: 
                0 8px 24px rgba(159, 178, 142, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::after {
            content: '';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 24px;
            height: 24px;
            background: var(--accent-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(159, 178, 142, 0.3);
        }
        
        #stamp-custom-font-widget .scfw-font-item.selected::before {
            content: '✓';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 24px;
            height: 24px;
            color: white;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }
        
        #stamp-custom-font-widget .scfw-font-preview {
            font-size: 36px;
            color: var(--text-primary);
            text-align: center;
            margin-bottom: 12px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        
        #stamp-custom-font-widget .scfw-font-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            text-align: center;
            position: relative;
            z-index: 1;
        }
        
        /* 右側選項面板 */
        #stamp-custom-font-widget .scfw-options-panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        #stamp-custom-font-widget .scfw-option-card {
            border-radius: 20px;
            padding: 24px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        
        #stamp-custom-font-widget .scfw-option-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            color: var(--text-primary);
            font-weight: 600;
            font-size: 16px;
        }
        
        #stamp-custom-font-widget .scfw-option-header .material-icons {
            font-size: 20px;
            color: var(--accent-color);
        }
        
        /* 文字輸入 */
        #stamp-custom-font-widget .scfw-text-input {
            width: 100%;
            padding: 16px;
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            font-size: 16px;
            color: var(--text-primary);
            text-align: center;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-text-input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.8);
            border-color: var(--accent-color);
            box-shadow: 0 0 0 4px rgba(159, 178, 142, 0.1);
        }
        
        /* 形狀選擇 */
        #stamp-custom-font-widget .scfw-shapes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-shape-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.5);
            border: 2px solid transparent;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        #stamp-custom-font-widget .scfw-shape-item:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px var(--shadow-color);
        }
        
        #stamp-custom-font-widget .scfw-shape-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-shape-preview {
            width: 60px;
            height: 60px;
            border: 3px solid var(--accent-color);
            position: relative;
        }
        
        #stamp-custom-font-widget .scfw-shape-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
        }
        
        /* 邊框樣式 */
        #stamp-custom-font-widget .scfw-border-styles {
            display: flex;
            gap: 8px;
            margin-top: 16px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 12px;
        }
        
        #stamp-custom-font-widget .scfw-border-style {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid transparent;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
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
            width: 32px;
            height: 32px;
        }
        
        /* 顏色選擇 */
        #stamp-custom-font-widget .scfw-colors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }
        
        #stamp-custom-font-widget .scfw-color-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        #stamp-custom-font-widget .scfw-color-main {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-color-main::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transition: all 0.6s;
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover::before {
            width: 100%;
            height: 100%;
        }
        
        #stamp-custom-font-widget .scfw-color-main:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        #stamp-custom-font-widget .scfw-color-main.selected {
            transform: scale(1.1);
            box-shadow: 
                0 8px 24px rgba(0, 0, 0, 0.2),
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
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        #stamp-custom-font-widget .scfw-color-shades {
            display: flex;
            gap: 4px;
        }
        
        #stamp-custom-font-widget .scfw-color-shade {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        #stamp-custom-font-widget .scfw-color-shade:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        /* 圖案選擇 */
        #stamp-custom-font-widget .scfw-patterns-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item {
            aspect-ratio: 1;
            background: rgba(255, 255, 255, 0.5);
            border: 2px solid transparent;
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
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.7);
            box-shadow: 0 6px 16px var(--shadow-color);
        }
        
        #stamp-custom-font-widget .scfw-pattern-item.selected {
            background: rgba(159, 178, 142, 0.15);
            border-color: var(--accent-color);
        }
        
        #stamp-custom-font-widget .scfw-pattern-svg {
            width: 32px;
            height: 32px;
            opacity: 0.7;
            transition: all 0.3s;
        }
        
        #stamp-custom-font-widget .scfw-pattern-item:hover .scfw-pattern-svg {
            opacity: 1;
            transform: scale(1.1);
        }
        
        #stamp-custom-font-widget .scfw-pattern-none {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
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
            border: 3px solid var(--glass-border);
            border-top-color: var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        #stamp-custom-font-widget .scfw-loading-text {
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* 自訂滾動條 */
        #stamp-custom-font-widget ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb {
            background: var(--glass-border);
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        
        #stamp-custom-font-widget ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-color);
            background-clip: padding-box;
        }
        
        /* 響應式設計 */
        @media (max-width: 1024px) {
            #stamp-custom-font-widget .scfw-content {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-options-panel {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 640px) {
            #stamp-custom-font-widget {
                padding: 20px;
            }
            
            #stamp-custom-font-widget .scfw-fonts-grid {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-options-panel {
                grid-template-columns: 1fr;
            }
            
            #stamp-custom-font-widget .scfw-preview-container {
                padding: 32px 20px;
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
                        <button class="scfw-category active" data-category="all">
                            <span>全部</span>
                        </button>
                        <button class="scfw-category" data-category="traditional">
                            <span>傳統</span>
                        </button>
                        <button class="scfw-category" data-category="handwrite">
                            <span>手寫</span>
                        </button>
                        <button class="scfw-category" data-category="modern">
                            <span>現代</span>
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
                    <div class="scfw-option-card glass-effect">
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
                    </div>
                    
                    <!-- 形狀選擇 -->
                    <div class="scfw-option-card glass-effect">
                        <div class="scfw-option-header">
                            <span class="material-icons">category</span>
                            印章形狀
                        </div>
                        <div class="scfw-shapes-grid" id="scfw-shapes-grid">
                            <!-- 動態生成 -->
                        </div>
                        <div class="scfw-border-styles" id="scfw-border-styles">
                            <!-- 動態生成 -->
                        </div>
                    </div>
                    
                    <!-- 顏色選擇 -->
                    <div class="scfw-option-card glass-effect">
                        <div class="scfw-option-header">
                            <span class="material-icons">palette</span>
                            印章顏色
                        </div>
                        <div class="scfw-colors-grid" id="scfw-colors-grid">
                            <!-- 動態生成 -->
                        </div>
                    </div>
                    
                    <!-- 圖案選擇 -->
                    <div class="scfw-option-card glass-effect">
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

    // 圖案 SVG 定義
    const patternSVGs = {
        none: '',
        flower: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 8c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 4.4 3.6 8 8 8 1.4 0 2.7-.4 3.8-1 .7 2.3 2.9 4 5.5 4 3.1 0 5.7-2.5 5.7-5.7 0-2.6-1.7-4.8-4-5.5.6-1.1 1-2.4 1-3.8 0-4.4-3.6-8-8-8s-8 3.6-8 8c0 1.4.4 2.7 1 3.8-2.3.7-4 2.9-4 5.5 0 3.1 2.5 5.7 5.7 5.7 2.6 0 4.8-1.7 5.5-4 1.1.6 2.4 1 3.8 1 4.4 0 8-3.6 8-8z"/>
        </svg>`,
        heart: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 28.7l-2.2-2C5.5 19.2 0 14.3 0 8.3 0 3.7 3.9 0 8.6 0c2.6 0 5.2 1.2 6.9 3.1C17.2 1.2 19.7 0 22.4 0 27.1 0 31 3.7 31 8.3c0 6-5.5 10.9-13.8 18.4l-2.2 2z"/>
        </svg>`,
        star: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 0l4.9 10.5L32 12.2l-8 8.2 1.9 11.6L16 26.5 6.1 32l1.9-11.6-8-8.2 11.1-1.7z"/>
        </svg>`,
        leaf: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M28 4c0 10.5-7.2 19-16 19-2.8 0-5.4-.9-7.7-2.4L2 23l2.4-2.3C2.9 18.4 2 15.8 2 13 2 5.8 8.3 0 16 0h12v4z"/>
        </svg>`,
        butterfly: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 14c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4s4 1.8 4 4v6c0 2.2-1.8 4-4 4zm-8 2c-4.4 0-8 3.6-8 8s3.6 8 8 8c2.1 0 4.1-.8 5.5-2.3l2.5-2.5 2.5 2.5c1.5 1.5 3.4 2.3 5.5 2.3 4.4 0 8-3.6 8-8s-3.6-8-8-8c-2.1 0-4.1.8-5.5 2.3L16 21l-2.5-2.5C12 17 10.1 16 8 16z"/>
        </svg>`,
        moon: `<svg viewBox="0 0 32 32" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c2.4 0 4.6-.8 6.3-2.2-.8.1-1.5.2-2.3.2-6.6 0-12-5.4-12-12 0-2.8 1-5.4 2.6-7.4C4.4 3.8 2 7.6 2 12c0 7.7 6.3 14 14 14s14-6.3 14-14S23.7 2 16 2c-1.5 0-2.9.2-4.3.7.7-.5 1.5-.7 2.3-.7z"/>
        </svg>`,
        sun: `<svg viewBox="0 0 32 32" fill="currentColor">
            <circle cx="16" cy="16" r="8"/>
            <path d="M16 0v6M16 26v6M32 16h-6M6 16H0M27.3 4.7l-4.2 4.2M8.9 23.1l-4.2 4.2M27.3 27.3l-4.2-4.2M8.9 8.9L4.7 4.7"/>
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
            font: '楷書',
            fontId: 8,
            shape: 'circle',
            borderStyle: 'solid',
            pattern: 'none',
            color: '#e57373',
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
                        dimensions = 'width: 70px; height: 50px;';
                        break;
                    case 'rectangle':
                        dimensions = 'width: 70px; height: 50px;';
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
                
                const strokeDasharray = style.id === 'dashed' ? '8,4' : 
                                       style.id === 'dotted' ? '2,3' : '0';
                
                item.innerHTML = `
                    <svg viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="14" fill="none" 
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
                if (index === 0) mainColor.classList.add('selected');
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
                
                group.shades.forEach(shade => {
                    const shadeDiv = document.createElement('div');
                    shadeDiv.className = 'scfw-color-shade';
                    shadeDiv.style.backgroundColor = shade;
                    shadeDiv.dataset.color = shade;
                    
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
            let dimensions = 'width: 180px; height: 180px;';
            
            switch(this.currentSelection.shape) {
                case 'circle':
                    shapeStyle = 'border-radius: 50%;';
                    break;
                case 'ellipse':
                    shapeStyle = 'border-radius: 50%;';
                    dimensions = 'width: 220px; height: 160px;';
                    break;
                case 'rectangle':
                    dimensions = 'width: 220px; height: 150px;';
                    break;
            }
            
            const fontFamily = font ? (font.systemFont || `CustomFont${font.id}`) : 'serif';
            
            preview.innerHTML = `
                <div style="
                    ${dimensions}
                    border: 5px ${this.currentSelection.borderStyle} ${this.currentSelection.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: white;
                    ${shapeStyle}
                ">
                    <span style="
                        font-family: ${fontFamily};
                        font-size: 48px;
                        color: ${this.currentSelection.color};
                        font-weight: bold;
                        text-align: center;
                    ">${this.currentSelection.text}</span>
                    ${pattern && pattern.id !== 'none' ? `
                        <div style="
                            position: absolute;
                            bottom: 12px;
                            right: 12px;
                            width: 32px;
                            height: 32px;
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
