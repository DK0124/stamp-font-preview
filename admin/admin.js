/**
 * 印章系統後台管理
 * @author DK0124
 * @version 2.2.0
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

// 登入設定
const AdminAuth = {
    defaultUsername: 'admin',
    defaultPassword: '1234',
    sessionKey: 'admin_session',
    
    // 檢查是否已登入
    isLoggedIn: function() {
        const session = sessionStorage.getItem(this.sessionKey);
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            // 檢查 session 是否過期（24小時）
            if (new Date().getTime() - sessionData.loginTime > 24 * 60 * 60 * 1000) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // 登入
    login: function(username, password) {
        // 取得儲存的帳密（如果有）
        const savedAuth = JSON.parse(localStorage.getItem('admin_auth') || '{}');
        const validUsername = savedAuth.username || this.defaultUsername;
        const validPassword = savedAuth.password || this.defaultPassword;
        
        if (username === validUsername && password === validPassword) {
            const sessionData = {
                username: username,
                loginTime: new Date().getTime()
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            return true;
        }
        return false;
    },
    
    // 登出
    logout: function() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.reload();
    },
    
    // 修改密碼
    changePassword: function(oldPassword, newPassword) {
        const savedAuth = JSON.parse(localStorage.getItem('admin_auth') || '{}');
        const currentPassword = savedAuth.password || this.defaultPassword;
        
        if (oldPassword === currentPassword) {
            savedAuth.username = savedAuth.username || this.defaultUsername;
            savedAuth.password = newPassword;
            localStorage.setItem('admin_auth', JSON.stringify(savedAuth));
            return true;
        }
        return false;
    }
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
    // 檢查登入狀態
    if (!AdminAuth.isLoggedIn()) {
        showLoginPage();
        return;
    }
    
    // 已登入，初始化後台
    initializeAdmin();
    setupBackendSecurity();
    
    // 載入 GitHub 設定
    setTimeout(() => {
        loadFromGitHub();
    }, 1000);
});

// 顯示登入頁面
function showLoginPage() {
    document.body.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <span class="material-icons" style="font-size: 48px; color: var(--admin-accent);">admin_panel_settings</span>
                    <h2>印章系統後台管理</h2>
                </div>
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label">使用者名稱</label>
                        <input type="text" class="form-control" id="username" required autofocus>
                    </div>
                    <div class="form-group">
                        <label class="form-label">密碼</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <span class="material-icons">login</span>
                        登入
                    </button>
                </form>
                <div id="loginError" style="color: var(--admin-danger); margin-top: 10px; display: none;"></div>
            </div>
        </div>
        <style>
            .login-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: var(--admin-bg-primary);
            }
            .login-box {
                background: var(--admin-bg-secondary);
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 400px;
            }
            .login-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .login-header h2 {
                margin-top: 10px;
                color: var(--admin-text-primary);
            }
        </style>
    `;
}

// 處理登入
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (AdminAuth.login(username, password)) {
        window.location.reload();
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '使用者名稱或密碼錯誤';
        errorDiv.style.display = 'block';
        
        // 清除密碼欄位
        document.getElementById('password').value = '';
    }
}

// 初始化管理系統
function initializeAdmin() {
    // 重建頁面結構（登入後）
    document.body.innerHTML = `
        <div class="admin-wrapper">
            <nav class="admin-sidebar">
                <div class="admin-logo">
                    <span class="material-icons">admin_panel_settings</span>
                    <h3>印章系統後台</h3>
                </div>
                <ul class="admin-nav">
                    <li><a href="#" class="admin-nav-item active" data-page="dashboard"><span class="material-icons">dashboard</span> 總覽</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="fonts"><span class="material-icons">text_fields</span> 字體管理</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="shapes"><span class="material-icons">category</span> 形狀管理</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="patterns"><span class="material-icons">texture</span> 圖案管理</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="colors"><span class="material-icons">palette</span> 顏色管理</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="security"><span class="material-icons">security</span> 前台安全設定</a></li>
                    <li><a href="#" class="admin-nav-item" data-page="account"><span class="material-icons">account_circle</span> 帳號設定</a></li>
                </ul>
            </nav>
            <main class="admin-main">
                <header class="admin-header">
                    <h2 id="pageTitle">總覽</h2>
                    <div class="admin-user">
                        <span class="material-icons">account_circle</span>
                        <span>管理員</span>
                        <button class="btn btn-sm btn-secondary" onclick="AdminAuth.logout()">
                            <span class="material-icons">logout</span>
                            登出
                        </button>
                    </div>
                </header>
                <div class="admin-content" id="adminContent">
                    <!-- 動態內容 -->
                </div>
            </main>
        </div>
        <div id="screenshotProtection" class="screenshot-protection">
            <span class="material-icons">no_photography</span>
            <p>禁止截圖</p>
        </div>
        <div id="watermarkLayer" class="watermark-layer"></div>
    `;
    
    // 側邊欄導航
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            currentPage = this.dataset.page;
            loadPage(currentPage);
        });
    });

    // 載入初始頁面
    loadPage('dashboard');
    
    // 初始化後加入 GitHub 按鈕
    setTimeout(() => {
        addGitHubButtons();
    }, 500);
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
            title.textContent = '前台安全設定';
            content.innerHTML = getSecurityContent();
            initializeSecurityPage();
            break;
        case 'account':
            title.textContent = '帳號設定';
            content.innerHTML = getAccountContent();
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
                    <p>前台防截圖保護：<span id="frontSecurityStatus" style="color: var(--admin-success);">檢查中...</span></p>
                    <p>前台浮水印保護：<span id="frontWatermarkStatus" style="color: var(--admin-success);">檢查中...</span></p>
                    <p>前台右鍵保護：<span id="frontRightClickStatus" style="color: var(--admin-success);">檢查中...</span></p>
                </div>
                <div>
                    <p>最後更新：${new Date().toLocaleString('zh-TW')}</p>
                    <p>系統版本：2.2.0</p>
                    <p>登入時間：${new Date(JSON.parse(sessionStorage.getItem('admin_session')).loginTime).toLocaleString('zh-TW')}</p>
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

// 前台安全設定頁面（與後台分離）
function getSecurityContent() {
    // 載入前台安全設定
    const savedSettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">security</span>
                    前台安全防護設定
                </div>
                <span class="badge badge-info">這些設定只影響前台使用者介面</span>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontPreventScreenshot" ${savedSettings.preventScreenshot !== false ? 'checked' : ''}>
                        防止截圖保護
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        前台偵測到截圖行為時顯示黑畫面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontEnableWatermark" ${savedSettings.enableWatermark !== false ? 'checked' : ''}>
                        啟用浮水印
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        在前台印章預覽介面顯示浮水印
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableRightClick" ${savedSettings.disableRightClick !== false ? 'checked' : ''}>
                        禁用右鍵選單
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止前台使用者右鍵另存圖片
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableTextSelect" ${savedSettings.disableTextSelect !== false ? 'checked' : ''}>
                        禁止文字選取
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止前台使用者複製文字內容
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableDevTools" ${savedSettings.disableDevTools !== false ? 'checked' : ''}>
                        偵測開發者工具
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        前台開啟開發者工具時顯示警告
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisablePrint" ${savedSettings.disablePrint !== false ? 'checked' : ''}>
                        禁止列印
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止前台使用者列印頁面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableDrag" ${savedSettings.disableDrag !== false ? 'checked' : ''}>
                        禁止拖曳圖片
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        防止前台使用者拖曳圖片到其他地方
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontBlurOnLoseFocus" ${savedSettings.blurOnLoseFocus ? 'checked' : ''}>
                        失焦模糊
                    </label>
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        當使用者切換視窗時模糊內容
                    </p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="updateFrontendSecuritySettings()">
                    <span class="material-icons">save</span>
                    儲存前台安全設定
                </button>
                <button class="btn btn-secondary" onclick="resetFrontendSecuritySettings()" style="margin-left: 10px;">
                    <span class="material-icons">restart_alt</span>
                    重設為預設值
                </button>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">text_fields</span>
                    前台浮水印設定
                </div>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">浮水印文字</label>
                    <input type="text" class="form-control" id="frontWatermarkText" value="${savedSettings.watermarkText || '© 2025 印章系統 - 版權所有'}">
                </div>
                <div class="form-group">
                    <label class="form-label">更新頻率（秒）</label>
                    <input type="number" class="form-control" id="frontWatermarkInterval" value="${savedSettings.watermarkInterval || 60}" min="10">
                </div>
                <div class="form-group">
                    <label class="form-label">透明度</label>
                    <input type="range" class="form-control" id="frontWatermarkOpacity" value="${savedSettings.watermarkOpacity || 0.03}" min="0.01" max="0.1" step="0.01">
                    <span id="frontOpacityValue">${((savedSettings.watermarkOpacity || 0.03) * 100).toFixed(0)}%</span>
                </div>
                <div class="form-group">
                    <label class="form-label">字體大小</label>
                    <input type="number" class="form-control" id="frontWatermarkFontSize" value="${savedSettings.watermarkFontSize || 10}" min="8" max="20">
                </div>
            </div>
            <button class="btn btn-success" onclick="updateFrontendWatermarkSettings()">
                <span class="material-icons">save</span>
                儲存浮水印設定
            </button>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">warning</span>
                    前台警告訊息設定
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">截圖警告訊息</label>
                <input type="text" class="form-control" id="frontScreenshotWarning" value="${savedSettings.screenshotWarning || '禁止截圖 - 版權所有'}">
            </div>
            <div class="form-group">
                <label class="form-label">開發者工具警告訊息</label>
                <textarea class="form-control" id="frontDevToolsWarning" rows="3">${savedSettings.devToolsWarning || '警告：偵測到開發者工具！\n本系統內容受版權保護，禁止任何形式的複製或下載。'}</textarea>
            </div>
            <button class="btn btn-success" onclick="updateFrontendWarningMessages()">
                <span class="material-icons">save</span>
                儲存警告訊息
            </button>
        </div>
    `;
}

// 帳號設定頁面
function getAccountContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">lock</span>
                    修改密碼
                </div>
            </div>
            <form onsubmit="handleChangePassword(event)">
                <div class="form-group">
                    <label class="form-label">目前密碼</label>
                    <input type="password" class="form-control" id="currentPassword" required>
                </div>
                <div class="form-group">
                    <label class="form-label">新密碼</label>
                    <input type="password" class="form-control" id="newPassword" required minlength="6">
                    <p style="font-size: 12px; color: var(--admin-border); margin-top: 5px;">
                        密碼長度至少 6 個字元
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">確認新密碼</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                </div>
                <button type="submit" class="btn btn-primary">
                    <span class="material-icons">save</span>
                    更新密碼
                </button>
            </form>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">info</span>
                    登入資訊
                </div>
            </div>
            <div class="info-list">
                <p><strong>目前使用者：</strong> ${JSON.parse(sessionStorage.getItem('admin_session')).username}</p>
                <p><strong>登入時間：</strong> ${new Date(JSON.parse(sessionStorage.getItem('admin_session')).loginTime).toLocaleString('zh-TW')}</p>
                <p><strong>預設帳號：</strong> admin</p>
                <p><strong>預設密碼：</strong> 1234</p>
            </div>
        </div>
    `;
}

// 初始化各頁面功能（保持原有功能）
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
}

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

function initializeColorsPage() {
    displayColorGroups();
}

// 初始化前台安全設定頁面
function initializeSecurityPage() {
    // 監聽透明度滑桿變化
    const opacitySlider = document.getElementById('frontWatermarkOpacity');
    const opacityValue = document.getElementById('frontOpacityValue');
    
    if (opacitySlider && opacityValue) {
        opacitySlider.addEventListener('input', function() {
            opacityValue.textContent = (this.value * 100).toFixed(0) + '%';
        });
    }
    
    // 更新前台安全狀態顯示
    updateFrontendSecurityStatus();
}

// 更新前台安全狀態
function updateFrontendSecurityStatus() {
    const settings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    // 更新總覽頁面的狀態顯示
    const statusElements = {
        'frontSecurityStatus': settings.preventScreenshot !== false,
        'frontWatermarkStatus': settings.enableWatermark !== false,
        'frontRightClickStatus': settings.disableRightClick !== false
    };
    
    for (const [id, enabled] of Object.entries(statusElements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = enabled ? '啟用' : '停用';
            element.style.color = enabled ? 'var(--admin-success)' : 'var(--admin-warning)';
        }
    }
}

// 更新前台安全設定
function updateFrontendSecuritySettings() {
    const settings = {
        preventScreenshot: document.getElementById('frontPreventScreenshot').checked,
        enableWatermark: document.getElementById('frontEnableWatermark').checked,
        disableRightClick: document.getElementById('frontDisableRightClick').checked,
        disableTextSelect: document.getElementById('frontDisableTextSelect').checked,
        disableDevTools: document.getElementById('frontDisableDevTools').checked,
        disablePrint: document.getElementById('frontDisablePrint').checked,
        disableDrag: document.getElementById('frontDisableDrag').checked,
        blurOnLoseFocus: document.getElementById('frontBlurOnLoseFocus').checked,
        watermarkText: document.getElementById('frontWatermarkText').value,
        watermarkInterval: document.getElementById('frontWatermarkInterval').value,
        watermarkOpacity: document.getElementById('frontWatermarkOpacity').value,
        watermarkFontSize: document.getElementById('frontWatermarkFontSize').value,
        screenshotWarning: document.getElementById('frontScreenshotWarning').value,
        devToolsWarning: document.getElementById('frontDevToolsWarning').value,
        lastUpdate: new Date().toISOString()
    };
    
    // 儲存到 localStorage
    localStorage.setItem('frontend_security_settings', JSON.stringify(settings));
    
    showNotification('前台安全設定已儲存', 'success');
    
    // 更新狀態顯示
    updateFrontendSecurityStatus();
    
    // 詢問是否同步到 GitHub
    if (confirm('是否要將前台安全設定同步到 GitHub？')) {
        syncFrontendSecurityToGitHub(settings);
    }
}

// 更新前台浮水印設定
function updateFrontendWatermarkSettings() {
    const settings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    settings.watermarkText = document.getElementById('frontWatermarkText').value;
    settings.watermarkInterval = document.getElementById('frontWatermarkInterval').value;
    settings.watermarkOpacity = document.getElementById('frontWatermarkOpacity').value;
    settings.watermarkFontSize = document.getElementById('frontWatermarkFontSize').value;
    
    localStorage.setItem('frontend_security_settings', JSON.stringify(settings));
    
    showNotification('前台浮水印設定已更新', 'success');
}

// 更新前台警告訊息
function updateFrontendWarningMessages() {
    const settings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    settings.screenshotWarning = document.getElementById('frontScreenshotWarning').value;
    settings.devToolsWarning = document.getElementById('frontDevToolsWarning').value;
    
    localStorage.setItem('frontend_security_settings', JSON.stringify(settings));
    
    showNotification('前台警告訊息已更新', 'success');
}

// 重設前台安全設定
function resetFrontendSecuritySettings() {
    if (confirm('確定要將所有前台安全設定重設為預設值嗎？')) {
        localStorage.removeItem('frontend_security_settings');
        loadPage('security');
        showNotification('前台安全設定已重設為預設值', 'info');
    }
}

// 同步前台安全設定到 GitHub
async function syncFrontendSecurityToGitHub(settings) {
    try {
        // 將前台安全設定加入整體設定
        const config = await getCurrentConfig();
        config.frontendSecurity = settings;
        
        await saveConfigToGitHub(config);
        showNotification('前台安全設定已同步到 GitHub', 'success');
    } catch (error) {
        console.error('同步前台安全設定失敗:', error);
        showNotification('同步前台安全設定失敗', 'danger');
    }
}

// 處理修改密碼
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('新密碼與確認密碼不符', 'danger');
        return;
    }
    
    if (AdminAuth.changePassword(currentPassword, newPassword)) {
        showNotification('密碼修改成功，請重新登入', 'success');
        setTimeout(() => {
            AdminAuth.logout();
        }, 2000);
    } else {
        showNotification('目前密碼錯誤', 'danger');
        document.getElementById('currentPassword').value = '';
    }
}

// 後台安全防護（只針對後台）
function setupBackendSecurity() {
    // 後台專用的安全設定
    
    // 禁用右鍵（後台）
    document.addEventListener('contextmenu', (e) => {
        if (!e.ctrlKey) { // 允許 Ctrl+右鍵 for 開發
            e.preventDefault();
            return false;
        }
    });
    
    // 禁用文字選擇（部分區域）
    document.addEventListener('selectstart', (e) => {
        if (e.target.closest('.admin-table') || e.target.closest('.preview-item')) {
            e.preventDefault();
            return false;
        }
    });
    
    // 偵測開發者工具（僅警告）
    let devtools = { open: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('後台偵測到開發者工具');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Session 超時檢查
    setInterval(() => {
        if (!AdminAuth.isLoggedIn()) {
            window.location.reload();
        }
    }, 60000); // 每分鐘檢查一次
}

// 處理檔案上傳（保持原有功能）
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

// 更新顯示函數（保持原有功能）
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

// 顏色管理功能
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
    
    document.getElementById('colorName').value = '';
    document.getElementById('colorMain').value = '#dc3545';
    
    showNotification('顏色組新增成功', 'success');
}

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

// GitHub 整合功能（保持原有功能）
async function deleteFileFromGitHub(filePath) {
    const token = GitHubConfig.getToken();
    if (!token) {
        showNotification('請先設定 GitHub Token', 'warning');
        return false;
    }
    
    try {
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${filePath}`;
        
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            console.log('檔案不存在或無法存取');
            return true;
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
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

// 刪除功能
async function deleteFont(id) {
    const font = uploadedData.fonts.find(f => f.id == id);
    if (!font) return;
    
    const confirmMessage = font.uploaded ? 
        `確定要刪除字體 "${font.name}" 嗎？\n這也會從 GitHub 刪除字體檔案。` :
        `確定要刪除字體 "${font.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
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
    
    uploadedData.fonts = uploadedData.fonts.filter(f => f.id != id);
    updateFontsTable();
    
    showNotification(`字體 "${font.name}" 已刪除`, 'info');
    
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

async function deleteShape(id) {
    const shape = uploadedData.shapes.find(s => s.id == id);
    if (!shape) return;
    
    const confirmMessage = shape.uploaded ? 
        `確定要刪除形狀 "${shape.name}" 嗎？\n這也會從 GitHub 刪除圖片檔案。` :
        `確定要刪除形狀 "${shape.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
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
    
    uploadedData.shapes = uploadedData.shapes.filter(s => s.id != id);
    updateShapesPreview();
    
    showNotification(`形狀 "${shape.name}" 已刪除`, 'info');
    
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

async function deletePattern(id) {
    const pattern = uploadedData.patterns.find(p => p.id == id);
    if (!pattern) return;
    
    const confirmMessage = pattern.uploaded ? 
        `確定要刪除圖案 "${pattern.name}" 嗎？\n這也會從 GitHub 刪除圖片檔案。` :
        `確定要刪除圖案 "${pattern.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;
    
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
    
    uploadedData.patterns = uploadedData.patterns.filter(p => p.id != id);
    updatePatternsPreview();
    
    showNotification(`圖案 "${pattern.name}" 已刪除`, 'info');
    
    setTimeout(() => {
        saveToGitHub();
    }, 1000);
}

function deleteColor(id) {
    if (confirm('確定要刪除這個顏色組嗎？')) {
        uploadedData.colors = uploadedData.colors.filter(c => c.id != id);
        displayColorGroups();
        showNotification('顏色組已刪除', 'info');
    }
}

// 編輯功能
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

function saveEditFont(id) {
    const font = uploadedData.fonts.find(f => f.id == id);
    if (!font) return;
    
    font.name = document.getElementById('editFontName').value;
    font.weight = document.getElementById('editFontWeight').value;
    
    updateFontsTable();
    closeModal();
    showNotification('字體已更新', 'success');
}

// 上傳功能
async function uploadSingleFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    const success = await uploadFontFile(font);
    if (success) {
        font.uploaded = true;
        updateFontsTable();
    }
}

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
        const filePath = `assets/fonts/${fontData.filename}`;
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
    
    if (successCount > 0) {
        showNotification(`成功上傳 ${successCount} 個字體檔案`, 'success');
    }
    
    if (failCount > 0) {
        showNotification(`${failCount} 個字體上傳失敗`, 'warning');
    }
}

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

// 取得目前設定
async function getCurrentConfig() {
    return {
        fonts: uploadedData.fonts.map(f => ({
            id: f.id,
            name: f.name,
            filename: f.filename,
            displayName: f.name,
            category: 'custom',
            weight: f.weight || 'normal',
            systemFont: null,
            githubPath: f.githubPath || `assets/fonts/${f.filename}`
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
        version: '2.2.0'
    };
}

// 儲存設定到 GitHub
async function saveConfigToGitHub(config) {
    const token = GitHubConfig.getToken();
    if (!token) {
        throw new Error('No GitHub token');
    }
    
    const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/${GitHubConfig.configPath}`;
    
    let sha = null;
    const getResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
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
    
    const updateResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Update failed');
    }
    
    return await updateResponse.json();
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
        const config = await getCurrentConfig();
        
        // 加入前台安全設定
        const frontendSecurity = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
        if (Object.keys(frontendSecurity).length > 0) {
            config.frontendSecurity = frontendSecurity;
        }
        
        await saveConfigToGitHub(config);
        showNotification('設定已成功儲存到 GitHub', 'success');
        
    } catch (error) {
        console.error('儲存過程發生錯誤:', error);
        showNotification('儲存失敗：' + error.message, 'danger');
    }
}

// 從 GitHub 載入
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
            
            // 載入前台安全設定
            if (config.frontendSecurity) {
                localStorage.setItem('frontend_security_settings', JSON.stringify(config.frontendSecurity));
            }
            
            uploadedData.fonts.forEach(f => {
                if (f.githubPath) {
                    f.uploaded = true;
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
            
            if (currentPage === 'fonts') updateFontsTable();
            if (currentPage === 'shapes') updateShapesPreview();
            if (currentPage === 'patterns') updatePatternsPreview();
            if (currentPage === 'colors') displayColorGroups();
            if (currentPage === 'dashboard') updateDashboardStatus();
            if (currentPage === 'security') loadPage('security');
            
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

// 更新總覽狀態
function updateDashboardStatus() {
    const statusElement = document.getElementById('githubStatus');
    if (statusElement) {
        updateGitHubStatus(true);
    }
    updateFrontendSecurityStatus();
}

// 更新 GitHub 狀態
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
        frontendSecurity: JSON.parse(localStorage.getItem('frontend_security_settings') || '{}'),
        exportDate: new Date().toISOString(),
        version: '2.2.0'
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
                    
                    if (settings.frontendSecurity) {
                        localStorage.setItem('frontend_security_settings', JSON.stringify(settings.frontendSecurity));
                    }
                    
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
        
        const fileList = unusedFiles.map(f => `- ${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join('\n');
        
        if (confirm(`發現 ${unusedFiles.length} 個未使用的檔案：\n\n${fileList}\n\n確定要刪除這些檔案嗎？`)) {
            let deleteCount = 0;
            
            for (const file of unusedFiles) {
                const success = await deleteFileFromGitHub(file.path);
                if (success) deleteCount++;
                
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
    
    .badge {
        display: inline-block;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        margin-left: 10px;
    }
    
    .badge-info {
        background: var(--admin-accent);
        color: white;
    }
    
    .info-list p {
        margin: 10px 0;
        color: var(--admin-text-secondary);
    }
    
    .info-list strong {
        color: var(--admin-text-primary);
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
    const hasUnsavedChanges = uploadedData.fonts.some(f => !f.uploaded) ||
                              uploadedData.shapes.some(s => !s.uploaded) ||
                              uploadedData.patterns.some(p => !p.uploaded);
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
    }
});

console.log('印章系統後台管理 v2.2.0 已載入');
console.log('作者: DK0124');
console.log('最後更新: 2025-01-29');
console.log('預設帳號: admin / 密碼: 1234');
