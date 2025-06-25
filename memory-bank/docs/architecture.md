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

## 🚀 향후 확장 계획 (Future Roadmap)
*작성일: 2025.06.25*

### 📋 확장 목표
사용자 요청에 따른 시스템 확장 방향:
1. **새로운 문서 유형**: 준법감시보고서, 계약서 초안, 투자 조건 요약서 등
2. **다중 투자건 관리**: 여러 투자건을 DB화하여 관리
3. **대시보드**: 투자건들을 한눈에 볼 수 있는 통합 관리 화면

### 🏗️ 현재 시스템 분석 (2025.06.25 기준)

#### ✅ 강점
- **모듈화된 아키텍처**: 새로운 기능 추가 용이
- **클라이언트 사이드 전용**: 서버리스로 비용 효율성 확보
- **템플릿 기반 시스템**: 새 문서 유형 추가 간단
- **JSON 설정 기반**: 동적 폼 생성으로 확장성 확보
- **Excel 연동**: 데이터 교환 기반 완성

#### ⚠️ 확장을 위한 제약사항
- **로컬 데이터만 지원**: 다중 투자건 관리 한계
- **단일 세션**: 협업 기능 부재
- **검색/필터링 부재**: 대량 데이터 관리 어려움
- **버전 관리 없음**: 문서 이력 추적 불가

### 🎯 단계별 확장 전략

#### Phase 1: 즉시 적용 가능한 개선 (1-2주)
```javascript
// 새로운 문서 유형 추가 예시
const NEW_DOCUMENT_TYPES = {
  "compliance_report": {
    name: "준법감시보고서",
    template: "ComplianceReport_Template.docx",
    requiredFields: ["회사명", "투자금액", "위험등급", "준법검토결과"],
    validation: "compliance_validation"
  },
  "contract_draft": {
    name: "계약서 초안",
    template: "ContractDraft_Template.docx", 
    requiredFields: ["회사명", "투자방식", "투자금액", "계약조건"],
    validation: "contract_validation"
  }
};
```

**구현 방법**:
1. **템플릿 시스템 확장**: templates.json에 새 문서 유형 추가
2. **데이터 모델 표준화**: InvestmentDeal 클래스 도입
3. **상태 관리 개선**: 현재 데이터 구조화

#### Phase 2: 중장기 아키텍처 변경 (1-3개월)

##### 🗄️ 데이터베이스 설계
```sql
-- 투자건 관리 테이블
CREATE TABLE investment_deals (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  deal_stage VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  data JSONB -- 동적 필드 저장
);

-- 템플릿 관리 테이블  
CREATE TABLE document_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  template_file BYTEA,
  field_mapping JSONB,
  validation_rules JSONB
);

-- 생성된 문서 이력
CREATE TABLE generated_documents (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES investment_deals(id),
  template_id INTEGER REFERENCES document_templates(id),
  file_path VARCHAR(500),
  generated_at TIMESTAMP DEFAULT NOW()
);
```

##### 🔧 백엔드 API 설계
```javascript
// REST API 엔드포인트 설계
const API_ENDPOINTS = {
  // 투자건 관리
  "GET /api/deals": "투자건 목록 조회",
  "POST /api/deals": "새 투자건 생성", 
  "PUT /api/deals/:id": "투자건 정보 수정",
  "DELETE /api/deals/:id": "투자건 삭제",
  
  // 문서 생성
  "POST /api/deals/:id/documents": "문서 생성",
  "GET /api/deals/:id/documents": "생성된 문서 목록",
  
  // 템플릿 관리
  "GET /api/templates": "템플릿 목록",
  "POST /api/templates": "새 템플릿 업로드",
  
  // 대시보드
  "GET /api/dashboard/stats": "통계 데이터",
  "GET /api/dashboard/recent": "최근 활동"
};
```

##### 🎨 프론트엔드 아키텍처 변경
```javascript
// React/Vue 기반 컴포넌트 구조
const COMPONENT_STRUCTURE = {
  "App": {
    "Router": "페이지 라우팅",
    "Layout": {
      "Header": "네비게이션",
      "Sidebar": "메뉴",
      "MainContent": {
        "Dashboard": "대시보드 페이지",
        "DealList": "투자건 목록",
        "DealForm": "투자건 편집",
        "DocumentGenerator": "문서 생성",
        "TemplateManager": "템플릿 관리"
      }
    }
  }
};

// 상태 관리 (Redux/Vuex)
const STATE_STRUCTURE = {
  "deals": "투자건 데이터",
  "templates": "템플릿 목록", 
  "documents": "생성된 문서",
  "ui": "UI 상태",
  "auth": "사용자 인증"
};
```

