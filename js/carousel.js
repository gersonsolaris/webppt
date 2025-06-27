// 轮播管理器
class CarouselManager {
    constructor() {
        this.currentSlides = {
            ppt: 0,
            article: 0
        };
        this.totalSlides = {
            ppt: 0,
            article: 0
        };
        this.carouselData = {
            ppt: [],
            article: []
        };
        this.autoPlayInterval = null;
    }

    async initialize() {
        await window.dataManager.initialize();
        await this.loadCarouselData();
        this.setupCarousels();
        this.startAutoPlay();
    }

    async loadCarouselData() {
        // 加载文章数据
        const articles = window.dataManager.getPeopleComplianceArticles();
        this.carouselData.article = [];
        
        for (const article of articles) {
            try {
                const content = await window.dataManager.readTextFile(article.path);
                this.carouselData.article.push({
                    title: article.filename.replace('.txt', ''),
                    content: content.substring(0, 500) + '...', // 截取前500字符作为预览
                    fullContent: content,
                    path: article.path
                });
            } catch (error) {
                console.error('加载文章失败:', error);
            }
        }

        // 加载PPT页面数据 - 将每个PDF的每页作为独立的轮播项
        const lectures = window.dataManager.getComplianceLectures();
        this.carouselData.ppt = [];
        
        for (const lecture of lectures) {
            try {
                // 为每个PDF生成页面列表（这里假设每个PDF有多页）
                const pdfPages = await this.generatePDFPages(lecture);
                this.carouselData.ppt.push(...pdfPages);
            } catch (error) {
                console.error('加载PPT页面失败:', error);
                // 如果无法解析PDF，添加一个默认项
                this.carouselData.ppt.push({
                    title: lecture.filename.replace('.pdf', ''),
                    description: '合规讲堂',
                    pdfPath: lecture.path,
                    pageNumber: 1,
                    totalPages: 1,
                    isPlaceholder: true
                });
            }
        }

        this.totalSlides.article = this.carouselData.article.length;
        this.totalSlides.ppt = this.carouselData.ppt.length;
    }

    setupCarousels() {
        this.updateArticleCarousel();
        this.updatePPTCarousel();
        this.updateIndicators();
    }

    updateArticleCarousel() {
        const carousel = document.getElementById('articleCarousel');
        if (!carousel || this.carouselData.article.length === 0) {
            if (carousel) {
                carousel.innerHTML = '<div class="slide-placeholder"><p>暂无合规文章</p></div>';
            }
            return;
        }

        const currentArticle = this.carouselData.article[this.currentSlides.article];
        carousel.innerHTML = `
            <div class="article-slide">
                <h4>${currentArticle.title}</h4>
                <div class="article-preview">
                    ${this.formatTextContent(currentArticle.content)}
                </div>
                <button class="read-more-btn" onclick="event.stopPropagation(); showFullArticle('${currentArticle.path}')">
                    阅读全文
                </button>
            </div>
        `;
    }

