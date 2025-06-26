#!/bin/bash

# Electron应用构建和打包脚本

echo "🚀 湘潭城发集团合规宣传应用 - Electron打包工具"
echo "=================================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 询问用户要构建的平台
echo "请选择要构建的平台:"
echo "1) Windows (x64 + x86)"
echo "2) Linux (x64 + AppImage + deb)"
echo "3) 全平台构建"
echo "4) 仅开发测试 (快速启动)"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo "🔨 构建 Windows 版本..."
        echo "⚠️  注意：在Linux上构建Windows版本需要Wine环境"
        echo "   如果遇到问题，请参考 BUILD_WINDOWS.md 文档"
        echo ""
        npm run build:win
        ;;
    2)
        echo "🔨 构建 Linux 版本..."
        npm run build:linux
        ;;
    3)
        echo "🔨 构建全平台版本..."
        echo "⚠️  注意：Windows构建可能需要Wine环境"
        echo ""
        npm run build:all
        ;;
    4)
        echo "🔨 启动开发版本..."
        NODE_ENV=development npm start
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

if [ $choice -ne 4 ] && [ $? -eq 0 ]; then
    echo ""
    echo "🎉 构建完成！"
    echo "📁 输出目录: ./dist/"
    echo ""
    echo "生成的文件:"
    ls -la dist/ 2>/dev/null || echo "未找到dist目录"
fi
