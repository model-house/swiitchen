// Floorplan Manager Module
export class FloorplanManager {
    constructor(plansData) {
        this.plansData = plansData || [];
        this.currentPlanIndex = 0;
        this.currentFilter = 'all';
        this.currentImageIndex = 0;
    }

    init() {
        this.setupSelectors();
        this.setupGallery();
        this.updateDisplay();
    }

    setupSelectors() {
        const selectorItems = document.querySelectorAll('.selector-item');
        
        selectorItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectPlan(index);
            });
        });
    }

    selectPlan(index) {
        if (index < 0 || index >= this.plansData.length) return;
        
        this.currentPlanIndex = index;
        this.currentImageIndex = 0; // 메인 이미지로 초기화
        
        // 선택된 항목 표시
        document.querySelectorAll('.selector-item').forEach(item => {
            item.classList.remove('active');
        });
        const selectedItem = document.querySelector(`.selector-item[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const plan = this.plansData[this.currentPlanIndex];
        if (!plan) return;
        
        // 기본 정보 업데이트
        const typeEl = document.getElementById('current-type');
        const areaEl = document.getElementById('current-area');
        const summaryEl = document.getElementById('floorplan-summary');
        
        if (typeEl) typeEl.textContent = plan.type;
        if (areaEl) areaEl.textContent = plan.area;
        
        if (summaryEl) {
            summaryEl.innerHTML = `
                ${plan.units ? `
                    <div class="summary-item">
                        <span class="summary-label">세대수:</span>
                        <span class="summary-value">${plan.units}</span>
                    </div>
                ` : ''}
                ${plan.description ? `
                    <div class="summary-item">
                        <span class="summary-label">설명:</span>
                        <span class="summary-value">${plan.description}</span>
                    </div>
                ` : ''}
            `;
        }
        
        // 면적 상세 업데이트
        this.updateAreaDetails(plan);
        
        // 특징 업데이트
        this.updateFeatures(plan);
        
        // 갤러리 업데이트
        this.updateGallery(plan);
    }

    updateAreaDetails(plan) {
        const container = document.getElementById('area-details-list');
        if (!container) return;
        
        if (plan.areaDetails && plan.areaDetails.length > 0) {
            container.innerHTML = plan.areaDetails.map(detail => `
                <div class="area-detail-item">
                    <span class="detail-label">${detail.label}</span>
                    <span class="detail-value">${detail.value}</span>
                </div>
            `).join('');
        } else {
            // 기본 면적 정보 표시 (폴백)
            const defaultDetails = this.getDefaultAreaDetails(plan.type);
            if (defaultDetails) {
                container.innerHTML = defaultDetails.map(detail => `
                    <div class="area-detail-item">
                        <span class="detail-label">${detail.label}</span>
                        <span class="detail-value">${detail.value}</span>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="no-data">면적 상세 정보가 없습니다.</div>';
            }
        }
    }

    updateFeatures(plan) {
        const container = document.getElementById('features-list');
        if (!container) return;
        
        if (plan.features && plan.features.length > 0) {
            container.innerHTML = plan.features.map(feature => `<li>${feature}</li>`).join('');
        } else {
            // 기본 특징 표시 (폴백)
            const defaultFeatures = this.getDefaultFeatures(plan.type);
            if (defaultFeatures && defaultFeatures.length > 0) {
                container.innerHTML = defaultFeatures.map(feature => `<li>${feature}</li>`).join('');
            } else {
                container.innerHTML = '<li>특징 정보가 없습니다.</li>';
            }
        }
    }

    updateGallery(plan) {
        // 메인 이미지 업데이트
        const mainImage = document.getElementById('main-floorplan-image');
        if (mainImage) {
            const allImages = this.getAllImages(plan);
            if (allImages.length > 0) {
                mainImage.src = allImages[this.currentImageIndex].url;
                mainImage.alt = allImages[this.currentImageIndex].description || '평면도';
            }
        }
        
        // 썸네일 업데이트
        const thumbsContainer = document.getElementById('gallery-thumbs');
        if (thumbsContainer) {
            const allImages = this.getAllImages(plan);
            
            if (allImages.length > 1) {
                thumbsContainer.style.display = 'flex';
                thumbsContainer.innerHTML = allImages.map((img, idx) => `
                    <div class="thumb-item ${idx === this.currentImageIndex ? 'active' : ''}" 
                         data-image="${img.url}"
                         data-index="${idx}">
                        <img src="${img.url}" alt="${img.description || '평면도'}">
                    </div>
                `).join('');
                
                // 썸네일 클릭 이벤트
                this.setupThumbnailClicks();
            } else {
                thumbsContainer.style.display = 'none';
            }
        }
    }

    getAllImages(plan) {
        const images = [];
        
        // 메인 이미지
        if (plan.image) {
            images.push({
                url: plan.image,
                description: '메인 평면도'
            });
        }
        
        // 추가 이미지들
        if (plan.additionalImages && plan.additionalImages.length > 0) {
            plan.additionalImages.forEach(img => {
                images.push(img);
            });
        }
        
        return images;
    }

    setupGallery() {
        // 메인 이미지 클릭 시 확대
        const mainImage = document.getElementById('main-floorplan-image');
        if (mainImage) {
            mainImage.style.cursor = 'zoom-in';
        }
    }

    setupThumbnailClicks() {
        const thumbItems = document.querySelectorAll('.thumb-item');
        
        thumbItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectImage(index);
            });
        });
    }

    selectImage(index) {
        this.currentImageIndex = index;
        const plan = this.plansData[this.currentPlanIndex];
        const allImages = this.getAllImages(plan);
        
        if (index >= 0 && index < allImages.length) {
            // 메인 이미지 업데이트
            const mainImage = document.getElementById('main-floorplan-image');
            if (mainImage) {
                mainImage.src = allImages[index].url;
                mainImage.alt = allImages[index].description || '평면도';
            }
            
            // 썸네일 활성 상태 업데이트
            document.querySelectorAll('.thumb-item').forEach(item => {
                item.classList.remove('active');
            });
            const selectedThumb = document.querySelector(`.thumb-item[data-index="${index}"]`);
            if (selectedThumb) {
                selectedThumb.classList.add('active');
            }
        }
    }

    getDefaultAreaDetails(type) {
        // 기본 면적 정보 (data.json에서 가져온 기존 정보)
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

    getDefaultFeatures(type) {
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
                '별도 팬트리 공간',
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

    destroy() {
        // 이벤트 리스너 정리 등
    }
}
