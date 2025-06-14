/**
 * Button 컴포넌트
 * 재사용 가능한 버튼 컴포넌트
 */

class Button {
    constructor() {
        this.buttons = new Map();
    }

    /**
     * 버튼 생성
     * @param {Object} options - 버튼 옵션
     * @returns {HTMLElement} 버튼 엘리먼트
     */
    create(options = {}) {
        const config = {
            text: options.text || '버튼',
            type: options.type || 'primary',
            size: options.size || 'medium',
            icon: options.icon || null,
            disabled: options.disabled || false,
            loading: options.loading || false,
            onClick: options.onClick || null,
            className: options.className || '',
            ...options
        };

        const button = document.createElement('button');
        const buttonId = this.generateId();
        
        button.className = this.getButtonClasses(config);
        button.disabled = config.disabled || config.loading;
        button.setAttribute('data-button-id', buttonId);

        this.updateButtonContent(button, config);
        this.addEventListeners(button, buttonId, config);
        
        this.buttons.set(buttonId, { element: button, config });
        
        return button;
    }

    /**
     * 버튼 클래스 생성
     * @param {Object} config - 버튼 설정
     * @returns {string} 클래스 문자열
     */
    getButtonClasses(config) {
        const classes = ['btn'];
        
        // 타입
        classes.push(`btn-${config.type}`);
        
        // 크기
        if (config.size !== 'medium') {
            classes.push(`btn-${config.size}`);
        }
        
        // 로딩 상태
        if (config.loading) {
            classes.push('btn-loading');
        }
        
        // 추가 클래스
        if (config.className) {
            classes.push(config.className);
        }
        
        return classes.join(' ');
    }

    /**
     * 버튼 내용 업데이트
     * @param {HTMLElement} button - 버튼 엘리먼트
     * @param {Object} config - 버튼 설정
     */
    updateButtonContent(button, config) {
        let content = '';
        
        if (config.loading) {
            content = '<span class="btn-spinner"></span>';
            if (config.loadingText) {
                content += `<span class="btn-text">${config.loadingText}</span>`;
            }
        } else {
            if (config.icon) {
                content += `<span class="btn-icon">${config.icon}</span>`;
            }
            content += `<span class="btn-text">${config.text}</span>`;
        }
        
        button.innerHTML = content;
    }

    /**
     * 이벤트 리스너 추가
     * @param {HTMLElement} button - 버튼 엘리먼트
     * @param {string} buttonId - 버튼 ID
     * @param {Object} config - 버튼 설정
     */
    addEventListeners(button, buttonId, config) {
        if (typeof config.onClick === 'function') {
            button.addEventListener('click', (event) => {
                if (!button.disabled) {
                    config.onClick(event, buttonId);
                }
            });
        }

        // 키보드 접근성
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    }

    /**
     * 버튼 상태 업데이트
     * @param {string} buttonId - 버튼 ID
     * @param {Object} updates - 업데이트할 속성들
     */
    update(buttonId, updates) {
        const buttonData = this.buttons.get(buttonId);
        if (!buttonData) return false;

        const { element, config } = buttonData;
        
        // 설정 업데이트
        Object.assign(config, updates);
        
        // 클래스 업데이트
        element.className = this.getButtonClasses(config);
        
        // 내용 업데이트
        this.updateButtonContent(element, config);
        
        // 비활성화 상태 업데이트
        element.disabled = config.disabled || config.loading;
        
        return true;
    }

    /**
     * 로딩 상태 설정
     * @param {string} buttonId - 버튼 ID
     * @param {boolean} loading - 로딩 여부
     * @param {string} loadingText - 로딩 텍스트
     */
    setLoading(buttonId, loading = true, loadingText = null) {
        return this.update(buttonId, { 
            loading, 
            loadingText: loadingText || '처리 중...' 
        });
    }

    /**
     * 버튼 비활성화/활성화
     * @param {string} buttonId - 버튼 ID
     * @param {boolean} disabled - 비활성화 여부
     */
    setDisabled(buttonId, disabled = true) {
        return this.update(buttonId, { disabled });
    }

    /**
     * 버튼 텍스트 변경
     * @param {string} buttonId - 버튼 ID
     * @param {string} text - 새 텍스트
     */
    setText(buttonId, text) {
        return this.update(buttonId, { text });
    }

    /**
     * 버튼 제거
     * @param {string} buttonId - 버튼 ID
     */
    remove(buttonId) {
        const buttonData = this.buttons.get(buttonId);
        if (!buttonData) return false;

        const { element } = buttonData;
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        this.buttons.delete(buttonId);
        return true;
    }

    /**
     * 고유 ID 생성
     * @returns {string} 고유 ID
     */
    generateId() {
        return 'btn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 프리셋 버튼들
     */
    static presets = {
        save: {
            text: '저장',
            type: 'primary',
            icon: '💾'
        },
        cancel: {
            text: '취소',
            type: 'secondary',
            icon: '❌'
        },
        delete: {
            text: '삭제',
            type: 'error',
            icon: '🗑️'
        },
        edit: {
            text: '수정',
            type: 'outline',
            icon: '✏️'
        },
        download: {
            text: '다운로드',
            type: 'success',
            icon: '📥'
        },
        upload: {
            text: '업로드',
            type: 'primary',
            icon: '📤'
        }
    };

    /**
     * 프리셋 버튼 생성
     * @param {string} presetName - 프리셋 이름
     * @param {Object} overrides - 덮어쓸 옵션들
     * @returns {HTMLElement} 버튼 엘리먼트
     */
    createPreset(presetName, overrides = {}) {
        const preset = Button.presets[presetName];
        if (!preset) {
            throw new Error(`Unknown preset: ${presetName}`);
        }
        
        return this.create({ ...preset, ...overrides });
    }
}

// 전역 인스턴스 생성
window.Button = new Button(); 