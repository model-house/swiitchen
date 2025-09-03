// Design Section Renderer Module
export class DesignRenderer {
    render(data) {
        if (!data || data.visible === false) return '';
        
        // 첫 번째 카드를 기본 활성화
        const activeIndex = 0;
        
        return `
            <section id="design" class="section design-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">${data.title || '단지 설계'}</h2>
                    </div>
                    <div class="design-content">
                        <div class="design-info">
                            ${data.cards.map((card, index) => `
                                <div class="design-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">
                                    <span class="design-label">${card.title}</span>
                                    <span class="design-value">
                                        ${card.points ? 
                                            card.points.map(point => `${point.label}: ${point.description}`).join(', ') : 
                                            card.description
                                        }
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="design-slider-wrapper">
                            <div class="design-image-container">
                                <div class="design-slider">
                                    <div class="design-slides">
                                        ${data.cards.map((card, index) => `
                                            <div class="design-slide ${index === activeIndex ? 'active' : ''}" data-slide="${index}">
                                                <img src="${card.image}" alt="${card.title}" loading="lazy">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
}
