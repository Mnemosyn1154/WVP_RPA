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

        // 빈 데이터 체크
        if (!data || Object.keys(data).length === 0) {
            return {
                isValid: false,
                fieldResults: {},
                summary: {
                    totalFields: 0,
                    validFields: 0,
                    invalidFields: 0,
                    warnings: 0,
                    errors: ['입력된 데이터가 없습니다. 폼을 작성해주세요.']
                }
            };
        }

        // 필수 필드 체크
        const requiredFields = [
            '투자대상', '대표자', '투자금액', '투자방식', '투자단가', 
            '액면가', '투자전가치', '투자후가치', '투자총괄'
        ];

        for (const fieldName of requiredFields) {
            if (this.isEmpty(data[fieldName])) {
                results[fieldName] = {
                    isValid: false,
                    errors: [`${fieldName}은(는) 필수 입력 항목입니다.`],
                    warnings: []
                };
                hasErrors = true;
            }
        }

        // 나머지 필드 검증
        for (const [fieldName, value] of Object.entries(data)) {
            if (!results[fieldName]) { // 이미 검증된 필수 필드는 제외
                const result = this.validateField(fieldName, value, data);
                results[fieldName] = result;
                
                if (!result.isValid) {
                    hasErrors = true;
                }
            }
        }

        // 비즈니스 로직 검증 추가
        this.validateBusinessLogic(data, results);
        
        // 검증 결과에 오류가 있으면 전체 상태 업데이트
        for (const result of Object.values(results)) {
            if (!result.isValid) {
                hasErrors = true;
                break;
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
            errors: [],
            warningMessages: []
        };

        for (const [fieldName, result] of Object.entries(results)) {
            if (result.isValid) {
                summary.validFields++;
            } else {
                summary.invalidFields++;
                summary.errors.push(...result.errors.map(error => `${fieldName}: ${error}`));
            }
            
            summary.warnings += result.warnings.length;
            summary.warningMessages.push(...result.warnings.map(warning => `${fieldName}: ${warning}`));
        }

        return summary;
    }

    // app.js에서 호출하는 validateForm 메서드 추가
    validateForm(data) {
        return this.validateAllFields(data);
    }

    /**
     * 템플릿별 필수 필드 검증
     * @param {Object} data - 검증할 데이터
     * @param {string} templateType - 템플릿 타입 ('termsheet' 또는 'preliminary')
     * @returns {Object} 검증 결과
     */
    validateForTemplate(data, templateType) {
        const results = {};
        let hasErrors = false;

        // 템플릿별 필수 필드 정의
        const templateRequiredFields = {
            'termsheet': [
                '투자대상', '대표자', '투자금액', '투자방식', '투자단가', '액면가',
                '투자전가치', '투자후가치', '인수주식수', '지분율',
                '상환이자', '잔여분배이자', '주매청이자', '투자총괄'
            ],
            'preliminary': [
                '투자대상', '대표자', '주소', 'Series', '사용용도',
                '투자금액', '투자재원', '투자방식', '투자단가', '액면가',
                '투자전가치', '투자후가치', '인수주식수', '지분율',
                '상환이자', '잔여분배이자', '주매청이자', '배당률', '위약벌', '투자총괄'
            ]
        };

        const requiredFields = templateRequiredFields[templateType];
        
        if (!requiredFields) {
            return {
                isValid: false,
                fieldResults: {},
                summary: {
                    totalFields: 0,
                    validFields: 0,
                    invalidFields: 0,
                    warnings: 0,
                    errors: [`지원하지 않는 템플릿 타입입니다: ${templateType}`]
                }
            };
        }

        // 빈 데이터 체크
        if (!data || Object.keys(data).length === 0) {
            return {
                isValid: false,
                fieldResults: {},
                summary: {
                    totalFields: 0,
                    validFields: 0,
                    invalidFields: 0,
                    warnings: 0,
                    errors: ['입력된 데이터가 없습니다. 폼을 작성해주세요.']
                }
            };
        }

        // 템플릿별 필수 필드 체크
        for (const fieldName of requiredFields) {
            if (this.isEmpty(data[fieldName])) {
                results[fieldName] = {
                    isValid: false,
                    errors: [`${fieldName}은(는) ${this.getTemplateDisplayName(templateType)} 생성에 필수입니다.`],
                    warnings: []
                };
                hasErrors = true;
            } else {
                // 기본 형식 검증
                const result = this.validateField(fieldName, data[fieldName], data);
                results[fieldName] = result;
                
                if (!result.isValid) {
                    hasErrors = true;
                }
            }
        }

        return {
            isValid: !hasErrors,
            fieldResults: results,
            summary: this.generateTemplateValidationSummary(results, templateType, requiredFields.length)
        };
    }

    /**
     * 템플릿 표시명 반환
     * @param {string} templateType - 템플릿 타입
     * @returns {string} 표시명
     */
    getTemplateDisplayName(templateType) {
        const displayNames = {
            'termsheet': 'Term Sheet',
            'preliminary': '예비투심위 보고서'
        };
        return displayNames[templateType] || templateType;
    }

    /**
     * 템플릿별 검증 요약 생성
     * @param {Object} results - 검증 결과
     * @param {string} templateType - 템플릿 타입
     * @param {number} totalRequired - 총 필수 필드 수
     * @returns {Object} 요약 정보
     */
    generateTemplateValidationSummary(results, templateType, totalRequired) {
        const summary = {
            templateType: templateType,
            templateName: this.getTemplateDisplayName(templateType),
            totalRequiredFields: totalRequired,
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
            '액면가', '투자전가치', '투자후가치', '투자총괄'
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

    /**
     * 비즈니스 로직 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateBusinessLogic(data, results) {
        // 투자 금액 일관성 검증
        this.validateInvestmentConsistency(data, results);
        
        // 주식 관련 계산 검증
        this.validateShareCalculations(data, results);
        
        // 지분율 계산 검증
        this.validateEquityPercentage(data, results);
        
        // 투자방식별 특별 검증
        this.validateByInvestmentType(data, results);
    }

    /**
     * 투자 금액 일관성 검증: 투자전가치 + 투자금액 = 투자후가치
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateInvestmentConsistency(data, results) {
        const preMoneyStr = data['투자전가치'];
        const investmentStr = data['투자금액'];
        const postMoneyStr = data['투자후가치'];
        
        // 필요한 값들이 모두 있는지 확인
        if (this.isEmpty(preMoneyStr) || this.isEmpty(investmentStr) || this.isEmpty(postMoneyStr)) {
            return; // 값이 없으면 검증하지 않음
        }
        
        const preMoney = this.parseNumber(preMoneyStr);
        const investment = this.parseNumber(investmentStr);
        const postMoney = this.parseNumber(postMoneyStr);
        
        // 숫자 파싱이 실패한 경우
        if (isNaN(preMoney) || isNaN(investment) || isNaN(postMoney)) {
            return; // 기본 숫자 검증에서 처리됨
        }
        
        const expectedPostMoney = preMoney + investment;
        const tolerance = Math.max(1, expectedPostMoney * 0.001); // 0.1% 허용 오차
        
        if (Math.abs(postMoney - expectedPostMoney) > tolerance) {
            // 투자후가치 필드에 오류 추가
            if (!results['투자후가치']) {
                results['투자후가치'] = { isValid: true, errors: [], warnings: [] };
            }
            
            results['투자후가치'].isValid = false;
            results['투자후가치'].errors.push(
                `투자후가치가 올바르지 않습니다. 예상값: ${this.formatNumber(expectedPostMoney)} (투자전가치 ${this.formatNumber(preMoney)} + 투자금액 ${this.formatNumber(investment)})`
            );
        }
    }

    /**
     * 주식 계산 검증: 투자금액 ÷ 투자단가 = 인수주식수
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateShareCalculations(data, results) {
        const investmentStr = data['투자금액'];
        const pricePerShareStr = data['투자단가'];
        const sharesStr = data['인수주식수'];
        
        // 필요한 값들이 모두 있는지 확인
        if (this.isEmpty(investmentStr) || this.isEmpty(pricePerShareStr) || this.isEmpty(sharesStr)) {
            return;
        }
        
        const investment = this.parseNumber(investmentStr);
        const pricePerShare = this.parseNumber(pricePerShareStr);
        const shares = this.parseNumber(sharesStr);
        
        if (isNaN(investment) || isNaN(pricePerShare) || isNaN(shares) || pricePerShare === 0) {
            return;
        }
        
        const expectedShares = investment / pricePerShare;
        const tolerance = Math.max(1, expectedShares * 0.001); // 0.1% 허용 오차
        
        if (Math.abs(shares - expectedShares) > tolerance) {
            if (!results['인수주식수']) {
                results['인수주식수'] = { isValid: true, errors: [], warnings: [] };
            }
            
            results['인수주식수'].isValid = false;
            results['인수주식수'].errors.push(
                `인수주식수가 올바르지 않습니다. 예상값: ${this.formatNumber(Math.round(expectedShares))} (투자금액 ${this.formatNumber(investment)} ÷ 투자단가 ${this.formatNumber(pricePerShare)})`
            );
        }
    }

    /**
     * 지분율 계산 검증: (투자금액 ÷ 투자후가치) × 100 = 지분율
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateEquityPercentage(data, results) {
        const investmentStr = data['투자금액'];
        const postMoneyStr = data['투자후가치'];
        const equityStr = data['지분율'];
        
        // 필요한 값들이 모두 있는지 확인
        if (this.isEmpty(investmentStr) || this.isEmpty(postMoneyStr) || this.isEmpty(equityStr)) {
            return;
        }
        
        const investment = this.parseNumber(investmentStr);
        const postMoney = this.parseNumber(postMoneyStr);
        const equity = this.parseNumber(equityStr);
        
        if (isNaN(investment) || isNaN(postMoney) || isNaN(equity) || postMoney === 0) {
            return;
        }
        
        const expectedEquity = (investment / postMoney) * 100;
        const tolerance = 0.1; // 0.1% 허용 오차
        
        if (Math.abs(equity - expectedEquity) > tolerance) {
            if (!results['지분율']) {
                results['지분율'] = { isValid: true, errors: [], warnings: [] };
            }
            
            results['지분율'].isValid = false;
            results['지분율'].errors.push(
                `지분율이 올바르지 않습니다. 예상값: ${expectedEquity.toFixed(2)}% (투자금액 ${this.formatNumber(investment)} ÷ 투자후가치 ${this.formatNumber(postMoney)} × 100)`
            );
        }
    }

    /**
     * 투자방식별 특별 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateByInvestmentType(data, results) {
        const investmentType = data['투자방식'];
        
        if (!investmentType) return;
        
        switch (investmentType) {
            case '보통주':
                this.validateCommonStock(data, results);
                break;
            case '전환우선주':
                this.validateConvertiblePreferredStock(data, results);
                break;
            case '전환상환우선주':
                this.validateConvertibleRedeemablePreferredStock(data, results);
                break;
            case '전환사채':
                this.validateConvertibleBond(data, results);
                break;
        }
    }

    /**
     * 보통주 특별 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateCommonStock(data, results) {
        // 보통주의 경우 상환이자, 잔여분배이자가 입력되면 경고
        const redemptionInterest = data['상환이자'];
        const liquidationPreference = data['잔여분배이자'];
        
        if (!this.isEmpty(redemptionInterest)) {
            if (!results['상환이자']) {
                results['상환이자'] = { isValid: true, errors: [], warnings: [] };
            }
            results['상환이자'].warnings.push('보통주 투자에서는 상환이자가 적용되지 않습니다.');
        }
        
        if (!this.isEmpty(liquidationPreference)) {
            if (!results['잔여분배이자']) {
                results['잔여분배이자'] = { isValid: true, errors: [], warnings: [] };
            }
            results['잔여분배이자'].warnings.push('보통주 투자에서는 잔여분배이자가 적용되지 않습니다.');
        }
    }

    /**
     * 전환우선주 특별 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateConvertiblePreferredStock(data, results) {
        // 전환우선주의 경우 상환이자가 입력되면 경고
        const redemptionInterest = data['상환이자'];
        
        if (!this.isEmpty(redemptionInterest)) {
            if (!results['상환이자']) {
                results['상환이자'] = { isValid: true, errors: [], warnings: [] };
            }
            results['상환이자'].warnings.push('전환우선주에서는 일반적으로 상환이자가 적용되지 않습니다.');
        }
    }

    /**
     * 전환상환우선주 특별 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateConvertibleRedeemablePreferredStock(data, results) {
        // 전환상환우선주는 모든 필드가 유효하므로 특별한 검증 없음
        // 향후 필요시 추가 로직 구현
    }

    /**
     * 전환사채 특별 검증
     * @param {Object} data - 검증할 데이터
     * @param {Object} results - 검증 결과 객체
     */
    validateConvertibleBond(data, results) {
        // 전환사채의 경우 잔여분배이자, 배당률이 입력되면 경고
        const liquidationPreference = data['잔여분배이자'];
        const dividendRate = data['배당률'];
        
        if (!this.isEmpty(liquidationPreference)) {
            if (!results['잔여분배이자']) {
                results['잔여분배이자'] = { isValid: true, errors: [], warnings: [] };
            }
            results['잔여분배이자'].warnings.push('전환사채에서는 잔여분배이자가 적용되지 않습니다.');
        }
        
        if (!this.isEmpty(dividendRate)) {
            if (!results['배당률']) {
                results['배당률'] = { isValid: true, errors: [], warnings: [] };
            }
            results['배당률'].warnings.push('전환사채에서는 배당률이 적용되지 않습니다.');
        }
    }
}

window.DataValidator = new DataValidator(); 