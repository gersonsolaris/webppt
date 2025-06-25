# 湘潭城发集团合规宣传网站 - 部署指南

## 项目概述

本项目是一个基于Web技术开发的合规宣传展示网站，采用PowerPoint风格设计，具有以下特色：

### ✨ 主要特性
- **PowerPoint风格界面** - 模仿PowerPoint的视觉风格和交互效果
- **动态轮播展示** - 自动轮播合规讲堂和人人讲合规内容
- **六大功能模块** - 覆盖合规宣传的各个方面
- **响应式设计** - 适配PC、平板、手机等不同设备
- **文档在线查看** - 支持PDF和文本文件的在线预览
- **PowerPoint切换效果** - 页面跳转时模仿幻灯片切换动画

### 📋 功能模块

1. **人人讲合规** 📝
   - 展示董事长、合规官等的署名文章
   - 支持文章轮播预览和完整阅读

2. **合规速递** 📋
   - 展示合规政策法规文件
   - 包含65个制度文件的完整展示
   - 支持PDF在线查看

3. **合规讲堂** 🎓
   - 展示合规培训PPT内容
   - 支持讲座资料的在线预览
   - 轮播展示讲堂精选内容

4. **城发动态** 🏢
   - 直接跳转到集团官网
   - 了解集团最新动态

5. **合规题库** ❓
   - 展示合规考试题目
   - 格式化显示题目和答案
   - 支持题库内容浏览

6. **规行致远** 📰
   - 展示新闻稿链接
   - 宣传合规品牌建设成果

## 🚀 快速部署

### 本地开发环境

1. **克隆项目**
   ```bash
   # 如果是从版本控制系统获取
   git clone [项目地址]
   cd webppt
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python内置服务器（推荐）
   python server.py
   
   # 或者使用Python的http.server模块
   python -m http.server 8000
   
   # 或者使用Node.js的http-server
   npx http-server -p 8000
   ```

3. **访问网站**
   - 打开浏览器访问：http://localhost:8000
   - 服务器会自动打开浏览器

### 生产环境部署

#### 方案一：Apache/Nginx静态文件服务

1. **上传文件**
   ```bash
   # 将所有文件上传到Web服务器根目录
   scp -r webppt/* user@server:/var/www/html/
   ```

2. **配置Web服务器**
   ```nginx
   # Nginx配置示例
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 为PDF文件设置正确的MIME类型
       location ~* \.pdf$ {
           add_header Content-Type application/pdf;
       }
   }
   ```

#### 方案二：Node.js服务器

1. **创建package.json**
   ```json
   {
     "name": "compliance-website",
     "version": "1.0.0",
     "scripts": {
       "start": "http-server -p 8000"
     },
     "dependencies": {
       "http-server": "^14.0.0"
     }
   }
   ```

2. **部署命令**
   ```bash
   npm install
   npm start
   ```

#### 方案三：Docker容器部署

1. **创建Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   ```

2. **构建和运行**
   ```bash
   docker build -t compliance-website .
   docker run -p 8000:80 compliance-website
   ```

## 📁 项目结构详解

```
webppt/
├── index.html              # 主页面入口
├── css/
│   └── style.css           # 主样式文件（包含PowerPoint风格样式）
├── js/
│   ├── main.js            # 主程序入口和全局功能
│   ├── data.js            # 数据管理（文件索引和内容读取）
│   ├── carousel.js        # 轮播功能（PPT和文章轮播）
│   └── navigation.js      # 导航管理（页面跳转和文档查看）
├── assets/
│   ├── office_files.json  # 文件索引（自动生成）
│   ├── logo/              # Logo文件
│   │   ├── 城发集团LOGO背景透明.png
│   │   └── 合规LOGO.png
│   ├── 1.人人讲合规/       # 署名文章
│   ├── 2.合规速递/         # 政策法规
│   ├── 3.合规讲堂/         # 培训PPT
│   ├── 5.合规题库/         # 考试题目
│   └── 6.规行致远/         # 新闻稿
├── docs/                   # 项目文档
├── scripts/                # 工具脚本
│   ├── scan_assets_to_json_index.py    # 文件索引生成
│   └── scan_wps_to_txt_converter.py    # WPS转换工具
└── server.py               # 本地开发服务器
```

## 🔧 配置说明

### 文件索引管理

项目使用`assets/office_files.json`作为文件索引，包含所有文档的路径和元信息：

```json
{
  "base_directory": "/path/to/assets",
  "total_files": 77,
  "files": [
    {
      "path": "1.人人讲合规/董事长谈合规.txt",
      "filename": "董事长谈合规.txt", 
      "extension": ".txt",
      "size": 4426
    }
  ]
}
```

### 添加新内容

1. **添加新文档**
   - 将文档放入对应的assets子目录
   - 运行扫描脚本更新索引：`python scripts/scan_assets_to_json_index.py`

2. **修改样式**
   - 编辑`css/style.css`文件
   - 可自定义颜色、动画、布局等

3. **扩展功能**
   - 在`js/`目录下的相应模块中添加新功能
   - 遵循现有的模块化结构

## 🎨 设计特色

### PowerPoint风格
- **16:9宽屏比例** - 符合现代演示文稿标准
- **渐变背景** - 专业的视觉效果
- **卡片式布局** - 清晰的信息层次
- **动态悬停效果** - 增强交互体验
- **幻灯片切换动画** - 模仿PowerPoint的页面切换

### 响应式适配
- **桌面端** - 3列网格布局，完整功能展示
- **平板端** - 2列网格布局，适应中等屏幕
- **手机端** - 单列布局，优化触摸操作

### 交互特性
- **自动轮播** - 8秒间隔自动切换内容
- **键盘快捷键** - 方向键控制轮播，ESC返回
- **触摸支持** - 支持手势滑动操作
- **动画反馈** - 点击和悬停的即时视觉反馈

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|--------|----------|------|
| Chrome | 60+ | 完全支持所有功能 |
| Firefox | 55+ | 完全支持所有功能 |
| Safari | 12+ | 支持，部分CSS特性需要前缀 |
| Edge | 79+ | 基于Chromium，完全支持 |
| IE | 不支持 | 不兼容ES6+语法 |

## 📱 移动端优化

- **触摸友好** - 按钮和链接区域适合触摸操作
- **滑动手势** - 支持左右滑动切换轮播
- **加载优化** - 图片和PDF按需加载
- **网络适配** - 在移动网络下优化加载速度

## 🛠️ 维护和更新

### 日常维护
1. **定期更新内容** - 添加新的合规文档和资料
2. **检查链接** - 确保外部链接（如官网）正常访问
3. **性能监控** - 监控页面加载速度和用户体验

### 版本更新
1. **备份数据** - 更新前备份assets目录
2. **测试功能** - 在测试环境验证新功能
3. **渐进发布** - 逐步发布新版本

### 问题排查
1. **查看浏览器控制台** - 检查JavaScript错误
2. **检查网络请求** - 确认文件路径正确
3. **验证文件格式** - 确保PDF和文本文件格式正确

## 📞 技术支持

如遇到问题，请检查：
1. 文件路径是否正确
2. 浏览器是否支持ES6+
3. 服务器是否正确配置MIME类型
4. 网络连接是否正常

---

**版本**: 1.0.0  
**更新日期**: 2025年6月25日  
**开发团队**: 湘潭城发集团技术团队
