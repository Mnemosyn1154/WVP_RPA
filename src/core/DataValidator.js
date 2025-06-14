/**
 * DataValidator 클래스
 * 투자문서 데이터 유효성 검증
 */

class DataValidator {
    constructor() {
        this.validationRules = null;
        this.loadValidationRules();
    }

    async loadValidationRules() {
        try {
            const response = await fetch('src/config/validation.json');
            this.validationRules = await response.json();
        } catch (error) {
            console.error('검증 규칙 로드 실패:', error);
            this.validationRules = this.getDefaultRules();
        }
    }

    getDefaultRules() {
        return {
            patterns: {
                korean_english: "^[가-힣a-zA-Z\\s]+$",
                number_with_comma: "^[0-9,]+$",
                percentage: "^\\d+(\\.\\d+)?$",
                email: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            },
            ranges: {
                investment_amount: { min: 1000000, max: 100000000000 },
                percentage: { min: 0, max: 100 },
                interest_rate: { min: 0, max: 50 }
            },
            business_logic: {
                post_money_calculation: "투자후가치 = 투자전가치 + 투자금액",
                ownership_calculation: "지분율 = 투자금액 / 투자후가치 * 100"
            }
        };
    }

    validateField(fieldName, value, context = {}) {
        if (!this.validationRules) {
            return { isValid: true };
        }

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

        // 패턴 검증
        this.validatePattern(fieldName, value, result);

        // 범위 검증
        this.validateRange(fieldName, value, result);

        // 비즈니스 로직 검증
        this.validateBusinessLogic(fieldName, value, context, result);

        return result;
    }

    validatePattern(fieldName, value, result) {
        const patterns = this.validationRules.patterns;
        
        switch (fieldName) {
            case '투자대상':
            case '대표자':
            case '담당자투자총괄':
                if (!this.testPattern(value, patterns.korean_english)) {
                    result.isValid = false;
                    result.errors.push('한글과 영문만 입력 가능합니다.');
                }
                break;
                
            case '투자금액':
            case '투자전가치':
            case '투자후가치':
            case '투자단가':
            case '액면가':
                const numericValue = this.parseNumber(value);
                if (isNaN(numericValue)) {
                    result.isValid = false;
                    result.errors.push('숫자만 입력 가능합니다.');
                }
                break;
                
            case '지분율':
            case '상환이자':
            case '잔여분배이자':
            case '주매청이자':
            case '배당률':
            case '위약벌':
                if (!this.testPattern(value.toString(), patterns.percentage)) {
                    result.isValid = false;
                    result.errors.push('올바른 퍼센트 형식이 아닙니다.');
                }
                break;
        }
    }

    validateRange(fieldName, value, result) {
        const ranges = this.validationRules.ranges;
        const numericValue = this.parseNumber(value);
        
        if (isNaN(numericValue)) return;

        switch (fieldName) {
            case '투자금액':
                if (!this.isInRange(numericValue, ranges.investment_amount)) {
                    result.isValid = false;
                    result.errors.push(`투자금액은 ${this.formatNumber(ranges.investment_amount.min)}원 이상 ${this.formatNumber(ranges.investment_amount.max)}원 이하여야 합니다.`);
                }
                break;
                
            case '지분율':
            case '상환이자':
            case '잔여분배이자':
            case '주매청이자':
            case '배당률':
            case '위약벌':
                if (!this.isInRange(numericValue, ranges.percentage)) {
                    result.isValid = false;
                    result.errors.push('0% 이상 100% 이하의 값을 입력해주세요.');
                }
                break;
        }
    }

    validateBusinessLogic(fieldName, value, context, result) {
        const numericValue = this.parseNumber(value);
        
        // 투자후가치 = 투자전가치 + 투자금액
        if (fieldName === '투자후가치' && context.투자전가치 && context.투자금액) {
            const expectedValue = this.parseNumber(context.투자전가치) + this.parseNumber(context.투자금액);
            if (Math.abs(numericValue - expectedValue) > 1000) {
                result.warnings.push('투자후가치가 투자전가치 + 투자금액과 일치하지 않습니다.');
            }
        }

        // 지분율 = 투자금액 / 투자후가치 * 100
        if (fieldName === '지분율' && context.투자금액 && context.투자후가치) {
            const expectedValue = (this.parseNumber(context.투자금액) / this.parseNumber(context.투자후가치)) * 100;
            if (Math.abs(numericValue - expectedValue) > 0.1) {
                result.warnings.push('지분율이 계산값과 일치하지 않습니다.');
            }
        }

        // 인수주식수 = 투자금액 / 투자단가
        if (fieldName === '인수주식수' && context.투자금액 && context.투자단가) {
            const expectedValue = this.parseNumber(context.투자금액) / this.parseNumber(context.투자단가);
            if (Math.abs(numericValue - expectedValue) > 1) {
                result.warnings.push('인수주식수가 계산값과 일치하지 않습니다.');
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

    testPattern(value, pattern) {
        try {
            const regex = new RegExp(pattern);
            return regex.test(value);
        } catch (error) {
            console.error('패턴 검증 오류:', error);
            return true;
        }
    }

    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            return parseFloat(value.replace(/,/g, ''));
        }
        return NaN;
    }

    isInRange(value, range) {
        return value >= range.min && value <= range.max;
    }

    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(number);
    }
}

window.DataValidator = new DataValidator(); 