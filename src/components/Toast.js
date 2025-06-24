/**
 * Toast 알림 컴포넌트
 * 사용자에게 피드백을 제공하는 알림 시스템
 */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.defaultDuration = 5000;
        this.maxToasts = 5;
        
        this.init();
    }

    /**
     * Toast 시스템 초기화
     */
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            console.warn('Toast container not found');
            return;
        }
    }

    /**
     * Toast 표시
     * @param {string} message - 메시지
     * @param {string} type - 타입 (success, error, warning, info)
     * @param {Object} options - 옵션
     */
    show(message, type = 'info', options = {}) {
        if (!this.container) {
            console.warn('Toast container not available');
            return null;
        }

        const config = {
            title: options.title || this.getDefaultTitle(type),
            duration: options.duration || this.defaultDuration,
            closable: options.closable !== false,
            persistent: options.persistent || false,
            action: options.action || null,
            ...options
        };

        const toastId = this.generateId();
        const toastElement = this.createToastElement(toastId, message, type, config);
        
        // 최대 개수 제한
        this.limitToasts();
        
        // 컨테이너에 추가
        this.container.appendChild(toastElement);
        this.toasts.set(toastId, {
            element: toastElement,
            type: type,
            config: config
        });

        // 자동 제거 (persistent가 아닌 경우)
        if (!config.persistent && config.duration > 0) {
            setTimeout(() => {
                this.hide(toastId);
            }, config.duration);
        }

        // 애니메이션 트리거
        requestAnimationFrame(() => {
            toastElement.classList.add('show');
        });

        return toastId;
    }

    /**
     * Toast 숨기기
     * @param {string} toastId - Toast ID
     */
    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;

        const element = toast.element;
        element.classList.add('hiding');

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    /**
     * 모든 Toast 숨기기
     */
    hideAll() {
        this.toasts.forEach((toast, id) => {
            this.hide(id);
        });
    }

    /**
     * 성공 Toast
     * @param {string} message - 메시지
     * @param {Object} options - 옵션
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * 에러 Toast
     * @param {string} message - 메시지
     * @param {Object} options - 옵션
     */
    error(message, options = {}) {
        return this.show(message, 'error', {
            duration: 8000,
            ...options
        });
    }

    /**
     * 경고 Toast
     * @param {string} message - 메시지
     * @param {Object} options - 옵션
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * 정보 Toast
     * @param {string} message - 메시지
     * @param {Object} options - 옵션
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * 로딩 Toast
     * @param {string} message - 메시지
     * @param {Object} options - 옵션
     */
    loading(message, options = {}) {
        return this.show(message, 'loading', {
            persistent: true,
            closable: false,
            ...options
        });
    }

    /**
     * Toast 엘리먼트 생성
     * @param {string} id - Toast ID
     * @param {string} message - 메시지
     * @param {string} type - 타입
     * @param {Object} config - 설정
     * @returns {HTMLElement} Toast 엘리먼트
     */
    createToastElement(id, message, type, config) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('data-toast-id', id);

        const icon = this.getIcon(type);
        const closeButton = config.closable ? 
            '<button class="toast-close" aria-label="닫기">&times;</button>' : '';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${config.title ? `<div class="toast-title">${config.title}</div>` : ''}
                <div class="toast-message">${message}</div>
                ${config.action ? this.createActionButton(config.action) : ''}
            </div>
            ${closeButton}
        `;

        // 이벤트 리스너 추가
        this.addEventListeners(toast, id, config);

        return toast;
    }

    /**
     * 이벤트 리스너 추가
     * @param {HTMLElement} element - Toast 엘리먼트
     * @param {string} id - Toast ID
     * @param {Object} config - 설정
     */
    addEventListeners(element, id, config) {
        // 닫기 버튼
        const closeBtn = element.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(id);
            });
        }

        // 액션 버튼
        const actionBtn = element.querySelector('.toast-action');
        if (actionBtn && config.action) {
            actionBtn.addEventListener('click', () => {
                if (typeof config.action.callback === 'function') {
                    config.action.callback();
                }
                if (config.action.closeOnClick !== false) {
                    this.hide(id);
                }
            });
        }

        // 클릭으로 닫기 (설정된 경우)
        if (config.clickToClose) {
            element.addEventListener('click', () => {
                this.hide(id);
            });
        }
    }

    /**
     * 액션 버튼 생성
     * @param {Object} action - 액션 설정
     * @returns {string} 액션 버튼 HTML
     */
    createActionButton(action) {
        return `
            <button class="toast-action btn btn-sm btn-outline">
                ${action.text || '확인'}
            </button>
        `;
    }

    /**
     * 타입별 아이콘 반환
     * @param {string} type - Toast 타입
     * @returns {string} 아이콘
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '<div class="toast-spinner"></div>'
        };
        return icons[type] || icons.info;
    }

    /**
     * 타입별 기본 제목 반환
     * @param {string} type - Toast 타입
     * @returns {string} 기본 제목
     */
    getDefaultTitle(type) {
        const titles = {
            success: '성공',
            error: '오류',
            warning: '경고',
            info: '알림',
            loading: '처리 중'
        };
        return titles[type] || titles.info;
    }

    /**
     * Toast 개수 제한
     */
    limitToasts() {
        if (this.toasts.size >= this.maxToasts) {
            const oldestId = this.toasts.keys().next().value;
            this.hide(oldestId);
        }
    }

    /**
     * 고유 ID 생성
     * @returns {string} 고유 ID
     */
    generateId() {
        return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 특정 타입의 Toast 개수 조회
     * @param {string} type - Toast 타입
     * @returns {number} 개수
     */
    getCountByType(type) {
        let count = 0;
        this.toasts.forEach(toast => {
            if (toast.type === type) count++;
        });
        return count;
    }

    /**
     * Toast 설정 업데이트
     * @param {Object} config - 새 설정
     */
    updateConfig(config) {
        if (config.defaultDuration) {
            this.defaultDuration = config.defaultDuration;
        }
        if (config.maxToasts) {
            this.maxToasts = config.maxToasts;
        }
    }
}

// 전역 인스턴스 생성
window.Toast = new Toast(); 