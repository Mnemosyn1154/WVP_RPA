/**
 * CurrencyManager 클래스
 * 다중 화폐 지원 및 환율 변환 관리
 */

class CurrencyManager {
    constructor() {
        this.currencies = null;
        this.currentCurrency = 'KRW';
        this.exchangeRates = null;
        this.loadCurrencyConfig();
    }

    async loadCurrencyConfig() {
        try {
            const response = await fetch('src/config/currencies.json');
            const config = await response.json();
            
            this.currencies = config.currencies;
            this.currentCurrency = config.defaultCurrency;
            this.exchangeRates = config.exchangeRates;
            
            console.log('💱 CurrencyManager 초기화 완료');
            
            // 화폐 변경 이벤트 발생
            this.dispatchCurrencyChangeEvent();
            
        } catch (error) {
            console.error('화폐 설정 로드 실패:', error);
            this.setDefaultConfig();
        }
    }

    setDefaultConfig() {
        this.currencies = {
            'KRW': {
                code: 'KRW',
                name: '한국 원',
                symbol: '₩',
                units: {
                    base: {
                        unit: '원',
                        suffix: '원',
                        multiplier: 1,
                        format: {
                            prefix: '',
                            suffix: '원',
                            separator: ',',
                            decimal: '.'
                        }
                    },
                    large: {
                        unit: '억원',
                        suffix: '억원',
                        multiplier: 100000000,
                        format: {
                            prefix: '',
                            suffix: '억원',
                            separator: ',',
                            decimal: '.'
                        }
                    }
                },
                decimalPlaces: 0
            }
        };
        this.currentCurrency = 'KRW';
    }

    /**
     * 현재 화폐 설정
     * @param {string} currencyCode - 화폐 코드 (KRW, USD, EUR 등)
     */
    setCurrency(currencyCode) {
        if (!this.currencies[currencyCode]) {
            console.warn(`지원하지 않는 화폐: ${currencyCode}`);
            return false;
        }

        const oldCurrency = this.currentCurrency;
        this.currentCurrency = currencyCode;
        
        console.log(`💱 화폐 변경: ${oldCurrency} → ${currencyCode}`);
        
        // 화폐 변경 이벤트 발생
        this.dispatchCurrencyChangeEvent(oldCurrency);
        
        return true;
    }

    /**
     * 현재 화폐 정보 반환
     */
    getCurrentCurrency() {
        return this.currencies[this.currentCurrency];
    }

    /**
     * 지원하는 모든 화폐 목록 반환
     */
    getSupportedCurrencies() {
        return Object.values(this.currencies);
    }

    /**
     * 값을 현재 화폐 형식으로 포맷팅
     * @param {number} value - 포맷팅할 값 (표시 단위 기준)
     * @param {string} fieldType - 필드 타입 (investment_amount, price_per_share 등)
     * @param {boolean} includeUnit - 단위 포함 여부
     */
    formatValue(value, fieldType = 'investment_amount', includeUnit = true) {
        const currency = this.getCurrentCurrency();
        if (!currency) return value.toString();

        const unitInfo = this.getUnitForField(fieldType);
        const formattedNumber = this.formatNumber(value, currency.decimalPlaces);
        
        let result = formattedNumber;
        
        if (unitInfo.format.prefix) {
            result = unitInfo.format.prefix + result;
        }
        
        if (includeUnit && unitInfo.format.suffix) {
            result = result + unitInfo.format.suffix;
        }
        
        return result;
    }

    /**
     * 필드 타입에 따른 단위 정보 반환
     * @param {string} fieldType - 필드 타입
     * @returns {Object} 단위 정보
     */
    getUnitForField(fieldType) {
        const currency = this.getCurrentCurrency();
        if (!currency || !currency.units) return null;

        // 필드 타입별 단위 결정
        const range = currency.ranges?.[fieldType];
        const unitType = range?.unit || 'large'; // 기본값은 large 단위
        
        return currency.units[unitType];
    }

    /**
     * 필드의 단위 표시 문자열 반환
     * @param {string} fieldType - 필드 타입
     * @returns {string} 단위 문자열
     */
    getUnitString(fieldType) {
        const unitInfo = this.getUnitForField(fieldType);
        return unitInfo?.unit || '';
    }

