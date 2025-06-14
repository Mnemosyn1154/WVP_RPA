/**
 * FormField 컴포넌트
 * 폼 필드 생성 및 관리
 */

class FormField {
    constructor() {
        this.fields = new Map();
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
        
        field.innerHTML = `
            <label class="form-field-label" for="${id}">
                ${config.label}${required}
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
                return `<input type="number" ${commonAttrs} 
                    ${config.min !== undefined ? `min="${config.min}"` : ''}
                    ${config.max !== undefined ? `max="${config.max}"` : ''}
                    ${config.step !== undefined ? `step="${config.step}"` : ''}
                    value="${config.value || ''}"
                />`;
            
            default:
                return `<input type="${config.type || 'text'}" ${commonAttrs} value="${config.value || ''}"/>`;
        }
    }

    addEventListeners(fieldElement, fieldId, config) {
        const input = fieldElement.querySelector('.form-field-input');
        
        // 값 변경 이벤트
        input.addEventListener('input', (e) => {
            this.validateField(fieldId);
            if (config.onChange) {
                config.onChange(e.target.value, fieldId);
            }
        });

        // 포커스 이벤트
        input.addEventListener('focus', () => {
            fieldElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            fieldElement.classList.remove('focused');
            this.validateField(fieldId);
        });
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
}

window.FormField = new FormField(); 