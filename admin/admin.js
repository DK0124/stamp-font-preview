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

// 新增：預覽設定
let previewSettings = {
    fontSize: { min: 24, max: 72, default: 48 },
    lineHeight: { min: 0.8, max: 2, default: 1.2 },
    borderWidth: { min: 1, max: 10, default: 5 },
    canvasSize: { width: 250, height: 250 },
    quality: 'high', // 'low', 'medium', 'high'
    antiAlias: true,
    patternPositions: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
};

// 新增：字體保護設定
const FontProtection = {
    // 生成加密的字體路徑
    generateSecurePath: function(fontId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const hash = btoa(`${fontId}_${timestamp}_${random}`).replace(/=/g, '');
        return `secure/${hash}`;
    },
    
    // 建立臨時訪問令牌
    createAccessToken: function(fontId, duration = 3600000) { // 1小時
        const token = {
            fontId: fontId,
            expires: Date.now() + duration,
            signature: this.generateSignature(fontId)
        };
        return btoa(JSON.stringify(token));
    },
    
    // 生成簽名
    generateSignature: function(fontId) {
        const secret = localStorage.getItem('font_secret') || 'default_secret';
        return btoa(`${fontId}_${secret}_${new Date().toDateString()}`);
    },
    
    // 驗證訪問令牌
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

// 登入設定（保持原有）
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

// GitHub 設定（加入字體保護）
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
    
    // 載入設定
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

// 字體管理頁面（加入保護功能）
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

// 新增：預覽設定頁面
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

// 安全設定頁面（更新版）
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
                <textarea class="form-control" id="devToolsWarning" rows="3">${savedSettings.devToolsWarning || '偵測到開發者工具！\n本系統內容受版權保護，禁止任何形式的複製或下載。'}</textarea>
            </div>
        </div>
    `;
}

// 處理字體檔案（更新版 - 加入保護）
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
                protected: true, // 預設啟用保護
                securePath: null, // 加密路徑
                accessToken: null // 訪問令牌
            };
            
            uploadedData.fonts.push(fontData);
            updateFontsTable();
            showNotification(`字體 "${baseName}" 已新增 (${formatFileSize(file.size)})`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 格式化檔案大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新字體表格（加入保護狀態）
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

// 初始化預覽設定頁面
function initializePreviewPage() {
    // 綁定範圍滑桿事件
    document.querySelectorAll('.range-input').forEach(input => {
        const valueSpan = input.parentElement.querySelector('.range-value');
        
        input.addEventListener('input', function() {
            const value = this.value;
            const suffix = this.id.includes('LineHeight') ? '' : 'px';
            valueSpan.textContent = value + suffix;
            
            // 即時更新預覽
            updatePreviewCanvas();
        });
    });
    
    // 綁定其他輸入事件
    ['canvasWidth', 'canvasHeight', 'renderQuality', 'antiAlias'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updatePreviewCanvas);
        }
    });
    
    // 初始化預覽
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
    
    // 白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // 繪製範例印章
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.7;
    
    // 邊框
    ctx.strokeStyle = '#e57373';
    ctx.lineWidth = parseInt(document.getElementById('borderWidthDefault').value);
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // 文字
    const fontSize = parseInt(document.getElementById('fontSizeDefault').value);
    ctx.font = `bold ${fontSize}px "Microsoft JhengHei"`;
    ctx.fillStyle = '#e57373';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('範例', centerX, centerY);
    
    // 品質提示
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
    // 綁定範圍滑桿
    const opacitySlider = document.getElementById('watermarkOpacity');
    if (opacitySlider) {
        const valueSpan = opacitySlider.parentElement.querySelector('.range-value');
        opacitySlider.addEventListener('input', function() {
            valueSpan.textContent = this.value + '%';
        });
    }
    
    // 綁定開關變化事件
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
        // 基本防護
        disableRightClick: document.getElementById('disableRightClick').checked,
        disableTextSelect: document.getElementById('disableTextSelect').checked,
        disableDrag: document.getElementById('disableDrag').checked,
        disablePrint: document.getElementById('disablePrint').checked,
        
        // 進階防護
        preventScreenshot: document.getElementById('preventScreenshot').checked,
        detectDevTools: document.getElementById('detectDevTools').checked,
        blurOnLoseFocus: document.getElementById('blurOnLoseFocus').checked,
        disableShortcuts: document.getElementById('disableShortcuts').checked,
        
        // 字體保護
        encryptFontPath: document.getElementById('encryptFontPath').checked,
        requireFontToken: document.getElementById('requireFontToken').checked,
        tokenDuration: parseInt(document.getElementById('tokenDuration').value),
        fontSecret: document.getElementById('fontSecret').value || 'default_secret_key_2025',
        
        // 浮水印
        enableWatermark: document.getElementById('enableWatermark').checked,
        watermarkText: document.getElementById('watermarkText').value,
        watermarkOpacity: parseFloat(document.getElementById('watermarkOpacity').value) / 100,
        watermarkFontSize: parseInt(document.getElementById('watermarkFontSize').value),
        
        // 警告訊息
        rightClickWarning: document.getElementById('rightClickWarning').value,
        copyWarning: document.getElementById('copyWarning').value,
        screenshotWarning: document.getElementById('screenshotWarning').value,
        devToolsWarningTitle: document.getElementById('devToolsWarningTitle').value,
        devToolsWarning: document.getElementById('devToolsWarning').value,
        
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('frontend_security_settings', JSON.stringify(settings));
    
    // 如果啟用字體保護，設定密鑰
    if (settings.encryptFontPath || settings.requireFontToken) {
        localStorage.setItem('font_secret', settings.fontSecret);
    }
    
    showNotification('安全設定已儲存', 'success');
    updateSecurityStatus();
    
    // 同步到 GitHub
    if (confirm('是否要將安全設定同步到 GitHub？')) {
        syncSecurityToGitHub(settings);
    }
}

// 載入安全設定
function loadSecuritySettings() {
    const saved = localStorage.getItem('frontend_security_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        // 設定會在頁面載入時自動填入
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

// 切換字體保護
function toggleFontProtection(fontId) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (!font) return;
    
    font.protected = !font.protected;
    
    if (font.protected) {
        // 生成安全路徑和令牌
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

// 取得目前設定（更新版）
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

// 後台安全防護
function setupBackendSecurity() {
    // 後台專用的安全設定
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
    
    // Session 超時檢查
    setInterval(() => {
        if (!AdminAuth.isLoggedIn()) {
            window.location.reload();
        }
    }, 60000);
    
    // 監控頁面活動
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

// 處理檔案上傳
function handleFontFiles(files) {
    // 移除檔案大小限制
    
    Array.from(files).forEach(file => {
        if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
            showNotification(`檔案 "${file.name}" 格式不支援`, 'warning');
            return;
        }
        
        // 移除大小檢查
        // if (file.size > maxSize) {
        //     showNotification(`檔案 "${file.name}" 超過限制`, 'warning');
        //     return;
        // }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const extension = file.name.split('.').pop().toLowerCase();
            const baseName = file.name.replace(/\.[^.]+$/, '');
            
            // 修正 ID 生成 - 使用簡單的遞增數字
            const existingIds = uploadedData.fonts.map(f => parseInt(f.id)).filter(id => !isNaN(id));
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
            
            const fontData = {
                id: nextId, // 使用數字 ID
                name: baseName,
                displayName: baseName, // 確保有 displayName
                filename: file.name,
                extension: extension,
                file: file,
                size: formatFileSize(file.size), // 格式化檔案大小
                weight: 'normal',
                category: 'custom', // 預設分類
                fontSize: '16px',
                lineHeight: '1.5',
                url: e.target.result,
                uploaded: false,
                githubPath: null
            };
            
            uploadedData.fonts.push(fontData);
            updateFontsTable();
            showNotification(`字體 "${baseName}" 已新增 (${formatFileSize(file.size)})`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// 新增檔案大小格式化函數
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// 新增更新字體分類的函數
function updateFontCategory(fontId, category) {
    const font = uploadedData.fonts.find(f => f.id == fontId);
    if (font) {
        font.category = category;
        showNotification(`字體分類已更新為: ${category}`, 'success');
    }
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
            <label class="form-label">顯示名稱</label>
            <input type="text" class="form-control" id="editFontDisplayName" value="${font.displayName || font.name}">
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
    font.displayName = document.getElementById('editFontDisplayName').value;
    font.category = document.getElementById('editFontCategory').value;
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
            id: String(f.id), // 確保 ID 是字串
            name: f.name,
            filename: f.filename,
            displayName: f.displayName || f.name,
            category: f.category || 'custom',
            weight: f.weight || 'normal',
            githubPath: f.githubPath || `assets/fonts/${f.filename}`
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
        colors: uploadedData.colors.map(c => ({
            main: c.main || c,
            name: c.name
        })),
        frontendSecurity: JSON.parse(localStorage.getItem('frontend_security_settings') || '{}'),
        lastUpdate: new Date().toISOString(),
        version: '3.1.0'
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
            
            // 處理字體資料，確保格式正確
            if (config.fonts && Array.isArray(config.fonts)) {
                uploadedData.fonts = config.fonts.map((font, index) => {
                    // 確保每個字體都有必要的屬性
                    return {
                        id: font.id || index + 1,
                        name: font.name || font.displayName || '未命名字體',
                        displayName: font.displayName || font.name || '未命名字體',
                        filename: font.filename || (font.githubPath ? font.githubPath.split('/').pop() : ''),
                        extension: font.filename ? font.filename.split('.').pop() : 'ttf',
                        category: font.category || 'custom',
                        weight: font.weight || 'normal',
                        size: font.size || '未知',
                        githubPath: font.githubPath,
                        uploaded: !!font.githubPath
                    };
                });
            } else {
                uploadedData.fonts = [];
            }
            
            // 處理其他資料
            uploadedData.shapes = config.shapes || [];
            uploadedData.patterns = config.patterns || [];
            uploadedData.colors = config.colors || [];
            
            // 確保形狀和圖案有正確的屬性
            uploadedData.shapes = uploadedData.shapes.map(s => ({
                ...s,
                uploaded: !!s.githubPath,
                filename: s.filename || (s.githubPath ? s.githubPath.split('/').pop() : '')
            }));
            
            uploadedData.patterns = uploadedData.patterns.map(p => ({
                ...p,
                uploaded: !!p.githubPath,
                filename: p.filename || (p.githubPath ? p.githubPath.split('/').pop() : '')
            }));
            
            // 載入前台安全設定
            if (config.frontendSecurity) {
                localStorage.setItem('frontend_security_settings', JSON.stringify(config.frontendSecurity));
            }
            
            // 更新顯示
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

// 加入批次分類功能
function batchUpdateFontCategories() {
    const content = `
        <div class="form-group">
            <label class="form-label">選擇要批次更新的字體</label>
            <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px;">
                ${uploadedData.fonts.map(font => `
                    <label style="display: block; margin-bottom: 8px;">
                        <input type="checkbox" name="batchFonts" value="${font.id}" checked>
                        ${font.displayName || font.name}
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">設定分類為</label>
            <select class="form-control" id="batchCategory">
                <option value="custom">自訂</option>
                <option value="traditional">傳統</option>
                <option value="handwrite">手寫</option>
                <option value="modern">現代</option>
            </select>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="applyBatchCategory()">
                <span class="material-icons">done_all</span>
                套用
            </button>
        </div>
    `;
    
    showModal('批次更新字體分類', content);
}

function applyBatchCategory() {
    const selectedFonts = Array.from(document.querySelectorAll('input[name="batchFonts"]:checked'))
        .map(input => input.value);
    const category = document.getElementById('batchCategory').value;
    
    let updateCount = 0;
    selectedFonts.forEach(fontId => {
        const font = uploadedData.fonts.find(f => f.id == fontId);
        if (font) {
            font.category = category;
            updateCount++;
        }
    });
    
    updateFontsTable();
    closeModal();
    showNotification(`已更新 ${updateCount} 個字體的分類`, 'success');
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

console.log('🎯 印章系統後台管理 v4.0.0');
console.log('👤 作者: DK0124');
console.log('📅 最後更新: 2025-07-31');
console.log('✨ 新功能: 可配置安全設定、預覽參數調整、字體路徑保護');
