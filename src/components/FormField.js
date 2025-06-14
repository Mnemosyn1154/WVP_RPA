/**
 * FormField 컴포넌트
 * 폼 필드 생성 및 관리
 */

class FormField {
    constructor() {
        this.fields = new Map();
        this.currencyManager = window.CurrencyManager;
        
        // 화폐 변경 이벤트 리스너
        document.addEventListener('currencyChanged', (e) => {
            this.onCurrencyChanged(e.detail);
        });
    }

    create(config) {
        const fieldId = this.generateId();
        const fieldElement = this.createFieldElement(fieldId, config);
        
        this.fields.set(fieldId, { element: fieldElement, config });
        this.addEventListeners(fieldElement, fieldId, config);
        
        return fieldElement;
    }

    createFieldElement(id, config) {
        const field = document.createElement('div');
        field.className = 'form-field';
        field.setAttribute('data-field-id', id);

        const required = config.required ? '<span class="form-field-required">*</span>' : '';
        const unitDisplay = this.getUnitDisplay(config);
        
        field.innerHTML = `
            <label class="form-field-label" for="${id}">
                ${config.label}${required}
                ${unitDisplay ? `<span class="form-field-unit">(${unitDisplay})</span>` : ''}
            </label>
            ${this.createInput(id, config)}
            ${config.help ? `<div class="form-field-help">${config.help}</div>` : ''}
            <div class="form-field-error"></div>
        `;

        return field;
    }

