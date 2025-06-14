# 💼 투자문서 생성기 (Investment Document Generator)

> VC 투자 업무 자동화를 위한 Term Sheet 및 예비투심위 문서 생성 웹 애플리케이션

## 📋 프로젝트 개요

이 프로젝트는 VC(벤처캐피탈) 투자 업무의 효율성을 높이기 위해 개발된 문서 자동 생성 도구입니다. 21개의 핵심 투자 변수를 입력하면 Term Sheet와 예비투자심의위원회 보고서를 자동으로 생성합니다.

### 🎯 목표
- **시간 절약**: 기존 60분 → 6분 (90% 시간 단축)
- **정확성 향상**: 수동 계산 오류 제거
- **표준화**: 일관된 문서 형식 유지
- **효율성**: 반복 작업 자동화

## ✨ 주요 기능

### 📄 문서 생성
- **Term Sheet**: VC 투자 조건 요약서
- **예비투심위 보고서**: 투자심의위원회용 상세 보고서

### 🧮 자동 계산
- 인수주식수 = 투자금액 ÷ 투자단가
- 지분율 = (투자금액 ÷ 투자후가치) × 100
- 투자후가치 = 투자전가치 + 투자금액

### 💾 데이터 관리
- 로컬스토리지 자동 저장
- 임시저장 및 불러오기
- 데이터 검증 및 오류 방지

### 📱 반응형 디자인
- 모바일 (767px 이하)
- 태블릿 (768px-1199px)
- 데스크톱 (1200px 이상)

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 변수 시스템, 그리드 레이아웃
- **Vanilla JavaScript**: 모듈화된 컴포넌트 아키텍처

### 문서 처리
- **docxtemplater**: Word 템플릿 처리
- **pizzip**: 파일 압축/해제

### 개발 도구
- **npm scripts**: 개발 서버 및 빌드
- **git**: 버전 관리

## 📁 프로젝트 구조

```
investment-doc-generator/
├── 📄 index.html                    # 메인 페이지
├── 📄 package.json                  # 프로젝트 설정
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
│   │   ├── README.md               # 템플릿 업로드 가이드
│   │   ├── termsheet.docx          # Term Sheet 템플릿 (업로드 필요)
│   │   └── preliminary.docx        # 예비투심위 템플릿 (업로드 필요)
│   ├── 📁 assets/                   # 정적 자원
│   │   └── styles/                 # CSS 파일들
│   └── 📄 app.js                    # 메인 애플리케이션
├── 📁 tests/                        # 테스트 파일
├── 📁 docs/                         # 문서
└── 📁 memory-bank/                  # 프로젝트 관리
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/Mnemosyn1154/WVP_RPA.git
cd WVP_RPA
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 템플릿 파일 업로드
`src/templates/` 폴더에 다음 파일들을 업로드하세요:
- `termsheet.docx` - Term Sheet 템플릿
- `preliminary.docx` - 예비투심위 보고서 템플릿

자세한 내용은 [템플릿 가이드](src/templates/README.md)를 참조하세요.

### 4. 개발 서버 실행
```bash
npm run dev
# 또는
npm start
```

브라우저에서 `http://localhost:8000`으로 접속하세요.

## 📊 입력 변수 (21개)

### 🏢 회사 기본 정보 (5개)
- 투자대상, 대표자, 주소, Series, 사용용도

### 💰 투자 조건 (8개)
- 투자금액, 투자재원, 투자방식, 투자단가, 액면가, 투자전가치, 투자후가치, 동반투자자

### 📊 재무 정보 (5개)
- 인수주식수, 지분율, 상환이자, 잔여분배이자, 주매청이자

### ⚙️ 운영 정보 (3개)
- 배당률, 위약벌, 담당자투자총괄

## 🎨 사용법

1. **폼 작성**: 21개 필수 항목 입력
2. **자동 계산**: 연관 항목 자동 계산
3. **유효성 검증**: 실시간 입력 검증
4. **문서 생성**: Term Sheet 또는 예비투심위 보고서 생성
5. **다운로드**: 생성된 문서 자동 다운로드

## 📱 브라우저 지원

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔒 보안 및 개인정보

- **완전 클라이언트 사이드**: 서버 전송 없음
- **로컬 데이터**: 브라우저 내 LocalStorage 저장
- **개인정보 보호**: 외부 전송 차단

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/Mnemosyn1154/WVP_RPA/issues)

---

<div align="center">
Made with ❤️ for VC 업무 효율화
</div> 