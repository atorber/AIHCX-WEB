// 创建悬浮按钮
const createFloatingButton = () => {
    const button = document.createElement('div');
    button.id = 'aihcx-floating-button';
    button.innerHTML = `
        <div class="aihcx-button-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
        </div>
    `;
    document.body.appendChild(button);

    // 从存储中获取位置
    chrome.storage.sync.get(['aihcxButtonPosition'], (result) => {
        if (result.aihcxButtonPosition) {
            button.style.left = result.aihcxButtonPosition.x + 'px';
            button.style.top = result.aihcxButtonPosition.y + 'px';
        }
    });

    // 拖动功能
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    button.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === button || e.target.closest('#aihcx-floating-button')) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, button);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;

        // 保存位置
        chrome.storage.sync.set({
            aihcxButtonPosition: {
                x: currentX,
                y: currentY
            }
        });
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // 点击事件
    button.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'openPopup' });
    });
};

// 等待页面加载完成后创建按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
} else {
    createFloatingButton();
} 