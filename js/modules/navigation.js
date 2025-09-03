// Navigation Module
export class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-menu a');
    }

    init() {
        // DOM 요소 재확인
        this.header = document.querySelector('.header');
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        
        // 요소가 없으면 경고만 출력하고 계속 진행
        if (!this.header) {
            console.warn('Navigation: Header element not found');
        }
        
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupScrollHeader();
        this.setupActiveMenu();
    }

    setupMobileMenu() {
        if (!this.mobileMenuToggle || !this.navMenu) return;

        this.mobileMenuToggle.addEventListener('click', () => {
            this.mobileMenuToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenuToggle.classList.remove('active');
                this.navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                this.mobileMenuToggle.classList.remove('active');
                this.navMenu.classList.remove('active');
            }
        });
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = this.header.offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // 클릭한 메뉴 활성화
                        this.setActiveMenu(link);
                    }
                }
            });
        });
    }

    setupScrollHeader() {
        // header 요소 확인
        if (!this.header) {
            this.header = document.querySelector('.header');
            if (!this.header) {
                console.warn('Header element not found');
                return;
            }
        }
        
        let lastScroll = 0;
        
        // 초기 상태 설정
        const checkScroll = () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
                this.header.classList.remove('at-top');
            } else {
                this.header.classList.remove('scrolled');
                this.header.classList.add('at-top');
            }

            // Hide/show header on scroll (선택사항 - 주석처리)
            // if (currentScroll > lastScroll && currentScroll > 300) {
            //     this.header.style.transform = 'translateY(-100%)';
            // } else {
            //     this.header.style.transform = 'translateY(0)';
            // }
            
            lastScroll = currentScroll;
        };
        
        // 페이지 로드 시 초기 체크
        checkScroll();
        
        // 스크롤 이벤트
        window.addEventListener('scroll', checkScroll);
    }

    setActiveLink() {
        const sections = document.querySelectorAll('.section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    setActiveMenu(activeLink) {
        // 모든 메뉴에서 active 클래스 제거
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // 현재 메뉴에 active 클래스 추가
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    setupActiveMenu() {
        // 스크롤 시 현재 섹션 감지
        let ticking = false;
        
        const detectActiveSection = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollY = window.pageYOffset + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
                
                if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                    if (correspondingLink) {
                        this.setActiveMenu(correspondingLink);
                    }
                }
            });
        };
        
        // 초기 실행
        detectActiveSection();
        
        // 스크롤 시 실행 (성능 최적화)
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    detectActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}