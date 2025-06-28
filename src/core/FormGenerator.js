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
        this.autoSaveTimer = null; // 자동 저장 타이머
        this.lastSaveData = null; // 마지막 저장된 데이터
        
        // 상태 관리 시스템 추가
        this.formState = {
            isDirty: false,          // 변경사항 있음
            isValid: false,          // 전체 유효성
            lastModified: null,      // 마지막 변경 시간
            fieldStates: new Map(),  // 각 필드의 상태
            validationErrors: new Map(), // 검증 오류
            completionRate: 0        // 완성률
        };
        this.changeHistory = [];     // 변경 이력
        this.maxHistorySize = 50;    // 맥스 이력 사이즈
        
        // 성능 최적화: requestAnimationFrame을 위한 플래그
        this.progressUpdatePending = false;
        this.progressUpdateFrame = null;
        
        // DOM 요소 캐시
        this.domElements = {
            progressFill: null,
            progressText: null,
            statusText: null
        };
        
        // 가시성 필드 캐시
        this.visibleFieldsCache = null;
        this.visibleFieldsCacheTimeout = null;
        
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
            
            // 초기 조건부 필드 상태 설정
            this.initializeConditionalFields();
            
            // 워크플로우 최적화 기능 초기화
            this.initializeWorkflowOptimization();
            
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
                helpText: fieldData.helpText || '', // 툴팁용 helpText 추가
                value: fieldData.default || '',
                validate: this.getValidator(fieldKey, fieldData),
                onChange: (value, fieldId) => this.handleFieldChange(fieldKey, value, fieldId),
                conditional: fieldData.conditional || false, // 조건부 필드 설정 추가
                conditionField: fieldData.conditionField || null, // 조건 참조 필드
                conditionValue: fieldData.conditionValue || null, // 조건 값
                conditionOperator: fieldData.conditionOperator || 'equals' // 조건 연산자 (equals, not_equals, greater_than, etc.)
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
        // 변경 이력 기록
        this.recordChange(fieldKey, value);
        
        // 필드 상태 업데이트
        this.updateFieldState(fieldKey, value, fieldId);
        
        // 투자방식 변경 시 동적 라벨 업데이트
        if (fieldKey === '투자방식') {
            this.updateDynamicLabels(value);
        }
        
        // 조건부 필드 표시/숨기기 로직 실행
        this.evaluateConditionalFields(fieldKey, value);
        
        // 자동 계산 실행
        this.performAutoCalculations(fieldKey, value);
        
        // 전체 상태 업데이트
        this.updateFormState();
        
        // 진행률 업데이트
        this.updateProgress();
        
        // 실시간 고급 검증 수행 (디바운스)
        this.triggerAdvancedValidation();
        
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
        // 이미 업데이트가 예약되어 있으면 스킵
        if (this.progressUpdatePending) return;
        
        this.progressUpdatePending = true;
        
        // requestAnimationFrame을 사용하여 DOM 업데이트 배치 처리
        this.progressUpdateFrame = requestAnimationFrame(() => {
            const allData = this.getAllFieldValues();
            const visibleFields = this.getVisibleFields();
            const filledFields = Object.entries(allData).filter(([key, value]) => 
                visibleFields.includes(key) && value !== null && value !== undefined && value !== ''
            ).length;
            
            const progress = visibleFields.length > 0 ? (filledFields / visibleFields.length) * 100 : 0;
            
            // 상태 업데이트
            this.formState.completionRate = progress;
            
            // DOM 요소 가져오기 (DOMCache 활용)
            if (!this.domElements.progressFill) {
                this.domElements.progressFill = window.DOMCache ? 
                    window.DOMCache.getElementById('progressFill') : 
                    document.getElementById('progressFill');
            }
            if (!this.domElements.progressText) {
                this.domElements.progressText = window.DOMCache ? 
                    window.DOMCache.getElementById('progressText') : 
                    document.getElementById('progressText');
            }
            if (!this.domElements.statusText) {
                this.domElements.statusText = window.DOMCache ? 
                    window.DOMCache.getElementById('statusText') : 
                    document.getElementById('statusText');
            }
            
            const { progressFill, progressText, statusText } = this.domElements;
            
            // 배치 DOM 업데이트
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}% 완료 (${filledFields}/${visibleFields.length})`;
            }
            
            if (statusText) {
                const validationSummary = this.getValidationSummary();
                
                if (progress === 100) {
                    if (validationSummary.hasErrors) {
                        statusText.textContent = `입력 완료, 하지만 ${validationSummary.errorCount}개 오류가 있습니다.`;
                    } else {
                        statusText.textContent = '입력 완료! 문서를 생성할 수 있습니다.';
                    }
                } else if (progress > 75) {
                    statusText.textContent = '거의 완료되었습니다.';
                } else if (progress > 50) {
                    statusText.textContent = '입력이 진행 중입니다.';
                } else if (progress > 25) {
                    statusText.textContent = '좋은 시작입니다. 계속해주세요.';
                } else {
                    statusText.textContent = '입력을 시작해주세요.';
                }
            }
            
            this.progressUpdatePending = false;
        });
    }

    setupEventListeners() {
        // 이벤트 리스너는 app.js에서 중앙 관리
        // 중복 등록 방지를 위해 이 메서드는 비워둠
        console.log('🎧 이벤트 리스너 설정 완료 (app.js에서 중앙 관리)');
    }

    initializeConditionalFields() {
        // 초기 로드 시 기본값에 따른 조건부 필드 상태 설정
        const investmentType = this.getFieldValue('투자방식') || '전환상환우선주'; // 기본값
        
        console.log('🔄 초기 조건부 필드 상태 설정:', investmentType);
        
        // 투자방식에 따른 동적 라벨 업데이트
        this.updateDynamicLabels(investmentType);
        
        // 조건부 필드 평가
        this.evaluateConditionalFields('투자방식', investmentType);
        
        console.log('✅ 초기 조건부 필드 상태 설정 완료');
    }
    
    // === 새로운 상태 관리 메서드들 ===
    
    recordChange(fieldKey, value) {
        const change = {
            field: fieldKey,
            value: value,
            timestamp: new Date(),
            sessionId: this.getSessionId()
        };
        
        this.changeHistory.push(change);
        
        // 이력 크기 제한
        if (this.changeHistory.length > this.maxHistorySize) {
            this.changeHistory = this.changeHistory.slice(-this.maxHistorySize);
        }
        
        // dirty 상태 설정
        this.formState.isDirty = true;
        this.formState.lastModified = new Date();
    }
    
    updateFieldState(fieldKey, value, fieldId) {
        const fieldState = {
            value: value,
            isValid: true,
            errors: [],
            lastModified: new Date(),
            isDirty: true
        };
        
        // 필드 검증
        if (this.dataValidator || window.DataValidator) {
            const validator = this.dataValidator || window.DataValidator;
            const validationResult = validator.validateField(fieldKey, value, this.getAllFieldValues());
            
            fieldState.isValid = validationResult.isValid;
            fieldState.errors = validationResult.errors || [];
        }
        
        this.formState.fieldStates.set(fieldKey, fieldState);
        
        // 검증 오류 업데이트
        if (fieldState.errors.length > 0) {
            this.formState.validationErrors.set(fieldKey, fieldState.errors);
        } else {
            this.formState.validationErrors.delete(fieldKey);
        }
    }
    
    updateFormState() {
        // 전체 유효성 검사
        const hasErrors = this.formState.validationErrors.size > 0;
        this.formState.isValid = !hasErrors;
        
        // 완성도 계산은 updateProgress에서 처리
        
        // 상태 변경 이벤트 발생
        this.emitStateChange();
    }
    
    getVisibleFields() {
        // 캐시가 유효하면 캐시된 값 반환
        if (this.visibleFieldsCache !== null) {
            return this.visibleFieldsCache;
        }
        
        const visibleFields = [];
        
        // DOMCache 사용하여 필드 요소 찾기
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            const fieldElement = window.DOMCache ? 
                window.DOMCache.querySelector(`[data-field-id="${fieldId}"]`) :
                document.querySelector(`[data-field-id="${fieldId}"]`);
                
            if (fieldElement && fieldElement.style.display !== 'none' && !fieldElement.getAttribute('aria-hidden')) {
                visibleFields.push(fieldKey);
            }
        }
        
        // 캐시 저장 및 자동 무효화 설정 (100ms 후)
        this.visibleFieldsCache = visibleFields;
        if (this.visibleFieldsCacheTimeout) {
            clearTimeout(this.visibleFieldsCacheTimeout);
        }
        this.visibleFieldsCacheTimeout = setTimeout(() => {
            this.visibleFieldsCache = null;
        }, 100);
        
        return visibleFields;
    }
    
    getValidationSummary() {
        const errorCount = this.formState.validationErrors.size;
        const hasErrors = errorCount > 0;
        const errors = [];
        
        for (const [fieldKey, fieldErrors] of this.formState.validationErrors.entries()) {
            errors.push({
                field: fieldKey,
                errors: fieldErrors
            });
        }
        
        return {
            hasErrors,
            errorCount,
            errors
        };
    }
    
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    emitStateChange() {
        // 커스텀 이벤트 발생
        const event = new CustomEvent('formStateChange', {
            detail: {
                formState: { ...this.formState },
                completionRate: this.formState.completionRate,
                isValid: this.formState.isValid,
                isDirty: this.formState.isDirty,
                errorCount: this.formState.validationErrors.size
            }
        });
        
        document.dispatchEvent(event);
    }
    
    getFormStateSnapshot() {
        return {
            state: { ...this.formState },
            data: this.getAllFieldValues(),
            history: [...this.changeHistory],
            timestamp: new Date()
        };
    }
    
    resetFormState() {
        this.formState.isDirty = false;
        this.formState.isValid = false;
        this.formState.lastModified = null;
        this.formState.fieldStates.clear();
        this.formState.validationErrors.clear();
        this.formState.completionRate = 0;
        this.changeHistory = [];
        
        this.emitStateChange();
    }
    
    // === 워크플로우 최적화 기능 ===
    
    initializeWorkflowOptimization() {
        console.log('🚀 워크플로우 최적화 기능 초기화 시작...');
        
        // 스마트 포커스 설정
        this.setupSmartFocus();
        
        // 입력 힌트 시스템 설정
        this.setupInputHints();
        
        // 진행률 애니메이션 설정
        this.setupProgressAnimations();
        
        // 키보드 네비게이션 설정
        this.setupKeyboardNavigation();
        
        // 자동 완성 기능
        this.setupAutoComplete();
        
        // 고급 검증 시스템 초기화
        this.initializeAdvancedValidation();
        
        console.log('✅ 워크플로우 최적화 기능 초기화 완료');
    }
    
    /**
     * 고급 검증 시스템 초기화
     */
    initializeAdvancedValidation() {
        console.log('🔍 고급 검증 시스템 초기화...');
        
        // 검증 디바운스 타이머
        this.validationTimer = null;
        
        // 검증 결과 캐시
        this.validationCache = new Map();
        
        // 검증 UI 요소 생성
        this.createValidationStatusUI();
        
        console.log('✅ 고급 검증 시스템 초기화 완료');
    }
    
    /**
     * 고급 검증 트리거 (디바운스)
     */
    triggerAdvancedValidation() {
        clearTimeout(this.validationTimer);
        this.validationTimer = setTimeout(() => {
            this.performAdvancedValidation();
        }, 500); // 500ms 디바운스
    }
    
    /**
     * 실시간 고급 검증 수행
     */
    async performAdvancedValidation() {
        try {
            const formData = this.getAllFieldValues();
            
            // 비어있는 데이터는 검증하지 않음
            if (!formData || Object.keys(formData).length === 0) {
                return;
            }
            
            // DataValidator를 사용한 고급 검증
            const validator = window.DataValidator;
            if (!validator) {
                console.warn('DataValidator를 사용할 수 없습니다.');
                return;
            }
            
            const validationResult = validator.validateAllFields(formData);
            
            // 검증 결과 시각화
            this.visualizeValidationResults(validationResult);
            
            // 검증 상태 업데이트
            this.updateValidationStatus(validationResult);
            
        } catch (error) {
            console.error('고급 검증 수행 중 오류:', error);
        }
    }
    
    /**
     * 검증 상태 UI 생성
     */
    createValidationStatusUI() {
        // 검증 상태 표시 영역이 이미 있는지 확인
        if (document.getElementById('validationStatus')) {
            return;
        }
        
        const actionBar = document.querySelector('.action-bar');
        if (!actionBar) return;
        
        const validationStatus = document.createElement('div');
        validationStatus.id = 'validationStatus';
        validationStatus.className = 'validation-status waiting';
        validationStatus.innerHTML = `
            <span class="validation-icon">🔍</span>
            <span class="validation-text">검증 대기 중</span>
        `;
        
        // 자동 저장 상태 옆에 추가
        const autoSaveStatus = actionBar.querySelector('#autoSaveStatus');
        if (autoSaveStatus) {
            actionBar.insertBefore(validationStatus, autoSaveStatus.nextSibling);
        } else {
            actionBar.appendChild(validationStatus);
        }
    }
    
    /**
     * 검증 결과 시각화
     */
    visualizeValidationResults(validationResult) {
        // 필드별 검증 결과 표시
        for (const [fieldName, result] of Object.entries(validationResult.fieldResults)) {
            this.updateFieldValidationUI(fieldName, result);
        }
        
        // 전체 검증 요약 표시
        this.showValidationSummary(validationResult.summary);
    }
    
    /**
     * 필드별 검증 UI 업데이트
     */
    updateFieldValidationUI(fieldName, result) {
        const fieldElement = document.querySelector(`[data-field-name="${fieldName}"]`);
        if (!fieldElement) return;
        
        const input = fieldElement.querySelector('.form-field-input');
        const errorElement = fieldElement.querySelector('.form-field-error');
        
        if (!input || !errorElement) return;
        
        // 기존 검증 클래스 제거
        fieldElement.classList.remove('validation-error', 'validation-warning', 'validation-success');
        input.classList.remove('validation-error', 'validation-warning', 'validation-success');
        
        if (!result.isValid && result.errors.length > 0) {
            // 오류 상태
            fieldElement.classList.add('validation-error');
            input.classList.add('validation-error');
            errorElement.innerHTML = result.errors.join('<br>');
            errorElement.style.display = 'block';
        } else if (result.warnings && result.warnings.length > 0) {
            // 경고 상태
            fieldElement.classList.add('validation-warning');
            input.classList.add('validation-warning');
            errorElement.innerHTML = `⚠️ ${result.warnings.join('<br>⚠️ ')}`;
            errorElement.style.display = 'block';
        } else if (result.isValid) {
            // 성공 상태
            fieldElement.classList.add('validation-success');
            input.classList.add('validation-success');
            errorElement.style.display = 'none';
        }
    }
    
    /**
     * 검증 상태 업데이트
     */
    updateValidationStatus(validationResult) {
        const statusElement = document.getElementById('validationStatus');
        if (!statusElement) return;
        
        const iconElement = statusElement.querySelector('.validation-icon');
        const textElement = statusElement.querySelector('.validation-text');
        
        if (!iconElement || !textElement) return;
        
        // 기존 상태 클래스 제거
        statusElement.classList.remove('waiting', 'validating', 'valid', 'invalid', 'warning');
        
        if (validationResult.isValid) {
            if (validationResult.summary.warnings > 0) {
                statusElement.classList.add('warning');
                iconElement.textContent = '⚠️';
                textElement.textContent = `검증 완료 (경고 ${validationResult.summary.warnings}개)`;
            } else {
                statusElement.classList.add('valid');
                iconElement.textContent = '✅';
                textElement.textContent = '검증 완료';
            }
        } else {
            statusElement.classList.add('invalid');
            iconElement.textContent = '❌';
            textElement.textContent = `검증 실패 (오류 ${validationResult.summary.invalidFields}개)`;
        }
    }
    
    /**
     * 검증 요약 표시
     */
    showValidationSummary(summary) {
        // 심각한 오류가 있는 경우에만 토스트 표시
        if (summary.invalidFields > 0) {
            const errorCount = summary.invalidFields;
            const warningCount = summary.warnings;
            
            let message = `검증 오류 ${errorCount}개 발견`;
            if (warningCount > 0) {
                message += `, 경고 ${warningCount}개`;
            }
            
            // 토스트로 간단히 알림 (너무 자주 표시되지 않도록 제한)
            if (!this.lastValidationToast || Date.now() - this.lastValidationToast > 5000) {
                window.showToast?.('⚠️ ' + message, 'warning');
                this.lastValidationToast = Date.now();
            }
        }
    }
    
    setupSmartFocus() {
        // Enter 키로 다음 필드로 이동
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input:not([type="submit"]), select, textarea')) {
                e.preventDefault();
                this.focusNextField(e.target);
            }
        });
        
        // 필드 완료 시 자동 다음 필드로 이동 (선택 필드)
        document.addEventListener('change', (e) => {
            if (e.target.matches('select')) {
                setTimeout(() => {
                    this.focusNextField(e.target);
                }, 100);
            }
        });
    }
    
    focusNextField(currentField) {
        const allFields = this.getVisibleFieldElements();
        const currentIndex = allFields.indexOf(currentField);
        
        if (currentIndex >= 0 && currentIndex < allFields.length - 1) {
            const nextField = allFields[currentIndex + 1];
            nextField.focus();
            
            // 스크롤 애니메이션
            nextField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // 포커스 하이라이트 효과
            this.highlightField(nextField);
        }
    }
    
    getVisibleFieldElements() {
        const fields = [];
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
            if (fieldElement && fieldElement.style.display !== 'none') {
                const input = fieldElement.querySelector('input, select, textarea');
                if (input && !input.disabled && !input.readOnly) {
                    fields.push(input);
                }
            }
        }
        return fields;
    }
    
    highlightField(fieldElement) {
        const fieldContainer = fieldElement.closest('.form-field');
        if (fieldContainer) {
            fieldContainer.classList.add('field-highlighted');
            setTimeout(() => {
                fieldContainer.classList.remove('field-highlighted');
            }, 2000);
        }
    }
    
    setupInputHints() {
        // 디바운스된 힌트 표시 함수 생성
        if (!this.debouncedShowInputHint) {
            this.debouncedShowInputHint = window.InvestmentHelpers?.debounce((target) => {
                this.showInputHint(target);
            }, 150) || ((target) => this.showInputHint(target));
        }
        
        // 이벤트 위임을 사용하여 formContainer에 한 번만 등록
        const container = this.formContainer || document.getElementById('formContainer');
        if (!container) return;
        
        // 기존 리스너 제거 (중복 방지)
        if (this.inputHintHandler) {
            container.removeEventListener('input', this.inputHintHandler);
            container.removeEventListener('focusin', this.focusHandler);
            container.removeEventListener('focusout', this.blurHandler);
        }
        
        // 입력 이벤트 핸들러
        this.inputHintHandler = (e) => {
            if (e.target.matches('input, textarea')) {
                this.debouncedShowInputHint(e.target);
            }
        };
        
        // 포커스 이벤트 핸들러
        this.focusHandler = (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.showFieldGuidance(e.target);
            }
        };
        
        // 블러 이벤트 핸들러
        this.blurHandler = (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.hideFieldGuidance(e.target);
            }
        };
        
        // 이벤트 위임으로 한 번만 등록
        container.addEventListener('input', this.inputHintHandler);
        container.addEventListener('focusin', this.focusHandler);
        container.addEventListener('focusout', this.blurHandler);
    }
    
    showInputHint(inputElement) {
        const fieldContainer = inputElement.closest('.form-field');
        const fieldName = fieldContainer?.getAttribute('data-field-name');
        
        if (!fieldName || !fieldContainer) return;
        
        const hint = this.getInputHint(fieldName, inputElement.value);
        if (hint) {
            let hintElement = fieldContainer.querySelector('.input-hint');
            if (!hintElement) {
                hintElement = document.createElement('div');
                hintElement.className = 'input-hint';
                fieldContainer.appendChild(hintElement);
            }
            hintElement.innerHTML = hint;
            hintElement.style.display = 'block';
        }
    }
    
    getInputHint(fieldName, value) {
        const hints = {
            '투자금액': (val) => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) {
                    return `💰 ${num}억원 = ${(num * 100000000).toLocaleString()}원`;
                }
                return null;
            },
            '투자단가': (val) => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) {
                    return `💎 주당 ${num.toLocaleString()}원`;
                }
                return null;
            },
            '투자전가치': (val) => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) {
                    return `🏢 기업가치 ${num}억원`;
                }
                return null;
            }
        };
        
        const hintFn = hints[fieldName];
        return hintFn ? hintFn(value) : null;
    }
    
    showFieldGuidance(inputElement) {
        const fieldContainer = inputElement.closest('.form-field');
        const fieldName = fieldContainer?.getAttribute('data-field-name');
        
        if (!fieldName) return;
        
        const guidance = this.getFieldGuidance(fieldName);
        if (guidance) {
            this.showTooltip(inputElement, guidance);
        }
    }
    
    getFieldGuidance(fieldName) {
        const guidances = {
            '투자대상': '회사의 정확한 법인명을 입력하세요 (예: 테크스타트업(주))',
            '투자금액': '투자하려는 금액을 억원 단위로 입력하세요',
            '투자방식': '투자 방식에 따라 표시되는 필드가 달라집니다',
            'Series': '현재 투자 라운드를 선택하세요',
            '상환이자': '우선주 상환 시 적용할 연이자율입니다',
            '지분율': '투자금액과 투자후가치를 바탕으로 자동 계산됩니다'
        };
        
        return guidances[fieldName] || null;
    }
    
    showTooltip(element, text) {
        // 기존 툴팁 제거
        this.hideAllTooltips();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'field-tooltip';
        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${rect.bottom + 5}px`;
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        // 자동 제거
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
    
    hideFieldGuidance(inputElement) {
        this.hideAllTooltips();
    }
    
    hideAllTooltips() {
        const tooltips = document.querySelectorAll('.field-tooltip');
        tooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
    }
    
    setupProgressAnimations() {
        // 진행률 바 애니메이션 개선
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.transition = 'width 0.3s ease-in-out';
        }
        
        // 섹션별 완성도 표시
        this.addSectionProgress();
    }
    
    addSectionProgress() {
        for (const [sectionKey, sectionId] of this.sections.entries()) {
            const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (sectionElement) {
                const header = sectionElement.querySelector('.form-section-header');
                if (header && !header.querySelector('.section-progress')) {
                    const progressElement = document.createElement('div');
                    progressElement.className = 'section-progress';
                    progressElement.innerHTML = '<span class="progress-text">0%</span>';
                    header.appendChild(progressElement);
                }
            }
        }
    }
    
    setupKeyboardNavigation() {
        // 섹션 접기/펼치기 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        e.preventDefault();
                        this.focusSection(parseInt(e.key) - 1);
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveData();
                        break;
                }
            }
        });
    }
    
    focusSection(sectionIndex) {
        const sectionKeys = Array.from(this.sections.keys());
        if (sectionIndex < sectionKeys.length) {
            const sectionKey = sectionKeys[sectionIndex];
            const sectionId = this.sections.get(sectionKey);
            const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
            
            if (sectionElement) {
                sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // 첫 번째 필드에 포커스
                const firstField = sectionElement.querySelector('input, select, textarea');
                if (firstField) {
                    setTimeout(() => {
                        firstField.focus();
                    }, 300);
                }
            }
        }
    }
    
    setupAutoComplete() {
        // 회사명 자동완성 (예시 데이터)
        const companyData = [
            '테크스타트업(주)', '이노베이션코퍼레이션(주)', 
            '디지털벤처스(주)', '스마트솔루션(주)'
        ];
        
        // 디바운스된 자동완성 함수 생성
        if (!this.debouncedAutoComplete) {
            this.debouncedAutoComplete = window.InvestmentHelpers?.debounce((target, data, value) => {
                this.showAutoComplete(target, data, value);
            }, 200) || ((target, data, value) => this.showAutoComplete(target, data, value));
        }
        
        // 이벤트 위임을 사용하여 formContainer에 이미 등록된 input 핸들러를 확장
        if (!this.autoCompleteHandler) {
            this.autoCompleteHandler = (e) => {
                const fieldContainer = e.target.closest('.form-field');
                const fieldName = fieldContainer?.getAttribute('data-field-name');
                
                if (fieldName === '투자대상' && e.target.value.length > 1) {
                    this.debouncedAutoComplete(e.target, companyData, e.target.value);
                }
            };
            
            // formContainer에 이벤트 위임으로 등록
            const container = this.formContainer || document.getElementById('formContainer');
            if (container) {
                container.addEventListener('input', this.autoCompleteHandler);
            }
        }
    }
    
    showAutoComplete(input, suggestions, query) {
        const filtered = suggestions.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length === 0) return;
        
        // 기존 자동완성 제거
        const existing = document.querySelector('.autocomplete-dropdown');
        if (existing) existing.remove();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        
        filtered.forEach(item => {
            const option = document.createElement('div');
            option.className = 'autocomplete-option';
            option.textContent = item;
            option.addEventListener('click', () => {
                input.value = item;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                dropdown.remove();
            });
            dropdown.appendChild(option);
        });
        
        const rect = input.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${rect.bottom}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${rect.width}px`;
        dropdown.style.zIndex = '1000';
        
        document.body.appendChild(dropdown);
        
        // 외부 클릭 시 제거
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && e.target !== input) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 0);
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
        
        // 투자방식에 따른 라벨 업데이트 (데이터 로드 시)
        if (data['투자방식']) {
            this.updateDynamicLabels(data['투자방식']);
        }
        
        // 조건부 필드 초기 평가 (데이터 로드 시)
        this.evaluateConditionalFields('init', null);
        
        this.updateProgress();
    }

    resetForm() {
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            window.FormField.setValue(fieldId, '');
        }
        
        // 상태 초기화
        this.resetFormState();
        
        // 조건부 필드 초기화
        this.initializeConditionalFields();
        
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

    evaluateConditionalFields(changedFieldKey, changedValue) {
        // 모든 조건부 필드를 검사하여 표시/숨기기 결정
        for (const [fieldKey, fieldId] of this.fields.entries()) {
            const fieldConfig = this.findFieldConfig(fieldKey);
            
            if (fieldConfig && fieldConfig.conditional) {
                const conditionField = fieldConfig.conditionField || changedFieldKey;
                const conditionValue = fieldConfig.conditionValue;
                const conditionOperator = fieldConfig.conditionOperator || 'equals';
                
                // 조건 필드가 변경된 필드와 일치하거나 초기 로드인 경우
                if (conditionField === changedFieldKey || changedFieldKey === 'init') {
                    const currentValue = changedFieldKey === conditionField ? changedValue : this.getFieldValue(conditionField);
                    const shouldShow = this.evaluateCondition(currentValue, conditionValue, conditionOperator);
                    
                    this.toggleFieldVisibility(fieldKey, fieldId, shouldShow);
                }
            }
        }
    }
    
    evaluateCondition(fieldValue, conditionValue, operator) {
        switch (operator) {
            case 'equals':
                return fieldValue === conditionValue;
            case 'not_equals':
                return fieldValue !== conditionValue;
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(conditionValue);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(conditionValue);
            case 'not_empty':
                return fieldValue && fieldValue.toString().trim() !== '';
            case 'empty':
                return !fieldValue || fieldValue.toString().trim() === '';
            case 'contains':
                return fieldValue && fieldValue.toString().includes(conditionValue);
            case 'in_list':
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case 'not_in_list':
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            default:
                return true;
        }
    }
    
    toggleFieldVisibility(fieldKey, fieldId, shouldShow) {
        const fieldElement = window.DOMCache ? 
            window.DOMCache.querySelector(`[data-field-id="${fieldId}"]`) :
            document.querySelector(`[data-field-id="${fieldId}"]`);
            
        if (fieldElement) {
            if (shouldShow) {
                fieldElement.style.display = '';
                fieldElement.removeAttribute('aria-hidden');
            } else {
                fieldElement.style.display = 'none';
                fieldElement.setAttribute('aria-hidden', 'true');
                // 숨겨진 필드의 값은 초기화하지 않음 (사용자가 다시 조건을 만족시킬 경우를 대비)
            }
            
            // 가시성 캐시 무효화
            this.visibleFieldsCache = null;
        }
    }
    
    getFieldValue(fieldKey) {
        const fieldId = this.fields.get(fieldKey);
        if (fieldId) {
            return window.FormField.getValue(fieldId);
        }
        return null;
    }
    
    updateDynamicLabels(investmentType) {
        const labelMappings = {
            '전환사채': {
                '인수주식수': '전환주식수',
                '지분율': '전환시지분율'
            },
            '보통주': {
                '인수주식수': '인수주식수',
                '지분율': '지분율'
            },
            '전환우선주': {
                '인수주식수': '인수주식수', 
                '지분율': '지분율'
            },
            '전환상환우선주': {
                '인수주식수': '인수주식수',
                '지분율': '지분율'
            }
        };
        
        const mapping = labelMappings[investmentType];
        if (!mapping) return;
        
        // 라벨 업데이트
        for (const [fieldKey, newLabel] of Object.entries(mapping)) {
            const fieldId = this.fields.get(fieldKey);
            if (fieldId) {
                const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    const labelElement = fieldElement.querySelector('.form-field-label');
                    if (labelElement) {
                        labelElement.textContent = newLabel;
                    }
                }
            }
        }
        
        // 도움말 텍스트도 업데이트
        this.updateHelpTexts(investmentType);
    }
    
    updateHelpTexts(investmentType) {
        const helpTextMappings = {
            '전환사채': {
                '인수주식수': '자동 계산됩니다 (전환 시 취득할 주식수)',
                '지분율': '자동 계산됩니다 (전환 시 예상 지분율)'
            },
            '보통주': {
                '인수주식수': '자동 계산됩니다 (투자금액(억원) × 1억 ÷ 투자단가)',
                '지분율': '자동 계산됩니다 (투자금액 ÷ 투자후가치 × 100)'
            },
            '전환우선주': {
                '인수주식수': '자동 계산됩니다 (투자금액(억원) × 1억 ÷ 투자단가)',
                '지분율': '자동 계산됩니다 (투자금액 ÷ 투자후가치 × 100)'
            },
            '전환상환우선주': {
                '인수주식수': '자동 계산됩니다 (투자금액(억원) × 1억 ÷ 투자단가)',
                '지분율': '자동 계산됩니다 (투자금액 ÷ 투자후가치 × 100)'
            }
        };
        
        const mapping = helpTextMappings[investmentType];
        if (!mapping) return;
        
        for (const [fieldKey, newHelpText] of Object.entries(mapping)) {
            const fieldId = this.fields.get(fieldKey);
            if (fieldId) {
                const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    const helpElement = fieldElement.querySelector('.form-field-help');
                    if (helpElement) {
                        helpElement.textContent = newHelpText;
                    }
                }
            }
        }
    }

    autoSave() {
        // 자동 저장 설정이 활성화된 경우
        const settings = window.StorageManager.loadSettings();
        if (settings.autoSave && this.formState.isDirty) {
            // 이전 타이머 취소
            clearTimeout(this.autoSaveTimer);
            
            // 디바운스 후 자동 저장 실행
            this.autoSaveTimer = setTimeout(() => {
                this.performAutoSave();
            }, settings.autoSaveInterval || 30000);
            
            // 상태 표시 업데이트
            this.updateAutoSaveStatus('대기 중');
        }
    }
    
    performAutoSave() {
        try {
            console.log('💾 자동 저장 시작...');
            
            // 상태 표시
            this.updateAutoSaveStatus('저장 중');
            
            // 데이터 수집 및 검증
            const data = this.getAllFieldValues();
            const hasData = Object.values(data).some(value => 
                value !== null && value !== undefined && value !== ''
            );
            
            if (!hasData) {
                console.log('💾 빈 데이터로 인해 자동 저장 건너뛜');
                this.updateAutoSaveStatus('대기 중');
                return;
            }
            
            // 데이터 저장
            const success = window.StorageManager.save(data);
            
            if (success) {
                console.log('✅ 자동 저장 성공');
                this.updateAutoSaveStatus('저장됨', new Date());
                
                // 성공 토스트 (자동 숨김)
                if (window.Toast) {
                    window.Toast.success('자동 저장됨', {
                        duration: 2000,
                        position: 'bottom-right'
                    });
                }
            } else {
                console.error('❌ 자동 저장 실패');
                this.updateAutoSaveStatus('오류');
                
                if (window.Toast) {
                    window.Toast.error('자동 저장 실패');
                }
            }
            
        } catch (error) {
            console.error('❌ 자동 저장 오류:', error);
            this.updateAutoSaveStatus('오류');
            
            if (window.Toast) {
                window.Toast.error('자동 저장 오류: ' + error.message);
            }
        } finally {
            // 다음 자동 저장 예약
            this.scheduleNextAutoSave();
        }
    }
    
    scheduleNextAutoSave() {
        const settings = window.StorageManager.loadSettings();
        if (settings.autoSave) {
            setTimeout(() => {
                this.updateAutoSaveStatus('대기 중');
            }, 3000); // 3초 후 상태 리셋
        }
    }
    
    updateAutoSaveStatus(status, timestamp = null) {
        const statusElement = document.getElementById('autoSaveStatus');
        if (statusElement) {
            let statusText = '';
            let className = 'auto-save-status';
            
            switch (status) {
                case '대기 중':
                    statusText = '🔄 자동 저장 대기 중';
                    className += ' waiting';
                    break;
                case '저장 중':
                    statusText = '💾 저장 중...';
                    className += ' saving';
                    break;
                case '저장됨':
                    const timeStr = timestamp ? timestamp.toLocaleTimeString() : '';
                    statusText = `✅ 자동 저장됨 ${timeStr}`;
                    className += ' saved';
                    break;
                case '오류':
                    statusText = '❌ 자동 저장 실패';
                    className += ' error';
                    break;
            }
            
            statusElement.textContent = statusText;
            statusElement.className = className;
        }
    }
    
    /**
     * 컴포넌트 정리 (메모리 누수 방지)
     */
    cleanup() {
        // 이벤트 리스너 제거
        const container = this.formContainer || document.getElementById('formContainer');
        if (container) {
            if (this.inputHintHandler) {
                container.removeEventListener('input', this.inputHintHandler);
                container.removeEventListener('focusin', this.focusHandler);
                container.removeEventListener('focusout', this.blurHandler);
            }
            if (this.autoCompleteHandler) {
                container.removeEventListener('input', this.autoCompleteHandler);
            }
        }
        
        // requestAnimationFrame 취소
        if (this.progressUpdateFrame) {
            cancelAnimationFrame(this.progressUpdateFrame);
        }
        
        // 타이머 정리
        if (this.visibleFieldsCacheTimeout) {
            clearTimeout(this.visibleFieldsCacheTimeout);
        }
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // 캐시 초기화
        this.visibleFieldsCache = null;
        this.domElements = {
            progressFill: null,
            progressText: null,
            statusText: null
        };
        
        // 참조 정리
        this.sections.clear();
        this.fields.clear();
        this.formState.fieldStates.clear();
        this.formState.validationErrors.clear();
        this.changeHistory = [];
        
        console.log('🧹 FormGenerator 정리 완료');
    }
}

window.FormGenerator = new FormGenerator(); 