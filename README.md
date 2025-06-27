# 湘潭城发集团合规宣传应用

一个基于Web技术构建的企业合规宣传展示平台，支持Web版本和Electron桌面版本。

## 📋 快速导航

- **[构建指南](docs/BUILD.md)** - 如何构建和部署应用
- **[Electron桌面版](docs/ELECTRON.md)** - 桌面应用开发和部署
- **[Web版本说明](docs/WEB.md)** - Web版本使用指南
- **[部署文档](DEPLOYMENT.md)** - 生产环境部署

## 🚀 快速开始

### 桌面版（推荐）

```cmd
# 1. 运行构建脚本
.\build.bat

# 2. 选择选项3 - Windows便携版（最稳定）
# 3. 运行生成的应用
.\dist\win-unpacked\湘潭城发集团合规宣传.exe
```

### Web版本

```bash
# 启动本地服务器
python server.py
# 访问 http://localhost:8000
```

## 🔧 开发工具

### 更新office文件索引
```bash
python scripts/scan_assets_to_json_index.py
```

### 转换WPS文件为TXT
```bash
python scripts/scan_wps_to_txt_converter.py
```

### 生成应用图标
```bash
python scripts/generate_icons.py
```

## 📁 项目结构

```
├── docs/
│   ├── BUILD.md          # 构建指南
│   ├── ELECTRON.md       # Electron开发指南
│   ├── WEB.md            # Web版本说明
│   └── imgs/             # 文档图片
├── build.bat             # 统一构建脚本
├── assets/               # 应用资源文件
├── css/                  # 样式文件
├── js/                   # JavaScript文件
├── electron/             # Electron相关文件
├── scripts/              # 开发工具脚本
└── DEPLOYMENT.md         # 部署文档
```

## 💡 特性

- 🖥️ **桌面应用**: 基于Electron的原生桌面体验
- 🌐 **Web应用**: 支持浏览器访问
- 📱 **响应式设计**: 适配不同屏幕尺寸
- 📁 **六大模块**: 完整的合规宣传内容体系
- 🔍 **PDF预览**: 内置PDF查看功能
- 🎯 **离线使用**: 无需网络连接

## 📚 详细文档

查看 `docs/` 目录获取更多技术文档和设计说明。