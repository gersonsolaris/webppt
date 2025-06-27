// PDF页面预览生成器
class PDFPagePreview {
    constructor() {
        this.cache = new Map();
        this.isLoading = new Set();
    }

    // 生成PDF页面预览
    async generatePreview(pdfPath, pageNumber, container) {
        const cacheKey = `${pdfPath}-${pageNumber}`;
        console.log('生成PDF预览:', pdfPath, '第', pageNumber, '页');
        
        // 如果正在加载，等待完成
        if (this.isLoading.has(cacheKey)) {
            console.log('正在加载中，等待完成...');
            return this.waitForLoad(cacheKey, container);
        }
        
        // 如果已有缓存，直接使用
        if (this.cache.has(cacheKey)) {
            console.log('使用缓存的预览');
            container.innerHTML = this.cache.get(cacheKey);
            return;
        }
        
        this.isLoading.add(cacheKey);
        
        try {
            // 显示加载状态
            container.innerHTML = `
                <div class="pdf-preview-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; background: #f8f9fa; border-radius: 8px;">
                    <div class="loading-spinner-small" style="width: 24px; height: 24px; border: 3px solid #e3e3e3; border-top: 3px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px;"></div>
                    <p style="margin: 0; color: #666; font-size: 14px;">加载第${pageNumber}页预览...</p>
                </div>
                <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                </style>
            `;
            
            // 检查PDF.js是否可用
            if (typeof pdfjsLib === 'undefined') {
                console.warn('PDF.js未加载，尝试重新加载...');
                
                // 尝试重新加载PDF.js
                await this.loadPDFJS();
                
                if (typeof pdfjsLib === 'undefined') {
                    console.error('PDF.js加载失败，使用静态预览');
                    const preview = this.generateStaticPreview(pdfPath, pageNumber);
                    this.cache.set(cacheKey, preview);
                    container.innerHTML = preview;
                    return;
                }
            }
            
            // 使用PDF.js加载和渲染
            const preview = await this.renderPDFPage(pdfPath, pageNumber);
            this.cache.set(cacheKey, preview);
            container.innerHTML = preview;
            console.log('PDF预览生成成功');
            
        } catch (error) {
            console.error('生成PDF预览失败:', error);
            const fallback = this.generateFallbackPreview(pdfPath, pageNumber);
            container.innerHTML = fallback;
        } finally {
            this.isLoading.delete(cacheKey);
        }
    }

    // 动态加载PDF.js
    async loadPDFJS() {
        return new Promise((resolve, reject) => {
            if (typeof pdfjsLib !== 'undefined') {
                resolve();
                return;
            }

            console.log('尝试动态加载PDF.js...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                console.log('PDF.js动态加载成功');
                resolve();
            };
            script.onerror = () => {
                console.error('PDF.js动态加载失败');
                reject(new Error('PDF.js加载失败'));
            };
            document.head.appendChild(script);
        });
    }

    // 渲染PDF页面
    async renderPDFPage(pdfPath, pageNumber) {
        console.log('开始渲染PDF页面:', pdfPath, '第', pageNumber, '页');
        
        try {
            // 构建PDF URL
            let pdfUrl;
            if (window.dataManager && window.dataManager.isElectronApp && window.dataManager.isElectronApp()) {
                pdfUrl = await window.dataManager.buildFileUrl(pdfPath);
                console.log('Electron环境，PDF URL:', pdfUrl);
            } else {
                // Web环境
                const webPath = pdfPath.replace(/\\/g, '/').replace(/^\/+/, '');
                const encodedPath = webPath.split('/').map(segment => 
                    encodeURIComponent(segment)
                ).join('/');
                pdfUrl = `assets/${encodedPath}`;
                console.log('Web环境，PDF URL:', pdfUrl);
            }
            
            console.log('尝试加载PDF:', pdfUrl);
            
            // 设置PDF.js worker路径
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            
            // 使用PDF.js加载文档
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            
            const pdf = await loadingTask.promise;
            console.log(`PDF文档加载成功，总页数: ${pdf.numPages}`);
            
            // 检查页码是否有效
            if (pageNumber > pdf.numPages || pageNumber < 1) {
                console.warn(`页码${pageNumber}超出范围，使用第1页`);
                pageNumber = 1;
            }
            
            const page = await pdf.getPage(pageNumber);
            console.log('页面获取成功，开始渲染...');
            
            // 计算缩放比例，目标尺寸适合轮播显示
            const targetWidth = 320;
            const targetHeight = 240;
            
            const viewport = page.getViewport({ scale: 1.0 });
            const scaleX = targetWidth / viewport.width;
            const scaleY = targetHeight / viewport.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledViewport = page.getViewport({ scale });
            console.log(`视口尺寸: ${scaledViewport.width}x${scaledViewport.height}`);
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // 渲染页面到canvas
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            console.log('PDF页面渲染完成');
            
            // 转换为图片
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            console.log('canvas转换为图片成功');
            
            return `
                <div class="pdf-page-preview" style="text-align: center; position: relative;">
                    <img src="${imageData}" alt="第${pageNumber}页" class="pdf-preview-image" 
                         style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <div class="pdf-preview-overlay" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        <span class="page-badge">第${pageNumber}页</span>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('PDF渲染错误:', error);
            console.error('错误详情:', error.message);
            
            // 如果是网络错误，尝试直接访问文件
            if (error.message.includes('网络') || error.message.includes('fetch')) {
                console.log('尝试fallback到静态预览...');
            }
            
            throw error; // 重新抛出错误，让上层处理
        }
    }

    // 生成静态预览（当PDF.js不可用或渲染失败时）
    generateStaticPreview(pdfPath, pageNumber) {
        const fileName = pdfPath.split('/').pop().replace('.pdf', '');
        const icons = ['📊', '📈', '📋', '📝', '💼', '🎯'];
        const randomIcon = icons[pageNumber % icons.length];
        
        return `
            <div class="pdf-static-preview" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; text-align: center; padding: 20px; box-sizing: border-box; border: 2px dashed #007bff;">
                <div class="static-icon" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.8;">${randomIcon}</div>
                <div class="static-info">
                    <h5 style="margin: 0 0 8px 0; color: #333; font-weight: 600; font-size: 16px;">${fileName}</h5>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">第${pageNumber}页</p>
                    <small style="color: #007bff; font-size: 12px;">PDF预览生成中...</small>
                </div>
            </div>
        `;
    }

    // 生成回退预览
    generateFallbackPreview(pdfPath, pageNumber) {
        const fileName = pdfPath.split('/').pop().replace('.pdf', '');
        return `
            <div class="pdf-fallback-preview" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; text-align: center; padding: 20px; box-sizing: border-box;">
                <div class="fallback-icon" style="font-size: 3rem; margin-bottom: 15px; color: #856404;">📄</div>
                <p style="margin: 0 0 8px 0; color: #856404; font-weight: 600; font-size: 16px;">${fileName}</p>
                <span class="page-number" style="color: #856404; font-size: 14px;">第${pageNumber}页</span>
                <small style="color: #dc3545; display: block; margin-top: 8px; font-size: 12px;">预览生成失败，请点击查看完整文档</small>
            </div>
        `;
    }

    // 等待加载完成
    async waitForLoad(cacheKey, container) {
        const maxWait = 10000; // 最大等待10秒
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
