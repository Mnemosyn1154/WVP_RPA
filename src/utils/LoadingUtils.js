/**
 * 로딩 유틸리티 - 성능 최적화 및 스켈레톤 UI
 * @version 1.0
 * @since 2025-01-26
 */

window.LoadingUtils = (() => {
  let loadingStartTime = null;
  let progressInterval = null;
  let currentStep = 0;
  
  // 로딩 단계별 메시지
  const loadingMessages = [
    { text: '브라우저 호환성 확인 중...', icon: '🔍' },
    { text: '설정 파일 로드 중...', icon: '📁' },
    { text: '핵심 모듈 초기화 중...', icon: '🔧' },
    { text: 'UI 컴포넌트 준비 중...', icon: '🎨' },
    { text: '이벤트 리스너 등록 중...', icon: '🎧' },
    { text: '투자문서 시스템 준비 완료!', icon: '✅' }
  ];
  
  /**
   * 메인 로딩 시작
   * @param {number} estimatedTime - 예상 로딩 시간 (밀리초)
   */
  function startMainLoading(estimatedTime = 3000) {
    loadingStartTime = Date.now();
    currentStep = 0;
    
    const loadingText = document.getElementById('loadingText');
    const loadingSubtitle = document.getElementById('loadingSubtitle');
    const loadingSteps = document.querySelectorAll('.loading-step');
    
    if (!loadingText || !loadingSteps) return;
    
    // 초기 메시지 설정
    updateLoadingMessage(0);
    
    // 프로그레스 애니메이션 시작
    const stepDuration = estimatedTime / loadingMessages.length;
    
    progressInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep < loadingMessages.length) {
        updateLoadingMessage(currentStep);
        
        // 스텝 인디케이터 업데이트
        if (loadingSteps[currentStep - 1]) {
          loadingSteps[currentStep - 1].classList.add('completed');
        }
      } else {
        clearInterval(progressInterval);
      }
    }, stepDuration);
  }
  
  /**
   * 로딩 메시지 업데이트
   * @param {number} step - 현재 단계
   */
  function updateLoadingMessage(step) {
    const loadingText = document.getElementById('loadingText');
    const loadingSubtitle = document.getElementById('loadingSubtitle');
    
    if (!loadingText) return;
    
    const message = loadingMessages[step];
    
    // 페이드 애니메이션
    loadingText.style.opacity = '0';
    
    setTimeout(() => {
      loadingText.innerHTML = `${message.icon} ${message.text}`;
      loadingText.style.opacity = '1';
      
      // 서브타이틀 업데이트
      if (loadingSubtitle) {
        const progress = Math.round((step / (loadingMessages.length - 1)) * 100);
        loadingSubtitle.textContent = `${progress}% 완료`;
      }
    }, 200);
  }
  
  /**
   * 로딩 완료
   */
  function completeLoading() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    // 모든 스텝 완료 표시
    const loadingSteps = document.querySelectorAll('.loading-step');
    loadingSteps.forEach(step => step.classList.add('completed'));
    
    // 마지막 메시지 표시
    updateLoadingMessage(loadingMessages.length - 1);
    
    // 로딩 시간 측정
    if (loadingStartTime) {
      const loadTime = Date.now() - loadingStartTime;
      console.log(`🚀 로딩 완료: ${loadTime}ms`);
    }
  }
  
  /**
   * 로딩 중단
   */
  function stopLoading() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
  }
  
  /**
   * 스켈레톤 UI 표시
   * @param {string} containerId - 컨테이너 ID
   * @param {number} count - 스켈레톤 항목 개수
   */
  function showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeletonHTML = `
      <div class="skeleton-wrapper">
        ${Array(count).fill(0).map(() => `
          <div class="skeleton-section">
            <div class="skeleton-header">
              <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-content">
              <div class="skeleton-field">
                <div class="skeleton-label"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="skeleton-field">
                <div class="skeleton-label"></div>
                <div class="skeleton-input"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = skeletonHTML;
    
    // 스켈레톤 애니메이션 CSS 추가
    if (!document.getElementById('skeleton-styles')) {
      const style = document.createElement('style');
      style.id = 'skeleton-styles';
      style.textContent = `
        .skeleton-wrapper {
          padding: 20px;
        }
        
        .skeleton-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .skeleton-header {
          margin-bottom: 20px;
        }
        
        .skeleton-title {
          height: 24px;
          width: 200px;
          background: #e5e7eb;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        
        .skeleton-field {
          margin-bottom: 16px;
        }
        
        .skeleton-label {
          height: 16px;
          width: 100px;
          background: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .skeleton-input {
          height: 40px;
          background: #f9fafb;
          border-radius: 4px;
        }
        
        /* 스켈레톤 애니메이션 */
        .skeleton-title::after,
        .skeleton-label::after,
        .skeleton-input::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: skeleton-shimmer 1.5s infinite;
        }
        
        @keyframes skeleton-shimmer {
          100% {
            left: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * 스켈레톤 UI 숨기기
   * @param {string} containerId - 컨테이너 ID
   */
  function hideSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      const skeleton = container.querySelector('.skeleton-wrapper');
      if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.transition = 'opacity 0.3s ease';
        setTimeout(() => skeleton.remove(), 300);
      }
    }
  }
  
  // Public API
  return {
    startMainLoading,
    completeLoading,
    stopLoading,
    showSkeleton,
    hideSkeleton
  };
})();

// 로딩 스텝 스타일 추가
(function addLoadingStepStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .loading-steps {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .loading-step {
      width: 40px;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    
    .loading-step.completed {
      background: var(--primary-color);
      transform: scaleX(1.1);
    }
    
    #loadingText {
      font-size: 18px;
      color: #374151;
      margin-bottom: 10px;
      transition: opacity 0.3s ease;
    }
    
    .loading-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-top: 10px;
    }
    
    .spinner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    
    .spinner-icon {
      font-size: 20px;
      position: absolute;
      opacity: 0;
      animation: icon-fade 3s infinite;
    }
    
    .spinner-icon:nth-child(1) { animation-delay: 0s; }
    .spinner-icon:nth-child(2) { animation-delay: 0.75s; }
    .spinner-icon:nth-child(3) { animation-delay: 1.5s; }
    .spinner-icon:nth-child(4) { animation-delay: 2.25s; }
    
    @keyframes icon-fade {
      0%, 75%, 100% { opacity: 0; }
      25%, 50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();