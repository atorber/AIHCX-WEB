// ==UserScript==
// @name         批量客户信息查询
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  批量查询客户信息并一键复制结果
// @author       You
// @match        https://eop.baidu-int.com/crm-v4*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // 工具函数
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    async function getUserInfo(keyword) {
        var body = {
            "keyword": keyword,
            "pageNo": 1,
            "pageSize": 10
        }
        var resource = await fetch('https://eop.baidu-int.com/api/crm2/home/customer/search', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const userRes = await resource.json()
        return {
            keyword: keyword,
            name: userRes.page?.result?.[0]?.name || '',
            type: userRes.page?.result?.[0]?.type || '',
        }
    }

    // 创建UI
    function createUI() {
        // 检查是否已添加
        if (document.getElementById('batch-userinfo-panel')) return;
        // 参考ant风格
        const panel = document.createElement('div');
        panel.id = 'batch-userinfo-panel';
        panel.style.position = 'fixed';
        panel.style.top = '20px';
        panel.style.right = '20px';
        panel.style.zIndex = 9999;
        panel.style.background = '#fff';
        panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        panel.style.borderRadius = '8px';
        panel.style.padding = '16px';
        panel.style.minWidth = '350px';
        panel.style.fontFamily = 'inherit';

        panel.innerHTML = `
        <div class="ant-space ant-space-vertical" style="width:100%">
            <div class="ant-space-item" style="width:100%">
                <textarea id="listStringInput" rows="6" style="width:100%;resize:vertical;" placeholder="每行一个客户ID"></textarea>
            </div>
            <div class="ant-space-item" style="display:flex;gap:8px;">
                <button id="startQueryBtn" class="ant-btn ant-btn-default ant-btn-variant-outlined" style="min-width:80px;">查询</button>
                <button id="copyResultBtn" class="ant-btn ant-btn-default ant-btn-variant-outlined" style="min-width:80px;">复制结果</button>
            </div>
            <div class="ant-space-item">
                <textarea id="resultOutput" rows="8" style="width:100%;resize:vertical;" readonly placeholder="查询结果将在此显示"></textarea>
            </div>
        </div>
        `;
        console.log('批量客户信息查询UI注入');
        document.body.appendChild(panel);
    }

    // 查询逻辑
    async function startQuery() {
        const input = document.getElementById('listStringInput').value.trim();
        const output = document.getElementById('resultOutput');
        if (!input) {
            output.value = '请输入客户ID列表';
            return;
        }
        const keywords = input.split(/\n|\r/).map(s=>s.trim()).filter(Boolean);
        let res_list = [];
        output.value = '查询中...';
        for (let i = 0; i < keywords.length; i++) {
            output.value = `正在查询第${i+1}/${keywords.length}个...`;
            try {
                const res = await getUserInfo(keywords[i]);
                if (res.type === '企业客户') {
                    res_list.push(`${res.keyword},${res.name}`);
                }
            } catch(e) {
                res_list.push(`${keywords[i]},查询失败`);
            }
            await new Promise(resolve => setTimeout(resolve, random(10, 50)));
        }
        output.value = res_list.join('\n') || '无企业客户结果';
    }

    // 复制逻辑
    function copyResult() {
        const output = document.getElementById('resultOutput');
        if (!output.value) return;
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(output.value);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(output.value);
        }
        // 简单提示
        const btn = document.getElementById('copyResultBtn');
        btn.innerText = '已复制!';
        setTimeout(()=>{btn.innerText='复制结果'}, 1200);
    }

    // 事件绑定
    function bindEvents() {
        document.getElementById('startQueryBtn').onclick = startQuery;
        document.getElementById('copyResultBtn').onclick = copyResult;
    }

    // 初始化
    function init() {
        console.log('init批量客户信息查询UI');
        createUI();
        bindEvents();
    }

    // 页面加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){
            console.log('init批量客户信息查询UI');
            init();
        });
    } else {
        init();
    }

})();