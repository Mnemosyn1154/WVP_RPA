/**
 * Tooltip 컴포넌트
 * 필드별 도움말 툴팁 관리
 */

class Tooltip {
    constructor() {
        this.activeTooltip = null;
        this.tooltips = new Map();
        this.init();
    }

    init() {
        // 전역 이벤트 리스너 등록
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tooltip-container')) {
                this.hideAll();
            }
        });

        // 키보드 네비게이션에서 툴팁 제외
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.hideAll();
            }
        });
    }

    /**
     * 툴팁 생성
     * @param {Object} config - 툴팁 설정
     * @returns {HTMLElement} 툴팁 컨테이너
     */
    create(config) {
        const tooltipId = this.generateId();
        const container = this.createTooltipContainer(tooltipId, config);
        
        if (!container) {
            return null;
        }
        
        this.tooltips.set(tooltipId, { element: container, config });
        this.addEventListeners(container, tooltipId, config);
        
        return container;
    }

    /**
     * 툴팁 컨테이너 생성
     * @param {string} id - 툴팁 ID
     * @param {Object} config - 툴팁 설정
     * @returns {HTMLElement} 툴팁 컨테이너
     */
    createTooltipContainer(id, config) {
        const container = document.createElement('div');
        container.className = 'tooltip-container';
        container.setAttribute('data-tooltip-id', id);

        // 구조화된 툴팁 데이터 생성
        const tooltipData = this.createTooltipData(config);

        // 트리거만 container에 추가
        container.innerHTML = `
            <button class="tooltip-trigger" 
                    type="button" 
                    tabindex="-1"
                    aria-label="도움말"
                    title="${tooltipData.description}">
                <span class="tooltip-icon">?</span>
            </button>
        `;

        // 팝업은 body에 별도로 추가 (포털)
        const popup = document.createElement('div');
        popup.className = 'tooltip-popup';
        popup.setAttribute('role', 'tooltip');
        popup.setAttribute('data-tooltip-id', id);
        popup.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <h4 class="tooltip-title">${tooltipData.title}</h4>
                    <button class="tooltip-close" type="button" aria-label="닫기">&times;</button>
                </div>
                <div class="tooltip-body">
                    <p class="tooltip-description">${tooltipData.description}</p>
                    ${tooltipData.format ? `<div class="tooltip-format"><strong>형식:</strong> ${tooltipData.format}</div>` : ''}
                    ${tooltipData.example ? `<div class="tooltip-example"><strong>예시:</strong> ${tooltipData.example}</div>` : ''}
                    ${tooltipData.notes ? `<div class="tooltip-notes"><strong>참고:</strong> ${tooltipData.notes}</div>` : ''}
                    ${tooltipData.formula ? `<div class="tooltip-formula"><strong>계산:</strong> ${tooltipData.formula}</div>` : ''}
                </div>
            </div>
        `;

        // body에 팝업 추가
        document.body.appendChild(popup);

        // container에 popup 참조 저장
        container._tooltipPopup = popup;

        return container;
    }

    /**
     * 구조화된 툴팁 데이터 생성
     * @param {Object} config - 필드 설정
     * @returns {Object} 툴팁 데이터
     */
    createTooltipData(config) {
        const data = {
            title: config.label || '도움말',
            description: config.helpText || '추가 정보가 필요합니다.',
            format: null,
            example: null,
            notes: null,
            formula: null
        };

        // 필드 타입별 형식 정보 추가
        if (config.type === 'number') {
            const unit = config.unit || '';
            const min = config.min !== undefined ? config.min : '';
            const max = config.max !== undefined ? config.max : '';
            
            if (min && max) {
                data.format = `숫자 (${min}~${max}${unit})`;
            } else if (min) {
                data.format = `숫자 (${min}${unit} 이상)`;
            } else if (unit) {
                data.format = `숫자 (${unit} 단위)`;
            }
        } else if (config.type === 'text') {
            const maxLength = config.maxLength;
            if (maxLength) {
                data.format = `텍스트 (최대 ${maxLength}자)`;
            }
        } else if (config.type === 'select') {
            data.format = '선택 옵션';
        }

        // 예시 값 추출 (placeholder에서)
        if (config.placeholder) {
            const exampleMatch = config.placeholder.match(/예:\s*(.+)/);
            if (exampleMatch) {
                data.example = exampleMatch[1];
            }
        }

        // 계산 필드인 경우 공식 정보 추가
        if (config.calculated && config.formula) {
            data.formula = this.formatFormula(config.formula, config.dependencies);
            data.notes = '이 값은 다른 필드의 값에 따라 자동으로 계산됩니다.';
        }

        // 필수 필드 정보 추가
        if (config.required) {
            data.notes = (data.notes ? data.notes + ' ' : '') + '필수 입력 항목입니다.';
        }

        return data;
    }

    /**
     * 수식을 사용자 친화적으로 변환
     * @param {string} formula - 원본 수식
     * @param {Array} dependencies - 의존 필드들
     * @returns {string} 변환된 수식
     */
    formatFormula(formula, dependencies) {
        if (!formula) return '';

        // 간단한 수식 변환
        let readable = formula;
        
        // 수학 함수 변환
        readable = readable.replace(/Math\.floor\(/g, '올림(');
        readable = readable.replace(/Math\.round\(/g, '반올림(');
        readable = readable.replace(/\.toFixed\(2\)/g, '');
        
        // 변수명을 한글로 변환
        if (dependencies) {
            dependencies.forEach(dep => {
                readable = readable.replace(new RegExp(dep, 'g'), dep);
            });
        }

        return readable;
    }

    /**
     * 이벤트 리스너 추가
     * @param {HTMLElement} container - 툴팁 컨테이너
     * @param {string} id - 툴팁 ID
     * @param {Object} config - 툴팁 설정
     */
    addEventListeners(container, id, config) {
        const trigger = container.querySelector('.tooltip-trigger');
        const popup = container._tooltipPopup; // body에 있는 팝업 참조
        const closeBtn = popup ? popup.querySelector('.tooltip-close') : null;
        
        if (!trigger || !popup || !closeBtn) {
            return;
        }
        
        // 트리거 요소 스타일 강화 (이벤트 처리 보장)
        trigger.style.pointerEvents = 'auto';
        trigger.style.cursor = 'help';
        trigger.style.zIndex = '1000';

        // 호버 이벤트 (즉시 표시)
        trigger.addEventListener('mouseenter', () => {
            this.show(id);
        });

        trigger.addEventListener('mouseleave', () => {
            // 마우스가 popup으로 이동하는지 확인
            setTimeout(() => {
                if (!popup.matches(':hover') && !trigger.matches(':hover')) {
                    this.hide(id);
                }
            }, 100);
        });

        popup.addEventListener('mouseleave', () => {
            this.hide(id);
        });

        // 클릭 이벤트 (토글)
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle(id);
        });

        // 닫기 버튼
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide(id);
        });
    }

    /**
     * 툴팁 표시
     * @param {string} id - 툴팁 ID
     */
    show(id) {
        // 다른 툴팁 숨기기
        this.hideAll();

        const tooltipData = this.tooltips.get(id);
        if (!tooltipData) {
            return;
        }

        const trigger = tooltipData.element.querySelector('.tooltip-trigger');
        const popup = tooltipData.element._tooltipPopup; // body에 있는 팝업
        
        if (!trigger || !popup) {
            return;
        }
        
        popup.classList.add('show');
        this.activeTooltip = id;

        // 위치 조정 (트리거 기준으로)
        this.positionTooltip(popup, trigger);
    }

    /**
     * 툴팁 숨기기
     * @param {string} id - 툴팁 ID
     */
    hide(id) {
        const tooltipData = this.tooltips.get(id);
        if (!tooltipData) return;

        const popup = tooltipData.element._tooltipPopup; // body에 있는 팝업
        popup.classList.remove('show');
        
        // 위치 관련 클래스들 정리
        popup.classList.remove('align-top', 'align-right', 'align-left');
        
        if (this.activeTooltip === id) {
            this.activeTooltip = null;
        }
    }

    /**
     * 툴팁 토글
     * @param {string} id - 툴팁 ID
     */
    toggle(id) {
        const tooltipData = this.tooltips.get(id);
        if (!tooltipData) return;

        const popup = tooltipData.element._tooltipPopup; // body에 있는 팝업
        if (popup.classList.contains('show')) {
            this.hide(id);
        } else {
            this.show(id);
        }
    }

    /**
     * 모든 툴팁 숨기기
     */
    hideAll() {
        this.tooltips.forEach((data, id) => {
            this.hide(id);
        });
    }

    /**
     * 툴팁 위치 조정
     * @param {HTMLElement} popup - 툴팁 팝업
     * @param {HTMLElement} trigger - 트리거 요소
     */
    positionTooltip(popup, trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // 팝업을 보이지 않게 표시하여 크기 측정
        popup.style.position = 'fixed';
        popup.style.top = '0px';
        popup.style.left = '0px';
        popup.style.visibility = 'hidden';
        popup.style.opacity = '1';
        
        const popupRect = popup.getBoundingClientRect();
        const popupWidth = popupRect.width;
        const popupHeight = popupRect.height;

        // 기본 위치: 트리거 중앙 아래 (8px 간격)
        const triggerCenterX = triggerRect.left + (triggerRect.width / 2);
        const triggerBottom = triggerRect.bottom;
        const triggerTop = triggerRect.top;

        let finalTop = triggerBottom + 8;
        let finalLeft = triggerCenterX - (popupWidth / 2);
        let position = 'bottom'; // 기본: 아래쪽 표시

        // 여백 설정
        const margin = 16;

        // 1. 세로 위치 결정 (위 vs 아래)
        const spaceBelow = viewport.height - triggerBottom;
        const spaceAbove = triggerTop;

        if (spaceBelow < popupHeight + margin && spaceAbove > popupHeight + margin) {
            // 아래쪽 공간이 부족하고 위쪽에 충분한 공간이 있으면 위쪽에 표시
            finalTop = triggerTop - popupHeight - 8;
            position = 'top';
        }

        // 2. 가로 위치 조정
        // 왼쪽 경계 체크
        if (finalLeft < margin) {
            finalLeft = margin;
        }
        
        // 오른쪽 경계 체크
        if (finalLeft + popupWidth > viewport.width - margin) {
            finalLeft = viewport.width - popupWidth - margin;
        }

        // 3. 최종 위치가 화면을 벗어나는 경우 강제 조정
        if (finalLeft < margin) {
            finalLeft = margin;
        }
        if (finalTop < margin) {
            finalTop = margin;
        }
        if (finalTop + popupHeight > viewport.height - margin) {
            finalTop = viewport.height - popupHeight - margin;
        }

        // 4. CSS 클래스 설정
        popup.classList.remove('align-top', 'align-right', 'align-left');
        
        if (position === 'top') {
            popup.classList.add('align-top');
        }

        // 트리거 중앙에서 많이 벗어난 경우 정렬 표시
        const offsetFromCenter = finalLeft + (popupWidth / 2) - triggerCenterX;
        if (Math.abs(offsetFromCenter) > 50) {
            if (offsetFromCenter > 0) {
                popup.classList.add('align-left'); // 팝업이 트리거보다 오른쪽에 있음
            } else {
                popup.classList.add('align-right'); // 팝업이 트리거보다 왼쪽에 있음
            }
        }

        // 5. 최종 위치 적용
        popup.style.position = 'fixed';
        popup.style.top = `${Math.round(finalTop)}px`;
        popup.style.left = `${Math.round(finalLeft)}px`;
        popup.style.visibility = 'visible';
        popup.style.opacity = ''; // 인라인 opacity 제거하여 CSS 클래스가 적용되도록 함
    }

    /**
     * 고유 ID 생성
     * @returns {string} 고유 ID
     */
    generateId() {
        return 'tooltip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 전역 인스턴스 생성
window.Tooltip = new Tooltip(); 