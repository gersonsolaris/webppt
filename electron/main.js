const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 保持对窗口对象的全局引用，避免垃圾回收
let mainWindow;

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
