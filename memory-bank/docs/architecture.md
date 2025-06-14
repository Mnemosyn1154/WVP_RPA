# 투자문서 생성기 시스템 아키텍처

## 🏗️ 전체 아키텍처 개요

투자문서 생성기는 **클라이언트 사이드 전용 웹 애플리케이션**으로 설계되어, 서버 없이도 완전한 문서 생성 기능을 제공합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    브라우저 환경                               │
├─────────────────────────────────────────────────────────────┤
│  📱 Presentation Layer (UI/UX)                            │
│  ├─ HTML5 (시맨틱 마크업)                                    │
│  ├─ CSS3 (반응형 디자인)                                     │
│  └─ JavaScript (상호작용)                                   │
├─────────────────────────────────────────────────────────────┤
│  🔧 Business Logic Layer                                   │
│  ├─ FormGenerator (동적 폼 생성)                             │
│  ├─ DataValidator (유효성 검증)                              │
│  ├─ CalculationEngine (자동 계산)                           │
│  └─ TemplateProcessor (문서 생성)                           │
├─────────────────────────────────────────────────────────────┤
│  💾 Data Layer                                             │
│  ├─ LocalStorage (사용자 데이터)                             │
│  ├─ ConfigManager (설정 관리)                               │
│  └─ TemplateStorage (템플릿 저장)                           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 프로젝트 구조

```
investment-doc-generator/
├── 📄 index.html                    # 메인 페이지
├── 📁 src/
│   ├── 📁 components/               # UI 컴포넌트
│   │   ├── FormField.js            # 폼 필드 컴포넌트
│   │   ├── FormSection.js          # 폼 섹션 그룹
│   │   ├── Button.js               # 버튼 컴포넌트
│   │   ├── Modal.js                # 모달 창
│   │   └── Toast.js                # 알림 메시지
│   ├── 📁 config/                   # 설정 파일
│   │   ├── variables.json          # 변수 정의
│   │   ├── templates.json          # 템플릿 매핑
│   │   └── validation.json         # 검증 규칙
│   ├── 📁 core/                     # 핵심 로직
│   │   ├── FormGenerator.js        # 동적 폼 생성
│   │   ├── DataValidator.js        # 데이터 검증
│   │   ├── CalculationEngine.js    # 계산 엔진
│   │   └── TemplateProcessor.js    # 문서 처리
│   ├── 📁 utils/                    # 유틸리티
│   │   ├── storage.js              # 로컬스토리지 관리
│   │   ├── fileUtils.js            # 파일 처리
│   │   └── helpers.js              # 헬퍼 함수
│   ├── 📁 templates/                # 템플릿 파일
│   │   ├── termsheet.docx          # Term Sheet 템플릿
│   │   └── preliminary.docx        # 예비투심위 템플릿
│   └── 📁 assets/                   # 정적 자원
│       ├── styles/                 # CSS 파일
│       └── fonts/                  # 폰트 파일
├── 📁 tests/                        # 테스트 파일
└── 📁 docs/                         # 문서
```

## 🔧 핵심 컴포넌트 설계

### 1. FormGenerator (동적 폼 생성기)
```javascript
class FormGenerator {
  constructor(config) {
    this.config = config;
    this.fields = new Map();
  }
  
  // 설정 기반 폼 생성
  generateForm(containerId) { }
  
  // 필드별 렌더링
  renderField(fieldConfig) { }
  
  // 섹션별 그룹핑
  renderSection(sectionConfig) { }
}
```

**주요 기능**:
- JSON 설정 기반 동적 폼 생성
- 필드 타입별 렌더링 (text, number, select, etc.)
- 조건부 필드 표시/숨김
- 반응형 레이아웃 자동 적용

### 2. DataValidator (유효성 검증기)
```javascript
class DataValidator {
  constructor(rules) {
    this.rules = rules;
    this.errorMessages = new Map();
  }
  
  // 실시간 필드 검증
  validateField(fieldName, value) { }
  
  // 전체 폼 검증
  validateForm(formData) { }
  
  // 에러 메시지 관리
  showError(fieldName, message) { }
}
```

