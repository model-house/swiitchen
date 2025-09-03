// Overview Slider Module - 사업개요 섹션 슬라이더
export class OverviewSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = null;
        this.prevBtn = null;
        this.nextBtn = null;
    }

    init() {
        // 슬라이드 요소들 가져오기
        this.slides = document.querySelectorAll('.overview-slide');
        this.prevBtn = document.querySelector('.overview-slider-btn.prev');
        this.nextBtn = document.querySelector('.overview-slider-btn.next');
        
        if (!this.slides.length) return;
        
        // 버튼 클릭 이벤트
        this.setupButtonEvents();
        
        // 터치/스와이프 지원 (모바일)
        this.setupTouchEvents();
        
        // 키보드 네비게이션
        this.setupKeyboardNavigation();
    }

    setupButtonEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
    }

    goToSlide(index) {
        // 현재 슬라이드 비활성화
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.remove('active');
        }
        
        // 새 슬라이드 활성화
        this.currentSlide = index;
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.add('active');
        }
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    setupTouchEvents() {
        const sliderContainer = document.querySelector('.overview-slider');
        if (!sliderContainer) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // 왼쪽으로 스와이프 - 다음 슬라이드
                    this.nextSlide();
                } else {
                    // 오른쪽으로 스와이프 - 이전 슬라이드
                    this.prevSlide();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }

    // 키보드 네비게이션
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // overview 섹션이 보이는 경우에만 작동
            const overviewSection = document.querySelector('.overview-section');
            if (!overviewSection) return;
            
            const rect = overviewSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                if (e.key === 'ArrowLeft') {
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                }
            }
        });
    }
}