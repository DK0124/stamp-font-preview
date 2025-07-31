/**
 * 印章系統後台管理 v4.0.0
 * @author DK0124
 * @version 4.0.0
 * @date 2025-01-31
 * @description 加入安全設定管理、預覽參數調整、字體路徑保護
 */

// 全域變數
let currentPage = 'dashboard';
let uploadedData = {
    fonts: [],
    shapes: [],
    patterns: [],
    colors: []
};

// 預覽設定
let previewSettings = {
    fontSize: { min: 24, max: 72, default: 48 },
    lineHeight: { min: 0.8, max: 2, default: 1.2 },
    borderWidth: { min: 1, max: 10, default: 5 },
    canvasSize: { width: 250, height: 250 },
    quality: 'high',
    antiAlias: true,
    patternPositions: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
};

// 字體保護設定
const FontProtection = {
    generateSecurePath: function(fontId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const hash = btoa(`${fontId}_${timestamp}_${random}`).replace(/=/g, '');
        return `secure/${hash}`;
    },
    
    createAccessToken: function(fontId, duration = 3600000) {
        const token = {
            fontId: fontId,
            expires: Date.now() + duration,
            signature: this.generateSignature(fontId)
        };
        return btoa(JSON.stringify(token));
    },
    
    generateSignature: function(fontId) {
        const secret = localStorage.getItem('font_secret') || 'default_secret';
        return btoa(`${fontId}_${secret}_${new Date().toDateString()}`);
    },
    
    validateToken: function(token) {
        try {
            const decoded = JSON.parse(atob(token));
            if (decoded.expires < Date.now()) {
                return false;
            }
            const expectedSignature = this.generateSignature(decoded.fontId);
            return decoded.signature === expectedSignature;
        } catch (e) {
            return false;
        }
    }
};

// 登入設定
const AdminAuth = {
    defaultUsername: 'admin',
    defaultPassword: '0918124726',
    sessionKey: 'admin_session',
    maxLoginAttempts: 5,
    lockoutDuration: 300000,
    
    isLoggedIn: function() {
        const session = sessionStorage.getItem(this.sessionKey);
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            if (new Date().getTime() - sessionData.loginTime > 24 * 60 * 60 * 1000) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    
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
    
    recordFailedAttempt: function() {
        const attempts = parseInt(localStorage.getItem('failed_attempts') || '0') + 1;
        localStorage.setItem('failed_attempts', attempts.toString());
        
        if (attempts >= this.maxLoginAttempts) {
            const lockedUntil = new Date().getTime() + this.lockoutDuration;
            localStorage.setItem('admin_lockout', JSON.stringify({ lockedUntil }));
            localStorage.removeItem('failed_attempts');
            return true;
        }
        return false;
    },
    
    login: function(username, password) {
        if (this.isLocked()) {
            return { success: false, message: '帳號已被鎖定，請稍後再試' };
        }
        
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
    
    logout: function() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.reload();
    },
    
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
                <p class="help-text">需要具有 repo 權限的 token 才能上傳檔案</p>
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
    if (!AdminAuth.isLoggedIn()) {
        showLoginPage();
        return;
    }
    
    initializeAdmin();
    setupBackendSecurity();
    
    loadPreviewSettings();
    loadSecuritySettings();
    
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
        document.getElementById('password').value = '';
        
        const loginBox = document.querySelector('.login-box');
        loginBox.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginBox.style.animation = '';
        }, 500);
    }
}

// 初始化管理系統
function initializeAdmin() {
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
                    <li><a href="#" class="admin-nav-item" data-page="preview">
                        <span class="material-icons">preview</span> 預覽設定
                    </a></li>
                    <li><a href="#" class="admin-nav-item" data-page="security">
                        <span class="material-icons">security</span> 安全設定
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
        <div id="notificationContainer" class="notification-container"></div>
    `;
    
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            currentPage = this.dataset.page;
            loadPage(currentPage);
        });
    });

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    loadPage('dashboard');
    
    setTimeout(() => {
        addGitHubButtons();
    }, 100);
    
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
        case 'preview':
            title.textContent = '預覽設定';
            content.innerHTML = getPreviewContent();
            initializePreviewPage();
            break;
        case 'security':
            title.textContent = '安全設定';
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
                    <span class="material-icons">security</span>
                    安全狀態
                </div>
            </div>
            <div class="grid grid-2">
                <div>
                    <h4 style="color: var(--admin-accent); margin-bottom: 16px;">前台安全設定</h4>
                    <p>防截圖保護：<span id="frontSecurityStatus" class="badge">檢查中...</span></p>
                    <p>浮水印保護：<span id="frontWatermarkStatus" class="badge">檢查中...</span></p>
                    <p>右鍵保護：<span id="frontRightClickStatus" class="badge">檢查中...</span></p>
                    <p>開發者工具偵測：<span id="frontDevToolsStatus" class="badge">檢查中...</span></p>
                    <p>字體路徑保護：<span id="fontProtectionStatus" class="badge">檢查中...</span></p>
                </div>
                <div>
                    <h4 style="color: var(--admin-accent); margin-bottom: 16px;">系統資訊</h4>
                    <p>最後更新：${new Date().toLocaleString('zh-TW')}</p>
                    <p>系統版本：4.0.0</p>
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
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="showFontSettings()">
                        <span class="material-icons">settings</span>
                        字體設定
                    </button>
                    <button class="btn btn-warning" onclick="showFontProtectionSettings()">
                        <span class="material-icons">shield</span>
                        保護設定
                    </button>
                </div>
            </div>
            <div class="upload-area" id="fontUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放字體檔案到此處，或點擊選擇檔案</p>
                <p class="help-text">
                    支援格式：.ttf, .otf, .woff, .woff2 | 無檔案大小限制
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
                    <button class="btn btn-secondary" onclick="batchUpdateFontCategories()">
                        <span class="material-icons">category</span>
                        批次分類
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
                            <th width="100">分類</th>
                            <th width="100">字重</th>
                            <th width="120">保護狀態</th>
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
            </div>
            <div class="upload-area" id="shapeUploadArea">
                <div class="upload-icon material-icons">cloud_upload</div>
                <p>拖放形狀圖片到此處，或點擊選擇檔案</p>
                <p class="help-text">
                    支援格式：.svg, .png | 建議使用 SVG 格式以保持最佳品質
                </p>
                <input type="file" id="shapeFileInput" multiple accept=".svg,.png" style="display: none;">
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">category</span>
                    形狀列表
                </div>
            </div>
            <div class="preview-grid" id="shapesGrid">
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
                <p>拖放圖案圖片到此處，或點擊選擇檔案</p>
                <p class="help-text">
                    支援格式：.svg, .png | 建議尺寸：100x100px
                </p>
                <input type="file" id="patternFileInput" multiple accept=".svg,.png" style="display: none;">
            </div>
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">texture</span>
                    圖案列表
                </div>
            </div>
            <div class="preview-grid" id="patternsGrid">
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
                    顏色設定
                </div>
                <button class="btn btn-primary" onclick="addNewColor()">
                    <span class="material-icons">add</span>
                    新增顏色
                </button>
            </div>
            <div class="color-picker-grid" id="colorsGrid">
                <!-- 動態載入 -->
            </div>
        </div>
    `;
}

