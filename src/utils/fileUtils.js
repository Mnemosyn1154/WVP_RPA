/**
 * 파일 처리 유틸리티
 * 파일 다운로드, 업로드, 변환 등의 기능
 */

class FileUtils {
    constructor() {
        this.supportedFormats = ['json', 'docx'];
    }

    /**
     * 파일 다운로드
     * @param {string|Blob} content - 다운로드할 내용
     * @param {string} filename - 파일명
     * @param {string} mimeType - MIME 타입
     */
    downloadFile(content, filename, mimeType = 'application/octet-stream') {
        try {
            let blob;
            
            if (content instanceof Blob) {
                blob = content;
            } else {
                blob = new Blob([content], { type: mimeType });
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 메모리 정리
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            return true;
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            return false;
        }
    }

    /**
     * JSON 파일 다운로드
     * @param {Object} data - JSON 데이터
     * @param {string} filename - 파일명
     */
    downloadJSON(data, filename = 'data.json') {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            return this.downloadFile(jsonString, filename, 'application/json');
        } catch (error) {
            console.error('JSON 파일 다운로드 실패:', error);
            return false;
        }
    }

    /**
     * 파일 업로드 (파일 선택 다이얼로그)
     * @param {string} accept - 허용할 파일 타입
     * @param {boolean} multiple - 다중 선택 여부
     * @returns {Promise<FileList|File>} 선택된 파일(들)
     */
    uploadFile(accept = '*/*', multiple = false) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.style.display = 'none';
            
            input.onchange = (event) => {
                const files = event.target.files;
                if (files && files.length > 0) {
                    resolve(multiple ? files : files[0]);
                } else {
                    reject(new Error('파일이 선택되지 않았습니다.'));
                }
                document.body.removeChild(input);
            };
            
            input.oncancel = () => {
                reject(new Error('파일 선택이 취소되었습니다.'));
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
        });
    }

    /**
     * 파일 읽기 (텍스트)
     * @param {File} file - 읽을 파일
     * @returns {Promise<string>} 파일 내용
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 제공되지 않았습니다.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('파일 읽기 실패'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * 파일 읽기 (ArrayBuffer)
     * @param {File} file - 읽을 파일
     * @returns {Promise<ArrayBuffer>} 파일 내용
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 제공되지 않았습니다.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('파일 읽기 실패'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * JSON 파일 읽기
     * @param {File} file - JSON 파일
     * @returns {Promise<Object>} 파싱된 JSON 데이터
     */
    async readJSONFile(file) {
        try {
            const text = await this.readFileAsText(file);
            return JSON.parse(text);
        } catch (error) {
            throw new Error('JSON 파일 파싱 실패: ' + error.message);
        }
    }

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 바이트 수
     * @returns {string} 포맷된 크기
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 파일 확장자 추출
     * @param {string} filename - 파일명
     * @returns {string} 확장자
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    }

    /**
     * 파일 타입 검증
     * @param {File} file - 검증할 파일
     * @param {Array<string>} allowedTypes - 허용된 타입들
     * @returns {boolean} 유효성 여부
     */
    validateFileType(file, allowedTypes) {
        if (!file || !allowedTypes || allowedTypes.length === 0) {
            return false;
        }
        
        const extension = this.getFileExtension(file.name);
        return allowedTypes.includes(extension);
    }

    /**
     * 파일 크기 검증
     * @param {File} file - 검증할 파일
     * @param {number} maxSize - 최대 크기 (바이트)
     * @returns {boolean} 유효성 여부
     */
    validateFileSize(file, maxSize) {
        if (!file || !maxSize) {
            return false;
        }
        
        return file.size <= maxSize;
    }

    /**
     * 안전한 파일명 생성
     * @param {string} filename - 원본 파일명
     * @returns {string} 안전한 파일명
     */
    sanitizeFilename(filename) {
        // 위험한 문자 제거
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * 타임스탬프가 포함된 파일명 생성
     * @param {string} baseName - 기본 파일명
     * @param {string} extension - 확장자
     * @returns {string} 타임스탬프 파일명
     */
    generateTimestampFilename(baseName, extension) {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, -5);
        
        return `${baseName}_${timestamp}.${extension}`;
    }

    /**
     * 드래그 앤 드롭 이벤트 설정
     * @param {HTMLElement} element - 대상 엘리먼트
     * @param {Function} onDrop - 드롭 콜백
     * @param {Array<string>} allowedTypes - 허용된 파일 타입
     */
    setupDragAndDrop(element, onDrop, allowedTypes = []) {
        if (!element || typeof onDrop !== 'function') {
            return;
        }

        // 기본 드래그 이벤트 방지
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 드래그 오버 시각적 피드백
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.remove('drag-over');
            });
        });

        // 드롭 처리
        element.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            
            // 파일 타입 검증
            if (allowedTypes.length > 0) {
                const validFiles = files.filter(file => 
                    this.validateFileType(file, allowedTypes)
                );
                
                if (validFiles.length !== files.length) {
                    console.warn('일부 파일이 허용되지 않는 타입입니다.');
                }
                
                onDrop(validFiles);
            } else {
                onDrop(files);
            }
        });
    }

    /**
     * 클립보드에서 이미지 가져오기
     * @returns {Promise<File|null>} 클립보드 이미지 파일
     */
    async getImageFromClipboard() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        return new File([blob], 'clipboard-image.png', { type });
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('클립보드 이미지 가져오기 실패:', error);
            return null;
        }
    }

    /**
     * Base64로 파일 인코딩
     * @param {File} file - 인코딩할 파일
     * @returns {Promise<string>} Base64 문자열
     */
    encodeFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                resolve(reader.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Base64 인코딩 실패'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Base64에서 파일 디코딩
     * @param {string} base64String - Base64 문자열
     * @param {string} filename - 파일명
     * @returns {File} 디코딩된 파일
     */
    decodeBase64ToFile(base64String, filename) {
        try {
            const arr = base64String.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            return new File([u8arr], filename, { type: mime });
        } catch (error) {
            throw new Error('Base64 디코딩 실패: ' + error.message);
        }
    }
}

// 전역 인스턴스 생성
window.FileUtils = new FileUtils(); 