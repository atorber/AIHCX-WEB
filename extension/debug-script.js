// AIHC助手插件调试脚本
// 在控制台中运行此脚本来检查按钮状态

console.log('=== AIHC助手插件调试脚本 ===');

// 1. 检查按钮是否存在
const button = document.getElementById('aihcx-helper-toggle');
console.log('1. 按钮元素:', button);

if (button) {
  // 2. 检查按钮位置和样式
  const rect = button.getBoundingClientRect();
  const styles = window.getComputedStyle(button);
  
  console.log('2. 按钮位置信息:', {
    rect: rect,
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    zIndex: styles.zIndex,
    position: styles.position,
    top: styles.top,
    right: styles.right,
    width: styles.width,
    height: styles.height,
    backgroundColor: styles.backgroundColor
  });
  
  // 3. 检查按钮是否在视口内
  const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                      rect.bottom <= window.innerHeight && 
                      rect.right <= window.innerWidth;
  console.log('3. 按钮是否在视口内:', isInViewport);
  
  // 4. 检查按钮的父元素
  console.log('4. 按钮父元素:', button.parentElement);
  
  // 5. 手动设置按钮样式进行测试
  console.log('5. 尝试手动设置按钮样式...');
  button.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    right: 0 !important;
    transform: translateY(-50%) !important;
    width: 40px !important;
    height: 60px !important;
    background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
    border: none !important;
    border-radius: 8px 0 0 8px !important;
    cursor: pointer !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: -2px 0 8px rgba(66, 133, 244, 0.3) !important;
    transition: all 0.3s ease !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    color: white !important;
    font-size: 10px !important;
    font-weight: 600 !important;
  `;
  button.textContent = 'AIHC';
  
  console.log('6. 按钮样式已手动设置，请检查是否可见');
  
  // 6. 添加点击事件
  button.addEventListener('click', () => {
    console.log('按钮被点击了！');
    alert('AIHC助手按钮工作正常！');
  });
  
} else {
  console.log('❌ 未找到AIHC助手按钮');
  
  // 尝试手动创建按钮
  console.log('尝试手动创建按钮...');
  const newButton = document.createElement('button');
  newButton.id = 'aihcx-helper-toggle-manual';
  newButton.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    right: 0 !important;
    transform: translateY(-50%) !important;
    width: 40px !important;
    height: 60px !important;
    background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
    border: none !important;
    border-radius: 8px 0 0 8px !important;
    cursor: pointer !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: -2px 0 8px rgba(66, 133, 244, 0.3) !important;
    transition: all 0.3s ease !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    color: white !important;
    font-size: 10px !important;
    font-weight: 600 !important;
  `;
  newButton.textContent = 'AIHC';
  newButton.addEventListener('click', () => {
    console.log('手动创建的按钮被点击了！');
    alert('手动创建的AIHC助手按钮工作正常！');
  });
  
  document.body.appendChild(newButton);
  console.log('✅ 手动创建的按钮已添加到页面');
}

// 7. 检查CSS样式表
console.log('7. 检查CSS样式表...');
const stylesheets = Array.from(document.styleSheets);
const aihcStyles = stylesheets.find(sheet => 
  sheet.href && sheet.href.includes('content/style.css')
);
console.log('AIHC样式表:', aihcStyles);

// 8. 检查页面滚动位置
console.log('8. 页面滚动信息:', {
  scrollX: window.scrollX,
  scrollY: window.scrollY,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight
});

console.log('=== 调试脚本执行完成 ===');
