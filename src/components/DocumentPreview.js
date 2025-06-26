/**
 * 문서 생성 미리보기 컴포넌트
 * Term Sheet 및 예비투심위 문서 미리보기 기능 제공
 */

class DocumentPreview {
    constructor() {
        this.templateProcessor = window.TemplateProcessor;
        this.currencyManager = window.CurrencyManager;
        this.dataValidator = window.DataValidator;
    }

    /**
     * 문서 미리보기 표시
     * @param {string} documentType - 문서 타입 ('termsheet' 또는 'preliminary')
     * @param {Object} formData - 폼 데이터
     */
    async showPreview(documentType, formData) {
        try {
            // 데이터 전처리
            const processedData = this.preprocessData(formData);
            
            // 템플릿별 검증
            const validationResult = this.dataValidator.validateForTemplate(processedData, documentType);
            
            // 미리보기 내용 생성
            const previewContent = this.generatePreviewContent(documentType, processedData, validationResult);
            
            // 모달로 표시
            window.Modal.show({
                title: this.getPreviewTitle(documentType),
                content: previewContent,
                size: 'large',
                closable: true,
                buttons: this.getPreviewButtons(documentType, processedData, validationResult)
            });
            
        } catch (error) {
            console.error('미리보기 생성 실패:', error);
            window.Toast.error('미리보기 생성에 실패했습니다.');
        }
    }

    /**
     * 데이터 전처리
     * @param {Object} formData - 원본 폼 데이터
     * @returns {Object} 처리된 데이터
     */
    preprocessData(formData) {
        const processed = { ...formData };
        
        // 날짜 정보 추가
        const now = new Date();
        processed['생성일자'] = now.toLocaleDateString('ko-KR');
        processed['생성시간'] = now.toLocaleString('ko-KR');
        
        // 담당자 조합 처리
        if (processed['담당자1'] || processed['담당자2']) {
            const managers = [];
            if (processed['담당자1']) managers.push(processed['담당자1']);
            if (processed['담당자2']) managers.push(processed['담당자2']);
            processed['담당자'] = managers.join(', ');
        }
        
        return processed;
    }

    /**
     * 미리보기 제목 생성
     * @param {string} documentType - 문서 타입
     * @returns {string} 제목
     */
    getPreviewTitle(documentType) {
        const titles = {
            'termsheet': '📄 Term Sheet 미리보기',
            'preliminary': '📋 예비투심위 보고서 미리보기'
        };
        return titles[documentType] || '문서 미리보기';
    }

    /**
     * 미리보기 내용 생성
     * @param {string} documentType - 문서 타입
     * @param {Object} data - 처리된 데이터
     * @param {Object} validationResult - 검증 결과
     * @returns {string} HTML 내용
     */
    generatePreviewContent(documentType, data, validationResult) {
        let html = '<div class="document-preview-container">';
        
        // 검증 상태 표시
        html += this.generateValidationStatus(validationResult);
        
        // 주요 정보 요약
        html += this.generateSummarySection(data);
        
        // 투자 조건 섹션
        html += this.generateInvestmentSection(data);
        
        // 문서별 특화 정보
        if (documentType === 'termsheet') {
            html += this.generateTermSheetSpecificSection(data);
        } else if (documentType === 'preliminary') {
            html += this.generatePreliminarySpecificSection(data);
        }
        
        // 날짜 및 담당자 정보
        html += this.generateFooterSection(data);
        
        html += '</div>';
        
        // 스타일 추가
        html += this.getPreviewStyles();
        
        return html;
    }

