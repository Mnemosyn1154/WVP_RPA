/**
 * FormGenerator 클래스
 * 동적 폼 생성 및 관리
 */

class FormGenerator {
    constructor() {
        this.variables = null;
        this.formContainer = null;
        this.sections = new Map();
        this.fields = new Map();
        
        this.init();
    }

    async init() {
        try {
            await this.loadVariables();
            this.formContainer = document.getElementById('formContainer');
            if (this.formContainer) {
                this.generateForm();
            }
        } catch (error) {
            console.error('FormGenerator 초기화 실패:', error);
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
        if (!this.variables || !this.formContainer) return;

        // 로딩 스피너 제거
        const loadingSpinner = this.formContainer.querySelector('#loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.remove();
        }

        // 섹션별로 폼 생성
        for (const [sectionKey, sectionData] of Object.entries(this.variables.sections)) {
            const sectionElement = this.createSection(sectionKey, sectionData);
            this.formContainer.appendChild(sectionElement);
        }

        // 액션 바 표시
        const actionBar = document.getElementById('actionBar');
        if (actionBar) {
            actionBar.style.display = 'flex';
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    createSection(sectionKey, sectionData) {
        const section = window.FormSection.create({
            title: sectionData.title,
            description: sectionData.description,
            collapsible: true,
            collapsed: sectionData.collapsed || false
        });

        const sectionId = section.getAttribute('data-section-id');
        this.sections.set(sectionKey, sectionId);

        // 섹션에 필드들 추가
        for (const [fieldKey, fieldData] of Object.entries(sectionData.variables)) {
            const fieldElement = this.createField(fieldKey, fieldData);
            const content = section.querySelector('.form-section-content');
            content.appendChild(fieldElement);
        }

        return section;
    }

    createField(fieldKey, fieldData) {
        const fieldConfig = {
            label: fieldData.label,
            name: fieldKey,
            type: this.getFieldType(fieldData.type),
            required: fieldData.required || false,
            placeholder: fieldData.placeholder || '',
            help: fieldData.description || '',
            value: fieldData.default || '',
            validate: this.getValidator(fieldKey, fieldData),
            onChange: (value, fieldId) => this.handleFieldChange(fieldKey, value, fieldId)
        };

        // 숫자 필드 추가 설정
        if (fieldData.type === 'number') {
            fieldConfig.min = fieldData.min;
            fieldConfig.max = fieldData.max;
            fieldConfig.step = fieldData.step || 1;
        }

        // 선택 필드 옵션
        if (fieldData.options) {
            fieldConfig.options = fieldData.options.map(opt => ({
                value: opt.value || opt,
                label: opt.label || opt
            }));
        }

        const fieldElement = window.FormField.create(fieldConfig);
        const fieldId = fieldElement.getAttribute('data-field-id');
        this.fields.set(fieldKey, fieldId);

        return fieldElement;
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
            const result = window.DataValidator.validateField(fieldKey, value, this.getAllFieldValues());
            
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
        const allData = this.getAllFieldValues();
        const calculableFields = window.CalculationEngine.getCalculableFields();
        
        for (const fieldName of calculableFields) {
            if (fieldName === changedField) continue; // 변경된 필드는 제외
            
            if (window.CalculationEngine.canCalculate(fieldName, allData)) {
                const calculatedValue = window.CalculationEngine.calculate(fieldName, allData);
                
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
            if (sectionData.variables[fieldKey]) {
                return sectionData.variables[fieldKey];
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
        // 저장 버튼
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveData());
        }

        // 불러오기 버튼
        const loadBtn = document.getElementById('loadBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadData());
        }

        // 초기화 버튼
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearData());
        }

        // 미리보기 버튼
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.showPreview());
        }

        // 문서 생성 버튼들
        const generateTermSheetBtn = document.getElementById('generateTermSheetBtn');
        if (generateTermSheetBtn) {
            generateTermSheetBtn.addEventListener('click', () => this.generateDocument('termsheet'));
        }

        const generatePreliminaryBtn = document.getElementById('generatePreliminaryBtn');
        if (generatePreliminaryBtn) {
            generatePreliminaryBtn.addEventListener('click', () => this.generateDocument('preliminary'));
        }

        const generateAllBtn = document.getElementById('generateAllBtn');
        if (generateAllBtn) {
            generateAllBtn.addEventListener('click', () => this.generateAllDocuments());
        }
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