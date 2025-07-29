/**
 * 印章系統後台管理
 * @author DK0124
 * @version 2.0.3
 * @date 2025-01-29
 */

// 設定管理器
const SettingsManager = {
    saveSettings: function(key, data) {
        try {
            localStorage.setItem(`stamp_admin_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('儲存設定失敗:', error);
            return false;
        }
    },
    
    loadSettings: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`stamp_admin_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('載入設定失敗:', error);
            return defaultValue;
        }
    },
    
    clearSettings: function(key) {
        localStorage.removeItem(`stamp_admin_${key}`);
    },
    
    clearAllSettings: function() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('stamp_admin_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// 全域變數
let currentPage = 'dashboard';
let uploadedData = {
    fonts: [],
    shapes: [],
    patterns: [],
    colors: []
};

// GitHub 設定
const GitHubConfig = {
    owner: 'DK0124',
    repo: 'stamp-font-preview',
    branch: 'main',
    configPath: 'config/stamp-config.json',
    
    getToken: function() {
        return localStorage.getItem('github_token') || '';
    },
    
    setToken: function(token) {
        localStorage.setItem('github_token', token);
    },
    
    promptToken: function() {
        const token = prompt('請輸入 GitHub Personal Access Token:');
        if (token) {
            this.setToken(token);
            return token;
        }
        return null;
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    initializeAdmin();
    setupSecurityFeatures();
    generateWatermark();
    
    setTimeout(() => {
        loadFromGitHub();
    }, 1000);
});

// 載入所有儲存的資料
function loadSavedData() {
    const savedUploadData = SettingsManager.loadSettings('uploadData', {
        fonts: [],
        shapes: [],
        patterns: [],
        colors: []
    });
    uploadedData = savedUploadData;
    
    const savedSecuritySettings = SettingsManager.loadSettings('security', {
        preventScreenshot: true,
        enableWatermark: true,
        disableRightClick: true,
        disableTextSelect: true,
        disableDevTools: true,
        encryptFonts: true,
        watermarkText: '© 2025 印章系統 - DK0124',
        watermarkInterval: 60
    });
    
    if (savedSecuritySettings.enableWatermark) {
        initializeWatermarkSettings();
    }
}

// 初始化管理系統
function initializeAdmin() {
    const lastPage = SettingsManager.loadSettings('currentPage', 'dashboard');
    currentPage = lastPage;
    
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            currentPage = this.dataset.page;
            loadPage(currentPage);
        });
        
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
        }
    });

    loadPage(currentPage);
}

// 載入頁面內容
function loadPage(page) {
    SettingsManager.saveSettings('currentPage', page);
    
    const content = document.getElementById('adminContent');
    const title = document.getElementById('pageTitle');
    
    switch(page) {
        case 'dashboard':
            title.textContent = '總覽';
            content.innerHTML = getDashboardContent();
            updateGitHubStatus(true);
            break;
        case 'fonts':
            title.textContent = '字體管理';
            content.innerHTML = getFontsContent();
            initializeFontsPage();
            break;
        case 'shapes':
            title.textContent = '形狀管理';
            content.innerHTML = getShapesContent();
            initializeShapesPage();
            break;
        case 'patterns':
            title.textContent = '圖案管理';
            content.innerHTML = getPatternsContent();
            initializePatternsPage();
            break;
        case 'colors':
            title.textContent = '顏色管理';
            content.innerHTML = getColorsContent();
            initializeColorsPage();
            break;
        case 'security':
            title.textContent = '安全設定';
            content.innerHTML = getSecurityContent();
            initializeSecurityPage();
            break;
    }
}

// 總覽頁面
function getDashboardContent() {
    return `
        <div class="grid grid-4">
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">text_fields</span>
                        字體數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-accent);">${uploadedData.fonts.length}</h2>
            </div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">category</span>
                        形狀數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-success);">${uploadedData.shapes.length}</h2>
            </div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">palette</span>
                        圖案數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-warning);">${uploadedData.patterns.length}</h2>
            </div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">color_lens</span>
                        顏色數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-danger);">${uploadedData.colors.length}</h2>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">timeline</span>
                    系統狀態
                </div>
            </div>
            <div class="grid grid-2">
                <div>
                    <p>防截圖保護：<span style="color: var(--admin-success);">啟用</span></p>
                    <p>浮水印保護：<span style="color: var(--admin-success);">啟用</span></p>
                    <p>右鍵保護：<span style="color: var(--admin-success);">啟用</span></p>
                </div>
                <div>
                    <p>最後更新：${new Date().toLocaleString('zh-TW')}</p>
                    <p>系統版本：2.0.3</p>
                    <p>授權狀態：<span style="color: var(--admin-success);">有效</span></p>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">info</span>
                    GitHub 連線狀態
                </div>
            </div>
            <div id="githubStatus">
                <p>檢查中...</p>
            </div>
        </div>
    `;
}

// 字體管理頁面
function getFontsContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">upload_file</span>
                    上傳字體
                </div>
                <button class="btn btn-primary" onclick="showFontSettings()">
                    <span class="material-icons">settings</span>
                    字體設定
                </button>
            </div>
            <div class="upload-area" id="fontUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放字體檔案到此處，或點擊選擇檔案</p>
                <p style="font-size: 12px; color: var(--admin-border); margin-top: 10px;">
                    支援格式：.ttf, .otf, .woff, .woff2
                </p>
                <input type="file" id="fontFileInput" multiple accept=".ttf,.otf,.woff,.woff2" style="display: none;">
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">list</span>
                    字體列表
                </div>
            </div>
            <div id="fontsList">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>順序</th>
                            <th>字體名稱</th>
                            <th>檔案大小</th>
                            <th>字重</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="fontsTableBody" class="sortable-fonts">
                        <!-- 動態載入 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 形狀管理頁面
function getShapesContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">upload_file</span>
                    上傳形狀
                </div>
            </div>
            <div class="upload-area" id="shapeUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放形狀圖片到此處，或點擊選擇檔案</p>
                <p style="font-size: 12px; color: var(--admin-border); margin-top: 10px;">
                    支援格式：.png, .jpg, .svg (建議使用透明背景PNG)
                </p>
                <input type="file" id="shapeFileInput" multiple accept=".png,.jpg,.jpeg,.svg" style="display: none;">
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">grid_view</span>
                    形狀預覽
                </div>
            </div>
            <div class="preview-grid" id="shapesPreview">
                <!-- 動態載入 -->
            </div>
        </div>
    `;
}

// 圖案管理頁面
function getPatternsContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">upload_file</span>
                    上傳圖案
                </div>
            </div>
            <div class="upload-area" id="patternUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放圖案到此處，或點擊選擇檔案</p>
                <p style="font-size: 12px; color: var(--admin-border); margin-top: 10px;">
                    支援格式：.png, .jpg, .svg (建議尺寸：64x64px)
                </p>
                <input type="file" id="patternFileInput" multiple accept=".png,.jpg,.jpeg,.svg" style="display: none;">
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">auto_awesome</span>
                    圖案預覽
                </div>
            </div>
            <div class="preview-grid" id="patternsPreview">
                <!-- 動態載入 -->
            </div>
        </div>
    `;
}

// 顏色管理頁面
function getColorsContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">palette</span>
                    新增顏色組
                </div>
            </div>
            <div class="grid grid-3">
                <div class="form-group">
                    <label class="form-label">顏色名稱</label>
                    <input type="text" class="form-control" id="colorName" placeholder="例如：朱紅色">
                </div>
                <div class="form-group">
                    <label class="form-label">主色色碼</label>
                    <input type="color" class="form-control" id="colorMain" value="#dc3545">
                </div>
                <div class="form-group">
                    <label class="form-label">&nbsp;</label>
                    <button class="btn btn-primary" onclick="addColorGroup()" style="width: 100%;">
                        <span class="material-icons">add</span>
                        新增顏色組
                    </button>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">color_lens</span>
                    顏色組列表
                </div>
            </div>
            <div class="color-picker-grid" id="colorGroups">
                <!-- 動態載入 -->
            </div>
        </div>
    `;
}

// 安全設定頁面
function getSecurityContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">security</span>
                    安全防護設定
                </div>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="preventScreenshot" checked>
                        防止截圖保護
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        偵測到截圖行為時顯示黑畫面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="enableWatermark" checked>
                        啟用浮水印
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        在整個介面顯示浮水印
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="disableRightClick" checked>
                        禁用右鍵選單
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止右鍵另存圖片
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="disableTextSelect" checked>
                        禁止文字選取
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止複製文字內容
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="disableDevTools" checked>
                        偵測開發者工具
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        開啟開發者工具時自動關閉頁面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="encryptFonts" checked>
                        字體加密保護
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        加密字體檔案防止下載
                    </p>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">text_fields</span>
                    浮水印設定
                </div>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">浮水印文字</label>
                    <input type="text" class="form-control" id="watermarkText" value="© 2025 印章系統 - DK0124">
                </div>
                <div class="form-group">
                    <label class="form-label">更新頻率（秒）</label>
                    <input type="number" class="form-control" id="watermarkInterval" value="60" min="10">
                </div>
            </div>
            <button class="btn btn-success" onclick="updateSecuritySettings()">
                <span class="material-icons">save</span>
                儲存設定
            </button>
        </div>
    `;
}

// 初始化字體頁面
function initializeFontsPage() {
    const uploadArea = document.getElementById('fontUploadArea');
    const fileInput = document.getElementById('fontFileInput');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        handleFontFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFontFiles(e.target.files);
    });
    
    updateFontsTable();
    
    const fontsTableBody = document.getElementById('fontsTableBody');
    if (fontsTableBody && typeof Sortable !== 'undefined') {
        new Sortable(fontsTableBody, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: updateFontOrder
        });
    }
}

// 初始化形狀頁面
function initializeShapesPage() {
    const uploadArea = document.getElementById('shapeUploadArea');
    const fileInput = document.getElementById('shapeFileInput');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        handleShapeFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleShapeFiles(e.target.files);
    });
    
    updateShapesPreview();
}

// 初始化圖案頁面
function initializePatternsPage() {
    const uploadArea = document.getElementById('patternUploadArea');
    const fileInput = document.getElementById('patternFileInput');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        handlePatternFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handlePatternFiles(e.target.files);
    });
    
    updatePatternsPreview();
}

// 初始化顏色頁面
function initializeColorsPage() {
    displayColorGroups();
}

// 初始化安全設定頁面
function initializeSecurityPage() {
    const settings = SettingsManager.loadSettings('security', {
        preventScreenshot: true,
        enableWatermark: true,
        disableRightClick: true,
        disableTextSelect: true,
        disableDevTools: true,
        encryptFonts: true,
        watermarkText: '© 2025 印章系統 - DK0124',
        watermarkInterval: 60
    });
    
    if (document.getElementById('preventScreenshot')) {
        document.getElementById('preventScreenshot').checked = settings.preventScreenshot;
        document.getElementById('enableWatermark').checked = settings.enableWatermark;
        document.getElementById('disableRightClick').checked = settings.disableRightClick;
        document.getElementById('disableTextSelect').checked = settings.disableTextSelect;
        document.getElementById('disableDevTools').checked = settings.disableDevTools;
        document.getElementById('encryptFonts').checked = settings.encryptFonts;
        document.getElementById('watermarkText').value = settings.watermarkText;
        document.getElementById('watermarkInterval').value = settings.watermarkInterval;
    }
}

