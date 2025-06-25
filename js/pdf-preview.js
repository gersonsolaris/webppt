// PDF页面预览生成器
class PDFPagePreview {
    constructor() {
        this.cache = new Map();
        this.isLoading = new Set();
    }

    // 生成PDF页面预览
    async generatePreview(pdfPath, pageNumber, container) {
        const cacheKey = `${pdfPath}-${pageNumber}`;
        
        // 如果正在加载，等待完成
        if (this.isLoading.has(cacheKey)) {
            return this.waitForLoad(cacheKey, container);
        }
        
        // 如果已有缓存，直接使用
        if (this.cache.has(cacheKey)) {
            container.innerHTML = this.cache.get(cacheKey);
            return;
        }
        
        this.isLoading.add(cacheKey);
        
        try {
            // 显示加载状态
            container.innerHTML = `
                <div class="pdf-preview-loading">
                    <div class="loading-spinner-small"></div>
                    <p>加载第${pageNumber}页...</p>
                </div>
            `;
            
            // 使用PDF.js加载和渲染
            const preview = await this.renderPDFPage(pdfPath, pageNumber);
            this.cache.set(cacheKey, preview);
            container.innerHTML = preview;
            
        } catch (error) {
            console.error('生成PDF预览失败:', error);
            const fallback = this.generateFallbackPreview(pdfPath, pageNumber);
            container.innerHTML = fallback;
        } finally {
            this.isLoading.delete(cacheKey);
        }
    }

    // 渲染PDF页面
    async renderPDFPage(pdfPath, pageNumber) {
        // 检查是否有PDF.js库
        if (typeof pdfjsLib === 'undefined') {
            return this.generateStaticPreview(pdfPath, pageNumber);
        }

        try {
            // 使用DataManager的路径处理方法
            const pdfUrl = window.dataManager ? 
                window.dataManager.buildFileUrl(pdfPath) : 
                `assets/${pdfPath}`;
                
            console.log('加载PDF:', pdfUrl);
            const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
            const page = await pdf.getPage(pageNumber);
            
            // 计算合适的缩放比例，目标分辨率640x480px
            const targetWidth = 640;
            const targetHeight = 480;
            
            const viewport = page.getViewport({ scale: 1.0 });
            const scaleX = targetWidth / viewport.width;
            const scaleY = targetHeight / viewport.height;
            const scale = Math.max(scaleX, scaleY); // 保持宽高比，填满目标尺寸
            
            const scaledViewport = page.getViewport({ scale });
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // 渲染页面到canvas
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            // 将canvas转换为图片
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            return `
                <div class="pdf-page-preview">
                    <img src="${imageData}" alt="第${pageNumber}页" class="pdf-preview-image">
                    <div class="pdf-preview-overlay">
                        <span class="page-badge">第${pageNumber}页</span>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('PDF渲染失败:', error);
            return this.generateStaticPreview(pdfPath, pageNumber);
        }
    }

    // 生成静态预览（当PDF.js不可用时）
    generateStaticPreview(pdfPath, pageNumber) {
        const fileName = pdfPath.split('/').pop().replace('.pdf', '');
        const icons = ['📊', '📈', '📋', '📝', '💼', '🎯'];
        const randomIcon = icons[pageNumber % icons.length];
        
        return `
            <div class="pdf-static-preview">
                <div class="static-icon">${randomIcon}</div>
                <div class="static-info">
                    <h5>${fileName}</h5>
                    <p>第${pageNumber}页</p>
                </div>
            </div>
        `;
    }

    // 生成回退预览
    generateFallbackPreview(pdfPath, pageNumber) {
        return `
            <div class="pdf-fallback-preview">
                <div class="fallback-icon">📄</div>
                <p>PDF预览</p>
                <span class="page-number">第${pageNumber}页</span>
            </div>
        `;
    }

    // 等待加载完成
    async waitForLoad(cacheKey, container) {
        const maxWait = 5000; // 最大等待5秒
        const startTime = Date.now();
        
        while (this.isLoading.has(cacheKey) && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (this.cache.has(cacheKey)) {
            container.innerHTML = this.cache.get(cacheKey);
        }
    }

    // 清理缓存
    clearCache() {
        this.cache.clear();
        this.isLoading.clear();
    }
}

// 创建全局PDF预览生成器实例
window.pdfPreview = new PDFPagePreview();
