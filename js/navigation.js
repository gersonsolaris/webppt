// 导航管理器
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.previousPage = null;
    }

    showTransition() {
        const overlay = document.getElementById('transitionOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideTransition() {
        const overlay = document.getElementById('transitionOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // 导航到模块页面
    navigateToModule(moduleType) {
        this.showTransition();
        
        setTimeout(() => {
            switch (moduleType) {
                case 'people-compliance':
                    this.showModuleList(1, '人人讲合规', 'article');
                    break;
                case 'compliance-express':
                    this.showModuleList(2, '合规速递', 'document');
                    break;
                case 'compliance-lecture':
                    this.showModuleList(3, '合规讲堂', 'pdf');
                    break;
                case 'compliance-quiz':
                    this.showModuleList(5, '合规题库', 'quiz');
                    break;
                case 'news-archive':
                    this.showNewsLinks();
                    break;
            }
        }, 500);
    }

    // 跳转到官网
    navigateToOfficial() {
        this.showTransition();
        setTimeout(() => {
            window.open('http://www.xtcfjt.com/', '_blank');
            this.hideTransition();
        }, 500);
    }

    // 显示模块文件列表
    async showModuleList(moduleNumber, title, type) {
        const files = window.dataManager.getFilesByModule(moduleNumber);
        
        const container = document.querySelector('.presentation-container');
        container.innerHTML = `
            <header class="header">
                <div class="page-header">
                    <div class="logo-container">
                        <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                        <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
                    </div>
                    <h1 class="main-title">${title}</h1>
                    <button class="back-btn" onclick="goBack()">返回首页</button>
                </div>
            </header>
            <main class="content-area">
                <div class="file-list">
                    ${this.generateFileList(files, type)}
                </div>
            </main>
        `;
        
        this.previousPage = this.currentPage;
        this.currentPage = 'module-' + moduleNumber;
        this.hideTransition();
    }

    generateFileList(files, type) {
        if (files.length === 0) {
            return '<p class="no-files">暂无相关文件</p>';
        }

        return files.map(file => {
            const icon = this.getFileIcon(file.extension);
            const size = this.formatFileSize(file.size);
            const cleanName = this.cleanFileName(file.filename);
            
            return `
                <div class="file-item" onclick="openFile('${file.path}', '${type}')">
                    <div class="file-icon">${icon}</div>
                    <div class="file-info">
                        <h4 class="file-name">${cleanName}</h4>
                        <p class="file-details">${size} • ${file.extension.toUpperCase()}</p>
                    </div>
                    <div class="file-action">
                        <span>查看 →</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFileIcon(extension) {
        const iconMap = {
            '.pdf': '📄',
            '.txt': '📝',
            '.doc': '📄',
            '.docx': '📄',
            '.wps': '📄'
        };
        return iconMap[extension] || '📄';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 返回首页
    goBack() {
        this.showTransition();
        
        setTimeout(() => {
            location.reload(); // 简单的返回方式，重新加载首页
        }, 500);
    }

    // 显示新闻链接页面
    async showNewsLinks() {
        try {
            // 读取两个txt文件的内容 (不包含assets前缀，buildFileUrl会自动添加)
            const newsFile1 = '6.规行致远/0  新闻稿链接.txt';
            const newsFile2 = '6.规行致远/子集团新闻稿  链接.txt';
            
            const content1 = await window.dataManager.readTextFile(newsFile1);
            const content2 = await window.dataManager.readTextFile(newsFile2);
            
            const groups1 = this.parseNewsLinks(content1, '新闻稿链接');
            const groups2 = this.parseNewsLinks(content2, '子集团新闻稿链接');
            
            const container = document.querySelector('.presentation-container');
            container.innerHTML = `
                <header class="header">
                    <div class="page-header">
                        <div class="logo-container">
                            <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                            <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
                        </div>
                        <h1 class="main-title">规行致远</h1>
                        <button class="back-btn" onclick="goBack()">返回首页</button>
                    </div>
                </header>
                <main class="content-area">
                    <div class="news-links-container">
                        <div class="news-column">
                            <h3 class="column-title">新闻稿链接</h3>
                            <div class="links-list">
                                ${this.generateLinksHtml(groups1)}
                            </div>
                        </div>
                        <div class="news-column">
                            <h3 class="column-title">子集团新闻稿链接</h3>
                            <div class="links-list">
                                ${this.generateLinksHtml(groups2)}
                            </div>
                        </div>
                    </div>
                </main>
            `;
            
            this.previousPage = this.currentPage;
            this.currentPage = 'news-links';
            this.hideTransition();
        } catch (error) {
            console.error('加载新闻链接失败:', error);
            alert('加载新闻链接失败，请稍后重试');
            this.hideTransition();
        }
    }

    // 解析新闻链接 - 新的解析逻辑支持标题对应多个链接
    parseNewsLinks(content, category) {
        const lines = content.split('\n');
        const groups = [];
        let currentGroup = null;
        let currentTitle = '';
        let pendingLinks = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // 检查是否是链接行
            const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
            
            if (urlMatch) {
                const url = urlMatch[1];
                
                // 检查是否是以 "- " 开头的多链接格式
                if (line.startsWith('-')) {
                    // 这是多链接中的一个
                    pendingLinks.push(url);
                } else {
                    // 这是一个完整的标题+链接行
                    let title = line.replace(url, '').trim();
                    title = title.replace(/[：:]+$/, '').trim(); // 移除末尾的冒号
                    
                    // 识别组织
                    const organization = this.identifyOrganization(line);
                    
                    // 如果之前有pending的链接，先处理它们
                    if (pendingLinks.length > 0 && currentTitle) {
                        groups.push({
                            title: currentTitle,
                            links: pendingLinks.map(link => ({
                                url: link,
                                organization: this.identifyOrganization(link)
                            })),
                            category: category
                        });
                        pendingLinks = [];
                        currentTitle = '';
                    }
                    
                    // 处理当前链接
                    if (title) {
                        groups.push({
                            title: title,
                            links: [{
                                url: url,
                                organization: organization
                            }],
                            category: category
                        });
                    } else {
                        // 只有组织名的情况
                        groups.push({
                            title: organization || '链接',
                            links: [{
                                url: url,
                                organization: organization
                            }],
                            category: category
                        });
                    }
                }
            } else {
                // 这是一个标题行（不包含链接）
                // 如果之前有pending的链接，先处理它们
                if (pendingLinks.length > 0 && currentTitle) {
                    groups.push({
                        title: currentTitle,
                        links: pendingLinks.map(link => ({
                            url: link,
                            organization: this.identifyOrganization(link)
                        })),
                        category: category
                    });
                    pendingLinks = [];
                }
                
                // 设置新的标题
                if (line.length > 0 && !line.endsWith('：') && !line.endsWith(':')) {
                    currentTitle = line;
                } else if (line.endsWith('：') || line.endsWith(':')) {
                    // 这是一个分组标题，暂时跳过
                    currentTitle = '';
                }
            }
        }
        
        // 处理最后的pending链接
        if (pendingLinks.length > 0 && currentTitle) {
            groups.push({
                title: currentTitle,
                links: pendingLinks.map(link => ({
                    url: link,
                    organization: this.identifyOrganization(link)
                })),
                category: category
            });
        }
        
        return groups;
    }

    // 识别组织
    identifyOrganization(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('建工') || lowerText.includes('jg.')) return '建工';
        if (lowerText.includes('交运')) return '交运';
        if (lowerText.includes('城建') || lowerText.includes('cj.')) return '城建';
        if (lowerText.includes('潭房') || lowerText.includes('tf.')) return '潭房';
        if (lowerText.includes('湘投') || lowerText.includes('xt.')) return '湘投';
        if (lowerText.includes('物业') || lowerText.includes('sq.')) return '物业';
        if (lowerText.includes('湘盾') || lowerText.includes('xd.')) return '湘盾';
        if (lowerText.includes('绿矿') || lowerText.includes('ks.')) return '绿矿';
        if (lowerText.includes('红旅') || lowerText.includes('hl.')) return '红旅';
        if (lowerText.includes('大学城') || lowerText.includes('dxc.')) return '大学城';
        if (lowerText.includes('静态') || lowerText.includes('jt.')) return '静态';
        if (lowerText.includes('港务') || lowerText.includes('gw.')) return '港务';
        if (lowerText.includes('科技') || lowerText.includes('kj.')) return '科技';
        if (lowerText.includes('大河西') || lowerText.includes('hx.')) return '大河西';
        if (lowerText.includes('水务') || lowerText.includes('sw.')) return '水务';
        if (lowerText.includes('集团') && (lowerText.includes('本部') || lowerText.includes('xtcfjt.com'))) return '集团本部';
        if (lowerText.includes('集团')) return '集团';
        
        return '';
    }

    // 生成链接HTML - 新的布局：标题列 + 链接列
    generateLinksHtml(groups) {
        if (groups.length === 0) {
            return '<p class="no-links">暂无链接</p>';
        }
        
        return groups.map(group => `
            <div class="news-group">
                <div class="title-column">
                    <h4 class="news-title">${group.title}</h4>
                </div>
                <div class="links-column">
                    ${group.links.map((link, index) => `
                        <div class="link-item-new">
                            ${link.organization ? `<span class="org-tag">${link.organization}</span>` : ''}
                            <a href="${link.url}" target="_blank" class="news-link">
                                <span class="link-text">${this.formatUrl(link.url)}</span>
                                <span class="link-icon">🔗</span>
                            </a>
                            ${group.links.length > 1 ? `<span class="link-index">${index + 1}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // 格式化URL显示
    formatUrl(url) {
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            
            // 如果路径太长，截断显示
            if (path.length > 30) {
                path = path.substring(0, 27) + '...';
            }
            
            return urlObj.hostname + path;
        } catch (e) {
            return url.length > 50 ? url.substring(0, 47) + '...' : url;
        }
    }

    // 清理文件名，去除后缀
    cleanFileName(fileName) {
        return fileName
            .replace(/\.(txt|pdf|doc|docx|wps)$/i, '') // 去除常见文件后缀
            .replace(/^\d+\.?\s*/, '') // 去除开头的数字和点
            .trim();
    }
}

// 全局导航函数
function navigateToModule(moduleType) {
    window.navigationManager.navigateToModule(moduleType);
}

function navigateToOfficial() {
    window.navigationManager.navigateToOfficial();
}

function goBack() {
    window.navigationManager.goBack();
}

// 打开文件
async function openFile(filePath, type) {
    window.navigationManager.showTransition();
    
    try {
        const fileName = filePath.split('/').pop();
        
        if (type === 'article' || type === 'quiz' || type === 'news') {
            // 文本文件
            const content = await window.dataManager.readTextFile(filePath);
            setTimeout(() => {
                showDocumentViewer(fileName, content, type);
            }, 500);
        } else if (type === 'pdf' || type === 'document') {
            // PDF文件
            const pdfUrl = await window.dataManager.getPdfUrl(filePath);
            setTimeout(() => {
                showPDFViewer(fileName, pdfUrl);
            }, 500);
        }
    } catch (error) {
        console.error('打开文件失败:', error);
        alert('文件打开失败，请稍后重试');
        window.navigationManager.hideTransition();
    }
}

// 显示文档查看器
function showDocumentViewer(title, content, type) {
    const container = document.querySelector('.presentation-container');
    const cleanTitle = window.navigationManager.cleanFileName(title);
    
    const formattedContent = formatContent(content, type);
    
    container.innerHTML = `
        <header class="header">
            <div class="page-header">
                <div class="logo-container">
                    <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                    <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
                </div>
                <h1 class="main-title">${cleanTitle}</h1>
                <button class="back-btn" onclick="goBack()">返回</button>
            </div>
        </header>
        <main class="content-area">
            <div class="document-viewer">
                <div class="document-content">
                    ${formattedContent}
                </div>
            </div>
        </main>
    `;
    
    window.navigationManager.hideTransition();
}

// 显示PDF查看器
function showPDFViewer(title, pdfUrl) {
    const container = document.querySelector('.presentation-container');
    const cleanTitle = window.navigationManager.cleanFileName(title);
    
    container.innerHTML = `
        <header class="header">
            <div class="page-header">
                <div class="logo-container">
                    <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                    <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
                </div>
                <h1 class="main-title">${cleanTitle}</h1>
                <button class="back-btn" onclick="goBack()">返回</button>
            </div>
        </header>
        <main class="content-area">
            <div class="pdf-viewer">
                <iframe src="${pdfUrl}" width="100%" height="100%" frameborder="0">
                    <p>您的浏览器不支持PDF预览。<a href="${pdfUrl}" target="_blank">点击这里下载文件</a></p>
                </iframe>
            </div>
        </main>
    `;
    
    window.navigationManager.hideTransition();
}

// 格式化内容
function formatContent(content, type) {
    if (type === 'quiz') {
        // 题库特殊格式化
        return formatQuizContent(content);
    }
    
    // 一般文本格式化
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// 格式化题库内容
function formatQuizContent(content) {
    const lines = content.split('\n');
    let formattedHtml = '';
    let questionNumber = 1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue;
        
        if (line.match(/^\d+[\.、]/)) {
            // 题目
            formattedHtml += `<div class="quiz-question">
                <h4>第${questionNumber}题</h4>
                <p>${line}</p>
            </div>`;
            questionNumber++;
        } else if (line.match(/^[A-D][\.、]/)) {
            // 选项
            formattedHtml += `<div class="quiz-option">${line}</div>`;
        } else if (line.includes('答案') || line.includes('正确答案')) {
            // 答案
            formattedHtml += `<div class="quiz-answer">${line}</div>`;
        } else {
            // 其他内容
            formattedHtml += `<p>${line}</p>`;
        }
    }
    
    return formattedHtml;
}

// 创建全局导航管理器实例
window.navigationManager = new NavigationManager();
