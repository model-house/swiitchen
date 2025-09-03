// Main JavaScript Entry Point
import { DataLoader } from './modules/dataLoader.js';
import { SectionRenderer } from './modules/sectionRenderer.js';
import { Navigation } from './modules/navigation.js';
import { FormHandler } from './modules/formHandler.js';
import { Utils } from './modules/utils.js';
import { HeroSlider } from './modules/heroSlider.js';
import { FloatingButtons } from './modules/floatingButtons.js';
import { LayoutComponents } from './modules/layoutComponents.js';
import { OverviewSlider } from './modules/overviewSlider.js';
import { FloorplanManager } from './modules/floorplanManager.js';
import { DesignManager } from './modules/designManager.js';
import './modules/imageViewer.js'; // 이미지 뷰어 자동 초기화

class App {
    constructor() {
        this.dataLoader = new DataLoader();
        this.sectionRenderer = new SectionRenderer();
        this.navigation = new Navigation();
        this.formHandler = new FormHandler();
        this.heroSlider = new HeroSlider();
        this.floatingButtons = new FloatingButtons();
        this.layoutComponents = new LayoutComponents();
        this.overviewSlider = new OverviewSlider();
        this.floorplanManager = null;  // 데이터 로드 후 초기화
        this.designManager = null;  // 데이터 로드 후 초기화
        this.data = null;
    }

    async init() {
        try {
            // Show loading
            Utils.showLoading();

            // Load data
            this.data = await this.dataLoader.loadData();
            
            // SEO 메타 태그 업데이트
            this.updateSEOTags();
            
            // 초기 HTML 콘텐츠 제거 (검색엔진은 이미 읽음)
            const initialContent = document.getElementById('initial-content');
            if (initialContent) {
                initialContent.style.display = 'none';
            }
            document.body.classList.add('js-loaded');
            
            // Set data for layout components
            this.layoutComponents.setData(this.data);
            
            // Render layout components
            this.renderLayout();
            
            // Render all sections
            await this.renderPage();

            // Initialize components after DOM is ready
            // Small delay to ensure DOM is fully rendered
            setTimeout(() => {
                // Initialize navigation
                this.navigation.init();

                // Initialize forms
                this.formHandler.init();
                
                // Initialize hero slider
                this.heroSlider.init();
                
                // Initialize overview slider
                this.overviewSlider.init();
                
                // Initialize design manager
                if (this.data.design) {
                    this.designManager = new DesignManager();
                    this.designManager.init();
                }
                
                // Initialize floorplan manager with data
                if (this.data.floorPlans && this.data.floorPlans.plans) {
                    this.floorplanManager = new FloorplanManager(this.data.floorPlans.plans);
                    this.floorplanManager.init();
                }
                
                // Initialize floating buttons
                this.floatingButtons.init();
                
                // Add scroll animations
                this.initScrollAnimations();
            }, 100);

            // Hide loading
            Utils.hideLoading();

        } catch (error) {
            console.error('Error initializing app:', error);
            Utils.showError('페이지를 불러오는 중 오류가 발생했습니다.');
        }
    }

