// Page Template Module - 페이지 생성을 위한 템플릿
export class PageTemplate {
    constructor() {
        this.title = '김포 오퍼스 한강 스위첸';
        this.description = '김포 한강신도시 프리미엄 주거공간';
        this.keywords = '김포, 한강신도시, 아파트, 분양, 스위첸';
    }

    setMetaData(title, description, keywords) {
        this.title = title;
        this.description = description;
        this.keywords = keywords;
    }

    generateHTML(options = {}) {
        const {
            title = this.title,
            description = this.description,
            keywords = this.keywords,
            additionalCSS = [],
            additionalJS = [],
            bodyContent = '',
            includeLayout = true
        } = options;

        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <title>${title}</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/sections.css">
    <link rel="stylesheet" href="css/responsive.css">
    ${additionalCSS.map(css => `    <link rel="stylesheet" href="${css}">`).join('\n')}
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    ${includeLayout ? '' : bodyContent}
    
    <!-- JavaScript Modules -->
    <script type="module">
        import { LayoutComponents } from './js/modules/layoutComponents.js';
        import { Navigation } from './js/modules/navigation.js';
        import { FloatingButtons } from './js/modules/floatingButtons.js';
        import { DataLoader } from './js/modules/dataLoader.js';
        
        // 페이지 초기화
        async function initPage() {
            // 데이터 로드
            const dataLoader = new DataLoader();
            const data = await dataLoader.loadData();
            
            // 레이아웃 컴포넌트 생성
            const layout = new LayoutComponents();
            layout.setData(data);
            
            ${includeLayout ? `
            // 레이아웃 삽입
            document.body.insertAdjacentHTML('afterbegin', layout.renderHeader());
            document.body.insertAdjacentHTML('beforeend', '<main id="main-content">${bodyContent}</main>');
            document.body.insertAdjacentHTML('beforeend', layout.renderFooter());
            document.body.insertAdjacentHTML('beforeend', layout.renderFloatingButtons());
            document.body.insertAdjacentHTML('beforeend', layout.renderLoadingSpinner());
            ` : ''}
            
            // 네비게이션 초기화
            const navigation = new Navigation();
            navigation.init();
            
            // 플로팅 버튼 초기화
            const floatingButtons = new FloatingButtons();
            floatingButtons.init();
        }
        
        // DOM 로드 완료 후 실행
        document.addEventListener('DOMContentLoaded', initPage);
    </script>
    ${additionalJS.map(js => `    <script type="module" src="${js}"></script>`).join('\n')}
</body>
</html>`;
    }

    // 간단한 페이지 생성 헬퍼
    createSimplePage(title, content) {
        return this.generateHTML({
            title: `${title} - ${this.title}`,
            bodyContent: `
                <div class="container">
                    <div class="page-header">
                        <h1>${title}</h1>
                    </div>
                    <div class="page-content">
                        ${content}
                    </div>
                </div>
            `,
            includeLayout: true
        });
    }

    // 서브 페이지 템플릿
    createSubPage(options) {
        const {
            pageTitle,
            pageContent,
            breadcrumb = []
        } = options;

        const breadcrumbHTML = breadcrumb.length > 0 ? `
            <nav class="breadcrumb">
                <a href="/">홈</a>
                ${breadcrumb.map(item => `<span>/</span><a href="${item.url}">${item.text}</a>`).join('')}
            </nav>
        ` : '';

        return this.generateHTML({
            title: `${pageTitle} - ${this.title}`,
            bodyContent: `
                <div class="sub-page">
                    ${breadcrumbHTML}
                    <div class="container">
                        <div class="page-header">
                            <h1 class="page-title">${pageTitle}</h1>
                        </div>
                        <div class="page-content">
                            ${pageContent}
                        </div>
                    </div>
                </div>
            `,
            includeLayout: true
        });
    }
}