// 處理字體檔案
function handleFontFiles(files) {
    Array.from(files).forEach(file => {
        if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fontData = {
                    id: Date.now() + Math.random(),
                    name: file.name.replace(/\.[^.]+$/, ''),
                    file: file,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    weight: 'normal',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    url: e.target.result,
                    uploaded: false
                };
                
                uploadedData.fonts.push(fontData);
                updateFontsTable();
                SettingsManager.saveSettings('uploadData', uploadedData);
                showNotification('字體上傳成功', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 處理形狀檔案
function handleShapeFiles(files) {
    Array.from(files).forEach(file => {
        if (file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const shapeData = {
                    id: Date.now() + Math.random(),
                    name: file.name.replace(/\.[^.]+$/, ''),
                    file: file,
                    url: e.target.result,
                    uploaded: false
                };
                
                uploadedData.shapes.push(shapeData);
                updateShapesPreview();
                SettingsManager.saveSettings('uploadData', uploadedData);
                showNotification('形狀上傳成功', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 處理圖案檔案
function handlePatternFiles(files) {
    Array.from(files).forEach(file => {
        if (file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const patternData = {
                    id: Date.now() + Math.random(),
                    name: file.name.replace(/\.[^.]+$/, ''),
                    file: file,
                    url: e.target.result,
                    uploaded: false
                };
                
                uploadedData.patterns.push(patternData);
                updatePatternsPreview();
                SettingsManager.saveSettings('uploadData', uploadedData);
                showNotification('圖案上傳成功', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 更新字體表格
function updateFontsTable() {
    const tbody = document.getElementById('fontsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = uploadedData.fonts.map((font, index) => `
        <tr data-id="${font.id}">
            <td><span class="material-icons" style="cursor: move;">drag_indicator</span></td>
            <td>${font.name}</td>
            <td>${font.size}</td>
            <td>${font.weight}</td>
            <td>
                ${font.uploaded ? 
                    '<span style="color: var(--admin-success);">已上傳</span>' : 
                    '<span style="color: var(--admin-warning);">待上傳</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editFont('${font.id}')">
                    <span class="material-icons">edit</span>
                </button>
                ${!font.uploaded ? 
                    `<button class="btn btn-sm btn-info" onclick="uploadSingleFont('${font.id}')">
                        <span class="material-icons">upload</span>
                    </button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteFont('${font.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// 更新形狀預覽
function updateShapesPreview() {
    const preview = document.getElementById('shapesPreview');
    if (!preview) return;
    
    preview.innerHTML = uploadedData.shapes.map(shape => `
        <div class="preview-item" data-id="${shape.id}">
            <img src="${shape.url}" alt="${shape.name}" style="width: 100%; height: 100px; object-fit: contain;">
            <p style="margin-top: 8px; font-size: 12px;">${shape.name}</p>
            ${shape.uploaded ? 
                '<span style="color: var(--admin-success); font-size: 10px;">已上傳</span>' : 
                '<span style="color: var(--admin-warning); font-size: 10px;">待上傳</span>'}
            <button class="btn btn-sm btn-danger" onclick="deleteShape('${shape.id}')" style="margin-top: 5px;">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// 更新圖案預覽
function updatePatternsPreview() {
    const preview = document.getElementById('patternsPreview');
    if (!preview) return;
    
    preview.innerHTML = uploadedData.patterns.map(pattern => `
        <div class="preview-item" data-id="${pattern.id}">
            <img src="${pattern.url}" alt="${pattern.name}" style="width: 64px; height: 64px; object-fit: contain;">
            <p style="margin-top: 8px; font-size: 12px;">${pattern.name}</p>
            ${pattern.uploaded ? 
                '<span style="color: var(--admin-success); font-size: 10px;">已上傳</span>' : 
                '<span style="color: var(--admin-warning); font-size: 10px;">待上傳</span>'}
            <button class="btn btn-sm btn-danger" onclick="deletePattern('${pattern.id}')" style="margin-top: 5px;">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// 新增顏色組
function addColorGroup() {
    const name = document.getElementById('colorName').value;
    const mainColor = document.getElementById('colorMain').value;
    
    if (!name || !mainColor) {
        showNotification('請填寫所有欄位', 'warning');
        return;
    }
    
    const colorGroup = {
        id: Date.now(),
        name: name,
        main: mainColor,
        shades: generateColorShades(mainColor)
    };
    
    uploadedData.colors.push(colorGroup);
    displayColorGroups();
    SettingsManager.saveSettings('uploadData', uploadedData);
    
    document.getElementById('colorName').value = '';
    document.getElementById('colorMain').value = '#dc3545';
    
    showNotification('顏色組新增成功', 'success');
}

// 生成顏色漸層
function generateColorShades(baseColor) {
    const shades = [];
    const color = hexToRgb(baseColor);
    
    for (let i = 0; i < 4; i++) {
        const factor = 1 - (i * 0.2);
        const shade = {
            r: Math.round(color.r * factor),
            g: Math.round(color.g * factor),
            b: Math.round(color.b * factor)
        };
        shades.push(rgbToHex(shade.r, shade.g, shade.b));
    }
    
    return shades;
}

// 顏色轉換輔助函數
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 顯示顏色組
function displayColorGroups() {
    const container = document.getElementById('colorGroups');
    if (!container) return;
    
    container.innerHTML = uploadedData.colors.map(group => `
        <div class="color-item" data-id="${group.id}">
            <div class="color-preview" style="background-color: ${group.main};"></div>
            <div>
                <p style="font-weight: 500;">${group.name}</p>
                <p style="font-size: 12px; color: var(--admin-border);">${group.main}</p>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteColor(${group.id})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// 刪除函數
function deleteFont(id) {
    if (confirm('確定要刪除這個字體嗎？')) {
        uploadedData.fonts = uploadedData.fonts.filter(f => f.id != id);
        updateFontsTable();
        SettingsManager.saveSettings('uploadData', uploadedData);
        showNotification('字體已刪除', 'info');
    }
}

function deleteShape(id) {
    if (confirm('確定要刪除這個形狀嗎？')) {
        uploadedData.shapes = uploadedData.shapes.filter(s => s.id != id);
        updateShapesPreview();
        SettingsManager.saveSettings('uploadData', uploadedData);
        showNotification('形狀已刪除', 'info');
    }
}

function deletePattern(id) {
    if (confirm('確定要刪除這個圖案嗎？')) {
        uploadedData.patterns = uploadedData.patterns.filter(p => p.id != id);
        updatePatternsPreview();
        SettingsManager.saveSettings('uploadData', uploadedData);
        showNotification('圖案已刪除', 'info');
    }
}

function deleteColor(id) {
    if (confirm('確定要刪除這個顏色組嗎？')) {
        uploadedData.colors = uploadedData.colors.filter(c => c.id != id);
        displayColorGroups();
        SettingsManager.saveSettings('uploadData', uploadedData);
        showNotification('顏色組已刪除', 'info');
    }
}

// 編輯字體
function editFont(id) {
    const font = uploadedData.fonts.find(f => f.id == id);
    if (!font) return;
    
    const content = `
        <div class="form-group">
            <label class="form-label">字體名稱</label>
            <input type="text" class="form-control" id="editFontName" value="${font.name}">
        </div>
        <div class="form-group">
            <label class="form-label">字重</label>
            <select class="form-control" id="editFontWeight">
                <option value="normal" ${font.weight === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="bold" ${font.weight === 'bold' ? 'selected' : ''}>Bold</option>
                <option value="100" ${font.weight === '100' ? 'selected' : ''}>100 - Thin</option>
                <option value="300" ${font.weight === '300' ? 'selected' : ''}>300 - Light</option>
                <option value="400" ${font.weight === '400' ? 'selected' : ''}>400 - Regular</option>
                <option value="500" ${font.weight === '500' ? 'selected' : ''}>500 - Medium</option>
                <option value="600" ${font.weight === '600' ? 'selected' : ''}>600 - Semi Bold</option>
                <option value="700" ${font.weight === '700' ? 'selected' : ''}>700 - Bold</option>
                <option value="900" ${font.weight === '900' ? 'selected' : ''}>900 - Black</option>
            </select>
        </div>
        <button class="btn btn-primary" onclick="saveEditFont('${id}')">儲存</button>
    `;
    
    showModal('編輯字體', content);
}

// 儲存編輯的字體
function saveEditFont(id) {
    const font = uploadedData.fonts.find(f => f.id == id);
    if (!font) return;
    
    font.name = document.getElementById('editFontName').value;
    font.weight = document.getElementById('editFontWeight').value;
    
    updateFontsTable();
    SettingsManager.saveSettings('uploadData', uploadedData);
    closeModal();
    showNotification('字體已更新', 'success');
}

// 更新字體順序
function updateFontOrder(evt) {
    console.log('Font order updated');
}

// ============= GitHub 整合功能 =============

// 上傳單一字體檔案
async function uploadSingleFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    const success = await uploadFontFile(font);
    if (success) {
        font.uploaded = true;
        updateFontsTable();
        SettingsManager.saveSettings('uploadData', uploadedData);
    }
}

// 上傳字體檔案到 GitHub
async function uploadFontFile(fontData) {
    const token = GitHubConfig.getToken();
    if (!token) {
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return false;
    }
    
    try {
        console.log('開始上傳字體檔案:', fontData.name);
        showNotification(`正在上傳字體: ${fontData.name}...`, 'info');
        
        const base64Content = fontData.url.split(',')[1];
        const extension = fontData.file ? 
            fontData.file.name.split('.').pop() : 
            'ttf';
        
        const filePath = `assets/fonts/${fontData.name}.${extension}`;
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        let sha = null;
        const checkResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
            console.log('檔案已存在，將更新');
        }
        
        const requestBody = {
            message: `Upload font: ${fontData.name}`,
            content: base64Content,
            branch: GitHubConfig.branch
        };
        
        if (sha) {
            requestBody.sha = sha;
        }
        
        const uploadResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('字體檔案上傳成功:', result.content.path);
            fontData.githubPath = filePath;
            fontData.uploaded = true;
            showNotification(`字體 ${fontData.name} 上傳成功`, 'success');
            return true;
        } else {
            const error = await uploadResponse.json();
            console.error('上傳失敗:', error);
            showNotification(`字體上傳失敗: ${error.message}`, 'danger');
            return false;
        }
        
    } catch (error) {
        console.error('上傳錯誤:', error);
        showNotification('字體上傳失敗：' + error.message, 'danger');
        return false;
    }
}

// 批次上傳所有字體檔案
async function uploadAllFonts() {
    const token = GitHubConfig.getToken();
    if (!token) {
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return;
    }
    
    const unuploadedFonts = uploadedData.fonts.filter(f => !f.uploaded);
    
    if (unuploadedFonts.length === 0) {
        showNotification('沒有需要上傳的字體', 'info');
        return;
    }
    
    showNotification(`開始上傳 ${unuploadedFonts.length} 個字體檔案...`, 'info');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const font of unuploadedFonts) {
        if (font.url && font.url.startsWith('data:')) {
            const success = await uploadFontFile(font);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    updateFontsTable();
    SettingsManager.saveSettings('uploadData', uploadedData);
    
    if (successCount > 0) {
        showNotification(`成功上傳 ${successCount} 個字體檔案`, 'success');
    }
    
    if (failCount > 0) {
        showNotification(`${failCount} 個字體上傳失敗`, 'warning');
    }
}

// 上傳形狀檔案
async function uploadShapeFile(shapeData) {
    const token = GitHubConfig.getToken();
    if (!token) return false;
    
    try {
        const base64Content = shapeData.url.split(',')[1];
        const extension = shapeData.file ? 
            shapeData.file.name.split('.').pop() : 
            'png';
        
        const filePath = `assets/shapes/${shapeData.name}.${extension}`;
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        let sha = null;
        const checkResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }
        
        const requestBody = {
            message: `Upload shape: ${shapeData.name}`,
            content: base64Content,
            branch: GitHubConfig.branch
        };
        
        if (sha) {
            requestBody.sha = sha;
        }
        
        const uploadResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (uploadResponse.ok) {
            shapeData.githubPath = filePath;
            shapeData.uploaded = true;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('上傳形狀錯誤:', error);
        return false;
    }
}

// 上傳圖案檔案
async function uploadPatternFile(patternData) {
    const token = GitHubConfig.getToken();
    if (!token) return false;
    
    try {
        const base64Content = patternData.url.split(',')[1];
        const extension = patternData.file ? 
            patternData.file.name.split('.').pop() : 
            'png';
        
        const filePath = `assets/patterns/${patternData.name}.${extension}`;
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        let sha = null;
        const checkResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }
        
        const requestBody = {
            message: `Upload pattern: ${patternData.name}`,
            content: base64Content,
            branch: GitHubConfig.branch
        };
        
        if (sha) {
            requestBody.sha = sha;
        }
        
        const uploadResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (uploadResponse.ok) {
            patternData.githubPath = filePath;
            patternData.uploaded = true;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('上傳圖案錯誤:', error);
        return false;
    }
}

// 儲存到 GitHub
async function saveToGitHub() {
    const token = GitHubConfig.getToken();
    if (!token) {
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return;
    }
    
    const uploadFiles = confirm('是否要同時上傳所有檔案？（字體、形狀、圖案）\n這可能需要較長時間。');
    
    if (uploadFiles) {
        await uploadAllFonts();
        
        for (const shape of uploadedData.shapes.filter(s => !s.uploaded)) {
            await uploadShapeFile(shape);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        updateShapesPreview();
        
        for (const pattern of uploadedData.patterns.filter(p => !p.uploaded)) {
            await uploadPatternFile(pattern);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        updatePatternsPreview();
        
        SettingsManager.saveSettings('uploadData', uploadedData);
    }
    
    console.log('開始儲存設定到 GitHub...');
    
    try {
        const config = {
            fonts: uploadedData.fonts.map(f => ({
                id: f.id,
                name: f.name,
                filename: f.name + '.' + (f.file ? f.file.name.split('.').pop() : 'ttf'),
                displayName: f.name,
                category: 'custom',
                weight: f.weight || 'normal',
                githubPath: f.githubPath || null
            })),
            shapes: uploadedData.shapes.map(s => ({
                id: s.id,
                name: s.name,
                class: s.name,
                githubPath: s.githubPath || null
            })),
            patterns: uploadedData.patterns.map(p => ({
                id: p.id,
                name: p.name,
                githubPath: p.githubPath || null
            })),
            colors: uploadedData.colors,
            lastUpdate: new Date().toISOString(),
            version: '2.0.3'
        };
        
        console.log('準備儲存的資料:', config);
        
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${GitHubConfig.configPath}`;
        
        let sha = null;
        console.log('正在取得檔案 SHA...');
        
        const getResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
            console.log('取得 SHA:', sha);
        } else {
            console.log('檔案不存在，將建立新檔案');
        }
        
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
        
        const requestBody = {
            message: `Update stamp config - ${new Date().toLocaleString('zh-TW')}`,
            content: content,
            branch: GitHubConfig.branch
        };
        
        if (sha) {
            requestBody.sha = sha;
        }
        
        console.log('發送更新請求...');
        
        const updateResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const responseData = await updateResponse.json();
        console.log('GitHub 回應:', responseData);
        
        if (updateResponse.ok) {
            showNotification('設定已成功儲存到 GitHub', 'success');
            console.log('儲存成功！');
            
            if (responseData.commit) {
                console.log('Commit SHA:', responseData.commit.sha);
                console.log('Commit URL:', responseData.commit.html_url);
            }
        } else {
            console.error('GitHub API 錯誤:', responseData);
            showNotification(`儲存失敗: ${responseData.message || '未知錯誤'}`, 'danger');
        }
        
    } catch (error) {
        console.error('儲存過程發生錯誤:', error);
        showNotification('儲存失敗：' + error.message, 'danger');
    }
}

// 從 GitHub 載入設定
async function loadFromGitHub() {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/${GitHubConfig.owner}/${GitHubConfig.repo}/${GitHubConfig.branch}/${GitHubConfig.configPath}`
        );
        
        if (response.ok) {
            const config = await response.json();
            
            uploadedData.fonts = config.fonts || [];
            uploadedData.shapes = config.shapes || [];
            uploadedData.patterns = config.patterns || [];
            uploadedData.colors = config.colors || [];
            
            uploadedData.fonts.forEach(f => {
                if (f.githubPath) f.uploaded = true;
            });
            uploadedData.shapes.forEach(s => {
                if (s.githubPath) s.uploaded = true;
            });
            uploadedData.patterns.forEach(p => {
                if (p.githubPath) p.uploaded = true;
            });
            
            SettingsManager.saveSettings('uploadData', uploadedData);
            
            if (currentPage === 'fonts') updateFontsTable();
            if (currentPage === 'shapes') updateShapesPreview();
            if (currentPage === 'patterns') updatePatternsPreview();
            if (currentPage === 'colors') displayColorGroups();
            if (currentPage === 'dashboard') loadPage('dashboard');
            
            showNotification('設定載入成功', 'success');
            updateGitHubStatus(true);
        } else {
            updateGitHubStatus(false);
        }
    } catch (error) {
        console.error('載入錯誤:', error);
        showNotification('載入失敗', 'warning');
        updateGitHubStatus(false);
    }
}

// 更新 GitHub 狀態顯示
function updateGitHubStatus(connected) {
    const statusElement = document.getElementById('githubStatus');
    if (statusElement) {
        if (connected) {
            statusElement.innerHTML = `
                <p style="color: var(--admin-success);">
                    <span class="material-icons" style="vertical-align: middle;">check_circle</span>
                    已連接到 GitHub
                </p>
                <p>Repository: ${GitHubConfig.owner}/${GitHubConfig.repo}</p>
                <p>Branch: ${GitHubConfig.branch}</p>
            `;
        } else {
            statusElement.innerHTML = `
                <p style="color: var(--admin-warning);">
                    <span class="material-icons" style="vertical-align: middle;">warning</span>
                    未連接到 GitHub
                </p>
            `;
        }
    }
}

// 測試 GitHub 連線
async function testGitHubConnection() {
    const token = GitHubConfig.getToken();
    if (!token) {
        showNotification('請先設定 GitHub Token', 'warning');
        return;
    }
    
    try {
        console.log('測試 Token...');
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('Token 有效，用戶:', userData.login);
            showNotification(`Token 有效，用戶: ${userData.login}`, 'success');
        } else {
            console.error('Token 無效');
            showNotification('Token 無效', 'danger');
            return;
        }
        
        console.log('測試 Repository 存取...');
        const repoResponse = await fetch(`https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (repoResponse.ok) {
            const repoData = await repoResponse.json();
            console.log('可以存取 Repository:', repoData.full_name);
            console.log('Repository 權限:', repoData.permissions);
            showNotification('可以存取 Repository', 'success');
        } else {
            console.error('無法存取 Repository');
            showNotification('無法存取 Repository', 'danger');
        }
        
        console.log('測試檔案存取...');
        const fileResponse = await fetch(`https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${GitHubConfig.configPath}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (fileResponse.ok) {
            console.log('可以存取設定檔案');
            showNotification('所有測試通過！', 'success');
        } else if (fileResponse.status === 404) {
            console.log('設定檔案不存在（需要建立）');
            showNotification('設定檔案不存在，請先儲存設定', 'info');
        } else {
            console.error('無法存取設定檔案');
            showNotification('無法存取設定檔案', 'danger');
        }
        
    } catch (error) {
        console.error('測試失敗:', error);
        showNotification('測試失敗: ' + error.message, 'danger');
    }
}

// 加入 GitHub 控制按鈕
function addGitHubButtons() {
    const header = document.querySelector('.admin-user');
    if (header) {
        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = 'display: flex; gap: 10px; margin-left: 20px;';
        
        buttonGroup.innerHTML = `
            <button class="btn btn-warning" onclick="testGitHubConnection()">
                <span class="material-icons">bug_report</span>
                測試連線
            </button>
            <button class="btn btn-info" onclick="uploadAllFonts()">
                <span class="material-icons">upload_file</span>
                上傳字體
            </button>
            <button class="btn btn-primary" onclick="loadFromGitHub()">
                <span class="material-icons">cloud_download</span>
                從 GitHub 載入
            </button>
            <button class="btn btn-success" onclick="saveToGitHub()">
                <span class="material-icons">cloud_upload</span>
                儲存到 GitHub
            </button>
        `;
        
        header.parentElement.insertBefore(buttonGroup, header);
    }
}

// 安全防護功能
function setupSecurityFeatures() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            const screenshotProtection = document.getElementById('screenshotProtection');
            if (screenshotProtection) {
                screenshotProtection.style.display = 'flex';
                setTimeout(() => {
                    screenshotProtection.style.display = 'none';
                }, 2000);
            }
        }
    });
    
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                handleDevToolsOpen();
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });
}

// 處理開發者工具開啟
function handleDevToolsOpen() {
    const checkbox = document.getElementById('disableDevTools');
    if (checkbox && checkbox.checked) {
        alert('偵測到開發者工具，系統將關閉');
        window.location.href = 'about:blank';
    }
}

// 生成浮水印
function generateWatermark() {
    const existingWatermark = document.getElementById('watermarkLayer');
    if (existingWatermark) {
        existingWatermark.remove();
    }
    
    const watermarkLayer = document.createElement('div');
    watermarkLayer.id = 'watermarkLayer';
    watermarkLayer.className = 'watermark-layer';
    watermarkLayer.style.cssText = `
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
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    `;
    
    const watermarkTextInput = document.getElementById('watermarkText');
    const watermarkText = watermarkTextInput ? watermarkTextInput.value : `© 2025 印章系統 - DK0124`;
    
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
                position: absolute;
                left: ${col * watermarkWidth}px;
                top: ${row * watermarkHeight}px;
                width: ${watermarkWidth}px;
                height: ${watermarkHeight}px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(-45deg);
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: rgba(0, 0, 0, 0.5);
                text-align: center;
                white-space: nowrap;
                letter-spacing: 2px;
                text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
            `;
            
            const timestamp = new Date().toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
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
    setupWatermarkProtection();
    
    const updateInterval = getWatermarkInterval();
    if (window.watermarkUpdateTimer) {
        clearInterval(window.watermarkUpdateTimer);
    }
    
    window.watermarkUpdateTimer = setInterval(() => {
        updateWatermarkContent();
    }, updateInterval);
    
    console.log('浮水印已生成');
}

function getCurrentUser() {
    const githubUser = localStorage.getItem('github_user');
    if (githubUser) return githubUser;
    return 'DK0124';
}

function getWatermarkInterval() {
    const intervalInput = document.getElementById('watermarkInterval');
    const interval = intervalInput ? parseInt(intervalInput.value) : 60;
    return interval * 1000;
}

function setupWatermarkProtection() {
    const observer = new MutationObserver((mutations) => {
        const watermarkExists = document.getElementById('watermarkLayer');
        if (!watermarkExists) {
            console.warn('偵測到浮水印被移除，正在重新生成...');
            generateWatermark();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    Object.defineProperty(window, 'watermarkLayer', {
        get: function() {
            console.warn('禁止存取浮水印層');
            return null;
        },
        set: function() {
            console.warn('禁止修改浮水印層');
            return false;
        },
        configurable: false
    });
    
    setInterval(() => {
        const watermark = document.getElementById('watermarkLayer');
        if (watermark) {
            if (watermark.style.display === 'none' || 
                watermark.style.visibility === 'hidden' ||
                parseFloat(watermark.style.opacity) === 0) {
                watermark.style.display = 'block';
                watermark.style.visibility = 'visible';
                watermark.style.opacity = '0.08';
                console.warn('偵測到浮水印被隱藏，已恢復顯示');
            }
        } else {
            generateWatermark();
        }
    }, 1000);
}

function updateWatermarkContent() {
    const watermarkLayer = document.getElementById('watermarkLayer');
    if (!watermarkLayer) {
        generateWatermark();
        return;
    }
    
    const watermarkItems = watermarkLayer.querySelectorAll('.watermark-text');
    const timestamp = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    watermarkItems.forEach(item => {
        const timeDiv = item.querySelector('div > div:last-child');
        if (timeDiv) {
            timeDiv.textContent = timestamp;
        }
    });
}

window.addEventListener('resize', debounce(() => {
    generateWatermark();
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

if (!document.getElementById('watermarkStyles')) {
    const watermarkStyles = document.createElement('style');
    watermarkStyles.id = 'watermarkStyles';
    watermarkStyles.textContent = `
        .watermark-layer {
            animation: watermarkFloat 30s linear infinite;
        }
        
        @keyframes watermarkFloat {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-10px, -10px); }
            50% { transform: translate(0, -20px); }
            75% { transform: translate(10px, -10px); }
            100% { transform: translate(0, 0); }
        }
        
        .watermark-text {
            transition: opacity 0.3s ease;
        }
        
        .watermark-text:hover {
            opacity: 0.2 !important;
        }
        
        @media print {
            .watermark-layer {
                opacity: 0.2 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    `;
    document.head.appendChild(watermarkStyles);
}

function initializeWatermarkSettings() {
    const savedSettings = localStorage.getItem('watermarkSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            const watermarkTextInput = document.getElementById('watermarkText');
            const watermarkIntervalInput = document.getElementById('watermarkInterval');
            
            if (watermarkTextInput && settings.text) {
                watermarkTextInput.value = settings.text;
            }
            if (watermarkIntervalInput && settings.interval) {
                watermarkIntervalInput.value = settings.interval;
            }
        } catch (error) {
            console.error('載入浮水印設定失敗:', error);
        }
    }
}

function saveWatermarkSettings() {
    const watermarkTextInput = document.getElementById('watermarkText');
    const watermarkIntervalInput = document.getElementById('watermarkInterval');
    
    const settings = {
        text: watermarkTextInput ? watermarkTextInput.value : `© 2025 印章系統 - ${getCurrentUser()}`,
        interval: watermarkIntervalInput ? watermarkIntervalInput.value : 60
    };
    
    localStorage.setItem('watermarkSettings', JSON.stringify(settings));
    generateWatermark();
    console.log('浮水印設定已儲存');
}

// 顯示提示
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'var(--admin-success)' : 
                     type === 'warning' ? 'var(--admin-warning)' : 
                     type === 'danger' ? 'var(--admin-danger)' : 'var(--admin-accent)'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 模態框功能
function showModal(title, content) {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle"></h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body" id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 字體設定
function showFontSettings() {
    const content = `
        <div class="grid grid-2">
            <div class="form-group">
                <label class="form-label">預設字體大小</label>
                <input type="number" class="form-control" id="defaultFontSize" value="16" min="10" max="72">
            </div>
            <div class="form-group">
                <label class="form-label">預設行高</label>
                <input type="number" class="form-control" id="defaultLineHeight" value="1.5" min="1" max="3" step="0.1">
            </div>
            <div class="form-group">
                <label class="form-label">預設字重</label>
                <select class="form-control" id="defaultFontWeight">
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="100">100 - Thin</option>
                    <option value="300">300 - Light</option>
                    <option value="400">400 - Regular</option>
                    <option value="500">500 - Medium</option>
                    <option value="600">600 - Semi Bold</option>
                    <option value="700">700 - Bold</option>
                    <option value="900">900 - Black</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">字體渲染</label>
                <select class="form-control" id="fontRendering">
                    <option value="auto">自動</option>
                    <option value="optimizeSpeed">速度優先</option>
                    <option value="optimizeLegibility">清晰度優先</option>
                    <option value="geometricPrecision">幾何精度</option>
                </select>
            </div>
        </div>
        <button class="btn btn-primary" onclick="saveFontSettings()">儲存設定</button>
    `;
    
    showModal('字體全域設定', content);
}

function saveFontSettings() {
    const settings = {
        defaultFontSize: document.getElementById('defaultFontSize').value,
        defaultLineHeight: document.getElementById('defaultLineHeight').value,
        defaultFontWeight: document.getElementById('defaultFontWeight').value,
        fontRendering: document.getElementById('fontRendering').value
    };
    
    SettingsManager.saveSettings('fontSettings', settings);
    closeModal();
    showNotification('字體設定已儲存', 'success');
}

// 更新安全設定
function updateSecuritySettings() {
    const settings = {
        preventScreenshot: document.getElementById('preventScreenshot').checked,
        enableWatermark: document.getElementById('enableWatermark').checked,
        disableRightClick: document.getElementById('disableRightClick').checked,
        disableTextSelect: document.getElementById('disableTextSelect').checked,
        disableDevTools: document.getElementById('disableDevTools').checked,
        encryptFonts: document.getElementById('encryptFonts').checked,
        watermarkText: document.getElementById('watermarkText').value,
        watermarkInterval: document.getElementById('watermarkInterval').value
    };
    
    SettingsManager.saveSettings('security', settings);
    showNotification('安全設定已更新', 'success');
    applySecuritySettings(settings);
}

function applySecuritySettings(settings) {
    if (settings.enableWatermark) {
        generateWatermark();
    } else {
        const watermark = document.getElementById('watermarkLayer');
        if (watermark) watermark.remove();
    }
    
    if (settings.disableRightClick) {
        document.addEventListener('contextmenu', preventRightClick);
    } else {
        document.removeEventListener('contextmenu', preventRightClick);
    }
    
    if (settings.disableTextSelect) {
        document.body.style.userSelect = 'none';
    } else {
        document.body.style.userSelect = 'auto';
    }
}

function preventRightClick(e) {
    e.preventDefault();
    return false;
}

// 清除 Token
function clearGitHubToken() {
    if (confirm('確定要清除儲存的 GitHub Token 嗎？')) {
        localStorage.removeItem('github_token');
        showNotification('GitHub Token 已清除', 'info');
        updateGitHubStatus(false);
    }
}

// 匯出設定
function exportSettings() {
    const settings = {
        fonts: uploadedData.fonts,
        shapes: uploadedData.shapes,
        patterns: uploadedData.patterns,
        colors: uploadedData.colors,
        exportDate: new Date().toISOString(),
        version: '2.0.3'
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stamp-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('設定已匯出', 'success');
}

// 匯入設定
function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);
                
                if (confirm('確定要匯入這個設定檔嗎？這會覆蓋現有的設定。')) {
                    uploadedData.fonts = settings.fonts || [];
                    uploadedData.shapes = settings.shapes || [];
                    uploadedData.patterns = settings.patterns || [];
                    uploadedData.colors = settings.colors || [];
                    
                    SettingsManager.saveSettings('uploadData', uploadedData);
                    loadPage(currentPage);
                    showNotification('設定已匯入', 'success');
                }
            } catch (error) {
                showNotification('匯入失敗：檔案格式錯誤', 'danger');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 清除所有本地資料
function clearAllLocalData() {
    if (confirm('確定要清除所有本地儲存的資料嗎？這個操作無法復原。')) {
        SettingsManager.clearAllSettings();
        localStorage.removeItem('github_token');
        
        uploadedData = {
            fonts: [],
            shapes: [],
            patterns: [],
            colors: []
        };
        
        location.reload();
    }
}

// 初始化時加入按鈕和載入設定
setTimeout(() => {
    addGitHubButtons();
    
    const header = document.querySelector('.admin-user');
    if (header) {
        const exportImportGroup = document.createElement('div');
        exportImportGroup.style.cssText = 'display: flex; gap: 10px; margin-left: 10px;';
        
        exportImportGroup.innerHTML = `
            <button class="btn btn-secondary" onclick="exportSettings()">
                <span class="material-icons">download</span>
                匯出設定
            </button>
            <button class="btn btn-secondary" onclick="importSettings()">
                <span class="material-icons">upload</span>
                匯入設定
            </button>
            <button class="btn btn-secondary" onclick="clearGitHubToken()">
                <span class="material-icons">key_off</span>
                清除 Token
            </button>
            <button class="btn btn-danger" onclick="clearAllLocalData()">
                <span class="material-icons">delete_forever</span>
                清除所有資料
            </button>
        `;
        
        header.parentElement.insertBefore(exportImportGroup, header);
    }
}, 500);

// 加入動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .sortable-ghost {
        opacity: 0.5;
        background: var(--admin-bg-secondary);
    }
    
    .dragging {
        border-color: var(--admin-accent) !important;
        background: rgba(106, 27, 154, 0.1) !important;
    }
    
    .upload-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--admin-accent);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
        z-index: 4000;
    }
    
    .notification-enter {
        animation: slideIn 0.3s ease;
    }
    
    .notification-exit {
        animation: slideOut 0.3s ease;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2000;
        align-items: center;
        justify-content: center;
    }
    
    .modal.active {
        display: flex;
    }
    
    .modal-content {
        background: var(--admin-bg);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--admin-border);
    }
    
    .modal-header h3 {
        margin: 0;
        color: var(--admin-text);
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--admin-text-secondary);
    }
    
    .modal-body {
        padding: 20px;
    }
`;
document.head.appendChild(style);

// 版本檢查
async function checkForUpdates() {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/${GitHubConfig.owner}/${GitHubConfig.repo}/${GitHubConfig.branch}/version.json`
        );
        
        if (response.ok) {
            const versionData = await response.json();
            const currentVersion = '2.0.3';
            
            if (versionData.version !== currentVersion) {
                showNotification(`新版本可用: ${versionData.version}`, 'info');
            }
        }
    } catch (error) {
        console.error('版本檢查失敗:', error);
    }
}

setTimeout(checkForUpdates, 2000);

// 監聽鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToGitHub();
    }
    
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        loadFromGitHub();
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportSettings();
    }
});

// 離開頁面前提醒
window.addEventListener('beforeunload', (e) => {
    const hasUnsavedChanges = uploadedData.fonts.some(f => !f.uploaded) ||
                              uploadedData.shapes.some(s => !s.uploaded) ||
                              uploadedData.patterns.some(p => !p.uploaded);
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
    }
});

console.log('印章系統後台管理 v2.0.3 已載入');
console.log('作者: DK0124');
console.log('最後更新: 2025-07-29');
