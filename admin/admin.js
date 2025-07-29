/**
 * 印章系統後台管理
 * @author DK0124
 * @version 2.1.0
 * @date 2025-01-29
 */

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
    
    // Token 管理
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
    initializeAdmin();
    setupSecurityFeatures();
    generateWatermark();
    
    // 載入 GitHub 設定
    setTimeout(() => {
        loadFromGitHub();
    }, 1000);
});

// 初始化管理系統
function initializeAdmin() {
    // 側邊欄導航
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            currentPage = this.dataset.page;
            loadPage(currentPage);
        });
    });

    // 載入初始頁面
    loadPage('dashboard');
}

// 載入頁面內容
function loadPage(page) {
    const content = document.getElementById('adminContent');
    const title = document.getElementById('pageTitle');
    
    switch(page) {
        case 'dashboard':
            title.textContent = '總覽';
            content.innerHTML = getDashboardContent();
            updateDashboardStatus();
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
                <p style="font-size: 12px; color: var(--admin-border);">
                    已上傳: ${uploadedData.fonts.filter(f => f.uploaded).length}
                </p>
            </div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">category</span>
                        形狀數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-success);">${uploadedData.shapes.length}</h2>
                <p style="font-size: 12px; color: var(--admin-border);">
                    已上傳: ${uploadedData.shapes.filter(s => s.uploaded).length}
                </p>
            </div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">
                        <span class="material-icons">palette</span>
                        圖案數量
                    </div>
                </div>
                <h2 style="font-size: 36px; color: var(--admin-warning);">${uploadedData.patterns.length}</h2>
                <p style="font-size: 12px; color: var(--admin-border);">
                    已上傳: ${uploadedData.patterns.filter(p => p.uploaded).length}
                </p>
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
                    <p>系統版本：2.1.0</p>
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
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-info" onclick="uploadAllFonts()">
                        <span class="material-icons">upload</span>
                        批次上傳
                    </button>
                    <button class="btn btn-warning" onclick="checkFontsPaths()">
                        <span class="material-icons">sync</span>
                        檢查路徑
                    </button>
                </div>
            </div>
            <div id="fontsList">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>順序</th>
                            <th>字體名稱</th>
                            <th>檔案名稱</th>
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
            </div>
        </div>
    `;
}

// 初始化字體頁面
function initializeFontsPage() {
    const uploadArea = document.getElementById('fontUploadArea');
    const fileInput = document.getElementById('fontFileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // 點擊上傳
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 拖放上傳
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
    
    // 更新字體表格
    updateFontsTable();
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
    // 載入已儲存的設定
}

// 處理字體檔案
function handleFontFiles(files) {
    Array.from(files).forEach(file => {
        if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const extension = file.name.split('.').pop().toLowerCase();
                const baseName = file.name.replace(/\.[^.]+$/, '');
                
                const fontData = {
                    id: Date.now() + Math.random(),
                    name: baseName,
                    filename: file.name,
                    extension: extension,
                    file: file,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    weight: 'normal',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    url: e.target.result,
                    uploaded: false,
                    githubPath: null
                };
                
                uploadedData.fonts.push(fontData);
                updateFontsTable();
                showNotification(`字體 "${baseName}" 已新增`, 'success');
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
                const extension = file.name.split('.').pop().toLowerCase();
                const baseName = file.name.replace(/\.[^.]+$/, '');
                
                const shapeData = {
                    id: Date.now() + Math.random(),
                    name: baseName,
                    filename: file.name,
                    extension: extension,
                    file: file,
                    url: e.target.result,
                    uploaded: false,
                    githubPath: null
                };
                
                uploadedData.shapes.push(shapeData);
                updateShapesPreview();
                showNotification(`形狀 "${baseName}" 已新增`, 'success');
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
                const extension = file.name.split('.').pop().toLowerCase();
                const baseName = file.name.replace(/\.[^.]+$/, '');
                
                const patternData = {
                    id: Date.now() + Math.random(),
                    name: baseName,
                    filename: file.name,
                    extension: extension,
                    file: file,
                    url: e.target.result,
                    uploaded: false,
                    githubPath: null
                };
                
                uploadedData.patterns.push(patternData);
                updatePatternsPreview();
                showNotification(`圖案 "${baseName}" 已新增`, 'success');
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
            <td>${font.filename || font.name + '.' + font.extension}</td>
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
    
    // 清空輸入
    document.getElementById('colorName').value = '';
    document.getElementById('colorMain').value = '#dc3545';
    
    showNotification('顏色組新增成功', 'success');
}

// 生成顏色漸層
function generateColorShades(baseColor) {
    const shades = [];
    const color = hexToRgb(baseColor);
    
    // 生成4個漸層色
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

// ============= GitHub 整合功能 =============

// 從 GitHub 刪除檔案
async function deleteFileFromGitHub(filePath) {
    const token = GitHubConfig.getToken();
    if (!token) {
        showNotification('請先設定 GitHub Token', 'warning');
        return false;
    }
    
    try {
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        // 先取得檔案資訊（需要 SHA）
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            console.log('檔案不存在或無法存取');
            return true; // 檔案不存在也算刪除成功
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // 刪除檔案
        const deleteResponse = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete file: ${filePath}`,
                sha: sha,
                branch: GitHubConfig.branch
            })
        });
        
        if (deleteResponse.ok) {
            console.log('檔案刪除成功:', filePath);
            return true;
        } else {
            const error = await deleteResponse.json();
            console.error('刪除失敗:', error);
            showNotification(`刪除檔案失敗: ${error.message}`, 'danger');
            return false;
        }
        
    } catch (error) {
        console.error('刪除檔案錯誤:', error);
        showNotification('刪除檔案失敗：' + error.message, 'danger');
        return false;
    }
}

