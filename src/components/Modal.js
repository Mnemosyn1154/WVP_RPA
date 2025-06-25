/**
 * Modal 컴포넌트
 * 모달 다이얼로그 관리
 */

class Modal {
    constructor() {
        this.container = null;
        this.activeModals = new Map();
        this.init();
    }

    init() {
        this.container = document.getElementById('modalContainer');
        if (!this.container) {
            console.warn('Modal container not found');
        }
    }

    show(options = {}) {
        const config = {
            title: options.title || '알림',
            content: options.content || '',
            size: options.size || 'medium',
            closable: options.closable !== false,
            backdrop: options.backdrop !== false,
            buttons: options.buttons || [{ text: '확인', type: 'primary' }],
            ...options
        };

        const modalId = this.generateId();
        const modalElement = this.createModalElement(modalId, config);
        
        this.container.appendChild(modalElement);
        this.activeModals.set(modalId, { element: modalElement, config });

        // 애니메이션
        requestAnimationFrame(() => {
            modalElement.classList.add('show');
        });

        return modalId;
    }

    hide(modalId) {
        const modal = this.activeModals.get(modalId);
        if (!modal) return;

        modal.element.classList.remove('show');
        setTimeout(() => {
            if (modal.element.parentNode) {
                modal.element.parentNode.removeChild(modal.element);
            }
            this.activeModals.delete(modalId);
        }, 300);
    }

    closeTopModal() {
        // 가장 최근에 열린 모달 닫기
        const modalIds = Array.from(this.activeModals.keys());
        if (modalIds.length > 0) {
            const topModalId = modalIds[modalIds.length - 1];
            this.hide(topModalId);
            return true;
        }
        return false;
    }

    createModalElement(id, config) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('data-modal-id', id);

        const modal = document.createElement('div');
        modal.className = `modal modal-${config.size}`;

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${config.title}</h3>
                ${config.closable ? '<button class="modal-close">&times;</button>' : ''}
            </div>
            <div class="modal-body">
                ${config.content}
            </div>
            <div class="modal-footer">
                ${this.createButtons(config.buttons, id)}
            </div>
        `;

        overlay.appendChild(modal);
        this.addEventListeners(overlay, id, config);
        return overlay;
    }

    createButtons(buttons, modalId) {
        return buttons.map(btn => {
            const type = btn.type || 'secondary';
            return `<button class="btn btn-${type}" data-action="${btn.action || 'close'}">${btn.text}</button>`;
        }).join('');
    }

    addEventListeners(overlay, id, config) {
        // 닫기 버튼
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(id));
        }

        // 배경 클릭으로 닫기
        if (config.backdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide(id);
                }
            });
        }

        // 버튼 이벤트
        const buttons = overlay.querySelectorAll('.modal-footer .btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'close' || !config.onAction) {
                    this.hide(id);
                } else if (typeof config.onAction === 'function') {
                    const result = config.onAction(action);
                    if (result !== false) {
                        this.hide(id);
                    }
                }
            });
        });
    }

    generateId() {
        return 'modal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    confirm(message, title = '확인') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: message,
                buttons: [
                    { text: '취소', type: 'secondary', action: 'cancel' },
                    { text: '확인', type: 'primary', action: 'confirm' }
                ],
                onAction: (action) => {
                    resolve(action === 'confirm');
                }
            });
        });
    }

    alert(message, title = '알림') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: message,
                buttons: [{ text: '확인', type: 'primary' }],
                onAction: () => resolve()
            });
        });
    }
}

window.Modal = new Modal(); 