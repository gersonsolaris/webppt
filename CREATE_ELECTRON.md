# 湘潭城发集团合规宣传应用 - Electron桌面版

## 概述

这是湘潭城发集团合规宣传网站的桌面应用版本，基于Electron技术构建，可以在Windows和Linux系统上作为独立应用运行。

## ✨ 特性

- 🖥️ **桌面应用**: 无需浏览器，直接运行
- 🔒 **安全可靠**: 本地运行，数据安全
- 📱 **响应式设计**: 支持不同屏幕尺寸
- 🎯 **原生体验**: 系统集成，菜单和快捷键支持
- 📦 **离线使用**: 无需网络连接即可使用
- 🚀 **快速启动**: 单击即可启动，无需浏览器
- 🎨 **原生界面**: 系统级菜单、对话框、通知

## 🖥️ 系统要求

### Windows
- Windows 7 SP1 或更高版本
- .NET Framework 4.5 或更高版本
- 至少 100MB 可用磁盘空间

### Linux
- Ubuntu 16.04 或更高版本
- 或其他支持 AppImage 的 Linux 发行版
- 至少 100MB 可用磁盘空间

## 🚀 开发环境搭建

### 前置要求
- Node.js 16.0 或更高版本
- npm 8.0 或更高版本
- Python 3.7+ (用于构建工具)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd webppt
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **生成应用图标**
   ```bash
   python scripts/generate_icons.py
   ```

4. **开发模式运行**
   ```bash
   npm start
   # 或者
   .\build.bat  # 选择选项5
   ```

## 🔧 构建和打包

### 快速构建

使用提供的构建脚本：

```cmd
# 运行统一构建脚本
.\build.bat

# 选择构建选项：
# 1 - Windows完整版 (包含安装程序)
# 2 - Windows简化版 (推荐，无代码签名)
# 3 - Windows便携版 (最稳定，无权限问题)
# 4 - Linux版本
# 5 - 开发测试模式
# 6 - 清理构建缓存
```

### 手动构建

**构建Windows版本:**
```bash
npm run build:win
```

**构建Linux版本:**
```bash
npm run build:linux
```

**构建所有平台:**
```bash
npm run build:all
```

## 📦 输出文件说明

构建完成后，在 `dist/` 目录下会生成以下文件：

### Windows输出
- `win-unpacked/湘潭城发集团合规宣传.exe` - 主执行文件
- `win-unpacked/` - 完整应用目录（推荐分发此目录）

### Linux输出
- `湘潭城发集团合规宣传-1.0.0.AppImage` - 便携式应用程序 (约301MB)
- `xtcf-compliance-app_1.0.0_amd64.deb` - Ubuntu/Debian安装包 (约254MB)
- `linux-unpacked/` - 解压版本目录

## 🖥️ 部署和使用

### Windows版本

**便携版（推荐）:**
```cmd
# 1. 将整个 win-unpacked 文件夹复制到目标机器
# 2. 双击运行主程序
湘潭城发集团合规宣传.exe
```

**优点:**
- ✅ 无需安装，开箱即用
- ✅ 不会影响系统环境
- ✅ 可放置在任意目录运行
- ✅ 适合企业内部分发

### Linux版本

**AppImage版本（推荐）:**
```bash
# 1. 给予执行权限
chmod +x "湘潭城发集团合规宣传-1.0.0.AppImage"

# 2. 双击运行或命令行启动
./湘潭城发集团合规宣传-1.0.0.AppImage
```

**DEB包版本:**
```bash
# 1. 安装deb包
sudo dpkg -i xtcf-compliance-app_1.0.0_amd64.deb

# 2. 解决依赖问题（如果有）
sudo apt-get install -f

# 3. 从应用菜单启动或命令行运行
xtcf-compliance-app
```

## 🎯 应用功能

### 核心功能保持
- ✅ 所有Web版本功能完全保留
- ✅ PowerPoint风格界面设计
- ✅ 六大功能模块：
  - 人人讲合规
  - 合规速递
  - 合规讲堂
  - 合规题库
  - 规行致远
  - 企业标识
- ✅ 轮播展示功能
- ✅ PDF在线查看
- ✅ 响应式设计

### Electron增强功能
- 🖥️ **原生桌面体验** - 独立窗口，系统托盘支持
- 🔒 **本地数据访问** - 直接读取assets目录文件
- ⌨️ **快捷键支持** - F11全屏，Ctrl+R刷新等
- 📋 **系统集成** - 文件关联，右键菜单
- 🔔 **原生通知** - 系统级通知提醒

## 🔧 技术规格

### Electron配置
- **Electron版本**: 28.3.3
- **Node.js**: 集成最新LTS版本
- **Chromium版本**: 基于最新稳定版

### 安全配置
- **nodeIntegration**: false (默认)
- **contextIsolation**: true
- **webSecurity**: true
- **allowRunningInsecureContent**: false

### 性能优化
- 预加载脚本优化
- 资源文件压缩
- 启动时间优化
- 内存使用优化

## 📁 项目结构

```
electron/
├── main.js              # 主进程文件
├── preload.js           # 预加载脚本
└── icons/               # 应用图标
    ├── icon.ico         # Windows图标
    ├── icon.png         # Linux图标
    └── icon_*.png       # 多尺寸图标

dist/                    # 构建输出目录
├── win-unpacked/        # Windows应用
├── linux-unpacked/      # Linux应用
├── *.AppImage          # Linux便携版
└── *.deb               # Linux安装包

assets/                  # 应用资源文件
├── office_files.json   # 文件索引
├── 1.人人讲合规/       # 功能模块1
├── 2.合规速递/         # 功能模块2
├── 3.合规讲堂/         # 功能模块3
├── 5.合规题库/         # 功能模块4
├── 6.规行致远/         # 功能模块5
└── logo/               # 企业标识
```

## 🛠️ 故障排除

### 常见问题

**1. 构建失败 - winCodeSign错误**
```bash
# 使用便携版构建
.\build.bat
# 选择选项 3 - Windows便携版
```

**2. 权限错误**
```bash
# 以管理员身份运行PowerShell/CMD
# 或启用Windows开发者模式
```

**3. Node.js未找到**
```bash
# 安装Node.js并添加到PATH
set "PATH=C:\Program Files\nodejs;%PATH%"
```

### 调试模式

**开发调试:**
```bash
npm start
# 或
.\build.bat  # 选择选项5
```

**生产调试:**
```bash
# 设置环境变量
set NODE_ENV=development
# 运行应用
.\dist\win-unpacked\湘潭城发集团合规宣传.exe
```

## 📝 最佳实践

### 开发建议
- 使用开发模式进行功能测试
- 定期清理构建缓存
- 保持依赖版本更新
- 测试不同操作系统兼容性

### 部署建议
- 优先使用便携版分发
- 提供多平台支持
- 包含用户使用指南
- 定期更新应用版本

## 🎊 总结

湘潭城发集团合规宣传应用的Electron版本提供了完整的桌面应用体验，结合了Web技术的灵活性和原生应用的性能优势。通过统一的构建脚本 `build.bat`，可以轻松构建适用于不同平台的应用版本。

**推荐使用流程:**
1. 运行 `.\build.bat`
2. 选择选项3（Windows便携版）
3. 分发 `dist\win-unpacked` 整个文件夹
4. 用户双击 `湘潭城发集团合规宣传.exe` 即可使用
