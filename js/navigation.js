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
                    this.showModuleList(6, '规行致远', 'news');
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
                <div class="logo-container">
                    <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                    <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
                </div>
                <h1 class="main-title">${title}</h1>
                <button class="back-btn" onclick="goBack()">返回首页</button>
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
            
            return `
                <div class="file-item" onclick="openFile('${file.path}', '${type}')">
                    <div class="file-icon">${icon}</div>
                    <div class="file-info">
                        <h4 class="file-name">${file.filename}</h4>
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
            const pdfUrl = window.dataManager.getPdfUrl(filePath);
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
    
    const formattedContent = formatContent(content, type);
    
    container.innerHTML = `
        <header class="header">
            <div class="logo-container">
                <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
            </div>
            <h1 class="main-title">${title}</h1>
            <button class="back-btn" onclick="goBack()">返回</button>
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
    
    container.innerHTML = `
        <header class="header">
            <div class="logo-container">
                <img src="assets/logo/城发集团LOGO背景透明.png" alt="城发集团" class="logo logo-left">
                <img src="assets/logo/合规LOGO.png" alt="规行致远" class="logo logo-right">
            </div>
            <h1 class="main-title">${title}</h1>
            <button class="back-btn" onclick="goBack()">返回</button>
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
