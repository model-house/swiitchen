// Community Section Handler Module
export class CommunityHandler {
    constructor() {
        this.mainImg = null;
        this.subImg = null;
        this.facilityCards = null;
    }

    init() {
        // DOM 요소 찾기
        this.mainImg = document.getElementById('community-main-img');
        this.subImg = document.getElementById('community-sub-img');
        this.facilityCards = document.querySelectorAll('.facility-card');
        
        if (!this.mainImg || !this.subImg || !this.facilityCards.length) {
            return; // 요소가 없으면 종료
        }
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 각 시설 카드에 마우스 이벤트 추가
        this.facilityCards.forEach(card => {
            const mainImage = card.dataset.mainImage;
            const subImage = card.dataset.subImage;
            
            // 마우스 오버 이벤트
            card.addEventListener('mouseenter', () => {
                this.updateImages(mainImage, subImage);
                this.setActiveCard(card);
            });
            
            // 마우스 클릭 이벤트 (모바일 대응)
            card.addEventListener('click', () => {
                this.updateImages(mainImage, subImage);
                this.setActiveCard(card);
            });
        });
        
        // 커뮤니티 섹션을 벗어날 때 원래 이미지로 복원
        const communitySection = document.querySelector('.community-section');
        if (communitySection) {
            communitySection.addEventListener('mouseleave', () => {
                this.resetImages();
                this.removeActiveCard();
            });
        }
    }

    updateImages(mainSrc, subSrc) {
        if (!mainSrc || !subSrc) return;
        
        // 메인 이미지 업데이트
        if (this.mainImg) {
            this.mainImg.style.opacity = '0';
            setTimeout(() => {
                this.mainImg.src = mainSrc;
                this.mainImg.style.opacity = '1';
            }, 300);
        }
        
        // 서브 이미지 업데이트
        if (this.subImg) {
            this.subImg.style.opacity = '0';
            setTimeout(() => {
                this.subImg.src = subSrc;
                this.subImg.style.opacity = '1';
            }, 300);
        }
    }

    resetImages() {
        // 기본 이미지로 복원
        this.updateImages('assets/images/community/main.jpg', 'assets/images/community/sub.jpg');
    }

    setActiveCard(card) {
        // 모든 카드에서 active 클래스 제거
        this.facilityCards.forEach(c => c.classList.remove('active'));
        // 현재 카드에 active 클래스 추가
        card.classList.add('active');
    }

    removeActiveCard() {
        // 모든 카드에서 active 클래스 제거
        this.facilityCards.forEach(c => c.classList.remove('active'));
    }
}

// 전역으로 내보내기
const communityHandler = new CommunityHandler();
export default communityHandler;
