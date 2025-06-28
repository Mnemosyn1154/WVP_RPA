/**
 * 작업 히스토리 관리자
 * 사용자의 모든 작업을 기록하고 관리하는 클래스
 * @class HistoryManager
 * @since 2025-01-26
 */

class HistoryManager {
  constructor() {
    this.HISTORY_KEY = 'investment_work_history';
    this.MAX_HISTORY_ITEMS = 10;
    this.history = this.loadHistory();
    
    // 이벤트 리스너 추적을 위한 WeakMap
    this.eventListeners = new WeakMap();
    this.activeListeners = [];
  }

  /**
   * 로컬 스토리지에서 히스토리 로드
   * @returns {Array} 히스토리 배열
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
      return [];
    }
  }

  /**
   * 로컬 스토리지에 히스토리 저장
   */
  saveHistory() {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('히스토리 저장 실패:', error);
    }
  }

  /**
   * 작업 기록 추가
   * @param {Object} params - 작업 정보
   * @param {string} params.type - 작업 유형
   * @param {string} params.description - 작업 설명
   * @param {boolean} params.success - 성공 여부
   * @param {Object} params.details - 추가 상세 정보
   */
  addRecord(params) {
    const { type, description, success = true, details = {} } = params;
    
    const record = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      description,
      success,
      details,
      // 사용자 친화적인 시간 정보
      displayTime: this.formatDisplayTime(new Date())
    };

    // 최신 기록을 앞에 추가
    this.history.unshift(record);

    // 최대 개수 유지
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    // 저장
    this.saveHistory();

    // 이벤트 발생
    this.dispatchHistoryEvent('added', record);

    return record;
  }

  /**
   * 문서 생성 작업 기록
   * @param {string} documentType - 문서 유형
   * @param {string} filename - 파일명
   * @param {boolean} success - 성공 여부
   */
  recordDocumentGeneration(documentType, filename, success = true) {
    const typeNames = {
      'termsheet': 'Term Sheet',
      'preliminary': '예비투심위 보고서',
      'all': '전체 문서'
    };

    return this.addRecord({
      type: 'document_generation',
      description: `${typeNames[documentType] || documentType} 생성`,
      success,
      details: {
        documentType,
        filename,
        icon: '📄'
      }
    });
  }

  /**
   * Excel 저장 작업 기록
   * @param {string} filename - 파일명
   * @param {boolean} success - 성공 여부
   */
  recordExcelSave(filename, success = true) {
    return this.addRecord({
      type: 'excel_save',
      description: 'Excel 파일로 저장',
      success,
      details: {
        filename,
        icon: '💾'
      }
    });
  }

  /**
   * Excel 로드 작업 기록
   * @param {string} filename - 파일명
   * @param {boolean} success - 성공 여부
   * @param {number} loadedFields - 로드된 필드 수
   */
  recordExcelLoad(filename, success = true, loadedFields = 0) {
    return this.addRecord({
      type: 'excel_load',
      description: 'Excel 파일에서 불러오기',
      success,
      details: {
        filename,
        loadedFields,
        icon: '📂'
      }
    });
  }

  /**
   * 데이터 초기화 작업 기록
   */
  recordDataClear() {
    return this.addRecord({
      type: 'data_clear',
      description: '데이터 초기화',
      success: true,
      details: {
        icon: '🗑️'
      }
    });
  }

  /**
   * 미리보기 작업 기록
   * @param {string} documentType - 문서 유형
   */
  recordPreview(documentType) {
    const typeNames = {
      'termsheet': 'Term Sheet',
      'preliminary': '예비투심위 보고서'
    };

    return this.addRecord({
      type: 'preview',
      description: `${typeNames[documentType] || documentType} 미리보기`,
      success: true,
      details: {
        documentType,
        icon: '👁️'
      }
    });
  }

  /**
   * 전체 히스토리 가져오기
   * @returns {Array} 히스토리 배열
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * 히스토리 초기화
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.dispatchHistoryEvent('cleared');
  }

  /**
   * 특정 유형의 마지막 작업 가져오기
   * @param {string} type - 작업 유형
   * @returns {Object|null} 작업 기록
   */
  getLastRecordByType(type) {
    return this.history.find(record => record.type === type) || null;
  }

  /**
   * 성공한 작업만 가져오기
   * @returns {Array} 성공한 작업 배열
   */
  getSuccessfulRecords() {
    return this.history.filter(record => record.success);
  }

  /**
   * 실패한 작업만 가져오기
   * @returns {Array} 실패한 작업 배열
   */
  getFailedRecords() {
    return this.history.filter(record => !record.success);
  }

  /**
   * 시간 형식 변환 (사용자 친화적)
   * @param {Date} date - 날짜 객체
   * @returns {string} 형식화된 시간 문자열
   */
  formatDisplayTime(date) {
    const now = new Date();
    const diff = now - date;
    
    // 1분 미만
    if (diff < 60000) {
      return '방금 전';
    }
    
    // 1시간 미만
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}분 전`;
    }
    
    // 24시간 미만
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}시간 전`;
    }
    
    // 오늘
    if (date.toDateString() === now.toDateString()) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // 어제
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // 그 외
    return date.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 히스토리 이벤트 발생
   * @param {string} action - 액션 타입
   * @param {Object} data - 이벤트 데이터
   */
  dispatchHistoryEvent(action, data = null) {
    const event = new CustomEvent('historyChanged', {
      detail: { action, data }
    });
    document.dispatchEvent(event);
  }

  /**
   * 히스토리 통계 가져오기
   * @returns {Object} 통계 정보
   */
  getStatistics() {
    const stats = {
      total: this.history.length,
      successful: 0,
      failed: 0,
      byType: {}
    };

    this.history.forEach(record => {
      // 성공/실패 카운트
      if (record.success) {
        stats.successful++;
      } else {
        stats.failed++;
      }

      // 유형별 카운트
      if (!stats.byType[record.type]) {
        stats.byType[record.type] = 0;
      }
      stats.byType[record.type]++;
    });

    return stats;
  }

  /**
   * 이벤트 리스너 추가 (메모리 누수 방지)
   * @param {string} eventName - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @param {EventTarget} target - 이벤트 타겟 (기본값: document)
   */
  addEventListener(eventName, handler, target = document) {
    // 리스너 정보 저장
    const listenerInfo = { eventName, handler, target };
    this.activeListeners.push(listenerInfo);
    
    // 실제 이벤트 리스너 등록
    target.addEventListener(eventName, handler);
    
    // WeakMap에 매핑 저장
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, []);
    }
    this.eventListeners.get(target).push(listenerInfo);
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  removeAllEventListeners() {
    this.activeListeners.forEach(({ eventName, handler, target }) => {
      target.removeEventListener(eventName, handler);
    });
    this.activeListeners = [];
  }

  /**
   * 컴포넌트 정리 (메모리 누수 방지)
   */
  cleanup() {
    // 모든 이벤트 리스너 제거
    this.removeAllEventListeners();
    
    // 히스토리 데이터는 유지하되 참조만 정리
    this.eventListeners = new WeakMap();
    
    console.log('🧹 HistoryManager 정리 완료');
  }

  /**
   * 히스토리 크기 최적화
   * @param {number} maxItems - 최대 아이템 수
   */
  optimizeHistorySize(maxItems = null) {
    const limit = maxItems || this.MAX_HISTORY_ITEMS;
    if (this.history.length > limit) {
      this.history = this.history.slice(0, limit);
      this.saveHistory();
      console.log(`📊 히스토리 크기 최적화: ${limit}개 항목으로 제한`);
    }
  }
}

// 전역 히스토리 매니저 인스턴스 생성
window.HistoryManager = new HistoryManager();