// 刪除字體
async function deleteFont(id) {
    const font = uploadedData.fonts.find(f => f.id == id);
    if (!font) return;
    
    const confirmMessage = font.uploaded ? 
        `確定要刪除字體 "${font.name}" 嗎？\n這也會從 GitHub 刪除字體檔案。` :
        `確定要刪除字體 "${font.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
    // 如果字體已上傳到 GitHub，先刪除檔案
    if (font.uploaded && font.githubPath) {
        showNotification(`正在從 GitHub 刪除字體檔案...`, 'info');
        
        const deleteSuccess = await deleteFileFromGitHub(font.githubPath);
        
        if (!deleteSuccess) {
            if (!confirm('無法從 GitHub 刪除檔案，是否仍要從列表中移除？')) {
                return;
            }
        } else {
            showNotification('字體檔案已從 GitHub 刪除', 'success');
        }
    }
    
    // 從本地列表移除
    uploadedData.fonts = uploadedData.fonts.filter(f => f.id != id);
    updateFontsTable();
    
    showNotification(`字體 "${font.name}" 已刪除`, 'info');
    
    // 自動儲存設定到 GitHub（更新 config.json）
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

// 刪除形狀
async function deleteShape(id) {
    const shape = uploadedData.shapes.find(s => s.id == id);
    if (!shape) return;
    
    const confirmMessage = shape.uploaded ? 
        `確定要刪除形狀 "${shape.name}" 嗎？\n這也會從 GitHub 刪除圖片檔案。` :
        `確定要刪除形狀 "${shape.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
    // 如果已上傳到 GitHub，先刪除檔案
    if (shape.uploaded && shape.githubPath) {
        showNotification(`正在從 GitHub 刪除形狀檔案...`, 'info');
        
        const deleteSuccess = await deleteFileFromGitHub(shape.githubPath);
        
        if (!deleteSuccess) {
            if (!confirm('無法從 GitHub 刪除檔案，是否仍要從列表中移除？')) {
                return;
            }
        } else {
            showNotification('形狀檔案已從 GitHub 刪除', 'success');
        }
    }
    
    // 從本地列表移除
    uploadedData.shapes = uploadedData.shapes.filter(s => s.id != id);
    updateShapesPreview();
    
    showNotification(`形狀 "${shape.name}" 已刪除`, 'info');
    
    // 自動儲存設定
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

// 刪除圖案
async function deletePattern(id) {
    const pattern = uploadedData.patterns.find(p => p.id == id);
    if (!pattern) return;
    
    const confirmMessage = pattern.uploaded ? 
        `確定要刪除圖案 "${pattern.name}" 嗎？\n這也會從 GitHub 刪除圖片檔案。` :
        `確定要刪除圖案 "${pattern.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
    // 如果已上傳到 GitHub，先刪除檔案
    if (pattern.uploaded && pattern.githubPath) {
        showNotification(`正在從 GitHub 刪除圖案檔案...`, 'info');
        
        const deleteSuccess = await deleteFileFromGitHub(pattern.githubPath);
        
        if (!deleteSuccess) {
            if (!confirm('無法從 GitHub 刪除檔案，是否仍要從列表中移除？')) {
                return;
            }
        } else {
            showNotification('圖案檔案已從 GitHub 刪除', 'success');
        }
    }
    
    // 從本地列表移除
    uploadedData.patterns = uploadedData.patterns.filter(p => p.id != id);
    updatePatternsPreview();
    
    showNotification(`圖案 "${pattern.name}" 已刪除`, 'info');
    
    // 自動儲存設定
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

// 刪除顏色
function deleteColor(id) {
    if (confirm('確定要刪除這個顏色組嗎？')) {
        uploadedData.colors = uploadedData.colors.filter(c => c.id != id);
        displayColorGroups();
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
    closeModal();
    showNotification('字體已更新', 'success');
}

// 上傳單一字體檔案
async function uploadSingleFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    const success = await uploadFontFile(font);
    if (success) {
        font.uploaded = true;
        updateFontsTable();
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
        
        // 從 data URL 提取 base64 內容
        const base64Content = fontData.url.split(',')[1];
        
        // 檔案路徑 - 使用原始檔名
        const filePath = `assets/fonts/${fontData.filename}`;
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        // 檢查檔案是否已存在
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
        
        // 上傳或更新檔案
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
            
            // 避免 API 限制，每個請求之間等待一下
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    updateFontsTable();
    
    if (successCount > 0) {
        showNotification(`成功上傳 ${successCount} 個字體檔案`, 'success');
    }
    
    if (failCount > 0) {
        showNotification(`${failCount} 個字體上傳失敗`, 'warning');
    }
}

// 檢查字體路徑
async function checkFontsPaths() {
    showNotification('正在檢查字體路徑...', 'info');
    
    for (const font of uploadedData.fonts) {
        if (font.githubPath) {
            const url = `https://raw.githubusercontent.com/${GitHubConfig.owner}/${GitHubConfig.repo}/${GitHubConfig.branch}/${font.githubPath}`;
            
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (!response.ok) {
                    console.error(`字體檔案不存在: ${font.name} - ${url}`);
                    font.uploaded = false;
                } else {
                    console.log(`字體檔案存在: ${font.name}`);
                    font.uploaded = true;
                }
            } catch (error) {
                console.error(`檢查字體失敗: ${font.name}`, error);
                font.uploaded = false;
            }
        }
    }
    
    updateFontsTable();
    showNotification('路徑檢查完成', 'success');
}

