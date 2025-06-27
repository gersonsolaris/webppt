# 湘潭城发集团合规宣传应用 - 构建指南

## 🚀 快速开始

只需运行一个命令：

```cmd
.\build.bat
```

然后选择 **选项3 - Windows便携版（最稳定）** 或 **选项2 - Windows简化版**

## 📋 构建选项

1. **Windows完整版** - 包含安装程序（可能遇到代码签名问题）
2. **Windows简化版** - 仅可执行文件（推荐，无代码签名问题）
3. **Windows便携版** - 无权限问题（**最稳定**，推荐遇到权限错误时使用）
4. **Linux版本** - 生成Linux包
5. **开发测试模式** - 快速启动应用进行测试
6. **清理构建缓存** - 清理构建文件和缓存

## ✅ 推荐流程

```cmd
# 1. 运行构建脚本
.\build.bat

# 2. 选择选项 3 (Windows便携版，最稳定)
#    或选项 2 (Windows简化版)

# 3. 构建完成后，运行应用
.\dist\win-unpacked\湘潭城发集团合规宣传.exe
```

## 📁 输出文件

构建成功后，应用文件位于：
- **可执行文件**: `dist\win-unpacked\湘潭城发集团合规宣传.exe`
- **完整应用**: `dist\win-unpacked\` 目录下的所有文件

## 🐛 常见问题与解决方案

### 问题1: winCodeSign 权限错误

**错误信息:**
```
ERROR: Cannot create symbolic link : 客户端没有所需的特权
```

**原因:** Windows对创建符号链接有严格的权限控制，electron-builder下载的winCodeSign工具包含需要符号链接的文件。

**解决方案:**

#### 方法1: 以管理员身份运行（推荐）
```cmd
# 1. 右键点击 PowerShell 或 CMD
# 2. 选择 "以管理员身份运行"
# 3. 进入项目目录
cd c:\Users\hx\workspace\webppt

# 4. 运行构建脚本
.\build.bat
# 选择选项 3 - Windows便携版
```

#### 方法2: 启用开发者模式（一次性设置）
1. 打开 **Windows设置** → **更新和安全** → **开发者选项**
2. 启用 **开发人员模式**
3. 重启电脑
4. 正常运行 `.\build.bat` 选择选项2或3

#### 方法3: 清理缓存重试
```cmd
# 使用build.bat清理缓存
.\build.bat
# 选择选项 6 - 清理构建缓存

# 然后重新构建
# 选择选项 3 - Windows便携版
```

### 问题2: winCodeSign下载和解压失败

**错误信息:**
```
Archives with Errors: 1
winCodeSign-2.6.0.7z
```

**原因:** 
- 网络问题导致下载的压缩包损坏
- electron-builder缓存损坏
- 版本兼容性问题

**解决方案:**

```powershell
# 手动清理electron-builder缓存
Remove-Item "$env:LOCALAPPDATA\electron-builder" -Recurse -Force -ErrorAction SilentlyContinue

# 使用简化配置重新构建
.\build.bat
# 选择选项 3 - Windows便携版
```

### 问题3: Node.js 或 npm 未找到

**错误信息:**
```
❌ 错误: 未找到 Node.js / ERROR: Node.js not found
```

**解决方案:**

1. **检查Node.js安装:**
   ```cmd
   node --version
   npm --version
   ```

2. **添加Node.js到PATH（临时）:**
   ```cmd
   set "PATH=C:\Program Files\nodejs;%PATH%"
   ```

3. **永久添加到系统PATH:**
   - 右键"此电脑" → 属性 → 高级系统设置
   - 环境变量 → 系统变量 → Path → 编辑
   - 添加 `C:\Program Files\nodejs`

## 🔧 技术细节

### 构建配置优化

项目使用了优化的 `electron-builder.json` 配置：
- ✅ 跳过代码签名（避免winCodeSign下载）
- ✅ 只生成解压版本（`target: "dir"`）
- ✅ 更快的构建速度
- ✅ 避免网络依赖问题

### 构建脚本特性

`build.bat` 脚本提供：
- ✅ 中英文双语界面
- ✅ 自动环境检查
- ✅ 智能依赖管理
- ✅ 6种构建选项
- ✅ 清晰的错误提示

### 支持的平台

- **Windows**: 生成便携版exe文件
- **Linux**: 生成AppImage和deb包
- **开发模式**: 快速测试和调试

## 🎯 构建结果

构建成功后的文件结构：

```
dist/
├── win-unpacked/
│   ├── 湘潭城发集团合规宣传.exe  ← 主程序
│   ├── assets/                    ← 资源文件
│   ├── chrome_100_percent.pak     ← Chromium资源
│   ├── resources/                 ← 应用资源
│   └── [其他Electron运行时文件]
```

## 🚀 运行应用

构建完成后，直接运行：
```cmd
.\dist\win-unpacked\湘潭城发集团合规宣传.exe
```

## 📝 开发和部署

### 开发测试
```cmd
.\build.bat
# 选择选项 5 - 开发测试模式
```

### 生产部署
1. 构建便携版应用
2. 将整个 `win-unpacked` 文件夹打包
3. 分发给最终用户

### 后续优化建议

如果需要生成安装程序，可以：

1. **升级electron-builder**：
   ```cmd
   npm install electron-builder@latest
   ```

2. **配置代码签名证书**（企业用户）
3. **使用在线代码签名服务**

## 💡 最佳实践

- **首选选项3（Windows便携版）** - 最稳定，避免权限问题
- **以管理员身份运行** - 如果遇到权限错误
- **清理缓存** - 构建失败时先清理缓存
- **网络连接** - 确保良好的网络连接用于下载依赖
- **磁盘空间** - 确保有足够的磁盘空间用于构建

## 🎊 总结

使用 `.\build.bat` 脚本选择选项3，可以快速、稳定地构建湘潭城发集团合规宣传应用。生成的便携版应用无需安装，双击即可运行。

**成功标志:**
```
🎉 构建成功! / Build successful!
📁 输出目录 / Output directory: .\dist\win-unpacked\
✅ 可执行文件已生成 / Executable file created successfully
```
