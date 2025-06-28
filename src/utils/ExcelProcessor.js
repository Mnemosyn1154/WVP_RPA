/**
 * Excel 파일 처리 모듈
 * SheetJS 라이브러리를 사용한 투자문서 데이터의 Excel 파일 읽기/쓰기
 */

class ExcelProcessor {
    constructor() {
        this.version = '1.0';
        this.sheetName = '투자조건';
        
        // Excel 파일에서 사용할 컬럼 매핑
        this.columnMapping = this.initializeColumnMapping();
    }

    /**
     * 컬럼 매핑 초기화
     * 폼 필드명 -> Excel 표시명 매핑
     */
    initializeColumnMapping() {
        return {
            // 회사 기본 정보
            투자대상: '투자대상',
            대표자: '대표자',
            주소: '주소',
            Series: 'Series',
            사용용도: '사용용도',
            
            // 투자 조건
            투자금액: '투자금액(억원)',
            투자재원: '투자재원',
            투자방식: '투자방식',
            투자단가: '투자단가(원)',
            액면가: '액면가(원)',
            투자전가치: '투자전가치(억원)',
            투자후가치: '투자후가치(억원)',
            동반투자자: '동반투자자',
            
            // 재무 정보
            인수주식수: '인수주식수(주)',
            지분율: '지분율(%)',
            상환이자: '상환이자(%)',
            잔여분배이자: '잔여분배이자(%)',
            주매청이자: '주매청이자(%)',
            
            // 운영 정보
            배당률: '배당률(%)',
            위약벌: '위약벌(%)',
            투자총괄: '투자총괄',
            담당자1: '담당자1',
            담당자2: '담당자2',
            
            // 기타 (시스템 정보)
            // 화폐와 계약일은 variables.json에 정의되지 않았으므로 제거
        };
    }

    /**
     * 폼 데이터를 Excel 파일로 내보내기
     * @param {Object} formData - 폼 데이터
     * @returns {Promise<void>}
     */
    async exportToExcel(formData) {
        try {
            console.log('📊 Excel 파일 생성 시작');
            
            // 워크북 생성
            const workbook = XLSX.utils.book_new();
            
            // 워크시트 데이터 준비
            const worksheetData = this.prepareWorksheetData(formData);
            
            // 워크시트 생성
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
            // 스타일링 적용
            this.applyExcelStyling(worksheet, worksheetData);
            
            // 워크시트를 워크북에 추가
            XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
            
            // 파일명 생성
            const filename = this.generateFilename(formData);
            
            // 파일 다운로드
            XLSX.writeFile(workbook, filename);
            
            console.log('✅ Excel 파일 생성 완료:', filename);
            return filename;
            
        } catch (error) {
            console.error('❌ Excel 파일 생성 실패:', error);
            throw new Error(`Excel 파일 생성에 실패했습니다: ${error.message}`);
        }
    }

    /**
     * Excel 파일에서 폼 데이터 가져오기
     * @param {File} file - Excel 파일
     * @returns {Promise<Object>} 폼 데이터
     */
    async importFromExcel(file) {
        try {
            console.log('📂 Excel 파일 읽기 시작:', file.name);
            
            // 파일을 ArrayBuffer로 읽기
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // 워크북 파싱
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // 첫 번째 워크시트 선택
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // 워크시트 데이터를 JSON으로 변환
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 폼 데이터로 변환
            const formData = this.convertFromExcelFormat(jsonData);
            
            // 데이터 검증
            this.validateImportedData(formData);
            
            console.log('✅ Excel 파일 읽기 완료');
            return formData;
            
        } catch (error) {
            console.error('❌ Excel 파일 읽기 실패:', error);
            throw new Error(`Excel 파일을 읽을 수 없습니다: ${error.message}`);
        }
    }

