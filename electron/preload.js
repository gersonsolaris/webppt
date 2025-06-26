const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用信息
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // 平台信息
  platform: process.platform,
  
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // 检查是否运行在Electron环境
  isElectron: true
});

// 优化加载性能
window.addEventListener('DOMContentLoaded', () => {
  // 添加Electron特定的类名，便于CSS样式调整
  document.body.classList.add('electron-app');
  
  // 禁用右键菜单（可选）
  // document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // 禁用拖拽文件到窗口
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// 控制台输出应用信息
console.log('湘潭城发集团合规宣传应用已启动');
console.log('平台:', process.platform);
console.log('Electron版本:', process.versions.electron);
