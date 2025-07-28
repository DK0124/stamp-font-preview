// 全域變數
let currentPage = 'dashboard';
let uploadedData = {
    fonts: [],
    shapes: [],
    patterns: [],
    colors: []
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupSecurityFeatures();
    generateWatermark();
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
                    <p>最後更新：2025-01-28 17:05:42</p>
                    <p>系統版本：1.0.0</p>
                    <p>授權狀態：<span style="color: var(--admin-success);">有效</span></p>
                </div>
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
    
    // 初始化排序
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
}

// 初始化顏色頁面
function initializeColorsPage() {
    // 載入現有顏色
    displayColorGroups();
}

// 初始化安全設定頁面
function initializeSecurityPage() {
    // 可以在這裡載入已儲存的設定
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
                    url: e.target.result
                };
                
                uploadedData.fonts.push(fontData);
                updateFontsTable();
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
                    url: e.target.result
                };
                
                uploadedData.shapes.push(shapeData);
                updateShapesPreview();
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
                    url: e.target.result
                };
                
                uploadedData.patterns.push(patternData);
                updatePatternsPreview();
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
                <button class="btn btn-sm btn-primary" onclick="editFont('${font.id}')">
                    <span class="material-icons">edit</span>
                </button>
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

// 刪除函數
function deleteFont(id) {
    uploadedData.fonts = uploadedData.fonts.filter(f => f.id != id);
    updateFontsTable();
    showNotification('字體已刪除', 'info');
}

function deleteShape(id) {
    uploadedData.shapes = uploadedData.shapes.filter(s => s.id != id);
    updateShapesPreview();
    showNotification('形狀已刪除', 'info');
}

function deletePattern(id) {
    uploadedData.patterns = uploadedData.patterns.filter(p => p.id != id);
    updatePatternsPreview();
    showNotification('圖案已刪除', 'info');
}

function deleteColor(id) {
    uploadedData.colors = uploadedData.colors.filter(c => c.id != id);
    displayColorGroups();
    showNotification('顏色組已刪除', 'info');
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

// 更新字體順序
function updateFontOrder(evt) {
    // 實作拖放排序邏輯
    console.log('Font order updated');
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
    
    // 偵測截圖（基於 visibility change）
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 可能正在截圖
            document.getElementById('screenshotProtection').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('screenshotProtection').style.display = 'none';
            }, 2000);
        }
    });
    
    // 偵測開發者工具
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
    const watermarkLayer = document.getElementById('watermarkLayer');
    const textElement = document.getElementById('watermarkText');
    const text = textElement ? textElement.value : '© 2025 印章系統 - DK0124';
    
    watermarkLayer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const span = document.createElement('span');
        span.className = 'watermark-text';
        span.textContent = text;
        watermarkLayer.appendChild(span);
    }
    
    // 定期更新浮水印（防止被移除）
    setInterval(() => {
        if (!document.getElementById('watermarkLayer')) {
            const newWatermark = document.createElement('div');
            newWatermark.className = 'watermark-layer';
            newWatermark.id = 'watermarkLayer';
            document.body.appendChild(newWatermark);
            generateWatermark();
        }
    }, 1000);
}

// 顯示提示
function showNotification(message, type = 'info') {
    // 實作提示功能
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 可以使用簡單的提示
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
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
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
    // 實作儲存邏輯
    closeModal();
    showNotification('字體設定已儲存', 'success');
}

// 更新安全設定
function updateSecuritySettings() {
    // 實作安全設定更新
    showNotification('安全設定已更新', 'success');
    generateWatermark();
}

// 加密字體（簡單混淆）
function encryptFont(fontData) {
    // 這裡實作簡單的字體加密
    // 實際應用中應使用更強的加密方法
    const encrypted = btoa(fontData);
    return encrypted;
}

// 解密字體
function decryptFont(encryptedData) {
    const decrypted = atob(encryptedData);
    return decrypted;
}

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
`;
document.head.appendChild(style);
