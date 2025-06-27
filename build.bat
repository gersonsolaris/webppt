@echo off
chcp 65001 >nul
title 湘潭城发集团合规宣传应用 - Electron构建工具

echo.
echo ========================================================
echo   湘潭城发集团合规宣传应用 - Electron构建工具
echo   Xiangtan Chengfa Group Compliance App Builder
echo ========================================================
echo.

REM Add Node.js to PATH (temporary)
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check Node.js
echo 检查 Node.js 环境 / Checking Node.js...
call node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js / ERROR: Node.js not found
    echo 请确保已安装 Node.js / Please make sure Node.js is installed
    pause
    exit /b 1
)

REM Check npm
echo 检查 npm 环境 / Checking npm...
call npm.cmd --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm / ERROR: npm not found
    pause
    exit /b 1
)

echo ✅ 环境检查通过 / Environment check passed
echo.

REM Check dependencies
if not exist "node_modules" (
    echo 安装依赖包 / Installing dependencies...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败 / ERROR: Dependencies installation failed
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成 / Dependencies installed successfully
) else (
    echo ✅ 依赖已存在 / Dependencies already exist
)
echo.

REM Display options
echo 请选择构建选项 / Please select build option:
echo.
echo 1 - Windows完整版 (可能遇到代码签名问题)
echo     Windows full version (may have code signing issues)
echo.
echo 2 - Windows简化版 (推荐，无代码签名)  
echo     Windows simple version (recommended, no code signing)
echo.
echo 3 - Windows便携版 (无权限问题，最稳定)
echo     Windows portable version (no permission issues, most stable)
echo.
echo 4 - Linux版本
echo     Linux version
echo.
echo 5 - 开发测试模式
echo     Development test mode
echo.
echo 6 - 清理构建缓存
echo     Clean build cache
echo.

set /p choice=请输入选项 / Please enter option (1-6): 

if "%choice%"=="1" goto build_win
if "%choice%"=="2" goto build_win_simple
if "%choice%"=="3" goto build_win_portable
if "%choice%"=="4" goto build_linux
if "%choice%"=="5" goto dev_test
if "%choice%"=="6" goto clean_cache

echo ❌ 无效选项 / ERROR: Invalid option
pause
exit /b 1

:build_win
echo.
echo 🔨 构建Windows完整版本 / Building Windows full version...
call npm.cmd run build:win
goto check_result

:build_win_simple
echo.
echo 🔨 构建Windows简化版本 (推荐) / Building Windows simple version (recommended)...
call node_modules\.bin\electron-builder.cmd --win --dir --config electron-builder.json
goto check_simple_result

:build_win_portable
echo.
echo 🔨 构建Windows便携版本 (最稳定) / Building Windows portable version (most stable)...
echo 清理缓存以避免权限问题 / Cleaning cache to avoid permission issues...
if exist "%LOCALAPPDATA%\electron-builder" rmdir /s /q "%LOCALAPPDATA%\electron-builder"
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
call node_modules\.bin\electron-builder.cmd --win --dir --config electron-builder.json
goto check_simple_result

:build_linux
echo.
echo 🔨 构建Linux版本 / Building Linux version...
call npm.cmd run build:linux
goto check_result

:dev_test
echo.
echo 🔨 启动开发模式 / Starting development mode...
set NODE_ENV=development
call npm.cmd start
goto end

:clean_cache
echo.
echo 🧹 清理缓存 / Cleaning cache...
if exist "dist" rmdir /s /q "dist"
if exist "%LOCALAPPDATA%\electron-builder" rmdir /s /q "%LOCALAPPDATA%\electron-builder"
echo ✅ 缓存清理完成 / Cache cleaned successfully
goto end

:check_result
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败! / ERROR: Build failed!
    echo 💡 建议尝试选项2 (Windows简化版本) / SUGGESTION: Try option 2 (Windows simple version)
) else (
    echo.
    echo 🎉 构建完成! / SUCCESS: Build completed!
    echo 📁 输出目录 / Output directory: .\dist\
    if exist "dist" dir /b dist
)
goto end

:check_simple_result
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败! 请检查错误信息 / ERROR: Build failed! Please check error messages
) else (
    echo.
    echo 🎉 Windows简化版本构建完成! / SUCCESS: Windows simple version build completed!
    echo 📁 输出目录 / Output directory: .\dist\win-unpacked\
    if exist "dist\win-unpacked\湘潭城发集团合规宣传.exe" (
        echo ✅ 可执行文件已生成 / Executable file created successfully
        echo.
        echo 💡 运行应用 / To run the app:
        echo    .\dist\win-unpacked\湘潭城发集团合规宣传.exe
    )
)
goto end

:end
echo.
pause
