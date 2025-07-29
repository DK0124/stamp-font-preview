/**
 * 印章系統後台管理
 * @author DK0124
 * @version 3.0.0
 * @date 2025-07-29
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
    defaultPassword: '0918124726',
    sessionKey: 'admin_session',
    maxLoginAttempts: 5,
    lockoutDuration: 300000, // 5分鐘
    
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
    
    // 檢查帳號是否被鎖定
    isLocked: function() {
        const lockData = localStorage.getItem('admin_lockout');
        if (!lockData) return false;
        
        const { lockedUntil } = JSON.parse(lockData);
        if (new Date().getTime() < lockedUntil) {
            return true;
        } else {
            localStorage.removeItem('admin_lockout');
            return false;
        }
    },
    
    // 記錄失敗次數
    recordFailedAttempt: function() {
        const attempts = parseInt(localStorage.getItem('failed_attempts') || '0') + 1;
        localStorage.setItem('failed_attempts', attempts.toString());
        
        if (attempts >= this.maxLoginAttempts) {
            const lockedUntil = new Date().getTime() + this.lockoutDuration;
            localStorage.setItem('admin_lockout', JSON.stringify({ lockedUntil }));
            localStorage.removeItem('failed_attempts');
            return true; // 已鎖定
        }
        return false; // 未鎖定
    },
    
    // 登入
    login: function(username, password) {
        if (this.isLocked()) {
            return { success: false, message: '帳號已被鎖定，請稍後再試' };
        }
        
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
            localStorage.removeItem('failed_attempts');
            return { success: true };
        }
        
        const locked = this.recordFailedAttempt();
        const remainingAttempts = this.maxLoginAttempts - parseInt(localStorage.getItem('failed_attempts') || '0');
        
        if (locked) {
            return { success: false, message: '登入失敗次數過多，帳號已被鎖定5分鐘' };
        } else {
            return { success: false, message: `登入失敗，剩餘嘗試次數: ${remainingAttempts}` };
        }
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
        const modal = `
            <div class="form-group">
                <label class="form-label">
                    <span class="material-icons">vpn_key</span>
                    GitHub Personal Access Token
                </label>
                <input type="password" class="form-control" id="githubTokenInput" placeholder="ghp_xxxxxxxxxxxx">
                <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 8px;">
                    需要具有 repo 權限的 token 才能上傳檔案
                </p>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveGitHubToken()">
                    <span class="material-icons">save</span>
                    儲存
                </button>
            </div>
        `;
        showModal('設定 GitHub Token', modal);
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
                    <span class="material-icons">admin_panel_settings</span>
                    <h2>印章系統後台管理</h2>
                </div>
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label">使用者名稱</label>
                        <input type="text" class="form-control" id="username" required autofocus autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label class="form-label">密碼</label>
                        <input type="password" class="form-control" id="password" required autocomplete="current-password">
                        <button type="button" class="btn btn-sm" style="position: absolute; right: 10px; top: 42px; background: none; color: var(--admin-text-secondary);" onclick="togglePassword()">
                            <span class="material-icons" id="passwordToggle">visibility</span>
                        </button>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <span class="material-icons">login</span>
                        登入
                    </button>
                </form>
                <div id="loginError" style="color: var(--admin-danger); margin-top: 16px; display: none; text-align: center;"></div>
            </div>
        </div>
    `;
}

// 切換密碼顯示
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = 'visibility';
    }
}

// 處理登入
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    const result = AdminAuth.login(username, password);
    
    if (result.success) {
        errorDiv.style.display = 'none';
        window.location.reload();
    } else {
        errorDiv.textContent = result.message;
        errorDiv.style.display = 'block';
        
        // 清除密碼欄位
        document.getElementById('password').value = '';
        
        // 震動效果
        const loginBox = document.querySelector('.login-box');
        loginBox.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginBox.style.animation = '';
        }, 500);
    }
}

// 初始化管理系統
function initializeAdmin() {
    // 重建頁面結構（登入後）
    document.body.innerHTML = `
        <div class="admin-wrapper">
            <nav class="admin-sidebar" id="sidebar">
                <div class="admin-logo">
                    <span class="material-icons">admin_panel_settings</span>
                    <h3>印章系統後台</h3>
                </div>
                <ul class="admin-nav">
                    <li><a href="#" class="admin-nav-item active" data-page="dashboard">
                        <span class="material-icons">dashboard</span> 總覽
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="fonts">
                        <span class="material-icons">text_fields</span> 字體管理
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="shapes">
                        <span class="material-icons">category</span> 形狀管理
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="patterns">
                        <span class="material-icons">texture</span> 圖案管理
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="colors">
                        <span class="material-icons">palette</span> 顏色管理
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="security">
                        <span class="material-icons">security</span> 前台安全設定
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="account">
                        <span class="material-icons">account_circle</span> 帳號設定
                    </a></li>
                </ul>
            </nav>
            <main class="admin-main">
                <header class="admin-header">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn btn-sm btn-secondary" id="menuToggle" onclick="toggleSidebar()" style="display: none;">
                            <span class="material-icons">menu</span>
                        </button>
                        <h2 id="pageTitle">總覽</h2>
                    </div>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div class="github-buttons" id="githubButtons"></div>
                        <div class="admin-user">
                            <span class="material-icons">account_circle</span>
                            <span>管理員</span>
                            <button class="btn btn-sm btn-secondary" onclick="AdminAuth.logout()">
                                <span class="material-icons">logout</span>
                                登出
                            </button>
                        </div>
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
        <div id="notificationContainer" class="notification-container"></div>
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

    // 檢查螢幕寬度
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // 載入初始頁面
    loadPage('dashboard');
    
    // 初始化後加入 GitHub 按鈕
    setTimeout(() => {
        addGitHubButtons();
    }, 100);
    
    // 設定鍵盤快捷鍵
    setupKeyboardShortcuts();
}

// 檢查螢幕寬度
function checkScreenSize() {
    const menuToggle = document.getElementById('menuToggle');
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
    } else {
        menuToggle.style.display = 'none';
        document.getElementById('sidebar').classList.remove('active');
    }
}

// 切換側邊欄
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// 載入頁面內容
function loadPage(page) {
    const content = document.getElementById('adminContent');
    const title = document.getElementById('pageTitle');
    
    // 關閉手機版側邊欄
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
    
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
            <div class="stat-card">
                <div class="admin-card-title">
                    <span class="material-icons">text_fields</span>
                    字體數量
                </div>
                <h2>${uploadedData.fonts.length}</h2>
                <p style="font-size: 14px; color: var(--admin-text-secondary);">
                    已上傳: ${uploadedData.fonts.filter(f => f.uploaded).length}
                </p>
            </div>
            <div class="stat-card">
                <div class="admin-card-title">
                    <span class="material-icons">category</span>
                    形狀數量
                </div>
                <h2>${uploadedData.shapes.length}</h2>
                <p style="font-size: 14px; color: var(--admin-text-secondary);">
                    已上傳: ${uploadedData.shapes.filter(s => s.uploaded).length}
                </p>
            </div>
            <div class="stat-card">
                <div class="admin-card-title">
                    <span class="material-icons">texture</span>
                    圖案數量
                </div>
                <h2>${uploadedData.patterns.length}</h2>
                <p style="font-size: 14px; color: var(--admin-text-secondary);">
                    已上傳: ${uploadedData.patterns.filter(p => p.uploaded).length}
                </p>
            </div>
            <div class="stat-card">
                <div class="admin-card-title">
                    <span class="material-icons">color_lens</span>
                    顏色數量
                </div>
                <h2>${uploadedData.colors.length}</h2>
                <p style="font-size: 14px; color: var(--admin-text-secondary);">
                    預設顏色組
                </p>
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
                    <h4 style="color: var(--admin-accent); margin-bottom: 16px;">前台安全設定</h4>
                    <p>防截圖保護：<span id="frontSecurityStatus" class="badge">檢查中...</span></p>
                    <p>浮水印保護：<span id="frontWatermarkStatus" class="badge">檢查中...</span></p>
                    <p>右鍵保護：<span id="frontRightClickStatus" class="badge">檢查中...</span></p>
                    <p>開發者工具偵測：<span id="frontDevToolsStatus" class="badge">檢查中...</span></p>
                </div>
                <div>
                    <h4 style="color: var(--admin-accent); margin-bottom: 16px;">系統資訊</h4>
                    <p>最後更新：${new Date().toLocaleString('zh-TW')}</p>
                    <p>系統版本：3.0.0</p>
                    <p>登入時間：${new Date(JSON.parse(sessionStorage.getItem('admin_session')).loginTime).toLocaleString('zh-TW')}</p>
                    <p>瀏覽器：${navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge)/)?.[0] || 'Unknown'}</p>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">cloud</span>
                    GitHub 連線狀態
                </div>
                <button class="btn btn-sm btn-info" onclick="testGitHubConnection()">
                    <span class="material-icons">refresh</span>
                    重新檢查
                </button>
            </div>
            <div id="githubStatus">
                <p>檢查中...</p>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">info</span>
                    快速操作
                </div>
            </div>
            <div class="grid grid-3">
                <button class="btn btn-secondary" onclick="showShortcuts()" style="width: 100%;">
                    <span class="material-icons">keyboard</span>
                    查看快捷鍵
                </button>
                <button class="btn btn-secondary" onclick="exportSettings()" style="width: 100%;">
                    <span class="material-icons">download</span>
                    匯出設定
                </button>
                <button class="btn btn-secondary" onclick="importSettings()" style="width: 100%;">
                    <span class="material-icons">upload</span>
                    匯入設定
                </button>
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
                <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 10px;">
                    支援格式：.ttf, .otf, .woff, .woff2 | 最大檔案大小：10MB
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
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th width="40">順序</th>
                            <th>字體名稱</th>
                            <th>檔案名稱</th>
                            <th width="100">檔案大小</th>
                            <th width="100">字重</th>
                            <th width="80">狀態</th>
                            <th width="150">操作</th>
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
                <button class="btn btn-info" onclick="showShapeGuide()">
                    <span class="material-icons">help</span>
                    製作指南
                </button>
            </div>
            <div class="upload-area" id="shapeUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放形狀圖片到此處，或點擊選擇檔案</p>
                <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 10px;">
                    支援格式：.png, .jpg, .svg | 建議尺寸：512x512px | 透明背景
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
                <div>
                    <span class="badge badge-info">
                        <span class="material-icons">info</span>
                        共 ${uploadedData.shapes.length} 個形狀
                    </span>
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
                <button class="btn btn-info" onclick="showPatternGuide()">
                    <span class="material-icons">help</span>
                    製作指南
                </button>
            </div>
            <div class="upload-area" id="patternUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放圖案到此處，或點擊選擇檔案</p>
                <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 10px;">
                    支援格式：.png, .jpg, .svg | 建議尺寸：64x64px | 可平鋪圖案
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
                <div>
                    <span class="badge badge-info">
                        <span class="material-icons">info</span>
                        共 ${uploadedData.patterns.length} 個圖案
                    </span>
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
                <button class="btn btn-secondary" onclick="loadDefaultColors()">
                    <span class="material-icons">restore</span>
                    載入預設顏色
                </button>
            </div>
            <div class="color-picker-grid" id="colorGroups">
                <!-- 動態載入 -->
            </div>
        </div>
    `;
}

// 前台安全設定頁面
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
                <span class="badge badge-info">
                    <span class="material-icons">info</span>
                    這些設定只影響前台使用者介面
                </span>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontPreventScreenshot" ${savedSettings.preventScreenshot !== false ? 'checked' : ''}>
                        防止截圖保護
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        前台偵測到截圖行為時顯示黑畫面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontEnableWatermark" ${savedSettings.enableWatermark !== false ? 'checked' : ''}>
                        啟用浮水印
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        在前台印章預覽介面顯示浮水印
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableRightClick" ${savedSettings.disableRightClick !== false ? 'checked' : ''}>
                        禁用右鍵選單
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        防止前台使用者右鍵另存圖片
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableTextSelect" ${savedSettings.disableTextSelect !== false ? 'checked' : ''}>
                        禁止文字選取
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        防止前台使用者複製文字內容
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableDevTools" ${savedSettings.disableDevTools !== false ? 'checked' : ''}>
                        偵測開發者工具
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        前台開啟開發者工具時顯示警告
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisablePrint" ${savedSettings.disablePrint !== false ? 'checked' : ''}>
                        禁止列印
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        防止前台使用者列印頁面
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontDisableDrag" ${savedSettings.disableDrag !== false ? 'checked' : ''}>
                        禁止拖曳圖片
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        防止前台使用者拖曳圖片到其他地方
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="frontBlurOnLoseFocus" ${savedSettings.blurOnLoseFocus ? 'checked' : ''}>
                        失焦模糊
                    </label>
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
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
                    <label class="form-label">透明度 <span id="frontOpacityValue">${((savedSettings.watermarkOpacity || 0.03) * 100).toFixed(0)}%</span></label>
                    <input type="range" class="form-control" id="frontWatermarkOpacity" value="${savedSettings.watermarkOpacity || 0.03}" min="0.01" max="0.1" step="0.01">
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
                    <input type="password" class="form-control" id="newPassword" required minlength="6" pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="密碼必須包含大小寫字母和數字">
                    <p style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 5px;">
                        密碼長度至少 6 個字元，需包含大小寫字母和數字
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
                <p><strong>Session 到期：</strong> 24 小時後自動登出</p>
                <p><strong>上次密碼更新：</strong> ${localStorage.getItem('last_password_change') || '從未更新'}</p>
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">security</span>
                    安全設定
                </div>
            </div>
            <div class="info-list">
                <p><strong>預設帳號：</strong> admin</p>
                <p><strong>預設密碼：</strong> 0918124726</p>
                <p><strong>登入失敗鎖定：</strong> 5 次失敗後鎖定 5 分鐘</p>
                <p><strong>建議：</strong> 請盡快修改預設密碼以確保安全</p>
            </div>
        </div>
    `;
}

// 初始化各頁面功能
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
    
    // 初始化拖曳排序
    if (typeof Sortable !== 'undefined') {
        new Sortable(document.getElementById('fontsTableBody'), {
            animation: 150,
            handle: '.material-icons',
            onEnd: function(evt) {
                // 更新順序
                const rows = document.querySelectorAll('#fontsTableBody tr');
                const newOrder = [];
                rows.forEach((row) => {
                    const id = row.dataset.id;
                    const font = uploadedData.fonts.find(f => f.id == id);
                    if (font) newOrder.push(font);
                });
                uploadedData.fonts = newOrder;
                showNotification('字體順序已更新', 'success');
            }
        });
    }
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
    
    // 即時預覽變更
    const checkboxes = document.querySelectorAll('#adminContent input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            showNotification('記得儲存設定以套用變更', 'info');
        });
    });
}

// 更新前台安全狀態
function updateFrontendSecurityStatus() {
    const settings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    // 更新總覽頁面的狀態顯示
    const statusMap = {
        'frontSecurityStatus': settings.preventScreenshot !== false,
        'frontWatermarkStatus': settings.enableWatermark !== false,
        'frontRightClickStatus': settings.disableRightClick !== false,
        'frontDevToolsStatus': settings.disableDevTools !== false
    };
    
    for (const [id, enabled] of Object.entries(statusMap)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = enabled ? '啟用' : '停用';
            element.className = enabled ? 'badge badge-success' : 'badge badge-warning';
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
    
    // 自動同步到 GitHub
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
        localStorage.setItem('last_password_change', new Date().toLocaleString('zh-TW'));
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
    
    // Session 超時檢查
    setInterval(() => {
        if (!AdminAuth.isLoggedIn()) {
            window.location.reload();
        }
    }, 60000); // 每分鐘檢查一次
    
    // 監控頁面活動
    let lastActivity = Date.now();
    const activityTimeout = 30 * 60 * 1000; // 30分鐘無活動自動登出
    
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        });
    });
    
    setInterval(() => {
        if (Date.now() - lastActivity > activityTimeout) {
            showNotification('由於長時間無活動，系統將自動登出', 'warning');
            setTimeout(() => {
                AdminAuth.logout();
            }, 5000);
        }
    }, 60000);
}

// 處理檔案上傳
function handleFontFiles(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        if (file.size > maxSize) {
            showNotification(`檔案 "${file.name}" 超過 10MB 限制`, 'warning');
            return;
        }
        
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
    });
}

function handleShapeFiles(files) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        if (file.size > maxSize) {
            showNotification(`檔案 "${file.name}" 超過 5MB 限制`, 'warning');
            return;
        }
        
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
    });
}

function handlePatternFiles(files) {
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        if (file.size > maxSize) {
            showNotification(`檔案 "${file.name}" 超過 2MB 限制`, 'warning');
            return;
        }
        
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
    });
}

// 更新顯示函數
function updateFontsTable() {
    const tbody = document.getElementById('fontsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = uploadedData.fonts.map((font, index) => `
        <tr data-id="${font.id}">
            <td><span class="material-icons" style="cursor: move; color: var(--admin-text-secondary);">drag_indicator</span></td>
            <td style="font-weight: 600;">${font.name}</td>
            <td style="color: var(--admin-text-secondary);">${font.filename || font.name + '.' + font.extension}</td>
            <td>${font.size}</td>
            <td>${font.weight}</td>
            <td>
                ${font.uploaded ? 
                    '<span class="badge badge-success">已上傳</span>' : 
                    '<span class="badge badge-warning">待上傳</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editFont('${font.id}')" title="編輯">
                    <span class="material-icons">edit</span>
                </button>
                ${!font.uploaded ? 
                    `<button class="btn btn-sm btn-info" onclick="uploadSingleFont('${font.id}')" title="上傳">
                        <span class="material-icons">upload</span>
                    </button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteFont('${font.id}')" title="刪除">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateShapesPreview() {
    const preview = document.getElementById('shapesPreview');
    if (!preview) return;
    
    if (uploadedData.shapes.length === 0) {
        preview.innerHTML = '<p style="text-align: center; color: var(--admin-text-secondary); padding: 40px;">尚無形狀，請上傳形狀圖片</p>';
        return;
    }
    
    preview.innerHTML = uploadedData.shapes.map(shape => `
        <div class="preview-item" data-id="${shape.id}">
            <img src="${shape.url}" alt="${shape.name}">
            <p>${shape.name}</p>
            <span class="badge ${shape.uploaded ? 'badge-success' : 'badge-warning'}">
                ${shape.uploaded ? '已上傳' : '待上傳'}
            </span>
            <button class="btn btn-sm btn-danger" onclick="deleteShape('${shape.id}')">
                <span class="material-icons">delete</span>
                刪除
            </button>
        </div>
    `).join('');
}

function updatePatternsPreview() {
    const preview = document.getElementById('patternsPreview');
    if (!preview) return;
    
    if (uploadedData.patterns.length === 0) {
        preview.innerHTML = '<p style="text-align: center; color: var(--admin-text-secondary); padding: 40px;">尚無圖案，請上傳圖案圖片</p>';
        return;
    }
    
    preview.innerHTML = uploadedData.patterns.map(pattern => `
        <div class="preview-item" data-id="${pattern.id}">
            <div style="width: 80px; height: 80px; background: url(${pattern.url}) repeat; background-size: 40px 40px; border-radius: 8px; margin: 0 auto;"></div>
            <p>${pattern.name}</p>
            <span class="badge ${pattern.uploaded ? 'badge-success' : 'badge-warning'}">
                ${pattern.uploaded ? '已上傳' : '待上傳'}
            </span>
            <button class="btn btn-sm btn-danger" onclick="deletePattern('${pattern.id}')">
                <span class="material-icons">delete</span>
                刪除
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
    
    // 生成 4 個漸層色
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
    
    if (uploadedData.colors.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--admin-text-secondary); padding: 40px;">尚無顏色組，請新增顏色</p>';
        return;
    }
    
    container.innerHTML = uploadedData.colors.map(group => `
        <div class="color-item" data-id="${group.id}">
            <div class="color-preview" style="background-color: ${group.main};"></div>
            <div style="flex: 1;">
                <p style="font-weight: 600; margin: 0;">${group.name}</p>
                <p style="font-size: 12px; color: var(--admin-text-secondary); margin: 4px 0 0;">${group.main}</p>
                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    ${group.shades.map(shade => `
                        <div style="width: 20px; height: 20px; background: ${shade}; border-radius: 4px;" title="${shade}"></div>
                    `).join('')}
                </div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteColor(${group.id})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// 載入預設顏色
function loadDefaultColors() {
    const defaultColors = [
        { name: '經典紅', main: '#dc3545' },
        { name: '寶藍色', main: '#0066cc' },
        { name: '墨綠色', main: '#2d5a2d' },
        { name: '紫羅蘭', main: '#6f42c1' },
        { name: '金黃色', main: '#ffc107' },
        { name: '深灰色', main: '#495057' }
    ];
    
    defaultColors.forEach(color => {
        const colorGroup = {
            id: Date.now() + Math.random(),
            name: color.name,
            main: color.main,
            shades: generateColorShades(color.main)
        };
        uploadedData.colors.push(colorGroup);
    });
    
    displayColorGroups();
    showNotification('已載入預設顏色', 'success');
}

// GitHub 整合功能
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
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveEditFont('${id}')">
                <span class="material-icons">save</span>
                儲存
            </button>
        </div>
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
        GitHubConfig.promptToken();
        return false;
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
        GitHubConfig.promptToken();
        return;
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
        version: '3.0.0'
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
        GitHubConfig.promptToken();
        return;
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
                <p>請設定 GitHub Token 以啟用同步功能</p>
            `;
        }
    }
}

// 測試 GitHub 連線
async function testGitHubConnection() {
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
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
            updateGitHubStatus(true);
        } else {
            console.error('無法存取 Repository');
            showNotification('無法存取 Repository', 'danger');
            updateGitHubStatus(false);
        }
        
    } catch (error) {
        console.error('測試失敗:', error);
        showNotification('測試失敗: ' + error.message, 'danger');
        updateGitHubStatus(false);
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

// 儲存 GitHub Token
function saveGitHubToken() {
    const token = document.getElementById('githubTokenInput').value;
    if (token) {
        GitHubConfig.setToken(token);
        closeModal();
        showNotification('GitHub Token 已儲存', 'success');
        testGitHubConnection();
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
        version: '3.0.0'
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
        GitHubConfig.promptToken();
        return;
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
    const container = document.getElementById('githubButtons');
    if (container) {
        container.innerHTML = `
            <button class="btn btn-warning" onclick="testGitHubConnection()" title="測試連線">
                <span class="material-icons">bug_report</span>
                <span class="btn-text">測試</span>
            </button>
            <button class="btn btn-primary" onclick="loadFromGitHub()" title="從 GitHub 載入">
                <span class="material-icons">cloud_download</span>
                <span class="btn-text">載入</span>
            </button>
            <button class="btn btn-success" onclick="saveToGitHub()" title="儲存到 GitHub">
                <span class="material-icons">cloud_upload</span>
                <span class="btn-text">儲存</span>
            </button>
            <button class="btn btn-warning" onclick="cleanupUnusedFiles()" title="清理未使用檔案">
                <span class="material-icons">cleaning_services</span>
                <span class="btn-text">清理</span>
            </button>
            <button class="btn btn-danger" onclick="clearGitHubToken()" title="清除 Token">
                <span class="material-icons">key_off</span>
            </button>
        `;
        
        // 在小螢幕隱藏按鈕文字
        if (window.innerWidth <= 1200) {
            document.querySelectorAll('.btn-text').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
}

// 顯示提示
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        'success': 'check_circle',
        'warning': 'warning',
        'danger': 'error',
        'info': 'info'
    };
    
    notification.innerHTML = `
        <span class="material-icons">${icons[type] || 'info'}</span>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <span class="material-icons">close</span>
        </button>
    `;
    
    container.appendChild(notification);
    
    // 自動移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
                    <button class="btn btn-sm" onclick="closeModal()" style="background: none; box-shadow: none;">
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
    
    // ESC 關閉
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}

function closeModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 字體設定
function showFontSettings() {
    const settings = JSON.parse(localStorage.getItem('fontSettings') || '{}');
    
    const content = `
        <div class="grid grid-2">
            <div class="form-group">
                <label class="form-label">預設字體大小</label>
                <input type="number" class="form-control" id="defaultFontSize" value="${settings.defaultFontSize || 16}" min="10" max="72">
            </div>
            <div class="form-group">
                <label class="form-label">預設行高</label>
                <input type="number" class="form-control" id="defaultLineHeight" value="${settings.defaultLineHeight || 1.5}" min="1" max="3" step="0.1">
            </div>
            <div class="form-group">
                <label class="form-label">預設字重</label>
                <select class="form-control" id="defaultFontWeight">
                    <option value="normal" ${settings.defaultFontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="bold" ${settings.defaultFontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                    <option value="100" ${settings.defaultFontWeight === '100' ? 'selected' : ''}>100 - Thin</option>
                    <option value="300" ${settings.defaultFontWeight === '300' ? 'selected' : ''}>300 - Light</option>
                    <option value="400" ${settings.defaultFontWeight === '400' ? 'selected' : ''}>400 - Regular</option>
                    <option value="500" ${settings.defaultFontWeight === '500' ? 'selected' : ''}>500 - Medium</option>
                    <option value="600" ${settings.defaultFontWeight === '600' ? 'selected' : ''}>600 - Semi Bold</option>
                    <option value="700" ${settings.defaultFontWeight === '700' ? 'selected' : ''}>700 - Bold</option>
                    <option value="900" ${settings.defaultFontWeight === '900' ? 'selected' : ''}>900 - Black</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">字體渲染</label>
                <select class="form-control" id="fontRendering">
                    <option value="auto" ${settings.fontRendering === 'auto' ? 'selected' : ''}>自動</option>
                    <option value="optimizeSpeed" ${settings.fontRendering === 'optimizeSpeed' ? 'selected' : ''}>速度優先</option>
                    <option value="optimizeLegibility" ${settings.fontRendering === 'optimizeLegibility' ? 'selected' : ''}>清晰度優先</option>
                    <option value="geometricPrecision" ${settings.fontRendering === 'geometricPrecision' ? 'selected' : ''}>幾何精度</option>
                </select>
            </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveFontSettings()">
                <span class="material-icons">save</span>
                儲存設定
            </button>
        </div>
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

// 顯示形狀製作指南
function showShapeGuide() {
    const content = `
        <h4>形狀製作指南</h4>
        <div class="info-list">
            <p><strong>建議尺寸：</strong> 512x512px（正方形）</p>
            <p><strong>檔案格式：</strong> PNG（透明背景）、SVG（向量圖）</p>
            <p><strong>設計原則：</strong></p>
            <ul style="margin-left: 20px;">
                <li>使用透明背景，避免白色底色</li>
                <li>形狀應該填滿畫布，留適當邊距</li>
                <li>線條清晰，避免過細的線條</li>
                <li>考慮縮小後的可讀性</li>
            </ul>
            <p><strong>推薦工具：</strong></p>
            <ul style="margin-left: 20px;">
                <li>Adobe Illustrator（專業）</li>
                <li>Inkscape（免費）</li>
                <li>Figma（線上）</li>
                <li>Canva（簡易）</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <button class="btn btn-primary" onclick="closeModal()">了解</button>
        </div>
    `;
    
    showModal('形狀製作指南', content);
}

// 顯示圖案製作指南
function showPatternGuide() {
    const content = `
        <h4>圖案製作指南</h4>
        <div class="info-list">
            <p><strong>建議尺寸：</strong> 64x64px（可平鋪）</p>
            <p><strong>檔案格式：</strong> PNG、JPG、SVG</p>
            <p><strong>設計原則：</strong></p>
            <ul style="margin-left: 20px;">
                <li>圖案必須可無縫平鋪</li>
                <li>避免過於複雜的圖案</li>
                <li>注意對比度，避免太淺或太深</li>
                <li>測試平鋪效果是否自然</li>
            </ul>
            <p><strong>圖案類型：</strong></p>
            <ul style="margin-left: 20px;">
                <li>幾何圖案（點、線、格子）</li>
                <li>自然紋理（木紋、石紋）</li>
                <li>抽象圖案（漸層、雜訊）</li>
                <li>傳統圖案（雲紋、回紋）</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <button class="btn btn-primary" onclick="closeModal()">了解</button>
        </div>
    `;
    
    showModal('圖案製作指南', content);
}

// 顯示快捷鍵
function showShortcuts() {
    const content = `
        <div class="shortcut-list">
            <h4>鍵盤快捷鍵</h4>
            <p><kbd>Ctrl</kbd> + <kbd>S</kbd> - 儲存到 GitHub</p>
            <p><kbd>Ctrl</kbd> + <kbd>O</kbd> - 從 GitHub 載入</p>
            <p><kbd>Ctrl</kbd> + <kbd>E</kbd> - 匯出設定</p>
            <p><kbd>Ctrl</kbd> + <kbd>/</kbd> - 顯示快捷鍵</p>
            <p><kbd>Esc</kbd> - 關閉彈窗</p>
            
            <h4 style="margin-top: 24px;">操作提示</h4>
            <p>• 拖放檔案到上傳區域快速上傳</p>
            <p>• 拖曳表格中的排序圖示調整順序</p>
            <p>• 點擊顏色預覽可複製色碼</p>
            <p>• Ctrl + 右鍵可在後台使用開發者工具</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <button class="btn btn-primary" onclick="closeModal()">關閉</button>
        </div>
    `;
    
    showModal('快捷鍵與操作提示', content);
}

// 設定鍵盤快捷鍵
function setupKeyboardShortcuts() {
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
        
        // Ctrl+/ 顯示快捷鍵
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            showShortcuts();
        }
    });
}

// 加入震動動畫
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

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

console.log('🎯 印章系統後台管理 v3.0.0');
console.log('👤 作者: DK0124');
console.log('📅 最後更新: 2025-07-29');
console.log('🔐 預設帳號: admin / 密碼: 0918124726');