// 預覽設定頁面
function getPreviewContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">tune</span>
                    預覽參數設定
                </div>
                <button class="btn btn-secondary" onclick="resetPreviewSettings()">
                    <span class="material-icons">restart_alt</span>
                    重設為預設值
                </button>
            </div>
            
            <div class="preview-settings">
                <!-- 字體設定 -->
                <div class="preview-setting-group">
                    <h4>字體設定</h4>
                    
                    <div class="range-input-group">
                        <label class="form-label">最小字體大小</label>
                        <input type="range" class="range-input" id="fontSizeMin" 
                               min="12" max="48" value="${previewSettings.fontSize.min}">
                        <span class="range-value">${previewSettings.fontSize.min}px</span>
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">最大字體大小</label>
                        <input type="range" class="range-input" id="fontSizeMax" 
                               min="48" max="120" value="${previewSettings.fontSize.max}">
                        <span class="range-value">${previewSettings.fontSize.max}px</span>
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">預設字體大小</label>
                        <input type="range" class="range-input" id="fontSizeDefault" 
                               min="24" max="72" value="${previewSettings.fontSize.default}">
                        <span class="range-value">${previewSettings.fontSize.default}px</span>
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">行高</label>
                        <input type="range" class="range-input" id="lineHeight" 
                               min="0.8" max="2" step="0.1" value="${previewSettings.lineHeight.default}">
                        <span class="range-value">${previewSettings.lineHeight.default}</span>
                    </div>
                </div>
                
                <!-- 邊框設定 -->
                <div class="preview-setting-group">
                    <h4>邊框設定</h4>
                    
                    <div class="range-input-group">
                        <label class="form-label">最小邊框寬度</label>
                        <input type="range" class="range-input" id="borderWidthMin" 
                               min="1" max="5" value="${previewSettings.borderWidth.min}">
                        <span class="range-value">${previewSettings.borderWidth.min}px</span>
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">最大邊框寬度</label>
                        <input type="range" class="range-input" id="borderWidthMax" 
                               min="5" max="20" value="${previewSettings.borderWidth.max}">
                        <span class="range-value">${previewSettings.borderWidth.max}px</span>
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">預設邊框寬度</label>
                        <input type="range" class="range-input" id="borderWidthDefault" 
                               min="1" max="10" value="${previewSettings.borderWidth.default}">
                        <span class="range-value">${previewSettings.borderWidth.default}px</span>
                    </div>
                </div>
                
                <!-- 畫布設定 -->
                <div class="preview-setting-group">
                    <h4>畫布設定</h4>
                    
                    <div class="form-group">
                        <label class="form-label">畫布寬度</label>
                        <input type="number" class="form-control" id="canvasWidth" 
                               value="${previewSettings.canvasSize.width}" min="100" max="500">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">畫布高度</label>
                        <input type="number" class="form-control" id="canvasHeight" 
                               value="${previewSettings.canvasSize.height}" min="100" max="500">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">渲染品質</label>
                        <select class="form-control" id="renderQuality">
                            <option value="low" ${previewSettings.quality === 'low' ? 'selected' : ''}>低品質（快速）</option>
                            <option value="medium" ${previewSettings.quality === 'medium' ? 'selected' : ''}>中等品質</option>
                            <option value="high" ${previewSettings.quality === 'high' ? 'selected' : ''}>高品質（清晰）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="antiAlias" ${previewSettings.antiAlias ? 'checked' : ''}>
                            啟用抗鋸齒
                        </label>
                    </div>
                </div>
                
                <!-- 圖案位置設定 -->
                <div class="preview-setting-group">
                    <h4>圖案位置設定</h4>
                    <p class="help-text">選擇圖案可出現的位置（可多選）</p>
                    
                    <div class="grid grid-2">
                        <label class="form-label">
                            <input type="checkbox" name="patternPosition" value="topLeft" 
                                   ${previewSettings.patternPositions.includes('topLeft') ? 'checked' : ''}>
                            左上角
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="patternPosition" value="topRight"
                                   ${previewSettings.patternPositions.includes('topRight') ? 'checked' : ''}>
                            右上角
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="patternPosition" value="bottomLeft"
                                   ${previewSettings.patternPositions.includes('bottomLeft') ? 'checked' : ''}>
                            左下角
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="patternPosition" value="bottomRight"
                                   ${previewSettings.patternPositions.includes('bottomRight') ? 'checked' : ''}>
                            右下角
                        </label>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 24px;">
                <button class="btn btn-success" onclick="savePreviewSettings()">
                    <span class="material-icons">save</span>
                    儲存設定
                </button>
            </div>
        </div>
        
        <!-- 即時預覽 -->
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">visibility</span>
                    設定預覽
                </div>
            </div>
            <div style="text-align: center; padding: 24px;">
                <canvas id="previewCanvas" style="border: 1px solid #e0e0e0; border-radius: 8px;"></canvas>
            </div>
        </div>
    `;
}

// 安全設定頁面
function getSecurityContent() {
    const savedSettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">security</span>
                    前台安全防護設定
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="saveAllSecuritySettings()">
                        <span class="material-icons">save</span>
                        儲存所有設定
                    </button>
                    <button class="btn btn-secondary" onclick="resetSecuritySettings()">
                        <span class="material-icons">restart_alt</span>
                        重設為預設值
                    </button>
                </div>
            </div>
            
            <div class="security-settings-grid">
                <!-- 基本防護 -->
                <div class="security-setting-card">
                    <h4 style="margin-bottom: 16px;">基本防護設定</h4>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">禁用右鍵選單</div>
                            <p class="help-text">防止使用者右鍵另存圖片</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="disableRightClick" ${savedSettings.disableRightClick !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">禁止文字選取</div>
                            <p class="help-text">防止使用者複製文字內容</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="disableTextSelect" ${savedSettings.disableTextSelect !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">禁止拖曳圖片</div>
                            <p class="help-text">防止使用者拖曳圖片到其他地方</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="disableDrag" ${savedSettings.disableDrag !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">禁止列印</div>
                            <p class="help-text">防止使用者列印頁面</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="disablePrint" ${savedSettings.disablePrint !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <!-- 進階防護 -->
                <div class="security-setting-card">
                    <h4 style="margin-bottom: 16px;">進階防護設定</h4>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">防止截圖保護</div>
                            <p class="help-text">偵測到截圖行為時顯示黑畫面</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="preventScreenshot" ${savedSettings.preventScreenshot ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">偵測開發者工具</div>
                            <p class="help-text">開啟開發者工具時顯示警告</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="detectDevTools" ${savedSettings.detectDevTools ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">失焦模糊</div>
                            <p class="help-text">當使用者切換視窗時模糊內容</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="blurOnLoseFocus" ${savedSettings.blurOnLoseFocus ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">禁用快捷鍵</div>
                            <p class="help-text">禁用複製、儲存等快捷鍵</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="disableShortcuts" ${savedSettings.disableShortcuts !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <!-- 字體保護 -->
                <div class="security-setting-card">
                    <h4 style="margin-bottom: 16px;">字體保護設定</h4>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">字體路徑加密</div>
                            <p class="help-text">使用加密路徑防止直接下載字體</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="encryptFontPath" ${savedSettings.encryptFontPath !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">字體訪問令牌</div>
                            <p class="help-text">需要有效令牌才能載入字體</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="requireFontToken" ${savedSettings.requireFontToken ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">令牌有效期（分鐘）</label>
                        <input type="number" class="form-control" id="tokenDuration" 
                               value="${savedSettings.tokenDuration || 60}" min="5" max="1440">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">字體載入密鑰</label>
                        <input type="text" class="form-control" id="fontSecret" 
                               value="${savedSettings.fontSecret || ''}" placeholder="留空使用預設密鑰">
                    </div>
                </div>
                
                <!-- 浮水印設定 -->
                <div class="security-setting-card">
                    <h4 style="margin-bottom: 16px;">浮水印設定</h4>
                    
                    <div class="security-toggle">
                        <div>
                            <div class="switch-label">啟用浮水印</div>
                            <p class="help-text">在預覽介面顯示浮水印</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="enableWatermark" ${savedSettings.enableWatermark ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">浮水印文字</label>
                        <input type="text" class="form-control" id="watermarkText" 
                               value="${savedSettings.watermarkText || '© 2025 印章系統 - 版權所有'}">
                    </div>
                    
                    <div class="range-input-group">
                        <label class="form-label">透明度</label>
                        <input type="range" class="range-input" id="watermarkOpacity" 
                               value="${(savedSettings.watermarkOpacity || 0.05) * 100}" 
                               min="1" max="20">
                        <span class="range-value">${((savedSettings.watermarkOpacity || 0.05) * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">字體大小</label>
                        <input type="number" class="form-control" id="watermarkFontSize" 
                               value="${savedSettings.watermarkFontSize || 20}" min="10" max="50">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 警告訊息設定 -->
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">warning</span>
                    警告訊息設定
                </div>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">右鍵警告訊息</label>
                    <input type="text" class="form-control" id="rightClickWarning" 
                           value="${savedSettings.rightClickWarning || '禁止右鍵操作'}">
                </div>
                <div class="form-group">
                    <label class="form-label">複製警告訊息</label>
                    <input type="text" class="form-control" id="copyWarning" 
                           value="${savedSettings.copyWarning || '禁止複製內容'}">
                </div>
                <div class="form-group">
                    <label class="form-label">截圖警告訊息</label>
                    <input type="text" class="form-control" id="screenshotWarning" 
                           value="${savedSettings.screenshotWarning || '禁止截圖 - 版權所有'}">
                </div>
                <div class="form-group">
                    <label class="form-label">開發者工具警告標題</label>
                    <input type="text" class="form-control" id="devToolsWarningTitle" 
                           value="${savedSettings.devToolsWarningTitle || '⚠️ 警告'}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">開發者工具警告內容</label>
                <textarea class="form-control" id="devToolsWarning" rows="3">${savedSettings.devToolsWarning || '偵測到開發者工具！\n本系統內容受版權保護。'}</textarea>
            </div>
        </div>
    `;
}

