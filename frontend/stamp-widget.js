/**
 * 印章預覽小工具 - 完整卡片化版本
 * @author DK0124
 * @version 7.0.0
 * @date 2025-01-29
 * @description 完全依賴後台資料，採用卡片化設計的印章預覽系統
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
                rel: 'preconnect',
                href: 'https://fonts.googleapis.com'
            },
            {
                rel: 'preconnect',
                href: 'https://fonts.gstatic.com',
                crossorigin: true
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap'
            }
        ];
        
        links.forEach(linkConfig => {
            const link = document.createElement('link');
            Object.assign(link, linkConfig);
            document.head.appendChild(link);
        });
    }
    
    // 樣式定義 - 與後台一致的卡片化設計
    const styles = `
        /* CSS 變數定義 - 與後台保持一致 */
        #stamp-font-widget-container {
            /* 主要色彩系統 */
            --sw-bg-primary: #dde5d6;
            --sw-bg-secondary: rgba(247, 236, 213, 0.8);
            --sw-bg-tertiary: rgba(255, 255, 255, 0.6);
            --sw-accent: #9fb28e;
            --sw-accent-hover: #8fa07e;
            --sw-accent-light: rgba(159, 178, 142, 0.1);
            --sw-secondary: #f7ecd5;
            --sw-text-primary: #84736a;
            --sw-text-secondary: #a09389;
            --sw-border: rgba(132, 115, 106, 0.2);
            
            /* 狀態顏色 */
            --sw-success: #81c784;
            --sw-warning: #ffb74d;
            --sw-danger: #e57373;
            --sw-info: #64b5f6;
            
            /* 玻璃效果 */
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-bg-heavy: rgba(255, 255, 255, 0.85);
            --glass-border: rgba(255, 255, 255, 0.3);
            --glass-shadow: 0 8px 32px rgba(132, 115, 106, 0.1);
            --glass-shadow-hover: 0 12px 40px rgba(132, 115, 106, 0.15);
            --glass-blur: blur(10px);
            --glass-blur-heavy: blur(20px);
            
            /* 間距與圓角 */
            --sw-spacing: 24px;
            --sw-radius: 16px;
            --sw-radius-sm: 12px;
            --sw-radius-lg: 24px;
            
            /* 動畫 */
            --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            
            /* 重置樣式 */
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans TC', 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        #stamp-font-widget-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #stamp-font-widget-container *::selection {
            background: rgba(159, 178, 142, 0.3);
            color: var(--sw-text-primary);
        }
        
        /* 主容器 */
        .stamp-widget-wrapper {
            background: var(--sw-bg-primary);
            border-radius: var(--sw-radius-lg);
            overflow: hidden;
            box-shadow: var(--glass-shadow);
            position: relative;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        /* 背景裝飾 */
        .stamp-widget-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(ellipse at top left, rgba(159, 178, 142, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(247, 236, 213, 0.2) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        
        /* 頂部裝飾條 */
        .stamp-widget-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--sw-accent) 0%, var(--sw-secondary) 50%, var(--sw-accent) 100%);
            background-size: 200% 100%;
            animation: gradient-shift 3s ease infinite;
            z-index: 1;
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* 標題區 */
        .sw-header {
            background: var(--glass-bg-heavy);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            padding: calc(var(--sw-spacing) * 0.75) var(--sw-spacing);
            border-bottom: 1px solid var(--glass-border);
            position: relative;
            z-index: 1;
            min-height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 0 rgba(132, 115, 106, 0.05);
        }
        
        .sw-header-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .sw-header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 28px;
            font-weight: 600;
            color: var(--sw-text-primary);
            letter-spacing: -0.5px;
        }
        
        .sw-header-title .material-icons {
            font-size: 36px;
            color: var(--sw-accent);
            background: var(--sw-accent-light);
            padding: 10px;
            border-radius: var(--sw-radius-sm);
        }
        
        /* 步驟指示器 */
        .sw-steps {
            display: flex;
            align-items: center;
            gap: 24px;
        }
        
        .sw-step {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--sw-text-secondary);
            font-size: 14px;
            font-weight: 500;
            transition: var(--transition-base);
        }
        
        .sw-step.active {
            color: var(--sw-accent);
        }
        
        .sw-step-number {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.5);
            border: 2px solid var(--sw-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            transition: var(--transition-base);
        }
        
        .sw-step.active .sw-step-number {
            background: var(--sw-accent);
            border-color: var(--sw-accent);
            color: white;
        }
        
        .sw-step.completed .sw-step-number {
            background: var(--sw-success);
            border-color: var(--sw-success);
            color: white;
        }
        
        .sw-step.completed .sw-step-number::after {
            content: '✓';
            font-size: 16px;
        }
        
        /* 主要內容區 */
        .sw-main-content {
            display: grid;
            grid-template-columns: 1fr 380px;
            position: relative;
            z-index: 1;
            min-height: 600px;
        }
        
        /* 左側控制區 */
        .sw-controls-section {
            padding: var(--sw-spacing);
            overflow-y: auto;
            max-height: calc(100vh - 200px);
        }
        
        /* 右側預覽區 */
        .sw-preview-section {
            background: linear-gradient(135deg, var(--sw-accent-light) 0%, rgba(247, 236, 213, 0.1) 100%);
            padding: calc(var(--sw-spacing) * 2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: sticky;
            top: 0;
            height: calc(100vh - 72px);
            max-height: 800px;
            overflow: hidden;
        }
        
        /* 預覽背景裝飾 */
        .sw-preview-section::before,
        .sw-preview-section::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
        }
        
        .sw-preview-section::before {
            width: 300px;
            height: 300px;
            background: var(--sw-accent);
            top: -150px;
            right: -100px;
            animation: float 20s ease-in-out infinite;
        }
        
        .sw-preview-section::after {
            width: 250px;
            height: 250px;
            background: var(--sw-secondary);
            bottom: -125px;
            left: -80px;
            animation: float 20s ease-in-out infinite reverse;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        /* Canvas 容器 */
        .sw-canvas-wrapper {
            background: var(--glass-bg-heavy);
            backdrop-filter: var(--glass-blur-heavy);
            -webkit-backdrop-filter: var(--glass-blur-heavy);
            border: 1px solid var(--glass-border);
            border-radius: var(--sw-radius-lg);
            padding: 40px;
            box-shadow: 
                var(--glass-shadow),
                inset 0 1px 0 var(--glass-border);
            position: relative;
            z-index: 1;
            transition: var(--transition-base);
        }
        
        .sw-canvas-wrapper:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: var(--glass-shadow-hover);
        }
        
        .sw-canvas {
            display: block;
            background: white;
            border-radius: var(--sw-radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            cursor: zoom-in;
        }
        
        /* 卡片樣式 - 與後台 admin-card 一致 */
        .sw-card {
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--glass-border);
            border-radius: var(--sw-radius);
            padding: calc(var(--sw-spacing) * 1.2);
            margin-bottom: var(--sw-spacing);
            box-shadow: var(--glass-shadow);
            transition: var(--transition-base);
            animation: cardEntry 0.4s ease backwards;
        }
        
        .sw-card:nth-child(1) { animation-delay: 0.1s; }
        .sw-card:nth-child(2) { animation-delay: 0.2s; }
        .sw-card:nth-child(3) { animation-delay: 0.3s; }
        .sw-card:nth-child(4) { animation-delay: 0.4s; }
        .sw-card:nth-child(5) { animation-delay: 0.5s; }
        
        @keyframes cardEntry {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .sw-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--glass-shadow-hover);
        }
        
        .sw-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: calc(var(--sw-spacing) * 0.8);
            padding-bottom: calc(var(--sw-spacing) * 0.8);
            border-bottom: 1px solid var(--sw-border);
        }
        
        .sw-card-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px;
            font-weight: 600;
            color: var(--sw-text-primary);
        }
        
        .sw-card-title .material-icons {
            color: var(--sw-accent);
            background: var(--sw-accent-light);
            padding: 8px;
            border-radius: var(--sw-radius-sm);
            font-size: 24px;
        }
        
        /* 文字輸入 */
        .sw-text-input-wrapper {
            position: relative;
        }
        
        .sw-text-input {
            width: 100%;
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            color: var(--sw-text-primary);
            font-size: 16px;
            font-weight: 400;
            transition: var(--transition-base);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            text-align: center;
            letter-spacing: 0.5px;
        }
        
        .sw-text-input:hover {
            background: white;
            border-color: var(--sw-border);
        }
        
        .sw-text-input:focus {
            outline: none;
            border-color: var(--sw-accent);
            background: white;
            box-shadow: 
                0 0 0 4px var(--sw-accent-light),
                0 2px 8px rgba(132, 115, 106, 0.1);
        }
        
        .sw-text-input::placeholder {
            color: var(--sw-text-secondary);
            opacity: 0.7;
        }
        
        /* 字數提示 */
        .sw-text-counter {
            position: absolute;
            right: 12px;
            bottom: -24px;
            font-size: 12px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        /* 搜尋框 */
        .sw-search-box {
            position: relative;
            margin-bottom: 16px;
        }
        
        .sw-search-input {
            width: 100%;
            padding: 10px 16px 10px 40px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid var(--sw-border);
            border-radius: var(--sw-radius-sm);
            font-size: 14px;
            color: var(--sw-text-primary);
            transition: var(--transition-base);
        }
        
        .sw-search-input:focus {
            outline: none;
            background: white;
            border-color: var(--sw-accent);
            box-shadow: 0 0 0 3px var(--sw-accent-light);
        }
        
        .sw-search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--sw-text-secondary);
            font-size: 18px;
            pointer-events: none;
        }
        
        /* 分類標籤 */
        .sw-categories {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 2px;
        }
        
        .sw-categories::-webkit-scrollbar {
            display: none;
        }
        
        .sw-category-tag {
            padding: 6px 16px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid var(--sw-border);
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: var(--sw-text-secondary);
            cursor: pointer;
            transition: var(--transition-base);
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        .sw-category-tag:hover {
            background: white;
            color: var(--sw-text-primary);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(132, 115, 106, 0.1);
        }
        
        .sw-category-tag.active {
            background: var(--sw-accent);
            color: white;
            border-color: var(--sw-accent);
        }
        
        /* 選項網格 */
        .sw-option-grid {
            display: grid;
            gap: 16px;
            max-height: 360px;
            overflow-y: auto;
            padding: 4px;
            scroll-behavior: smooth;
        }
        
        /* 字體網格 */
        .sw-fonts-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        /* 形狀網格 */
        .sw-shapes-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            max-height: 280px;
        }
        
        /* 顏色網格 */
        .sw-colors-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            max-height: 280px;
        }
        
        /* 圖案網格 */
        .sw-patterns-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            max-height: 280px;
        }
        
        /* 選項項目 */
        .sw-option-item {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 2px solid transparent;
            border-radius: var(--sw-radius);
            padding: 20px;
            text-align: center;
            transition: var(--transition-base);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            min-height: 120px;
            position: relative;
            overflow: hidden;
        }
        
        .sw-option-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--sw-accent), var(--sw-secondary));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .sw-option-item:hover {
            transform: translateY(-4px);
            box-shadow: var(--glass-shadow-hover);
            border-color: var(--sw-border);
        }
        
        .sw-option-item:hover::before {
            transform: scaleX(1);
        }
        
        .sw-option-item.selected {
            background: var(--sw-accent-light);
            border-color: var(--sw-accent);
            box-shadow: 0 0 0 3px rgba(159, 178, 142, 0.2);
        }
        
        .sw-option-item.selected::after {
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
            animation: scaleIn 0.3s ease;
        }
        
        @keyframes scaleIn {
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
            font-size: 32px;
            color: var(--sw-text-primary);
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition-base);
            letter-spacing: 0.5px;
        }
        
        .sw-option-item:hover .sw-font-preview {
            transform: scale(1.05);
        }
        
        .sw-font-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--sw-text-secondary);
            word-break: break-word;
        }
        
        .sw-font-category {
            font-size: 11px;
            color: var(--sw-text-secondary);
            opacity: 0.7;
            font-weight: 500;
            padding: 2px 8px;
            background: rgba(132, 115, 106, 0.1);
            border-radius: 12px;
        }
        
        /* 形狀預覽 */
        .sw-shape-preview {
            width: 80px;
            height: 80px;
            border: 3px solid var(--sw-text-primary);
            transition: var(--transition-base);
            position: relative;
        }
        
        .sw-shape-preview img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: grayscale(1) opacity(0.8);
            transition: var(--transition-base);
        }
        
        .sw-option-item:hover .sw-shape-preview {
            border-color: var(--sw-accent);
            transform: scale(1.1) rotate(5deg);
        }
        
        .sw-option-item:hover .sw-shape-preview img {
            filter: grayscale(0) opacity(1);
        }
        
        .sw-shape-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--sw-text-primary);
        }
        
        /* 邊框樣式選擇 */
        .sw-border-styles {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: var(--sw-radius-sm);
            overflow-x: auto;
        }
        
        .sw-border-style {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.7);
            border: 2px solid transparent;
            border-radius: var(--sw-radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition-base);
            flex-shrink: 0;
        }
        
        .sw-border-style:hover {
            transform: scale(1.1);
            background: white;
            box-shadow: 0 4px 12px rgba(132, 115, 106, 0.1);
        }
        
        .sw-border-style.selected {
            background: var(--sw-accent);
            border-color: var(--sw-accent);
        }
        
        .sw-border-style svg {
            width: 32px;
            height: 32px;
        }
        
        /* 顏色預覽 */
        .sw-color-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .sw-color-preview {
            width: 64px;
            height: 64px;
            border-radius: var(--sw-radius-sm);
            box-shadow: 
                0 4px 12px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
            transition: var(--transition-base);
            cursor: pointer;
        }
        
        .sw-color-preview::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
        }
        
        .sw-option-item:hover .sw-color-preview::after {
            width: 100px;
            height: 100px;
        }
        
        .sw-color-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--sw-text-primary);
        }
        
        .sw-color-shades {
            display: flex;
            gap: 4px;
            justify-content: center;
        }
        
        .sw-color-shade {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: var(--transition-base);
        }
        
        .sw-color-shade:hover {
            transform: scale(1.3);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        /* 圖案預覽 */
        .sw-pattern-preview {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--sw-radius-sm);
            background: rgba(0, 0, 0, 0.05);
            overflow: hidden;
            position: relative;
        }
        
        .sw-pattern-preview img {
            max-width: 48px;
            max-height: 48px;
            object-fit: contain;
            opacity: 0.8;
            transition: var(--transition-base);
        }
        
        .sw-option-item:hover .sw-pattern-preview img {
            transform: scale(1.2) rotate(10deg);
            opacity: 1;
        }
        
        .sw-pattern-none {
            font-size: 14px;
            font-weight: 600;
            color: var(--sw-text-secondary);
            opacity: 0.7;
        }
        
        /* 按鈕樣式 */
        .sw-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--sw-accent);
            color: white;
            border: none;
            border-radius: var(--sw-radius-sm);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-base);
            text-decoration: none;
            letter-spacing: -0.2px;
            box-shadow: 0 2px 8px rgba(159, 178, 142, 0.2);
            position: relative;
            overflow: hidden;
        }
        
        .sw-btn::before {
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
        }
        
        .sw-btn:active::before {
            width: 300px;
            height: 300px;
        }
        
        .sw-btn:hover {
            background: var(--sw-accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(159, 178, 142, 0.3);
        }
        
        .sw-btn:active {
            transform: translateY(0);
        }
        
        .sw-btn .material-icons {
            font-size: 20px;
        }
        
        /* 按鈕變體 */
        .sw-btn-secondary { 
            background: rgba(255, 255, 255, 0.9);
            color: var(--sw-text-primary);
            box-shadow: 0 2px 8px rgba(132, 115, 106, 0.1);
        }
        
        .sw-btn-secondary:hover {
            background: white;
            box-shadow: 0 4px 16px rgba(132, 115, 106, 0.15);
        }
        
        .sw-btn-lg {
            padding: 16px 32px;
            font-size: 16px;
        }
        
        .sw-btn-block {
            width: 100%;
        }
        
        /* 下載區域 */
        .sw-download-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-top: 32px;
        }
        
        .sw-download-info {
            font-size: 14px;
            color: var(--sw-text-secondary);
            text-align: center;
            line-height: 1.6;
        }
        
        .sw-download-options {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        /* 載入狀態 */
        .sw-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 600px;
            padding: 40px;
            gap: 20px;
        }
        
        .sw-loading-spinner {
            width: 64px;
            height: 64px;
            border: 4px solid var(--glass-border);
            border-top-color: var(--sw-accent);
            border-radius: 50%;
            animation: sw-spin 1s linear infinite;
        }
        
        @keyframes sw-spin {
            to { transform: rotate(360deg); }
        }
        
        .sw-loading-text {
            font-size: 18px;
            color: var(--sw-text-secondary);
            font-weight: 500;
        }
        
        .sw-loading-progress {
            width: 200px;
            height: 4px;
            background: var(--sw-border);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .sw-loading-progress-bar {
            height: 100%;
            background: var(--sw-accent);
            border-radius: 2px;
            animation: loading 2s ease-in-out infinite;
        }
        
        @keyframes loading {
            0% { width: 0; transform: translateX(0); }
            50% { width: 100%; transform: translateX(0); }
            100% { width: 100%; transform: translateX(100%); }
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
            animation: sw-pulse 2s ease-in-out infinite;
        }
        
        @keyframes sw-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.95); }
        }
        
        .sw-error-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--sw-text-primary);
            margin-bottom: 12px;
        }
        
        .sw-error-message {
            font-size: 16px;
            color: var(--sw-text-secondary);
            margin-bottom: 24px;
            max-width: 400px;
            line-height: 1.6;
        }
        
        /* 空狀態 */
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
            color: var(--sw-text-secondary);
            margin-bottom: 24px;
            opacity: 0.5;
        }
        
        /* 通知提示 */
        .sw-notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--glass-bg-heavy);
            backdrop-filter: var(--glass-blur-heavy);
            -webkit-backdrop-filter: var(--glass-blur-heavy);
            border: 1px solid var(--glass-border);
            padding: 16px 24px;
            border-radius: var(--sw-radius-sm);
            box-shadow: var(--glass-shadow);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            position: relative;
            overflow: hidden;
            z-index: 5000;
        }
        
        .sw-notification::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--sw-accent);
        }
        
        .sw-notification.success::before { background: var(--sw-success); }
        .sw-notification.warning::before { background: var(--sw-warning); }
        .sw-notification.danger::before { background: var(--sw-danger); }
        .sw-notification.info::before { background: var(--sw-info); }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* 提示工具 */
        .sw-tooltip {
            position: absolute;
            background: var(--glass-bg-heavy);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--glass-border);
            padding: 8px 12px;
            border-radius: var(--sw-radius-sm);
            font-size: 12px;
            color: var(--sw-text-primary);
            box-shadow: 0 4px 12px rgba(132, 115, 106, 0.1);
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .sw-tooltip.show {
            opacity: 1;
        }
        
        /* 滾動條美化 */
        .sw-option-grid::-webkit-scrollbar {
            width: 6px;
        }
        
        .sw-option-grid::-webkit-scrollbar-track {
            background: rgba(132, 115, 106, 0.05);
            border-radius: 3px;
        }
        
        .sw-option-grid::-webkit-scrollbar-thumb {
            background: var(--sw-border);
            border-radius: 3px;
            transition: background 0.3s;
        }
        
        .sw-option-grid::-webkit-scrollbar-thumb:hover {
            background: var(--sw-accent);
        }
        
        /* 模態框 */
        .sw-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(132, 115, 106, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 4000;
            align-items: center;
            justify-content: center;
            padding: var(--sw-spacing);
        }
        
        .sw-modal.active {
            display: flex;
            animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .sw-modal-content {
            background: var(--glass-bg-heavy);
            backdrop-filter: var(--glass-blur-heavy);
            -webkit-backdrop-filter: var(--glass-blur-heavy);
            border-radius: var(--sw-radius-lg);
            padding: 32px;
            max-width: 800px;
            max-height: 90vh;
            overflow: auto;
            box-shadow: 
                0 24px 48px rgba(132, 115, 106, 0.2),
                inset 0 1px 0 var(--glass-border);
            border: 1px solid var(--glass-border);
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* 響應式設計 */
        @media (max-width: 1200px) {
            .sw-main-content {
                grid-template-columns: 1fr;
            }
            
            .sw-preview-section {
                position: relative;
                height: auto;
                min-height: 400px;
                padding: var(--sw-spacing);
            }
            
            .sw-controls-section {
                max-height: none;
            }
        }
        
        @media (max-width: 768px) {
            .sw-header {
                flex-direction: column;
                gap: 16px;
                padding: 16px;
            }
            
            .sw-steps {
                display: none;
            }
            
            .sw-fonts-grid {
                grid-template-columns: 1fr;
            }
            
            .sw-shapes-grid,
            .sw-colors-grid,
            .sw-patterns-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            }
            
            .sw-canvas-wrapper {
                padding: 24px;
            }
            
            .sw-card {
                padding: 20px;
            }
            
            .sw-option-item {
                padding: 16px;
                min-height: 100px;
            }
            
            .sw-font-preview {
                font-size: 24px;
            }
            
            .sw-shape-preview {
                width: 60px;
                height: 60px;
            }
            
            .sw-color-preview {
                width: 48px;
                height: 48px;
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
            letter-spacing: 2px;
        }
        
        /* 截圖保護層 */
        .sw-screenshot-protection {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            z-index: 10000;
            font-size: 24px;
            font-weight: 500;
        }
        
        .sw-screenshot-protection .material-icons {
            font-size: 72px;
            opacity: 0.8;
        }
        
        /* 開發者工具警告 */
        .sw-devtools-warning {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--sw-danger);
            color: white;
            padding: 24px 32px;
            border-radius: var(--sw-radius);
            box-shadow: 0 8px 32px rgba(229, 115, 115, 0.3);
            display: none;
            text-align: center;
            z-index: 10000;
        }
        
        /* 禁止列印樣式 */
        @media print {
            #stamp-font-widget-container {
                display: none !important;
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
        
        // 建立 GitHub Raw URL
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
        
        // 顯示通知
        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `sw-notification ${type}`;
            notification.innerHTML = `
                <span class="material-icons">
                    ${type === 'success' ? 'check_circle' : 
                      type === 'warning' ? 'warning' : 
                      type === 'danger' ? 'error' : 'info'}
                </span>
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
        
        // 載入中狀態
        loadingElement() {
            return `
                <div class="sw-loading">
                    <div class="sw-loading-spinner"></div>
                    <div class="sw-loading-text">正在載入印章系統...</div>
                    <div class="sw-loading-progress">
                        <div class="sw-loading-progress-bar"></div>
                    </div>
                </div>
            `;
        },
        
        // 錯誤狀態
        errorElement(message) {
            return `
                <div class="sw-error">
                    <div class="material-icons sw-error-icon">error_outline</div>
                    <div class="sw-error-title">載入失敗</div>
                    <div class="sw-error-message">${message}</div>
                    <button class="sw-btn" onclick="location.reload()">
                        <span class="material-icons">refresh</span>
                        重新載入
                    </button>
                </div>
            `;
        },
        
        // 空狀態
        emptyElement() {
            return `
                <div class="sw-empty">
                    <div class="material-icons sw-empty-icon">inbox</div>
                    <div class="sw-error-title">尚未設定內容</div>
                    <div class="sw-error-message">
                        請先到後台管理系統上傳字體、形狀、顏色等資源
                    </div>
                </div>
            `;
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
            
            // 初始化狀態
            this.config = null;
            this.currentSelection = {
                text: '範例印章',
                font: null,
                shape: null,
                color: null,
                pattern: null,
                borderStyle: 'solid',
                category: 'all'
            };
            
            this.loadedFonts = new Map();
            this.canvas = null;
            this.ctx = null;
            this.categories = new Set(['all']);
            this.currentStep = 1;
            
            // 開始初始化
            this.init();
        }
        
        async init() {
            try {
                // 顯示載入狀態
                this.showLoading();
                
                // 載入配置
                const configLoaded = await this.loadConfig();
                
                if (!configLoaded) {
                    throw new Error('無法載入系統設定');
                }
                
                // 檢查是否有資料
                if (!this.hasData()) {
                    this.showEmpty();
                    return;
                }
                
                // 建立介面
                this.render();
                
                // 初始化功能
                this.initCanvas();
                this.bindEvents();
                
                // 載入資源
                await this.loadResources();
                
                // 套用安全設定
                this.applySecuritySettings();
                
                // 初始預覽
                this.updatePreview();
                
                // 顯示歡迎訊息
                Utils.showNotification('印章系統已就緒', 'success');
                
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
                console.log('✅ 設定載入成功:', config);
                
                this.config = config;
                
                // 提取分類
                if (config.fonts) {
                    config.fonts.forEach(font => {
                        if (font.category) {
                            this.categories.add(font.category);
                        }
                    });
                }
                
                // 設定預設選項（不預設選擇）
                this.currentSelection = {
                    text: '範例印章',
                    font: null,
                    shape: null,
                    color: null,
                    pattern: null,
                    borderStyle: 'solid',
                    category: 'all'
                };
                
                return true;
                
            } catch (error) {
                console.error('❌ 載入設定失敗:', error);
                return false;
            }
        }
        
        hasData() {
            return this.config && (
                this.config.fonts?.length > 0 ||
                this.config.shapes?.length > 0 ||
                this.config.colors?.length > 0 ||
                this.config.patterns?.length > 0
            );
        }
        
        showLoading() {
            this.container.innerHTML = `
                <div class="stamp-widget-wrapper">
                    ${Utils.loadingElement()}
                </div>
            `;
        }
        
        showError(message) {
            this.container.innerHTML = `
                <div class="stamp-widget-wrapper">
                    ${Utils.errorElement(message)}
                </div>
            `;
        }
        
        showEmpty() {
            this.container.innerHTML = `
                <div class="stamp-widget-wrapper">
                    ${Utils.emptyElement()}
                </div>
            `;
        }
        
        render() {
            const widgetId = `sw_${Date.now()}`;
            this.widgetId = widgetId;
            
            this.container.innerHTML = `
                <div class="stamp-widget-wrapper">
                    <!-- 標題區 -->
                    <div class="sw-header">
                        <div class="sw-header-content">
                            <h1 class="sw-header-title">
                                <span class="material-icons">verified</span>
                                印章預覽系統
                            </h1>
                        </div>
                        
                        <!-- 步驟指示器 -->
                        <div class="sw-steps">
                            <div class="sw-step active" data-step="1">
                                <div class="sw-step-number">1</div>
                                <span>輸入文字</span>
                            </div>
                            <div class="sw-step" data-step="2">
                                <div class="sw-step-number">2</div>
                                <span>選擇字體</span>
                            </div>
                            <div class="sw-step" data-step="3">
                                <div class="sw-step-number">3</div>
                                <span>選擇樣式</span>
                            </div>
                            <div class="sw-step" data-step="4">
                                <div class="sw-step-number">4</div>
                                <span>下載印章</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 主要內容 -->
                    <div class="sw-main-content">
                        <!-- 左側控制區 -->
                        <div class="sw-controls-section">
                            <!-- 文字輸入卡片 -->
                            <div class="sw-card">
                                <div class="sw-card-header">
                                    <div class="sw-card-title">
                                        <span class="material-icons">edit</span>
                                        印章文字
                                    </div>
                                </div>
                                <div class="sw-text-input-wrapper">
                                    <input type="text" 
                                           class="sw-text-input" 
                                           id="text-${widgetId}"
                                           placeholder="請輸入印章文字（最多6字）" 
                                           maxlength="6" 
                                           value="${this.currentSelection.text}">
                                    <span class="sw-text-counter" id="text-counter-${widgetId}">
                                        ${this.currentSelection.text.length} / 6 字
                                    </span>
                                </div>
                            </div>
                            
                            <!-- 字體選擇卡片 -->
                            ${this.renderFontsCard(widgetId)}
                            
                            <!-- 形狀選擇卡片 -->
                            ${this.renderShapesCard(widgetId)}
                            
                            <!-- 顏色選擇卡片 -->
                            ${this.renderColorsCard(widgetId)}
                            
                            <!-- 圖案選擇卡片 -->
                            ${this.renderPatternsCard(widgetId)}
                        </div>
                        
                        <!-- 右側預覽區 -->
                        <div class="sw-preview-section">
                            <div class="sw-canvas-wrapper">
                                <canvas id="canvas-${widgetId}" 
                                        class="sw-canvas" 
                                        width="300" 
                                        height="300">
                                </canvas>
                            </div>
                            
                            <div class="sw-download-section">
                                <button class="sw-btn sw-btn-lg" id="download-${widgetId}">
                                    <span class="material-icons">download</span>
                                    下載印章圖片
                                </button>
                                <div class="sw-download-options">
                                    <button class="sw-btn sw-btn-secondary" onclick="StampWidget.instance.downloadStamp('png')">
                                        PNG (透明背景)
                                    </button>
                                    <button class="sw-btn sw-btn-secondary" onclick="StampWidget.instance.downloadStamp('jpg')">
                                        JPG (白色背景)
                                    </button>
                                </div>
                                <div class="sw-download-info">
                                    將以高解析度下載您的專屬印章圖片<br>
                                    建議用於文件、合約或其他正式用途
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 截圖保護層 -->
                <div class="sw-screenshot-protection" id="screenshot-protection-${widgetId}">
                    <span class="material-icons">no_photography</span>
                    <div>禁止截圖</div>
                </div>
                
                <!-- 開發者工具警告 -->
                <div class="sw-devtools-warning" id="devtools-warning-${widgetId}">
                    <div>⚠️ 偵測到開發者工具</div>
                    <div style="font-size: 16px; margin-top: 8px;">本系統內容受版權保護</div>
                </div>
            `;
            
            // 保存實例以供全域存取
            StampWidget.instance = this;
        }
        
        renderFontsCard(widgetId) {
            if (!this.config.fonts?.length) return '';
            
            return `
                <div class="sw-card">
                    <div class="sw-card-header">
                        <div class="sw-card-title">
                            <span class="material-icons">text_fields</span>
                            選擇字體
                        </div>
                        <span style="font-size: 14px; color: var(--sw-text-secondary);">
                            共 ${this.config.fonts.length} 種字體
                        </span>
                    </div>
                    
                    ${this.categories.size > 2 ? `
                    <div class="sw-categories" id="font-categories-${widgetId}">
                        ${Array.from(this.categories).map(cat => `
                            <div class="sw-category-tag ${cat === 'all' ? 'active' : ''}" 
                                 data-category="${cat}">
                                ${cat === 'all' ? '全部' : 
                                  cat === 'traditional' ? '傳統字體' :
                                  cat === 'modern' ? '現代字體' :
                                  cat === 'handwrite' ? '手寫字體' :
                                  cat === 'custom' ? '自訂字體' : cat}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="sw-search-box">
                        <span class="material-icons sw-search-icon">search</span>
                        <input type="text" 
                               class="sw-search-input" 
                               id="font-search-${widgetId}"
                               placeholder="搜尋字體...">
                    </div>
                    
                    <div class="sw-option-grid sw-fonts-grid" id="fonts-grid-${widgetId}">
                        ${this.config.fonts.map((font, index) => `
                            <div class="sw-option-item sw-font-item" 
                                 data-font-index="${index}"
                                 data-font-name="${font.displayName || font.name}"
                                 data-font-category="${font.category || 'custom'}">
                                <div class="sw-font-preview" id="font-preview-${widgetId}-${index}">
                                    <span style="opacity: 0.3;">載入中...</span>
                                </div>
                                <div class="sw-font-name">${font.displayName || font.name}</div>
                                ${font.category ? `<div class="sw-font-category">${font.category}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        renderShapesCard(widgetId) {
            if (!this.config.shapes?.length) return '';
            
            return `
                <div class="sw-card">
                    <div class="sw-card-header">
                        <div class="sw-card-title">
                            <span class="material-icons">category</span>
                            選擇形狀
                        </div>
                    </div>
                    
                    <div class="sw-option-grid sw-shapes-grid" id="shapes-grid-${widgetId}">
                        ${this.config.shapes.map((shape, index) => {
                            let shapeStyle = '';
                            let shapeContent = '';
                            
                            if (shape.githubPath) {
                                // 使用上傳的形狀圖片
                                const imgUrl = Utils.getGitHubRawUrl(shape.githubPath);
                                shapeContent = `<img src="${imgUrl}" alt="${shape.name}">`;
                            } else {
                                // 使用預設形狀
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
                            }
                            
                            return `
                                <div class="sw-option-item" 
                                     data-shape-index="${index}">
                                    <div class="sw-shape-preview" style="${shapeStyle}">
                                        ${shapeContent}
                                    </div>
                                    <div class="sw-shape-name">${shape.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- 邊框樣式選擇 -->
                    <div style="margin-top: 20px;">
                        <div style="font-size: 14px; font-weight: 600; color: var(--sw-text-primary); margin-bottom: 12px;">
                            邊框樣式
                        </div>
                        <div class="sw-border-styles" id="border-styles-${widgetId}">
                            <div class="sw-border-style selected" data-style="solid">
                                <svg viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="12" fill="none" 
                                            stroke="currentColor" stroke-width="2" />
                                </svg>
                            </div>
                            <div class="sw-border-style" data-style="double">
                                <svg viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="10" fill="none" 
                                            stroke="currentColor" stroke-width="1" />
                                    <circle cx="16" cy="16" r="14" fill="none" 
                                            stroke="currentColor" stroke-width="1" />
                                </svg>
                            </div>
                            <div class="sw-border-style" data-style="dashed">
                                <svg viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="12" fill="none" 
                                            stroke="currentColor" stroke-width="2" 
                                            stroke-dasharray="4,2" />
                                </svg>
                            </div>
                            <div class="sw-border-style" data-style="dotted">
                                <svg viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="12" fill="none" 
                                            stroke="currentColor" stroke-width="2" 
                                            stroke-dasharray="1,2" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        renderColorsCard(widgetId) {
            if (!this.config.colors?.length) return '';
            
            return `
                <div class="sw-card">
                    <div class="sw-card-header">
                        <div class="sw-card-title">
                            <span class="material-icons">palette</span>
                            選擇顏色
                        </div>
                    </div>
                    
                    <div class="sw-option-grid sw-colors-grid" id="colors-grid-${widgetId}">
                        ${this.config.colors.map((color, index) => `
                            <div class="sw-option-item sw-color-item" 
                                 data-color-index="${index}">
                                <div class="sw-color-group">
                                    <div class="sw-color-preview" 
                                         style="background: ${color.main};"
                                         data-color="${color.main}"></div>
                                    ${color.shades && color.shades.length > 1 ? `
                                    <div class="sw-color-shades">
                                        ${color.shades.map(shade => `
                                            <div class="sw-color-shade" 
                                                 style="background: ${shade};"
                                                 data-color="${shade}"></div>
                                        `).join('')}
                                    </div>
                                    ` : ''}
                                </div>
                                <div class="sw-color-name">${color.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        renderPatternsCard(widgetId) {
            if (!this.config.patterns?.length) return '';
            
            return `
                <div class="sw-card">
                    <div class="sw-card-header">
                        <div class="sw-card-title">
                            <span class="material-icons">texture</span>
                            選擇圖案 (選填)
                        </div>
                    </div>
                    
                    <div class="sw-option-grid sw-patterns-grid" id="patterns-grid-${widgetId}">
                        <div class="sw-option-item selected" 
                             data-pattern-index="-1">
                            <div class="sw-pattern-preview">
                                <span class="sw-pattern-none">無圖案</span>
                            </div>
                            <div class="sw-color-name">不使用</div>
                        </div>
                        ${this.config.patterns.map((pattern, index) => {
                            const imgUrl = pattern.githubPath ? 
                                Utils.getGitHubRawUrl(pattern.githubPath) : '';
                            
                            return `
                                <div class="sw-option-item" 
                                     data-pattern-index="${index}">
                                    <div class="sw-pattern-preview">
                                        ${imgUrl ? 
                                            `<img src="${imgUrl}" alt="${pattern.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'sw-pattern-none\\'>?</span>'">` :
                                            `<span class="sw-pattern-none">?</span>`
                                        }
                                    </div>
                                    <div class="sw-color-name">${pattern.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        bindEvents() {
            const widgetId = this.widgetId;
            
            // 文字輸入
            const textInput = document.getElementById(`text-${widgetId}`);
            const textCounter = document.getElementById(`text-counter-${widgetId}`);
            
            if (textInput) {
                textInput.addEventListener('input', Utils.debounce((e) => {
                    this.currentSelection.text = e.target.value || '範例印章';
                    textCounter.textContent = `${e.target.value.length} / 6 字`;
                    this.updatePreview();
                    this.updateFontPreviews();
                    this.updateStep(1);
                }, 300));
                
                textInput.addEventListener('focus', () => {
                    this.updateStep(1);
                });
            }
            
            // 字體分類
            const fontCategories = document.getElementById(`font-categories-${widgetId}`);
            if (fontCategories) {
                fontCategories.addEventListener('click', (e) => {
                    const tag = e.target.closest('.sw-category-tag');
                    if (tag) {
                        fontCategories.querySelectorAll('.sw-category-tag').forEach(t => 
                            t.classList.remove('active')
                        );
                        tag.classList.add('active');
                        this.filterFonts(tag.dataset.category);
                    }
                });
            }
            
            // 字體搜尋
            const fontSearch = document.getElementById(`font-search-${widgetId}`);
            if (fontSearch) {
                fontSearch.addEventListener('input', Utils.debounce((e) => {
                    this.searchFonts(e.target.value);
                }, 300));
            }
            
            // 字體選擇
            const fontsGrid = document.getElementById(`fonts-grid-${widgetId}`);
            if (fontsGrid) {
                fontsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.fontIndex);
                        this.selectFont(index);
                        this.updateStep(2);
                    }
                });
            }
            
            // 形狀選擇
            const shapesGrid = document.getElementById(`shapes-grid-${widgetId}`);
            if (shapesGrid) {
                shapesGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.shapeIndex);
                        this.selectShape(index);
                        this.updateStep(3);
                    }
                });
            }
            
            // 邊框樣式選擇
            const borderStyles = document.getElementById(`border-styles-${widgetId}`);
            if (borderStyles) {
                borderStyles.addEventListener('click', (e) => {
                    const style = e.target.closest('.sw-border-style');
                    if (style) {
                        borderStyles.querySelectorAll('.sw-border-style').forEach(s => 
                            s.classList.remove('selected')
                        );
                        style.classList.add('selected');
                        this.currentSelection.borderStyle = style.dataset.style;
                        this.updatePreview();
                    }
                });
            }
            
            // 顏色選擇
            const colorsGrid = document.getElementById(`colors-grid-${widgetId}`);
            if (colorsGrid) {
                colorsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    const colorPreview = e.target.closest('.sw-color-preview');
                    const colorShade = e.target.closest('.sw-color-shade');
                    
                    if (item && (colorPreview || colorShade)) {
                        const index = parseInt(item.dataset.colorIndex);
                        const color = (colorPreview || colorShade).dataset.color;
                        this.selectColor(index, color);
                        this.updateStep(3);
                    }
                });
            }
            
            // 圖案選擇
            const patternsGrid = document.getElementById(`patterns-grid-${widgetId}`);
            if (patternsGrid) {
                patternsGrid.addEventListener('click', (e) => {
                    const item = e.target.closest('.sw-option-item');
                    if (item) {
                        const index = parseInt(item.dataset.patternIndex);
                        this.selectPattern(index);
                    }
                });
            }
            
            // 下載按鈕
            const downloadBtn = document.getElementById(`download-${widgetId}`);
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.downloadStamp();
                    this.updateStep(4);
                });
            }
            
            // 雙擊預覽區放大
            const canvasWrapper = document.querySelector('.sw-canvas-wrapper');
            if (canvasWrapper) {
                canvasWrapper.addEventListener('dblclick', () => {
                    this.showPreviewModal();
                });
            }
            
            // Canvas hover 效果
            if (this.canvas) {
                this.canvas.addEventListener('mouseenter', () => {
                    this.canvas.style.cursor = 'zoom-in';
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
            // 載入字體
            if (this.config.fonts?.length > 0) {
                await this.loadFonts();
            }
            
            // 預載圖案
            if (this.config.patterns?.length > 0) {
                this.preloadPatterns();
            }
            
            // 預載形狀圖片
            if (this.config.shapes?.length > 0) {
                this.preloadShapes();
            }
        }
        
        async loadFonts() {
            const widgetId = this.widgetId;
            const loadPromises = [];
            
            for (let i = 0; i < this.config.fonts.length; i++) {
                const font = this.config.fonts[i];
                const preview = document.getElementById(`font-preview-${widgetId}-${i}`);
                
                const loadPromise = this.loadFont(font).then(success => {
                    if (preview) {
                        if (success) {
                            preview.innerHTML = `<span style="font-family: CustomFont${font.id}, serif; font-weight: ${font.weight || 'normal'};">
                                ${this.currentSelection.text.substring(0, 2) || '印'}
                            </span>`;
                        } else {
                            preview.innerHTML = '<span style="color: var(--sw-danger); font-size: 14px;">載入失敗</span>';
                        }
                    }
                }).catch(error => {
                    console.error(`載入字體失敗: ${font.name}`, error);
                    if (preview) {
                        preview.innerHTML = '<span style="color: var(--sw-danger); font-size: 14px;">載入失敗</span>';
                    }
                });
                
                loadPromises.push(loadPromise);
            }
            
            await Promise.all(loadPromises);
        }
        
        async loadFont(fontData) {
            try {
                // 檢查是否已載入
                if (this.loadedFonts.has(fontData.id)) {
                    return true;
                }
                
                // 系統字體直接使用
                if (fontData.systemFont) {
                    this.loadedFonts.set(fontData.id, { systemFont: fontData.systemFont });
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
                
                console.log(`載入字體: ${fontData.name} from ${fontUrl}`);
                
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
                console.log(`✅ 字體載入成功: ${fontData.name}`);
                
                return true;
                
            } catch (error) {
                console.error(`❌ 載入字體失敗: ${fontData.name}`, error);
                return false;
            }
        }
        
        preloadPatterns() {
            this.config.patterns.forEach(pattern => {
                if (pattern.githubPath) {
                    const img = new Image();
                    img.src = Utils.getGitHubRawUrl(pattern.githubPath);
                }
            });
        }
        
        preloadShapes() {
            this.config.shapes.forEach(shape => {
                if (shape.githubPath) {
                    const img = new Image();
                    img.src = Utils.getGitHubRawUrl(shape.githubPath);
                }
            });
        }
        
        filterFonts(category) {
            const fontItems = document.querySelectorAll('.sw-font-item');
            
            fontItems.forEach(item => {
                if (category === 'all' || item.dataset.fontCategory === category) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }
        
        searchFonts(query) {
            const fontItems = document.querySelectorAll('.sw-font-item');
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
                document.querySelectorAll(`#fonts-grid-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
                Utils.showNotification(`已選擇字體: ${this.currentSelection.font.displayName || this.currentSelection.font.name}`, 'info');
            }
        }
        
        selectShape(index) {
            if (index >= 0 && index < this.config.shapes.length) {
                this.currentSelection.shape = this.config.shapes[index];
                
                // 更新選中狀態
                document.querySelectorAll(`#shapes-grid-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                this.updatePreview();
                Utils.showNotification(`已選擇形狀: ${this.currentSelection.shape.name}`, 'info');
            }
        }
        
        selectColor(index, color) {
            if (index >= 0 && index < this.config.colors.length) {
                this.currentSelection.color = { ...this.config.colors[index], selected: color };
                
                // 更新選中狀態
                document.querySelectorAll(`#colors-grid-${this.widgetId} .sw-option-item`).forEach((item, i) => {
                    item.classList.toggle('selected', i === index);
                });
                
                // 更新邊框樣式顏色
                this.updateBorderStyleColors();
                
                this.updatePreview();
                Utils.showNotification(`已選擇顏色: ${this.config.colors[index].name}`, 'info');
            }
        }
        
        selectPattern(index) {
            if (index === -1) {
                this.currentSelection.pattern = null;
            } else if (index >= 0 && index < this.config.patterns.length) {
                this.currentSelection.pattern = this.config.patterns[index];
            }
            
            // 更新選中狀態
            document.querySelectorAll(`#patterns-grid-${this.widgetId} .sw-option-item`).forEach((item) => {
                const itemIndex = parseInt(item.dataset.patternIndex);
                item.classList.toggle('selected', itemIndex === index);
            });
            
            this.updatePreview();
            
            if (index === -1) {
                Utils.showNotification('已移除圖案', 'info');
            } else {
                Utils.showNotification(`已選擇圖案: ${this.currentSelection.pattern.name}`, 'info');
            }
        }
        
        updateBorderStyleColors() {
            const color = this.currentSelection.color?.selected || this.currentSelection.color?.main || '#9fb28e';
            
            document.querySelectorAll('.sw-border-style svg').forEach(svg => {
                svg.style.color = color;
            });
        }
        
        updateFontPreviews() {
            const widgetId = this.widgetId;
            const text = this.currentSelection.text.substring(0, 2) || '印';
            
            this.config.fonts?.forEach((font, index) => {
                const preview = document.getElementById(`font-preview-${widgetId}-${index}`);
                if (preview && preview.querySelector('span') && !preview.querySelector('span').style.opacity) {
                    preview.querySelector('span').textContent = text;
                }
            });
        }
        
        updateStep(step) {
            if (step > this.currentStep) {
                this.currentStep = step;
            }
            
            document.querySelectorAll('.sw-step').forEach(stepEl => {
                const stepNum = parseInt(stepEl.dataset.step);
                stepEl.classList.remove('active', 'completed');
                
                if (stepNum < this.currentStep) {
                    stepEl.classList.add('completed');
                } else if (stepNum === this.currentStep) {
                    stepEl.classList.add('active');
                }
            });
        }
        
        updatePreview() {
            if (!this.canvas || !this.ctx) return;
            
            const ctx = this.ctx;
            const width = 300;
            const height = 300;
            
            // 清空畫布
            ctx.clearRect(0, 0, width, height);
            
            // 如果沒有選擇任何內容，顯示提示
            if (!this.currentSelection.font || !this.currentSelection.shape || !this.currentSelection.color) {
                ctx.save();
                ctx.fillStyle = '#a09389';
                ctx.font = '16px Noto Sans TC';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('請選擇字體、形狀和顏色', width / 2, height / 2);
                ctx.restore();
                return;
            }
            
            // 設定樣式
            const color = this.currentSelection.color?.selected || this.currentSelection.color?.main || '#9fb28e';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 6;
            
            // 設定邊框樣式
            if (this.currentSelection.borderStyle === 'dashed') {
                ctx.setLineDash([12, 6]);
            } else if (this.currentSelection.borderStyle === 'dotted') {
                ctx.setLineDash([3, 6]);
            } else {
                ctx.setLineDash([]);
            }
            
            // 繪製形狀
            const shape = this.currentSelection.shape;
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;
            
            ctx.save();
            
            // 設定陰影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            if (shape) {
                if (shape.githubPath) {
                    // 使用自訂形狀圖片
                    const img = new Image();
                    img.src = Utils.getGitHubRawUrl(shape.githubPath);
                    img.onload = () => {
                        ctx.save();
                        // 清空畫布
                        ctx.clearRect(0, 0, width, height);
                        
                        // 繪製形狀圖片
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.drawImage(img, centerX - size/2, centerY - size/2, size, size);
                        ctx.restore();
                        
                        // 繪製文字和圖案
                        this.drawTextAndPattern(ctx, centerX, centerY, size);
                    };
                    ctx.restore();
                    return;
                } else {
                    // 繪製預設形狀
                    switch (shape.name) {
                        case '圓形':
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                            if (this.currentSelection.borderStyle === 'double') {
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, size / 2 - 10, 0, Math.PI * 2);
                            }
                            ctx.stroke();
                            break;
                            
                        case '橢圓形':
                            ctx.beginPath();
                            ctx.ellipse(centerX, centerY, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
                            if (this.currentSelection.borderStyle === 'double') {
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.ellipse(centerX, centerY, size * 0.6 - 10, size * 0.4 - 10, 0, 0, Math.PI * 2);
                            }
                            ctx.stroke();
                            break;
                            
                        case '長方形':
                            if (this.currentSelection.borderStyle === 'double') {
                                ctx.strokeRect(centerX - size * 0.55, centerY - size * 0.35, size * 1.1, size * 0.7);
                                ctx.strokeRect(centerX - size * 0.55 + 10, centerY - size * 0.35 + 10, size * 1.1 - 20, size * 0.7 - 20);
                            } else {
                                ctx.strokeRect(centerX - size * 0.55, centerY - size * 0.35, size * 1.1, size * 0.7);
                            }
                            break;
                            
                        case '圓角方形':
                            this.roundRect(ctx, centerX - size / 2, centerY - size / 2, size, size, 30);
                            if (this.currentSelection.borderStyle === 'double') {
                                ctx.stroke();
                                this.roundRect(ctx, centerX - size / 2 + 10, centerY - size / 2 + 10, size - 20, size - 20, 25);
                            }
                            ctx.stroke();
                            break;
                            
                        default:
                            // 預設圓形
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                            ctx.stroke();
                    }
                }
            }
            
            ctx.restore();
            
            // 繪製文字和圖案
            this.drawTextAndPattern(ctx, centerX, centerY, size);
        }
        
        drawTextAndPattern(ctx, centerX, centerY, size) {
            // 繪製圖案填充
            if (this.currentSelection.pattern?.githubPath) {
                const patternImg = new Image();
                patternImg.src = Utils.getGitHubRawUrl(this.currentSelection.pattern.githubPath);
                patternImg.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = 0.1;
                    
                    // 建立剪裁路徑
                    ctx.beginPath();
                    const shape = this.currentSelection.shape;
                    switch (shape?.name) {
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
                    ctx.fillRect(0, 0, 300, 300);
                    
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
            
            if (!text) return;
            
            ctx.save();
            
            // 設定文字樣式
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const color = this.currentSelection.color?.selected || this.currentSelection.color?.main || '#9fb28e';
            ctx.fillStyle = color;
            
            // 移除文字陰影
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // 計算字體大小
            let fontSize = size * 0.22;
            
            // 根據文字長度調整
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
            
            // 根據形狀調整文字排列
            const shape = this.currentSelection.shape;
            if (text.length > 2 && shape && (shape.name === '圓形' || shape.name === '圓角方形')) {
                // 垂直排列文字
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
            // 建立放大預覽模態框
            const modal = document.createElement('div');
            modal.className = 'sw-modal active';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'sw-modal-content';
            modalContent.style.textAlign = 'center';
            
            modalContent.innerHTML = `
                <h2 style="margin-bottom: 24px; color: var(--sw-text-primary);">印章預覽</h2>
                <canvas id="modal-canvas" width="600" height="600" style="
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    margin-bottom: 24px;
                "></canvas>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="sw-btn" onclick="this.closest('.sw-modal').remove()">
                        <span class="material-icons">close</span>
                        關閉
                    </button>
                    <button class="sw-btn sw-btn-secondary" onclick="StampWidget.instance.downloadStamp('png')">
                        <span class="material-icons">download</span>
                        下載 PNG
                    </button>
                    <button class="sw-btn sw-btn-secondary" onclick="StampWidget.instance.downloadStamp('jpg')">
                        <span class="material-icons">download</span>
                        下載 JPG
                    </button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 繪製放大版本
            const modalCanvas = document.getElementById('modal-canvas');
            const modalCtx = modalCanvas.getContext('2d');
            modalCtx.scale(2, 2);
            
            // 暫存當前畫布
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            this.canvas = modalCanvas;
            this.ctx = modalCtx;
            this.updatePreview();
            
            // 恢復原畫布
            this.canvas = originalCanvas;
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
            if (!this.canvas) return;
            
            // 檢查是否有完整選擇
            if (!this.currentSelection.font || !this.currentSelection.shape || !this.currentSelection.color) {
                Utils.showNotification('請先選擇字體、形狀和顏色', 'warning');
                return;
            }
            
            Utils.showNotification('正在準備高解析度圖片...', 'info');
            
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
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            
            // 使用高解析度畫布重新繪製
            this.canvas = downloadCanvas;
            this.ctx = downloadCtx;
            this.updatePreview();
            
            // 恢復原畫布
            this.canvas = originalCanvas;
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
                    
                    Utils.showNotification(`印章圖片已下載 (${format.toUpperCase()})`, 'success');
                    
                    // 記錄下載
                    this.logDownload(format);
                }, mimeType, quality);
            }, 100);
        }
        
        logDownload(format) {
            // 可以在這裡加入下載統計功能
            console.log('印章下載:', {
                text: this.currentSelection.text,
                font: this.currentSelection.font?.name,
                shape: this.currentSelection.shape?.name,
                color: this.currentSelection.color?.name,
                pattern: this.currentSelection.pattern?.name,
                format: format,
                timestamp: new Date().toISOString()
            });
        }
        
        applySecuritySettings() {
            const settings = this.config?.frontendSecurity || {};
            
            // 禁止文字選取
            if (settings.disableTextSelect !== false) {
                this.container.classList.add('no-select');
                
                // CSS 防止選取
                const style = document.createElement('style');
                style.textContent = `
                    #${this.containerId} {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 禁用右鍵選單
            if (settings.disableRightClick !== false) {
                this.container.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    Utils.showNotification(settings.rightClickWarning || '右鍵功能已被禁用', 'warning');
                    return false;
                });
            }
            
            // 禁止拖曳
            if (settings.disableDrag !== false) {
                this.container.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                // 防止圖片拖曳
                this.container.querySelectorAll('img').forEach(img => {
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
                    Utils.showNotification('列印功能已被禁用', 'warning');
                    return false;
                });
            }
            
            // 失焦模糊
            if (settings.blurOnLoseFocus) {
                let blurTimeout;
                
                window.addEventListener('blur', () => {
                    blurTimeout = setTimeout(() => {
                        this.container.style.filter = 'blur(10px)';
                        this.container.style.pointerEvents = 'none';
                    }, 100);
                });
                
                window.addEventListener('focus', () => {
                    clearTimeout(blurTimeout);
                    this.container.style.filter = '';
                    this.container.style.pointerEvents = '';
                });
            }
        }
        
        createWatermark(settings) {
            const watermark = document.createElement('div');
            watermark.className = 'sw-watermark';
            
            const text = settings.watermarkText || '© 2025 印章系統 - 版權所有';
            const fontSize = settings.watermarkFontSize || 14;
            const opacity = settings.watermarkOpacity || 0.03;
            
            watermark.style.opacity = opacity;
            
            // 建立浮水印文字
            const createWatermarkTexts = () => {
                watermark.innerHTML = '';
                for (let i = 0; i < 50; i++) {
                    const span = document.createElement('span');
                    span.className = 'sw-watermark-text';
                    span.style.left = `${Math.random() * 100}%`;
                    span.style.top = `${Math.random() * 100}%`;
                    span.style.fontSize = `${fontSize}px`;
                    span.textContent = text;
                    watermark.appendChild(span);
                }
            };
            
            createWatermarkTexts();
            document.body.appendChild(watermark);
            
            // 定期更新浮水印位置
            if (settings.watermarkInterval) {
                setInterval(createWatermarkTexts, settings.watermarkInterval * 1000);
            }
        }
        
        enableScreenshotProtection(settings) {
            const protectionLayer = document.getElementById(`screenshot-protection-${this.widgetId}`);
            
            // PrintScreen 鍵偵測
            document.addEventListener('keyup', (e) => {
                if (e.key === 'PrintScreen') {
                    protectionLayer.style.display = 'flex';
                    setTimeout(() => {
                        protectionLayer.style.display = 'none';
                    }, 3000);
                    
                    Utils.showNotification(settings.screenshotWarning || '禁止截圖 - 版權所有', 'danger');
                }
            });
            
            // 偵測截圖快捷鍵組合
            document.addEventListener('keydown', (e) => {
                // Windows: Win+Shift+S, Win+PrtScn
                // Mac: Cmd+Shift+3, Cmd+Shift+4
                if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                    protectionLayer.style.display = 'flex';
                    setTimeout(() => {
                        protectionLayer.style.display = 'none';
                    }, 3000);
                    
                    Utils.showNotification(settings.screenshotWarning || '禁止截圖 - 版權所有', 'danger');
                }
            });
        }
        
        detectDevTools(settings) {
            const warningLayer = document.getElementById(`devtools-warning-${this.widgetId}`);
            let devtoolsOpen = false;
            
            // 偵測開發者工具
            const detect = () => {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    if (!devtoolsOpen) {
                        devtoolsOpen = true;
                        warningLayer.style.display = 'block';
                        
                        console.clear();
                        console.log('%c' + (settings.devToolsWarning || '警告：偵測到開發者工具！\n本系統內容受版權保護，禁止任何形式的複製或修改。'), 
                            'color: red; font-size: 20px; font-weight: bold;');
                        
                        Utils.showNotification('偵測到開發者工具', 'warning');
                    }
                } else {
                    if (devtoolsOpen) {
                        devtoolsOpen = false;
                        warningLayer.style.display = 'none';
                    }
                }
            };
            
            setInterval(detect, 500);
            
            // 防止 F12
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    Utils.showNotification('開發者工具已被禁用', 'warning');
                    return false;
                }
            });
            
            // 禁用右鍵檢查元素
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    return false;
                }
            });
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
    
    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 0);
    }
    
    // 公開 API
    window.StampWidget = StampWidget;
    
    // 版本資訊
    console.log('%c🎯 印章預覽系統 v7.0.0', 'font-size: 16px; font-weight: bold; color: #9fb28e;');
    console.log('%c👤 作者: DK0124', 'color: #84736a;');
    console.log('%c📅 最後更新: 2025-01-29', 'color: #84736a;');
    console.log('%c🔗 GitHub: https://github.com/DK0124/stamp-font-preview', 'color: #64b5f6;');
    
})();
