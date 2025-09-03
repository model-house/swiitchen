// Design Manager Module
export class DesignManager {
    constructor() {
        this.currentIndex = 0;
        this.totalSlides = 0;
        this.isAnimating = false;
        this.autoPlayInterval = null;
    }
    
    init() {
        this.totalSlides = document.querySelectorAll('.design-slide').length;
        this.setupEventListeners();
        this.setupItemClickListeners();
        this.startAutoPlay();
    }
    
    setupEventListeners() {
        // 마우스 호버 시 자동 플레이 일시 중지
        const wrapper = document.querySelector('.design-slider-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => this.stopAutoPlay());
            wrapper.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    setupItemClickListeners() {
        // 좌측 정보 아이템 클릭 시 해당 슬라이드로 이동
        const items = document.querySelectorAll('.design-item');
        items.forEach((item, index) => {
            item.addEventListener('click', () => this.showSlide(index));
        });
    }
    
    showSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.isAnimating = true;
        
        // 이전 슬라이드와 아이템 비활성화
        document.querySelectorAll('.design-slide').forEach(slide => {
            slide.classList.remove('active');
        });
        document.querySelectorAll('.design-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 새 슬라이드와 아이템 활성화
        const slide = document.querySelector(`.design-slide[data-slide="${index}"]`);
        const item = document.querySelector(`.design-item[data-index="${index}"]`);
        if (slide) slide.classList.add('active');
        if (item) item.classList.add('active');
        
        this.currentIndex = index;
        
        // 애니메이션 완료 후
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }
    
    prevSlide() {
        const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.totalSlides - 1;
        this.showSlide(newIndex);
    }
    
    nextSlide() {
        const newIndex = this.currentIndex < this.totalSlides - 1 ? this.currentIndex + 1 : 0;
        this.showSlide(newIndex);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000); // 4초마다 자동 전환
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}