// 帳號設定頁面
function getAccountContent() {
    return `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">account_circle</span>
                    修改密碼
                </div>
            </div>
            <div style="max-width: 500px; padding: 24px;">
                <form onsubmit="changePassword(event)">
                    <div class="form-group">
                        <label class="form-label">目前密碼</label>
                        <input type="password" class="form-control" id="oldPassword" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">新密碼</label>
                        <input type="password" class="form-control" id="newPassword" required minlength="6">
                        <p class="help-text">密碼長度至少 6 個字元</p>
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
        </div>
        
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <span class="material-icons">vpn_key</span>
                    GitHub Token 設定
                </div>
            </div>
            <div style="max-width: 600px; padding: 24px;">
                <div class="form-group">
                    <label class="form-label">Personal Access Token</label>
                    <input type="password" class="form-control" id="githubToken" 
                           value="${GitHubConfig.getToken()}" placeholder="ghp_xxxxxxxxxxxx">
                    <p class="help-text">
                        需要具有 repo 權限的 token 才能上傳檔案
                        <a href="https://github.com/settings/tokens" target="_blank" style="color: var(--admin-primary);">
                            建立新 Token
                        </a>
                    </p>
                </div>
                <button class="btn btn-success" onclick="updateGitHubToken()">
                    <span class="material-icons">save</span>
                    儲存 Token
                </button>
            </div>
        </div>
    `;
}

// 初始化字體頁面
function initializeFontsPage() {
    const uploadArea = document.getElementById('fontUploadArea');
    const fileInput = document.getElementById('fontFileInput');
    
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
    
    if (typeof Sortable !== 'undefined') {
        new Sortable(document.getElementById('fontsTableBody'), {
            animation: 150,
            handle: '.material-icons',
            onEnd: function(evt) {
                updateFontOrder();
            }
        });
    }
}

