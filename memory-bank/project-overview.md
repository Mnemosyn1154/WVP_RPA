# 투자문서 생성기 프로젝트 개요

## 🎯 프로젝트 목적
VC(벤처캐피털) 투자 업무에서 반복적으로 작성되는 Term Sheet와 예비투심위 보고서를 자동화하여 업무 효율성을 극대화

## 📊 현재 상황 분석
- **현재 상황**: Term Sheet와 예비투심위 보고서를 100% 수작업으로 작성
- **문제점**: 반복 작업, 휴먼 에러, 시간 소요, 일관성 부족
- **개선 방향**: 웹 기반 자동화 시스템으로 업무 효율성 극대화

## 🎯 프로젝트 목표
- **주 목표**: 투자 문서 생성 시간 90% 단축 (60분 → 6분)
- **부 목표**: 문서 일관성 확보, 오타/누락 방지, 팀원 접근성 향상

## 🏗️ 핵심 기능
1. **데이터 입력 시스템**: 확장 가능한 투자 변수 입력 폼 (21개 변수)
2. **템플릿 관리 시스템**: 동적 템플릿 및 변수 관리
3. **문서 생성 및 다운로드**: 수정된 Word 문서 생성

## 📋 관리해야 할 변수 (21개)
### 회사 기본 정보 (5개)
- 투자대상, 대표자, 주소, Series, 사용용도

### 투자 조건 (8개)
- 투자금액, 투자재원, 투자방식, 투자단가, 액면가, 투자전가치, 투자후가치, 동반투자자

### 재무 정보 (5개)
- 인수주식수, 지분율, 상환이자, 잔여분배이자, 주매청이자

### 운영 정보 (3개)
- 배당률, 위약벌, 담당자/투자총괄

## 🔧 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **문서 처리**: docxtemplater 또는 docx-templates
- **저장 방식**: LocalStorage (서버리스)

## 📅 개발 일정 (5주)
- **Week 1**: 기반 인프라 구축 
- **Week 2**: 입력 시스템 구현
- **Week 3**: 템플릿 처리 엔진
- **Week 4**: 데이터 관리 및 최적화
- **Week 5**: 테스트 및 배포

## ✅ 성공 지표
- **시간 단축률**: 90% 이상 (60분 → 6분)
- **오류 감소율**: 95% 이상 (휴먼 에러 방지)
- **생성 성공률**: 99% 이상
- **팀원 만족도**: 4.5/5.0 이상

## 🎨 설계 원칙
- **확장성 우선**: 새로운 변수 추가가 용이한 구조
- **설정 기반**: 하드코딩 최소화, JSON 설정 파일 활용
- **유연한 검증**: 변수별 독립적인 유효성 검증 규칙

---
*작성일: 2025.06.14*  
*기반 문서: PRD.MD v1.0* 