**검증 규칙**:
- 필수 필드 체크
- 데이터 타입 검증
- 범위 및 길이 제한
- 정규식 패턴 매칭
- 커스텀 검증 함수

### 3. CalculationEngine (자동 계산 엔진)
```javascript
class CalculationEngine {
  constructor() {
    this.calculations = new Map();
    this.dependencies = new Map();
  }
  
  // 계산 공식 등록
  registerFormula(fieldName, formula, dependencies) { }
  
  // 의존성 기반 자동 계산
  calculate(changedField, formData) { }
  
  // 순환 참조 감지
  detectCircularDependency() { }
}
```

**계산 예시**:
```javascript
// 인수주식수 = 투자금액 / 투자단가
registerFormula('인수주식수', 
  (data) => data.투자금액 / data.투자단가,
  ['투자금액', '투자단가']
);

// 지분율 = (투자금액 / 투자후가치) * 100
registerFormula('지분율',
  (data) => (data.투자금액 / data.투자후가치) * 100,
  ['투자금액', '투자후가치']
);
```

### 4. TemplateProcessor (문서 처리기)
```javascript
class TemplateProcessor {
  constructor(library) {
    this.library = library; // docxtemplater or docx-templates
    this.templates = new Map();
  }
  
  // 템플릿 로드
  loadTemplate(templateName) { }
  
  // 변수 치환
  replaceVariables(template, data) { }
  
  // 문서 생성
  generateDocument(templateName, data) { }
}
```

**지원 기능**:
- docx 템플릿 파일 처리
- 변수 매핑 및 치환
- 다중 문서 동시 생성
- 파일명 규칙 적용

## 🔄 데이터 플로우

```
1. 사용자 입력
   ↓
2. 실시간 검증 (DataValidator)
   ↓
3. 자동 계산 (CalculationEngine)
   ↓
4. 로컬 저장 (LocalStorage)
   ↓
5. 문서 생성 요청
   ↓
6. 템플릿 처리 (TemplateProcessor)
   ↓
7. 파일 다운로드
```

## 🎨 UI/UX 아키텍처

### 반응형 그리드 시스템
- **Desktop (1200px+)**: 3열 그리드
- **Tablet (768-1199px)**: 2열 그리드  
- **Mobile (767px-)**: 1열 스택

### 컴포넌트 계층구조
```
App
├── Header (로고, 제목)
├── FormContainer
│   ├── FormSection (회사정보)
│   ├── FormSection (투자조건)
│   ├── FormSection (재무정보)
│   └── FormSection (운영정보)
├── ActionBar (버튼들)
└── StatusBar (진행률, 메시지)
```

## 🔧 기술 스택 선택 근거

### Frontend
- **HTML5**: 표준 준수, 접근성 고려
- **CSS3**: 네이티브 기능 활용, 번들 크기 최소화
- **Vanilla JavaScript**: 외부 의존성 최소화, 성능 최적화

### 문서 처리
- **1순위**: docxtemplater (기능 풍부)
- **2순위**: docx-templates (MIT 라이센스)

### 데이터 저장
- **LocalStorage**: 서버리스, 개인정보 보호
- **JSON 포맷**: 가독성, 호환성

## 🚀 성능 최적화 전략

### 1. 번들 크기 최적화
- 템플릿 파일 Base64 인코딩
- Tree-shaking 적용
- 코드 분할 (필요시)

### 2. 메모리 관리
- 이벤트 리스너 정리
- DOM 참조 해제
- 대용량 파일 스트리밍 처리

### 3. 사용자 경험
- 레이지 로딩 적용
- 진행률 표시
- 오프라인 캐싱

## 🔒 보안 고려사항

### 클라이언트 사이드 보안
- XSS 방지 (입력 검증, 출력 인코딩)
- 로컬스토리지 데이터 암호화 (민감정보)
- 파일 업로드 검증

### 데이터 보호
- 서버 전송 없음 (완전 로컬 처리)
- 메모리 내 데이터 처리
- 브라우저 캐시 정책 적용

---
*작성일: 2025.06.14*  
*버전: v1.0* 