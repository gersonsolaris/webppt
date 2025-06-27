const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用信息
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // 获取资源文件路径
  getResourcePath: (resourcePath) => ipcRenderer.invoke('get-resource-path', resourcePath),
  
  // 检查文件是否存在
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  
  // 平台信息
  platform: process.platform,
  
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // 检查是否运行在Electron环境
  isElectron: true,
  
  // 转换assets路径为app-assets协议
  convertAssetsPath: (path) => {
    if (path.startsWith('assets/')) {
      return `app-assets://${path}`;
    }
    return path;
  }
});

// 页面加载完成后替换所有assets路径
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron预加载脚本执行 - 替换assets路径');
  
  // 替换所有img标签的src属性
  const images = document.querySelectorAll('img[src^="assets/"]');
  images.forEach(img => {
    const originalSrc = img.src;
    const newSrc = `app-assets://${img.getAttribute('src')}`;
    img.src = newSrc;
    console.log(`图片路径替换: ${originalSrc} -> ${newSrc}`);
  });
  
  // 替换所有CSS背景图片（如果有的话）
  const elementsWithBgImage = document.querySelectorAll('[style*="background-image"]');
  elementsWithBgImage.forEach(el => {
    const style = el.style.backgroundImage;
    if (style.includes('assets/')) {
      const newStyle = style.replace(/assets\//g, 'app-assets://assets/');
      el.style.backgroundImage = newStyle;
      console.log(`背景图片路径替换: ${style} -> ${newStyle}`);
    }
  });

  // 禁用文字选择和复制相关功能
  disableTextSelection();
  disableKeyboardShortcuts();
});

// 禁用文字选择
function disableTextSelection() {
  // 添加CSS禁用文字选择
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    /* 确保输入框和可编辑元素仍然可以选择文字 */
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);

  // 禁用拖拽
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // 禁用选择开始事件
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  console.log('文字选择已禁用');
}

// 禁用键盘快捷键
function disableKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 禁用Ctrl+A (全选)
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+C (复制)
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+V (粘贴)
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+X (剪切)
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+S (保存)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+P (打印)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    
    // 禁用Ctrl+U (查看源代码)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // 禁用F12 (在这里作为备用，主要在主进程中控制)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
  });

  console.log('键盘快捷键已禁用');
}

// 控制台输出应用信息
console.log('湘潭城发集团合规宣传应用已启动');
console.log('平台:', process.platform);
console.log('Electron版本:', process.versions.electron);
