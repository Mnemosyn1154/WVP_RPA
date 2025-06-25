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
      // 🎬 새로운 로딩 애니메이션 시작
      if (window.LoadingUtils) {
        window.LoadingUtils.startMainLoading(3000);
      }
      
      // 1. 브라우저 지원 확인
      this.checkBrowserSupport();
      await InvestmentHelpers.delay(400); // 로딩 애니메이션을 위한 대기
      
      // 2. 설정 파일 로드
      await this.loadConfiguration();
      await InvestmentHelpers.delay(400);
      
      // 3. 핵심 모듈 초기화
      await this.initializeModules();
      await InvestmentHelpers.delay(600);
      
      // 4. UI 초기화
      this.initializeUI();
      await InvestmentHelpers.delay(400);
      
      // 5. 이벤트 리스너 등록
      this.attachEventListeners();
      await InvestmentHelpers.delay(300);
      
      // 6. 저장된 데이터 복원
      this.restoreFormData();
      
      // 🎉 로딩 완료
      if (window.LoadingUtils) {
        window.LoadingUtils.completeLoading();
      }
      
      // 잠깐 대기 후 로딩 화면 숨기기
      setTimeout(() => {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
          loadingSpinner.style.opacity = '0';
          loadingSpinner.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            loadingSpinner.style.display = 'none';
          }, 500);
        }
      }, 800);
      
      this.isInitialized = true;
      console.log('✅ 투자문서 생성기 초기화 완료!');
      
      // 성공 메시지 표시
      setTimeout(() => {
        this.showToast('💼 투자문서 생성기가 준비되었습니다!', 'success');
      }, 1200);
      
    } catch (error) {
      console.error('❌ 애플리케이션 초기화 실패:', error);
      
      // 로딩 중단
      if (window.LoadingUtils) {
        window.LoadingUtils.stopLoading();
      }
      
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
      // 화폐 선택기 초기화
      this.initializeCurrencySelector();
      
      // 폼 생성 - FormGenerator가 자체적으로 formContainer를 찾아서 생성
      // this.formGenerator.generateForm() 메서드는 이미 init()에서 호출됨
      
      // 액션 바 표시
      const actionBar = document.getElementById('actionBar');
      if (actionBar) {
        actionBar.style.display = 'flex';
      }
      
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
      
      // 윈도우 이벤트 - 페이지 종료 시 LocalStorage에만 백업 저장
      window.addEventListener('beforeunload', () => {
        this.createEmergencyBackup();
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
      saveBtn: async () => await this.saveFormData(),
      loadBtn: async () => await this.loadFormData(), 
      clearBtn: async () => await this.clearFormData(),
      previewBtn: () => this.formGenerator.showPreview(),
      generateTermSheetBtn: () => this.generateDocument('termsheet'),
      generatePreliminaryBtn: () => this.generateDocument('preliminary'),
      generateAllBtn: () => this.generateAllDocuments()
    };
    
    Object.entries(buttons).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        element.removeEventListener('click', handler);
        element.addEventListener('click', handler);
      }
    });

    // 네비게이션 버튼들 (data-action 속성 사용)
    const navButtons = document.querySelectorAll('.nav-button[data-action]');
    navButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const action = event.target.getAttribute('data-action');
        this.handleNavAction(action);
      });
    });
  }

  /**
   * 네비게이션 액션 처리
   * @param {string} action - 액션 타입
   */
  handleNavAction(action) {
    try {
      switch (action) {
        case 'help':
          this.showHelpModal();
          break;
        case 'settings':
          this.showSettingsModal();
          break;
        default:
          console.warn('알 수 없는 네비게이션 액션:', action);
      }
    } catch (error) {
      console.error('네비게이션 액션 처리 실패:', error);
    }
  }

  /**
   * 도움말 모달 표시
   */
  showHelpModal() {
    const helpContent = `
      <div class="help-modal-content">
        <h3 style="margin-bottom: 20px; color: var(--primary-color);">💼 투자문서 생성기 사용법</h3>
        
        <div class="help-section">
          <h4>📋 기본 사용법</h4>
          <ol>
            <li><strong>폼 작성</strong>: 각 섹션의 필드를 차례대로 입력하세요</li>
            <li><strong>자동 계산</strong>: 투자금액, 지분율 등이 자동으로 계산됩니다</li>
            <li><strong>문서 생성</strong>: Term Sheet 또는 예비투심위 보고서를 생성하세요</li>
            <li><strong>파일 관리</strong>: Excel로 저장하거나 불러올 수 있습니다</li>
          </ol>
        </div>

        <div class="help-section">
          <h4>📄 문서 유형</h4>
          <ul>
            <li><strong>Term Sheet</strong>: 간결형 (14개 필수 필드)</li>
            <li><strong>예비투심위 보고서</strong>: 완전형 (20개 필수 필드)</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>⌨️ 키보드 단축키</h4>
          <div class="shortcut-grid">
            <div class="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Excel로 저장</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + Shift + O</kbd>
              <span>Excel에서 열기</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + Enter</kbd>
              <span>모든 문서 생성</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + 1</kbd>
              <span>Term Sheet 생성</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + 2</kbd>
              <span>예비투심위 생성</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + Delete</kbd>
              <span>데이터 초기화</span>
            </div>
            <div class="shortcut-item">
              <kbd>Enter</kbd>
              <span>모든 문서 생성 (입력 필드 외)</span>
            </div>
            <div class="shortcut-item">
              <kbd>Escape</kbd>
              <span>모달 닫기</span>
            </div>
          </div>
        </div>

        <div class="help-section">
          <h4>💡 사용 팁</h4>
          <ul>
            <li>화폐 단위는 우측 상단에서 변경할 수 있습니다</li>
            <li>데이터는 자동으로 저장되며, Excel 파일로 백업할 수 있습니다</li>
            <li>필수 필드가 부족하면 문서 생성 시 안내됩니다</li>
            <li>각 필드의 설명은 라벨을 참고하여 입력하세요</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>🔧 문제 해결</h4>
          <ul>
            <li><strong>문서 생성 실패</strong>: 필수 필드를 모두 입력했는지 확인하세요</li>
            <li><strong>파일 저장 안됨</strong>: 브라우저 다운로드 권한을 확인하세요</li>
            <li><strong>계산 오류</strong>: 숫자 형식이 올바른지 확인하세요</li>
            <li><strong>화면 깨짐</strong>: 브라우저를 새로고침하세요</li>
          </ul>
        </div>
      </div>
    `;

    window.Modal.show({
      title: '📚 도움말',
      content: helpContent,
      size: 'large',
      closable: true
    });
  }

  /**
   * 설정 모달 표시
   */
  showSettingsModal() {
    const settingsContent = `
      <div class="settings-modal-content">
        <h3 style="margin-bottom: 20px; color: var(--primary-color);">⚙️ 설정</h3>
        
        <div class="settings-section">
          <h4>🎨 테마</h4>
          <div class="setting-item">
            <label>
              <input type="radio" name="theme" value="light" checked>
              <span>라이트 모드</span>
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="radio" name="theme" value="dark">
              <span>다크 모드 (개발 중)</span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h4>💾 데이터</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" checked>
              <span>자동 저장 활성화</span>
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" checked>
              <span>입력 중 실시간 계산</span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h4>📄 문서</h4>
          <div class="setting-item">
            <label>
              <input type="checkbox" checked>
              <span>생성 후 자동 다운로드</span>
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox">
              <span>문서 생성 시 미리보기 표시</span>
            </label>
          </div>
        </div>

        <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
          ⚠️ 설정 기능은 향후 업데이트에서 제공될 예정입니다.
        </p>
      </div>
    `;

    window.Modal.show({
      title: '⚙️ 설정',
      content: settingsContent,
      size: 'medium',
      closable: true
    });
  }

  /**
   * 폼 데이터 변경 처리
   * @param {Object} data - 변경된 데이터
   */
  handleFormDataChange(data) {
    try {
      this.formData = { ...this.formData, ...data };
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
      
    } catch (error) {
      console.error('계산 완료 처리 실패:', error);
    }
  }



  /**
   * 폼 데이터를 Excel 파일로 저장
   */
  async saveFormData() {
    try {
      // 현재 폼 데이터 수집
      const currentFormData = this.formGenerator.getAllFieldValues();
      
      if (Object.keys(currentFormData).length === 0) {
        this.showToast('저장할 데이터가 없습니다.', 'warning');
        return;
      }

      console.log('💾 Excel 파일로 저장 시작');
      
      // FileManager를 통해 Excel 파일로 저장
      const filename = await window.FileManager.saveToExcel(currentFormData);
      
      this.showToast(`'${filename}' 파일로 저장되었습니다.`, 'success');
      
    } catch (error) {
      console.error('Excel 파일 저장 실패:', error);
      this.showToast(`파일 저장에 실패했습니다: ${error.message}`, 'error');
    }
  }

  /**
   * Excel 파일에서 폼 데이터 불러오기
   */
  async loadFormData() {
    try {
      console.log('📂 Excel 파일에서 불러오기 시작');
      
      // FileManager를 통해 파일 선택 다이얼로그 열기
      await window.FileManager.loadFromExcel();
      
      // 파일 선택 및 처리는 FileManager에서 비동기적으로 처리됩니다.
      
    } catch (error) {
      console.error('Excel 파일 불러오기 실패:', error);
      this.showToast(`파일 불러오기에 실패했습니다: ${error.message}`, 'error');
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
      
      // 실시간 검증은 제거 - TemplateProcessor에서 템플릿별 검증 수행
      console.log('✅ 폼 데이터 수집 완료 - 템플릿별 검증은 TemplateProcessor에서 수행');
      
      // 문서 생성 (TemplateProcessor에서 템플릿별 검증 수행)
      await this.templateProcessor.generateDocument(type, currentFormData);
      
      const templateName = type === 'termsheet' ? 'Term Sheet' : '예비투심위 보고서';
      this.showToast(`${templateName}가 생성되었습니다.`, 'success');
      
    } catch (error) {
      console.error('문서 생성 실패:', error);
      
      // 오류 메시지는 TemplateProcessor에서 이미 처리되므로 간단한 토스트만 표시
      if (!error.message.includes('생성에 필요한 필수 정보가 부족')) {
        this.showToast('문서 생성에 실패했습니다.', 'error');
      }
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
      
      // 기본 데이터 존재 여부만 체크
      if (!currentFormData || Object.keys(currentFormData).length === 0) {
        this.showToast('입력된 데이터가 없습니다. 폼을 작성해주세요.', 'warning');
        return;
      }
      
      // 사용자 확인
      const confirmed = await window.Modal.confirm(
        '모든 문서를 생성하시겠습니까?<br><br>' +
        '<small style="color: #666;">• Term Sheet (간결형 - 14개 필수 필드)</small><br>' +
        '<small style="color: #666;">• 예비투심위 보고서 (완전형 - 20개 필수 필드)</small><br><br>' +
        '<small style="color: #999;">각 문서별로 필요한 필드가 부족한 경우 개별적으로 안내됩니다.</small>',
        '📄 전체 문서 생성'
      );
      
      if (!confirmed) {
        return;
      }
      
      console.log('✅ 사용자 확인 완료 - 전체 문서 생성 진행');
      
      let successCount = 0;
      let failCount = 0;
      
      // Term Sheet 생성 시도
      try {
        await this.templateProcessor.generateDocument('termsheet', currentFormData);
        successCount++;
        console.log('✅ Term Sheet 생성 성공');
      } catch (error) {
        failCount++;
        console.error('❌ Term Sheet 생성 실패:', error);
      }
      
      // 잠시 대기
      await InvestmentHelpers.delay(500);
      
      // 예비투심위 보고서 생성 시도
      try {
        await this.templateProcessor.generateDocument('preliminary', currentFormData);
        successCount++;
        console.log('✅ 예비투심위 보고서 생성 성공');
      } catch (error) {
        failCount++;
        console.error('❌ 예비투심위 보고서 생성 실패:', error);
      }
      
      // 결과 안내
      if (successCount === 2) {
        this.showToast('모든 문서가 성공적으로 생성되었습니다! 🎉', 'success');
      } else if (successCount === 1) {
        this.showToast(`${successCount}개 문서가 생성되었습니다. (실패: ${failCount}개)`, 'warning');
      } else {
        this.showToast('문서 생성에 실패했습니다. 필수 필드를 확인해주세요.', 'error');
      }
      
    } catch (error) {
      console.error('전체 문서 생성 실패:', error);
      this.showToast('전체 문서 생성 중 오류가 발생했습니다.', 'error');
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
        console.log('💾 저장된 데이터 복원 완료');
      }
      
    } catch (error) {
      console.error('데이터 복원 실패:', error);
    }
  }

  /**
   * 페이지 종료 시 응급 백업 생성 (LocalStorage만 사용)
   */
  createEmergencyBackup() {
    try {
      // 현재 폼 데이터 수집
      const currentFormData = this.formGenerator?.getAllFieldValues();
      
      if (currentFormData && Object.keys(currentFormData).length > 0) {
        // 응급 백업 데이터 생성
        const backupData = {
          ...currentFormData,
          _emergency_backup: {
            timestamp: new Date().toISOString(),
            type: 'beforeunload_backup'
          }
        };
        
        // LocalStorage에 저장 (파일 다이얼로그 없이)
        localStorage.setItem('investment_emergency_backup', JSON.stringify(backupData));
        console.log('💾 응급 백업 저장 완료');
      }
      
    } catch (error) {
      console.warn('⚠️ 응급 백업 저장 실패:', error);
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
      console.log('🗑️ 폼 데이터 초기화 완료');
    }
  };
} 