// \u63d2\u4ef6\u4fa7\u8fb9\u680f\u6d4b\u8bd5\u811a\u672c
// \u5728\u6d4f\u89c8\u5668\u63a7\u5236\u53f0\u4e2d\u8fd0\u884c\u6b64\u811a\u672c\u6765\u6d4b\u8bd5\u4fa7\u8fb9\u680f\u529f\u80fd

console.log('=== AIHC\u52a9\u624b\u4fa7\u8fb9\u680f\u6d4b\u8bd5 ===');

// 1. \u68c0\u67e5\u6269\u5c55\u662f\u5426\u5df2\u52a0\u8f7d
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('\u2713 Chrome\u6269\u5c55API\u53ef\u7528');
    console.log('\u6269\u5c55ID:', chrome.runtime.id);
} else {
    console.error('\u2717 Chrome\u6269\u5c55API\u4e0d\u53ef\u7528');
}

// 2. \u68c0\u67e5sidePanel API\u662f\u5426\u53ef\u7528
if (typeof chrome !== 'undefined' && chrome.sidePanel) {
    console.log('\u2713 sidePanel API\u53ef\u7528');
} else {
    console.error('\u2717 sidePanel API\u4e0d\u53ef\u7528');
}

// 3. \u68c0\u67e5\u6743\u9650
if (typeof chrome !== 'undefined' && chrome.permissions) {
    chrome.permissions.contains({ permissions: ['sidePanel'] }).then(hasPermission => {
        if (hasPermission) {
            console.log('\u2713 sidePanel\u6743\u9650\u5df2\u6388\u4e88');
        } else {
            console.error('\u2717 sidePanel\u6743\u9650\u672a\u6388\u4e88');
        }
    });
}

// 4. \u6d4b\u8bd5\u53d1\u9001\u6d88\u606f\u7ed9background script
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('\u6b63\u5728\u6d4b\u8bd5\u53d1\u9001openSidePanel\u6d88\u606f...');
    chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('\u2717 \u53d1\u9001\u6d88\u606f\u5931\u8d25:', chrome.runtime.lastError.message);
        } else {
            console.log('\u2713 \u6d88\u606f\u53d1\u9001\u6210\u529f\uff0c\u54cd\u5e94:', response);
        }
    });
}

// 5. \u68c0\u67e5\u60ac\u6d6e\u6309\u94ae\u662f\u5426\u5b58\u5728
const toggleButton = document.getElementById('aihcx-helper-toggle');
if (toggleButton) {
    console.log('\u2713 \u60ac\u6d6e\u6309\u94ae\u5df2\u627e\u5230');
    console.log('\u6309\u94ae\u4f4d\u7f6e:', toggleButton.getBoundingClientRect());
    console.log('\u6309\u94ae\u6837\u5f0f:', window.getComputedStyle(toggleButton));
} else {
    console.error('\u2717 \u60ac\u6d6e\u6309\u94ae\u672a\u627e\u5230');
}

// 6. \u68c0\u67e5\u5f53\u524d\u9875\u9762URL
console.log('\u5f53\u524dURL:', window.location.href);
const isAIHCPage = window.location.href.startsWith('https://console.bce.baidu.com/aihc');
console.log('\u662f\u5426AIHC\u9875\u9762:', isAIHCPage);

// 7. \u624b\u52a8\u6d4b\u8bd5\u6309\u94ae\u70b9\u51fb
if (toggleButton) {
    console.log('\u70b9\u51fb\u4ee5\u4e0b\u6309\u94ae\u6765\u6d4b\u8bd5\u60ac\u6d6e\u6309\u94ae\u529f\u80fd:');
    console.log(toggleButton);
}

console.log('=== \u6d4b\u8bd5\u5b8c\u6210 ===');

// \u8fd4\u56de\u4e00\u4e2a\u6d4b\u8bd5\u5bf9\u8c61\uff0c\u65b9\u4fbf\u624b\u52a8\u8c03\u7528
window.aihcTest = {
    testSidePanel: function() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
                console.log('\u624b\u52a8\u6d4b\u8bd5\u7ed3\u679c:', response);
            });
        }
    },
    clickButton: function() {
        const btn = document.getElementById('aihcx-helper-toggle');
        if (btn) {
            btn.click();
            console.log('\u5df2\u6a21\u62df\u70b9\u51fb\u60ac\u6d6e\u6309\u94ae');
        }
    }
};

console.log('\u53ef\u4f7f\u7528 window.aihcTest.testSidePanel() \u6216 window.aihcTest.clickButton() \u8fdb\u884c\u624b\u52a8\u6d4b\u8bd5');