// 儲存到 GitHub
async function saveToGitHub() {
    const token = GitHubConfig.getToken();
    if (!token) {
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return;
    }
    
    console.log('開始儲存設定到 GitHub...');
    
    try {
        // 準備設定資料 - 修正字體檔案路徑格式
        const config = {
            fonts: uploadedData.fonts.map(f => ({
                id: f.id,
                name: f.name,
                filename: f.filename,  // 使用實際檔名
                displayName: f.name,
                category: 'custom',
                weight: f.weight || 'normal',
                systemFont: null,
                githubPath: f.githubPath || `assets/fonts/${f.filename}`  // 確保路徑正確
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
            version: '2.1.0'
        };
        
        console.log('準備儲存的資料:', config);
        
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${GitHubConfig.configPath}`;
        
        // 取得現有檔案的 SHA
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
        
        // 將資料轉換為 base64
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
        
        // 建立請求 body
        const requestBody = {
            message: `Update stamp config - ${new Date().toLocaleString('zh-TW')}`,
            content: content,
            branch: GitHubConfig.branch
        };
        
        // 如果有 SHA，加入到請求中
        if (sha) {
            requestBody.sha = sha;
        }
        
        console.log('發送更新請求...');
        
        // 更新檔案
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
            
            // 顯示 commit 資訊
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
            
            // 更新本地資料
            uploadedData.fonts = config.fonts || [];
            uploadedData.shapes = config.shapes || [];
            uploadedData.patterns = config.patterns || [];
            uploadedData.colors = config.colors || [];
            
            // 標記已上傳的項目
            uploadedData.fonts.forEach(f => {
                if (f.githubPath) {
                    f.uploaded = true;
                    // 確保 filename 和 extension 正確
                    if (!f.filename && f.githubPath) {
                        f.filename = f.githubPath.split('/').pop();
                        f.extension = f.filename.split('.').pop();
                    }
                }
            });
            
            uploadedData.shapes.forEach(s => {
                if (s.githubPath) s.uploaded = true;
            });
            
            uploadedData.patterns.forEach(p => {
                if (p.githubPath) p.uploaded = true;
            });
            
            // 更新顯示
            if (currentPage === 'fonts') updateFontsTable();
            if (currentPage === 'shapes') updateShapesPreview();
            if (currentPage === 'patterns') updatePatternsPreview();
            if (currentPage === 'colors') displayColorGroups();
            if (currentPage === 'dashboard') updateDashboardStatus();
            
            showNotification('設定載入成功', 'success');
            
            // 更新 GitHub 狀態
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

// 更新總覽狀態
function updateDashboardStatus() {
    const statusElement = document.getElementById('githubStatus');
    if (statusElement) {
        updateGitHubStatus(true);
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
                <p>最後更新: ${new Date().toLocaleString('zh-TW')}</p>
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
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return;
    }
    
    try {
        // 測試 Token
        console.log('測試 Token...');
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`
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
        
        // 測試 Repository 存取
        console.log('測試 Repository 存取...');
        const repoResponse = await fetch(`https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}`, {
            headers: {
                'Authorization': `Bearer ${GitHubConfig.getToken()}`
            }
        });
        
        if (repoResponse.ok) {
            const repoData = await repoResponse.json();
            console.log('可以存取 Repository:', repoData.full_name);
            showNotification('可以存取 Repository', 'success');
        } else {
            console.error('無法存取 Repository');
            showNotification('無法存取 Repository', 'danger');
        }
        
    } catch (error) {
        console.error('測試失敗:', error);
        showNotification('測試失敗: ' + error.message, 'danger');
    }
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
        version: '2.1.0'
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
                    
                    // 更新顯示
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

// 清理未使用的檔案
async function cleanupUnusedFiles() {
    if (!confirm('這將掃描並刪除 GitHub 上未在設定中使用的檔案。\n確定要繼續嗎？')) {
        return;
    }
    
    const token = GitHubConfig.getToken();
    if (!token) {
        const newToken = GitHubConfig.promptToken();
        if (!newToken) return;
    }
    
    showNotification('正在掃描未使用的檔案...', 'info');
    
    try {
        // 取得所有已記錄的檔案路徑
        const usedPaths = new Set();
        
        uploadedData.fonts.forEach(f => {
            if (f.githubPath) usedPaths.add(f.githubPath);
        });
        
        uploadedData.shapes.forEach(s => {
            if (s.githubPath) usedPaths.add(s.githubPath);
        });
        
        uploadedData.patterns.forEach(p => {
            if (p.githubPath) usedPaths.add(p.githubPath);
        });
        
        // 掃描 GitHub 資料夾
        const folders = ['assets/fonts', 'assets/shapes', 'assets/patterns'];
        let unusedFiles = [];
        
        for (const folder of folders) {
            const response = await fetch(
                `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${folder}`,
                {
                    headers: {
                        'Authorization': `Bearer ${GitHubConfig.getToken()}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const files = await response.json();
                
                for (const file of files) {
                    if (file.type === 'file' && !usedPaths.has(file.path)) {
                        unusedFiles.push({
                            path: file.path,
                            name: file.name,
                            size: file.size
                        });
                    }
                }
            }
        }
        
        if (unusedFiles.length === 0) {
            showNotification('沒有發現未使用的檔案', 'success');
            return;
        }
        
        // 顯示未使用的檔案
        const fileList = unusedFiles.map(f => `- ${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join('\n');
        
        if (confirm(`發現 ${unusedFiles.length} 個未使用的檔案：\n\n${fileList}\n\n確定要刪除這些檔案嗎？`)) {
            let deleteCount = 0;
            
            for (const file of unusedFiles) {
                const success = await deleteFileFromGitHub(file.path);
                if (success) deleteCount++;
                
                // 避免 API 限制
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            showNotification(`已刪除 ${deleteCount} 個未使用的檔案`, 'success');
        }
        
    } catch (error) {
        console.error('清理檔案錯誤:', error);
        showNotification('清理檔案失敗：' + error.message, 'danger');
    }
}

// 加入控制按鈕
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
            <button class="btn btn-primary" onclick="loadFromGitHub()">
                <span class="material-icons">cloud_download</span>
                從 GitHub 載入
            </button>
            <button class="btn btn-success" onclick="saveToGitHub()">
                <span class="material-icons">cloud_upload</span>
                儲存到 GitHub
            </button>
            <button class="btn btn-secondary" onclick="exportSettings()">
                <span class="material-icons">download</span>
                匯出設定
            </button>
            <button class="btn btn-secondary" onclick="importSettings()">
                <span class="material-icons">upload</span>
                匯入設定
            </button>
            <button class="btn btn-warning" onclick="cleanupUnusedFiles()">
                <span class="material-icons">cleaning_services</span>
                清理檔案
            </button>
            <button class="btn btn-danger" onclick="clearGitHubToken()">
                <span class="material-icons">key_off</span>
                清除 Token
            </button>
        `;
        
        header.parentElement.insertBefore(buttonGroup, header);
    }
}

// 安全防護功能
function setupSecurityFeatures() {
    // 禁用右鍵
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // 禁用文字選擇
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // 禁用拖放
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // 偵測開發者工具
    let devtools = { open: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.log('開發者工具已開啟');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // 禁用 F12 和其他快捷鍵
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (查看源碼)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });
}

// 生成浮水印
function generateWatermark() {
    const watermarkLayer = document.getElementById('watermarkLayer');
    if (!watermarkLayer) return;
    
    const text = '© 2025 印章系統 - DK0124';
    
    watermarkLayer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const span = document.createElement('span');
        span.className = 'watermark-text';
        span.textContent = text;
        watermarkLayer.appendChild(span);
    }
}

// 顯示提示
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 建立提示元素
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
        max-width: 400px;
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
    // 建立模態框
    let modal = document.getElementById('adminModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminModal';
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 id="modalTitle"></h3>
                    <button class="btn btn-sm" onclick="closeModal()">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="admin-modal-body" id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('adminModal');
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

// 儲存字體設定
function saveFontSettings() {
    const settings = {
        defaultFontSize: document.getElementById('defaultFontSize').value,
        defaultLineHeight: document.getElementById('defaultLineHeight').value,
        defaultFontWeight: document.getElementById('defaultFontWeight').value,
        fontRendering: document.getElementById('fontRendering').value
    };
    
    localStorage.setItem('fontSettings', JSON.stringify(settings));
    closeModal();
    showNotification('字體設定已儲存', 'success');
}

// 初始化時加入按鈕和載入設定
setTimeout(() => {
    addGitHubButtons();
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
    
    /* 模態框樣式 */
    .admin-modal {
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
    
    .admin-modal.active {
        display: flex;
    }
    
    .admin-modal-content {
        background: var(--admin-bg-primary);
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .admin-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--admin-border);
    }
    
    .admin-modal-header h3 {
        margin: 0;
        color: var(--admin-text-primary);
    }
    
    .admin-modal-body {
        padding: 20px;
        overflow-y: auto;
        max-height: calc(90vh - 80px);
    }
`;
document.head.appendChild(style);

// 監聽鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    // Ctrl+S 儲存
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToGitHub();
    }
    
    // Ctrl+O 載入
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        loadFromGitHub();
    }
    
    // Ctrl+E 匯出
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportSettings();
    }
});

// 離開頁面前提醒
window.addEventListener('beforeunload', (e) => {
    // 檢查是否有未儲存的變更
    const hasUnsavedChanges = uploadedData.fonts.some(f => !f.uploaded) ||
                              uploadedData.shapes.some(s => !s.uploaded) ||
                              uploadedData.patterns.some(p => !p.uploaded);
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
    }
});

console.log('印章系統後台管理 v2.1.0 已載入');
console.log('作者: DK0124');
console.log('最後更新: 2025-01-29');