// 處理字體檔案
function handleFontFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const extension = file.name.split('.').pop().toLowerCase();
            const baseName = file.name.replace(/\.[^.]+$/, '');
            
            const existingIds = uploadedData.fonts.map(f => parseInt(f.id)).filter(id => !isNaN(id));
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
            
            const fontData = {
                id: nextId,
                name: baseName,
                displayName: baseName,
                filename: file.name,
                extension: extension,
                file: file,
                size: formatFileSize(file.size),
                weight: 'normal',
                category: 'custom',
                url: e.target.result,
                uploaded: false,
                githubPath: null,
                protected: true,
                securePath: null,
                accessToken: null
            };
            
            uploadedData.fonts.push(fontData);
            updateFontsTable();
            showNotification(`字體 "${baseName}" 已新增 (${formatFileSize(file.size)})`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 更新字體表格
function updateFontsTable() {
    const tbody = document.getElementById('fontsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = uploadedData.fonts.map((font, index) => `
        <tr data-id="${font.id}">
            <td><span class="material-icons" style="cursor: move; color: var(--admin-text-secondary);">drag_indicator</span></td>
            <td style="font-weight: 600;">${font.displayName || font.name}</td>
            <td style="color: var(--admin-text-secondary);">${font.filename || font.name + '.' + font.extension}</td>
            <td>${font.size}</td>
            <td>
                <select class="form-control form-control-sm" onchange="updateFontCategory('${font.id}', this.value)">
                    <option value="custom" ${font.category === 'custom' ? 'selected' : ''}>自訂</option>
                    <option value="traditional" ${font.category === 'traditional' ? 'selected' : ''}>傳統</option>
                    <option value="handwrite" ${font.category === 'handwrite' ? 'selected' : ''}>手寫</option>
                    <option value="modern" ${font.category === 'modern' ? 'selected' : ''}>現代</option>
                </select>
            </td>
            <td>${font.weight}</td>
            <td>
                ${font.protected ? 
                    '<span class="badge badge-success">已保護</span>' : 
                    '<span class="badge badge-warning">未保護</span>'}
            </td>
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
                <button class="btn btn-sm btn-warning" onclick="toggleFontProtection('${font.id}')" title="切換保護">
                    <span class="material-icons">shield</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFont('${font.id}')" title="刪除">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// 初始化形狀頁面
function initializeShapesPage() {
    const uploadArea = document.getElementById('shapeUploadArea');
    const fileInput = document.getElementById('shapeFileInput');
    
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
    
    updateShapesGrid();
}

// 處理形狀檔案
function handleShapeFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(svg|png)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const shapeData = {
                id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name.replace(/\.[^.]+$/, ''),
                filename: file.name,
                file: file,
                url: e.target.result,
                uploaded: false
            };
            
            uploadedData.shapes.push(shapeData);
            updateShapesGrid();
            showNotification(`形狀 "${shapeData.name}" 已新增`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 更新形狀網格
function updateShapesGrid() {
    const grid = document.getElementById('shapesGrid');
    if (!grid) return;
    
    grid.innerHTML = uploadedData.shapes.map(shape => `
        <div class="preview-item" data-id="${shape.id}">
            <img src="${shape.url}" alt="${shape.name}">
            <p>${shape.name}</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
                ${!shape.uploaded ? 
                    `<button class="btn btn-sm btn-info" onclick="uploadSingleShape('${shape.id}')">
                        <span class="material-icons">upload</span>
                    </button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteShape('${shape.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

// 初始化圖案頁面
function initializePatternsPage() {
    const uploadArea = document.getElementById('patternUploadArea');
    const fileInput = document.getElementById('patternFileInput');
    
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
    
    updatePatternsGrid();
}

// 處理圖案檔案
function handlePatternFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(svg|png)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const patternData = {
                id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name.replace(/\.[^.]+$/, ''),
                filename: file.name,
                file: file,
                url: e.target.result,
                uploaded: false
            };
            
            uploadedData.patterns.push(patternData);
            updatePatternsGrid();
            showNotification(`圖案 "${patternData.name}" 已新增`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 更新圖案網格
function updatePatternsGrid() {
    const grid = document.getElementById('patternsGrid');
    if (!grid) return;
    
    grid.innerHTML = uploadedData.patterns.map(pattern => `
        <div class="preview-item" data-id="${pattern.id}">
            <img src="${pattern.url}" alt="${pattern.name}">
            <p>${pattern.name}</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
                ${!pattern.uploaded ? 
                    `<button class="btn btn-sm btn-info" onclick="uploadSinglePattern('${pattern.id}')">
                        <span class="material-icons">upload</span>
                    </button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deletePattern('${pattern.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

// 初始化顏色頁面
function initializeColorsPage() {
    updateColorsGrid();
}

// 更新顏色網格
function updateColorsGrid() {
    const grid = document.getElementById('colorsGrid');
    if (!grid) return;
    
    grid.innerHTML = uploadedData.colors.map((color, index) => `
        <div class="color-item" data-index="${index}">
            <div class="color-preview" style="background-color: ${color.main || color}"></div>
            <div style="flex: 1;">
                <input type="text" class="form-control form-control-sm" 
                       value="${color.name || '顏色 ' + (index + 1)}" 
                       onchange="updateColorName(${index}, this.value)"
                       placeholder="顏色名稱">
                <input type="color" class="form-control form-control-sm" 
                       value="${color.main || color}" 
                       onchange="updateColorValue(${index}, this.value)"
                       style="margin-top: 8px; height: 36px;">
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteColor(${index})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `).join('');
}

// 初始化預覽設定頁面
function initializePreviewPage() {
    document.querySelectorAll('.range-input').forEach(input => {
        const valueSpan = input.parentElement.querySelector('.range-value');
        
        input.addEventListener('input', function() {
            const value = this.value;
            const suffix = this.id.includes('LineHeight') ? '' : 'px';
            valueSpan.textContent = value + suffix;
            updatePreviewCanvas();
        });
    });
    
    ['canvasWidth', 'canvasHeight', 'renderQuality', 'antiAlias'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updatePreviewCanvas);
        }
    });
    
    updatePreviewCanvas();
}

// 更新預覽畫布
function updatePreviewCanvas() {
    const canvas = document.getElementById('previewCanvas');
    if (!canvas) return;
    
    const width = parseInt(document.getElementById('canvasWidth').value);
    const height = parseInt(document.getElementById('canvasHeight').value);
    const quality = document.getElementById('renderQuality').value;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: quality === 'low'
    });
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.7;
    
    ctx.strokeStyle = '#e57373';
    ctx.lineWidth = parseInt(document.getElementById('borderWidthDefault').value);
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    const fontSize = parseInt(document.getElementById('fontSizeDefault').value);
    ctx.font = `bold ${fontSize}px "Microsoft JhengHei"`;
    ctx.fillStyle = '#e57373';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('範例', centerX, centerY);
    
    if (quality === 'low') {
        ctx.filter = 'blur(1px)';
    }
}

// 儲存預覽設定
function savePreviewSettings() {
    previewSettings = {
        fontSize: {
            min: parseInt(document.getElementById('fontSizeMin').value),
            max: parseInt(document.getElementById('fontSizeMax').value),
            default: parseInt(document.getElementById('fontSizeDefault').value)
        },
        lineHeight: {
            min: parseFloat(document.getElementById('lineHeight').value),
            max: 2,
            default: parseFloat(document.getElementById('lineHeight').value)
        },
        borderWidth: {
            min: parseInt(document.getElementById('borderWidthMin').value),
            max: parseInt(document.getElementById('borderWidthMax').value),
            default: parseInt(document.getElementById('borderWidthDefault').value)
        },
        canvasSize: {
            width: parseInt(document.getElementById('canvasWidth').value),
            height: parseInt(document.getElementById('canvasHeight').value)
        },
        quality: document.getElementById('renderQuality').value,
        antiAlias: document.getElementById('antiAlias').checked,
        patternPositions: Array.from(document.querySelectorAll('input[name="patternPosition"]:checked'))
            .map(cb => cb.value)
    };
    
    localStorage.setItem('preview_settings', JSON.stringify(previewSettings));
    showNotification('預覽設定已儲存', 'success');
}

// 載入預覽設定
function loadPreviewSettings() {
    const saved = localStorage.getItem('preview_settings');
    if (saved) {
        previewSettings = JSON.parse(saved);
    }
}

// 重設預覽設定
function resetPreviewSettings() {
    if (confirm('確定要將預覽設定重設為預設值嗎？')) {
        previewSettings = {
            fontSize: { min: 24, max: 72, default: 48 },
            lineHeight: { min: 0.8, max: 2, default: 1.2 },
            borderWidth: { min: 1, max: 10, default: 5 },
            canvasSize: { width: 250, height: 250 },
            quality: 'high',
            antiAlias: true,
            patternPositions: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
        };
        localStorage.setItem('preview_settings', JSON.stringify(previewSettings));
        loadPage('preview');
        showNotification('預覽設定已重設', 'info');
    }
}

// 初始化安全設定頁面
function initializeSecurityPage() {
    const opacitySlider = document.getElementById('watermarkOpacity');
    if (opacitySlider) {
        const valueSpan = opacitySlider.parentElement.querySelector('.range-value');
        opacitySlider.addEventListener('input', function() {
            valueSpan.textContent = this.value + '%';
        });
    }
    
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const label = this.closest('.security-toggle').querySelector('.switch-label').textContent;
            showNotification(`${label} ${this.checked ? '已啟用' : '已停用'}`, 'info');
        });
    });
    
    updateSecurityStatus();
}

// 儲存所有安全設定
function saveAllSecuritySettings() {
    const settings = {
        disableRightClick: document.getElementById('disableRightClick').checked,
        disableTextSelect: document.getElementById('disableTextSelect').checked,
        disableDrag: document.getElementById('disableDrag').checked,
        disablePrint: document.getElementById('disablePrint').checked,
        preventScreenshot: document.getElementById('preventScreenshot').checked,
        detectDevTools: document.getElementById('detectDevTools').checked,
        blurOnLoseFocus: document.getElementById('blurOnLoseFocus').checked,
        disableShortcuts: document.getElementById('disableShortcuts').checked,
        encryptFontPath: document.getElementById('encryptFontPath').checked,
        requireFontToken: document.getElementById('requireFontToken').checked,
        tokenDuration: parseInt(document.getElementById('tokenDuration').value),
        fontSecret: document.getElementById('fontSecret').value || 'default_secret_key_2025',
        enableWatermark: document.getElementById('enableWatermark').checked,
        watermarkText: document.getElementById('watermarkText').value,
        watermarkOpacity: parseFloat(document.getElementById('watermarkOpacity').value) / 100,
        watermarkFontSize: parseInt(document.getElementById('watermarkFontSize').value),
        rightClickWarning: document.getElementById('rightClickWarning').value,
        copyWarning: document.getElementById('copyWarning').value,
        screenshotWarning: document.getElementById('screenshotWarning').value,
        devToolsWarningTitle: document.getElementById('devToolsWarningTitle').value,
        devToolsWarning: document.getElementById('devToolsWarning').value,
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('frontend_security_settings', JSON.stringify(settings));
    
    if (settings.encryptFontPath || settings.requireFontToken) {
        localStorage.setItem('font_secret', settings.fontSecret);
    }
    
    showNotification('安全設定已儲存', 'success');
    updateSecurityStatus();
    
    if (confirm('是否要將安全設定同步到 GitHub？')) {
        syncSecurityToGitHub(settings);
    }
}

// 載入安全設定
function loadSecuritySettings() {
    const saved = localStorage.getItem('frontend_security_settings');
    if (saved) {
        const settings = JSON.parse(saved);
    }
}

// 重設安全設定
function resetSecuritySettings() {
    if (confirm('確定要將所有安全設定重設為預設值嗎？')) {
        localStorage.removeItem('frontend_security_settings');
        localStorage.removeItem('font_secret');
        loadPage('security');
        showNotification('安全設定已重設為預設值', 'info');
    }
}

// 更新安全狀態
function updateSecurityStatus() {
    const settings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    const statusMap = {
        'frontSecurityStatus': settings.preventScreenshot,
        'frontWatermarkStatus': settings.enableWatermark,
        'frontRightClickStatus': settings.disableRightClick !== false,
        'frontDevToolsStatus': settings.detectDevTools,
        'fontProtectionStatus': settings.encryptFontPath !== false
    };
    
    for (const [id, enabled] of Object.entries(statusMap)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = enabled ? '啟用' : '停用';
            element.className = enabled ? 'badge badge-success' : 'badge badge-warning';
        }
    }
}

// 更新 Dashboard 狀態
function updateDashboardStatus() {
    updateSecurityStatus();
    testGitHubConnection();
}

// 測試 GitHub 連線
async function testGitHubConnection() {
    const statusDiv = document.getElementById('githubStatus');
    if (!statusDiv) return;
    
    statusDiv.innerHTML = '<p>檢查中...</p>';
    
    const token = GitHubConfig.getToken();
    if (!token) {
        statusDiv.innerHTML = `
            <p style="color: var(--admin-warning);">尚未設定 GitHub Token</p>
            <button class="btn btn-sm btn-primary" onclick="GitHubConfig.promptToken()">
                <span class="material-icons">vpn_key</span>
                設定 Token
            </button>
        `;
        return;
    }
    
    try {
        const response = await fetch(`https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const repo = await response.json();
            statusDiv.innerHTML = `
                <p style="color: var(--admin-success);">✓ 連線成功</p>
                <p>Repository: ${repo.full_name}</p>
                <p>預設分支: ${repo.default_branch}</p>
                <p>最後更新: ${new Date(repo.updated_at).toLocaleString('zh-TW')}</p>
            `;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        statusDiv.innerHTML = `
            <p style="color: var(--admin-danger);">✗ 連線失敗</p>
            <p>錯誤: ${error.message}</p>
            <button class="btn btn-sm btn-warning" onclick="GitHubConfig.promptToken()">
                <span class="material-icons">vpn_key</span>
                更新 Token
            </button>
        `;
    }
}

// GitHub 相關函數
function addGitHubButtons() {
    const container = document.getElementById('githubButtons');
    if (!container) return;
    
    container.innerHTML = `
        <button class="btn btn-sm btn-info" onclick="loadFromGitHub()">
            <span class="material-icons">download</span>
            從 GitHub 載入
        </button>
        <button class="btn btn-sm btn-success" onclick="saveToGitHub()">
            <span class="material-icons">upload</span>
            儲存到 GitHub
        </button>
    `;
}

// 從 GitHub 載入
async function loadFromGitHub() {
    try {
        showNotification('正在從 GitHub 載入設定...', 'info');
        
        const response = await fetch(GitHubConfig.configPath ? 
            `https://raw.githubusercontent.com/${GitHubConfig.owner}/${GitHubConfig.repo}/${GitHubConfig.branch}/${GitHubConfig.configPath}` :
            `${CONFIG.CONFIG_URL}?t=${Date.now()}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        
        uploadedData.fonts = config.fonts || [];
        uploadedData.shapes = config.shapes || [];
        uploadedData.patterns = config.patterns || [];
        uploadedData.colors = config.colors || [];
        
        if (config.previewSettings) {
            previewSettings = config.previewSettings;
            localStorage.setItem('preview_settings', JSON.stringify(previewSettings));
        }
        
        if (config.securitySettings) {
            localStorage.setItem('frontend_security_settings', JSON.stringify(config.securitySettings));
        }
        
        uploadedData.fonts.forEach(font => {
            font.uploaded = true;
        });
        uploadedData.shapes.forEach(shape => {
            shape.uploaded = true;
        });
        uploadedData.patterns.forEach(pattern => {
            pattern.uploaded = true;
        });
        
        showNotification('成功從 GitHub 載入設定', 'success');
        loadPage(currentPage);
        
    } catch (error) {
        console.error('載入失敗:', error);
        showNotification('從 GitHub 載入失敗: ' + error.message, 'danger');
    }
}

// 儲存到 GitHub
async function saveToGitHub() {
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
    }
    
    try {
        showNotification('正在儲存到 GitHub...', 'info');
        
        const config = await getCurrentConfig();
        await saveConfigToGitHub(config);
        
        showNotification('成功儲存到 GitHub', 'success');
    } catch (error) {
        console.error('儲存失敗:', error);
        showNotification('儲存到 GitHub 失敗: ' + error.message, 'danger');
    }
}

// 取得目前設定
async function getCurrentConfig() {
    const securitySettings = JSON.parse(localStorage.getItem('frontend_security_settings') || '{}');
    
    return {
        fonts: uploadedData.fonts.map(f => ({
            id: f.id,
            name: f.name,
            filename: f.filename,
            displayName: f.displayName || f.name,
            category: f.category || 'custom',
            weight: f.weight || 'normal',
            githubPath: f.githubPath || `assets/fonts/${f.filename}`,
            protected: f.protected || false,
            securePath: f.securePath,
            accessToken: f.protected ? FontProtection.createAccessToken(f.id) : null
        })),
        shapes: uploadedData.shapes.map(s => ({
            id: s.id,
            name: s.name,
            filename: s.filename,
            githubPath: s.githubPath || `assets/shapes/${s.filename}`
        })),
        patterns: uploadedData.patterns.map(p => ({
            id: p.id,
            name: p.name,
            filename: p.filename,
            githubPath: p.githubPath || `assets/patterns/${p.filename}`
        })),
        colors: uploadedData.colors,
        previewSettings: previewSettings,
        securitySettings: securitySettings,
        lastUpdate: new Date().toISOString(),
        version: '4.0.0'
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

// 同步安全設定到 GitHub
async function syncSecurityToGitHub(settings) {
    try {
        const config = await getCurrentConfig();
        config.securitySettings = settings;
        
        await saveConfigToGitHub(config);
        showNotification('安全設定已同步到 GitHub', 'success');
    } catch (error) {
        console.error('同步安全設定失敗:', error);
        showNotification('同步安全設定失敗', 'danger');
    }
}

// 儲存 GitHub Token
function saveGitHubToken() {
    const tokenInput = document.getElementById('githubTokenInput');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showNotification('請輸入有效的 Token', 'warning');
        return;
    }
    
    GitHubConfig.setToken(token);
    closeModal();
    showNotification('GitHub Token 已儲存', 'success');
    testGitHubConnection();
}

// 更新 GitHub Token
function updateGitHubToken() {
    const tokenInput = document.getElementById('githubToken');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showNotification('請輸入有效的 Token', 'warning');
        return;
    }
    
    GitHubConfig.setToken(token);
    showNotification('GitHub Token 已更新', 'success');
}

// 單一字體上傳
async function uploadSingleFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font || font.uploaded) return;
    
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
    }
    
    try {
        showNotification(`正在上傳字體 "${font.name}"...`, 'info');
        
        const base64Content = font.url.split(',')[1];
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/assets/fonts/${font.filename}`;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Upload font: ${font.filename}`,
                content: base64Content,
                branch: GitHubConfig.branch
            })
        });
        
        if (response.ok) {
            font.uploaded = true;
            font.githubPath = `assets/fonts/${font.filename}`;
            
            if (font.protected) {
                font.securePath = FontProtection.generateSecurePath(font.id);
                font.accessToken = FontProtection.createAccessToken(font.id);
            }
            
            updateFontsTable();
            showNotification(`字體 "${font.name}" 上傳成功`, 'success');
        } else {
            throw new Error(`上傳失敗: ${response.status}`);
        }
    } catch (error) {
        console.error('上傳字體失敗:', error);
        showNotification(`字體 "${font.name}" 上傳失敗: ${error.message}`, 'danger');
    }
}

// 批次上傳字體
async function uploadAllFonts() {
    const unuploadedFonts = uploadedData.fonts.filter(f => !f.uploaded);
    
    if (unuploadedFonts.length === 0) {
        showNotification('沒有需要上傳的字體', 'info');
        return;
    }
    
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
    }
    
    showNotification(`開始批次上傳 ${unuploadedFonts.length} 個字體...`, 'info');
    
    for (const font of unuploadedFonts) {
        await uploadSingleFont(font.id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 避免 API 限制
    }
    
    showNotification('批次上傳完成', 'success');
}

// 刪除字體
function deleteFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    if (confirm(`確定要刪除字體 "${font.name}" 嗎？`)) {
        uploadedData.fonts = uploadedData.fonts.filter(f => f.id != fontId);
        updateFontsTable();
        showNotification(`字體 "${font.name}" 已刪除`, 'info');
    }
}

// 編輯字體
function editFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    const modal = `
        <div class="form-group">
            <label class="form-label">顯示名稱</label>
            <input type="text" class="form-control" id="editFontName" value="${font.displayName || font.name}">
        </div>
        <div class="form-group">
            <label class="form-label">分類</label>
            <select class="form-control" id="editFontCategory">
                <option value="custom" ${font.category === 'custom' ? 'selected' : ''}>自訂</option>
                <option value="traditional" ${font.category === 'traditional' ? 'selected' : ''}>傳統</option>
                <option value="handwrite" ${font.category === 'handwrite' ? 'selected' : ''}>手寫</option>
                <option value="modern" ${font.category === 'modern' ? 'selected' : ''}>現代</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">字重</label>
            <select class="form-control" id="editFontWeight">
                <option value="normal" ${font.weight === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="bold" ${font.weight === 'bold' ? 'selected' : ''}>Bold</option>
                <option value="300" ${font.weight === '300' ? 'selected' : ''}>Light (300)</option>
                <option value="500" ${font.weight === '500' ? 'selected' : ''}>Medium (500)</option>
                <option value="700" ${font.weight === '700' ? 'selected' : ''}>Bold (700)</option>
            </select>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveEditFont('${fontId}')">
                <span class="material-icons">save</span>
                儲存
            </button>
        </div>
    `;
    
    showModal(`編輯字體 - ${font.name}`, modal);
}

// 儲存字體編輯
function saveEditFont(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    font.displayName = document.getElementById('editFontName').value;
    font.category = document.getElementById('editFontCategory').value;
    font.weight = document.getElementById('editFontWeight').value;
    
    updateFontsTable();
    closeModal();
    showNotification('字體資訊已更新', 'success');
}

// 更新字體分類
function updateFontCategory(fontId, category) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (font) {
        font.category = category;
    }
}

// 批次更新字體分類
function batchUpdateFontCategories() {
    const modal = `
        <div class="form-group">
            <label class="form-label">選擇目標分類</label>
            <select class="form-control" id="batchCategory">
                <option value="">-- 請選擇 --</option>
                <option value="custom">自訂</option>
                <option value="traditional">傳統</option>
                <option value="handwrite">手寫</option>
                <option value="modern">現代</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">
                <input type="checkbox" id="selectAllFonts" checked>
                套用到所有字體
            </label>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="applyBatchCategory()">
                <span class="material-icons">category</span>
                套用分類
            </button>
        </div>
    `;
    
    showModal('批次更新字體分類', modal);
}

// 套用批次分類
function applyBatchCategory() {
    const category = document.getElementById('batchCategory').value;
    const applyToAll = document.getElementById('selectAllFonts').checked;
    
    if (!category) {
        showNotification('請選擇分類', 'warning');
        return;
    }
    
    if (applyToAll) {
        uploadedData.fonts.forEach(font => {
            font.category = category;
        });
    }
    
    updateFontsTable();
    closeModal();
    showNotification('批次分類已套用', 'success');
}

// 檢查字體路徑
function checkFontsPaths() {
    let invalidCount = 0;
    
    uploadedData.fonts.forEach(font => {
        if (!font.githubPath && font.uploaded) {
            font.githubPath = `assets/fonts/${font.filename}`;
            invalidCount++;
        }
    });
    
    if (invalidCount > 0) {
        updateFontsTable();
        showNotification(`已修復 ${invalidCount} 個字體路徑`, 'success');
    } else {
        showNotification('所有字體路徑正常', 'info');
    }
}

// 切換字體保護
function toggleFontProtection(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    font.protected = !font.protected;
    
    if (font.protected) {
        font.securePath = FontProtection.generateSecurePath(font.id);
        font.accessToken = FontProtection.createAccessToken(font.id);
    } else {
        font.securePath = null;
        font.accessToken = null;
    }
    
    updateFontsTable();
    showNotification(`字體 "${font.name}" 保護已${font.protected ? '啟用' : '停用'}`, 'info');
}

// 顯示字體保護設定
function showFontProtectionSettings() {
    const content = `
        <div class="form-group">
            <h4>字體保護說明</h4>
            <p class="help-text">啟用字體保護後，系統會：</p>
            <ul style="margin-left: 20px; line-height: 1.8;">
                <li>使用加密的臨時路徑代替真實路徑</li>
                <li>需要有效的訪問令牌才能載入字體</li>
                <li>令牌有時效性，過期自動失效</li>
                <li>防止直接通過 URL 下載字體檔案</li>
                <li>記錄所有字體訪問嘗試</li>
            </ul>
        </div>
        
        <div class="form-group">
            <label class="form-label">全域保護設定</label>
            <button class="btn btn-primary" onclick="enableAllFontProtection()">
                <span class="material-icons">shield</span>
                啟用所有字體保護
            </button>
            <button class="btn btn-secondary" onclick="disableAllFontProtection()" style="margin-left: 10px;">
                <span class="material-icons">shield_off</span>
                停用所有字體保護
            </button>
        </div>
        
        <div class="form-group">
            <label class="form-label">保護統計</label>
            <p>已保護字體：${uploadedData.fonts.filter(f => f.protected).length} / ${uploadedData.fonts.length}</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${(uploadedData.fonts.filter(f => f.protected).length / uploadedData.fonts.length * 100).toFixed(0)}%"></div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">關閉</button>
        </div>
    `;
    
    showModal('字體保護設定', content);
}

// 啟用所有字體保護
function enableAllFontProtection() {
    uploadedData.fonts.forEach(font => {
        font.protected = true;
        font.securePath = FontProtection.generateSecurePath(font.id);
        font.accessToken = FontProtection.createAccessToken(font.id);
    });
    
    updateFontsTable();
    closeModal();
    showNotification('已啟用所有字體保護', 'success');
}

// 停用所有字體保護
function disableAllFontProtection() {
    if (confirm('確定要停用所有字體保護嗎？這可能會降低版權保護效果。')) {
        uploadedData.fonts.forEach(font => {
            font.protected = false;
            font.securePath = null;
            font.accessToken = null;
        });
        
        updateFontsTable();
        closeModal();
        showNotification('已停用所有字體保護', 'warning');
    }
}

// 顯示字體設定
function showFontSettings() {
    showNotification('字體設定功能開發中...', 'info');
}

// 更新字體順序
function updateFontOrder() {
    const rows = document.querySelectorAll('#fontsTableBody tr');
    const newOrder = [];
    
    rows.forEach((row, index) => {
        const fontId = row.dataset.id;
        const font = uploadedData.fonts.find(f => f.id == fontId);
        if (font) {
            newOrder.push(font);
        }
    });
    
    uploadedData.fonts = newOrder;
    showNotification('字體順序已更新', 'success');
}

// 刪除形狀
function deleteShape(shapeId) {
    const shape = uploadedData.shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    if (confirm(`確定要刪除形狀 "${shape.name}" 嗎？`)) {
        uploadedData.shapes = uploadedData.shapes.filter(s => s.id !== shapeId);
        updateShapesGrid();
        showNotification(`形狀 "${shape.name}" 已刪除`, 'info');
    }
}

// 單一形狀上傳
async function uploadSingleShape(shapeId) {
    const shape = uploadedData.shapes.find(s => s.id === shapeId);
    if (!shape || shape.uploaded) return;
    
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
    }
    
    try {
        showNotification(`正在上傳形狀 "${shape.name}"...`, 'info');
        
        const base64Content = shape.url.split(',')[1];
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/assets/shapes/${shape.filename}`;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Upload shape: ${shape.filename}`,
                content: base64Content,
                branch: GitHubConfig.branch
            })
        });
        
        if (response.ok) {
            shape.uploaded = true;
            shape.githubPath = `assets/shapes/${shape.filename}`;
            updateShapesGrid();
            showNotification(`形狀 "${shape.name}" 上傳成功`, 'success');
        } else {
            throw new Error(`上傳失敗: ${response.status}`);
        }
    } catch (error) {
        console.error('上傳形狀失敗:', error);
        showNotification(`形狀 "${shape.name}" 上傳失敗: ${error.message}`, 'danger');
    }
}

// 刪除圖案
function deletePattern(patternId) {
    const pattern = uploadedData.patterns.find(p => p.id === patternId);
    if (!pattern) return;
    
    if (confirm(`確定要刪除圖案 "${pattern.name}" 嗎？`)) {
        uploadedData.patterns = uploadedData.patterns.filter(p => p.id !== patternId);
        updatePatternsGrid();
        showNotification(`圖案 "${pattern.name}" 已刪除`, 'info');
    }
}

// 單一圖案上傳
async function uploadSinglePattern(patternId) {
    const pattern = uploadedData.patterns.find(p => p.id === patternId);
    if (!pattern || pattern.uploaded) return;
    
    const token = GitHubConfig.getToken();
    if (!token) {
        GitHubConfig.promptToken();
        return;
    }
    
    try {
        showNotification(`正在上傳圖案 "${pattern.name}"...`, 'info');
        
        const base64Content = pattern.url.split(',')[1];
        const apiUrl = `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/contents/assets/patterns/${pattern.filename}`;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Upload pattern: ${pattern.filename}`,
                content: base64Content,
                branch: GitHubConfig.branch
            })
        });
        
        if (response.ok) {
            pattern.uploaded = true;
            pattern.githubPath = `assets/patterns/${pattern.filename}`;
            updatePatternsGrid();
            showNotification(`圖案 "${pattern.name}" 上傳成功`, 'success');
        } else {
            throw new Error(`上傳失敗: ${response.status}`);
        }
    } catch (error) {
        console.error('上傳圖案失敗:', error);
        showNotification(`圖案 "${pattern.name}" 上傳失敗: ${error.message}`, 'danger');
    }
}