    updateSEOTags() {
        console.log('SEO 데이터 업데이트 시작:', this.data.seo);
        
        // SEO 데이터가 있으면 메타 태그 업데이트
        if (this.data.seo) {
            // title 태그 업데이트
            if (this.data.seo.title) {
                document.title = this.data.seo.title;
            }
            
            // meta description 업데이트
            if (this.data.seo.description) {
                let metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.setAttribute('content', this.data.seo.description);
                } else {
                    metaDescription = document.createElement('meta');
                    metaDescription.setAttribute('name', 'description');
                    metaDescription.setAttribute('content', this.data.seo.description);
                    document.head.appendChild(metaDescription);
                }
            }
            
            // meta keywords 업데이트
            if (this.data.seo.keywords) {
                let metaKeywords = document.querySelector('meta[name="keywords"]');
                if (metaKeywords) {
                    metaKeywords.setAttribute('content', this.data.seo.keywords);
                } else {
                    metaKeywords = document.createElement('meta');
                    metaKeywords.setAttribute('name', 'keywords');
                    metaKeywords.setAttribute('content', this.data.seo.keywords);
                    document.head.appendChild(metaKeywords);
                }
            }
            
            // Open Graph 태그 추가
            this.updateOpenGraphTags();
        } else if (this.data.site) {
            // SEO 데이터가 없으면 site 데이터 사용
            if (this.data.site.title) {
                document.title = this.data.site.title;
            }
            if (this.data.site.description) {
                let metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    metaDescription.setAttribute('content', this.data.site.description);
                } else {
                    metaDescription = document.createElement('meta');
                    metaDescription.setAttribute('name', 'description');
                    metaDescription.setAttribute('content', this.data.site.description);
                    document.head.appendChild(metaDescription);
                }
            }
        }
    }
    
    updateOpenGraphTags() {
        console.log('Open Graph 태그 업데이트 시작');
        
        // OG 이미지 경로를 절대 경로로 변환
        const ogImagePath = this.data.seo?.ogImage || 'assets/images/hero/hero.jpg';
        const ogImageUrl = ogImagePath.startsWith('http') ? ogImagePath : 
                          `${window.location.origin}/${ogImagePath.replace(/^\//, '')}`;
        
        const ogTags = [
            { property: 'og:title', content: this.data.seo?.title || this.data.site?.title || '김포 오퍼스 한강 스위첸' },
            { property: 'og:description', content: this.data.seo?.description || this.data.site?.description || '김포 한강신도시 프리미엄 주거공간' },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: window.location.href },
            { property: 'og:image', content: ogImageUrl },
            { property: 'og:site_name', content: this.data.site?.title || '김포 오퍼스 한강 스위첸' },
            { property: 'og:locale', content: 'ko_KR' }
        ];
        
        // Twitter Card 태그
        const twitterTags = [
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: this.data.seo?.title || this.data.site?.title },
            { name: 'twitter:description', content: this.data.seo?.description || this.data.site?.description },
            { name: 'twitter:image', content: ogImageUrl }
        ];
        
        // Open Graph 태그 추가/업데이트
        ogTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (metaTag) {
                metaTag.setAttribute('content', tag.content);
            } else {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', tag.property);
                metaTag.setAttribute('content', tag.content);
                document.head.appendChild(metaTag);
            }
        });
        
        // Twitter Card 태그 추가/업데이트
        twitterTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
            if (metaTag) {
                metaTag.setAttribute('content', tag.content);
            } else {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('name', tag.name);
                metaTag.setAttribute('content', tag.content);
                document.head.appendChild(metaTag);
            }
        });
    }

    renderLayout() {
        // Header 삽입
        document.body.insertAdjacentHTML('afterbegin', this.layoutComponents.renderHeader());
        
        // Main content container 삽입
        document.body.insertAdjacentHTML('beforeend', '<main id="main-content"></main>');
        
        // Footer 삽입
        document.body.insertAdjacentHTML('beforeend', this.layoutComponents.renderFooter());
        
        // Floating buttons 삽입
        document.body.insertAdjacentHTML('beforeend', this.layoutComponents.renderFloatingButtons());
        
        // Loading spinner 삽입
        document.body.insertAdjacentHTML('beforeend', this.layoutComponents.renderLoadingSpinner());
    }

    async renderPage() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Clear existing content
        mainContent.innerHTML = '';

        // Render sections
        const sections = [
            { name: 'hero', renderer: 'renderHero' },
            { name: 'overview', renderer: 'renderOverview' },
            { name: 'design', renderer: 'renderDesign' },
            { name: 'location', renderer: 'renderLocation' },
            { name: 'floorPlans', renderer: 'renderFloorPlans' },
            { name: 'premium', renderer: 'renderPremium' },
            { name: 'options', renderer: 'renderOptions' },
            { name: 'convenience', renderer: 'renderConvenience' },
            { name: 'community', renderer: 'renderCommunity' },
            { name: 'contact', renderer: 'renderContact' }
        ];

        for (const section of sections) {
            if (this.data[section.name] && this.data[section.name].visible !== false) {
                const sectionHTML = this.sectionRenderer[section.renderer](this.data[section.name]);
                mainContent.innerHTML += sectionHTML;
            }
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// 이미지 확대 보기 기능 - ImageViewer 모듈 사용
window.openImageOverlay = function(imageSrc) {
    if (window.openImageViewer) {
        window.openImageViewer(imageSrc);
    } else {
        // 폴백: 기존 방식
        const overlay = document.getElementById('imageOverlay');
        const overlayImage = document.getElementById('overlayImage');
        
        if (overlay && overlayImage) {
            overlayImage.src = imageSrc;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
};

window.closeImageOverlay = function() {
    const overlay = document.getElementById('imageOverlay');
    
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};