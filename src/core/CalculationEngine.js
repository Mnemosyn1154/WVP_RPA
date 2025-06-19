/**
 * CalculationEngine 클래스
 * 투자 관련 자동 계산 엔진
 */

class CalculationEngine {
    constructor() {
        this.currencyManager = window.CurrencyManager;
        this.calculationRules = {
            // 지분율 = 투자금액 / 투자후가치 * 100
            '지분율': (data) => {
                const investment = this.parseNumber(data.투자금액);
                const postMoney = this.parseNumber(data.투자후가치);
                return (investment / postMoney) * 100;
            },
            
            // 인수주식수 = 투자금액(억원) * 100,000,000 / 투자단가(원)
            '인수주식수': (data) => {
                const investmentInEok = this.parseNumber(data.투자금액);
                const pricePerShare = this.parseNumber(data.투자단가);
                
                // 억원을 원으로 변환하여 계산
                const investmentInWon = investmentInEok * 100000000;
                return Math.floor(investmentInWon / pricePerShare);
            }
        };
        
        // 화폐 변경 이벤트 리스너 등록
        document.addEventListener('currencyChanged', (e) => {
            this.onCurrencyChanged(e.detail);
        });
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
            // 쉼표와 공백 제거 후 숫자로 변환
            const cleanValue = value.replace(/[,\s]/g, '');
            return parseFloat(cleanValue) || 0;
        }
        return 0;
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
            '지분율': 0.01,          // 0.01%
            '인수주식수': 1          // 1주
        };
        
        return tolerances[fieldName] || 0;
    }

    /**
     * 화폐 변경 시 처리
     * @param {Object} currencyInfo - 화폐 변경 정보
     */
    onCurrencyChanged(currencyInfo) {
        console.log('💱 CalculationEngine: 화폐 변경 감지', currencyInfo);
        
        // 화폐 변경 시 계산 규칙 업데이트
        this.updateCalculationRules(currencyInfo.newCurrency);
        
        // 화폐 변경 이벤트 발생
        const event = new CustomEvent('calculationRulesUpdated', {
            detail: { currency: currencyInfo.newCurrency }
        });
        document.dispatchEvent(event);
    }

    /**
     * 화폐에 따른 계산 규칙 업데이트
     * @param {string} currencyCode - 화폐 코드
     */
    updateCalculationRules(currencyCode) {
        const currency = this.currencyManager?.getCurrentCurrency();
        if (!currency) return;

        // 인수주식수 계산 규칙을 화폐에 맞게 업데이트
        this.calculationRules['인수주식수'] = (data) => {
            const investmentInDisplayUnit = this.parseNumber(data.투자금액);
            const pricePerShare = this.parseNumber(data.투자단가);
            
            // 표시 단위를 기본 단위로 변환하여 계산
            const investmentInBaseUnit = investmentInDisplayUnit * currency.multiplier;
            return Math.floor(investmentInBaseUnit / pricePerShare);
        };
    }

    /**
     * 화폐 단위를 고려한 값 포맷팅
     * @param {number} value - 포맷할 값
     * @param {string} fieldName - 필드명
     * @returns {string} 포맷된 값
     */
    formatCurrencyValue(value, fieldName) {
        if (!this.currencyManager) {
            return this.formatNumber(value);
        }

        // 화폐 관련 필드인지 확인
        const currencyFields = ['투자금액', '투자전가치', '투자후가치'];
        if (currencyFields.includes(fieldName)) {
            return this.currencyManager.formatValue(value);
        }

        return this.formatNumber(value);
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