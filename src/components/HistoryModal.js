/**
 * 작업 히스토리 모달 컴포넌트
 * 사용자의 작업 기록을 표시하는 모달
 * @namespace HistoryModal
 * @since 2025-01-26
 */

window.HistoryModal = {
  /**
   * 히스토리 모달 표시
   */
  show() {
    try {
      const history = window.HistoryManager.getHistory();
      const stats = window.HistoryManager.getStatistics();
      
      const content = this.generateContent(history, stats);
      
      window.Modal.show({
        title: '📊 작업 히스토리',
        content,
        size: 'large',
        closable: true,
        buttons: [
          {
            text: '히스토리 초기화',
            type: 'danger',
            action: 'clear'
          },
          {
            text: '닫기',
            type: 'secondary',
            action: 'close'
          }
        ],
        onAction: async (action) => {
          if (action === 'clear') {
            const confirmed = await window.Modal.confirm(
              '모든 작업 기록을 삭제하시겠습니까?<br>' +
              '<span style="color: #666; font-size: 0.9em;">이 작업은 되돌릴 수 없습니다.</span>',
              '🗑️ 히스토리 초기화'
            );
            
            if (confirmed) {
              window.HistoryManager.clearHistory();
              window.Toast.show('작업 히스토리가 초기화되었습니다.', 'info');
              return true; // 모달을 닫기 위해 true 반환
            }
            return false; // 모달을 열어두기 위해 false 반환
          }
          return true; // 다른 액션들은 모달을 닫음
        }
      });
      
    } catch (error) {
      console.error('히스토리 모달 표시 실패:', error);
      window.Toast.show('히스토리를 불러올 수 없습니다.', 'error');
    }
  },

  /**
   * 모달 콘텐츠 생성
   * @param {Array} history - 히스토리 배열
   * @param {Object} stats - 통계 정보
   * @returns {string} HTML 콘텐츠
   */
  generateContent(history, stats) {
    return `
      <div class="history-modal-content">
        ${this.generateStats(stats)}
        ${this.generateHistoryList(history)}
      </div>
    `;
  },

  /**
   * 통계 섹션 생성
   * @param {Object} stats - 통계 정보
   * @returns {string} HTML
   */
  generateStats(stats) {
    return `
      <div class="history-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">전체 작업</div>
          </div>
          <div class="stat-item success">
            <div class="stat-value">${stats.successful}</div>
            <div class="stat-label">성공</div>
          </div>
          <div class="stat-item failed">
            <div class="stat-value">${stats.failed}</div>
            <div class="stat-label">실패</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.getSuccessRate(stats)}%</div>
            <div class="stat-label">성공률</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 히스토리 목록 생성
   * @param {Array} history - 히스토리 배열
   * @returns {string} HTML
   */
  generateHistoryList(history) {
    if (history.length === 0) {
      return `
        <div class="history-empty">
          <p>아직 작업 기록이 없습니다.</p>
          <small>문서 생성, 저장, 불러오기 등의 작업이 여기에 기록됩니다.</small>
        </div>
      `;
    }

    const items = history.map(record => this.generateHistoryItem(record)).join('');
    
    return `
      <div class="history-list">
        <h4>최근 작업 내역</h4>
        <div class="history-items">
          ${items}
        </div>
      </div>
    `;
  },

  /**
   * 개별 히스토리 아이템 생성
   * @param {Object} record - 작업 기록
   * @returns {string} HTML
   */
  generateHistoryItem(record) {
    const icon = record.details.icon || this.getTypeIcon(record.type);
    const statusClass = record.success ? 'success' : 'failed';
    const statusText = record.success ? '성공' : '실패';
    
    return `
      <div class="history-item ${statusClass}">
        <div class="history-icon">${icon}</div>
        <div class="history-content">
          <div class="history-header">
            <span class="history-title">${record.description}</span>
            <span class="history-status ${statusClass}">${statusText}</span>
          </div>
          ${this.generateDetails(record)}
          <div class="history-time">${record.displayTime}</div>
        </div>
      </div>
    `;
  },

  /**
   * 상세 정보 생성
   * @param {Object} record - 작업 기록
   * @returns {string} HTML
   */
  generateDetails(record) {
    const details = [];
    
    if (record.details.filename) {
      details.push(`<span class="detail-item">파일: ${record.details.filename}</span>`);
    }
    
    if (record.details.loadedFields) {
      details.push(`<span class="detail-item">${record.details.loadedFields}개 필드 로드</span>`);
    }
    
    if (record.details.documentType && record.type !== 'preview') {
      const typeNames = {
        'termsheet': 'Term Sheet',
        'preliminary': '예비투심위',
        'all': '전체 문서'
      };
      details.push(`<span class="detail-item">${typeNames[record.details.documentType]}</span>`);
    }
    
    return details.length > 0 ? 
      `<div class="history-details">${details.join(' • ')}</div>` : '';
  },

  /**
   * 작업 유형별 아이콘 가져오기
   * @param {string} type - 작업 유형
   * @returns {string} 아이콘
   */
  getTypeIcon(type) {
    const icons = {
      'document_generation': '📄',
      'excel_save': '💾',
      'excel_load': '📂',
      'data_clear': '🗑️',
      'preview': '👁️'
    };
    return icons[type] || '📌';
  },

  /**
   * 성공률 계산
   * @param {Object} stats - 통계 정보
   * @returns {number} 성공률
   */
  getSuccessRate(stats) {
    if (stats.total === 0) return 0;
    return Math.round((stats.successful / stats.total) * 100);
  }
};

// 히스토리 모달 스타일 추가
const historyStyles = document.createElement('style');
historyStyles.textContent = `
  .history-modal-content {
    padding: 20px 0;
  }

  .history-stats {
    margin-bottom: 30px;
    padding: 20px;
    background: var(--background-secondary);
    border-radius: 8px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    text-align: center;
  }

  .stat-item {
    padding: 15px;
    background: white;
    border-radius: 6px;
    transition: transform 0.2s;
  }

  .stat-item:hover {
    transform: translateY(-2px);
  }

  .stat-item.success {
    border-top: 3px solid var(--success-color);
  }

  .stat-item.failed {
    border-top: 3px solid var(--error-color);
  }

  .stat-value {
    font-size: 2em;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 5px;
  }

  .stat-label {
    font-size: 0.9em;
    color: #666;
  }

  .history-empty {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .history-empty p {
    font-size: 1.1em;
    margin-bottom: 10px;
  }

  .history-list h4 {
    margin-bottom: 15px;
    color: var(--primary-color);
  }

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: var(--background-secondary);
    border-radius: 8px;
    border-left: 4px solid transparent;
    transition: all 0.2s;
  }

  .history-item:hover {
    background: #f0f2f5;
  }

  .history-item.success {
    border-left-color: var(--success-color);
  }

  .history-item.failed {
    border-left-color: var(--error-color);
  }

  .history-icon {
    font-size: 1.5em;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 50%;
  }

  .history-content {
    flex: 1;
    min-width: 0;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .history-title {
    font-weight: 500;
    color: #333;
  }

  .history-status {
    font-size: 0.85em;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }

  .history-status.success {
    color: var(--success-color);
    background: rgba(76, 175, 80, 0.1);
  }

  .history-status.failed {
    color: var(--error-color);
    background: rgba(244, 67, 54, 0.1);
  }

  .history-details {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 5px;
  }

  .detail-item {
    margin-right: 10px;
  }

  .history-time {
    font-size: 0.85em;
    color: #999;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .history-item {
      padding: 12px;
    }
    
    .history-icon {
      width: 32px;
      height: 32px;
      font-size: 1.2em;
    }
  }
`;

document.head.appendChild(historyStyles);