# 湘潭城发集团合规宣传应用 - Electron打包工具 (PowerShell版本)
# =============================================================

Write-Host "🚀 湘潭城发集团合规宣传应用 - Electron打包工具" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# 设置Node.js路径
$NodePath = "C:\Program Files\nodejs"
$env:PATH = "$NodePath;$env:PATH"

# 检查Node.js是否安装
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "请确保 Node.js 安装在: $NodePath" -ForegroundColor Yellow
    Write-Host "或者将 Node.js 添加到系统 PATH 环境变量中" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查npm是否安装
try {
    $npmVersion = & npm.cmd --version 2>$null
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 npm，请先安装 npm" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 安装依赖
Write-Host "📦 安装依赖包..." -ForegroundColor Cyan
try {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 询问用户要构建的平台
Write-Host "请选择要构建的平台:" -ForegroundColor Yellow
Write-Host "1) Windows (x64 + x86)" -ForegroundColor White
Write-Host "2) Linux (x64 + AppImage + deb)" -ForegroundColor White
Write-Host "3) 全平台构建" -ForegroundColor White
Write-Host "4) 仅开发测试 (快速启动)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选项 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🔨 构建 Windows 版本..." -ForegroundColor Cyan
        & npm.cmd run build:win
    }
    "2" {
        Write-Host "🔨 构建 Linux 版本..." -ForegroundColor Cyan
        & npm.cmd run build:linux
    }
    "3" {
        Write-Host "🔨 构建全平台版本..." -ForegroundColor Cyan
        & npm.cmd run build:all
    }
    "4" {
        Write-Host "🔨 启动开发版本..." -ForegroundColor Cyan
        $env:NODE_ENV = "development"
        & npm.cmd start
    }
    default {
        Write-Host "❌ 无效选项" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

if ($choice -ne "4" -and $LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 构建完成！" -ForegroundColor Green
    Write-Host "📁 输出目录: .\dist\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "生成的文件:" -ForegroundColor Yellow
    if (Test-Path "dist") {
        Get-ChildItem "dist" | Format-Table Name, Length, LastWriteTime
    } else {
        Write-Host "未找到dist目录" -ForegroundColor Red
    }
}

Read-Host "按回车键退出"
