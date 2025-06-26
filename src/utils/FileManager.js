/**
 * 파일 관리 통합 모듈
 * Excel 파일 기반 저장/불러오기와 기존 LocalStorage 백업 관리
 */

class FileManager {
    constructor() {
        this.excelProcessor = window.ExcelProcessor;
        this.storageManager = window.StorageManager;
        this.fileInput = null;
        
        this.initializeFileInput();
    }

    /**
     * 파일 입력 요소 초기화
     */
    initializeFileInput() {
        this.fileInput = document.getElementById('fileInput');
        if (!this.fileInput) {
            console.warn('파일 입력 요소를 찾을 수 없습니다.');
            return;
        }

        // 파일 선택 이벤트 리스너
        this.fileInput.addEventListener('change', (event) => {
            this.handleFileSelection(event);
        });
    }

    /**
     * 폼 데이터를 Excel 파일로 저장
     * @param {Object} formData - 저장할 폼 데이터
     * @returns {Promise<string>} 저장된 파일명
     */
    async saveToExcel(formData) {
        try {
            // 데이터 검증
            if (!formData || Object.keys(formData).length === 0) {
                throw new Error('저장할 데이터가 없습니다.');
            }

            console.log('💾 Excel 파일 저장 시작');

            // ExcelProcessor를 사용하여 파일 생성
            const filename = await this.excelProcessor.exportToExcel(formData);

            // LocalStorage에 백업 저장
            this.createBackup(formData, filename);

            console.log('✅ Excel 파일 저장 완료:', filename);
            return filename;

        } catch (error) {
            console.error('❌ Excel 파일 저장 실패:', error);
            throw error;
        }
    }

    /**
     * Excel 파일에서 폼 데이터 불러오기
     * @returns {Promise<void>}
     */
    async loadFromExcel() {
        try {
            if (!this.fileInput) {
                throw new Error('파일 입력 요소가 초기화되지 않았습니다.');
            }

            // 파일 선택 다이얼로그 열기
            this.fileInput.click();

        } catch (error) {
            console.error('❌ 파일 불러오기 실패:', error);
            throw error;
        }
    }