    /**
     * 숫자 포맷팅 (천 단위 구분자 포함)
     * @param {number} value - 포맷팅할 숫자
     * @param {number} decimalPlaces - 소수점 자릿수
     */
    formatNumber(value, decimalPlaces = 0) {
        const currency = this.getCurrentCurrency();
        const separator = currency?.format?.separator || ',';
        const decimal = currency?.format?.decimal || '.';
        
        const fixed = Number(value).toFixed(decimalPlaces);
        const parts = fixed.split('.');
        
        // 천 단위 구분자 추가
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        
        return parts.join(decimal);
    }

    /**
     * 표시 단위 값을 기본 단위로 변환
     * @param {number} displayValue - 표시 단위 값 (예: 5억원)
     * @param {string} fieldType - 필드 타입
     * @returns {number} 기본 단위 값 (예: 500000000원)
     */
    toBaseUnit(displayValue, fieldType = 'investment_amount') {
        const unitInfo = this.getUnitForField(fieldType);
        if (!unitInfo) return displayValue;
        return displayValue * unitInfo.multiplier;
    }

    /**
     * 기본 단위 값을 표시 단위로 변환
     * @param {number} baseValue - 기본 단위 값 (예: 500000000원)
     * @param {string} fieldType - 필드 타입
     * @returns {number} 표시 단위 값 (예: 5억원)
     */
    toDisplayUnit(baseValue, fieldType = 'investment_amount') {
        const unitInfo = this.getUnitForField(fieldType);
        if (!unitInfo) return baseValue;
        return baseValue / unitInfo.multiplier;
    }

    /**
     * 화폐 간 환율 변환
     * @param {number} amount - 변환할 금액
     * @param {string} fromCurrency - 원본 화폐
     * @param {string} toCurrency - 대상 화폐
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (!this.exchangeRates) {
            console.warn('환율 정보가 없습니다.');
            return amount;
        }

        if (fromCurrency === toCurrency) {
            return amount;
        }

        const baseCurrency = this.exchangeRates.baseCurrency;
        let result = amount;

        // 기준 화폐로 변환
        if (fromCurrency !== baseCurrency) {
            result = result / this.exchangeRates.rates[fromCurrency];
        }

        // 대상 화폐로 변환
        if (toCurrency !== baseCurrency) {
            result = result * this.exchangeRates.rates[toCurrency];
        }

        return result;
    }

    /**
     * 필드의 유효 범위 반환
     * @param {string} fieldType - 필드 타입 (investment_amount, company_valuation 등)
     */
    getFieldRange(fieldType) {
        const currency = this.getCurrentCurrency();
        return currency.ranges?.[fieldType] || { min: 0, max: Number.MAX_SAFE_INTEGER };
    }

    /**
     * 화폐 변경 이벤트 발생
     * @param {string} oldCurrency - 이전 화폐 코드
     */
    dispatchCurrencyChangeEvent(oldCurrency = null) {
        const event = new CustomEvent('currencyChanged', {
            detail: {
                oldCurrency,
                newCurrency: this.currentCurrency,
                currencyInfo: this.getCurrentCurrency()
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 화폐 선택 UI 생성
     * @param {HTMLElement} container - 화폐 선택기를 추가할 컨테이너
     */
    createCurrencySelector(container) {
        const selector = document.createElement('select');
        selector.id = 'currencySelector';
        selector.className = 'currency-selector';
        
        // 옵션 추가
        this.getSupportedCurrencies().forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.symbol} ${currency.name} (${currency.unit})`;
            
            if (currency.code === this.currentCurrency) {
                option.selected = true;
            }
            
            selector.appendChild(option);
        });
        
        // 변경 이벤트 리스너
        selector.addEventListener('change', (e) => {
            this.setCurrency(e.target.value);
        });
        
        // 라벨 추가
        const label = document.createElement('label');
        label.htmlFor = 'currencySelector';
        label.textContent = '화폐 단위: ';
        label.className = 'currency-label';
        
        container.appendChild(label);
        container.appendChild(selector);
        
        return selector;
    }

    /**
     * 현재 화폐의 단위 정보 반환
     */
    getUnitInfo() {
        const currency = this.getCurrentCurrency();
        return {
            unit: currency.unit,
            baseUnit: currency.baseUnit,
            multiplier: currency.multiplier,
            symbol: currency.symbol
        };
    }
}

// 전역 인스턴스 생성
window.CurrencyManager = new CurrencyManager(); 