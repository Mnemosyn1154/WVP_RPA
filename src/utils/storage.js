/**
 * 로컬 스토리지 관리 유틸리티
 * 투자문서 생성기의 데이터 저장/복구 기능
 */

class StorageManager {
    constructor() {
        this.storageKey = 'investment_document_data';
        this.backupKey = 'investment_document_backup';
        this.settingsKey = 'investment_document_settings';
    }

    /**
     * 데이터 저장
     * @param {Object} data - 저장할 데이터
     * @param {boolean} isBackup - 백업 저장 여부
     */
    save(data, isBackup = false) {
        try {
            const key = isBackup ? this.backupKey : this.storageKey;
            const saveData = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem(key, JSON.stringify(saveData));
            
            // 자동 백업 생성 (메인 저장 시)
            if (!isBackup) {
                this.createAutoBackup(data);
            }
            
            return true;
        } catch (error) {
            console.error('데이터 저장 실패:', error);
            return false;
        }
    }

    /**
     * 데이터 로드
     * @param {boolean} fromBackup - 백업에서 로드 여부
     * @returns {Object|null} 로드된 데이터
     */
    load(fromBackup = false) {
        try {
            const key = fromBackup ? this.backupKey : this.storageKey;
            const savedData = localStorage.getItem(key);
            
            if (!savedData) {
                return null;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // 데이터 유효성 검증
            if (this.validateData(parsedData)) {
                return parsedData.data;
            }
            
            return null;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            return null;
        }
    }

    /**
     * 자동 백업 생성
     * @param {Object} data - 백업할 데이터
     */
    createAutoBackup(data) {
        try {
            const backups = this.getBackupList();
            const newBackup = {
                id: Date.now(),
                data: data,
                timestamp: new Date().toISOString(),
                name: `자동백업_${new Date().toLocaleString('ko-KR')}`
            };
            
            backups.unshift(newBackup);
            
            // 최대 5개 백업 유지
            if (backups.length > 5) {
                backups.splice(5);
            }
            
            localStorage.setItem('investment_document_backups', JSON.stringify(backups));
        } catch (error) {
            console.error('자동 백업 생성 실패:', error);
        }
    }

    /**
     * 백업 목록 조회
     * @returns {Array} 백업 목록
     */
    getBackupList() {
        try {
            const backups = localStorage.getItem('investment_document_backups');
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('백업 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 특정 백업 로드
     * @param {number} backupId - 백업 ID
     * @returns {Object|null} 백업 데이터
     */
    loadBackup(backupId) {
        try {
            const backups = this.getBackupList();
            const backup = backups.find(b => b.id === backupId);
            return backup ? backup.data : null;
        } catch (error) {
            console.error('백업 로드 실패:', error);
            return null;
        }
    }

    /**
     * 백업 삭제
     * @param {number} backupId - 삭제할 백업 ID
     */
    deleteBackup(backupId) {
        try {
            const backups = this.getBackupList();
            const filteredBackups = backups.filter(b => b.id !== backupId);
            localStorage.setItem('investment_document_backups', JSON.stringify(filteredBackups));
            return true;
        } catch (error) {
            console.error('백업 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 설정 저장
     * @param {Object} settings - 저장할 설정
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('설정 저장 실패:', error);
            return false;
        }
    }

    /**
     * 설정 로드
     * @returns {Object} 설정 데이터
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('설정 로드 실패:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * 기본 설정 반환
     * @returns {Object} 기본 설정
     */
    getDefaultSettings() {
        return {
            autoSave: true,
            autoSaveInterval: 30000, // 30초
            theme: 'auto',
            language: 'ko',
            notifications: true,
            backupCount: 5
        };
    }

    /**
     * 데이터 유효성 검증
     * @param {Object} data - 검증할 데이터
     * @returns {boolean} 유효성 여부
     */
    validateData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        if (!data.data || !data.timestamp || !data.version) {
            return false;
        }
        
        // 버전 호환성 검사
        if (data.version !== '1.0') {
            console.warn('데이터 버전이 다릅니다:', data.version);
        }
        
        return true;
    }

    /**
     * 모든 데이터 삭제
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            localStorage.removeItem('investment_document_backups');
            return true;
        } catch (error) {
            console.error('데이터 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 스토리지 사용량 조회
     * @returns {Object} 사용량 정보
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            let itemCount = 0;
            
            for (let key in localStorage) {
                if (key.startsWith('investment_document')) {
                    totalSize += localStorage[key].length;
                    itemCount++;
                }
            }
            
            return {
                totalSize: totalSize,
                itemCount: itemCount,
                formattedSize: this.formatBytes(totalSize)
            };
        } catch (error) {
            console.error('스토리지 정보 조회 실패:', error);
            return { totalSize: 0, itemCount: 0, formattedSize: '0 B' };
        }
    }

    /**
     * 바이트를 읽기 쉬운 형태로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 크기
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 데이터 내보내기 (JSON 파일)
     * @param {Object} data - 내보낼 데이터
     * @returns {string} JSON 문자열
     */
    exportData(data) {
        try {
            const exportData = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '1.0',
                exported: true
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('데이터 내보내기 실패:', error);
            return null;
        }
    }

    /**
     * 데이터 가져오기 (JSON 파일에서)
     * @param {string} jsonString - JSON 문자열
     * @returns {Object|null} 가져온 데이터
     */
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            if (this.validateData(importedData)) {
                return importedData.data;
            }
            
            return null;
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            return null;
        }
    }
}

// 전역 인스턴스 생성
window.StorageManager = new StorageManager(); 