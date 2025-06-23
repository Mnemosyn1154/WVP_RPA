/**
 * FormGenerator 클래스
 * 동적 폼 생성 및 관리
 */

class FormGenerator {
    constructor(variablesConfig = null, dataValidator = null, calculationEngine = null) {
        this.variables = variablesConfig;
        this.dataValidator = dataValidator;
        this.calculationEngine = calculationEngine;
        this.formContainer = null;
        this.sections = new Map();
        this.fields = new Map();
        this.isInitialized = false;
        
        // 자동 초기화 제거 - 명시적으로 init() 호출 필요
        console.log('🔧 FormGenerator 인스턴스 생성됨 (초기화 대기 중...)');
    }

    async init() {
        // 중복 초기화 방지
        if (this.isInitialized) {
            console.log('⚠️ FormGenerator가 이미 초기화되었습니다. 중복 초기화를 건너뜁니다.');
            return;
        }
        
        try {
            console.log('🔧 FormGenerator 초기화 시작...');
            
            // 변수가 전달되지 않은 경우에만 로드
            if (!this.variables) {
                console.log('📁 변수 설정 로드 중...');
                await this.loadVariables();
            } else {
                console.log('✅ 변수 설정이 이미 전달됨');
            }
            
            // DOM과 컴포넌트가 준비될 때까지 대기
            console.log('⏳ DOM과 컴포넌트 로딩 대기 중...');
            await this.waitForDOMAndComponents();
            console.log('✅ DOM과 컴포넌트 준비 완료');
            
            this.formContainer = document.getElementById('formContainer');
            if (this.formContainer) {
                console.log('📋 폼 생성 시작...');
                this.generateForm();
                this.isInitialized = true; // 초기화 완료 플래그 설정
                console.log('✅ FormGenerator 초기화 완료');
            } else {
                throw new Error('formContainer 요소를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ FormGenerator 초기화 실패 - 상세 에러:', error);
            console.error('❌ 에러 스택:', error.stack);
            console.error('❌ 에러 메시지:', error.message);
            
            // 에러 상태 정보 출력
            console.log('🔍 디버그 정보:');
            console.log('- variables 존재:', !!this.variables);
            console.log('- FormSection 존재:', !!window.FormSection);
            console.log('- FormField 존재:', !!window.FormField);
            console.log('- formContainer 존재:', !!this.formContainer);
            
            throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
        }
    }

    async waitForDOMAndComponents() {
        // DOM 준비 대기
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // 컴포넌트 로딩 대기
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기
        
        while (attempts < maxAttempts) {
            if (window.FormSection && window.FormField) {
                return; // 컴포넌트가 로드됨
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.FormSection || !window.FormField) {
            throw new Error('FormSection 또는 FormField 컴포넌트를 로드할 수 없습니다.');
        }
    }

    async loadVariables() {
        try {
            const response = await fetch('src/config/variables.json');
            this.variables = await response.json();
        } catch (error) {
            console.error('변수 설정 로드 실패:', error);
            throw error;
        }
    }

    generateForm() {
        try {
            console.log('📋 generateForm 시작');
            console.log('- variables 존재:', !!this.variables);
            console.log('- formContainer 존재:', !!this.formContainer);
            
            if (!this.variables || !this.formContainer) {
                throw new Error(`필수 요소 누락 - variables: ${!!this.variables}, formContainer: ${!!this.formContainer}`);
            }

            // variables 구조 확인
            if (!this.variables.sections) {
                throw new Error('variables.sections가 정의되지 않았습니다.');
            }
            
            console.log('📁 섹션 수:', Object.keys(this.variables.sections).length);

            // 로딩 스피너 제거
            const loadingSpinner = this.formContainer.querySelector('#loadingSpinner');
            if (loadingSpinner) {
                loadingSpinner.remove();
                console.log('🔄 로딩 스피너 제거됨');
            }

            // 섹션별로 폼 생성
            let sectionCount = 0;
            for (const [sectionKey, sectionData] of Object.entries(this.variables.sections)) {
                try {
                    console.log(`📝 섹션 생성 중: ${sectionKey}`);
                    const sectionElement = this.createSection(sectionKey, sectionData);
                    this.formContainer.appendChild(sectionElement);
                    sectionCount++;
                    console.log(`✅ 섹션 생성 완료: ${sectionKey}`);
                } catch (sectionError) {
                    console.error(`❌ 섹션 생성 실패 (${sectionKey}):`, sectionError);
                    throw new Error(`섹션 '${sectionKey}' 생성 실패: ${sectionError.message}`);
                }
            }
            
            console.log(`✅ 총 ${sectionCount}개 섹션 생성 완료`);

            // 액션 바 표시
            const actionBar = document.getElementById('actionBar');
            if (actionBar) {
                actionBar.style.display = 'flex';
                console.log('🎮 액션 바 표시됨');
            } else {
                console.warn('⚠️ actionBar 요소를 찾을 수 없습니다.');
            }

            // 이벤트 리스너 설정
            try {
                this.setupEventListeners();
                console.log('🎧 이벤트 리스너 설정 완료');
            } catch (listenerError) {
                console.error('❌ 이벤트 리스너 설정 실패:', listenerError);
                // 이벤트 리스너 실패는 치명적이지 않으므로 계속 진행
            }
            
            console.log('🎉 generateForm 완료');
            
        } catch (error) {
            console.error('❌ generateForm 실패:', error);
            console.error('❌ 에러 스택:', error.stack);
            throw error;
        }
    }

    createSection(sectionKey, sectionData) {
        try {
            console.log(`🔧 createSection 시작: ${sectionKey}`);
            console.log('- sectionData:', sectionData);
            
            if (!sectionData) {
                throw new Error(`섹션 데이터가 없습니다: ${sectionKey}`);
            }
            
            if (!sectionData.title) {
                throw new Error(`섹션 제목이 없습니다: ${sectionKey}`);
            }
            
            if (!window.FormSection) {
                throw new Error('FormSection 컴포넌트가 로드되지 않았습니다.');
            }

            const section = window.FormSection.create({
                title: sectionData.title,
                description: sectionData.description,
                collapsible: true,
                collapsed: sectionData.collapsed || false
            });

            if (!section) {
                throw new Error(`FormSection.create()가 null을 반환했습니다: ${sectionKey}`);
            }

            const sectionId = section.getAttribute('data-section-id');
            if (!sectionId) {
                throw new Error(`섹션 ID를 가져올 수 없습니다: ${sectionKey}`);
            }
            
            this.sections.set(sectionKey, sectionId);
            console.log(`📝 섹션 ID 저장: ${sectionKey} -> ${sectionId}`);

            // 섹션에 필드들 추가
            if (sectionData.fields && typeof sectionData.fields === 'object') {
                const fieldCount = Object.keys(sectionData.fields).length;
                console.log(`📋 필드 생성 시작: ${fieldCount}개`);
                
                let createdFields = 0;
                for (const [fieldKey, fieldData] of Object.entries(sectionData.fields)) {
                    try {
                        console.log(`🔧 필드 생성 중: ${fieldKey}`);
                        const fieldElement = this.createField(fieldKey, fieldData);
                        const content = section.querySelector('.form-section-content');
                        
                        if (!content) {
                            throw new Error(`섹션 콘텐츠 영역을 찾을 수 없습니다: ${sectionKey}`);
                        }
                        
                        content.appendChild(fieldElement);
                        createdFields++;
                        console.log(`✅ 필드 생성 완료: ${fieldKey}`);
                    } catch (fieldError) {
                        console.error(`❌ 필드 생성 실패 (${fieldKey}):`, fieldError);
                        throw new Error(`필드 '${fieldKey}' 생성 실패: ${fieldError.message}`);
                    }
                }
                
                console.log(`✅ 총 ${createdFields}개 필드 생성 완료`);
            } else {
                console.warn(`⚠️ 섹션에 필드가 없습니다: ${sectionKey}`);
            }

            console.log(`🎉 createSection 완료: ${sectionKey}`);
            return section;
            
        } catch (error) {
            console.error(`❌ createSection 실패 (${sectionKey}):`, error);
            console.error('❌ 에러 스택:', error.stack);
            throw error;
        }
    }

    createField(fieldKey, fieldData) {
        try {
            console.log(`🔧 createField 시작: ${fieldKey}`);
            console.log('- fieldData:', fieldData);
            
            if (!fieldData) {
                throw new Error(`필드 데이터가 없습니다: ${fieldKey}`);
            }
            
            if (!window.FormField) {
                throw new Error('FormField 컴포넌트가 로드되지 않았습니다.');
            }

            const fieldConfig = {
                label: fieldKey, // variables.json에 label이 없으므로 fieldKey 사용
                name: fieldKey,
                type: this.getFieldType(fieldData.type),
                required: fieldData.required || false,
                placeholder: fieldData.placeholder || '',
                help: fieldData.helpText || '', // description -> helpText
                value: fieldData.default || '',
                validate: this.getValidator(fieldKey, fieldData),
                onChange: (value, fieldId) => this.handleFieldChange(fieldKey, value, fieldId),
                conditional: fieldData.conditional || false // 조건부 필드 설정 추가
            };

            // 숫자 필드 추가 설정
            if (fieldData.type === 'number') {
                fieldConfig.min = fieldData.min;
                fieldConfig.max = fieldData.max;
                fieldConfig.step = fieldData.step || 1;
                fieldConfig.unit = fieldData.unit || '';
            }

            // 화폐 필드 설정
            if (fieldData.currencyField) {
                fieldConfig.currencyField = true;
                fieldConfig.fieldType = fieldData.fieldType || 'default';
            }

            // 선택 필드 옵션
            if (fieldData.options) {
                fieldConfig.options = fieldData.options.map(opt => ({
                    value: opt.value || opt,
                    label: opt.label || opt
                }));
            }

            // 읽기 전용 필드 설정
            if (fieldData.readonly || fieldData.calculated) {
                fieldConfig.readonly = true;
            }

            console.log(`📝 필드 설정:`, fieldConfig);
            
            const fieldElement = window.FormField.create(fieldConfig);
            
            if (!fieldElement) {
                throw new Error(`FormField.create()가 null을 반환했습니다: ${fieldKey}`);
            }
            
            const fieldId = fieldElement.getAttribute('data-field-id');
            if (!fieldId) {
                throw new Error(`필드 ID를 가져올 수 없습니다: ${fieldKey}`);
            }
            
            this.fields.set(fieldKey, fieldId);
            console.log(`✅ createField 완료: ${fieldKey} -> ${fieldId}`);

            return fieldElement;
            
        } catch (error) {
            console.error(`❌ createField 실패 (${fieldKey}):`, error);
            console.error('❌ 에러 스택:', error.stack);
            throw error;
        }
    }

    getFieldType(type) {
        const typeMapping = {
            'text': 'text',
            'number': 'number',
            'currency': 'number',
            'percentage': 'number',
            'select': 'select',
            'textarea': 'textarea',
            'email': 'email',
            'tel': 'tel',
            'date': 'date'
        };
        
        return typeMapping[type] || 'text';
    }

    getValidator(fieldKey, fieldData) {
        return (value) => {
            const validator = this.dataValidator || window.DataValidator;
            if (!validator) return true;
            
            const result = validator.validateField(fieldKey, value, this.getAllFieldValues());
            
            if (!result.isValid && result.errors.length > 0) {
                return result.errors[0];
            }
            
            return true;
        };
    }

    handleFieldChange(fieldKey, value, fieldId) {
        // 자동 계산 실행
        this.performAutoCalculations(fieldKey, value);
        
        // 진행률 업데이트
        this.updateProgress();
        
        // 자동 저장 (설정된 경우)
        this.autoSave();
    }

    performAutoCalculations(changedField, value) {
        const calculator = this.calculationEngine || window.CalculationEngine;
        if (!calculator) return;
        
        const allData = this.getAllFieldValues();
        const calculableFields = calculator.getCalculableFields();
        
        for (const fieldName of calculableFields) {
            if (fieldName === changedField) continue; // 변경된 필드는 제외
            
            if (calculator.canCalculate(fieldName, allData)) {
                const calculatedValue = calculator.calculate(fieldName, allData);
                
                if (calculatedValue !== null) {
                    this.setFieldValue(fieldName, calculatedValue);
                }
            }
        }
    }

    getAllFieldValues() {
        const data = {};
        
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            const value = window.FormField.getValue(fieldId);
            data[fieldKey] = value;
        }
        
        return data;
    }

    setFieldValue(fieldKey, value) {
        const fieldId = this.fields.get(fieldKey);
        if (fieldId) {
            // 숫자 필드는 포맷팅
            const formattedValue = this.formatFieldValue(fieldKey, value);
            window.FormField.setValue(fieldId, formattedValue);
        }
    }

    formatFieldValue(fieldKey, value) {
        // 변수 설정에서 타입 확인
        const fieldConfig = this.findFieldConfig(fieldKey);
        
        if (!fieldConfig) return value;
        
        switch (fieldConfig.type) {
            case 'currency':
                return window.CalculationEngine.formatNumber(value);
            case 'percentage':
                return window.CalculationEngine.formatPercentage(value);
            case 'number':
                return window.CalculationEngine.formatNumber(value);
            default:
                return value;
        }
    }

    findFieldConfig(fieldKey) {
        for (const sectionData of Object.values(this.variables.sections)) {
            if (sectionData.fields[fieldKey]) {
                return sectionData.fields[fieldKey];
            }
        }
        return null;
    }

    updateProgress() {
        const allData = this.getAllFieldValues();
        const totalFields = Object.keys(allData).length;
        const filledFields = Object.values(allData).filter(value => 
            value !== null && value !== undefined && value !== ''
        ).length;
        
        const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
        
        // 진행률 바 업데이트
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const statusText = document.getElementById('statusText');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}% 완료`;
        }
        
        if (statusText) {
            if (progress === 100) {
                statusText.textContent = '입력 완료! 문서를 생성할 수 있습니다.';
            } else if (progress > 50) {
                statusText.textContent = '입력이 진행 중입니다.';
            } else {
                statusText.textContent = '입력을 계속해주세요.';
            }
        }
    }

    setupEventListeners() {
        // 이벤트 리스너는 app.js에서 중앙 관리
        // 중복 등록 방지를 위해 이 메서드는 비워둠
        console.log('🎧 이벤트 리스너 설정 완료 (app.js에서 중앙 관리)');
    }

    saveData() {
        const data = this.getAllFieldValues();
        const success = window.StorageManager.save(data);
        
        if (success) {
            window.Toast.success('데이터가 저장되었습니다.');
        } else {
            window.Toast.error('데이터 저장에 실패했습니다.');
        }
    }

    loadData() {
        const data = window.StorageManager.load();
        
        if (data) {
            this.populateForm(data);
            window.Toast.success('데이터를 불러왔습니다.');
        } else {
            window.Toast.info('저장된 데이터가 없습니다.');
        }
    }

    clearData() {
        window.Modal.confirm('모든 입력 데이터를 초기화하시겠습니까?', '데이터 초기화')
            .then(confirmed => {
                if (confirmed) {
                    this.resetForm();
                    window.Toast.success('데이터가 초기화되었습니다.');
                }
            });
    }

    populateForm(data) {
        for (const [fieldKey, value] of Object.entries(data)) {
            this.setFieldValue(fieldKey, value);
        }
        this.updateProgress();
    }

    resetForm() {
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            window.FormField.setValue(fieldId, '');
        }
        this.updateProgress();
    }

    showPreview() {
        const data = this.getAllFieldValues();
        const validation = window.DataValidator.validateAllFields(data);
        
        let content = '<div class="preview-content">';
        
        // 검증 결과
        if (!validation.isValid) {
            content += '<div class="preview-errors">';
            content += '<h4>⚠️ 입력 오류</h4>';
            content += '<ul>';
            validation.summary.errors.forEach(error => {
                content += `<li>${error}</li>`;
            });
            content += '</ul></div>';
        }
        
        // 데이터 미리보기
        content += '<div class="preview-data">';
        content += '<h4>📋 입력 데이터</h4>';
        content += '<table class="preview-table">';
        
        for (const [key, value] of Object.entries(data)) {
            if (value) {
                content += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
        }
        
        content += '</table></div></div>';
        
        window.Modal.show({
            title: '데이터 미리보기',
            content: content,
            size: 'large',
            buttons: [{ text: '닫기', type: 'secondary' }]
        });
    }

    generateDocument(type) {
        const data = this.getAllFieldValues();
        const validation = window.DataValidator.validateAllFields(data);
        
        if (!validation.isValid) {
            window.Toast.error('입력 데이터에 오류가 있습니다. 미리보기에서 확인해주세요.');
            return;
        }
        
        // 문서 생성 로직 (TemplateProcessor 사용)
        window.TemplateProcessor.generateDocument(type, data)
            .then(() => {
                window.Toast.success(`${type === 'termsheet' ? 'Term Sheet' : '예비투심위 보고서'}가 생성되었습니다.`);
            })
            .catch(error => {
                window.Toast.error('문서 생성에 실패했습니다: ' + error.message);
            });
    }

    generateAllDocuments() {
        const data = this.getAllFieldValues();
        const validation = window.DataValidator.validateAllFields(data);
        
        if (!validation.isValid) {
            window.Toast.error('입력 데이터에 오류가 있습니다. 미리보기에서 확인해주세요.');
            return;
        }
        
        window.Modal.confirm('모든 문서를 생성하시겠습니까?', '전체 문서 생성')
            .then(confirmed => {
                if (confirmed) {
                    this.generateDocument('termsheet');
                    this.generateDocument('preliminary');
                }
            });
    }

    autoSave() {
        // 자동 저장 설정이 활성화된 경우
        const settings = window.StorageManager.loadSettings();
        if (settings.autoSave) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveData();
            }, settings.autoSaveInterval || 30000);
        }
    }
}

window.FormGenerator = new FormGenerator(); 