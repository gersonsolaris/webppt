// 数据管理模块
class DataManager {
    constructor() {
        this.officeFiles = null;
        this.currentModule = null;
        this.initialized = false;
        this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    }

    // 检测运行环境
    isElectronApp() {
        return this.isElectron;
    }

    // 标准化路径 - 兼容Windows和Linux
    normalizePath(path) {
        if (!path) return '';
        
        // 将反斜杠转换为正斜杠（Web标准）
        let normalizedPath = path.replace(/\\/g, '/');
        
        // 移除开头的斜杠（如果有）
        normalizedPath = normalizedPath.replace(/^\/+/, '');
        
        // 确保使用URL编码处理中文字符
        return normalizedPath.split('/').map(segment => 
            encodeURIComponent(segment)
        ).join('/');
    }

    // 构建安全的文件URL
    async buildFileUrl(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        
        if (this.isElectronApp()) {
            // Electron环境：使用IPC获取file://协议路径
            return await window.electronAPI.getResourcePath(`assets/${normalizedPath}`);
        } else {
            // Web环境：使用相对路径
            return `assets/${normalizedPath}`;
        }
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            let response;
            if (this.isElectronApp()) {
                // Electron环境：使用IPC获取file://协议路径
                const fileUrl = await window.electronAPI.getResourcePath('assets/office_files.json');
                response = await fetch(fileUrl);
            } else {
                // Web环境：使用相对路径
                response = await fetch('assets/office_files.json');
            }
            
            this.officeFiles = await response.json();
            this.initialized = true;
            console.log('数据初始化完成', this.officeFiles);
        } catch (error) {
            console.error('数据初始化失败:', error);
            this.officeFiles = { files: [] };
        }
    }

    // 按模块分类获取文件
    getFilesByModule(moduleNumber) {
        if (!this.officeFiles) return [];
        
        const moduleMap = {
            1: '1.人人讲合规',
            2: '2.合规速递', 
            3: '3.合规讲堂',
            5: '5.合规题库',
            6: '6.规行致远'
        };
        
        const modulePath = moduleMap[moduleNumber];
        if (!modulePath) return [];
        
        return this.officeFiles.files.filter(file => {
            const normalizedPath = this.normalizePath(file.path);
            const normalizedModulePath = this.normalizePath(modulePath);
            return normalizedPath.startsWith(normalizedModulePath);
        });
    }

    // 获取人人讲合规文章
    getPeopleComplianceArticles() {
        return this.getFilesByModule(1).filter(file => file.extension === '.txt');
    }

    // 获取合规讲堂PPT
    getComplianceLectures() {
        return this.getFilesByModule(3).filter(file => file.extension === '.pdf');
    }

    // 获取合规速递文档
    getComplianceExpress() {
        return this.getFilesByModule(2);
    }

    // 获取合规题库
    getComplianceQuiz() {
        return this.getFilesByModule(5);
    }

    // 获取规行致远新闻
    getNewsArchive() {
        return this.getFilesByModule(6);
    }

    // 读取文本文件内容
    async readTextFile(filePath) {
        try {
            const fileUrl = await this.buildFileUrl(filePath);
            console.log('正在读取文件:', fileUrl);
            
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            console.log('文件读取成功:', filePath);
            return content;
        } catch (error) {
            console.error('读取文件失败:', filePath, error);
            return `文件内容加载失败\n错误信息: ${error.message}`;
        }
    }

    // 获取PDF文件URL
    async getPdfUrl(filePath) {
        return await this.buildFileUrl(filePath);
    }

    // 检查文件是否存在
    async checkFileExists(filePath) {
        try {
            const fileUrl = await this.buildFileUrl(filePath);
            const response = await fetch(fileUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('文件检查失败:', filePath, error.message);
            return false;
        }
    }

    // 获取文件的完整信息
    getFileInfo(filePath) {
        if (!this.officeFiles) return null;
        
        return this.officeFiles.files.find(file => {
            const normalizedStoredPath = this.normalizePath(file.path);
            const normalizedInputPath = this.normalizePath(filePath);
            return normalizedStoredPath === normalizedInputPath;
        });
    }

    // 调试工具：打印所有文件路径的处理结果
    async debugPaths() {
        if (!this.officeFiles) {
            console.log('数据尚未初始化');
            return;
        }
        
        console.group('文件路径调试信息');
        for (let i = 0; i < Math.min(5, this.officeFiles.files.length); i++) {
            const file = this.officeFiles.files[i];
            const normalized = this.normalizePath(file.path);
            const url = await this.buildFileUrl(file.path);
            console.log(`文件 ${i + 1}:`, {
                原始路径: file.path,
                标准化路径: normalized,
                文件URL: url,
                文件名: file.filename,
                扩展名: file.extension
            });
        }
        console.groupEnd();
    }

    // 获取模块统计信息
    getModuleStats() {
        const stats = {};
        [1, 2, 3, 5, 6].forEach(moduleNum => {
            const files = this.getFilesByModule(moduleNum);
            const moduleMap = {
                1: '人人讲合规',
                2: '合规速递', 
                3: '合规讲堂',
                5: '合规题库',
                6: '规行致远'
            };
            stats[moduleMap[moduleNum]] = {
                总文件数: files.length,
                PDF文件: files.filter(f => f.extension === '.pdf').length,
                TXT文件: files.filter(f => f.extension === '.txt').length,
                其他文件: files.filter(f => !['.pdf', '.txt'].includes(f.extension)).length
            };
        });
        return stats;
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();
