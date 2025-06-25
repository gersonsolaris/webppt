// 主程序入口
class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // 显示加载动画
            this.showLoadingAnimation();
            
            // 初始化各个管理器
            await window.dataManager.initialize();
            await window.carouselManager.initialize();
            
            // 添加页面交互效果
            this.setupPageInteractions();
            
            // 隐藏加载动画
            this.hideLoadingAnimation();
            
            this.initialized = true;
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorMessage('系统初始化失败，请刷新页面重试');
        }
    }

    showLoadingAnimation() {
        // 可以在这里添加初始加载动画
        console.log('正在加载...');
    }

    hideLoadingAnimation() {
        // 隐藏加载动画
        console.log('加载完成');
    }

    setupPageInteractions() {
        // 添加键盘快捷键支持
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 添加鼠标悬停效果
        this.setupHoverEffects();
        
        // 添加触摸设备支持
        this.setupTouchSupport();
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleKeyPress(event) {
        // ESC键返回首页
        if (event.key === 'Escape' && window.navigationManager.currentPage !== 'home') {
            goBack();
        }
        
        // 方向键控制轮播
        if (window.navigationManager.currentPage === 'home') {
            if (event.key === 'ArrowLeft') {
                prevSlide('ppt');
            } else if (event.key === 'ArrowRight') {
                nextSlide('ppt');
            } else if (event.key === 'ArrowUp') {
                prevSlide('article');
            } else if (event.key === 'ArrowDown') {
                nextSlide('article');
            }
        }
    }

    setupHoverEffects() {
        // 为模块卡片添加动态效果
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupTouchSupport() {
        // 为移动设备添加触摸滑动支持
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!window.carouselManager) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 判断滑动方向
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        nextSlide('ppt');
                    } else {
                        prevSlide('ppt');
                    }
                }
            } else {
                if (Math.abs(diffY) > 50) {
                    if (diffY > 0) {
                        nextSlide('article');
                    } else {
                        prevSlide('article');
                    }
                }
            }
        });
    }

    handleResize() {
        // 响应式调整
        const container = document.querySelector('.presentation-container');
        if (container) {
            // 重新计算布局
            this.adjustLayout();
        }
    }

    adjustLayout() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // 根据屏幕大小调整字体大小
        const root = document.documentElement;
        if (width < 768) {
            root.style.fontSize = '14px';
        } else if (width < 1024) {
            root.style.fontSize = '15px';
        } else {
            root.style.fontSize = '16px';
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>系统提示</h3>
                <p>${message}</p>
                <button onclick="location.reload()">重新加载</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// 添加错误消息样式
const errorStyles = `
.error-message {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.error-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    max-width: 400px;
}

.error-content h3 {
    color: #e74c3c;
    margin-bottom: 15px;
}

.error-content button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
}

.error-content button:hover {
    background: #2980b9;
}
`;

// 动态添加错误样式
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// 工具函数
const utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 获取随机颜色
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // 格式化日期
    formatDate(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
};

// 创建应用实例并初始化
window.app = new App();

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停轮播
        if (window.carouselManager && window.carouselManager.autoPlayInterval) {
            clearInterval(window.carouselManager.autoPlayInterval);
        }
    } else {
        // 页面显示时恢复轮播
        if (window.carouselManager && window.navigationManager.currentPage === 'home') {
            window.carouselManager.startAutoPlay();
        }
    }
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason);
});