// 新增顏色
function addNewColor() {
    const newColor = {
        main: '#' + Math.floor(Math.random()*16777215).toString(16),
        name: `顏色 ${uploadedData.colors.length + 1}`
    };
    
    uploadedData.colors.push(newColor);
    updateColorsGrid();
    showNotification('新顏色已新增', 'success');
}

// 更新顏色名稱
function updateColorName(index, name) {
    if (uploadedData.colors[index]) {
        uploadedData.colors[index].name = name;
    }
}

// 更新顏色值
function updateColorValue(index, value) {
    if (uploadedData.colors[index]) {
        if (typeof uploadedData.colors[index] === 'string') {
            uploadedData.colors[index] = { main: value, name: `顏色 ${index + 1}` };
        } else {
            uploadedData.colors[index].main = value;
        }
        updateColorsGrid();
    }
}

// 刪除顏色
function deleteColor(index) {
    if (confirm(`確定要刪除此顏色嗎？`)) {
        uploadedData.colors.splice(index, 1);
        updateColorsGrid();
        showNotification('顏色已刪除', 'info');
    }
}

// 修改密碼
function changePassword(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('新密碼與確認密碼不符', 'warning');
        return;
    }
    
    if (AdminAuth.changePassword(oldPassword, newPassword)) {
        showNotification('密碼修改成功', 'success');
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        showNotification('目前密碼錯誤', 'danger');
    }
}