    updatePPTCarousel() {
        const carousel = document.getElementById('pptCarousel');
        if (!carousel || this.carouselData.ppt.length === 0) {
            carousel.innerHTML = '<div class="slide-placeholder"><p>暂无讲堂内容</p></div>';
            return;
        }

        const currentPPT = this.carouselData.ppt[this.currentSlides.ppt];
        
        if (currentPPT.isPlaceholder) {
            // 显示占位符内容
            carousel.innerHTML = `
                <div class="ppt-slide">
                    <div class="ppt-thumbnail">
                        📊
                    </div>
                    <div class="ppt-info">
                        <h4>${currentPPT.title}</h4>
                        <p>${currentPPT.description}</p>
                        <button class="view-ppt-btn" onclick="viewPDF('${currentPPT.pdfPath}')">
                            查看讲座
                        </button>
                    </div>
                </div>
            `;
        } else {
            // 显示PDF页面内容
            carousel.innerHTML = `
                <div class="ppt-slide pdf-page-slide">
                    <div class="pdf-page-container">
                        <div class="pdf-page-preview-container" id="pdfPreview-${this.currentSlides.ppt}">
                            <!-- PDF预览将在这里动态加载 -->
                        </div>
                        <div class="pdf-page-overlay">
                            <button class="view-full-pdf-btn" onclick="viewPDF('${currentPPT.pdfPath}')">
                                查看完整讲座
                            </button>
                        </div>
                    </div>
                    <div class="pdf-page-info">
                        <h4>${currentPPT.title}</h4>
                        <p>${currentPPT.description} / 共${currentPPT.totalPages}页</p>
                        <div class="page-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(currentPPT.pageNumber / currentPPT.totalPages) * 100}%"></div>
                            </div>
                            <span class="page-indicator">${currentPPT.pageNumber}/${currentPPT.totalPages}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // 异步加载PDF预览
            setTimeout(() => {
                const previewContainer = document.getElementById(`pdfPreview-${this.currentSlides.ppt}`);
                if (previewContainer && window.pdfPreview) {
                    window.pdfPreview.generatePreview(currentPPT.pdfPath, currentPPT.pageNumber, previewContainer);
                }
            }, 100);
        }
    }

    updateIndicators() {
        const articleIndicator = document.getElementById('articleIndicator');
        const pptIndicator = document.getElementById('pptIndicator');
        
        if (articleIndicator) {
            articleIndicator.textContent = `${this.currentSlides.article + 1} / ${this.totalSlides.article}`;
        }
        
        if (pptIndicator) {
            pptIndicator.textContent = `${this.currentSlides.ppt + 1} / ${this.totalSlides.ppt}`;
        }
    }

    nextSlide(type) {
        if (this.totalSlides[type] === 0) return;
        
        this.currentSlides[type] = (this.currentSlides[type] + 1) % this.totalSlides[type];
        this.updateCarousel(type);
        this.resetAutoPlay();
    }

    prevSlide(type) {
        if (this.totalSlides[type] === 0) return;
        
        this.currentSlides[type] = this.currentSlides[type] === 0 
            ? this.totalSlides[type] - 1 
            : this.currentSlides[type] - 1;
        this.updateCarousel(type);
        this.resetAutoPlay();
    }

    updateCarousel(type) {
        if (type === 'article') {
            this.updateArticleCarousel();
        } else if (type === 'ppt') {
            this.updatePPTCarousel();
        }
        this.updateIndicators();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide('ppt');
            setTimeout(() => {
                this.nextSlide('article');
            }, 2000);
        }, 8000);
    }

    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    formatTextContent(text) {
        // 简单的文本格式化
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    // 生成PDF页面列表
    async generatePDFPages(lecture) {
        const pages = [];
        const baseName = lecture.filename.replace('.pdf', '');
        
        // 这里我们模拟每个PDF有多页（实际项目中需要PDF.js来解析PDF页数）
        // 假设每个PDF有5-10页不等
        const pageCount = this.estimatePDFPages(lecture.filename);
        
        for (let i = 1; i <= pageCount; i++) {
            pages.push({
                title: baseName,
                description: `第${i}页`,
                pdfPath: lecture.path,
                pageNumber: i,
                totalPages: pageCount,
                thumbnailUrl: this.generatePageThumbnail(lecture.path, i),
                isPlaceholder: false
            });
        }
        
        return pages;
    }

    // 估算PDF页数（基于文件名或大小）
    estimatePDFPages(filename) {
        // 根据不同的讲座估算页数
        if (filename.includes('投资风险防控')) return 8;
        if (filename.includes('政府投资项目')) return 12;
        if (filename.includes('民法典')) return 15;
        if (filename.includes('合规体系建设')) return 20;
        return 10; // 默认页数
    }

    // 生成页面缩略图URL（这里使用PDF.js的方式）
    generatePageThumbnail(pdfPath, pageNumber) {
        // 实际项目中这里会生成PDF页面的缩略图
        // 现在我们返回一个占位符或使用PDF预览服务
        return `api/pdf-thumbnail?file=${encodeURIComponent(pdfPath)}&page=${pageNumber}`;
    }

    // 生成PDF页面查看URL
    async generatePDFPageUrl(pdfPath, pageNumber) {
        // 使用本地PDF查看器来显示特定页面
        const pdfUrl = await window.dataManager.getPdfUrl(pdfPath);
        const title = pdfPath.split('/').pop().replace('.pdf', '');
        return `pdf-viewer.html?file=${encodeURIComponent(pdfUrl)}&page=${pageNumber}&title=${encodeURIComponent(title)}`;
    }
}

// 全局轮播控制函数
function nextSlide(type) {
    window.carouselManager.nextSlide(type);
}

function prevSlide(type) {
    window.carouselManager.prevSlide(type);
}

// 查看完整文章
async function showFullArticle(filePath) {
    try {
        window.navigationManager.showTransition();
        const content = await window.dataManager.readTextFile(filePath);
        const fileName = filePath.split('/').pop().replace('.txt', '');
        
        setTimeout(() => {
            showDocumentViewer(fileName, content, 'article');
        }, 500);
    } catch (error) {
        console.error('加载文章失败:', error);
        alert('文章加载失败，请稍后重试');
        window.navigationManager.hideTransition();
    }
}

// 查看PDF
async function viewPDF(filePath) {
    try {
        window.navigationManager.showTransition();
        const pdfUrl = await window.dataManager.getPdfUrl(filePath);
        const fileName = filePath.split('/').pop().replace('.pdf', '');
        
        setTimeout(() => {
            showPDFViewer(fileName, pdfUrl);
        }, 500);
    } catch (error) {
        console.error('加载PDF失败:', error);
        alert('PDF加载失败，请稍后重试');
        window.navigationManager.hideTransition();
    }
}

// 创建全局轮播管理器实例
window.carouselManager = new CarouselManager();
