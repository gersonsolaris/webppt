@echo off
chcp 65001 >nul
title 湘潭城发集团合规宣传应用 - Electron打包工具

echo 🚀 湘潭城发集团合规宣传应用 - Electron打包工具
echo ==================================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
for /f %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js 版本: %NODE_VERSION%
echo ✅ npm 版本: %NPM_VERSION%
echo.

REM 安装依赖
echo 📦 安装依赖包...
npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.

REM 询问用户要构建的平台
echo 请选择要构建的平台:
echo 1) Windows (x64 + x86)
echo 2) Linux (x64 + AppImage + deb)
echo 3) 全平台构建
echo 4) 仅开发测试 (快速启动)
echo.

set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" (
    echo 🔨 构建 Windows 版本...
    npm run build:win
) else if "%choice%"=="2" (
    echo 🔨 构建 Linux 版本...
    npm run build:linux
) else if "%choice%"=="3" (
    echo 🔨 构建全平台版本...
    npm run build:all
) else if "%choice%"=="4" (
    echo 🔨 启动开发版本...
    set NODE_ENV=development
    npm start
) else (
    echo ❌ 无效选项
    pause
    exit /b 1
)

if not "%choice%"=="4" if %errorlevel% equ 0 (
    echo.
    echo 🎉 构建完成！
    echo 📁 输出目录: .\dist\
    echo.
    echo 生成的文件:
    if exist dist (
        dir dist
    ) else (
        echo 未找到dist目录
    )
)

pause