    /**
     * 워크시트 데이터 준비 (성능 최적화)
     * @param {Object} formData - 폼 데이터
     * @returns {Array<Array>} 2차원 배열 형태의 워크시트 데이터
     */
    prepareWorksheetData(formData) {
        // 성능 최적화: 배열 사전 할당
        const estimatedRows = Object.keys(this.columnMapping).length + 20; // 예상 행 수
        const data = new Array(estimatedRows);
        let rowIndex = 0;
        
        // 현재 화폐 정보 가져오기
        const currentCurrency = window.CurrencyManager ? 
            window.CurrencyManager.getCurrentCurrency() : 
            { code: 'KRW', name: '한국 원' };
        
        // 헤더 섹션
        data[rowIndex++] = ['투자문서 생성기 - 투자조건 데이터 시트'];
        data[rowIndex++] = [`생성일시: ${new Date().toLocaleString('ko-KR')}`, `화폐: ${currentCurrency.code} (${currentCurrency.name})`];
        data[rowIndex++] = [`프로젝트: ${formData.투자대상 || '미정'}`, `버전: ${this.version}`];
        data[rowIndex++] = ['='.repeat(50)]; // 구분선
        data[rowIndex++] = []; // 빈 행
        
        // 섹션별 데이터 구성
        rowIndex = this.addSectionData(data, rowIndex, '회사 기본 정보', ['투자대상', '대표자', '주소', 'Series', '사용용도'], formData);
        data[rowIndex++] = []; // 빈 행
        
        rowIndex = this.addSectionData(data, rowIndex, '투자 조건', ['투자금액', '투자재원', '투자방식', '투자단가', '액면가', '투자전가치', '투자후가치', '동반투자자'], formData);
        data[rowIndex++] = []; // 빈 행
        
        rowIndex = this.addSectionData(data, rowIndex, '재무 정보', ['인수주식수', '지분율', '상환이자', '잔여분배이자', '주매청이자'], formData);
        data[rowIndex++] = []; // 빈 행
        
        rowIndex = this.addSectionData(data, rowIndex, '운영 정보', ['배당률', '위약벌', '투자총괄', '담당자1', '담당자2'], formData);
        
        // 실제 사용된 크기로 배열 조정
        return data.slice(0, rowIndex);
    }

    /**
     * 섹션별 데이터 추가
     * @param {Array<Array>} data - 워크시트 데이터 배열
     * @param {string} sectionTitle - 섹션 제목
     * @param {Array<string>} fieldNames - 해당 섹션의 필드명 배열
     * @param {Object} formData - 폼 데이터
     */
    addSectionData(data, rowIndex, sectionTitle, fieldNames, formData) {
        // 섹션 헤더
        data[rowIndex++] = [`📋 ${sectionTitle}`];
        data[rowIndex++] = ['항목', '값'];
        
        // 섹션 데이터 (배치 처리)
        const formattedRows = [];
        
        fieldNames.forEach(fieldName => {
            if (this.columnMapping[fieldName]) {
                const displayName = this.columnMapping[fieldName];
                let value = formData[fieldName] || '';
                
                // 값 포맷팅
                value = this.formatFieldValue(fieldName, value);
                
                if (value !== '') {
                    formattedRows.push([displayName, value]);
                }
            }
        });
        
        // 배치로 데이터 추가
        formattedRows.forEach(row => {
            data[rowIndex++] = row;
        });
        
        return rowIndex;
    }

    /**
     * 필드 값 포맷팅
     * @param {string} fieldName - 필드명
     * @param {*} value - 원본 값
     * @returns {*} 포맷팅된 값
     */
    formatFieldValue(fieldName, value) {
        if (!value && value !== 0) return '';
        
        // 숫자 데이터 포맷팅
        if (typeof value === 'number') {
            if (fieldName.includes('금액') || fieldName.includes('가치')) {
                // 억원 단위는 그대로
                return this.formatNumber(value);
            } else if (fieldName.includes('율') || fieldName.includes('이자') || fieldName === '배당률' || fieldName === '위약벌') {
                // 퍼센트는 소수점 1자리까지
                return parseFloat(value).toFixed(1);
            } else if (fieldName.includes('주식수')) {
                // 주식수는 정수, 천단위 구분자 포함
                return parseInt(value).toLocaleString('ko-KR');
            } else {
                // 기타 숫자
                return this.formatNumber(value);
            }
        }
        
        // 텍스트 데이터는 그대로
        return String(value).trim();
    }

