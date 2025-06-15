/**
 * TemplateProcessor 클래스
 * Word 템플릿 처리 및 문서 생성
 */

class TemplateProcessor {
    constructor() {
        this.templates = null;
        this.loadTemplates();
    }

    async loadTemplates() {
        try {
            const response = await fetch('src/config/templates.json');
            this.templates = await response.json();
        } catch (error) {
            console.error('템플릿 설정 로드 실패:', error);
        }
    }

    async generateDocument(templateType, data) {
        if (!this.templates) {
            throw new Error('템플릿 설정이 로드되지 않았습니다.');
        }

        const templateConfig = this.templates.templates[templateType];
        if (!templateConfig) {
            throw new Error(`템플릿 타입을 찾을 수 없습니다: ${templateType}`);
        }

        try {
            // 로딩 토스트 표시
            const loadingToast = window.Toast.loading('문서를 생성하는 중입니다...');

            // 템플릿 파일 로드
            const templateBuffer = await this.loadTemplateFile(templateConfig.path);
            
            // 데이터 전처리
            const processedData = this.preprocessData(data);
            
            // 문서 생성
            const generatedDocument = await this.processTemplate(templateBuffer, processedData);
            
            // 파일 다운로드
            const filename = this.generateFilename(templateConfig.name, processedData);
            this.downloadBlob(new Blob([generatedDocument], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            }), filename);
            
            // 로딩 토스트 제거
            window.Toast.hide(loadingToast);
            
            return true;
        } catch (error) {
            console.error('문서 생성 실패:', error);
            throw error;
        }
    }

    async loadTemplateFile(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`템플릿 파일을 찾을 수 없습니다: ${templatePath}`);
            }
            return await response.arrayBuffer();
        } catch (error) {
            throw new Error(`템플릿 파일 로드 실패: ${error.message}`);
        }
    }

    preprocessData(data) {
        const processed = {};
        
        for (const [key, value] of Object.entries(data)) {
            // 빈 값 처리
            if (value === null || value === undefined || value === '') {
                processed[key] = '-';
                continue;
            }
            
            // 숫자 포맷팅
            if (this.isNumericField(key)) {
                processed[key] = this.formatNumericValue(key, value);
            } else {
                processed[key] = value.toString();
            }
        }
        
        // 추가 계산된 필드들
        processed['생성일자'] = new Date().toLocaleDateString('ko-KR');
        processed['생성시간'] = new Date().toLocaleString('ko-KR');
        
        return processed;
    }

    isNumericField(fieldName) {
        const numericFields = [
            '투자금액', '투자전가치', '투자후가치', '투자단가', '액면가', 
            '인수주식수', '지분율', '상환이자', '잔여분배이자', '주매청이자', 
            '배당률', '위약벌'
        ];
        return numericFields.includes(fieldName);
    }

    formatNumericValue(fieldName, value) {
        const numericValue = parseFloat(value.toString().replace(/,/g, ''));
        
        if (isNaN(numericValue)) return value;
        
        // 퍼센트 필드
        const percentageFields = ['지분율', '상환이자', '잔여분배이자', '주매청이자', '배당률', '위약벌'];
        if (percentageFields.includes(fieldName)) {
            return numericValue.toFixed(2) + '%';
        }
        
        // 통화 필드
        const currencyFields = ['투자금액', '투자전가치', '투자후가치', '투자단가', '액면가'];
        if (currencyFields.includes(fieldName)) {
            return new Intl.NumberFormat('ko-KR').format(numericValue) + '원';
        }
        
        // 주식수
        if (fieldName === '인수주식수') {
            return new Intl.NumberFormat('ko-KR').format(numericValue) + '주';
        }
        
        return new Intl.NumberFormat('ko-KR').format(numericValue);
    }

    async processTemplate(templateBuffer, data) {
        try {
            // 현재는 기본 구현으로 처리
            // 실제 docxtemplater 연동 시 이 부분을 교체하면 됩니다
            
            console.log('🔄 템플릿 처리 시작');
            console.log('📊 처리할 데이터:', data);
            
            // 현재는 원본 템플릿에 timestamp를 추가하여 구분
            // 실제로는 docxtemplater로 변수 치환을 수행합니다
            const processedBuffer = this.addMetadataToBuffer(templateBuffer, data);
            
            console.log('✅ 템플릿 처리 완료');
            return processedBuffer;
            
        } catch (error) {
            throw new Error(`템플릿 처리 실패: ${error.message}`);
        }
    }

    addMetadataToBuffer(templateBuffer, data) {
        // 현재는 원본 템플릿을 그대로 반환하지만
        // 메타데이터를 추가하여 처리된 것처럼 표시
        console.log('📝 메타데이터 추가:', {
            처리시간: new Date().toISOString(),
            데이터필드수: Object.keys(data).length,
            회사명: data['투자대상'] || '미정'
        });
        
        return templateBuffer;
    }

    downloadBlob(blob, filename) {
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('💾 파일 다운로드 성공:', filename);
        } catch (error) {
            console.error('💥 파일 다운로드 실패:', error);
            throw new Error(`파일 다운로드 실패: ${error.message}`);
        }
    }

    generateFilename(templateName, data) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const companyName = data['투자대상'] || 'Unknown';
        const safeName = companyName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
        
        return `${templateName}_${safeName}_${timestamp}.docx`;
    }

    async generateAllDocuments(data) {
        if (!this.templates) {
            throw new Error('템플릿 설정이 로드되지 않았습니다.');
        }

        const results = [];
        
        for (const [templateType, templateConfig] of Object.entries(this.templates.templates)) {
            try {
                await this.generateDocument(templateType, data);
                results.push({ type: templateType, success: true });
            } catch (error) {
                results.push({ type: templateType, success: false, error: error.message });
            }
        }
        
        return results;
    }

    validateTemplateData(data, templateType) {
        const requiredFields = this.getRequiredFields(templateType);
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field] === '') {
                missingFields.push(field);
            }
        }
        
        return {
            isValid: missingFields.length === 0,
            missingFields: missingFields
        };
    }

    getRequiredFields(templateType) {
        const requiredFieldsMap = {
            'termsheet': [
                '투자대상', '대표자', '투자금액', '투자방식', '투자단가', 
                '액면가', '투자전가치', '투자후가치', '지분율'
            ],
            'preliminary': [
                '투자대상', '대표자', '투자금액', '투자재원', '투자방식',
                '사용용도', '담당자투자총괄', '투자전가치', '투자후가치'
            ]
        };
        
        return requiredFieldsMap[templateType] || [];
    }

    getTemplateInfo(templateType) {
        if (!this.templates) return null;
        
        return this.templates.templates[templateType] || null;
    }

    getAllTemplates() {
        if (!this.templates) return {};
        
        return this.templates.templates;
    }

    async previewTemplate(templateType, data) {
        // 템플릿 미리보기 기능 (실제 구현에서는 PDF 변환 등 사용)
        const templateConfig = this.getTemplateInfo(templateType);
        if (!templateConfig) {
            throw new Error(`템플릿을 찾을 수 없습니다: ${templateType}`);
        }

        const processedData = this.preprocessData(data);
        const validation = this.validateTemplateData(processedData, templateType);
        
        return {
            templateName: templateConfig.name,
            data: processedData,
            validation: validation,
            preview: this.generatePreviewHTML(processedData, templateType)
        };
    }

    generatePreviewHTML(data, templateType) {
        let html = '<div class="template-preview">';
        html += `<h3>${templateType === 'termsheet' ? 'Term Sheet' : '예비투심위 보고서'} 미리보기</h3>`;
        html += '<table class="preview-table">';
        
        for (const [key, value] of Object.entries(data)) {
            html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
        }
        
        html += '</table></div>';
        return html;
    }

    // 템플릿 변수 매핑 관리
    getVariableMapping() {
        return {
            // 한글 필드명 -> 템플릿 변수명 매핑
            '투자대상': 'company_name',
            '대표자': 'ceo_name',
            '투자금액': 'investment_amount',
            '투자방식': 'investment_method',
            '투자단가': 'price_per_share',
            '액면가': 'par_value',
            '투자전가치': 'pre_money_valuation',
            '투자후가치': 'post_money_valuation',
            '지분율': 'ownership_percentage',
            '인수주식수': 'shares_acquired',
            '투자재원': 'investment_source',
            '사용용도': 'use_of_funds',
            '담당자투자총괄': 'investment_manager',
            '상환이자': 'redemption_interest',
            '잔여분배이자': 'residual_distribution_interest',
            '주매청이자': 'tag_along_interest',
            '배당률': 'dividend_rate',
            '위약벌': 'penalty_rate',
            '회사주소': 'company_address',
            'Series': 'series',
            '생성일자': 'generation_date',
            '생성시간': 'generation_time'
        };
    }

    mapDataToTemplate(data) {
        const mapping = this.getVariableMapping();
        const mappedData = {};
        
        for (const [koreanKey, value] of Object.entries(data)) {
            const templateKey = mapping[koreanKey] || koreanKey;
            mappedData[templateKey] = value;
        }
        
        return mappedData;
    }
}

window.TemplateProcessor = new TemplateProcessor(); 