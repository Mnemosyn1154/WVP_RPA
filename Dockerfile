# WVP 투자문서 생성기 - Docker 이미지
FROM nginx:alpine

# 메타데이터
LABEL maintainer="WVP Investment Document Generator"
LABEL version="1.0"
LABEL description="투자문서 자동 생성 시스템"

# 작업 디렉토리 설정
WORKDIR /usr/share/nginx/html

# 애플리케이션 파일 복사
COPY index.html .
COPY src/ ./src/
COPY package.json .
COPY README.md .

# nginx 설정 파일 복사 (SPA 라우팅 지원)
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# 컨테이너 실행 시 nginx 시작
CMD ["nginx", "-g", "daemon off;"] 