    /**
     * Excel 스타일링 적용
     * @param {Object} worksheet - 워크시트 객체
     * @param {Array<Array>} data - 워크시트 데이터
     */
    applyExcelStyling(worksheet, data) {
        try {
            // 컬럼 너비 설정 (더 넓게)
            worksheet['!cols'] = [
                { wch: 35 }, // A 컬럼 (항목명) - 더 넓게
                { wch: 30 }  // B 컬럼 (값) - 더 넓게
            ];
            
            // 병합할 셀 찾기 및 설정
            if (!worksheet['!merges']) worksheet['!merges'] = [];
            
            // 메인 헤더 병합 (A1:B1)
            worksheet['!merges'].push({
                s: { r: 0, c: 0 }, // 시작 (A1)
                e: { r: 0, c: 1 }  // 끝 (B1)
            });
            
            // 구분선 병합 (A4:B4)
            worksheet['!merges'].push({
                s: { r: 3, c: 0 }, // 시작 (A4)
                e: { r: 3, c: 1 }  // 끝 (B4)
            });
            
            // 섹션 헤더들 병합 (📋이 포함된 행들)
            data.forEach((row, index) => {
                if (row[0] && row[0].includes('📋')) {
                    worksheet['!merges'].push({
                        s: { r: index, c: 0 },
                        e: { r: index, c: 1 }
                    });
                }
            });
            
            // 색상 스타일링 적용
            this.applyCellColors(worksheet, data);
            
            // 워크시트에 제목 설정
            if (!worksheet['!ws']) worksheet['!ws'] = {};
            worksheet['!ws'].title = this.sheetName;
            
            console.log('🎨 Excel 스타일링 (색상 포함) 적용 완료');
            
        } catch (error) {
            console.warn('⚠️ Excel 스타일링 적용 중 오류:', error);
        }
    }

