# 湘潭城发集团合规宣传应用 - 便携构建脚本
# 此脚本完全避免代码签名相关问题

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  湘潭城发集团合规宣传应用 - 便携构建脚本" -ForegroundColor Green  
Write-Host "  Xiangtan Chengfa Compliance App - Portable Builder" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"

# 检查Node.js
Write-Host "检查 Node.js 环境 / Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "✅ Node.js 版本 / Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js / ERROR: Node.js not found" -ForegroundColor Red
    Read-Host "按回车键退出 / Press Enter to exit"
    exit 1
}

# 检查npm
Write-Host "检查 npm 环境 / Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = & npm.cmd --version 2>$null
    Write-Host "✅ npm 版本 / Version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 npm / ERROR: npm not found" -ForegroundColor Red
    Read-Host "按回车键退出 / Press Enter to exit"
    exit 1
}

Write-Host ""

# 检查依赖
if (!(Test-Path "node_modules")) {
    Write-Host "安装依赖包 / Installing dependencies..." -ForegroundColor Cyan
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败 / Dependencies installation failed" -ForegroundColor Red
        Read-Host "按回车键退出 / Press Enter to exit"
        exit 1
    }
    Write-Host "✅ 依赖安装完成 / Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ 依赖已存在 / Dependencies already exist" -ForegroundColor Green
}

Write-Host ""

# 清理可能有问题的缓存
Write-Host "清理构建缓存以避免权限问题 / Cleaning build cache to avoid permission issues..." -ForegroundColor Yellow
Remove-Item "$env:LOCALAPPDATA\electron-builder" -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "✅ 缓存已清理 / Cache cleaned" -ForegroundColor Green

Write-Host ""

# 开始构建
Write-Host "🔨 开始构建Windows便携版本 / Starting Windows portable build..." -ForegroundColor Cyan
Write-Host "此版本完全跳过代码签名，避免权限问题 / This version completely skips code signing to avoid permission issues" -ForegroundColor Yellow

try {
    # 使用最简单的构建方式
    & node_modules\.bin\electron-builder.cmd --win --dir --config electron-builder.json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 构建成功! / Build successful!" -ForegroundColor Green
        Write-Host "📁 输出目录 / Output directory: .\dist\win-unpacked\" -ForegroundColor Cyan
        
        if (Test-Path "dist\win-unpacked\湘潭城发集团合规宣传.exe") {
            Write-Host "✅ 可执行文件已生成 / Executable file created successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 运行应用 / To run the app:" -ForegroundColor Yellow
            Write-Host "   .\dist\win-unpacked\湘潭城发集团合规宣传.exe" -ForegroundColor White
            Write-Host ""
            Write-Host "📦 分发 / Distribution:" -ForegroundColor Yellow
            Write-Host "   可以将整个 win-unpacked 文件夹打包分发" -ForegroundColor White
            Write-Host "   You can package the entire win-unpacked folder for distribution" -ForegroundColor White
        } else {
            Write-Host "⚠️  可执行文件未找到，但构建过程已完成 / Executable not found, but build process completed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ 构建失败 / Build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 构建过程中出现错误 / Error during build process: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "按回车键退出 / Press Enter to exit"
