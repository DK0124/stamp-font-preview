// 防止檢查元素
(function() {
    // 偵測開發者工具
    let devtools = { open: false };
    const threshold = 160;
    const emitEvent = (state) => {
        if (state.open) {
            document.body.style.display = 'none';
            alert('請勿嘗試檢查本系統');
            window.location.href = 'about:blank';
        }
    };
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                emitEvent(devtools);
            }
        } else {
            devtools.open = false;
            document.body.style.display = 'block';
        }
    }, 500);

    // 防止右鍵
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // 防止拖曳
    document.addEventListener('dragstart', e => e.preventDefault());
    
    // 防止選取
    document.addEventListener('selectstart', e => e.preventDefault());
    
    // 防止複製
    document.addEventListener('copy', e => e.preventDefault());
    
    // 防止截圖（使用 Page Visibility API）
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 顯示防護層
            const protection = document.createElement('div');
            protection.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: black;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            \`;
            protection.textContent = '系統已暫停顯示';
            protection.id = 'screenshot-protection';
            document.body.appendChild(protection);
            
            setTimeout(() => {
                const p = document.getElementById('screenshot-protection');
                if (p) p.remove();
            }, 3000);
        }
    });
    
    // 混淆字體 URL
    const obfuscateFontUrl = (url) => {
        // 使用 blob URL 隱藏真實路徑
        return fetch(url)
            .then(res => res.blob())
            .then(blob => URL.createObjectURL(blob));
    };
    
    // 定期檢查並移除可疑元素
    setInterval(() => {
        // 移除任何嘗試複製的元素
        document.querySelectorAll('[data-copy], [data-download]').forEach(el => el.remove());
        
        // 檢查浮水印是否被移除
        if (!document.querySelector('.stamp-watermark')) {
            addWatermark();
        }
    }, 1000);
    
    // 添加動態浮水印
    function addWatermark() {
        const watermark = document.createElement('div');
        watermark.className = 'stamp-watermark';
        watermark.style.cssText = \`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(0,0,0,0.05);
            pointer-events: none;
            z-index: 9999;
            user-select: none;
            white-space: nowrap;
        \`;
        watermark.textContent = '© 印章系統 ' + new Date().toISOString();
        document.body.appendChild(watermark);
    }
    
    addWatermark();
})();