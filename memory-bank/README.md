# Memory Bank 작업 관리 시스템

투자문서 생성기 프로젝트의 자체 작업 관리 시스템입니다.

## 📋 시스템 개요

이 memory-bank는 vooster 대신 사용하는 자체 작업 관리 시스템으로, 다음과 같은 구조로 되어 있습니다:

```
memory-bank/
├── README.md              # 시스템 개요 (현재 파일)
├── project-overview.md    # 프로젝트 전체 개요
├── tasks/                 # 작업 관리
│   ├── task-list.md      # 전체 작업 목록
│   ├── current-task.md   # 현재 진행 중인 작업
│   ├── completed/        # 완료된 작업들
│   └── pending/          # 대기 중인 작업들
├── progress/             # 진행 상황 추적
│   ├── daily-log.md     # 일일 진행 상황
│   └── milestones.md    # 마일스톤 추적
└── docs/                # 관련 문서들
    ├── architecture.md   # 시스템 아키텍처
    ├── technical.md     # 기술 문서
    └── decisions.md     # 주요 결정사항
```

## 🚀 사용법

### 1. 작업 추가
- `tasks/task-list.md`에 새로운 작업 추가
- Task ID와 함께 상세 정보 기록

### 2. 작업 진행
- `tasks/current-task.md`에 현재 작업 상태 업데이트
- `progress/daily-log.md`에 일일 진행사항 기록

### 3. 작업 완료
- 완료된 작업을 `tasks/completed/`로 이동
- 진행 상황 업데이트

## 📝 주요 규칙

1. **저장 요청 시**: "이 내용들 저장해줘"라고 하면 memory-bank에 작업내용 반영하고 github에 커밋&푸시
2. **대화 시작 전**: memory-bank의 task 내용들을 먼저 살펴보고 시작
3. **진행사항 기록**: 모든 중요한 결정과 진행사항을 문서화

## 📅 프로젝트 일정

- **Week 1**: 기반 인프라 구축
- **Week 2**: 입력 시스템 구현  
- **Week 3**: 템플릿 처리 엔진
- **Week 4**: 데이터 관리 및 최적화
- **Week 5**: 테스트 및 배포

---
*마지막 업데이트: 2025.01.23* 