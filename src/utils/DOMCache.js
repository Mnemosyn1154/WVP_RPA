/**
 * DOM 캐시 유틸리티 - 성능 최적화를 위한 DOM 요소 캐싱
 * @version 1.0
 * @since 2025-01-26
 */

window.DOMCache = (() => {
  // DOM 요소 캐시 저장소
  const cache = new Map();
  
  // 쿼리 결과 캐시 (짧은 시간 동안만 유효)
  const queryCache = new Map();
  const QUERY_CACHE_TTL = 1000; // 1초
  
  /**
   * ID로 요소를 가져오기 (캐싱됨)
   * @param {string} id - 요소 ID
   * @returns {HTMLElement|null}
   */
  function getElementById(id) {
    const cacheKey = `#${id}`;
    
    if (cache.has(cacheKey)) {
      const element = cache.get(cacheKey);
      // 요소가 여전히 DOM에 있는지 확인
      if (document.contains(element)) {
        return element;
      } else {
        cache.delete(cacheKey);
      }
    }
    
    const element = document.getElementById(id);
    if (element) {
      cache.set(cacheKey, element);
    }
    
    return element;
  }
  
  /**
   * 클래스명으로 요소들을 가져오기 (캐싱됨)
   * @param {string} className - 클래스 이름
   * @param {HTMLElement} container - 검색 범위 (선택사항)
   * @returns {HTMLElement[]}
   */
  function getElementsByClassName(className, container = document) {
    const cacheKey = `.${className}@${container.id || 'document'}`;
    const cached = getQueryCache(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const elements = Array.from(container.getElementsByClassName(className));
    setQueryCache(cacheKey, elements);
    
    return elements;
  }
  
  /**
   * 셀렉터로 요소 가져오기 (캐싱됨)
   * @param {string} selector - CSS 셀렉터
   * @param {HTMLElement} container - 검색 범위 (선택사항)
   * @returns {HTMLElement|null}
   */
  function querySelector(selector, container = document) {
    const cacheKey = `qs:${selector}@${container.id || 'document'}`;
    const cached = getQueryCache(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const element = container.querySelector(selector);
    if (element) {
      setQueryCache(cacheKey, element);
    }
    
    return element;
  }
  
  /**
   * 셀렉터로 모든 요소 가져오기 (캐싱됨)
   * @param {string} selector - CSS 셀렉터
   * @param {HTMLElement} container - 검색 범위 (선택사항)
   * @returns {NodeList}
   */
  function querySelectorAll(selector, container = document) {
    const cacheKey = `qsa:${selector}@${container.id || 'document'}`;
    const cached = getQueryCache(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const elements = Array.from(container.querySelectorAll(selector));
    setQueryCache(cacheKey, elements);
    
    return elements;
  }
  
  /**
   * 쿼리 캐시에서 값 가져오기
   * @param {string} key - 캐시 키
   * @returns {any|null}
   */
  function getQueryCache(key) {
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < QUERY_CACHE_TTL) {
      return cached.value;
    }
    queryCache.delete(key);
    return null;
  }
  
  /**
   * 쿼리 캐시에 값 설정
   * @param {string} key - 캐시 키
   * @param {any} value - 캐시할 값
   */
  function setQueryCache(key, value) {
    queryCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * 특정 컨테이너의 캐시 무효화
   * @param {HTMLElement|string} containerOrId - 컨테이너 요소 또는 ID
   */
  function invalidateContainer(containerOrId) {
    const containerId = typeof containerOrId === 'string' 
      ? containerOrId 
      : containerOrId.id;
    
    // 해당 컨테이너와 관련된 캐시 항목 제거
    for (const [key] of cache) {
      if (key.includes(containerId)) {
        cache.delete(key);
      }
    }
    
    // 쿼리 캐시도 정리
    for (const [key] of queryCache) {
      if (key.includes(containerId)) {
        queryCache.delete(key);
      }
    }
  }
  
  /**
   * 전체 캐시 초기화
   */
  function clear() {
    cache.clear();
    queryCache.clear();
  }
  
  /**
   * 캐시 상태 확인
   * @returns {Object}
   */
  function getStats() {
    return {
      cacheSize: cache.size,
      queryCacheSize: queryCache.size,
      totalSize: cache.size + queryCache.size
    };
  }
  
  /**
   * 자주 사용하는 요소들 미리 캐싱
   */
  function warmUp() {
    const commonIds = [
      'formContainer',
      'actionBar',
      'loadingSpinner',
      'toastContainer',
      'modalContainer',
      'autoSaveStatus'
    ];
    
    commonIds.forEach(id => getElementById(id));
    
    console.log('🔥 DOM 캐시 워밍업 완료:', getStats());
  }
  
  // Public API
  return {
    getElementById,
    getElementsByClassName,
    querySelector,
    querySelectorAll,
    invalidateContainer,
    clear,
    getStats,
    warmUp
  };
})();