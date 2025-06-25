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

        // 加载PPT数据（这里我们模拟PPT页面，实际项目中可能需要PDF.js来解析）
        const lectures = window.dataManager.getComplianceLectures();
        this.carouselData.ppt = lectures.map((lecture, index) => ({
            title: lecture.filename.replace('.pdf', ''),
            description: `合规讲堂第${index + 1}期`,
            pdfPath: lecture.path,
            thumbnail: `images/ppt-thumb-${index + 1}.jpg` // 这里可以放缩略图
        }));

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
            carousel.innerHTML = '<div class="slide-placeholder"><p>暂无合规文章</p></div>';
            return;
        }

        const currentArticle = this.carouselData.article[this.currentSlides.article];
        carousel.innerHTML = `
            <div class="article-slide">
                <h4>${currentArticle.title}</h4>
                <div class="article-preview">
                    ${this.formatTextContent(currentArticle.content)}
                </div>
                <button class="read-more-btn" onclick="showFullArticle('${currentArticle.path}')">
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
function viewPDF(filePath) {
    try {
        window.navigationManager.showTransition();
        const pdfUrl = window.dataManager.getPdfUrl(filePath);
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
