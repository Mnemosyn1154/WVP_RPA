/**
 * 투자문서 생성기 - 헬퍼 함수 모음
 * @author Investment Document Generator
 * @version 1.0
 * @since 2025-01-23
 */

// =============================================================================
// 📊 숫자 & 통화 포맷팅
// =============================================================================

/**
 * 숫자를 한국 통화 형식으로 포맷팅
 * @param {number} amount - 포맷팅할 금액
 * @param {boolean} showUnit - 단위(원) 표시 여부
 * @returns {string} 포맷팅된 통화 문자열
 */
function formatCurrency(amount, showUnit = true) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showUnit ? '0원' : '0';
  }
  
  const formatted = new Intl.NumberFormat('ko-KR').format(amount);
  return showUnit ? `${formatted}원` : formatted;
}

/**
 * 숫자를 백분율로 포맷팅
 * @param {number} value - 포맷팅할 값
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷팅된 백분율 문자열
 */
function formatPercentage(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * 숫자를 한국 숫자 형식으로 포맷팅
 * @param {number} value - 포맷팅할 숫자
 * @returns {string} 포맷팅된 숫자 문자열
 */
function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('ko-KR').format(value);
}

// =============================================================================
// 📅 날짜 포맷팅
// =============================================================================

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param {Date|string} date - 포맷팅할 날짜
 * @param {string} format - 날짜 형식 ('YYYY-MM-DD', 'YYYY년 MM월 DD일')
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(date = new Date(), format = 'YYYY-MM-DD') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY년 MM월 DD일':
      return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 현재 날짜를 반환
 * @param {string} format - 날짜 형식
 * @returns {string} 현재 날짜 문자열
 */
function getCurrentDate(format = 'YYYY-MM-DD') {
  return formatDate(new Date(), format);
}

// =============================================================================
// 🔤 문자열 처리
// =============================================================================

/**
 * 문자열을 camelCase로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} camelCase 문자열
 */
function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * 문자열을 kebab-case로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} kebab-case 문자열
 */
function toKebabCase(str) {
  return str.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, '');
}

/**
 * 문자열 템플릿 치환
 * @param {string} template - 템플릿 문자열
 * @param {Object} data - 치환할 데이터
 * @returns {string} 치환된 문자열
 */
function replaceTemplate(template, data) {
  return template.replace(/\[([^\]]+)\]/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      return match; // 원본 유지
    }
    
    // 숫자 타입에 따른 포맷팅
    if (typeof value === 'number') {
      if (key.includes('금액') || key.includes('가치')) {
        return formatCurrency(value);
      } else if (key.includes('율') || key.includes('이자') || key.includes('배당')) {
        return formatPercentage(value);
      } else if (key.includes('주식수') || key.includes('수량')) {
        return formatNumber(value);
      }
    }
    
    return String(value);
  });
}

// =============================================================================
// 🔍 유효성 검증
// =============================================================================

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} 유효성 여부
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 한국 전화번호 형식 검증
 * @param {string} phone - 검증할 전화번호
 * @returns {boolean} 유효성 여부
 */
function isValidKoreanPhone(phone) {
  const phoneRegex = /^0\d{1,2}-\d{3,4}-\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 한국 사업자등록번호 형식 검증
 * @param {string} businessNumber - 검증할 사업자등록번호
 * @returns {boolean} 유효성 여부
 */
function isValidBusinessNumber(businessNumber) {
  const businessRegex = /^\d{3}-\d{2}-\d{5}$/;
  return businessRegex.test(businessNumber);
}

/**
 * 빈 값 검증
 * @param {any} value - 검증할 값
 * @returns {boolean} 비어있는지 여부
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// =============================================================================
// 🎨 DOM 조작
// =============================================================================

/**
 * DOM 요소 생성 헬퍼
 * @param {string} tag - HTML 태그
 * @param {Object} attributes - 속성 객체
 * @param {string|HTMLElement} content - 내용
 * @returns {HTMLElement} 생성된 DOM 요소
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // 속성 설정
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // 내용 설정
  if (typeof content === 'string') {
    element.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    element.appendChild(content);
  }
  
  return element;
}

/**
 * CSS 클래스 토글
 * @param {HTMLElement} element - 대상 요소
 * @param {string} className - 클래스명
 * @param {boolean} force - 강제 설정 (선택사항)
 */
function toggleClass(element, className, force) {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
}

// =============================================================================
// 🔄 비동기 처리
// =============================================================================

/**
 * 지연 실행 (디바운싱)
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} 디바운싱된 함수
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 스로틀링
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function} 스로틀링된 함수
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Promise 기반 지연
 * @param {number} ms - 지연 시간 (ms)
 * @returns {Promise} 지연 Promise
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// 🗂️ 데이터 처리
// =============================================================================

/**
 * 깊은 복사
 * @param {any} obj - 복사할 객체
 * @returns {any} 복사된 객체
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * 객체 키를 camelCase로 변환
 * @param {Object} obj - 변환할 객체
 * @returns {Object} 변환된 객체
 */
function camelizeKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const camelized = {};
  Object.keys(obj).forEach(key => {
    const camelKey = toCamelCase(key);
    camelized[camelKey] = typeof obj[key] === 'object' ? camelizeKeys(obj[key]) : obj[key];
  });
  
  return camelized;
}

// =============================================================================
// 📱 반응형 & 브라우저 감지
// =============================================================================

/**
 * 모바일 디바이스 감지
 * @returns {boolean} 모바일 여부
 */
function isMobile() {
  return window.innerWidth <= 767;
}

/**
 * 태블릿 디바이스 감지
 * @returns {boolean} 태블릿 여부
 */
function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth <= 1199;
}

/**
 * 데스크톱 디바이스 감지
 * @returns {boolean} 데스크톱 여부
 */
function isDesktop() {
  return window.innerWidth >= 1200;
}

/**
 * 브라우저 지원 여부 확인
 * @param {string} feature - 확인할 기능
 * @returns {boolean} 지원 여부
 */
function isSupported(feature) {
  switch (feature) {
    case 'localStorage':
      return typeof(Storage) !== 'undefined';
    case 'fileReader':
      return window.File && window.FileReader && window.FileList && window.Blob;
    case 'download':
      return 'download' in document.createElement('a');
    default:
      return false;
  }
}

// =============================================================================
// 🎯 이벤트 처리
// =============================================================================

/**
 * 커스텀 이벤트 발생
 * @param {string} eventName - 이벤트명
 * @param {any} detail - 이벤트 데이터
 * @param {HTMLElement} target - 대상 요소 (기본: document)
 */
function dispatchCustomEvent(eventName, detail = null, target = document) {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true
  });
  target.dispatchEvent(event);
}

// =============================================================================
// 📤 내보내기
// =============================================================================

// 전역 객체에 헬퍼 함수들 등록
window.InvestmentHelpers = {
  // 포맷팅
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  getCurrentDate,
  
  // 문자열 처리
  toCamelCase,
  toKebabCase,
  replaceTemplate,
  
  // 유효성 검증
  isValidEmail,
  isValidKoreanPhone,
  isValidBusinessNumber,
  isEmpty,
  
  // DOM 조작
  createElement,
  toggleClass,
  
  // 비동기 처리
  debounce,
  throttle,
  delay,
  
  // 데이터 처리
  deepClone,
  camelizeKeys,
  
  // 디바이스 감지
  isMobile,
  isTablet,
  isDesktop,
  isSupported,
  
  // 이벤트 처리
  dispatchCustomEvent
}; 