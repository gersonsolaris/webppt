#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
图标生成脚本
从合规LOGO生成Electron应用所需的各种尺寸图标
"""

import os
from PIL import Image
import sys

def create_icons():
    """从合规LOGO创建应用图标"""
    
    # 源图标路径
    source_logo = "assets/logo/合规LOGO.png"
    icons_dir = "electron/icons"
    
    if not os.path.exists(source_logo):
        print(f"错误: 找不到源图标文件 {source_logo}")
        return False
    
    # 确保图标目录存在
    os.makedirs(icons_dir, exist_ok=True)
    
    try:
        # 打开源图像
        img = Image.open(source_logo)
        
        # 转换为RGBA模式（支持透明度）
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # 创建白色背景版本（用于ICO）
        background = Image.new('RGBA', img.size, (255, 255, 255, 255))
        img_with_bg = Image.alpha_composite(background, img)
        img_with_bg = img_with_bg.convert('RGB')
        
        # 生成不同尺寸的PNG图标（Linux）
        png_sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
        
        for size in png_sizes:
            resized = img.resize((size, size), Image.LANCZOS)
            png_path = os.path.join(icons_dir, f"icon_{size}x{size}.png")
            resized.save(png_path, 'PNG')
            print(f"生成: {png_path}")
        
        # 生成主图标
        main_icon = img.resize((256, 256), Image.LANCZOS)
        main_icon.save(os.path.join(icons_dir, "icon.png"), 'PNG')
        print(f"生成: {os.path.join(icons_dir, 'icon.png')}")
        
        # 生成ICO文件（Windows）
        # ICO文件需要多个尺寸
        ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        ico_images = []
        
        for size in ico_sizes:
            resized = img_with_bg.resize(size, Image.LANCZOS)
            ico_images.append(resized)
        
        # 保存ICO文件
        ico_path = os.path.join(icons_dir, "icon.ico")
        ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes)
        print(f"生成: {ico_path}")
        
        print("\\n✅ 图标生成完成！")
        return True
        
    except Exception as e:
        print(f"错误: 图标生成失败 - {str(e)}")
        return False

if __name__ == "__main__":
    if create_icons():
        sys.exit(0)
    else:
        sys.exit(1)
