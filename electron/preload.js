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
});

// 控制台输出应用信息
console.log('湘潭城发集团合规宣传应用已启动');
console.log('平台:', process.platform);
console.log('Electron版本:', process.versions.electron);
