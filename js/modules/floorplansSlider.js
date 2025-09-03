// Floorplans Slider Module
export class FloorplansSlider {
    constructor(plansData = null) {
        this.currentSlide = 0;
        this.slides = [];
        this.filteredIndexes = [];
        this.currentFilter = 'all';
        this.plansData = plansData;  // 전체 평면도 데이터 저장
    }

    init() {
        this.setupSlider();
        this.setupControls();
        // 필터 기능 제거
    }

    setupSlider() {
        this.slides = document.querySelectorAll('.floorplans-slide');
        if (this.slides.length === 0) return;

        // 모든 슬라이드를 표시 대상으로 설정
        this.filteredIndexes = Array.from({length: this.slides.length}, (_, i) => i);
        
        // 첫 번째 슬라이드 활성화
        this.showSlide(0);
    }

    setupControls() {
        // 이전/다음 버튼
        const prevBtn = document.querySelector('.floorplans-slider-btn.prev');
        const nextBtn = document.querySelector('.floorplans-slider-btn.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }

        // 터치 스와이프 지원
        this.setupTouchControls();
    }

    // 필터 관련 메서드 제거

    setupTouchControls() {
        const slider = document.querySelector('.floorplans-slider');
        if (!slider) return;

        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }

    showSlide(filteredIndex) {
        if (this.filteredIndexes.length === 0) return;
        
        const actualIndex = this.filteredIndexes[filteredIndex];
        this.showSlideByIndex(actualIndex);
    }

    showSlideByIndex(actualIndex) {
        // 모든 슬라이드 비활성화
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // 현재 슬라이드 활성화
        if (this.slides[actualIndex]) {
            const currentSlide = this.slides[actualIndex];
            currentSlide.classList.add('active');
            
            // 현재 필터된 인덱스 업데이트
            this.currentSlide = this.filteredIndexes.indexOf(actualIndex);
            if (this.currentSlide === -1) {
                this.currentSlide = 0;
            }
            
            // 좌측 정보 카드 업데이트
            this.updateInfoCard(currentSlide);
        }
    }

    updateInfoCard(slide) {
        const infoContainer = document.getElementById('floorplan-current-info');
        if (!infoContainer) return;
        
        const slideIndex = parseInt(slide.dataset.slide);
        const type = slide.dataset.type;
        const area = slide.dataset.area;
        const description = slide.dataset.description;
        const units = slide.dataset.units;
        
        // 실제 데이터에서 해당 평면도 정보 가져오기
        let planData = null;
        let features = [];
        let areaDetails = null;
        
        if (this.plansData && this.plansData[slideIndex]) {
            planData = this.plansData[slideIndex];
            features = planData.features || [];
            areaDetails = planData.areaDetails || this.getAreaDetailsByType(type);
        } else {
            // 폴백: 기본 데이터 사용
            features = this.getFeaturesByType(type);
            areaDetails = this.getAreaDetailsByType(type);
        }
        
        infoContainer.innerHTML = `
            <div class="info-type">${type}</div>
            <div class="info-area">${area}</div>
            ${units ? `<div class="info-units">세대수: <strong>${units}</strong></div>` : ''}
            <div class="info-description">${description}</div>
            
            ${areaDetails && areaDetails.length > 0 ? `
                <div class="info-area-details">
                    <h4>면적 정보</h4>
                    <div class="area-detail-list">
                        ${areaDetails.map(detail => `
                            <div class="area-detail-item">
                                <span class="detail-label">${detail.label}</span>
                                <span class="detail-value">${detail.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="info-features">
                <h4>특징</h4>
                <ul>
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    getAreaDetailsByType(type) {
        // 각 평형별 면적 상세 정보
        const areaMap = {
            '84A': [
                { label: '주거전용면적', value: '84.9804㎡' },
                { label: '주거공용면적', value: '23.1332㎡' },
                { label: '공급면적', value: '108.1136㎡' },
                { label: '계약면적', value: '165.9653㎡' }
            ],
            '84B': [
                { label: '주거전용면적', value: '84.9500㎡' },
                { label: '주거공용면적', value: '23.2000㎡' },
                { label: '공급면적', value: '108.1500㎡' },
                { label: '계약면적', value: '166.0000㎡' }
            ],
            '84C': [
                { label: '주거전용면적', value: '84.9800㎡' },
                { label: '주거공용면적', value: '23.1500㎡' },
                { label: '공급면적', value: '108.1300㎡' },
                { label: '계약면적', value: '166.0200㎡' }
            ],
            '99A': [
                { label: '주거전용면적', value: '99.9200㎡' },
                { label: '주거공용면적', value: '27.5000㎡' },
                { label: '공급면적', value: '127.4200㎡' },
                { label: '계약면적', value: '195.8500㎡' }
            ],
            '99B': [
                { label: '주거전용면적', value: '99.9500㎡' },
                { label: '주거공용면적', value: '27.4800㎡' },
                { label: '공급면적', value: '127.4300㎡' },
                { label: '계약면적', value: '195.9000㎡' }
            ]
        };
        
        return areaMap[type] || null;
    }
    
    getFeaturesByType(type) {
        const featureMap = {
            '84A': [
                '4Bay 남향 위주 배치',
                '탄탄한 공간 구성',
                '넓은 거실 공간',
                '확장형 주방 설계'
            ],
            '84B': [
                '3Bay 판상형 구조',
                '효율적인 동선 설계',
                '드레스룸 강화',
                '충분한 수납공간'
            ],
            '84C': [
                '4Bay 맞통풍 구조',
                '전체 방 확장 가능',
                '와이드 발코니',
                '독립적인 공간 분리'
            ],
            '99A': [
                '4Bay 남향 프리미엄',
                '넓은 거실과 주방',
                '패밀리룸 추가',
                '대형 드레스룸'
            ],
            '99B': [
                '4Bay 판상형 프리미엄',
                '맞통풍 효과 극대화',
                '별도 팔트리 공간',
                '주방 아일랜드 설치'
            ]
        };
        
        return featureMap[type] || [
            '남향 위주 배치',
            '맞통풍 구조',
            '넓은 거실 공간',
            '실용적인 수납공간'
        ];
    }

    nextSlide() {
        if (this.filteredIndexes.length === 0) return;
        
        const nextIndex = (this.currentSlide + 1) % this.filteredIndexes.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        if (this.filteredIndexes.length === 0) return;
        
        const prevIndex = (this.currentSlide - 1 + this.filteredIndexes.length) % this.filteredIndexes.length;
        this.showSlide(prevIndex);
    }

    destroy() {
        // 클린업 코드
    }
}
