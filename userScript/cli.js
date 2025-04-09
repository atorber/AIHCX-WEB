// ==UserScript==
// @name         Baidu AIHC CLI生成按钮
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在AIHC任务详情页添加生成CLI命令按钮
// @author       You
// @match        https://console.bce.baidu.com/aihc/infoTaskIndex/detail*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 等待页面加载完成
    function waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // 创建CLI按钮
    function createCliButton() {
        const button = document.createElement('button');
        button.className = 'ant-btn css-sk7pns ant-btn-default ant-btn-color-default ant-btn-variant-outlined osui-button';
        button.style.minWidth = '72px';
        button.innerHTML = '<span>生成CLI命令</span>';

        button.addEventListener('click', function() {
            // 获取URL参数
            const urlParams = new URLSearchParams(window.location.search);
            const k8sName = urlParams.get('k8sName');
            const clusterUuid = urlParams.get('clusterUuid');
            const k8sNamespace = urlParams.get('k8sNamespace');

            // 生成CLI命令
            const cliCommand = `bce aihc submit --name ${k8sName} --cluster ${clusterUuid} --namespace ${k8sNamespace} --image pytorch:latest`;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(cliCommand).then(() => {
                alert('CLI命令已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制命令！');
            });
        });

        return button;
    }

    // 添加按钮到页面
    async function addCliButton() {
        try {
            // 等待按钮容器加载
            const buttonContainer = await waitForElement('.ant-space.css-sk7pns.ant-space-horizontal');
            
            // 创建按钮容器
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'ant-space-item';
            buttonWrapper.appendChild(createCliButton());

            // 在复制按钮前插入
            const copyButton = buttonContainer.querySelector('a[href*="/aihc/task/copy"]');
            if (copyButton && copyButton.parentElement) {
                buttonContainer.insertBefore(buttonWrapper, copyButton.parentElement);
            }
        } catch (error) {
            console.error('添加CLI按钮失败:', error);
        }
    }

    // 页面加载完成后执行
    window.addEventListener('load', addCliButton);
})();