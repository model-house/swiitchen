// Form Handler Module
export class FormHandler {
    init() {
        this.setupContactForm();
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!this.validateForm(data)) {
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '전송 중...';
            submitBtn.disabled = true;

            try {
                // Save to localStorage (for demo purposes)
                this.saveInquiry(data);
                
                // Show success message
                this.showMessage('문의가 성공적으로 접수되었습니다. 곧 연락드리겠습니다.', 'success');
                
                // Reset form
                form.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                this.showMessage('문의 접수 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    validateForm(data) {
        // Phone number validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (data.phone && !phoneRegex.test(data.phone.replace(/-/g, ''))) {
            this.showMessage('올바른 전화번호를 입력해 주세요.', 'error');
            return false;
        }

        // Name validation
        if (data.name && data.name.length < 2) {
            this.showMessage('이름을 2자 이상 입력해 주세요.', 'error');
            return false;
        }

        return true;
    }

    saveInquiry(data) {
        // Get existing inquiries
        const inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
        
        // Add new inquiry with timestamp
        inquiries.push({
            ...data,
            date: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    }
}