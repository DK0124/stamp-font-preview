/**
 * 印章小工具前台 - 完全依賴後台設定版本
 * @author DK0124
 * @version 2.1.0
 * @date 2025-01-29
 */

const StampWidget = {
    // GitHub 設定
    GITHUB_RAW_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/',
    CONFIG_URL: 'https://raw.githubusercontent.com/DK0124/stamp-font-preview/main/config/stamp-config.json',
    
    // 狀態
    elements: {},
    currentSettings: {
        text: '印章文字',
        font: '',
        shape: '',
        borderStyle: 'solid',
        borderWidth: 3,
        color: '#DC143C',
        pattern: 'none',
        effects: []
    },
    loadedFonts: {},
    configLoaded: false,
    
    // 從後台載入的資料（初始為空）
    availableFonts: [],
    shapes: [],
    borderStyles: [],
    colorGroups: [],
    patterns: [],
    
    // 預設邊框樣式（保留這個因為是基本CSS樣式）
    defaultBorderStyles: [
        { id: 'solid', name: '實線', class: 'solid' },
        { id: 'double', name: '雙線', class: 'double' },
        { id: 'dotted', name: '點線', class: 'dotted' },
        { id: 'dashed', name: '虛線', class: 'dashed' },
        { id: 'groove', name: '凹線', class: 'groove' },
        { id: 'ridge', name: '凸線', class: 'ridge' }
    ],
    
    // 初始化
    init: async function() {
        const widget = document.getElementById('stamp-custom-font-widget');
        if (!widget) {
            console.error('找不到印章小工具容器');
            return;
        }

        console.log('初始化印章小工具...');
        
        // 顯示載入中狀態
        this.showLoadingState();

        try {
            // 先載入設定檔
            const configSuccess = await this.loadCustomConfig();
            
            if (!configSuccess) {
                throw new Error('無法載入設定檔');
            }
            
            // 取得 DOM 元素
            this.elements = {
                stampText: widget.querySelector('#stampText'),
                fontSelect: widget.querySelector('#fontSelect'),
                shapeContainer: widget.querySelector('.shapes-container'),
                borderStyleContainer: widget.querySelector('.border-styles-container'),
                colorContainer: widget.querySelector('.color-groups-container'),
                patternContainer: widget.querySelector('.patterns-container'),
                mainPreview: widget.querySelector('#mainPreview'),
                effectButtons: widget.querySelectorAll('.effect-button'),
                borderWidthSlider: widget.querySelector('#borderWidth'),
                borderWidthValue: widget.querySelector('#borderWidthValue'),
                fontLoading: widget.querySelector('#fontLoading')
            };
            
            // 檢查是否有資料
            if (this.availableFonts.length === 0 && 
                this.shapes.length === 0 && 
                this.colorGroups.length === 0) {
                this.showEmptyState();
                return;
            }
            
            // 初始化所有元件
            await this.initializeAll();
            
            // 載入字體
            await this.loadAllFonts();
            
            // 設定預設值
            this.setDefaultValues();
            
            // 綁定事件
            this.bindEvents();
            
            // 更新預覽
            this.updateMainPreview();
            
            // 設定 BVShop 整合
            setTimeout(() => {
                this.setupBVShopListeners();
                this.loadFromBVShop();
            }, 500);
            
            console.log('印章小工具初始化完成');
            
        } catch (error) {
            console.error('初始化失敗:', error);
            this.showErrorState(error.message);
        }
    },
    
    // 顯示載入中狀態
    showLoadingState: function() {
        const widget = document.getElementById('stamp-custom-font-widget');
        if (!widget) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'widgetLoading';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-size: 18px;
            color: #666;
        `;
        loadingDiv.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                "></div>
                <div>正在載入設定...</div>
            </div>
        `;
        
        widget.appendChild(loadingDiv);
        
        // 加入旋轉動畫
        if (!document.getElementById('spinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'spinnerStyle';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // 移除載入狀態
    removeLoadingState: function() {
        const loadingDiv = document.getElementById('widgetLoading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    },
    
    // 顯示空白狀態
    showEmptyState: function() {
        this.removeLoadingState();
        
        const widget = document.getElementById('stamp-custom-font-widget');
        if (!widget) return;
        
        widget.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px;
                color: #999;
                font-size: 16px;
                background: #f5f5f5;
                border-radius: 8px;
                margin: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <div style="margin-bottom: 10px;">尚未設定任何內容</div>
                <div style="font-size: 14px;">請先到後台上傳字體、形狀、顏色等資源</div>
            </div>
        `;
    },
    
    // 顯示錯誤狀態
    showErrorState: function(message) {
        this.removeLoadingState();
        
        const widget = document.getElementById('stamp-custom-font-widget');
        if (!widget) return;
        
        widget.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px;
                color: #d32f2f;
                font-size: 16px;
                background: #ffebee;
                border-radius: 8px;
                margin: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <div style="margin-bottom: 10px;">載入失敗</div>
                <div style="font-size: 14px;">${message}</div>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 8px 20px;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">重新載入</button>
            </div>
        `;
    },
    
    // 載入自訂設定
    loadCustomConfig: async function() {
        try {
            console.log('開始載入設定檔...');
            
            // 加入時間戳避免快取
            const url = this.CONFIG_URL + '?t=' + Date.now();
            const response = await fetch(url);
            
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
                    weight: font.weight || 'normal',
                    filename: font.filename,
                    githubPath: font.githubPath,
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
            
            // 使用預設邊框樣式
            this.borderStyles = this.defaultBorderStyles;
            
            this.configLoaded = true;
            console.log('設定載入完成');
            return true;
            
        } catch (error) {
            console.error('載入設定失敗:', error);
            this.configLoaded = false;
            return false;
        }
    },
    
    // 初始化所有元件
    initializeAll: async function() {
        console.log('初始化所有元件...');
        
        this.removeLoadingState();
        
        // 初始化各個部分
        this.initializeFonts();
        this.initializeShapes();
        this.initializeBorderStyles();
        this.initializeColors();
        this.initializePatterns();
        
        console.log('元件初始化完成');
    },
    
    // 初始化字體選擇
    initializeFonts: function() {
        if (!this.elements.fontSelect || this.availableFonts.length === 0) {
            console.log('沒有字體選擇器或沒有可用字體');
            return;
        }
        
        // 清空並重新填充選項
        this.elements.fontSelect.innerHTML = '';
        
        // 加入預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇字體';
        this.elements.fontSelect.appendChild(defaultOption);
        
        // 加入所有字體選項
        this.availableFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font.id;
            option.textContent = font.displayName;
            option.dataset.weight = font.weight;
            this.elements.fontSelect.appendChild(option);
        });
        
        console.log(`已初始化 ${this.availableFonts.length} 個字體選項`);
    },
    
    // 初始化形狀
    initializeShapes: function() {
        if (!this.elements.shapeContainer || this.shapes.length === 0) {
            console.log('沒有形狀容器或沒有可用形狀');
            return;
        }
        
        this.elements.shapeContainer.innerHTML = this.shapes.map(shape => `
            <button class="shape-option" data-shape="${shape.id}" title="${shape.name}">
                <div class="stamp-preview shape-${shape.class}">
                    <span>印</span>
                </div>
            </button>
        `).join('');
        
        // 更新按鈕參考
        this.elements.shapeButtons = this.elements.shapeContainer.querySelectorAll('.shape-option');
        
        console.log(`已初始化 ${this.shapes.length} 個形狀`);
    },
    
    // 初始化邊框樣式
    initializeBorderStyles: function() {
        if (!this.elements.borderStyleContainer) {
            console.log('沒有邊框樣式容器');
            return;
        }
        
        this.elements.borderStyleContainer.innerHTML = this.borderStyles.map(style => `
            <button class="border-style-option" data-style="${style.id}" title="${style.name}">
                <div class="border-preview ${style.class}"></div>
            </button>
        `).join('');
        
        // 更新按鈕參考
        this.elements.borderStyleButtons = this.elements.borderStyleContainer.querySelectorAll('.border-style-option');
        
        console.log(`已初始化 ${this.borderStyles.length} 個邊框樣式`);
    },
    
    // 初始化顏色
    initializeColors: function() {
        if (!this.elements.colorContainer || this.colorGroups.length === 0) {
            console.log('沒有顏色容器或沒有可用顏色');
            return;
        }
        
        this.elements.colorContainer.innerHTML = this.colorGroups.map(group => `
            <div class="color-group">
                <h4>${group.name}</h4>
                <div class="color-shades">
                    ${group.shades.map((shade, index) => `
                        <button class="color-option" 
                                data-color="${shade}" 
                                data-group-id="${group.id}"
                                style="background-color: ${shade};"
                                title="${group.name} - ${index + 1}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // 更新按鈕參考
        this.elements.colorButtons = this.elements.colorContainer.querySelectorAll('.color-option');
        
        console.log(`已初始化 ${this.colorGroups.length} 個顏色組`);
    },
    
    // 初始化圖案
    initializePatterns: function() {
        if (!this.elements.patternContainer || this.patterns.length === 0) {
            console.log('沒有圖案容器或沒有可用圖案');
            return;
        }
        
        // 加入「無圖案」選項
        const allPatterns = [
            { id: 'none', name: '無', githubPath: null },
            ...this.patterns
        ];
        
        this.elements.patternContainer.innerHTML = allPatterns.map(pattern => {
            if (pattern.id === 'none') {
                return `
                    <button class="pattern-option" data-pattern="${pattern.id}" title="${pattern.name}">
                        <span>無</span>
                    </button>
                `;
            } else {
                const imageUrl = pattern.githubPath ? 
                    `${this.GITHUB_RAW_URL}${pattern.githubPath}` : 
                    `${this.GITHUB_RAW_URL}assets/patterns/${pattern.name}.png`;
                
                return `
                    <button class="pattern-option" data-pattern="${pattern.id}" title="${pattern.name}">
                        <img src="${imageUrl}" alt="${pattern.name}" onerror="this.parentElement.innerHTML='<span>?</span>'">
                    </button>
                `;
            }
        }).join('');
        
        // 更新按鈕參考
        this.elements.patternButtons = this.elements.patternContainer.querySelectorAll('.pattern-option');
        
        console.log(`已初始化 ${this.patterns.length} 個圖案`);
    },
    
    // 設定預設值
    setDefaultValues: function() {
        // 設定預設字體
        if (this.availableFonts.length > 0 && !this.currentSettings.font) {
            this.currentSettings.font = this.availableFonts[0].id;
            if (this.elements.fontSelect) {
                this.elements.fontSelect.value = this.currentSettings.font;
            }
        }
        
        // 設定預設形狀
        if (this.shapes.length > 0 && !this.currentSettings.shape) {
            this.currentSettings.shape = this.shapes[0].id;
            const firstShapeButton = this.elements.shapeButtons?.[0];
            if (firstShapeButton) {
                firstShapeButton.classList.add('active');
            }
        }
        
        // 設定預設邊框樣式
        if (this.borderStyles.length > 0) {
            const solidButton = Array.from(this.elements.borderStyleButtons || [])
                .find(btn => btn.dataset.style === 'solid');
            if (solidButton) {
                solidButton.classList.add('active');
            }
        }
        
        // 設定預設顏色
        if (this.colorGroups.length > 0 && this.colorGroups[0].shades.length > 0) {
            this.currentSettings.color = this.colorGroups[0].shades[0];
            const firstColorButton = this.elements.colorButtons?.[0];
            if (firstColorButton) {
                firstColorButton.classList.add('active');
            }
        }
        
        // 設定預設圖案
        const nonePatternButton = Array.from(this.elements.patternButtons || [])
            .find(btn => btn.dataset.pattern === 'none');
        if (nonePatternButton) {
            nonePatternButton.classList.add('active');
        }
        
        console.log('預設值設定完成:', this.currentSettings);
    },
    
    // 載入所有字體
    loadAllFonts: async function() {
        if (this.availableFonts.length === 0) {
            console.log('沒有需要載入的字體');
            return;
        }
        
        console.log(`開始載入 ${this.availableFonts.length} 個字體...`);
        
        const fontLoadingDiv = this.elements.fontLoading;
        if (fontLoadingDiv) {
            fontLoadingDiv.style.display = 'block';
            fontLoadingDiv.textContent = '正在載入字體...';
        }
        
        let loadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < this.availableFonts.length; i++) {
            const font = this.availableFonts[i];
            
            if (fontLoadingDiv) {
                fontLoadingDiv.textContent = `正在載入字體 ${i + 1}/${this.availableFonts.length}: ${font.displayName}`;
            }
            
            try {
                const result = await this.loadFont(font);
                if (result) {
                    loadedCount++;
                    console.log(`✓ 成功載入字體: ${font.displayName}`);
                } else {
                    failedCount++;
                    console.error(`✗ 載入字體失敗: ${font.displayName}`);
                }
            } catch (error) {
                failedCount++;
                console.error(`✗ 載入字體出錯: ${font.displayName}`, error);
            }
            
            // 避免同時載入太多，加入小延遲
            if (i < this.availableFonts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        if (fontLoadingDiv) {
            if (failedCount > 0) {
                fontLoadingDiv.textContent = `字體載入完成 (成功: ${loadedCount}, 失敗: ${failedCount})`;
                fontLoadingDiv.style.color = '#ff9800';
            } else {
                fontLoadingDiv.textContent = `成功載入 ${loadedCount} 個字體`;
                fontLoadingDiv.style.color = '#4caf50';
            }
            
            setTimeout(() => {
                fontLoadingDiv.style.display = 'none';
            }, 3000);
        }
        
        console.log(`字體載入完成: 成功 ${loadedCount}, 失敗 ${failedCount}`);
    },
    
    // 載入單一字體
    loadFont: async function(fontData) {
        if (!fontData) {
            console.error('無效的字體資料');
            return null;
        }
        
        // 檢查是否已載入
        if (this.loadedFonts[fontData.id]) {
            console.log(`字體已載入: ${fontData.displayName}`);
            return this.loadedFonts[fontData.id];
        }
        
        try {
            let fontUrl;
            
            // 決定字體 URL
            if (fontData.githubPath) {
                fontUrl = `${this.GITHUB_RAW_URL}${fontData.githubPath}`;
            } else if (fontData.filename) {
                fontUrl = `${this.GITHUB_RAW_URL}assets/fonts/${fontData.filename}`;
            } else {
                // 嘗試使用字體名稱
                fontUrl = `${this.GITHUB_RAW_URL}assets/fonts/${fontData.name}.ttf`;
            }
            
            // 加入時間戳避免快取
            fontUrl += '?t=' + Date.now();
            
            console.log(`載入字體: ${fontData.displayName} from ${fontUrl}`);
            
            // 下載字體檔案
            const response = await fetch(fontUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            // 建立字體
            const fontFace = new FontFace(
                `CustomFont${fontData.id}`,
                `url(${blobUrl})`,
                {
                    weight: fontData.weight || 'normal',
                    style: 'normal',
                    display: 'swap'
                }
            );
            
            // 載入字體
            await fontFace.load();
            
            // 加入到文件
            document.fonts.add(fontFace);
            
            // 儲存參考
            this.loadedFonts[fontData.id] = fontFace;
            
            // 延遲釋放 blob URL
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 10000);
            
            return fontFace;
            
        } catch (error) {
            console.error(`載入字體失敗: ${fontData.displayName}`, error);
            this.showFontLoadError(fontData.displayName);
            return null;
        }
    },
    
    // 顯示字體載入錯誤
    showFontLoadError: function(fontName) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        errorMsg.textContent = `字體載入失敗: ${fontName}`;
        document.body.appendChild(errorMsg);
        
        // 加入動畫
        if (!document.getElementById('errorAnimStyle')) {
            const style = document.createElement('style');
            style.id = 'errorAnimStyle';
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
        
        // 3秒後移除
        setTimeout(() => {
            errorMsg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorMsg.remove(), 300);
        }, 3000);
    },
    
    // 綁定事件
    bindEvents: function() {
        console.log('綁定事件處理器...');
        
        // 文字輸入
        if (this.elements.stampText) {
            this.elements.stampText.addEventListener('input', (e) => {
                this.currentSettings.text = e.target.value || '印章文字';
                this.updateMainPreview();
            });
        }
        
        // 字體選擇
        if (this.elements.fontSelect) {
            this.elements.fontSelect.addEventListener('change', async (e) => {
                const selectedFontId = e.target.value;
                if (!selectedFontId) return;
                
                const fontData = this.availableFonts.find(f => f.id == selectedFontId);
                if (fontData) {
                    // 確保字體已載入
                    await this.loadFont(fontData);
                    this.currentSettings.font = selectedFontId;
                    this.updateMainPreview();
                }
            });
        }
        
        // 形狀選擇
        if (this.elements.shapeButtons) {
            this.elements.shapeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.elements.shapeButtons.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                    this.currentSettings.shape = button.dataset.shape;
                    this.updateMainPreview();
                });
            });
        }
        
        // 邊框樣式選擇
        if (this.elements.borderStyleButtons) {
            this.elements.borderStyleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.elements.borderStyleButtons.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                    this.currentSettings.borderStyle = button.dataset.style;
                    this.updateMainPreview();
                });
            });
        }
        
        // 邊框寬度
        if (this.elements.borderWidthSlider) {
            this.elements.borderWidthSlider.addEventListener('input', (e) => {
                const width = e.target.value;
                this.currentSettings.borderWidth = parseInt(width);
                if (this.elements.borderWidthValue) {
                    this.elements.borderWidthValue.textContent = width;
                }
                this.updateMainPreview();
            });
        }
        
        // 顏色選擇
        if (this.elements.colorButtons) {
            this.elements.colorButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.elements.colorButtons.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                    this.currentSettings.color = button.dataset.color;
                    this.updateMainPreview();
                });
            });
        }
        
        // 圖案選擇
        if (this.elements.patternButtons) {
            this.elements.patternButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.elements.patternButtons.forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                    this.currentSettings.pattern = button.dataset.pattern;
                    this.updateMainPreview();
                });
            });
        }
        
        // 特效按鈕
        if (this.elements.effectButtons) {
            this.elements.effectButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const effect = button.dataset.effect;
                    button.classList.toggle('active');
                    
                    if (button.classList.contains('active')) {
                        if (!this.currentSettings.effects.includes(effect)) {
                            this.currentSettings.effects.push(effect);
                        }
                    } else {
                        this.currentSettings.effects = this.currentSettings.effects.filter(e => e !== effect);
                    }
                    
                    this.updateMainPreview();
                });
            });
        }
        
        console.log('事件綁定完成');
    },
    
    // 更新主預覽
    updateMainPreview: function() {
        if (!this.elements.mainPreview) {
            console.log('沒有主預覽元素');
            return;
        }
        
        const preview = this.elements.mainPreview;
        const text = this.currentSettings.text || '印章文字';
        
        // 重置類別
        preview.className = 'stamp-large';
        
        // 設定形狀
        const shapeData = this.shapes.find(s => s.id === this.currentSettings.shape);
        if (shapeData) {
            preview.classList.add(`shape-${shapeData.class}`);
        }
        
        // 設定邊框
        preview.style.borderStyle = this.currentSettings.borderStyle || 'solid';
        preview.style.borderWidth = `${this.currentSettings.borderWidth}px`;
        preview.style.borderColor = this.currentSettings.color;
        preview.style.color = this.currentSettings.color;
        
        // 設定字體
        const fontData = this.availableFonts.find(f => f.id == this.currentSettings.font);
        if (fontData) {
            preview.style.fontFamily = `CustomFont${fontData.id}, serif`;
            preview.style.fontWeight = fontData.weight || 'normal';
        }
        
        // 設定圖案背景
        if (this.currentSettings.pattern && this.currentSettings.pattern !== 'none') {
            const pattern = this.patterns.find(p => p.id === this.currentSettings.pattern);
            if (pattern) {
                const patternUrl = pattern.githubPath ? 
                    `${this.GITHUB_RAW_URL}${pattern.githubPath}` : 
                    `${this.GITHUB_RAW_URL}assets/patterns/${pattern.name}.png`;
                preview.style.backgroundImage = `url(${patternUrl})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
        } else {
            preview.style.backgroundImage = 'none';
            preview.style.backgroundColor = 'transparent';
        }
        
        // 應用特效
        let transform = '';
        let filter = '';
        let boxShadow = 'none';
        
        this.currentSettings.effects.forEach(effect => {
            switch(effect) {
                case 'rotate':
                    transform += 'rotate(-15deg) ';
                    break;
                case 'shadow':
                    boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    break;
                case 'blur':
                    filter += 'blur(1px) ';
                    break;
                case 'vintage':
                    filter += 'sepia(0.5) ';
                    break;
            }
        });
        
        preview.style.transform = transform || 'none';
        preview.style.filter = filter || 'none';
        preview.style.boxShadow = boxShadow;
        
        // 設定文字
        preview.textContent = text;
        
        // 通知 BVShop 更新
        if (window.BVShop && window.BVShop.updateAllPreviews) {
            window.BVShop.updateAllPreviews();
        }
        
        console.log('預覽已更新');
    },
    
    // 設定 BVShop 監聽器
    setupBVShopListeners: function() {
        if (!window.BVShop) {
            console.log('BVShop 未載入');
            return;
        }
        
        // 監聽產品加入事件
        window.addEventListener('bvshop:productAdded', (event) => {
            console.log('產品已加入:', event.detail);
            this.applyToProduct(event.detail.productId);
        });
        
        // 監聽 BVShop 就緒事件
        window.addEventListener('bvshop:ready', () => {
            console.log('BVShop 已就緒');
            this.loadFromBVShop();
        });
        
        console.log('BVShop 監聽器已設定');
    },
    
    // 從 BVShop 載入設定
    loadFromBVShop: function() {
        if (!window.BVShop || !window.BVShop.products) {
            console.log('沒有 BVShop 產品');
            return;
        }
        
        window.BVShop.products.forEach(product => {
            if (product.settings && product.settings.stampSettings) {
                const settings = product.settings.stampSettings;
                if (settings.font || settings.shape || settings.color) {
                    this.currentSettings = { ...this.currentSettings, ...settings };
                    this.updateUI();
                    this.updateMainPreview();
                    console.log('從 BVShop 載入設定:', settings);
                }
            }
        });
    },
    
    // 應用到產品
    applyToProduct: function(productId) {
        if (!window.BVShop || !window.BVShop.updateProductSettings) {
            console.log('BVShop 更新功能不可用');
            return;
        }
        
        const settings = {
            stampSettings: { ...this.currentSettings }
        };
        
        window.BVShop.updateProductSettings(productId, settings);
        console.log('已應用設定到產品:', productId);
    },
    
    // 更新 UI 以反映當前設定
    updateUI: function() {
        // 更新文字輸入
        if (this.elements.stampText) {
            this.elements.stampText.value = this.currentSettings.text;
        }
        
        // 更新字體選擇
        if (this.elements.fontSelect) {
            this.elements.fontSelect.value = this.currentSettings.font;
        }
        
        // 更新形狀選擇
        if (this.elements.shapeButtons) {
            this.elements.shapeButtons.forEach(button => {
                if (button.dataset.shape === this.currentSettings.shape) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
        
        // 更新邊框樣式
        if (this.elements.borderStyleButtons) {
            this.elements.borderStyleButtons.forEach(button => {
                if (button.dataset.style === this.currentSettings.borderStyle) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
        
        // 更新邊框寬度
        if (this.elements.borderWidthSlider) {
            this.elements.borderWidthSlider.value = this.currentSettings.borderWidth;
            if (this.elements.borderWidthValue) {
                this.elements.borderWidthValue.textContent = this.currentSettings.borderWidth;
            }
        }
        
        // 更新顏色
        if (this.elements.colorButtons) {
            this.elements.colorButtons.forEach(button => {
                if (button.dataset.color === this.currentSettings.color) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
        
        // 更新圖案
        if (this.elements.patternButtons) {
            this.elements.patternButtons.forEach(button => {
                if (button.dataset.pattern === this.currentSettings.pattern) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
        
        // 更新特效
        if (this.elements.effectButtons) {
            this.elements.effectButtons.forEach(button => {
                const effect = button.dataset.effect;
                if (this.currentSettings.effects.includes(effect)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    },
    
    // 取得當前設定
    getCurrentSettings: function() {
        return { ...this.currentSettings };
    },
    
    // 設定當前設定
    setCurrentSettings: function(settings) {
        this.currentSettings = { ...this.currentSettings, ...settings };
        this.updateUI();
        this.updateMainPreview();
    },
    
    // 重新載入設定
    reloadConfig: async function() {
        console.log('重新載入設定...');
        
        // 顯示載入狀態
        this.showLoadingState();
        
        // 清空現有資料
        this.availableFonts = [];
        this.shapes = [];
        this.colorGroups = [];
        this.patterns = [];
        this.loadedFonts = {};
        
        // 重新載入
        const success = await this.loadCustomConfig();
        
        if (success) {
            await this.initializeAll();
            await this.loadAllFonts();
            this.setDefaultValues();
            this.updateMainPreview();
            console.log('設定重新載入完成');
        } else {
            this.showErrorState('無法重新載入設定');
        }
    },
    
    // 清理資源
    cleanup: function() {
        // 移除載入的字體
        Object.values(this.loadedFonts).forEach(fontFace => {
            try {
                document.fonts.delete(fontFace);
            } catch (error) {
                console.error('移除字體失敗:', error);
            }
        });
        
        this.loadedFonts = {};
        console.log('資源已清理');
    }
};

// 當 DOM 載入完成時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        StampWidget.init();
    });
} else {
    // DOM 已經載入完成
    StampWidget.init();
}

// 匯出給全域使用
window.StampWidget = StampWidget;

console.log('印章小工具 v2.1.0 已載入 - 完全依賴後台設定版本');
console.log('作者: DK0124');
console.log('更新時間: 2025-01-29');