    /**
     * 셀 색상 스타일링 적용
     * @param {Object} worksheet - 워크시트 객체
     * @param {Array<Array>} data - 워크시트 데이터
     */
    applyCellColors(worksheet, data) {
        try {
            // 성능 최적화: 스타일 그룹화를 위한 맵
            const styleGroups = new Map();
            
            // 스타일 정의
            const styles = {
                mainHeader: {
                    fill: { fgColor: { rgb: "4472C4" } },
                    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 14 },
                    alignment: { horizontal: "center", vertical: "center" }
                },
                infoHeader: {
                    fill: { fgColor: { rgb: "F2F2F2" } },
                    font: { bold: true, sz: 11 },
                    alignment: { horizontal: "left", vertical: "center" }
                },
                sectionHeader: {
                    회사기본정보: { fill: { fgColor: { rgb: "E7E6E6" } }, font: { bold: true, color: { rgb: "2F4F4F" } } },
                    투자조건: { fill: { fgColor: { rgb: "D6EAF8" } }, font: { bold: true, color: { rgb: "1F4E79" } } },
                    재무정보: { fill: { fgColor: { rgb: "D5F4E6" } }, font: { bold: true, color: { rgb: "0D5D1E" } } },
                    운영정보: { fill: { fgColor: { rgb: "FDF2E9" } }, font: { bold: true, color: { rgb: "B7950B" } } }
                },
                columnHeader: {
                    fill: { fgColor: { rgb: "F8F9FA" } },
                    font: { bold: true, sz: 10 },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "D4D4D4" } },
                        bottom: { style: "thin", color: { rgb: "D4D4D4" } },
                        left: { style: "thin", color: { rgb: "D4D4D4" } },
                        right: { style: "thin", color: { rgb: "D4D4D4" } }
                    }
                },
                dataCell: {
                    normal: {
                        font: { sz: 10 },
                        alignment: { horizontal: "left", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "E4E4E4" } },
                            bottom: { style: "thin", color: { rgb: "E4E4E4" } },
                            left: { style: "thin", color: { rgb: "E4E4E4" } },
                            right: { style: "thin", color: { rgb: "E4E4E4" } }
                        }
                    },
                    amount: {
                        font: { sz: 10, color: { rgb: "0D8043" }, bold: true },
                        alignment: { horizontal: "right", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "E4E4E4" } },
                            bottom: { style: "thin", color: { rgb: "E4E4E4" } },
                            left: { style: "thin", color: { rgb: "E4E4E4" } },
                            right: { style: "thin", color: { rgb: "E4E4E4" } }
                        }
                    },
                    percentage: {
                        font: { sz: 10, color: { rgb: "D68910" }, bold: true },
                        alignment: { horizontal: "right", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "E4E4E4" } },
                            bottom: { style: "thin", color: { rgb: "E4E4E4" } },
                            left: { style: "thin", color: { rgb: "E4E4E4" } },
                            right: { style: "thin", color: { rgb: "E4E4E4" } }
                        }
                    }
                },
                separator: {
                    fill: { fgColor: { rgb: "34495E" } },
                    font: { color: { rgb: "FFFFFF" }, bold: true },
                    alignment: { horizontal: "center", vertical: "center" }
                }
            };

            // 첫 번째 패스: 행 분류 및 스타일 결정
            data.forEach((row, rowIndex) => {
                let styleKey = '';
                let cellAStyle = null;
                let cellBStyle = null;
                
                if (rowIndex === 0) {
                    styleKey = 'mainHeader';
                    cellAStyle = styles.mainHeader;
                } else if (rowIndex === 1 || rowIndex === 2) {
                    styleKey = 'infoHeader';
                    cellAStyle = styles.infoHeader;
                    cellBStyle = styles.infoHeader;
                } else if (rowIndex === 3) {
                    styleKey = 'separator';
                    cellAStyle = styles.separator;
                } else if (row[0] && row[0].includes('📋')) {
                    const sectionName = this.getSectionNameFromHeader(row[0]);
                    styleKey = `section_${sectionName}`;
                    cellAStyle = styles.sectionHeader[sectionName] || styles.sectionHeader.회사기본정보;
                } else if (row[0] === '항목' && row[1] === '값') {
                    styleKey = 'columnHeader';
                    cellAStyle = styles.columnHeader;
                    cellBStyle = styles.columnHeader;
                } else if (row[0] && row[1] !== undefined && row[1] !== '') {
                    const fieldName = this.getFieldNameFromDisplay(row[0]);
                    styleKey = `data_${fieldName}`;
                    cellAStyle = { ...styles.dataCell.normal };
                    cellBStyle = this.getCellStyle(fieldName, styles.dataCell);
                }
                
                // 스타일 그룹에 추가
                if (styleKey) {
                    if (!styleGroups.has(styleKey)) {
                        styleGroups.set(styleKey, {
                            cells: [],
                            cellAStyle,
                            cellBStyle
                        });
                    }
                    styleGroups.get(styleKey).cells.push({ rowIndex, row });
                }
            });
            
            // 두 번째 패스: 배치 스타일 적용
            for (const [styleKey, group] of styleGroups) {
                const { cells, cellAStyle, cellBStyle } = group;
                
                cells.forEach(({ rowIndex }) => {
                    const cellA = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
                    const cellB = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })];
                    
                    if (cellA && cellAStyle) cellA.s = cellAStyle;
                    if (cellB && cellBStyle) cellB.s = cellBStyle;
                });
            }
            
            console.log('🌈 셀 색상 스타일링 적용 완료');
            
        } catch (error) {
            console.warn('⚠️ 색상 스타일링 적용 중 오류:', error);
        }
    }

    /**
     * 섹션 헤더에서 섹션명 추출
     * @param {string} header - 섹션 헤더 텍스트
     * @returns {string} 섹션명
     */
    getSectionNameFromHeader(header) {
        if (header.includes('회사 기본 정보')) return '회사기본정보';
        if (header.includes('투자 조건')) return '투자조건';
        if (header.includes('재무 정보')) return '재무정보';
        if (header.includes('운영 정보')) return '운영정보';
        return '회사기본정보';
    }

    /**
     * 표시명에서 필드명 추출
     * @param {string} displayName - Excel 표시명
     * @returns {string} 필드명
     */
    getFieldNameFromDisplay(displayName) {
        // 역매핑 테이블에서 찾기
        for (const [fieldName, display] of Object.entries(this.columnMapping)) {
            if (display === displayName) {
                return fieldName;
            }
        }
        return '';
    }

    /**
     * 필드에 따른 셀 스타일 결정
     * @param {string} fieldName - 필드명
     * @param {Object} styles - 스타일 객체
     * @returns {Object} 셀 스타일
     */
    getCellStyle(fieldName, styles) {
        if (fieldName.includes('금액') || fieldName.includes('가치') || fieldName.includes('단가') || fieldName.includes('액면가')) {
            return styles.amount;
        } else if (fieldName.includes('율') || fieldName.includes('이자') || fieldName === '배당률' || fieldName === '위약벌') {
            return styles.percentage;
        } else {
            return styles.normal;
        }
    }

    /**
     * Excel 데이터를 폼 데이터로 변환
     * @param {Array<Array>} jsonData - Excel에서 읽은 JSON 데이터
     * @returns {Object} 폼 데이터
     */
    convertFromExcelFormat(jsonData) {
        const formData = {};
        
        // 데이터 행 찾기 (헤더 이후부터)
        let dataStartRow = -1;
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i][0] === '항목' && jsonData[i][1] === '값') {
                dataStartRow = i + 1;
                break;
            }
        }
        
        if (dataStartRow === -1) {
            throw new Error('Excel 파일 형식이 올바르지 않습니다.');
        }
        
        // 역매핑 테이블 생성 (표시명 -> 필드명)
        const reverseMapping = {};
        Object.entries(this.columnMapping).forEach(([fieldName, displayName]) => {
            reverseMapping[displayName] = fieldName;
        });
        
        // 데이터 변환
        for (let i = dataStartRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 2) {
                const displayName = row[0];
                const value = row[1];
                
                const fieldName = reverseMapping[displayName];
                if (fieldName && value !== undefined && value !== '') {
                    formData[fieldName] = this.parseValue(fieldName, value);
                }
            }
        }
        
        return formData;
    }

    /**
     * 값 파싱 (타입에 따른 변환)
     * @param {string} fieldName - 필드명
     * @param {*} value - 값
     * @returns {*} 파싱된 값
     */
    parseValue(fieldName, value) {
        // 숫자 필드 처리
        if (fieldName.includes('금액') || fieldName.includes('가치') || 
            fieldName.includes('율') || fieldName.includes('이자') || 
            fieldName.includes('주식수') || fieldName === '액면가' || fieldName === '투자단가' || 
            fieldName === '배당률' || fieldName === '위약벌') {
            
            // 문자열에서 숫자만 추출
            const numericValue = typeof value === 'string' ? 
                parseFloat(value.replace(/[^0-9.-]/g, '')) : 
                parseFloat(value);
                
            return isNaN(numericValue) ? 0 : numericValue;
        }
        
        // 날짜 필드 처리
        if (fieldName === '계약일') {
            if (typeof value === 'string') {
                return value;
            } else if (value instanceof Date) {
                return value.toISOString().split('T')[0];
            }
        }
        
        // 텍스트 영역 필드 (개행 문자 유지)
        if (fieldName === '주소' || fieldName === '사용용도') {
            return String(value).trim();
        }
        
        // 기본적으로 문자열로 변환
        return String(value).trim();
    }

    /**
     * 가져온 데이터 검증
     * @param {Object} formData - 폼 데이터
     */
    validateImportedData(formData) {
        const requiredFields = ['투자대상', '투자금액', '투자단가', '투자전가치'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
                missingFields.push(this.columnMapping[field] || field);
            }
        });
        
        if (missingFields.length > 0) {
            throw new Error(`필수 항목이 누락되었습니다: ${missingFields.join(', ')}`);
        }
        
        // 숫자 필드 유효성 검증
        const numericFields = ['투자금액', '투자단가', '투자전가치'];
        numericFields.forEach(field => {
            if (formData[field] && (isNaN(formData[field]) || formData[field] <= 0)) {
                throw new Error(`${this.columnMapping[field]}는 0보다 큰 숫자여야 합니다.`);
            }
        });
    }

    /**
     * 파일을 ArrayBuffer로 읽기
     * @param {File} file - 파일
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = (e) => {
                reject(new Error('파일을 읽을 수 없습니다.'));
            };
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 파일명 생성
     * @param {Object} formData - 폼 데이터
     * @returns {string} 파일명
     */
    generateFilename(formData) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        
        // 회사명 정리 (특수문자 제거)
        const companyName = (formData.투자대상 || '투자프로젝트')
            .replace(/[^가-힣a-zA-Z0-9]/g, '_')
            .substring(0, 20); // 길이 제한
        
        return `${companyName}_투자조건_${dateStr}.xlsx`;
    }

    /**
     * 숫자 포맷팅 (천단위 콤마 제거한 순수 숫자)
     * @param {number} number - 숫자
     * @returns {number} 포맷된 숫자
     */
    formatNumber(number) {
        return parseFloat(number) || 0;
    }

    /**
     * 지원하는 파일 형식 확인
     * @param {File} file - 파일
     * @returns {boolean} 지원 여부
     */
    isSupportedFile(file) {
        const supportedExtensions = ['.xlsx', '.xls'];
        const fileName = file.name.toLowerCase();
        
        return supportedExtensions.some(ext => fileName.endsWith(ext));
    }
}

// 전역 인스턴스 생성
window.ExcelProcessor = new ExcelProcessor(); 