# Windows版本构建指南

## 当前状态

✅ **Linux版本构建成功**
- AppImage: `湘潭城发集团合规宣传-1.0.0.AppImage` (301MB)
- DEB包: `xtcf-compliance-app_1.0.0_amd64.deb` (254MB)

❗ **Windows版本构建说明**

在Linux环境下构建Windows版本需要Wine环境，这会比较复杂。建议采用以下方案之一：

## 方案一：在Windows环境下构建（推荐）

1. **在Windows机器上执行：**
```cmd
# 安装Node.js和npm（如果尚未安装）
# 下载项目代码到Windows机器

# 安装依赖
npm install

# 构建Windows版本
npm run build:win
```

2. **预期输出：**
- `dist/湘潭城发集团合规宣传 Setup 1.0.0.exe` - NSIS安装程序
- `dist/win-unpacked/` - 解压版应用程序

## 方案二：在当前Linux环境配置Wine

如果必须在当前Linux环境构建Windows版本：

```bash
# 安装Wine
sudo apt install wine winetricks

# 配置Wine环境
winetricks

# 重新尝试构建
npm run build:win
```

## 方案三：使用GitHub Actions/CI自动构建

创建GitHub Actions工作流，在Windows虚拟机上自动构建：

```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]
jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist/*.exe
```

## 当前可用的Linux版本

### AppImage使用方法
```bash
# 给予执行权限
chmod +x "湘潭城发集团合规宣传-1.0.0.AppImage"

# 直接运行
./湘潭城发集团合规宣传-1.0.0.AppImage
```

### DEB包安装方法
```bash
# 安装deb包
sudo dpkg -i xtcf-compliance-app_1.0.0_amd64.deb

# 如果有依赖问题，运行：
sudo apt-get install -f

# 运行应用
xtcf-compliance-app
```

## 项目配置

当前Electron配置已经完善：
- ✅ 主进程配置 (`electron/main.js`)
- ✅ 预加载脚本 (`electron/preload.js`)  
- ✅ 图标资源 (`electron/icons/`)
- ✅ 构建配置 (`package.json`)
- ✅ 启动脚本 (`build-electron.sh`)

只需要在Windows环境下运行构建命令即可获得Windows安装程序。
