// Section Renderer Module
import { DesignRenderer } from './designRenderer.js';

export class SectionRenderer {
    constructor() {
        this.designRenderer = new DesignRenderer();
    }
    renderHero(data) {
        // 슬라이드 이미지 배열 - JSON에서 가져오거나 기본값 사용
        let slideImages = [];
        
        // slideImages가 있으면 사용, 없으면 backgroundImage 사용
        if (data.slideImages && data.slideImages.length > 0) {
            slideImages = data.slideImages;
        } else if (data.backgroundImage) {
            // 기존 호환성을 위해 backgroundImage만 있는 경우
            slideImages = [data.backgroundImage];
        } else {
            // 둘 다 없으면 기본 이미지
            slideImages = ['assets/images/hero/hero.jpg'];
        }
        
        return `
            <section id="hero" class="hero-section">
                <!-- 슬라이드 배경 -->
                <div class="hero-slider">
                    ${slideImages.map((img, index) => `
                        <div class="hero-slide ${index === 0 ? 'active' : ''}" 
                             style="background-image: url('${img}')" 
                             data-slide="${index}"></div>
                    `).join('')}
                </div>
                
                <!-- 오버레이 -->
                <div class="hero-overlay"></div>
                
                <!-- 컨텐츠 -->
                <div class="hero-content">
                    <h1 class="hero-title">${data.title}</h1>
                    <p class="hero-subtitle">${data.subtitle}</p>
                    
                    <!-- 그랜드 오픈 뱃지 버튼 스타일 -->
                    <div class="grand-open-badge">
                        <span class="badge-text">GRAND OPEN</span>
                    </div>
                </div>
                
                <!-- 슬라이드 인디케이터 -->
                <div class="slide-indicators">
                    ${slideImages.map((_, index) => `
                        <span class="slide-dot ${index === 0 ? 'active' : ''}" 
                              data-slide="${index}"></span>
                    `).join('')}
                </div>
            </section>
        `;
    }

    renderDesign(data) {
        return this.designRenderer.render(data);
    }
    