    /**
     * 파일 선택 처리
     * @param {Event} event - 파일 선택 이벤트
     */
    async handleFileSelection(event) {
        try {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            console.log('📂 선택된 파일:', file.name);

            // 파일 형식 확인
            if (!this.excelProcessor.isSupportedFile(file)) {
                throw new Error('지원하지 않는 파일 형식입니다. (.xlsx, .xls 파일만 가능)');
            }

            // 파일 크기 확인 (10MB 제한)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('파일 크기가 너무 큽니다. (최대 10MB)');
            }

            // 로딩 표시
            this.showLoadingToast();

            // ExcelProcessor를 사용하여 파일 읽기
            const formData = await this.excelProcessor.importFromExcel(file);

            // 폼에 데이터 적용
            await this.applyDataToForm(formData);

            // 백업 생성
            this.createBackup(formData, file.name);

            // 성공 히스토리 기록
            const loadedFieldsCount = Object.keys(formData).length;
            if (window.HistoryManager) {
                window.HistoryManager.recordExcelLoad(file.name, true, loadedFieldsCount);
            }

            // 성공 메시지
            if (window.Toast) {
                window.Toast.success(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);
            }

            console.log('✅ 파일 불러오기 완료:', file.name);

        } catch (error) {
            console.error('❌ 파일 처리 실패:', error);
            
            // 실패 히스토리 기록
            if (window.HistoryManager) {
                const fileName = file ? file.name : '알 수 없는 파일';
                window.HistoryManager.recordExcelLoad(fileName, false, 0);
            }
            
            if (window.Toast) {
                window.Toast.error(error.message);
            }
        } finally {
            // 로딩 토스트 숨기기
            this.hideLoadingToast();
            
            // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
            if (this.fileInput) {
                this.fileInput.value = '';
            }
        }
    }

    /**
     * 폼에 데이터 적용
     * @param {Object} formData - 적용할 폼 데이터
     */
    async applyDataToForm(formData) {
        try {
            // 전역 앱 인스턴스를 통해 폼 데이터 설정
            if (window.investmentApp && window.investmentApp.formGenerator) {
                // 폼 데이터 업데이트
                window.investmentApp.formData = { ...formData };
                
                // 폼 필드들에 값 채우기
                window.investmentApp.formGenerator.populateForm(formData);
                
                console.log('📋 폼 데이터 적용 완료');
            } else {
                throw new Error('폼 생성기를 찾을 수 없습니다.');
            }

        } catch (error) {
            console.error('❌ 폼 데이터 적용 실패:', error);
            throw new Error('데이터를 폼에 적용하는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 백업 생성
     * @param {Object} formData - 백업할 데이터
     * @param {string} sourceFile - 원본 파일명
     */
    createBackup(formData, sourceFile) {
        try {
            if (this.storageManager) {
                const backupData = {
                    ...formData,
                    _backup_info: {
                        source: sourceFile,
                        timestamp: new Date().toISOString(),
                        type: 'excel_file'
                    }
                };
                
                this.storageManager.save(backupData);
                console.log('💾 LocalStorage 백업 생성 완료');
            }
        } catch (error) {
            console.warn('⚠️ 백업 생성 실패:', error);
        }
    }

    /**
     * 로딩 토스트 표시
     */
    showLoadingToast() {
        if (window.Toast) {
            this.loadingToastId = window.Toast.loading('파일을 읽는 중입니다...', {
                persistent: true
            });
        }
    }

    /**
     * 로딩 토스트 숨기기
     */
    hideLoadingToast() {
        if (window.Toast && this.loadingToastId) {
            window.Toast.hide(this.loadingToastId);
            this.loadingToastId = null;
        }
    }

    /**
     * 현재 폼 데이터 가져오기
     * @returns {Object} 현재 폼 데이터
     */
    getCurrentFormData() {
        try {
            if (window.investmentApp && window.investmentApp.formGenerator) {
                return window.investmentApp.formGenerator.getAllFieldValues();
            }
            return {};
        } catch (error) {
            console.error('현재 폼 데이터 가져오기 실패:', error);
            return {};
        }
    }

    /**
     * 데이터 검증
     * @param {Object} formData - 검증할 데이터
     * @returns {boolean} 검증 결과
     */
    validateFormData(formData) {
        if (!formData || typeof formData !== 'object') {
            return false;
        }

        // 필수 필드 확인
        const requiredFields = ['투자대상'];
        return requiredFields.every(field => 
            formData[field] && String(formData[field]).trim() !== ''
        );
    }

    /**
     * 파일 다운로드 기록 관리
     * @param {string} filename - 다운로드된 파일명
     */
    recordDownload(filename) {
        try {
            const downloads = this.getDownloadHistory();
            const record = {
                filename: filename,
                timestamp: new Date().toISOString(),
                companyName: this.extractCompanyName(filename)
            };

            downloads.unshift(record);

            // 최대 10개 기록 유지
            if (downloads.length > 10) {
                downloads.splice(10);
            }

            localStorage.setItem('investment_download_history', JSON.stringify(downloads));
            
        } catch (error) {
            console.warn('다운로드 기록 저장 실패:', error);
        }
    }

    /**
     * 다운로드 기록 조회
     * @returns {Array} 다운로드 기록 목록
     */
    getDownloadHistory() {
        try {
            const history = localStorage.getItem('investment_download_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('다운로드 기록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 파일명에서 회사명 추출
     * @param {string} filename - 파일명
     * @returns {string} 회사명
     */
    extractCompanyName(filename) {
        try {
            // "회사명_투자조건_날짜.xlsx" 형식에서 회사명 추출
            const parts = filename.split('_');
            return parts[0] || '알 수 없음';
        } catch (error) {
            return '알 수 없음';
        }
    }

    /**
     * 파일 처리 상태 확인
     * @returns {Object} 상태 정보
     */
    getStatus() {
        return {
            excelProcessorReady: !!this.excelProcessor,
            storageManagerReady: !!this.storageManager,
            fileInputReady: !!this.fileInput,
            sheetJSLoaded: typeof XLSX !== 'undefined'
        };
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        console.log('🔍 FileManager 디버그 정보:');
        console.log('- 상태:', this.getStatus());
        console.log('- 다운로드 기록:', this.getDownloadHistory());
        console.log('- 현재 폼 데이터:', this.getCurrentFormData());
    }
}

// 전역 인스턴스 생성
window.FileManager = new FileManager(); 