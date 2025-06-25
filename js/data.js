// 数据管理模块
class DataManager {
    constructor() {
        this.officeFiles = null;
        this.currentModule = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            const response = await fetch('assets/office_files.json');
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
        
        return this.officeFiles.files.filter(file => 
            file.path.startsWith(modulePath)
        );
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
            const response = await fetch(`assets/${filePath}`);
            if (!response.ok) throw new Error('文件读取失败');
            return await response.text();
        } catch (error) {
            console.error('读取文件失败:', error);
            return '文件内容加载失败';
        }
    }

    // 获取PDF文件URL
    getPdfUrl(filePath) {
        return `assets/${filePath}`;
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();