### 🎯 대시보드 설계

#### 📊 주요 기능
```javascript
const DASHBOARD_FEATURES = {
  "overview": {
    "total_deals": "총 투자건 수",
    "active_deals": "진행 중인 투자건",
    "documents_generated": "생성된 문서 수",
    "recent_activity": "최근 활동"
  },
  "deal_list": {
    "search": "회사명/단계별 검색",
    "filter": "투자단계/금액/날짜 필터",
    "sort": "다중 정렬 기능",
    "bulk_actions": "일괄 작업"
  },
  "analytics": {
    "deal_pipeline": "투자 파이프라인",
    "document_usage": "문서 유형별 사용률",
    "time_trends": "시간대별 트렌드"
  }
};
```

#### 🎨 UI/UX 설계
```css
/* 대시보드 레이아웃 */
.dashboard-layout {
  display: grid;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
}

.sidebar {
  /* 메뉴 네비게이션 */
}

.main-content {
  /* 카드 기반 대시보드 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```

### 📈 마이그레이션 전략

#### Step 1: React/Vue 마이그레이션 (1-2주)
- 현재 Vanilla JS를 React/Vue로 점진적 변환
- 컴포넌트 단위로 순차 마이그레이션
- 기존 기능 유지하면서 새 구조 적용

#### Step 2: 백엔드 API 구축 (2-3주)
- Node.js/Express 또는 Python/FastAPI 선택
- PostgreSQL 데이터베이스 설계 및 구축
- 기존 LocalStorage 데이터 마이그레이션 도구

#### Step 3: 다중 투자건 관리 (2주)
- 투자건 CRUD 기능 구현
- 검색/필터링/정렬 기능
- 데이터 백업/복원 시스템

#### Step 4: 다중 문서 유형 지원 (1-2주)
- 새로운 템플릿 추가 (준법감시보고서, 계약서 등)
- 템플릿 관리 시스템 구축
- 동적 필드 매핑 시스템

### 🔧 기술 스택 권장사항

#### 프론트엔드
```javascript
const FRONTEND_STACK = {
  "framework": "React 18 또는 Vue 3",
  "state_management": "Redux Toolkit 또는 Pinia",
  "ui_library": "Material-UI 또는 Ant Design",
  "build_tool": "Vite",
  "testing": "Jest + React Testing Library"
};
```

#### 백엔드
```javascript
const BACKEND_STACK = {
  "runtime": "Node.js 18+ 또는 Python 3.11+",
  "framework": "Express.js 또는 FastAPI", 
  "database": "PostgreSQL 15+",
  "orm": "Prisma 또는 SQLAlchemy",
  "auth": "JWT + Passport.js",
  "file_storage": "AWS S3 또는 Google Cloud Storage"
};
```

### 📊 예상 개발 일정

| Phase | 기간 | 주요 작업 | 예상 공수 |
|-------|------|-----------|-----------|
| Phase 1 | 1-2주 | 즉시 개선사항 | 40-60시간 |
| Phase 2 | 2-3주 | 백엔드 구축 | 80-120시간 |
| Phase 3 | 2주 | 다중 투자건 관리 | 60-80시간 |
| Phase 4 | 1-2주 | 다중 문서 유형 | 40-60시간 |
| **총합** | **6-8주** | **전체 시스템** | **220-320시간** |

### 🎯 성공 지표

#### 기능적 지표
- **지원 문서 유형**: 2개 → 5개 이상
- **동시 관리 투자건**: 1개 → 100개 이상
- **문서 생성 속도**: 10분 → 5분 이하
- **사용자 학습 시간**: 30분 → 15분 이하

#### 기술적 지표
- **시스템 확장성**: 단일 → 멀티 테넌트
- **데이터 용량**: 로컬 → 클라우드 무제한
- **동시 사용자**: 1명 → 50명 이상
- **가용성**: 로컬 → 99.9% 업타임

---
*확장 계획 수립일: 2025.06.25*  
*다음 검토일: 2025.07.01*