    renderOverview(data) {
        // 이미지 배열을 데이터에서 가져오거나 기본값 사용
        const slideImages = data.images || [
            'assets/images/gaeyo/gaeyo1.jpg',
            'assets/images/gaeyo/gaeyo2.jpg',
            'assets/images/gaeyo/gaeyo3.jpg'
        ];
        
        return `
            <section id="overview" class="section overview-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title}</h2>
                    </div>
                    <div class="overview-content">
                        <div class="overview-info">
                            ${data.items.map(item => `
                                <div class="overview-item">
                                    <span class="overview-label">${item.label}</span>
                                    <span class="overview-value">${item.value}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="overview-slider-wrapper">
                            <button class="overview-slider-btn prev" aria-label="이전 슬라이드">
                                <span>‹</span>
                            </button>
                            <div class="overview-image-container">
                                <div class="overview-slider">
                                    <div class="overview-slides">
                                        ${slideImages.map((img, index) => `
                                            <div class="overview-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                                                <img src="${img}" alt="사업개요 ${index + 1}" loading="lazy">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <button class="overview-slider-btn next" aria-label="다음 슬라이드">
                                <span>›</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderLocation(data) {
        return `
            <section id="location" class="section location-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title}</h2>
                        <p class="section-description">${data.description}</p>
                    </div>
                    <div class="location-content">
                        <div class="location-highlights">
                            ${data.highlights.map(item => `
                                <div class="highlight-card">
                                    <div class="highlight-icon">${item.icon}</div>
                                    <div class="highlight-content">
                                        <h3 class="highlight-title">${item.title}</h3>
                                        <p class="highlight-description">${item.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${data.image ? `
                            <div class="location-image">
                                <div class="location-image-container" onclick="openImageOverlay('${data.image}')">
                                    <img src="${data.image}" alt="${data.title}" loading="lazy">
                                    <div class="map-zoom-hint">
                                        <span>클릭하면 크게 볼 수 있습니다</span>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- 이미지 확대 오버레이 -->
                <div id="imageOverlay" class="image-overlay" onclick="closeImageOverlay()">
                    <span class="image-overlay-close">×</span>
                    <img id="overlayImage" src="" alt="확대 이미지">
                </div>
            </section>
        `;
    }

    renderFloorPlans(data) {
        return `
            <section id="floorplans" class="section floorplans-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title}</h2>
                        <p class="section-description">${data.description}</p>
                    </div>
                    
                    <!-- 평면도 선택 리스트 (필터 제거) -->
                    <div class="floorplan-selector" id="floorplan-selector">
                        ${data.plans ? data.plans.map((plan, index) => `
                            <div class="selector-item ${index === 0 ? 'active' : ''}" 
                                 data-index="${index}" 
                                 data-type="${plan.type}">
                                <span class="selector-type">${plan.type}</span>
                                <span class="selector-area">${plan.area}</span>
                                ${plan.units ? `<span class="selector-units">${plan.units}</span>` : ''}
                            </div>
                        `).join('') : ''}
                    </div>
                    
                    <!-- 선택된 평면도 상세 정보 -->
                    <div class="floorplan-detail-container">
                        <!-- 좌측: 평면도 정보 -->
                        <div class="floorplan-info-section">
                            <!-- 평면도 기본 정보 -->
                            <div class="floorplan-basic-info">
                                <div class="info-header">
                                    <h3 class="current-type" id="current-type">${data.plans && data.plans[0] ? data.plans[0].type : ''}</h3>
                                    <span class="current-area" id="current-area">${data.plans && data.plans[0] ? data.plans[0].area : ''}</span>
                                </div>
                                <div class="info-summary" id="floorplan-summary">
                                    ${data.plans && data.plans[0] && data.plans[0].units ? `
                                        <div class="summary-item">
                                            <span class="summary-label">세대수:</span>
                                            <span class="summary-value">${data.plans[0].units}</span>
                                        </div>
                                    ` : ''}
                                    ${data.plans && data.plans[0] && data.plans[0].description ? `
                                        <div class="summary-item">
                                            <span class="summary-label">설명:</span>
                                            <span class="summary-value">${data.plans[0].description}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- 면적 상세 정보 -->
                            <div class="floorplan-area-details" id="floorplan-area-details">
                                <h4>면적 상세</h4>
                                <div class="area-details-list" id="area-details-list">
                                    ${data.plans && data.plans[0] && data.plans[0].areaDetails ? 
                                        data.plans[0].areaDetails.map(detail => `
                                            <div class="area-detail-item">
                                                <span class="detail-label">${detail.label}</span>
                                                <span class="detail-value">${detail.value}</span>
                                            </div>
                                        `).join('') : 
                                        '<div class="no-data">면적 상세 정보가 없습니다.</div>'
                                    }
                                </div>
                            </div>
                            
                            <!-- 특징 -->
                            <div class="floorplan-features" id="floorplan-features">
                                <h4>특징</h4>
                                <ul id="features-list">
                                    ${data.plans && data.plans[0] && data.plans[0].features ? 
                                        data.plans[0].features.map(feature => `<li>${feature}</li>`).join('') :
                                        '<li>특징 정보가 없습니다.</li>'
                                    }
                                </ul>
                            </div>
                        </div>
                        
                        <!-- 우측: 이미지 갤러리 섹션 -->
                        <div class="floorplan-gallery-section">
                            <!-- 메인 이미지 -->
                            <div class="gallery-main" id="gallery-main">
                                <img id="main-floorplan-image" 
                                     src="${data.plans && data.plans[0] ? data.plans[0].image : ''}" 
                                     alt="평면도"
                                     onclick="window.openImageViewer ? openImageViewer(this.src) : openImageOverlay(this.src)">
                                <div class="image-zoom-hint">
                                    <span>클릭하면 크게 볼 수 있습니다</span>
                                </div>
                            </div>
                            
                            <!-- 추가 이미지 썸네일 -->
                            <div class="gallery-thumbs" id="gallery-thumbs">
                                ${data.plans && data.plans[0] ? `
                                    <div class="thumb-item active" data-image="${data.plans[0].image}">
                                        <img src="${data.plans[0].image}" alt="메인 평면도">
                                    </div>
                                    ${data.plans[0].additionalImages ? 
                                        data.plans[0].additionalImages.map((img, idx) => `
                                            <div class="thumb-item" data-image="${img.url}">
                                                <img src="${img.url}" alt="${img.description || '추가 이미지'}">
                                            </div>
                                        `).join('') : ''
                                    }
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderPremium(data) {
        // 레이아웃 타입 결정 (cards, image-text, mixed)
        const layoutType = data.layoutType || 'cards';
        
        // 아이콘 매핑 (제목에 따라 자동 선택)
        const getIcon = (title) => {
            const iconMap = {
                '미래가치': '📈',
                '서울 빠른 쾌속교통': '🚇',
                '도보통학 우수한 교육환경': '🏫',
                '한강변의 직주근접': '🏢',
                '쾌적한 단지 설계': '🏗️',
                '스위첸 브랜드파워': '🏆',
                '스마트홈': '🏠',
                '친환경': '🌱',
                '프리미엄 마감재': '💎',
                '특화 설계': '✨'
            };
            
            // 제목에서 키워드 찾기
            for (const [key, icon] of Object.entries(iconMap)) {
                if (title.includes(key)) return icon;
            }
            return '⭐'; // 기본 아이콘
        };
        
        // 카드 레이아웃 렌더링
        const renderCards = () => `
            <div class="premium-grid">
                ${data.features.map((feature, index) => `
                    <div class="premium-card">
                        <div class="premium-icon">${feature.icon || getIcon(feature.title)}</div>
                        <h3 class="premium-title">${feature.title}</h3>
                        <p class="premium-description">${feature.description}</p>
                        ${feature.details ? `
                            <ul class="premium-details">
                                ${feature.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // 이미지-텍스트 레이아웃 렌더링
        const renderImageText = () => `
            ${data.features.map((feature, index) => `
                <div class="premium-layout-image ${index % 2 === 1 ? 'reverse' : ''}">
                    <div class="premium-image-content">
                        <h3>${feature.title}</h3>
                        <p>${feature.description}</p>
                        ${feature.details ? `
                            <ul>
                                ${feature.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                    <div class="premium-image-visual">
                        <img src="${feature.image || 'assets/images/premium-default.jpg'}" alt="${feature.title}" loading="lazy">
                    </div>
                </div>
            `).join('')}
        `;
        
        return `
            <section id="premium" class="section premium-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title || '프리미엄'}</h2>
                        ${data.description ? `<p class="section-description">${data.description}</p>` : ''}
                    </div>
                    <div class="premium-content">
                        ${layoutType === 'cards' ? renderCards() : ''}
                        ${layoutType === 'image-text' ? renderImageText() : ''}
                        ${layoutType === 'mixed' ? `
                            ${renderCards()}
                            <div style="margin-top: 80px;">
                                ${renderImageText()}
                            </div>
                        ` : ''}
                        ${data.additionalInfo ? `
                            <div class="premium-additional">
                                <div class="additional-content">
                                    ${data.additionalInfo}
                                </div>
                            </div>
                        ` : ''}
                        ${data.images && data.images.length > 0 ? `
                            <div class="premium-images">
                                ${data.images.map(img => `
                                    <div class="premium-image-item" onclick="openImageOverlay('${img.url || img}')">
                                        <img src="${img.url || img}" alt="${img.title || data.title}" loading="lazy">
                                        ${img.caption ? `<p class="image-caption">${img.caption}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    renderConvenience(data) {
        return `
            <section id="convenience" class="section convenience-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title || '시스템'}</h2>
                        ${data.description ? `<p class="section-description">${data.description}</p>` : ''}
                        ${data.subtitle ? `<p class="section-subtitle">${data.subtitle}</p>` : ''}
                    </div>
                    <div class="convenience-content">
                        ${data.facilities && data.facilities.length > 0 ? data.facilities.map(category => `
                            <div class="convenience-category">
                                <h3 class="category-title">${category.category}</h3>
                                <div class="convenience-items">
                                    ${category.items.map(item => `
                                        <div class="convenience-item">
                                            <div class="item-info">
                                                <h4 class="item-name">${item.name}</h4>
                                                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            </section>
        `;
    }

    renderCommunity(data) {
        // 기본 시설 데이터
        const defaultFacilities = [
            { name: '키즈카페', image: 'assets/images/community/1.jpg', description: '아이들을 위한 안전하고 재미있는 놀이공간' },
            { name: '영화감상공간', image: 'assets/images/community/2.jpg', description: '프라이빗 영화관에서 즐기는 특별한 시간' },
            { name: '피트니스 클럽', image: 'assets/images/community/3.jpg', description: '최첨단 시설의 프리미엄 피트니스' },
            { name: '도서관', image: 'assets/images/community/4.jpg', description: '조용한 독서와 학습을 위한 공간' },
            { name: '광장', image: 'assets/images/community/5.jpg', description: '주민들의 소통과 휴식을 위한 열린 공간' },
            { name: '음악 휴게공간', image: 'assets/images/community/6.jpg', description: '음악과 함께하는 힐링 라운지' },
            { name: '골프연습장', image: 'assets/images/community/7.jpg', description: '실내 골프 연습을 위한 전문 시설' },
            { name: '학습 공간', image: 'assets/images/community/8.jpg', description: '집중 학습을 위한 독립된 공간' }
        ];
        
        // facilities 데이터 정리
        let facilities = data.facilities || defaultFacilities;
        
        // 조감도와 평면도 이미지 경로 (별도 관리)
        const overviewImage = data.overviewImage || 'assets/images/community/main.jpg';
        const floorPlanImage = data.floorPlanImage || 'assets/images/community/sub.jpg';
        
        return `
            <section id="community" class="section community-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title || '커뮤니티 시설'}</h2>
                        ${data.description ? `<p class="section-description">${data.description}</p>` : ''}
                    </div>
                    <div class="community-layout">
                        <!-- 왼쪽: 조감도/평면도 이미지 -->
                        <div class="community-left-images">
                            <div class="community-main-display" onclick="openImageOverlay('${overviewImage}')">
                                <img src="${overviewImage}" alt="커뮤니티 조감도" loading="lazy">
                                <div class="image-overlay-label">조감도</div>
                                <div class="image-zoom-hint">
                                    <span>클릭하면 크게 볼 수 있습니다</span>
                                </div>
                            </div>
                            <div class="community-sub-display" onclick="openImageOverlay('${floorPlanImage}')">
                                <img src="${floorPlanImage}" alt="커뮤니티 서브" loading="lazy">
                                <div class="image-overlay-label">평면도</div>
                                <div class="image-zoom-hint">
                                    <span>클릭하면 크게 볼 수 있습니다</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 오른쪽: 시설 카드 그리드 -->
                        <div class="community-right-cards">
                            <div class="facility-cards-grid">
                                ${facilities.map((facility, index) => `
                                    <div class="facility-card" data-index="${index}">
                                        <div class="facility-card-image">
                                            <img src="${facility.image}" alt="${facility.name}" loading="lazy">
                                            <div class="facility-card-overlay">
                                                <h3 class="facility-overlay-name">${facility.name}</h3>
                                                <p class="facility-overlay-desc">${facility.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderOptions(data) {
        return `
            <section id="options" class="section options-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title || '기본 제공 품목 안내'}</h2>
                        ${data.description ? `<p class="section-description">${data.description}</p>` : ''}
                    </div>
                    
                    <div class="options-content">
                        ${data.categories ? data.categories.map(category => `
                            <div class="options-category">
                                <h3 class="category-title">${category.title}</h3>
                                <div class="options-grid">
                                    ${category.items.map((item, index) => `
                                        <div class="option-card ${item.special ? 'special' : ''}">
                                            <div class="option-info">
                                                <h4 class="option-title">${item.title}</h4>
                                                <p class="option-description">${item.description}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            </section>
        `;
    }

    renderContact(data) {
        return `
            <section id="contact" class="section contact-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title}</h2>
                    </div>
                    <div class="contact-content">
                        <div class="contact-info">
                            <h3>문의하기</h3>
                            <div class="info-item">
                                <strong>전화번호:</strong> ${data.phone}
                            </div>
                            <div class="info-item">
                                <strong>운영시간:</strong> ${data.hours}
                            </div>
                            <div class="info-item">
                                <strong>주소:</strong> ${data.address}
                            </div>
                            ${data.kakao ? `
                                <div class="info-item">
                                    <a href="${data.kakao}" target="_blank" class="btn btn-primary mt-2">카카오톡 상담</a>
                                </div>
                            ` : ''}
                        </div>
                        <div class="contact-form">
                            <h3>${data.form.title}</h3>
                            <form id="contactForm">
                                ${data.form.fields.map(field => this.renderFormField(field)).join('')}
                                <button type="submit" class="btn btn-primary">문의하기</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderFormField(field) {
        switch(field.type) {
            case 'text':
            case 'tel':
            case 'email':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                        <input type="${field.type}" id="${field.name}" name="${field.name}" 
                               ${field.required ? 'required' : ''}>
                    </div>
                `;
            case 'select':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                        <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                            <option value="">선택하세요</option>
                            ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                        <textarea id="${field.name}" name="${field.name}" 
                                  ${field.required ? 'required' : ''}></textarea>
                    </div>
                `;
            default:
                return '';
        }
    }
}