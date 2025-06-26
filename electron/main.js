const { app, BrowserWindow, Menu, shell, dialog, ipcMain, protocol, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// 保持对窗口对象的全局引用，避免垃圾回收
let mainWindow;

// 获取资源路径
function getResourcePath(resourcePath) {
  if (app.isPackaged) {
    // 生产环境：assets目录在应用根目录
    return path.join(process.resourcesPath, '..', resourcePath);
  } else {
    // 开发环境：assets目录在项目根目录
    return path.join(__dirname, '..', resourcePath);
  }
}

// 注册自定义协议来处理静态资源
function setupProtocol() {
  protocol.registerFileProtocol('app-assets', (request, callback) => {
    // 从 app-assets://path 提取路径
    const relativePath = decodeURIComponent(request.url.replace('app-assets://', ''));
    const filePath = getResourcePath(relativePath);
    
    console.log(`协议请求: ${request.url} -> ${filePath}`);
    
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      callback({ path: filePath });
    } else {
      console.error(`文件不存在: ${filePath}`);
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });
}

// 创建主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icons', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    show: false,
    titleBarStyle: 'default',
    backgroundColor: '#ffffff'
  });

  // 窗口准备完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发环境下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // 加载应用的 index.html
  const indexPath = path.join(__dirname, '..', 'index.html');
  mainWindow.loadFile(indexPath);

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 阻止导航到外部URL（安全考虑）
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // 允许本地文件和数据URL
    if (parsedUrl.protocol === 'file:' || parsedUrl.protocol === 'data:') {
      return;
    }
    
    // 城发集团官网允许打开
    if (parsedUrl.hostname === 'www.xtcfjt.com') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
      return;
    }
    
    // 其他外部链接也在外部浏览器打开
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  // 窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
    // 清理全局快捷键
    globalShortcut.unregisterAll();
  });

  // 注册全局快捷键
  globalShortcut.register('Ctrl+Shift+F', () => {
    if (mainWindow && !mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(true);
    }
  });

  globalShortcut.register('Ctrl+Shift+Q', () => {
    if (mainWindow && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });

  // 监听全屏状态变化
  mainWindow.on('enter-full-screen', () => {
    console.log('进入全屏模式');
  });

  mainWindow.on('leave-full-screen', () => {
    console.log('退出全屏模式');
  });

  // 设置窗口标题
  mainWindow.setTitle('湘潭城发集团合规宣传');
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '刷新',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: '强制刷新',
          accelerator: 'Ctrl+F5',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '实际大小',
          accelerator: 'Ctrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: '放大',
          accelerator: 'Ctrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: '缩小',
          accelerator: 'Ctrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        { type: 'separator' },
        {
          label: '进入全屏',
          accelerator: 'Ctrl+Shift+F',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(true);
            }
          }
        },
        {
          label: '退出全屏',
          accelerator: 'Ctrl+Shift+Q',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(false);
            }
          }
        },
        { type: 'separator' },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: '湘潭城发集团合规宣传',
              detail: '版本 1.0.0\\n\\n湘潭城乡建设发展集团有限公司\\n规行致远 · 合规经营',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  // 先注册自定义协议
  setupProtocol();
  
  createWindow();
  createMenu();

  app.on('activate', () => {
    // 在 macOS 上，点击 dock 图标并且没有其他窗口打开时，重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用和菜单栏通常会保持活动状态，直到用户通过 Cmd + Q 明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全设置：阻止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// 处理协议
app.setAsDefaultProtocolClient('xtcf-compliance');

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  dialog.showErrorBox('应用错误', `发生了未预期的错误:\\n${error.message}`);
});

// IPC 通信处理
ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    path: app.getAppPath()
  };
});

// 获取资源文件路径
ipcMain.handle('get-resource-path', (event, resourcePath) => {
  const fullPath = getResourcePath(resourcePath);
  return `file://${fullPath}`;
});

// 检查文件是否存在
ipcMain.handle('file-exists', (event, filePath) => {
  const fullPath = getResourcePath(filePath);
  return fs.existsSync(fullPath);
});
