#!/bin/bash

# WVP 투자문서 생성기 - Docker 실행 스크립트

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 WVP 투자문서 생성기 Docker 실행${NC}"

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되지 않았습니다.${NC}"
    echo "Docker를 설치한 후 다시 실행해주세요."
    exit 1
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker Compose를 사용할 수 없습니다. Docker만 사용합니다.${NC}"
    USE_COMPOSE=false
else
    USE_COMPOSE=true
fi

# 기존 컨테이너 정리
echo -e "${BLUE}🧹 기존 컨테이너 정리...${NC}"
docker stop wvp-investment-app 2>/dev/null || true
docker rm wvp-investment-app 2>/dev/null || true

if [ "$USE_COMPOSE" = true ]; then
    # Docker Compose 사용
    echo -e "${BLUE}🚀 Docker Compose로 실행...${NC}"
    docker-compose up -d --build
else
    # Docker만 사용
    echo -e "${BLUE}🔨 Docker 이미지 빌드...${NC}"
    docker build -t wvp-investment-generator:latest .
    
    echo -e "${BLUE}🚀 Docker 컨테이너 실행...${NC}"
    docker run -d \
        --name wvp-investment-app \
        -p 8080:80 \
        --restart unless-stopped \
        wvp-investment-generator:latest
fi

# 실행 확인
sleep 5
if docker ps | grep -q wvp-investment-app; then
    echo -e "${GREEN}✅ 성공적으로 실행되었습니다!${NC}"
    echo -e "${BLUE}📱 접속 URL: http://localhost:8080${NC}"
    echo -e "${YELLOW}📊 상태 확인: docker ps${NC}"
    echo -e "${YELLOW}📋 로그 확인: docker logs wvp-investment-app${NC}"
    echo -e "${YELLOW}🛑 중지: docker stop wvp-investment-app${NC}"
else
    echo -e "${RED}❌ 실행에 실패했습니다.${NC}"
    echo -e "${YELLOW}로그를 확인해주세요: docker logs wvp-investment-app${NC}"
fi 