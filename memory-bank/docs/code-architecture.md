# 투자문서 생성기 - 코드 아키텍처 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [디렉토리 구조](#디렉토리-구조)
3. [핵심 모듈](#핵심-모듈)
4. [컴포넌트](#컴포넌트)
5. [유틸리티](#유틸리티)
6. [설정 파일](#설정-파일)
7. [이벤트 시스템](#이벤트-시스템)
8. [데이터 플로우](#데이터-플로우)
9. [최근 업데이트](#최근-업데이트)

---

## 🎯 프로젝트 개요

**투자문서 생성기**는 VC 투자 업무의 Term Sheet와 예비투심위 보고서를 자동 생성하는 웹 애플리케이션입니다.

### 주요 기능
- 21개 투자 변수 입력 폼 자동 생성
- 실시간 데이터 검증 (간소화된 기본 검증)
- 자동 계산 및 천 단위 구분자 지원
- 다중 화폐 지원 (KRW, USD, EUR, JPY, CNY)
- Term Sheet 및 예비투심위 문서 자동 생성
- 로컬 스토리지 기반 데이터 저장/복원

---

## 📁 디렉토리 구조

```
WVP_RPA/
├── index.html                 # 메인 HTML 파일
├── src/
│   ├── app.js                # 메인 애플리케이션 진입점
│   ├── assets/
│   │   └── styles/           # CSS 스타일 파일들
│   ├── components/           # UI 컴포넌트들
│   ├── core/                 # 핵심 비즈니스 로직
│   ├── config/               # 설정 파일들
│   └── utils/                # 유틸리티 함수들
└── docs/                     # 문서 파일들
```

---

## 🔧 핵심 모듈

### 1. **app.js** - 메인 애플리케이션
**역할**: 애플리케이션의 진입점이자 전체 라이프사이클 관리

#### 주요 클래스
```javascript
class InvestmentDocumentApp {
    constructor()           // 애플리케이션 초기화
    init()                 // 비동기 초기화 시작
    initializeApp()        // 메인 초기화 로직
    initializeModules()    // 핵심 모듈들 초기화
    initializeUI()         // UI 초기화
    initializeCurrencySelector() // 화폐 선택기 초기화
}
```

#### 주요 메서드
- `checkBrowserSupport()`: 브라우저 지원 여부 확인
- `loadConfiguration()`: 설정 파일 로드
- `attachEventListeners()`: 이벤트 리스너 등록
- `updateProgress()`: 진행률 업데이트
- `generateDocument()`: 문서 생성

### 2. **FormGenerator** - 폼 생성 엔진
**역할**: variables.json을 기반으로 동적 폼 생성

#### 주요 메서드
```javascript
class FormGenerator {
    constructor(variablesConfig, dataValidator, calculationEngine)
    init()                    // 초기화 및 폼 생성
    generateForm()           // 전체 폼 생성
    createSection()          // 섹션 생성
    createField()            // 개별 필드 생성
    waitForDOMAndComponents() // DOM 로딩 대기
}
```

#### 이벤트 훅
- `formDataChanged`: 폼 데이터 변경 시
- `calculationComplete`: 자동 계산 완료 시

### 3. **DataValidator** - 데이터 검증 엔진 (간소화됨)
**역할**: 기본적인 데이터 형식 검증

#### 주요 메서드
```javascript
class DataValidator {
    constructor(validationConfig)
    validateField()          // 개별 필드 기본 검증
    validateBasicFormat()    // 숫자 형식 검증만 수행
    validateAllFields()      // 전체 데이터 기본 검증
    isEmpty()               // 빈 값 확인
    parseNumber()           // 숫자 파싱
}
```

#### ✅ 2025.06.15 간소화
- **제거된 규칙**: 패턴 검증, 범위 제한, 비즈니스 로직
- **유지된 규칙**: 기본 숫자 형식 검증만

### 4. **CalculationEngine** - 자동 계산 엔진
**역할**: 투자 관련 자동 계산 처리

#### 계산 규칙
```javascript
calculationRules = {
    '투자후가치': (data) => 투자전가치 + 투자금액,
    '지분율': (data) => (투자금액 / 투자후가치) * 100,
    '인수주식수': (data) => Math.floor(투자금액 * multiplier / 투자단가)
}
```

#### 주요 메서드
- `calculate()`: 특정 필드 계산
- `calculateAll()`: 모든 계산 필드 업데이트
- `onCurrencyChanged()`: 화폐 변경 처리
- `formatCurrencyValue()`: 화폐 값 포맷팅

### 5. **CurrencyManager** - 화폐 관리 시스템
**역할**: 다중 화폐 지원 및 환율 변환

#### 주요 메서드
```javascript
class CurrencyManager {
    setCurrency(currencyCode)     // 화폐 변경
    getCurrentCurrency()          // 현재 화폐 정보
    formatValue(value)           // 값 포맷팅
    toBaseUnit(displayValue)     // 표시 단위 → 기본 단위
    toDisplayUnit(baseValue)     // 기본 단위 → 표시 단위
    convertCurrency()            // 환율 변환
    createCurrencySelector()     // 화폐 선택기 UI 생성
}
```

#### 이벤트
- `currencyChanged`: 화폐 변경 시 발생

### 6. **TemplateProcessor** - 템플릿 처리 엔진
**역할**: 문서 템플릿 처리 및 생성

#### 주요 메서드
- `processTemplate()`: 템플릿 변수 치환
- `generateDocument()`: 문서 생성
- `downloadDocument()`: 문서 다운로드

---

## 🎨 컴포넌트

### 1. **FormField** - 폼 필드 컴포넌트 (업데이트됨)
**역할**: 개별 입력 필드 생성 및 관리

#### 주요 메서드
```javascript
class FormField {
    create(config)              // 필드 생성
    createFieldElement()        // 필드 엘리먼트 생성
    createInput()              // 입력 요소 생성
    validateField()            // 간소화된 필드 검증
    onCurrencyChanged()        // 화폐 변경 처리
    updateCurrencyField()      // 화폐 필드 업데이트
    formatNumberInput()        // 숫자 입력 포맷팅
    handleNumberKeydown()      // 숫자 입력 키 처리
}
```

#### ✅ 2025.06.15 업데이트
- **천 단위 구분자**: 모든 숫자 필드에 콤마 포맷팅 적용
- **소수점 지원**: 0.1백만원 등 소수점 입력 지원
- **실시간 포맷팅**: 입력과 동시에 콤마 적용

### 2. **FormSection** - 폼 섹션 컴포넌트
**역할**: 폼 섹션 생성 및 관리

#### 주요 메서드
- `create()`: 섹션 생성
- `toggle()`: 섹션 접기/펼치기
- `addField()`: 필드 추가

### 3. **Modal** - 모달 컴포넌트
**역할**: 모달 다이얼로그 관리

### 4. **Toast** - 토스트 알림 컴포넌트
**역할**: 사용자 알림 메시지 표시

### 5. **Button** - 버튼 컴포넌트
**역할**: 버튼 상태 및 이벤트 관리

---

## 🛠 유틸리티

### 1. **StorageManager** (storage.js)
**역할**: 로컬 스토리지 관리

#### 주요 메서드
```javascript
class StorageManager {
    save(key, data)         // 데이터 저장
    load(key)              // 데이터 로드
    remove(key)            // 데이터 삭제
    clear()                // 전체 삭제
}
```

### 2. **InvestmentHelpers** (helpers.js)
**역할**: 공통 유틸리티 함수

#### 주요 함수
- `isSupported()`: 브라우저 기능 지원 확인
- `formatCurrency()`: 화폐 포맷팅
- `validateEmail()`: 이메일 검증
- `debounce()`: 디바운스 처리

### 3. **FileUtils** (fileUtils.js)
**역할**: 파일 처리 유틸리티

#### 주요 함수
- `downloadFile()`: 파일 다운로드
- `readFile()`: 파일 읽기
- `exportJSON()`: JSON 내보내기

---

## ⚙️ 설정 파일

### 1. **variables.json** (업데이트됨)
**역할**: 폼 필드 정의 및 설정

#### 구조
```json
{
  "version": "1.0",
  "sections": {
    "company_info": {
      "title": "회사 정보",
      "fields": {
        "투자대상": {
          "type": "text",
          "required": true,
          "currencyField": false
        },
        "투자금액": {
          "type": "number",
          "required": true,
          "currencyField": true
        }
      }
    }
  }
}
```

#### ✅ 2025.06.15 업데이트
- **모든 숫자 필드**: `currencyField: true` 속성 추가
- **천 단위 구분자**: 모든 숫자 필드에 콤마 포맷팅 적용

### 2. **validation.json** (대폭 간소화됨)
**역할**: 기본적인 데이터 검증 규칙

#### 구조
```json
{
  "version": "1.0",
  "rules": {
    "basic": {
      "number_format": {
        "message": "올바른 숫자 형식이 아닙니다"
      }
    }
  },
  "error_messages": {
    "required": "{field}는 필수 입력 항목입니다",
    "invalid_format": "{field}의 형식이 올바르지 않습니다"
  }
}
```

#### ✅ 2025.06.15 간소화
- **제거된 규칙**: 패턴 검증, 범위 제한, 비즈니스 로직
- **유지된 규칙**: 기본 숫자 형식 검증만

### 3. **templates.json**
**역할**: 문서 템플릿 정의

### 4. **currencies.json** (업데이트됨)
**역할**: 화폐 설정 및 환율 정보

#### 구조
```json
{
  "defaultCurrency": "KRW",
  "currencies": {
    "KRW": {
      "code": "KRW",
      "name": "한국 원",
      "unit": "백만원",
      "multiplier": 1000000
    }
  },
  "fieldRanges": {
    "investment_amount": { "min": 0, "max": 999999999 },
    "price_per_share": { "min": 0, "max": 1000000 },
    "par_value": { "min": 0, "max": 10000 },
    "share_count": { "min": 0, "max": 999999999 }
  }
}
```

---

## 🔄 이벤트 시스템

### 커스텀 이벤트
1. **`currencyChanged`**: 화폐 변경 시
   - 발생: CurrencyManager
   - 수신: FormField, CalculationEngine

2. **`formDataChanged`**: 폼 데이터 변경 시
   - 발생: FormField
   - 수신: InvestmentDocumentApp

3. **`calculationComplete`**: 자동 계산 완료 시
   - 발생: CalculationEngine
   - 수신: InvestmentDocumentApp

4. **`calculationRulesUpdated`**: 계산 규칙 업데이트 시
   - 발생: CalculationEngine
   - 수신: FormGenerator

### DOM 이벤트
- `input`: 필드 값 변경
- `change`: 선택 값 변경
- `focus/blur`: 포커스 이벤트
- `click`: 버튼 클릭

---

## 📊 데이터 플로우

### 1. 초기화 플로우
```
app.js → loadConfiguration() → initializeModules() → FormGenerator.init() → generateForm()
```

### 2. 사용자 입력 플로우 (간소화됨)
```
사용자 입력 → FormField.formatNumberInput() → DataValidator.validateBasicFormat() → 
CalculationEngine.calculate() → UI 업데이트
```

### 3. 화폐 변경 플로우
```
CurrencyManager.setCurrency() → currencyChanged 이벤트 → 
FormField.onCurrencyChanged() → CalculationEngine.onCurrencyChanged() → UI 업데이트
```

### 4. 문서 생성 플로우
```
사용자 클릭 → app.generateDocument() → TemplateProcessor.processTemplate() → 
파일 다운로드
```

---

## 🔧 주요 Hook 포인트

### 1. 폼 생성 시점
- `FormGenerator.init()`: 폼 생성 전 커스터마이징
- `createField()`: 개별 필드 생성 시 수정

### 2. 데이터 검증 시점 (간소화됨)
- `DataValidator.validateBasicFormat()`: 기본 형식 검증만
- `isEmpty()`: 빈 값 확인

### 3. 계산 시점
- `CalculationEngine.calculate()`: 커스텀 계산 로직 추가
- `calculationRules`: 새로운 계산 규칙 추가

### 4. 화폐 변경 시점
- `CurrencyManager.onCurrencyChanged()`: 화폐 변경 후 처리
- `updateCurrencyField()`: 필드별 화폐 업데이트 로직

---

## 🚨 주의사항

### 1. 초기화 순서
- CurrencyManager → DataValidator → CalculationEngine → FormGenerator 순서 유지
- DOM 로딩 완료 후 UI 초기화

### 2. 이벤트 리스너
- 메모리 누수 방지를 위한 이벤트 리스너 정리
- 중복 이벤트 등록 방지

### 3. 데이터 동기화
- 화폐 변경 시 모든 관련 컴포넌트 동기화 필요
- 계산 결과와 입력 값의 일관성 유지

### 4. 에러 처리
- 설정 파일 로드 실패 시 기본값 사용
- 계산 오류 시 사용자에게 명확한 메시지 표시

---

## 📝 수정 가이드라인

### 새로운 필드 추가
1. `variables.json`에 필드 정의 추가
2. 숫자 필드인 경우 `currencyField: true` 설정
3. 계산 필드인 경우 `CalculationEngine`에 규칙 추가

### 새로운 화폐 추가
1. `currencies.json`에 화폐 정보 추가
2. 필요시 환율 정보 업데이트

### 새로운 계산 로직 추가
1. `CalculationEngine.calculationRules`에 규칙 추가
2. 의존성 정보 `getDependencies()`에 추가

---

## 🆕 최근 업데이트

### 2025.06.15 - 유효성 검사 간소화 및 사용성 개선
#### ✅ 주요 변경사항
1. **유효성 검사 대폭 간소화**
   - 회사명 패턴 검증 제거 (특수문자 자유 사용)
   - 투자금액 범위 제한 제거
   - 모든 비즈니스 로직 검증 제거
   - 기본적인 숫자 형식 검증만 유지

2. **천 단위 구분자 전면 적용**
   - 모든 숫자 필드에 콤마 포맷팅 적용
   - 실시간 입력 포맷팅 지원
   - 소수점 입력 지원 (0.1백만원 등)

3. **국제 투자 지원 강화**
   - 해외 투자 시 다양한 화폐 단위 지원
   - 액면가 0.0001달러 등 소액 단위 지원

#### 🎯 개선 효과
- **유연성 증대**: 다양한 투자 케이스 대응 가능
- **사용성 향상**: 불필요한 제약 없이 자유로운 입력
- **성능 향상**: 복잡한 검증 로직 제거로 빠른 처리
- **유지보수성**: 간소화된 코드로 관리 용이

#### 📊 테스트 결과
- **투자금액 검증**: 100% 테스트 통과 (5/5)
- **콤마 포맷팅**: 모든 숫자 필드 정상 작동
- **소수점 지원**: 0.1~999,999백만원 범위 완벽 지원

---

*마지막 업데이트: 2025.06.15 - 유효성 검사 간소화 완료* 