#!/bin/bash

# 湘潭城发集团合规宣传应用启动器

echo "🏢 湘潭城发集团合规宣传应用"
echo "================================"

# 检查是否有构建结果
if [ ! -d "dist" ]; then
    echo "❌ 未找到构建结果目录"
    echo "请先运行 ./build-electron.sh 构建应用"
    exit 1
fi

# 显示可用的版本
echo "可用的应用版本:"
echo ""

# 检查AppImage版本
if [ -f "dist/湘潭城发集团合规宣传-1.0.0.AppImage" ]; then
    echo "1) Linux AppImage版本 (便携式)"
    APPIMAGE_AVAILABLE=true
fi

# 检查Linux解压版本
if [ -f "dist/linux-unpacked/xtcf-compliance-app" ]; then
    echo "2) Linux 解压版本"
    LINUX_UNPACKED_AVAILABLE=true
fi

# 检查是否安装了DEB包
if command -v xtcf-compliance-app &> /dev/null; then
    echo "3) 系统已安装版本 (DEB包)"
    DEB_INSTALLED=true
fi

echo "4) 开发版本 (需要Electron环境)"
echo ""

read -p "请选择要启动的版本 (1-4): " choice

case $choice in
    1)
        if [ "$APPIMAGE_AVAILABLE" = true ]; then
            echo "🚀 启动AppImage版本..."
            chmod +x "dist/湘潭城发集团合规宣传-1.0.0.AppImage"
            "./dist/湘潭城发集团合规宣传-1.0.0.AppImage" &
            echo "✅ 应用已启动"
        else
            echo "❌ AppImage版本不可用，请先构建"
        fi
        ;;
    2)
        if [ "$LINUX_UNPACKED_AVAILABLE" = true ]; then
            echo "🚀 启动Linux解压版本..."
            cd dist/linux-unpacked
            ./xtcf-compliance-app &
            cd ../..
            echo "✅ 应用已启动"
        else
            echo "❌ Linux解压版本不可用，请先构建"
        fi
        ;;
    3)
        if [ "$DEB_INSTALLED" = true ]; then
            echo "🚀 启动系统安装版本..."
            xtcf-compliance-app &
            echo "✅ 应用已启动"
        else
            echo "❌ 系统版本未安装"
            echo "运行以下命令安装DEB包:"
            echo "sudo dpkg -i dist/xtcf-compliance-app_1.0.0_amd64.deb"
        fi
        ;;
    4)
        echo "🚀 启动开发版本..."
        if command -v npm &> /dev/null; then
            npm start
        else
            echo "❌ npm不可用，请安装Node.js和npm"
        fi
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
