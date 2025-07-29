/**
 * 印章預覽小工具 - 整合前台保護功能
 * @author DK0124
 * @version 3.0.0
 * @date 2025-01-29
 */

(function() {
    'use strict';
    
    // 前台安全設定
    let securitySettings = {};
    
    // 全域配置
    let stampConfig = {
        fonts: [],
        shapes: [],
        patterns: [],
        colors: [],
        frontendSecurity: {}
    };
    
    // 載入前台安全設定
    function loadSecuritySettings() {
        try {
            securitySettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
            
            // 預設值
            const defaults = {
                preventScreenshot: true,
                enableWatermark: true,
                disableRightClick: true,
                disableTextSelect: true,
                disableDevTools: true,
                disablePrint: true,
                disableDrag: true,
                blurOnLoseFocus: false,
                watermarkText: '© 2025 印章系統 - 版權所有',
                watermarkInterval: 60,
                watermarkOpacity: 0.03,
                watermarkFontSize: 10,
                screenshotWarning: '禁止截圖 - 版權所有',
                devToolsWarning: '警告：偵測到開發者工具！\n本系統內容受版權保護，禁止任何形式的複製或下載。'
            };
            
            securitySettings = { ...defaults, ...securitySettings };
        } catch (e) {
            console.error('載入安全設定失敗:', e);
        }
    }
    
    // 套用前台安全保護
    function applySecurityProtection() {
        // 防止截圖（基於 visibility change）
        if (securitySettings.preventScreenshot !== false) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // 監聽截圖快捷鍵
            document.addEventListener('keydown', (e) => {
                // PrintScreen
                if (e.key === 'PrintScreen') {
                    e.preventDefault();
                    showScreenshotWarning();
                }
                // Windows: Win + Shift + S
                if ((e.metaKey || e.key === 'Meta') && e.shiftKey && e.key === 's') {
                    e.preventDefault();
                    showScreenshotWarning();
                }
                // Mac: Cmd + Shift + 3/4/5
                if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
                    e.preventDefault();
                    showScreenshotWarning();
                }
            });
        }
        
        // 啟用浮水印
        if (securitySettings.enableWatermark !== false) {
            createWatermark();
            setInterval(() => {
                createWatermark();
            }, (securitySettings.watermarkInterval || 60) * 1000);
        }
        
        // 禁用右鍵選單
        if (securitySettings.disableRightClick !== false) {
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.stamp-preview-container, .stamp-canvas, .stamp-text')) {
                    e.preventDefault();
                    showProtectionMessage('右鍵功能已被禁用');
                    return false;
                }
            });
        }
        
        // 禁止文字選取
        if (securitySettings.disableTextSelect !== false) {
            const style = document.createElement('style');
            style.textContent = `
                .stamp-preview-container,
                .stamp-preview-container * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 偵測開發者工具
        if (securitySettings.disableDevTools !== false) {
            let devtools = { open: false };
            const threshold = 160;
            let checkTimer;
            
            const checkDevTools = () => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        showDevToolsWarning();
                    }
                } else {
                    devtools.open = false;
                }
            };
            
            checkTimer = setInterval(checkDevTools, 500);
            
            // 偵測 console 是否被開啟
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function() {
                    devtools.open = true;
                    showDevToolsWarning();
                }
            });
            
            // 定期輸出到 console 以觸發偵測
            setInterval(() => {
                console.log(element);
            }, 1000);
        }
        
        // 禁止列印
        if (securitySettings.disablePrint !== false) {
            window.addEventListener('beforeprint', (e) => {
                e.preventDefault();
                showProtectionMessage('列印功能已被禁用');
                return false;
            });
            
            // 禁用列印快捷鍵
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    showProtectionMessage('列印功能已被禁用');
                    return false;
                }
            });
        }
        
        // 禁止拖曳圖片
        if (securitySettings.disableDrag !== false) {
            document.addEventListener('dragstart', (e) => {
                if (e.target.tagName === 'IMG' || e.target.closest('.stamp-preview-container')) {
                    e.preventDefault();
                    return false;
                }
            });
        }
        
        // 失焦模糊
        if (securitySettings.blurOnLoseFocus) {
            window.addEventListener('blur', () => {
                document.querySelectorAll('.stamp-preview-container').forEach(container => {
                    container.style.filter = 'blur(10px)';
                    container.style.transition = 'filter 0.3s ease';
                });
            });
            
            window.addEventListener('focus', () => {
                document.querySelectorAll('.stamp-preview-container').forEach(container => {
                    container.style.filter = 'none';
                });
            });
        }
    }
    
    // 處理頁面可見性變化
    function handleVisibilityChange() {
        if (document.hidden) {
            showScreenshotWarning();
        }
    }
    
    // 顯示截圖警告
    function showScreenshotWarning() {
        let warningDiv = document.getElementById('screenshotWarning');
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.id = 'screenshotWarning';
            warningDiv.style.cssText = `
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            warningDiv.innerHTML = `
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 20px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <h1 style="font-size: 36px; margin: 0 0 10px;">${securitySettings.screenshotWarning}</h1>
                <p style="font-size: 18px; opacity: 0.8;">此操作已被記錄</p>
            `;
            document.body.appendChild(warningDiv);
        }
        
        warningDiv.style.display = 'flex';
        
        setTimeout(() => {
            warningDiv.style.display = 'none';
        }, 3000);
    }
    
    // 顯示開發者工具警告
    function showDevToolsWarning() {
        console.clear();
        console.log('%c' + securitySettings.devToolsWarning, 
            'color: red; font-size: 20px; font-weight: bold; text-align: center; padding: 20px;');
        
        // 顯示視覺警告
        let warningDiv = document.getElementById('devToolsWarning');
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.id = 'devToolsWarning';
            warningDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(255,0,0,0.3);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 300px;
                animation: shake 0.5s ease-in-out;
            `;
            warningDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">⚠️ 安全警告</div>
                <div style="font-size: 14px;">${securitySettings.devToolsWarning.split('\n')[0]}</div>
            `;
            document.body.appendChild(warningDiv);
            
            // 加入震動動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        warningDiv.style.display = 'block';
        
        setTimeout(() => {
            warningDiv.style.display = 'none';
        }, 5000);
    }
    
    // 顯示保護訊息
    function showProtectionMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease;
        `;
        msgDiv.textContent = message;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }, 2000);
        
        // 加入動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 創建浮水印
    function createWatermark() {
        let watermarkLayer = document.getElementById('stampWatermarkLayer');
        if (!watermarkLayer) {
            watermarkLayer = document.createElement('div');
            watermarkLayer.id = 'stampWatermarkLayer';
            watermarkLayer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                opacity: ${securitySettings.watermarkOpacity || 0.03};
            `;
            document.body.appendChild(watermarkLayer);
        }
        
        watermarkLayer.innerHTML = '';
        
        const text = securitySettings.watermarkText || '© 2025 印章系統';
        const timestamp = new Date().toLocaleString('zh-TW');
        
        // 創建隨機分布的浮水印
        for (let i = 0; i < 50; i++) {
            const span = document.createElement('span');
            span.style.cssText = `
                position: absolute;
                color: #000;
                font-size: ${securitySettings.watermarkFontSize || 10}px;
                font-weight: 600;
                transform: rotate(-45deg);
                user-select: none;
                white-space: nowrap;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;
            span.textContent = `${text} - ${timestamp}`;
            watermarkLayer.appendChild(span);
        }
    }
    
    // ========== 原有的印章小工具功能 ==========
    
    // 載入設定檔
    async function loadConfig() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json');
            if (response.ok) {
                stampConfig = await response.json();
                
                // 如果有前台安全設定，優先使用
                if (stampConfig.frontendSecurity) {
                    securitySettings = { ...securitySettings, ...stampConfig.frontendSecurity };
                    localStorage.setItem('frontend_security_settings', JSON.stringify(securitySettings));
                }
                
                console.log('印章設定載入成功');
                return true;
            }
        } catch (error) {
            console.error('載入設定失敗:', error);
        }
        return false;
    }
    
    // 創建印章預覽小工具
    window.createStampWidget = async function(containerId, options = {}) {
        // 確保設定已載入
        if (!stampConfig.fonts || stampConfig.fonts.length === 0) {
            await loadConfig();
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('找不到容器元素:', containerId);
            return;
        }
        
        // 預設選項
        const defaultOptions = {
            defaultText: '印章預覽',
            defaultFont: 0,
            defaultShape: 0,
            defaultPattern: 0,
            defaultColor: '#dc3545',
            canvasSize: 300,
            enableDownload: true,
            enableCustomText: true,
            enableFontSelector: true,
            enableShapeSelector: true,
            enablePatternSelector: true,
            enableColorSelector: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 建立 UI 結構
        container.innerHTML = `
            <div class="stamp-preview-container" style="
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: 0 auto;
            ">
                <h3 style="
                    margin: 0 0 20px 0;
                    color: #84736a;
                    font-size: 24px;
                    font-weight: 600;
                    text-align: center;
                ">印章預覽系統</h3>
                
                <div class="stamp-controls" style="
                    display: grid;
                    gap: 16px;
                    margin-bottom: 24px;
                ">
                    ${settings.enableCustomText ? `
                    <div class="control-group">
                        <label style="
                            display: block;
                            margin-bottom: 8px;
                            color: #84736a;
                            font-weight: 500;
                        ">印章文字</label>
                        <input type="text" id="${containerId}-text" value="${settings.defaultText}" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 2px solid transparent;
                            border-radius: 12px;
                            background: rgba(255, 255, 255, 0.8);
                            font-size: 16px;
                            transition: all 0.3s ease;
                            outline: none;
                        " onfocus="this.style.borderColor='#9fb28e'" onblur="this.style.borderColor='transparent'">
                    </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${settings.enableFontSelector ? `
                        <div class="control-group">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                color: #84736a;
                                font-weight: 500;
                            ">字體選擇</label>
                            <select id="${containerId}-font" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 2px solid transparent;
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.8);
                                font-size: 16px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                outline: none;
                            " onfocus="this.style.borderColor='#9fb28e'" onblur="this.style.borderColor='transparent'">
                                ${stampConfig.fonts.map((font, index) => 
                                    `<option value="${index}" ${index === settings.defaultFont ? 'selected' : ''}>${font.displayName || font.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        ` : ''}
                        
                        ${settings.enableShapeSelector ? `
                        <div class="control-group">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                color: #84736a;
                                font-weight: 500;
                            ">形狀選擇</label>
                            <select id="${containerId}-shape" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 2px solid transparent;
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.8);
                                font-size: 16px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                outline: none;
                            " onfocus="this.style.borderColor='#9fb28e'" onblur="this.style.borderColor='transparent'">
                                ${stampConfig.shapes.map((shape, index) => 
                                    `<option value="${index}" ${index === settings.defaultShape ? 'selected' : ''}>${shape.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${settings.enableColorSelector ? `
                    <div class="control-group">
                        <label style="
                            display: block;
                            margin-bottom: 8px;
                            color: #84736a;
                            font-weight: 500;
                        ">顏色選擇</label>
                        <div style="
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                        ">
                            <input type="color" id="${containerId}-color" value="${settings.defaultColor}" style="
                                width: 60px;
                                height: 40px;
                                border: 2px solid transparent;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.borderColor='#9fb28e'" onmouseout="this.style.borderColor='transparent'">
                            ${stampConfig.colors.map(color => `
                                <button onclick="document.getElementById('${containerId}-color').value='${color.main}'; window.updateStampPreview_${containerId}();" style="
                                    width: 40px;
                                    height: 40px;
                                    background: ${color.main};
                                    border: 2px solid transparent;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    position: relative;
                                    overflow: hidden;
                                " onmouseover="this.style.borderColor='#84736a'; this.style.transform='scale(1.1)'" onmouseout="this.style.borderColor='transparent'; this.style.transform='scale(1)'" title="${color.name}">
                                    <span style="
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 100%;
                                        height: 100%;
                                        background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
                                        opacity: 0;
                                        transition: opacity 0.3s ease;
                                    " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'"></span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="stamp-preview" style="
                    text-align: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #f7ecd5 0%, #dde5d6 100%);
                    border-radius: 12px;
                    position: relative;
                    overflow: hidden;
                ">
                    <canvas id="${containerId}-canvas" width="${settings.canvasSize}" height="${settings.canvasSize}" style="
                        max-width: 100%;
                        height: auto;
                        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
                    "></canvas>
                    
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
                        transform: translateX(-100%);
                        animation: shimmer 3s ease-in-out infinite;
                    "></div>
                </div>
                
                ${settings.enableDownload ? `
                <div style="
                    margin-top: 20px;
                    text-align: center;
                ">
                    <button onclick="window.downloadStamp_${containerId}()" style="
                        background: #9fb28e;
                        color: white;
                        border: none;
                        padding: 12px 32px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(159, 178, 142, 0.3);
                        position: relative;
                        overflow: hidden;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(159, 178, 142, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(159, 178, 142, 0.3)'">
                        <span style="position: relative; z-index: 1;">下載印章</span>
                        <span style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            width: 0;
                            height: 0;
                            background: rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            transform: translate(-50%, -50%);
                            transition: width 0.6s, height 0.6s;
                        "></span>
                    </button>
                </div>
                ` : ''}
            </div>
            
            <style>
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                #${containerId} select:hover,
                #${containerId} input:hover {
                    background: rgba(255, 255, 255, 0.95);
                }
                
                #${containerId} button:active span:last-child {
                    width: 300px !important;
                    height: 300px !important;
                }
            </style>
        `;
        
        // 初始化 Canvas
        const canvas = document.getElementById(`${containerId}-canvas`);
        const ctx = canvas.getContext('2d');
        
        // 載入字體
        await loadFonts();
        
        // 更新預覽函數
        window[`updateStampPreview_${containerId}`] = async function() {
            const text = settings.enableCustomText ? 
                document.getElementById(`${containerId}-text`).value : 
                settings.defaultText;
            const fontIndex = settings.enableFontSelector ? 
                document.getElementById(`${containerId}-font`).value : 
                settings.defaultFont;
            const shapeIndex = settings.enableShapeSelector ? 
                document.getElementById(`${containerId}-shape`).value : 
                settings.defaultShape;
            const color = settings.enableColorSelector ? 
                document.getElementById(`${containerId}-color`).value : 
                settings.defaultColor;
            
            // 清空畫布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 繪製印章
            await drawStamp(ctx, {
                text: text,
                font: stampConfig.fonts[fontIndex],
                shape: stampConfig.shapes[shapeIndex],
                color: color,
                size: settings.canvasSize
            });
        };
        
        // 下載函數
        window[`downloadStamp_${containerId}`] = function() {
            const link = document.createElement('a');
            link.download = `印章_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            showProtectionMessage('印章已下載');
        };
        
        // 綁定事件
        if (settings.enableCustomText) {
            document.getElementById(`${containerId}-text`).addEventListener('input', 
                window[`updateStampPreview_${containerId}`]);
        }
        if (settings.enableFontSelector) {
            document.getElementById(`${containerId}-font`).addEventListener('change', 
                window[`updateStampPreview_${containerId}`]);
        }
        if (settings.enableShapeSelector) {
            document.getElementById(`${containerId}-shape`).addEventListener('change', 
                window[`updateStampPreview_${containerId}`]);
        }
        if (settings.enableColorSelector) {
            document.getElementById(`${containerId}-color`).addEventListener('input', 
                window[`updateStampPreview_${containerId}`]);
        }
        
        // 初始預覽
        window[`updateStampPreview_${containerId}`]();
    };
    
    // 載入字體
    async function loadFonts() {
        for (const font of stampConfig.fonts) {
            if (font.systemFont) continue;
            
            try {
                const fontUrl = font.githubPath ? 
                    `https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/${font.githubPath}` :
                    font.url;
                    
                if (fontUrl) {
                    const fontFace = new FontFace(font.name, `url(${fontUrl})`);
                    await fontFace.load();
                    document.fonts.add(fontFace);
                }
            } catch (error) {
                console.error(`載入字體 ${font.name} 失敗:`, error);
            }
        }
    }
    
    // 繪製印章
    async function drawStamp(ctx, options) {
        const { text, font, shape, color, size } = options;
        
        // 設定樣式
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 根據形狀繪製
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.4;
        
        switch (shape.name) {
            case '圓形':
                // 繪製圓形邊框
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.lineWidth = 8;
                ctx.stroke();
                
                // 繪製文字
                drawCircularText(ctx, text, centerX, centerY, radius * 0.7, font);
                break;
                
            case '方形':
                // 繪製方形邊框
                const squareSize = radius * 1.6;
                ctx.lineWidth = 8;
                ctx.strokeRect(centerX - squareSize/2, centerY - squareSize/2, squareSize, squareSize);
                
                // 繪製文字
                drawSquareText(ctx, text, centerX, centerY, squareSize * 0.8, font);
                break;
                
            case '橢圓形':
                // 繪製橢圓邊框
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.2, radius * 0.8, 0, 0, Math.PI * 2);
                ctx.lineWidth = 8;
                ctx.stroke();
                
                // 繪製文字
                drawCircularText(ctx, text, centerX, centerY, radius * 0.6, font);
                break;
                
            default:
                // 預設圓形
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.lineWidth = 8;
                ctx.stroke();
                drawCircularText(ctx, text, centerX, centerY, radius * 0.7, font);
        }
    }
    
    // 繪製環形文字
    function drawCircularText(ctx, text, centerX, centerY, radius, font) {
        const fontSize = Math.max(20, radius * 0.3);
        ctx.font = `${font.weight || 'normal'} ${fontSize}px "${font.name}", serif`;
        
        const textArray = text.split('');
        const angleStep = (Math.PI * 2) / textArray.length;
        const startAngle = -Math.PI / 2;
        
        textArray.forEach((char, index) => {
            const angle = startAngle + angleStep * index;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        });
    }
    
    // 繪製方形排列文字
    function drawSquareText(ctx, text, centerX, centerY, size, font) {
        const textArray = text.split('');
        const gridSize = Math.ceil(Math.sqrt(textArray.length));
        const cellSize = size / gridSize;
        const fontSize = cellSize * 0.7;
        
        ctx.font = `${font.weight || 'normal'} ${fontSize}px "${font.name}", serif`;
        
        let index = 0;
        for (let row = 0; row < gridSize && index < textArray.length; row++) {
            for (let col = 0; col < gridSize && index < textArray.length; col++) {
                const x = centerX - size/2 + cellSize * (col + 0.5);
                const y = centerY - size/2 + cellSize * (row + 0.5);
                ctx.fillText(textArray[index], x, y);
                index++;
            }
        }
    }
    
    // 初始化函數
    async function init() {
        // 載入安全設定
        loadSecuritySettings();
        
        // 載入印章設定
        await loadConfig();
        
        // 套用安全保護
        applySecurityProtection();
        
        console.log('🔒 前台安全保護已啟動');
        console.log('🎯 印章預覽系統已就緒');
    }
    
    // 當 DOM 載入完成時初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 定期檢查設定更新
    setInterval(async () => {
        // 檢查安全設定
        const newSettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
        if (JSON.stringify(newSettings) !== JSON.stringify(securitySettings)) {
            console.log('🔄 安全設定已更新，重新載入...');
            location.reload();
        }
        
        // 檢查印章設定
        const response = await fetch('https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json');
        if (response.ok) {
            const newConfig = await response.json();
            if (JSON.stringify(newConfig) !== JSON.stringify(stampConfig)) {
                console.log('🔄 印章設定已更新');
                stampConfig = newConfig;
            }
        }
    }, 30000); // 每30秒檢查一次
    
})();