    /**
     * 검증 상태 섹션 생성
     * @param {Object} validationResult - 검증 결과
     * @returns {string} HTML
     */
    generateValidationStatus(validationResult) {
        const isValid = validationResult.isValid;
        const statusClass = isValid ? 'success' : 'warning';
        const statusIcon = isValid ? '✅' : '⚠️';
        const statusText = isValid ? '문서 생성 가능' : '필수 정보 부족';
        
        let html = `
            <div class="preview-section validation-status ${statusClass}">
                <div class="status-header">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                </div>
        `;
        
        if (!isValid) {
            html += `
                <div class="validation-details">
                    <p>필수 필드: ${validationResult.summary.totalRequiredFields}개</p>
                    <p>입력 완료: ${validationResult.summary.validFields}개</p>
                    <p>미입력: ${validationResult.summary.invalidFields}개</p>
                    <div class="missing-fields">
                        <strong>누락된 필드:</strong>
                        <ul>
                            ${validationResult.summary.errors.map(error => 
                                `<li>${error.split(': ')[1] || error}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 요약 정보 섹션 생성
     * @param {Object} data - 데이터
     * @returns {string} HTML
     */
    generateSummarySection(data) {
        return `
            <div class="preview-section summary-section">
                <h3>📊 투자 요약</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">투자대상</span>
                        <span class="value">${data['투자대상'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">대표자</span>
                        <span class="value">${data['대표자'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">투자금액</span>
                        <span class="value">${this.formatCurrency(data['투자금액'], 'investment_amount')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">지분율</span>
                        <span class="value">${this.formatPercentage(data['지분율'])}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 투자 조건 섹션 생성
     * @param {Object} data - 데이터
     * @returns {string} HTML
     */
    generateInvestmentSection(data) {
        return `
            <div class="preview-section investment-section">
                <h3>💰 투자 조건</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">투자방식</span>
                        <span class="value">${data['투자방식'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Series</span>
                        <span class="value">${data['Series'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">투자단가</span>
                        <span class="value">${this.formatCurrency(data['투자단가'], 'price_per_share')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">액면가</span>
                        <span class="value">${this.formatCurrency(data['액면가'], 'par_value')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">인수주식수</span>
                        <span class="value">${this.formatNumber(data['인수주식수'])}주</span>
                    </div>
                    <div class="info-item">
                        <span class="label">투자전가치</span>
                        <span class="value">${this.formatCurrency(data['투자전가치'], 'company_valuation')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">투자후가치</span>
                        <span class="value">${this.formatCurrency(data['투자후가치'], 'company_valuation')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Term Sheet 특화 섹션 생성
     * @param {Object} data - 데이터
     * @returns {string} HTML
     */
    generateTermSheetSpecificSection(data) {
        return `
            <div class="preview-section termsheet-specific">
                <h3>📑 특별 조건</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">상환이자</span>
                        <span class="value">${this.formatPercentage(data['상환이자'])}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">잔여분배이자</span>
                        <span class="value">${this.formatPercentage(data['잔여분배이자'])}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">주매청이자</span>
                        <span class="value">${this.formatPercentage(data['주매청이자'])}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">배당률</span>
                        <span class="value">${this.formatPercentage(data['배당률'])}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">위약벌</span>
                        <span class="value">${this.formatPercentage(data['위약벌'])}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 예비투심위 특화 섹션 생성
     * @param {Object} data - 데이터
     * @returns {string} HTML
     */
    generatePreliminarySpecificSection(data) {
        return `
            <div class="preview-section preliminary-specific">
                <h3>📝 추가 정보</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">투자재원</span>
                        <span class="value">${data['투자재원'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">사용용도</span>
                        <span class="value">${data['사용용도'] || '-'}</span>
                    </div>
                    <div class="info-item full-width">
                        <span class="label">회사주소</span>
                        <span class="value">${data['회사주소'] || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 하단 정보 섹션 생성
     * @param {Object} data - 데이터
     * @returns {string} HTML
     */
    generateFooterSection(data) {
        return `
            <div class="preview-section footer-section">
                <h3>👤 담당자 정보</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">투자총괄</span>
                        <span class="value">${data['투자총괄'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">담당자</span>
                        <span class="value">${data['담당자'] || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">생성일자</span>
                        <span class="value">${data['생성일자'] || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 미리보기 버튼 설정
     * @param {string} documentType - 문서 타입
     * @param {Object} data - 데이터
     * @param {Object} validationResult - 검증 결과
     * @returns {Array} 버튼 배열
     */
    getPreviewButtons(documentType, data, validationResult) {
        const buttons = [
            {
                text: '닫기',
                type: 'secondary',
                action: 'close'
            }
        ];
        
        if (validationResult.isValid) {
            buttons.unshift({
                text: '문서 생성',
                type: 'primary',
                action: () => {
                    window.Modal.close();
                    window.investmentApp.generateDocument(documentType);
                }
            });
        }
        
        return buttons;
    }

    /**
     * 통화 포맷팅
     * @param {*} value - 값
     * @param {string} fieldType - 필드 타입
     * @returns {string} 포맷된 값
     */
    formatCurrency(value, fieldType) {
        if (!value || value === '-') return '-';
        
        const numValue = parseFloat(String(value).replace(/[,]/g, ''));
        if (isNaN(numValue)) return value;
        
        const formatted = new Intl.NumberFormat('ko-KR').format(numValue);
        const unitSuffix = this.getUnitSuffix(fieldType);
        
        return formatted + unitSuffix;
    }

    /**
     * 단위 suffix 가져오기
     * @param {string} fieldType - 필드 타입
     * @returns {string} 단위
     */
    getUnitSuffix(fieldType) {
        if (this.currencyManager && this.currencyManager.getUnitForField) {
            const unitInfo = this.currencyManager.getUnitForField(fieldType);
            return unitInfo ? unitInfo.suffix : '';
        }
        
        const defaults = {
            'investment_amount': '억원',
            'company_valuation': '억원',
            'price_per_share': '원',
            'par_value': '원'
        };
        
        return defaults[fieldType] || '원';
    }

    /**
     * 퍼센트 포맷팅
     * @param {*} value - 값
     * @returns {string} 포맷된 값
     */
    formatPercentage(value) {
        if (!value || value === '-') return '-';
        
        const numValue = parseFloat(String(value).replace(/[,%]/g, ''));
        if (isNaN(numValue)) return value;
        
        return numValue.toFixed(2) + '%';
    }

    /**
     * 숫자 포맷팅
     * @param {*} value - 값
     * @returns {string} 포맷된 값
     */
    formatNumber(value) {
        if (!value || value === '-') return '-';
        
        const numValue = parseFloat(String(value).replace(/[,]/g, ''));
        if (isNaN(numValue)) return value;
        
        return new Intl.NumberFormat('ko-KR').format(numValue);
    }

    /**
     * 미리보기 스타일
     * @returns {string} CSS 스타일
     */
    getPreviewStyles() {
        return `
            <style>
                .document-preview-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .preview-section {
                    background: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                
                .preview-section:last-child {
                    margin-bottom: 0;
                }
                
                .preview-section h3 {
                    margin: 0 0 15px 0;
                    color: var(--primary-color);
                    font-size: 1.1em;
                }
                
                .validation-status {
                    border: 2px solid;
                    position: relative;
                }
                
                .validation-status.success {
                    border-color: #28a745;
                    background-color: #f0f9f0;
                }
                
                .validation-status.warning {
                    border-color: #ffc107;
                    background-color: #fffdf0;
                }
                
                .status-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .status-icon {
                    font-size: 1.5em;
                }
                
                .status-text {
                    font-weight: bold;
                    font-size: 1.1em;
                }
                
                .validation-details {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                
                .validation-details p {
                    margin: 5px 0;
                    color: #666;
                }
                
                .missing-fields {
                    margin-top: 10px;
                }
                
                .missing-fields ul {
                    margin: 5px 0 0 20px;
                    list-style-type: disc;
                }
                
                .missing-fields li {
                    color: #d9534f;
                    margin: 3px 0;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                }
                
                .info-item.full-width {
                    grid-column: 1 / -1;
                }
                
                .info-item .label {
                    font-weight: 600;
                    color: #666;
                    flex-shrink: 0;
                }
                
                .info-item .value {
                    text-align: right;
                    color: #333;
                    font-weight: 500;
                    word-break: break-word;
                    margin-left: 10px;
                }
                
                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .document-preview-container {
                        padding: 10px;
                    }
                    
                    .preview-section {
                        padding: 15px;
                    }
                }
            </style>
        `;
    }
}

// 전역 인스턴스 생성
window.DocumentPreview = new DocumentPreview();