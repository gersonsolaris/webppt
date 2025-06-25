#!/usr/bin/env python3
"""
简单的HTTP服务器，用于本地运行合规宣传网站
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

def main():
    # 切换到项目根目录
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    # 设置端口
    PORT = 8000
    
    # 检查端口是否可用
    while True:
        try:
            with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
                print(f"湘潭城发集团合规宣传网站启动成功!")
                print(f"服务器运行在: http://localhost:{PORT}")
                print(f"按 Ctrl+C 停止服务器")
                
                # 自动打开浏览器
                try:
                    webbrowser.open(f'http://localhost:{PORT}')
                except:
                    print("无法自动打开浏览器，请手动访问上述地址")
                
                # 启动服务器
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 48:  # Address already in use
                PORT += 1
                if PORT > 8010:
                    print("无法找到可用端口，请检查网络设置")
                    sys.exit(1)
                continue
            else:
                print(f"启动服务器失败: {e}")
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n服务器已停止")
            break

if __name__ == "__main__":
    main()
