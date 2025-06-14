/**
 * DataValidator 클래스
 * 투자문서 데이터 유효성 검증
 */

class DataValidator {
    constructor(validationConfig = null) {
        this.validationRules = null;
        this.isLoaded = false;
        
        if (validationConfig) {
            this.validationRules = validationConfig;
            this.isLoaded = true;
        }
    }

    async initialize() {
        if (!this.isLoaded) {
            await this.loadValidationRules();
        }
        return this;
    }

    async loadValidationRules() {
        try {
            const response = await fetch('/src/config/validation.json');
            if (response.ok) {
                this.validationRules = await response.json();
                this.isLoaded = true;
                console.log('유효성 검사 규칙이 로드되었습니다.');
            } else {
                console.warn('유효성 검사 규칙을 로드할 수 없습니다. 기본 규칙을 사용합니다.');
                this.validationRules = this.getDefaultRules();
                this.isLoaded = true;
            }
        } catch (error) {
            console.error('유효성 검사 규칙 로드 중 오류:', error);
            this.validationRules = this.getDefaultRules();
            this.isLoaded = true;
        }
    }

    getDefaultRules() {
        return {
            // 기본 규칙은 최소한으로 유지
            basic: {
                number_format: "숫자 형식만 검증"
            }
        };
    }

    validateField(fieldName, value, context = {}) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // 필수 필드 검증
        if (this.isRequired(fieldName) && this.isEmpty(value)) {
            result.isValid = false;
            result.errors.push(`${fieldName}은(는) 필수 입력 항목입니다.`);
            return result;
        }

        // 빈 값이면 추가 검증 생략
        if (this.isEmpty(value)) {
            return result;
        }

        // 숫자 필드에 대한 기본적인 형식 검증만 수행
        this.validateBasicFormat(fieldName, value, result);

        return result;
    }

    validateBasicFormat(fieldName, value, result) {
        // 숫자 필드인 경우 기본적인 숫자 형식만 검증
        const numericFields = [
            '투자금액', '투자전가치', '투자후가치', '투자단가', '액면가',
            '지분율', '상환이자', '잔여분배이자', '주매청이자', '배당률', '위약벌', '인수주식수'
        ];
        
        if (numericFields.includes(fieldName)) {
            const numericValue = this.parseNumber(value);
            if (isNaN(numericValue)) {
                result.isValid = false;
                result.errors.push('올바른 숫자 형식이 아닙니다.');
            }
        }
    }

    validateAllFields(data) {
        const results = {};
        let hasErrors = false;

        for (const [fieldName, value] of Object.entries(data)) {
            const result = this.validateField(fieldName, value, data);
            results[fieldName] = result;
            
            if (!result.isValid) {
                hasErrors = true;
            }
        }

        return {
            isValid: !hasErrors,
            fieldResults: results,
            summary: this.generateValidationSummary(results)
        };
    }

    generateValidationSummary(results) {
        const summary = {
            totalFields: Object.keys(results).length,
            validFields: 0,
            invalidFields: 0,
            warnings: 0,
            errors: []
        };

        for (const [fieldName, result] of Object.entries(results)) {
            if (result.isValid) {
                summary.validFields++;
            } else {
                summary.invalidFields++;
                summary.errors.push(...result.errors.map(error => `${fieldName}: ${error}`));
            }
            
            summary.warnings += result.warnings.length;
        }

        return summary;
    }

    // 유틸리티 메서드들
    isRequired(fieldName) {
        const requiredFields = [
            '투자대상', '대표자', '투자금액', '투자방식', '투자단가', 
            '액면가', '투자전가치', '투자후가치', '담당자투자총괄'
        ];
        return requiredFields.includes(fieldName);
    }

    isEmpty(value) {
        return value === null || value === undefined || value === '';
    }

    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            return parseFloat(value.replace(/,/g, ''));
        }
        return NaN;
    }

    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(number);
    }
}

window.DataValidator = new DataValidator(); 