/**
 * 투자문서 생성기 - 메인 애플리케이션
 * @author Investment Document Generator
 * @version 1.0
 * @since 2025-01-23
 */

// =============================================================================
// 🚀 애플리케이션 초기화
// =============================================================================

class InvestmentDocumentApp {
  constructor() {
    this.formGenerator = null;
    this.dataValidator = null;
    this.calculationEngine = null;
    this.templateProcessor = null;
    this.storage = null;
    
    this.formData = {};
    this.isInitialized = false;
    
    // 진행률 추적
    this.progress = {
      current: 0,
      total: 21, // 총 21개 변수
      percentage: 0
    };
    
    this.init();
  }

  /**
   * 애플리케이션 초기화
   */
  async init() {
    try {
      console.log('🚀 투자문서 생성기 초기화 시작...');
      
      // DOM이 준비될 때까지 대기
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeApp());
      } else {
        this.initializeApp();
      }
      
    } catch (error) {
      console.error('❌ 초기화 중 오류 발생:', error);
      this.showError('애플리케이션 초기화에 실패했습니다.');
    }
  }

  /**
   * 메인 초기화 로직
   */
  async initializeApp() {
    try {
      // 1. 브라우저 지원 확인
      this.checkBrowserSupport();
      
      // 2. 설정 파일 로드
      await this.loadConfiguration();
      
      // 3. 핵심 모듈 초기화
      await this.initializeModules();
      
      // 4. UI 초기화
      this.initializeUI();
      
      // 5. 이벤트 리스너 등록
      this.attachEventListeners();
      
      // 6. 저장된 데이터 복원
      this.restoreFormData();
      
      this.isInitialized = true;
      console.log('✅ 투자문서 생성기 초기화 완료!');
      
      // 성공 메시지 표시
      this.showToast('애플리케이션이 성공적으로 초기화되었습니다!', 'success');
      
    } catch (error) {
      console.error('❌ 애플리케이션 초기화 실패:', error);
      this.showError(`초기화 실패: ${error.message}`);
    }
  }

  /**
   * 브라우저 지원 여부 확인
   */
  checkBrowserSupport() {
    const requiredFeatures = ['localStorage', 'fileReader', 'download'];
    const unsupportedFeatures = [];
    
    requiredFeatures.forEach(feature => {
      if (!InvestmentHelpers.isSupported(feature)) {
        unsupportedFeatures.push(feature);
      }
    });
    
    if (unsupportedFeatures.length > 0) {
      throw new Error(`브라우저가 다음 기능을 지원하지 않습니다: ${unsupportedFeatures.join(', ')}`);
    }
  }

  /**
   * 설정 파일 로드
   */
  async loadConfiguration() {
    try {
      const configFiles = [
        'src/config/variables.json',
        'src/config/templates.json',
        'src/config/validation.json'
      ];
      
      const configs = await Promise.all(
        configFiles.map(file => fetch(file).then(res => res.json()))
      );
      
      this.variablesConfig = configs[0];
      this.templatesConfig = configs[1];
      this.validationConfig = configs[2];
      
      console.log('📁 설정 파일 로드 완료');
      
    } catch (error) {
      throw new Error(`설정 파일 로드 실패: ${error.message}`);
    }
  }

  /**
   * 핵심 모듈 초기화
   */
  async initializeModules() {
    try {
      // 데이터 검증기 초기화
      this.dataValidator = new DataValidator(this.validationConfig);
      
      // 계산 엔진 초기화
      this.calculationEngine = new CalculationEngine();
      
      // 폼 생성기 초기화
      this.formGenerator = new FormGenerator(
        this.variablesConfig,
        this.dataValidator,
        this.calculationEngine
      );
      
      // FormGenerator 명시적 초기화
      await this.formGenerator.init();
      
      // 템플릿 처리기 초기화
      this.templateProcessor = new TemplateProcessor(this.templatesConfig);
      
      // 로컬 스토리지 관리자 초기화
      this.storage = new StorageManager();
      
      console.log('🔧 핵심 모듈 초기화 완료');
      
    } catch (error) {
      throw new Error(`모듈 초기화 실패: ${error.message}`);
    }
  }

  /**
   * UI 초기화
   */
  initializeUI() {
    try {
      // 로딩 스피너 숨기기
      const loadingSpinner = document.getElementById('loadingSpinner');
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
      
      // 화폐 선택기 초기화
      this.initializeCurrencySelector();
      
      // 폼 생성 - FormGenerator가 자체적으로 formContainer를 찾아서 생성
      // this.formGenerator.generateForm() 메서드는 이미 init()에서 호출됨
      
      // 액션 바 표시
      const actionBar = document.getElementById('actionBar');
      if (actionBar) {
        actionBar.style.display = 'flex';
      }
      
      // 진행률 초기화
      this.updateProgress();
      
      console.log('🎨 UI 초기화 완료');
      
    } catch (error) {
      throw new Error(`UI 초기화 실패: ${error.message}`);
    }
  }

  /**
   * 화폐 선택기 초기화
   */
  initializeCurrencySelector() {
    try {
      const container = document.getElementById('currencySelectorContainer');
      if (container && window.CurrencyManager) {
        // CurrencyManager가 로드될 때까지 대기
        const initSelector = () => {
          if (window.CurrencyManager.currencies) {
            window.CurrencyManager.createCurrencySelector(container);
            console.log('💱 화폐 선택기 초기화 완료');
          } else {
            // CurrencyManager가 아직 로드되지 않았다면 잠시 후 재시도
            setTimeout(initSelector, 100);
          }
        };
        
        initSelector();
      }
    } catch (error) {
      console.warn('화폐 선택기 초기화 실패:', error);
    }
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners() {
    try {
      // 폼 데이터 변경 이벤트
      document.addEventListener('formDataChanged', (event) => {
        this.handleFormDataChange(event.detail);
      });
      
      // 계산 완료 이벤트
      document.addEventListener('calculationCompleted', (event) => {
        this.handleCalculationComplete(event.detail);
      });
      
      // 버튼 클릭 이벤트
      this.attachButtonListeners();
      
      // 윈도우 이벤트
      window.addEventListener('beforeunload', () => {
        this.saveFormData();
      });
      
      window.addEventListener('resize', InvestmentHelpers.debounce(() => {
        this.handleResize();
      }, 250));
      
      console.log('🎧 이벤트 리스너 등록 완료');
      
    } catch (error) {
      throw new Error(`이벤트 리스너 등록 실패: ${error.message}`);
    }
  }

  /**
   * 버튼 이벤트 리스너 등록
   */
  attachButtonListeners() {
    const buttons = {
      saveBtn: () => this.saveFormData(),
      loadBtn: () => this.loadFormData(),
      clearBtn: () => this.clearFormData(),
      previewBtn: () => this.previewDocuments(),
      generateTermSheetBtn: () => this.generateDocument('termsheet'),
      generatePreliminaryBtn: () => this.generateDocument('preliminary'),
      generateAllBtn: () => this.generateAllDocuments()
    };
    
    Object.entries(buttons).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', handler);
      }
    });
  }

  /**
   * 폼 데이터 변경 처리
   * @param {Object} data - 변경된 데이터
   */
  handleFormDataChange(data) {
    try {
      this.formData = { ...this.formData, ...data };
      this.updateProgress();
      this.saveFormData();
      
    } catch (error) {
      console.error('폼 데이터 변경 처리 실패:', error);
    }
  }

  /**
   * 계산 완료 처리
   * @param {Object} result - 계산 결과
   */
  handleCalculationComplete(result) {
    try {
      this.formData = { ...this.formData, ...result };
      this.updateProgress();
      
    } catch (error) {
      console.error('계산 완료 처리 실패:', error);
    }
  }

  /**
   * 진행률 업데이트
   */
  updateProgress() {
    try {
      const filledFields = Object.keys(this.formData).filter(
        key => !InvestmentHelpers.isEmpty(this.formData[key])
      ).length;
      
      this.progress.current = filledFields;
      this.progress.percentage = Math.round((filledFields / this.progress.total) * 100);
      
      // UI 업데이트
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const statusText = document.getElementById('statusText');
      
      if (progressFill) {
        progressFill.style.width = `${this.progress.percentage}%`;
      }
      
      if (progressText) {
        progressText.textContent = `${this.progress.percentage}% 완료`;
      }
      
      if (statusText) {
        if (this.progress.percentage === 100) {
          statusText.textContent = '입력 완료! 문서를 생성할 수 있습니다.';
        } else if (this.progress.percentage >= 50) {
          statusText.textContent = '절반 이상 입력되었습니다.';
        } else {
          statusText.textContent = `${this.progress.total - this.progress.current}개 항목이 더 필요합니다.`;
        }
      }
      
    } catch (error) {
      console.error('진행률 업데이트 실패:', error);
    }
  }

  /**
   * 폼 데이터 저장
   */
  saveFormData() {
    try {
      this.storage.save('formData', this.formData);
      this.showToast('데이터가 임시저장되었습니다.', 'success');
      
    } catch (error) {
      console.error('폼 데이터 저장 실패:', error);
      this.showToast('데이터 저장에 실패했습니다.', 'error');
    }
  }

  /**
   * 폼 데이터 불러오기
   */
  loadFormData() {
    try {
      const savedData = this.storage.load('formData');
      if (savedData) {
        this.formData = savedData;
        this.formGenerator.populateForm(savedData);
        this.updateProgress();
        this.showToast('저장된 데이터를 불러왔습니다.', 'success');
      } else {
        this.showToast('저장된 데이터가 없습니다.', 'info');
      }
      
    } catch (error) {
      console.error('폼 데이터 불러오기 실패:', error);
      this.showToast('데이터 불러오기에 실패했습니다.', 'error');
    }
  }

  /**
   * 폼 데이터 초기화
   */
  async clearFormData() {
    try {
      const confirmed = await window.Modal.confirm(
        '모든 입력 데이터를 초기화하시겠습니까?<br><span style="color: #666; font-size: 0.9em;">이 작업은 되돌릴 수 없습니다.</span>',
        '🗑️ 데이터 초기화'
      );
      
      if (confirmed) {
        this.formData = {};
        this.formGenerator.clearForm();
        this.storage.clear('formData');
        this.updateProgress();
        this.showToast('데이터가 초기화되었습니다.', 'info');
      }
      
    } catch (error) {
      console.error('폼 데이터 초기화 실패:', error);
      this.showToast('데이터 초기화에 실패했습니다.', 'error');
    }
  }

  /**
   * 문서 미리보기
   */
  previewDocuments() {
    try {
      // 미리보기 모달 표시
      const previewData = this.preparePreviewData();
      // Modal 컴포넌트를 사용하여 미리보기 표시
      // 구현 예정
      
      console.log('문서 미리보기:', previewData);
      this.showToast('미리보기 기능은 곧 제공됩니다.', 'info');
      
    } catch (error) {
      console.error('문서 미리보기 실패:', error);
      this.showToast('미리보기 생성에 실패했습니다.', 'error');
    }
  }

  /**
   * 문서 생성
   * @param {string} type - 문서 타입 ('termsheet', 'preliminary')
   */
  async generateDocument(type) {
    try {
      console.log('📝 문서 생성 시작:', type);
      
      // 실시간으로 폼 데이터 수집
      const currentFormData = this.formGenerator.getAllFieldValues();
      console.log('📊 실시간 폼 데이터:', currentFormData);
      
      // 유효성 검증
      const validationResult = this.dataValidator.validateForm(currentFormData);
      console.log('🔍 유효성 검증 결과:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('❌ 유효성 검증 실패');
        this.showValidationErrors(validationResult);
        return;
      }
      
      console.log('✅ 유효성 검증 통과 - 문서 생성 진행');
      
      // 문서 생성 (다운로드는 TemplateProcessor에서 처리)
      await this.templateProcessor.generateDocument(type, currentFormData);
      
      this.showToast(`${type === 'termsheet' ? 'Term Sheet' : '예비투심위 보고서'}가 생성되었습니다.`, 'success');
      
    } catch (error) {
      console.error('문서 생성 실패:', error);
      this.showToast('문서 생성에 실패했습니다.', 'error');
    }
  }

  /**
   * 모든 문서 생성
   */
  async generateAllDocuments() {
    try {
      // 실시간으로 폼 데이터 수집
      const currentFormData = this.formGenerator.getAllFieldValues();
      console.log('📊 전체 문서 생성용 폼 데이터:', currentFormData);
      
      // 유효성 검증 (한 번만 수행)
      const validationResult = this.dataValidator.validateForm(currentFormData);
      console.log('🔍 전체 문서 생성 유효성 검증 결과:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('❌ 유효성 검증 실패 - 전체 문서 생성 중단');
        this.showValidationErrors(validationResult);
        return;
      }
      
      // 사용자 확인
      const confirmed = await window.Modal.confirm(
        '모든 문서를 생성하시겠습니까?',
        '📄 전체 문서 생성'
      );
      
      if (!confirmed) {
        return;
      }
      
      console.log('✅ 유효성 검증 통과 - 전체 문서 생성 진행');
      
      await this.templateProcessor.generateDocument('termsheet', currentFormData);
      await InvestmentHelpers.delay(500); // 잠시 대기
      await this.templateProcessor.generateDocument('preliminary', currentFormData);
      
      this.showToast('모든 문서가 생성되었습니다.', 'success');
      
    } catch (error) {
      console.error('전체 문서 생성 실패:', error);
      this.showToast('일부 문서 생성에 실패했습니다.', 'error');
    }
  }

  /**
   * 저장된 폼 데이터 복원
   */
  restoreFormData() {
    try {
      const savedData = this.storage.load('formData');
      if (savedData) {
        this.formData = savedData;
        this.updateProgress();
        console.log('💾 저장된 데이터 복원 완료');
      }
      
    } catch (error) {
      console.error('데이터 복원 실패:', error);
    }
  }

  /**
   * 윈도우 리사이즈 처리
   */
  handleResize() {
    // 반응형 UI 조정 로직
    console.log('📱 화면 크기 변경 감지');
  }

  /**
   * 유효성 검증 오류 표시
   * @param {Object} validationResult - 검증 결과
   */
  showValidationErrors(validationResult) {
    const errors = validationResult.summary.errors;
    const errorMessages = errors.map(error => `• ${error}`).join('<br>');
    
    window.Modal.alert(
      `<div style="text-align: left; line-height: 1.6;">${errorMessages}</div>`,
      '⚠️ 입력 오류'
    );
  }

  /**
   * 미리보기 데이터 준비
   * @returns {Object} 미리보기용 데이터
   */
  preparePreviewData() {
    return {
      ...this.formData,
      오늘날짜: InvestmentHelpers.getCurrentDate('YYYY년 MM월 DD일'),
      작성일: InvestmentHelpers.getCurrentDate(),
      계약일: InvestmentHelpers.getCurrentDate()
    };
  }

  // downloadDocument 메서드 제거됨 - TemplateProcessor에서 처리

  // generateFilename 메서드 제거됨 - TemplateProcessor에서 처리

  /**
   * 토스트 메시지 표시
   * @param {string} message - 메시지
   * @param {string} type - 타입 ('success', 'error', 'info', 'warning')
   */
  showToast(message, type = 'info') {
    // Toast 컴포넌트 사용
    if (window.Toast) {
      window.Toast.show(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * 오류 메시지 표시
   * @param {string} message - 오류 메시지
   */
  showError(message) {
    this.showToast(message, 'error');
    console.error('❌', message);
  }
}

// =============================================================================
// 🎯 애플리케이션 시작
// =============================================================================

// 전역 앱 인스턴스 생성
window.investmentApp = new InvestmentDocumentApp();

// 개발용 디버깅 함수들 (localhost에서만 활성화)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.debugApp = {
    getFormData: () => window.investmentApp.formData,
    setFormData: (data) => { window.investmentApp.formData = data; },
    getProgress: () => window.investmentApp.progress,
    testValidation: () => {
      console.log('🧪 유효성 검증 테스트');
      const result = window.investmentApp.dataValidator.validateForm(window.investmentApp.formData);
      console.log('검증 결과:', result);
      return result;
    },
    showCurrentData: () => {
      console.log('📊 현재 폼 데이터:');
      console.table(window.investmentApp.formData);
      console.log('총 필드 수:', Object.keys(window.investmentApp.formData).length);
    },
    clearData: () => {
      window.investmentApp.formData = {};
      window.investmentApp.updateProgress();
      console.log('🗑️ 폼 데이터 초기화 완료');
    }
  };
} 