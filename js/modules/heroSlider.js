// Hero Slider Module
export class HeroSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = null;
        this.dots = null;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5초마다 자동 전환
    }

    init() {
        // 슬라이드 요소들 가져오기
        this.slides = document.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.slide-dot');
        
        if (!this.slides.length) return;
        
        // 인디케이터 클릭 이벤트
        this.setupDotClickEvents();
        
        // 자동 재생 시작
        this.startAutoPlay();
        
        // 마우스 호버 시 자동 재생 일시정지
        this.setupHoverPause();
        
        // 터치/스와이프 지원 (모바일)
        this.setupTouchEvents();
    }

    setupDotClickEvents() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoPlay();
            });
        });
    }

    goToSlide(index) {
        // 현재 슬라이드 비활성화
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        
        // 새 슬라이드 활성화
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    setupHoverPause() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        heroSection.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });
        
        heroSection.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
    }

    setupTouchEvents() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        heroSection.addEventListener('touchend', (e) => {
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
                this.resetAutoPlay();
            }
        };
        
        this.handleSwipe = handleSwipe;
    }

    // 키보드 네비게이션 추가
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.resetAutoPlay();
            }
        });
    }

    destroy() {
        this.stopAutoPlay();
        // 이벤트 리스너 정리
    }
}