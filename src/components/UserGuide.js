/**
 * 사용자 가이드 시스템
 * 인터랙티브 튜토리얼, 컨텍스트 도움말, FAQ를 제공하는 통합 가이드 시스템
 */

(function() {
  'use strict';

  // 사용자 가이드 데이터
  const guideData = {
    // 인터랙티브 튜토리얼 스텝
    tutorialSteps: [
      {
        id: 'welcome',
        title: '환영합니다!',
        content: '투자문서 생성기를 처음 사용하시는군요. 주요 기능을 안내해드리겠습니다.',
        target: null,
        position: 'center'
      },
      {
        id: 'currency',
        title: '화폐 선택',
        content: '우측 상단에서 원하는 화폐 단위를 선택할 수 있습니다. KRW, USD, JPY를 지원합니다.',
        target: '#currencySelectorContainer',
        position: 'bottom-left'
      },
      {
        id: 'basic-info',
        title: '기본 정보 입력',
        content: '투자대상, 대표자명, 설립일 등 기본 정보를 입력하세요. 빨간색 * 표시는 필수 입력 항목입니다.',
        target: '.form-section:first-child',
        position: 'bottom'
      },
      {
        id: 'investment-info',
        title: '투자 정보 입력',
        content: '투자금액, 주식수, 지분율이 자동으로 계산됩니다. Pre/Post Money 선택에 따라 계산 방식이 달라집니다.',
        target: '.form-section:nth-child(2)',
        position: 'top'
      },
      {
        id: 'auto-save',
        title: '자동 저장',
        content: '입력한 데이터는 자동으로 저장됩니다. Excel 파일로도 저장할 수 있습니다.',
        target: '#saveBtn',
        position: 'top'
      },
      {
        id: 'document-generation',
        title: '문서 생성',
        content: 'Term Sheet(간결형)와 예비투심위 보고서(완전형)를 생성할 수 있습니다. 미리보기도 가능합니다.',
        target: '.action-group:last-child',
        position: 'top'
      },
      {
        id: 'shortcuts',
        title: '키보드 단축키',
        content: 'Ctrl+S로 저장, Ctrl+Enter로 모든 문서를 생성할 수 있습니다. 도움말에서 전체 단축키를 확인하세요.',
        target: null,
        position: 'center'
      }
    ],

    // 컨텍스트 도움말
    contextHelp: {
      '투자대상': '투자를 받을 회사의 정식 명칭을 입력하세요. 법인명을 정확히 기재해주세요.',
      '대표자': '회사 대표이사의 성명을 입력하세요. 공동대표인 경우 쉼표로 구분하여 입력하세요.',
      '설립일': '법인 설립일을 선택하세요. 사업자등록일이 아닌 법인등기일 기준입니다.',
      '업종': '회사의 주요 사업 분야를 입력하세요. 표준산업분류 기준으로 작성하면 좋습니다.',
      '투자일': '투자 계약 예정일 또는 실행일을 선택하세요.',
      '투자단계': 'Seed, Series A/B/C 등 투자 라운드를 선택하세요.',
      '투자형태': '보통주, 우선주(상환전환우선주) 등 투자 주식의 종류를 선택하세요.',
      '투자금액': '실제 투자할 금액을 입력하세요. 화폐 단위는 우측 상단에서 변경 가능합니다.',
      '기업가치평가': 'Pre-Money 기준 기업가치를 입력하세요. Post-Money = Pre-Money + 투자금액입니다.',
      'Pre/Post Money': 'Pre-Money는 투자 전 기업가치, Post-Money는 투자 후 기업가치입니다.',
      '지분율': '투자 후 보유하게 될 지분율입니다. 자동으로 계산되며 수동 입력도 가능합니다.',
      '주식수': '취득할 주식수입니다. 투자금액과 주당가격으로 자동 계산됩니다.',
      '주당가격': '주식 1주당 가격입니다. 기업가치와 총 주식수로 자동 계산됩니다.',
      '이사회구성': '투자 후 이사회 구성 계획을 입력하세요. 사내이사, 사외이사 수를 포함하세요.',
      '투자자': '투자를 실행하는 회사/펀드명을 입력하세요.',
      '공동투자자': '함께 투자하는 다른 투자자가 있다면 입력하세요. 없으면 비워두세요.',
      '주요조건': '투자의 주요 조건이나 특약사항을 입력하세요. 예: 우선매수권, 동반매도권 등',
      '기타조건': '위에 포함되지 않은 추가 조건이 있다면 입력하세요.'
    },

    // 자주 묻는 질문
    faq: [
      {
        question: 'Term Sheet와 예비투심위 보고서의 차이점은 무엇인가요?',
        answer: 'Term Sheet는 투자 주요 조건을 간결하게 정리한 문서로 14개 필수 필드가 필요합니다. 예비투심위 보고서는 투자심의위원회에 제출하는 상세 보고서로 20개 필수 필드가 필요합니다.'
      },
      {
        question: 'Pre-Money와 Post-Money 기업가치의 차이는 무엇인가요?',
        answer: 'Pre-Money는 투자 전 기업가치이고, Post-Money는 투자 후 기업가치입니다. Post-Money = Pre-Money + 투자금액의 관계가 있습니다.'
      },
      {
        question: '자동 계산은 어떻게 작동하나요?',
        answer: '투자금액, 기업가치, 지분율, 주식수, 주당가격은 서로 연동되어 자동 계산됩니다. 하나를 입력하면 나머지가 자동으로 계산됩니다.'
      },
      {
        question: 'Excel 파일로 저장하면 어떤 형식으로 저장되나요?',
        answer: '모든 입력 데이터가 구조화된 Excel 파일로 저장됩니다. 나중에 다시 불러와서 수정할 수 있습니다.'
      },
      {
        question: '문서 생성이 안 될 때는 어떻게 하나요?',
        answer: '필수 필드가 모두 입력되었는지 확인하세요. 빨간색 * 표시가 있는 필드는 반드시 입력해야 합니다. 각 문서별로 필요한 필수 필드 수가 다릅니다.'
      },
      {
        question: '입력한 데이터는 어디에 저장되나요?',
        answer: '데이터는 브라우저의 로컬 저장소에 자동 저장됩니다. 추가로 Excel 파일로 백업할 수 있으며, 서버에는 어떤 데이터도 전송되지 않습니다.'
      },
      {
        question: '화폐 단위를 변경하면 기존 금액은 어떻게 되나요?',
        answer: '화폐 단위를 변경해도 숫자 값은 그대로 유지됩니다. 환율 변환은 자동으로 이루어지지 않으므로 필요시 수동으로 조정해주세요.'
      },
      {
        question: '여러 명이 함께 사용할 수 있나요?',
        answer: 'Excel 파일로 저장하여 공유하면 됩니다. 각자의 브라우저에서 파일을 불러와 작업할 수 있습니다.'
      }
    ]
  };

  // 사용자 가이드 클래스
  class UserGuide {
    constructor() {
      this.currentTutorialStep = 0;
      this.tutorialActive = false;
      this.tourOverlay = null;
      this.tourTooltip = null;
      this.contextTooltips = new Map();
      
      // 최초 사용자 체크
      this.checkFirstTimeUser();
    }

    /**
     * 최초 사용자 확인 및 튜토리얼 제안
     */
    checkFirstTimeUser() {
      const hasVisited = localStorage.getItem('investment_doc_visited');
      if (!hasVisited) {
        // 앱 초기화 완료 후 튜토리얼 제안
        setTimeout(() => {
          this.showTutorialPrompt();
        }, 2000);
      }
    }

    /**
     * 튜토리얼 시작 제안
     */
    async showTutorialPrompt() {
      const confirmed = await window.Modal.confirm(
        '<div style="text-align: center; padding: 20px;">' +
        '<div style="font-size: 48px; margin-bottom: 20px;">👋</div>' +
        '<h3 style="margin-bottom: 10px;">처음 방문하셨네요!</h3>' +
        '<p>투자문서 생성기의 주요 기능을 안내해드릴까요?</p>' +
        '<p style="color: #666; font-size: 0.9em; margin-top: 10px;">약 2분 정도 소요됩니다.</p>' +
        '</div>',
        '시작하기'
      );

      if (confirmed) {
        this.startTutorial();
      }
      
      // 방문 기록 저장
      localStorage.setItem('investment_doc_visited', 'true');
    }

    /**
     * 사용자 가이드 모달 표시
     */
    show() {
      const content = this.createGuideContent();
      
      window.Modal.show({
        title: '📚 사용자 가이드',
        content: content,
        size: 'large',
        closable: true,
        onShow: () => {
          this.attachGuideEventListeners();
          this.initializeTabNavigation();
        }
      });
    }

    /**
     * 가이드 컨텐츠 생성
     */
    createGuideContent() {
      return `
        <div class="user-guide-container">
          <!-- 탭 네비게이션 -->
          <div class="guide-tabs">
            <button class="guide-tab active" data-tab="help">
              <span class="tab-icon">📖</span>
              도움말
            </button>
            <button class="guide-tab" data-tab="tutorial">
              <span class="tab-icon">🎯</span>
              튜토리얼
            </button>
            <button class="guide-tab" data-tab="faq">
              <span class="tab-icon">❓</span>
              자주 묻는 질문
            </button>
          </div>

          <!-- 탭 컨텐츠 -->
          <div class="guide-content">
            <!-- 도움말 탭 -->
            <div class="guide-tab-content active" data-tab-content="help">
              ${this.createHelpContent()}
            </div>

            <!-- 튜토리얼 탭 -->
            <div class="guide-tab-content" data-tab-content="tutorial">
              ${this.createTutorialContent()}
            </div>

            <!-- FAQ 탭 -->
            <div class="guide-tab-content" data-tab-content="faq">
              ${this.createFAQContent()}
            </div>
          </div>
        </div>

        <style>
          .user-guide-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 500px;
          }

          .guide-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }

          .guide-tab {
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #666;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 8px 8px 0 0;
          }

          .guide-tab:hover {
            background-color: #f5f5f5;
            color: #333;
          }

          .guide-tab.active {
            color: var(--primary-color);
            background-color: #e3f2fd;
            font-weight: 600;
          }

          .tab-icon {
            font-size: 20px;
          }

          .guide-content {
            flex: 1;
            overflow-y: auto;
            padding: 10px 0;
          }

          .guide-tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
          }

          .guide-tab-content.active {
            display: block;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .help-section, .faq-item {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
          }

          .help-section:last-child, .faq-item:last-child {
            border-bottom: none;
          }

          .help-section h4, .faq-question {
            color: var(--primary-color);
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 600;
          }

          .faq-question {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: color 0.3s ease;
          }

          .faq-question:hover {
            color: var(--primary-hover);
          }

          .faq-question::before {
            content: '▶';
            font-size: 12px;
            transition: transform 0.3s ease;
          }

          .faq-item.expanded .faq-question::before {
            transform: rotate(90deg);
          }

          .faq-answer {
            margin-top: 12px;
            padding-left: 25px;
            color: #666;
            line-height: 1.6;
            display: none;
          }

          .faq-item.expanded .faq-answer {
            display: block;
            animation: slideDown 0.3s ease;
          }

          @keyframes slideDown {
            from { opacity: 0; max-height: 0; }
            to { opacity: 1; max-height: 200px; }
          }

          .shortcut-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 10px;
          }

          .shortcut-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background-color: #f8f9fa;
            border-radius: 6px;
            font-size: 14px;
          }

          .shortcut-item kbd {
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            box-shadow: 0 2px 0 #ddd;
          }

          .tutorial-start-btn {
            display: block;
            margin: 30px auto;
            padding: 15px 40px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }

          .tutorial-start-btn:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }

          .tutorial-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }

          .tutorial-feature {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 12px;
            transition: transform 0.3s ease;
          }

          .tutorial-feature:hover {
            transform: translateY(-5px);
          }

          .tutorial-feature-icon {
            font-size: 36px;
            margin-bottom: 10px;
          }

          .tutorial-feature h5 {
            margin-bottom: 8px;
            color: #333;
          }

          .tutorial-feature p {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
        </style>
      `;
    }

    /**
     * 도움말 컨텐츠 생성
     */
    createHelpContent() {
      return `
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
              <span>모든 문서 생성</span>
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
            <li>각 필드 옆의 <span style="color: var(--primary-color);">?</span> 아이콘을 클릭하면 상세 설명을 볼 수 있습니다</li>
          </ul>
        </div>
      `;
    }

    /**
     * 튜토리얼 컨텐츠 생성
     */
    createTutorialContent() {
      return `
        <div style="text-align: center; padding: 20px;">
          <h3 style="margin-bottom: 20px;">🎯 인터랙티브 튜토리얼</h3>
          
          <p style="font-size: 18px; margin-bottom: 30px;">
            투자문서 생성기의 주요 기능을 단계별로 안내해드립니다.
          </p>

          <div class="tutorial-features">
            <div class="tutorial-feature">
              <div class="tutorial-feature-icon">💱</div>
              <h5>화폐 선택</h5>
              <p>원하는 화폐 단위 설정</p>
            </div>
            <div class="tutorial-feature">
              <div class="tutorial-feature-icon">📝</div>
              <h5>정보 입력</h5>
              <p>필수 정보 입력 방법</p>
            </div>
            <div class="tutorial-feature">
              <div class="tutorial-feature-icon">🔢</div>
              <h5>자동 계산</h5>
              <p>투자 금액 자동 계산</p>
            </div>
            <div class="tutorial-feature">
              <div class="tutorial-feature-icon">📄</div>
              <h5>문서 생성</h5>
              <p>문서 생성 및 다운로드</p>
            </div>
          </div>

          <button class="tutorial-start-btn" onclick="window.UserGuide.startTutorial()">
            튜토리얼 시작하기
          </button>
        </div>
      `;
    }

    /**
     * FAQ 컨텐츠 생성
     */
    createFAQContent() {
      const faqHtml = guideData.faq.map((item, index) => `
        <div class="faq-item" data-faq-index="${index}">
          <h4 class="faq-question">
            ${item.question}
          </h4>
          <div class="faq-answer">
            ${item.answer}
          </div>
        </div>
      `).join('');

      return `
        <div class="faq-container">
          ${faqHtml}
        </div>
      `;
    }

    /**
     * 가이드 이벤트 리스너 등록
     */
    attachGuideEventListeners() {
      // 탭 전환
      const tabs = document.querySelectorAll('.guide-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          const targetTab = e.currentTarget.dataset.tab;
          this.switchTab(targetTab);
        });
      });

      // FAQ 토글
      const faqItems = document.querySelectorAll('.faq-question');
      faqItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const faqItem = e.target.closest('.faq-item');
          faqItem.classList.toggle('expanded');
        });
      });
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
      // 탭 버튼 활성화 상태 변경
      document.querySelectorAll('.guide-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });

      // 탭 컨텐츠 표시 상태 변경
      document.querySelectorAll('.guide-tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tabContent === tabName);
      });
    }

    /**
     * 탭 네비게이션 초기화
     */
    initializeTabNavigation() {
      // 기본적으로 도움말 탭 활성화
      this.switchTab('help');
    }

    /**
     * 인터랙티브 튜토리얼 시작
     */
    startTutorial() {
      // 모달이 열려있다면 닫기
      if (window.Modal && window.Modal.closeAll) {
        window.Modal.closeAll();
      }

      this.tutorialActive = true;
      this.currentTutorialStep = 0;
      
      // 튜토리얼 오버레이 생성
      this.createTutorialOverlay();
      
      // 첫 번째 스텝 표시
      this.showTutorialStep(0);
    }

    /**
     * 튜토리얼 오버레이 생성
     */
    createTutorialOverlay() {
      // 오버레이 생성
      this.tourOverlay = document.createElement('div');
      this.tourOverlay.className = 'tutorial-overlay';
      this.tourOverlay.innerHTML = `
        <div class="tutorial-backdrop"></div>
      `;

      // 툴팁 생성
      this.tourTooltip = document.createElement('div');
      this.tourTooltip.className = 'tutorial-tooltip';
      this.tourTooltip.innerHTML = `
        <div class="tutorial-content">
          <h4 class="tutorial-title"></h4>
          <p class="tutorial-text"></p>
        </div>
        <div class="tutorial-footer">
          <div class="tutorial-progress">
            <span class="tutorial-step-current">1</span> / <span class="tutorial-step-total">${guideData.tutorialSteps.length}</span>
          </div>
          <div class="tutorial-actions">
            <button class="tutorial-btn tutorial-skip">건너뛰기</button>
            <button class="tutorial-btn tutorial-prev" style="display: none;">이전</button>
            <button class="tutorial-btn tutorial-next tutorial-primary">다음</button>
          </div>
        </div>
      `;

      // 스타일 추가
      const style = document.createElement('style');
      style.textContent = `
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          pointer-events: none;
        }

        .tutorial-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          pointer-events: all;
        }

        .tutorial-highlight {
          position: relative;
          z-index: 10001;
          box-shadow: 0 0 0 4px #6366f1, 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .tutorial-tooltip {
          position: absolute;
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 10002;
          pointer-events: all;
        }

        .tutorial-tooltip::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .tutorial-tooltip.bottom::before {
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 10px 10px 10px;
          border-color: transparent transparent white transparent;
        }

        .tutorial-tooltip.top::before {
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 10px 10px 0 10px;
          border-color: white transparent transparent transparent;
        }

        .tutorial-title {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
        }

        .tutorial-text {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .tutorial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .tutorial-progress {
          color: #999;
          font-size: 14px;
        }

        .tutorial-actions {
          display: flex;
          gap: 10px;
        }

        .tutorial-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f5f5f5;
          color: #666;
        }

        .tutorial-btn:hover {
          background: #e0e0e0;
        }

        .tutorial-primary {
          background: #6366f1;
          color: white;
        }

        .tutorial-primary:hover {
          background: #4f46e5;
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(this.tourOverlay);
      document.body.appendChild(this.tourTooltip);

      // 이벤트 리스너 등록
      this.tourTooltip.querySelector('.tutorial-skip').addEventListener('click', () => this.endTutorial());
      this.tourTooltip.querySelector('.tutorial-prev').addEventListener('click', () => this.prevStep());
      this.tourTooltip.querySelector('.tutorial-next').addEventListener('click', () => this.nextStep());
      
      // 배경 클릭 시 종료
      this.tourOverlay.querySelector('.tutorial-backdrop').addEventListener('click', () => this.endTutorial());
    }

    /**
     * 튜토리얼 스텝 표시
     */
    showTutorialStep(stepIndex) {
      const step = guideData.tutorialSteps[stepIndex];
      
      // 이전 하이라이트 제거
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });

      // 툴팁 내용 업데이트
      this.tourTooltip.querySelector('.tutorial-title').textContent = step.title;
      this.tourTooltip.querySelector('.tutorial-text').textContent = step.content;
      this.tourTooltip.querySelector('.tutorial-step-current').textContent = stepIndex + 1;

      // 버튼 상태 업데이트
      const prevBtn = this.tourTooltip.querySelector('.tutorial-prev');
      const nextBtn = this.tourTooltip.querySelector('.tutorial-next');
      
      prevBtn.style.display = stepIndex > 0 ? 'inline-block' : 'none';
      nextBtn.textContent = stepIndex === guideData.tutorialSteps.length - 1 ? '완료' : '다음';

      // 타겟 요소 하이라이트 및 툴팁 위치 조정
      if (step.target) {
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
          targetElement.classList.add('tutorial-highlight');
          this.positionTooltip(targetElement, step.position);
        }
      } else {
        // 중앙에 표시
        this.tourTooltip.style.top = '50%';
        this.tourTooltip.style.left = '50%';
        this.tourTooltip.style.transform = 'translate(-50%, -50%)';
      }
    }

    /**
     * 툴팁 위치 조정
     */
    positionTooltip(targetElement, position) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = this.tourTooltip.getBoundingClientRect();
      
      // 위치 계산
      let top, left;
      
      switch (position) {
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          this.tourTooltip.className = 'tutorial-tooltip bottom';
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - 20;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          this.tourTooltip.className = 'tutorial-tooltip top';
          break;
        case 'bottom-left':
          top = targetRect.bottom + 20;
          left = targetRect.left;
          this.tourTooltip.className = 'tutorial-tooltip bottom';
          break;
        default:
          top = targetRect.bottom + 20;
          left = targetRect.left;
          this.tourTooltip.className = 'tutorial-tooltip bottom';
      }

      // 화면 밖으로 나가지 않도록 조정
      const padding = 20;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      this.tourTooltip.style.top = top + 'px';
      this.tourTooltip.style.left = left + 'px';
      this.tourTooltip.style.transform = 'none';
    }

    /**
     * 다음 스텝
     */
    nextStep() {
      if (this.currentTutorialStep < guideData.tutorialSteps.length - 1) {
        this.currentTutorialStep++;
        this.showTutorialStep(this.currentTutorialStep);
      } else {
        this.endTutorial();
      }
    }

    /**
     * 이전 스텝
     */
    prevStep() {
      if (this.currentTutorialStep > 0) {
        this.currentTutorialStep--;
        this.showTutorialStep(this.currentTutorialStep);
      }
    }

    /**
     * 튜토리얼 종료
     */
    endTutorial() {
      // 하이라이트 제거
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });

      // 오버레이와 툴팁 제거
      if (this.tourOverlay) {
        this.tourOverlay.remove();
        this.tourOverlay = null;
      }
      if (this.tourTooltip) {
        this.tourTooltip.remove();
        this.tourTooltip = null;
      }

      this.tutorialActive = false;
      
      // 완료 메시지
      if (window.Toast) {
        window.Toast.show('튜토리얼을 완료했습니다! 👏', 'success');
      }
    }

    /**
     * 컨텍스트 도움말 초기화
     */
    initializeContextHelp() {
      // 모든 폼 필드에 도움말 아이콘 추가
      const formFields = document.querySelectorAll('.form-field');
      
      formFields.forEach(field => {
        const label = field.querySelector('label');
        const fieldName = label ? label.textContent.replace('*', '').trim() : '';
        
        if (fieldName && guideData.contextHelp[fieldName]) {
          // 도움말 아이콘 추가
          const helpIcon = document.createElement('span');
          helpIcon.className = 'context-help-icon';
          helpIcon.innerHTML = '?';
          helpIcon.title = '도움말 보기';
          
          // 라벨에 아이콘 추가
          if (label) {
            label.appendChild(helpIcon);
          }
          
          // 클릭 이벤트
          helpIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showContextHelp(fieldName, helpIcon);
          });
        }
      });

      // 스타일 추가
      const style = document.createElement('style');
      style.textContent = `
        .context-help-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          margin-left: 5px;
          background-color: #6366f1;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .context-help-icon:hover {
          background-color: #4f46e5;
          transform: scale(1.1);
        }

        .context-help-tooltip {
          position: absolute;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }

        .context-help-tooltip::before {
          content: '';
          position: absolute;
          top: -5px;
          left: 20px;
          width: 10px;
          height: 10px;
          background: white;
          border: 1px solid #ddd;
          border-right: none;
          border-bottom: none;
          transform: rotate(45deg);
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * 컨텍스트 도움말 표시
     */
    showContextHelp(fieldName, targetElement) {
      // 기존 툴팁 제거
      this.hideAllContextHelp();

      const helpText = guideData.contextHelp[fieldName];
      if (!helpText) return;

      // 툴팁 생성
      const tooltip = document.createElement('div');
      tooltip.className = 'context-help-tooltip';
      tooltip.textContent = helpText;

      document.body.appendChild(tooltip);

      // 위치 조정
      const targetRect = targetElement.getBoundingClientRect();
      tooltip.style.top = (targetRect.bottom + 10) + 'px';
      tooltip.style.left = targetRect.left + 'px';

      // 클릭 외부 영역 시 닫기
      setTimeout(() => {
        document.addEventListener('click', this.hideAllContextHelp.bind(this), { once: true });
      }, 100);

      // 툴팁 맵에 저장
      this.contextTooltips.set(fieldName, tooltip);
    }

    /**
     * 모든 컨텍스트 도움말 숨기기
     */
    hideAllContextHelp() {
      this.contextTooltips.forEach(tooltip => {
        if (tooltip && tooltip.parentNode) {
          tooltip.remove();
        }
      });
      this.contextTooltips.clear();
    }
  }

  // 전역 객체로 등록
  window.UserGuide = new UserGuide();

  // DOM 로드 후 컨텍스트 도움말 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.UserGuide.initializeContextHelp();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      window.UserGuide.initializeContextHelp();
    }, 1000);
  }

})();