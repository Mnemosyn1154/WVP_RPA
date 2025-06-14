/**
 * CalculationEngine 클래스
 * 투자 관련 자동 계산 엔진
 */

class CalculationEngine {
    constructor() {
        this.calculationRules = {
            // 투자후가치 = 투자전가치 + 투자금액
            '투자후가치': (data) => {
                const preMoney = this.parseNumber(data.투자전가치);
                const investment = this.parseNumber(data.투자금액);
                return preMoney + investment;
            },
            
            // 지분율 = 투자금액 / 투자후가치 * 100
            '지분율': (data) => {
                const investment = this.parseNumber(data.투자금액);
                const postMoney = this.parseNumber(data.투자후가치);
                return (investment / postMoney) * 100;
            },
            
            // 인수주식수 = 투자금액 / 투자단가
            '인수주식수': (data) => {
                const investment = this.parseNumber(data.투자금액);
                const pricePerShare = this.parseNumber(data.투자단가);
                return Math.floor(investment / pricePerShare);
            }
        };
    }

    /**
     * 특정 필드 자동 계산
     * @param {string} fieldName - 계산할 필드명
     * @param {Object} data - 전체 데이터
     * @returns {number|null} 계산 결과
     */
    calculate(fieldName, data) {
        const rule = this.calculationRules[fieldName];
        if (!rule) return null;

        try {
            const result = rule(data);
            return isNaN(result) ? null : result;
        } catch (error) {
            console.error(`계산 오류 (${fieldName}):`, error);
            return null;
        }
    }

    /**
     * 모든 자동 계산 필드 업데이트
     * @param {Object} data - 전체 데이터
     * @returns {Object} 업데이트된 데이터
     */
    calculateAll(data) {
        const updatedData = { ...data };
        
        for (const fieldName of Object.keys(this.calculationRules)) {
            const calculatedValue = this.calculate(fieldName, updatedData);
            if (calculatedValue !== null) {
                updatedData[fieldName] = calculatedValue;
            }
        }
        
        return updatedData;
    }

    /**
     * 계산 가능한 필드 목록 반환
     * @returns {Array<string>} 계산 가능한 필드명 배열
     */
    getCalculableFields() {
        return Object.keys(this.calculationRules);
    }

    /**
     * 특정 필드가 계산 가능한지 확인
     * @param {string} fieldName - 필드명
     * @returns {boolean} 계산 가능 여부
     */
    isCalculable(fieldName) {
        return this.calculationRules.hasOwnProperty(fieldName);
    }

    /**
     * 계산에 필요한 의존 필드들 반환
     * @param {string} fieldName - 계산할 필드명
     * @returns {Array<string>} 의존 필드명 배열
     */
    getDependencies(fieldName) {
        const dependencies = {
            '투자후가치': ['투자전가치', '투자금액'],
            '지분율': ['투자금액', '투자후가치'],
            '인수주식수': ['투자금액', '투자단가']
        };
        
        return dependencies[fieldName] || [];
    }

    /**
     * 계산 가능 여부 확인 (의존 필드 값 존재 여부)
     * @param {string} fieldName - 계산할 필드명
     * @param {Object} data - 데이터
     * @returns {boolean} 계산 가능 여부
     */
    canCalculate(fieldName, data) {
        const dependencies = this.getDependencies(fieldName);
        
        return dependencies.every(dep => {
            const value = data[dep];
            return value !== null && value !== undefined && value !== '';
        });
    }

    /**
     * 숫자 파싱 유틸리티
     * @param {any} value - 파싱할 값
     * @returns {number} 파싱된 숫자
     */
    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            return parseFloat(value.replace(/,/g, ''));
        }
        return NaN;
    }

    /**
     * 숫자 포맷팅 유틸리티
     * @param {number} number - 포맷할 숫자
     * @param {Object} options - 포맷 옵션
     * @returns {string} 포맷된 문자열
     */
    formatNumber(number, options = {}) {
        const defaults = {
            locale: 'ko-KR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const config = { ...defaults, ...options };
        
        return new Intl.NumberFormat(config.locale, {
            minimumFractionDigits: config.minimumFractionDigits,
            maximumFractionDigits: config.maximumFractionDigits
        }).format(number);
    }

    /**
     * 퍼센트 포맷팅
     * @param {number} number - 포맷할 숫자
     * @param {number} decimals - 소수점 자릿수
     * @returns {string} 포맷된 퍼센트 문자열
     */
    formatPercentage(number, decimals = 2) {
        return number.toFixed(decimals) + '%';
    }

    /**
     * 계산 결과 검증
     * @param {string} fieldName - 필드명
     * @param {number} calculatedValue - 계산된 값
     * @param {number} inputValue - 입력된 값
     * @returns {Object} 검증 결과
     */
    validateCalculation(fieldName, calculatedValue, inputValue) {
        const tolerance = this.getTolerance(fieldName);
        const difference = Math.abs(calculatedValue - inputValue);
        
        return {
            isAccurate: difference <= tolerance,
            difference: difference,
            tolerance: tolerance,
            suggestion: calculatedValue
        };
    }

    /**
     * 필드별 허용 오차 반환
     * @param {string} fieldName - 필드명
     * @returns {number} 허용 오차
     */
    getTolerance(fieldName) {
        const tolerances = {
            '투자후가치': 1000,      // 1천원
            '지분율': 0.01,          // 0.01%
            '인수주식수': 1          // 1주
        };
        
        return tolerances[fieldName] || 0;
    }

    /**
     * 계산 히스토리 추적
     * @param {string} fieldName - 필드명
     * @param {Object} data - 데이터
     * @param {number} result - 계산 결과
     */
    logCalculation(fieldName, data, result) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            field: fieldName,
            inputs: this.getDependencies(fieldName).reduce((acc, dep) => {
                acc[dep] = data[dep];
                return acc;
            }, {}),
            result: result
        };
        
        console.log('계산 로그:', logEntry);
    }
}

window.CalculationEngine = new CalculationEngine(); 