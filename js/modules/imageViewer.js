// Image Viewer Module - 이미지 확대/축소 및 이동 기능
export class ImageViewer {
    constructor() {
        this.overlay = null;
        this.image = null;
        this.scale = 1;
        this.minScale = 1;
        this.maxScale = 5;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    createOverlay() {
        // 오버레이 생성
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-viewer-overlay';
        this.overlay.innerHTML = `
            <div class="image-viewer-container">
                <img class="viewer-image" alt="확대 이미지">
                <div class="viewer-controls">
                    <button class="viewer-btn zoom-in" title="확대">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="2"/>
                            <path d="M12.5 12.5l4 4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="viewer-btn zoom-out" title="축소">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                            <path d="M5 8h6" stroke="currentColor" stroke-width="2"/>
                            <path d="M12.5 12.5l4 4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="viewer-btn reset" title="원본 크기">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="3" width="14" height="14" stroke="currentColor" stroke-width="2"/>
                            <circle cx="10" cy="10" r="2" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="viewer-btn close" title="닫기">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="viewer-info">
                    <span class="zoom-level">100%</span>
                    <span class="viewer-hint">마우스 휠: 확대/축소 | 드래그: 이동 | ESC: 닫기</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        this.image = this.overlay.querySelector('.viewer-image');
        this.container = this.overlay.querySelector('.image-viewer-container');
        
        // 스타일 추가
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .image-viewer-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                cursor: grab;
            }
            
            .image-viewer-overlay.active {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .image-viewer-overlay.dragging {
                cursor: grabbing;
            }
            
            .image-viewer-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .viewer-image {
                max-width: 90%;
                max-height: 90%;
                transform-origin: center;
                transition: transform 0.1s ease-out;
                user-select: none;
                -webkit-user-drag: none;
            }
            
            .viewer-controls {
                position: absolute;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                background: rgba(0, 0, 0, 0.7);
                padding: 10px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            
            .viewer-btn {
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .viewer-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .viewer-btn:active {
                transform: scale(0.95);
            }
            
            .viewer-info {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 20px;
                background: rgba(0, 0, 0, 0.7);
                padding: 10px 20px;
                border-radius: 20px;
                color: white;
                font-size: 14px;
                backdrop-filter: blur(10px);
            }
            
            .zoom-level {
                font-weight: bold;
                min-width: 60px;
                text-align: center;
            }
            
            .viewer-hint {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
            }
            
            @media (max-width: 768px) {
                .viewer-controls {
                    top: 10px;
                    right: 10px;
                    gap: 5px;
                    padding: 5px;
                }
                
                .viewer-btn {
                    width: 35px;
                    height: 35px;
                }
                
                .viewer-info {
                    bottom: 10px;
                    padding: 8px 15px;
                    font-size: 12px;
                }
                
                .viewer-hint {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // 컨트롤 버튼들
        this.overlay.querySelector('.zoom-in').addEventListener('click', (e) => {
            e.stopPropagation();
            this.zoomIn();
        });
        
        this.overlay.querySelector('.zoom-out').addEventListener('click', (e) => {
            e.stopPropagation();
            this.zoomOut();
        });
        
        this.overlay.querySelector('.reset').addEventListener('click', (e) => {
            e.stopPropagation();
            this.reset();
        });
        
        this.overlay.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        
        // 오버레이 클릭으로 닫기
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target === this.container) {
                this.close();
            }
        });
        
        // 마우스 휠 이벤트
        this.overlay.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(delta, e.clientX, e.clientY);
        });
        
        // 드래그 이벤트
        this.image.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
        
        // 터치 이벤트 (모바일)
        this.image.addEventListener('touchstart', this.startTouch.bind(this));
        document.addEventListener('touchmove', this.touchMove.bind(this));
        document.addEventListener('touchend', this.endTouch.bind(this));
        
        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(imageSrc) {
        this.image.src = imageSrc;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.reset();
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.reset();
    }

    zoomIn() {
        this.zoom(0.2);
    }

    zoomOut() {
        this.zoom(-0.2);
    }

    zoom(delta, centerX = null, centerY = null) {
        const newScale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale);
        
        if (newScale === this.scale) return;
        
        // 마우스 위치를 중심으로 확대/축소
        if (centerX && centerY) {
            const rect = this.image.getBoundingClientRect();
            const x = centerX - rect.left - rect.width / 2;
            const y = centerY - rect.top - rect.height / 2;
            
            const scaleDiff = newScale - this.scale;
            this.translateX -= x * scaleDiff;
            this.translateY -= y * scaleDiff;
        }
        
        this.scale = newScale;
        this.updateTransform();
    }

    reset() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    startDrag(e) {
        if (this.scale <= 1) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.overlay.classList.add('dragging');
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
    }

    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateTransform();
    }

    endDrag() {
        this.isDragging = false;
        this.overlay.classList.remove('dragging');
    }

    // 터치 이벤트 핸들러
    startTouch(e) {
        if (this.scale <= 1) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.isDragging = true;
        this.startX = touch.clientX - this.translateX;
        this.startY = touch.clientY - this.translateY;
    }

    touchMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.translateX = touch.clientX - this.startX;
        this.translateY = touch.clientY - this.startY;
        this.updateTransform();
    }

    endTouch() {
        this.isDragging = false;
    }

    updateTransform() {
        this.image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        
        // 줌 레벨 표시 업데이트
        const zoomLevel = Math.round(this.scale * 100);
        this.overlay.querySelector('.zoom-level').textContent = `${zoomLevel}%`;
    }
}

// 전역 인스턴스 생성
const imageViewer = new ImageViewer();
imageViewer.init();

// 전역 함수로 내보내기
window.openImageViewer = (imageSrc) => {
    imageViewer.open(imageSrc);
};

export default imageViewer;
