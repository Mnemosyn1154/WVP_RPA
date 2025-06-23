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

        // 템플릿별 필수 필드 검증
        if (window.DataValidator && window.DataValidator.validateForTemplate) {
            const validationResult = window.DataValidator.validateForTemplate(data, templateType);
            
            if (!validationResult.isValid) {
                console.error('❌ 템플릿별 검증 실패:', validationResult);
                
                const errorMessage = `<div style="text-align: left; line-height: 1.6;">
                    <strong>${validationResult.summary.templateName} 생성에 필요한 정보가 부족합니다.</strong><br><br>
                    <strong>필수 필드 수:</strong> ${validationResult.summary.totalRequiredFields}개<br>
                    <strong>입력 완료:</strong> ${validationResult.summary.validFields}개<br>
                    <strong>미입력:</strong> ${validationResult.summary.invalidFields}개<br><br>
                    <strong>누락된 필드:</strong><br>
                    ${validationResult.summary.errors.map(error => `• ${error.split(': ')[1] || error}`).join('<br>')}
                </div>`;
                
                // 모달로 자세한 오류 정보 표시
                if (window.Modal) {
                    await window.Modal.alert(errorMessage, `⚠️ ${validationResult.summary.templateName} 검증 실패`);
                }
                
                throw new Error(`${validationResult.summary.templateName} 생성에 필요한 필수 정보가 부족합니다.`);
            }
            
            console.log('✅ 템플릿별 검증 통과:', {
                template: validationResult.summary.templateName,
                validFields: validationResult.summary.validFields,
                totalRequired: validationResult.summary.totalRequiredFields
            });
        }

        try {
            // 로딩 토스트 표시
            const loadingToast = window.Toast.loading('문서를 생성하는 중입니다...');

            // 템플릿 파일 로드
            const templateBuffer = await this.loadTemplateFile(templateConfig.path);
            
            // 데이터 전처리
            const processedData = this.preprocessData(data);
            
            // 문서 생성
            const generatedDocument = await this.processTemplate(templateBuffer, processedData, templateType);
            
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
        
        // 통화 필드 - CurrencyManager를 통한 동적 단위 처리
        const currencyFields = {
            '투자금액': 'investment_amount',
            '투자전가치': 'company_valuation', 
            '투자후가치': 'company_valuation',
            '투자단가': 'price_per_share',
            '액면가': 'par_value'
        };
        
        if (currencyFields[fieldName]) {
            const fieldType = currencyFields[fieldName];
            const unitSuffix = this.getCurrencyUnitSuffix(fieldType);
            return new Intl.NumberFormat('ko-KR').format(numericValue) + unitSuffix;
        }
        
        // 주식수
        if (fieldName === '인수주식수') {
            return new Intl.NumberFormat('ko-KR').format(numericValue) + '주';
        }
        
        return new Intl.NumberFormat('ko-KR').format(numericValue);
    }

    async processTemplate(templateBuffer, data, templateType = null) {
        try {
            console.log('🔄 템플릿 처리 시작');
            console.log('📊 처리할 데이터:', data);
            console.log('📂 템플릿 타입:', templateType);
            
            // docxtemplater 라이브러리가 로드되어 있는지 확인
            if (typeof window.docxtemplater === 'undefined' || typeof window.PizZip === 'undefined') {
                throw new Error('docxtemplater 라이브러리가 로드되지 않았습니다.');
            }
            
            // ArrayBuffer를 Uint8Array로 변환
            const zip = new window.PizZip(templateBuffer);
            
            // 모든 템플릿에서 단일 대괄호 사용
            const delimiters = { start: '[', end: ']' };
            
            console.log('🔧 사용할 delimiters:', delimiters);
            
            // docxtemplater 인스턴스 생성
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: delimiters,
                nullGetter: function(part) {
                    // 누락된 변수에 대해 빈 문자열 대신 "-" 반환
                    console.warn(`누락된 변수: ${part.module} ${part.value}`);
                    return '-';
                }
            });
            
            // 데이터를 템플릿에 적합한 형태로 변환
            const templateData = this.prepareTemplateData(data);
            console.log('🔧 템플릿용 데이터:', templateData);
            
            // 변수 치환 수행
            doc.setData(templateData);
            doc.render();
            
            // 결과 문서 생성
            const output = doc.getZip().generate({
                type: 'arraybuffer',
                compression: 'DEFLATE'
            });
            
            console.log('✅ 템플릿 처리 완료 - 파일 크기:', output.byteLength, 'bytes');
            return output;
            
        } catch (error) {
            console.error('💥 템플릿 처리 실패:', error);
            throw new Error(`템플릿 처리 실패: ${error.message}`);
        }
    }

    prepareTemplateData(data) {
        const templateData = {};
        
        // 기본 데이터 처리
        for (const [key, value] of Object.entries(data)) {
            // 빈 값 처리
            if (value === null || value === undefined || value === '') {
                templateData[key] = '-';
                continue;
            }
            
            // 값을 문자열로 변환하고 처리
            templateData[key] = value.toString();
        }
        
        // 담당자 정보 조합 처리
        this.processMemberFields(templateData);
        
        // 별칭 변수들 추가 (템플릿에서 사용되는 다양한 이름들)
        const aliases = {
            '회사명': templateData['투자대상'],
            '대표자명': templateData['대표자'],
            '주당가격': templateData['투자단가'],
            'Pre-money': templateData['투자전가치'],
            'Post-money': templateData['투자후가치'],
            '투자라운드': templateData['Series'],
            '투자목적': templateData['사용용도']
        };
        
        // 별칭들을 templateData에 추가
        for (const [alias, value] of Object.entries(aliases)) {
            if (value && value !== '-') {
                templateData[alias] = value;
            }
        }
        
        // 현재 날짜 추가
        const now = new Date();
        const koreanDate = now.toLocaleDateString('ko-KR');
        templateData['오늘날짜'] = koreanDate;
        templateData['작성일'] = koreanDate;
        templateData['계약일'] = koreanDate;
        templateData['생성일자'] = koreanDate;
        templateData['생성시간'] = now.toLocaleString('ko-KR');
        
        // 계산된 필드들 추가
        if (templateData['투자후가치'] && templateData['투자단가']) {
            const postMoney = this.parseNumericValue(templateData['투자후가치']);
            const pricePerShare = this.parseNumericValue(templateData['투자단가']);
            if (postMoney > 0 && pricePerShare > 0) {
                const totalShares = Math.floor(postMoney / pricePerShare);
                templateData['총발행주식수'] = totalShares.toLocaleString('ko-KR') + '주';
            }
        }
        
        if (templateData['지분율']) {
            const ownership = this.parseNumericValue(templateData['지분율']);
            if (ownership > 0) {
                templateData['기존주주지분율'] = (100 - ownership).toFixed(2) + '%';
            }
        }
        
        if (templateData['투자단가'] && templateData['액면가']) {
            const pricePerShare = this.parseNumericValue(templateData['투자단가']);
            const parValue = this.parseNumericValue(templateData['액면가']);
            if (pricePerShare > 0 && parValue > 0) {
                const premium = pricePerShare - parValue;
                const unitSuffix = this.getCurrencyUnitSuffix('price_per_share');
                templateData['프리미엄'] = premium.toLocaleString('ko-KR') + unitSuffix;
            }
        }
        
        // 대괄호 형식의 변수들을 중괄호 형식으로 변환
        const bracketData = {};
        for (const [key, value] of Object.entries(templateData)) {
            // 원래 키 유지
            bracketData[key] = value;
            // 대괄호 형식도 추가 (docxtemplater에서 {key} 형식으로 처리됨)
            bracketData[`[${key}]`] = value;
        }
        
        return bracketData;
    }
    
    parseNumericValue(value) {
        if (!value) return 0;
        const numStr = value.toString().replace(/[,원주%\s]/g, '');
        const num = parseFloat(numStr);
        return isNaN(num) ? 0 : num;
    }

    /**
     * 담당자 정보 조합 처리
     * @param {Object} templateData - 템플릿 데이터 객체
     */
    processMemberFields(templateData) {
        const manager1 = templateData['담당자1'] || '';
        const manager2 = templateData['담당자2'] || '';
        
        // [담당자] 변수: 담당자1과 담당자2를 조합
        if (manager1 && manager2) {
            // 두 명 모두 있는 경우: "담당자1, 담당자2"
            templateData['담당자'] = `${manager1}, ${manager2}`;
        } else if (manager1) {
            // 담당자1만 있는 경우: "담당자1"
            templateData['담당자'] = manager1;
        } else {
            // 아무도 없는 경우: "-"
            templateData['담당자'] = '-';
        }
        
        // 개별 담당자 필드도 빈 값 처리
        templateData['담당자1'] = manager1 || '-';
        templateData['담당자2'] = manager2 || '-';
        
        console.log('💼 담당자 정보 처리 완료:', {
            '담당자': templateData['담당자'],
            '담당자1': templateData['담당자1'],
            '담당자2': templateData['담당자2']
        });
    }

    /**
     * CurrencyManager에서 필드 타입에 맞는 단위 suffix 가져오기
     * @param {string} fieldType - 필드 타입 (investment_amount, price_per_share 등)
     * @returns {string} 단위 suffix (예: '억원', '원', '$M' 등)
     */
    getCurrencyUnitSuffix(fieldType) {
        try {
            // CurrencyManager가 로드되어 있는지 확인
            if (typeof window.CurrencyManager !== 'undefined' && window.CurrencyManager.getUnitForField) {
                const unitInfo = window.CurrencyManager.getUnitForField(fieldType);
                if (unitInfo && unitInfo.suffix) {
                    return unitInfo.suffix;
                }
            }
            
            // CurrencyManager가 없거나 단위 정보를 찾을 수 없는 경우 기본값 반환
            const defaultUnits = {
                'investment_amount': '억원',
                'company_valuation': '억원',
                'price_per_share': '원',
                'par_value': '원'
            };
            
            return defaultUnits[fieldType] || '원';
            
        } catch (error) {
            console.warn('단위 suffix 가져오기 실패, 기본값 사용:', error);
            return '원';
        }
    }

    addMetadataToBuffer(templateBuffer, data) {
        // 이 메서드는 더 이상 사용되지 않음 (processTemplate에서 직접 처리)
        // 하위 호환성을 위해 유지
        console.warn('⚠️ addMetadataToBuffer는 더 이상 사용되지 않습니다. processTemplate을 사용하세요.');
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
                '사용용도', '투자총괄', '투자전가치', '투자후가치'
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
            '투자총괄': 'investment_manager',
            '담당자': 'managers',
            '담당자1': 'manager1',
            '담당자2': 'manager2',
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