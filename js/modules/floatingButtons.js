// Floating Buttons Module
export class FloatingButtons {
    constructor() {
        this.scrollTopBtn = null;
        this.scrollThreshold = 300;
    }

    init() {
        this.setupScrollTopButton();
        this.setupSmoothScroll();
        this.showScrollTopOnScroll();
    }

    setupScrollTopButton() {
        this.scrollTopBtn = document.querySelector('.floating-btn.scroll-top');
        
        if (!this.scrollTopBtn) return;
        
        this.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setupSmoothScroll() {
        // 방문 예약 버튼 스무스 스크롤
        const reserveBtn = document.querySelector('.floating-btn[href="#contact"]');
        if (reserveBtn) {
            reserveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#contact');
                if (target) {
                    const offset = target.offsetTop - 80;
                    window.scrollTo({
                        top: offset,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    showScrollTopOnScroll() {
        if (!this.scrollTopBtn) return;
        
        const checkScroll = () => {
            if (window.pageYOffset > this.scrollThreshold) {
                this.scrollTopBtn.classList.add('show');
            } else {
                this.scrollTopBtn.classList.remove('show');
            }
        };
        
        // 초기 체크
        checkScroll();
        
        // 스크롤 이벤트
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}