// 顯示通知
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="material-icons">${getNotificationIcon(type)}</span>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <span class="material-icons">close</span>
        </button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// 取得通知圖示
function getNotificationIcon(type) {
    const icons = {
        success: 'check_circle',
        warning: 'warning',
        danger: 'error',
        info: 'info'
    };
    return icons[type] || 'info';
}

// 顯示模態框
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
                    <button class="btn btn-sm" onclick="closeModal()" style="background: none; color: var(--admin-text-secondary);">
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

// 關閉模態框
function closeModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 格式化檔案大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 後台安全防護
function setupBackendSecurity() {
    document.addEventListener('contextmenu', (e) => {
        if (!e.ctrlKey) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('selectstart', (e) => {
        if (e.target.closest('.admin-table') || e.target.closest('.preview-item')) {
            e.preventDefault();
            return false;
        }
    });
    
    setInterval(() => {
        if (!AdminAuth.isLoggedIn()) {
            window.location.reload();
        }
    }, 60000);
    
    let lastActivity = Date.now();
    const activityTimeout = 30 * 60 * 1000;
    
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

// 設定鍵盤快捷鍵
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    if (currentPage === 'preview') {
                        savePreviewSettings();
                    } else if (currentPage === 'security') {
                        saveAllSecuritySettings();
                    }
                    break;
                case 'u':
                    e.preventDefault();
                    if (currentPage === 'fonts') {
                        uploadAllFonts();
                    }
                    break;
            }
        }
    });
}

// 預設顏色
if (uploadedData.colors.length === 0) {
    uploadedData.colors = [
        { main: '#e57373', name: '珊瑚紅' },
        { main: '#9fb28e', name: '抹茶綠' },
        { main: '#64b5f6', name: '天空藍' },
        { main: '#ffb74d', name: '琥珀黃' },
        { main: '#ba68c8', name: '薰衣草紫' },
        { main: '#4db6ac', name: '青瓷綠' },
        { main: '#ff8a65', name: '蜜桃橘' },
        { main: '#90a4ae', name: '石墨灰' }
    ];
}

console.log('🎯 印章系統後台管理 v4.0.0');
console.log('👤 作者: DK0124');
console.log('📅 最後更新: 2025-01-31');
console.log('✨ 新功能: 可配置安全設定、預覽參數調整、字體路徑保護');