    createInput(id, config) {
        const commonAttrs = `
            id="${id}"
            name="${config.name || id}"
            class="form-field-input"
            ${config.placeholder ? `placeholder="${config.placeholder}"` : ''}
            ${config.required ? 'required' : ''}
            ${config.disabled ? 'disabled' : ''}
        `;

        switch (config.type) {
            case 'textarea':
                return `<textarea ${commonAttrs} rows="${config.rows || 3}">${config.value || ''}</textarea>`;
            
            case 'select':
                const options = config.options.map(opt => 
                    `<option value="${opt.value}" ${opt.value === config.value ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                return `<select ${commonAttrs}>${options}</select>`;
            
            case 'number':
                // 모든 숫자 필드는 text 타입으로 처리 (쉼표 포맷팅 지원)
                return `<input type="text" ${commonAttrs} 
                    inputmode="numeric"
                    pattern="[0-9,.-]*"
                    value="${config.value || ''}"
                />`;
            
            default:
                return `<input type="${config.type || 'text'}" ${commonAttrs} value="${config.value || ''}"/>`;
        }
    }

    addEventListeners(fieldElement, fieldId, config) {
        const input = fieldElement.querySelector('.form-field-input');
        
        // 숫자 필드인지 확인
        const isNumberField = config.type === 'number';
        
        // 값 변경 이벤트
        input.addEventListener('input', (e) => {
            // 숫자 필드의 경우 실시간 포맷팅 적용
            if (isNumberField) {
                // 디바운스를 사용하여 너무 빈번한 포맷팅 방지
                clearTimeout(this.formatTimeout);
                this.formatTimeout = setTimeout(() => {
                    this.formatNumberInput(e.target, config);
                }, 100);
            }
            
            this.validateField(fieldId);
            if (config.onChange) {
                config.onChange(e.target.value, fieldId);
            }
        });

        // 포커스 이벤트
        input.addEventListener('focus', (e) => {
            fieldElement.classList.add('focused');
            
            // 숫자 필드의 경우 포커스 시 쉼표 제거 (편집 모드)
            if (isNumberField) {
                this.unformatNumberInput(e.target);
            }
        });

        input.addEventListener('blur', (e) => {
            fieldElement.classList.remove('focused');
            
            // 숫자 필드의 경우 블러 시 쉼표 추가 (표시 모드)
            if (isNumberField) {
                this.formatNumberInput(e.target, config);
            }
            
            this.validateField(fieldId);
        });

        // 키보드 이벤트 (숫자 필드만)
        if (isNumberField) {
            input.addEventListener('keydown', (e) => {
                this.handleNumberKeydown(e);
            });
        }
    }

    validateField(fieldId) {
        const fieldData = this.fields.get(fieldId);
        if (!fieldData) return true;

        const { element, config } = fieldData;
        const input = element.querySelector('.form-field-input');
        const errorElement = element.querySelector('.form-field-error');
        
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        


        // 필수 필드 검증
        if (config.required && !value) {
            isValid = false;
            errorMessage = `${config.label}은(는) 필수 입력 항목입니다.`;
        }

        // 숫자 필드 특별 검증
        if (isValid && config.type === 'number' && value) {
            const numericValue = this.parseNumberValue(value, config);
            
            // 숫자 형식 검증
            if (isNaN(numericValue)) {
                isValid = false;
                errorMessage = '올바른 숫자를 입력해주세요.';
            } else {
                // 범위 검증 (화폐 필드는 CurrencyManager 범위 사용, 일반 숫자 필드는 config 범위 사용)
                let range = null;
                if (config.currencyField && config.fieldType && this.currencyManager) {
                    range = this.currencyManager.getFieldRange(config.fieldType);
                } else if (config.min !== undefined || config.max !== undefined) {
                    range = {
                        min: config.min !== undefined ? config.min : 0,
                        max: config.max !== undefined ? config.max : Number.MAX_SAFE_INTEGER
                    };
                }
                
                if (range && (numericValue < range.min || numericValue > range.max)) {
                    isValid = false;
                    errorMessage = `${range.min.toLocaleString()}~${range.max.toLocaleString()} 범위의 값을 입력해주세요.`;
                }
            }
        }

        // 커스텀 검증
        if (isValid && config.validate && typeof config.validate === 'function') {
            const result = config.validate(value);
            if (result !== true) {
                isValid = false;
                errorMessage = result || '유효하지 않은 값입니다.';
            }
        }

        // UI 업데이트
        element.classList.toggle('error', !isValid);
        input.classList.toggle('error', !isValid);
        input.classList.toggle('success', isValid && value);
        errorElement.textContent = errorMessage;

        return isValid;
    }

    getValue(fieldId) {
        const fieldData = this.fields.get(fieldId);
        if (!fieldData) return null;

        const input = fieldData.element.querySelector('.form-field-input');
        return input.value;
    }

    setValue(fieldId, value) {
        const fieldData = this.fields.get(fieldId);
        if (!fieldData) return false;

        const input = fieldData.element.querySelector('.form-field-input');
        input.value = value;
        this.validateField(fieldId);
        return true;
    }

    generateId() {
        return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 화폐 변경 시 처리
     * @param {Object} currencyInfo - 화폐 변경 정보
     */
    onCurrencyChanged(currencyInfo) {
        console.log('💱 FormField: 화폐 변경 감지', currencyInfo);
        
        // 모든 화폐 관련 필드 업데이트
        this.fields.forEach((fieldData, fieldId) => {
            if (fieldData.config.currencyField) {
                this.updateCurrencyField(fieldId, fieldData);
            }
        });
    }

    /**
     * 화폐 필드 업데이트
     * @param {string} fieldId - 필드 ID
     * @param {Object} fieldData - 필드 데이터
     */
    updateCurrencyField(fieldId, fieldData) {
        const { element, config } = fieldData;
        const unitSpan = element.querySelector('.form-field-unit');
        const input = element.querySelector('.form-field-input');
        
        // 단위 표시 업데이트
        if (unitSpan) {
            const newUnit = this.getUnitDisplay(config);
            unitSpan.textContent = newUnit ? `(${newUnit})` : '';
        }
        
        // 입력 필드 범위 업데이트
        if (config.fieldType && this.currencyManager) {
            const range = this.currencyManager.getFieldRange(config.fieldType);
            input.setAttribute('min', range.min);
            input.setAttribute('max', range.max);
        }
        
        // placeholder 업데이트
        if (config.currencyField && this.currencyManager) {
            const currency = this.currencyManager.getCurrentCurrency();
            if (currency && config.fieldType === 'investment_amount') {
                input.setAttribute('placeholder', `예: 10 (10${currency.unit})`);
            } else if (currency && config.fieldType === 'company_valuation') {
                input.setAttribute('placeholder', `예: 100 (100${currency.unit})`);
            }
        }
    }

    /**
     * 필드의 단위 표시 반환
     * @param {Object} config - 필드 설정
     * @returns {string} 단위 표시
     */
    getUnitDisplay(config) {
        if (config.currencyField && this.currencyManager) {
            const currency = this.currencyManager.getCurrentCurrency();
            return currency ? currency.unit : config.unit;
        }
        return config.unit;
    }

    /**
     * 화폐 값 포맷팅
     * @param {number} value - 포맷할 값
     * @param {Object} config - 필드 설정
     * @returns {string} 포맷된 값
     */
    formatCurrencyValue(value, config) {
        if (config.currencyField && this.currencyManager) {
            return this.currencyManager.formatValue(value, false); // 단위 제외
        }
        return value.toString();
    }

    /**
     * 화폐 값 파싱
     * @param {string} value - 파싱할 값
     * @param {Object} config - 필드 설정
     * @returns {number} 파싱된 값
     */
    parseCurrencyValue(value, config) {
        if (config.currencyField && this.currencyManager) {
            // 쉼표 제거 후 숫자로 변환
            return parseFloat(value.replace(/,/g, '')) || 0;
        }
        return parseFloat(value) || 0;
    }

    /**
     * 화폐 입력 필드 포맷팅 (쉼표 추가)
     * @param {HTMLInputElement} input - 입력 필드
     * @param {Object} config - 필드 설정
     */
    formatCurrencyInput(input, config) {
        if (!config.currencyField) return;

        const value = input.value.replace(/[^0-9.]/g, ''); // 숫자와 소수점만 추출
        
        // 빈 값이거나 숫자가 아닌 경우 처리하지 않음
        if (value === '' || isNaN(value)) return;

        const numericValue = parseFloat(value);
        let formattedValue;
        
        // 소수점이 있는 경우와 없는 경우 구분
        if (value.includes('.')) {
            const parts = value.split('.');
            const integerPart = parseInt(parts[0], 10) || 0;
            const decimalPart = parts[1] || '';
            formattedValue = integerPart.toLocaleString('ko-KR') + '.' + decimalPart;
        } else {
            formattedValue = parseInt(value, 10).toLocaleString('ko-KR');
        }
        
        // 커서 위치 보존
        const cursorPosition = input.selectionStart;
        const oldLength = input.value.length;
        
        input.value = formattedValue;
        
        // 커서 위치 조정 (쉼표 추가로 인한 위치 변화 보정)
        const newLength = formattedValue.length;
        const lengthDiff = newLength - oldLength;
        let newCursorPosition = cursorPosition + lengthDiff;
        
        // 커서 위치가 범위를 벗어나지 않도록 조정
        newCursorPosition = Math.max(0, Math.min(newCursorPosition, newLength));
        
        // 커서 위치 복원
        setTimeout(() => {
            if (input === document.activeElement) {
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);
    }

    /**
     * 화폐 입력 필드 언포맷팅 (쉼표 제거)
     * @param {HTMLInputElement} input - 입력 필드
     */
    unformatCurrencyInput(input) {
        const value = input.value.replace(/,/g, '');
        input.value = value;
    }

    /**
     * 화폐 필드 키보드 이벤트 처리
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleCurrencyKeydown(e) {
        const input = e.target;
        const key = e.key;
        
        // 허용되는 키들: 숫자, 소수점, 백스페이스, 삭제, 화살표, 탭, 엔터
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', '.'
        ];
        
        // 숫자 키 (0-9)
        const isNumber = /^[0-9]$/.test(key);
        
        // Ctrl/Cmd + A, C, V, X (전체선택, 복사, 붙여넣기, 잘라내기)
        const isCtrlKey = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase());
        
        // 소수점 중복 입력 방지
        if (key === '.' && input.value.includes('.')) {
            e.preventDefault();
            return;
        }
        
        // 허용되지 않는 키 입력 방지
        if (!isNumber && !allowedKeys.includes(key) && !isCtrlKey) {
            e.preventDefault();
            return;
        }
        
        // 붙여넣기 처리
        if (isCtrlKey && key.toLowerCase() === 'v') {
            setTimeout(() => {
                // 붙여넣기 후 포맷팅 적용
                const value = input.value.replace(/[^0-9.]/g, ''); // 숫자와 소수점만 추출
                input.value = value;
                this.formatCurrencyInput(input, { currencyField: true });
            }, 0);
        }
    }

    /**
     * 숫자 값 파싱 (일반 숫자 필드용)
     * @param {string} value - 파싱할 값
     * @param {Object} config - 필드 설정
     * @returns {number} 파싱된 값
     */
    parseNumberValue(value, config) {
        if (config.currencyField && this.currencyManager) {
            // 화폐 필드는 기존 메서드 사용
            return this.parseCurrencyValue(value, config);
        }
        // 일반 숫자 필드: 쉼표 제거 후 숫자로 변환
        return parseFloat(value.replace(/,/g, '')) || 0;
    }

    /**
     * 숫자 입력 필드 포맷팅 (쉼표 추가) - 모든 숫자 필드용
     * @param {HTMLInputElement} input - 입력 필드
     * @param {Object} config - 필드 설정
     */
    formatNumberInput(input, config) {
        // 화폐 필드는 기존 메서드 사용
        if (config.currencyField) {
            this.formatCurrencyInput(input, config);
            return;
        }

        const value = input.value.replace(/[^0-9.]/g, ''); // 숫자와 소수점만 추출
        
        // 빈 값이거나 숫자가 아닌 경우 처리하지 않음
        if (value === '' || isNaN(value)) return;

        const numericValue = parseFloat(value);
        let formattedValue;
        
        // 소수점이 있는 경우와 없는 경우 구분
        if (value.includes('.')) {
            const parts = value.split('.');
            const integerPart = parseInt(parts[0], 10) || 0;
            const decimalPart = parts[1] || '';
            formattedValue = integerPart.toLocaleString('ko-KR') + '.' + decimalPart;
        } else {
            formattedValue = parseInt(value, 10).toLocaleString('ko-KR');
        }
        
        // 커서 위치 보존
        const cursorPosition = input.selectionStart;
        const oldLength = input.value.length;
        
        input.value = formattedValue;
        
        // 커서 위치 조정 (쉼표 추가로 인한 위치 변화 보정)
        const newLength = formattedValue.length;
        const lengthDiff = newLength - oldLength;
        let newCursorPosition = cursorPosition + lengthDiff;
        
        // 커서 위치가 범위를 벗어나지 않도록 조정
        newCursorPosition = Math.max(0, Math.min(newCursorPosition, newLength));
        
        // 커서 위치 복원
        setTimeout(() => {
            if (input === document.activeElement) {
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);
    }

    /**
     * 숫자 입력 필드 언포맷팅 (쉼표 제거) - 모든 숫자 필드용
     * @param {HTMLInputElement} input - 입력 필드
     */
    unformatNumberInput(input) {
        const value = input.value.replace(/,/g, '');
        input.value = value;
    }

    /**
     * 숫자 필드 키보드 이벤트 처리 - 모든 숫자 필드용
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleNumberKeydown(e) {
        const input = e.target;
        const key = e.key;
        
        // 허용되는 키들: 숫자, 소수점, 백스페이스, 삭제, 화살표, 탭, 엔터
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', '.'
        ];
        
        // 숫자 키 (0-9)
        const isNumber = /^[0-9]$/.test(key);
        
        // Ctrl/Cmd + A, C, V, X (전체선택, 복사, 붙여넣기, 잘라내기)
        const isCtrlKey = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase());
        
        // 소수점 중복 입력 방지
        if (key === '.' && input.value.includes('.')) {
            e.preventDefault();
            return;
        }
        
        // 허용되지 않는 키 입력 방지
        if (!isNumber && !allowedKeys.includes(key) && !isCtrlKey) {
            e.preventDefault();
            return;
        }
        
        // 붙여넣기 처리
        if (isCtrlKey && key.toLowerCase() === 'v') {
            setTimeout(() => {
                // 붙여넣기 후 포맷팅 적용
                const value = input.value.replace(/[^0-9.]/g, ''); // 숫자와 소수점만 추출
                input.value = value;
                this.formatNumberInput(input, { currencyField: false });
            }, 0);
        }
    }
}

window.FormField = new FormField(); 