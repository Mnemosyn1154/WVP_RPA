# 📄 템플릿 파일 폴더

이 폴더에는 투자문서 생성에 필요한 Word 템플릿 파일들이 저장됩니다.

## ✅ 업로드된 템플릿 파일

다음 2개의 `.docx` 템플릿 파일이 준비되어 있습니다:

### 1. TermSheet_Template.docx
- **파일명**: `TermSheet_Template.docx`
- **용도**: VC Term Sheet 생성용 템플릿
- **설명**: 투자 조건을 요약한 Term Sheet 문서 템플릿
- **파일 크기**: 21KB
- **상태**: ✅ 업로드 완료

### 2. 예비투심위_Template.docx  
- **파일명**: `예비투심위_Template.docx`
- **용도**: 예비투자심의위원회 보고서 생성용 템플릿
- **설명**: 예비투심위 심의를 위한 상세 보고서 템플릿
- **파일 크기**: 323KB
- **상태**: ✅ 업로드 완료

## 🔧 템플릿 변수 사용법

⚡ **새로운 기능**: 이제 실제 변수 치환이 가능합니다!
- docxtemplater 라이브러리 기반으로 구현
- 대괄호 형식 `[변수명]` 지원
- 실시간 데이터 치환 및 파일 생성

### 📊 사용 가능한 변수 목록

#### 회사 기본 정보
- `[투자대상]` 또는 `[회사명]` - 투자대상 회사명
- `[대표자]` 또는 `[대표자명]` - 대표자 성명  
- `[회사주소]` 또는 `[주소]` - 회사 주소
- `[Series]` 또는 `[투자라운드]` - 투자 라운드
- `[사용용도]` 또는 `[투자목적]` - 투자금 사용 용도

#### 투자 조건
- `[투자금액]` - 투자 금액
- `[투자재원]` - 투자 재원
- `[투자방식]` - 투자 방식
- `[투자단가]` 또는 `[주당가격]` - 주당 투자 단가
- `[액면가]` - 주식 액면가
- `[투자전가치]` 또는 `[Pre-money]` - 투자전 기업가치
- `[투자후가치]` 또는 `[Post-money]` - 투자후 기업가치
- `[동반투자자]` - 동반투자자

#### 재무 정보
- `[인수주식수]` - 인수할 주식 수 (자동 계산)
- `[지분율]` - 투자자 지분율 (자동 계산)
- `[상환이자]` - 상환 이자율
- `[잔여분배이자]` - 잔여분배 이자율
- `[주매청이자]` - 주매수청구권 이자율

#### 운영 정보
- `[배당률]` - 배당률
- `[위약벌]` - 위약벌 비율
- `[담당자투자총괄]` 또는 `[담당자]` 또는 `[투자총괄]` - 담당자/투자총괄

#### 자동 생성 변수
- `[오늘날짜]` 또는 `[작성일]` - 현재 날짜
- `[계약일]` - 현재 날짜
- `[생성일자]` - 현재 날짜
- `[생성시간]` - 현재 날짜 및 시간

#### 🆕 자동 계산 변수
- `[총발행주식수]` - 투자후가치 ÷ 투자단가 (자동 계산)
- `[기존주주지분율]` - 100% - 투자자지분율 (자동 계산)
- `[프리미엄]` - 투자단가 - 액면가 (자동 계산)

## 💡 템플릿 작성 팁

1. **변수 형식**: 반드시 대괄호 `[변수명]` 형식으로 작성하세요
2. **서식 유지**: 변수 주변의 서식(폰트, 색상 등)은 그대로 유지됩니다
3. **표 형태**: 표 안에도 변수 사용 가능합니다
4. **별칭 지원**: 하나의 데이터에 여러 변수명 사용 가능 (예: `[투자대상]`, `[회사명]`)
5. **자동 계산**: 일부 변수는 다른 값들을 기반으로 자동 계산됩니다
6. **누락 처리**: 입력되지 않은 변수는 자동으로 "-"로 표시됩니다

## 🔄 변수 치환 과정

1. **입력 데이터 수집**: 웹 폼에서 21개 변수 입력
2. **데이터 전처리**: 숫자 포맷팅, 별칭 처리, 자동 계산
3. **템플릿 로드**: docx 파일을 메모리로 로드
4. **변수 치환**: `[변수명]` → 실제 데이터로 치환
5. **파일 생성**: 새로운 docx 파일 생성 및 다운로드

## 🚀 문서 생성 과정

템플릿 파일 준비 완료 후:
1. 웹 애플리케이션(http://localhost:8080)에서 폼을 작성합니다
2. 21개 변수 값을 입력합니다
3. "문서 생성" 버튼을 클릭합니다  
4. 🎉 **실제 변수가 치환된 최종 문서**가 자동 생성되어 다운로드됩니다!

## 📁 생성되는 파일명

- **Term Sheet**: `Term Sheet_{회사명}_{날짜}.docx`
- **예비투심위**: `예비투심위 보고서_{회사명}_{날짜}.docx`

## 🐛 문제 해결

### 변수가 치환되지 않는 경우
1. 변수명이 대괄호 `[변수명]` 형식인지 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. 모든 필수 필드가 입력되었는지 확인

### 파일이 생성되지 않는 경우
1. 브라우저가 팝업을 차단하지 않았는지 확인
2. 템플릿 파일이 올바른 위치에 있는지 확인
3. 네트워크 연결 상태 확인

---

**✅ 실제 변수 치환 시스템 완성**: docxtemplater 기반으로 실제 워드 파일 변수 치환이 가능합니다! 🎉 