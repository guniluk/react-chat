# React Chat - 풀스택 채팅 애플리케이션

이 프로젝트는 Node.js (Express) 백엔드와 Vite + React 프론트엔드로 구성된 실시간 채팅 애플리케이션입니다.

---

## 1. 기술 스택 (Tech Stack)

### 백엔드 (Backend)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB + Mongoose ODM (v9.6.3)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` 비밀번호 해시
- **Middleware**: `cookie-parser`, `cors`
- **실시간 통신**: `socket.io` (의존성 설치 완료, 연동 예정)
- **환경 변수**: `dotenv`

### 프론트엔드 (Frontend)
- **Build Tool**: Vite (v8.0.12)
- **Framework**: React (v19.2.6) & React-DOM (v19.2.6)
- **Styling**: Tailwind CSS v4.0.0 (`@tailwindcss/vite` 플러그인 연동)

---

## 2. 디렉토리 구조 (Directory Structure)

이 프로젝트는 백엔드가 루트 `package.json`을 관리하고, 프론트엔드는 하위 `frontend/` 폴더에서 패키지를 분리하여 관리하는 구조입니다.

```
react-chat/
 ├─ backend/             # 백엔드 소스 코드
 │   ├─ controllers/     # API 비즈니스 로직 (auth, message)
 │   ├─ db/              # 데이터베이스 연결 설정
 │   ├─ lib/             # JWT 생성 및 쿠키 설정 유틸
 │   ├─ middleware/      # protectRoute 미들웨어 (인증 보호)
 │   ├─ models/          # Mongoose 스키마 (User, Message, Conversation)
 │   ├─ routes/          # API 엔드포인트 라우팅 (auth, message)
 │   └─ server.js        # 백엔드 Entry Point (포트 설정, 미들웨어 바인딩, DB 연결)
 ├─ frontend/            # 프론트엔드 패키지
 │   ├─ public/          # 정적 리소스
 │   ├─ src/             # React 소스 코드
 │   │   ├─ App.jsx      # 메인 레이아웃 및 렌더링 컴포넌트
 │   │   ├─ index.css    # Tailwind CSS v4 가져오기
 │   │   └─ main.jsx     # 프론트엔드 Entry Point
 │   ├─ index.html       # Entry HTML 파일
 │   ├─ vite.config.js   # Vite 및 Tailwind v4 설정 파일
 │   └─ package.json     # 프론트엔드 의존성 및 스크립트 관리
 ├─ env                  # 로컬 환경 변수 템플릿 파일
 ├─ .env                 # 실제 사용되는 환경 변수 (사용자 생성 필요)
 ├─ package.json         # 백엔드 의존성 및 스크립트 관리 (루트 수준)
 └─ README.md            # 프로젝트 문서
```

---

## 3. 구현된 API 및 주요 기능

### 3.1. 인증 (Authentication) - `/api/auth`
- **회원가입 (`POST /signup`)**:
  - `fullName`, `username`, `password`, `confirmPassword`, `gender` 입력 필드 검증
  - `bcryptjs`를 통한 비밀번호 단방향 해시 암호화
  - `gender`에 따라 Dicebear Avatar API 기반의 기본 프로필 이미지 할당
  - 회원가입 성공 시 자동 JWT 발급 및 httpOnly 쿠키(`jwt`) 설정
- **로그인 (`POST /login`)**:
  - `username`, `password` 입력 검증 및 해시 비교 인증
  - 인증 성공 시 JWT 발급 및 쿠키 설정
- **로그아웃 (`POST /logout`)**:
  - `jwt` 쿠키 만료(삭제) 처리

### 3.2. 메시지 (Messages) - `/api/messages`
- **메시지 전송 (`POST /send/:id`)**:
  - 수신자 ID(`:id`)를 기반으로 대화방(`Conversation`) 존재 여부 확인 및 생성
  - 새로운 메시지(`Message`)를 생성 및 대화방 메시지 목록에 추가
  - `protectRoute` 미들웨어로 보호됨
- **메시지 조회 (`GET /:id`)**:
  - 나와 특정 상대방(`:id`) 사이의 대화 내역 전체를 조회하며, Mongoose `populate` 기능을 사용하여 메시지 상세 데이터를 가져옴
  - `protectRoute` 미들웨어로 보호됨

---

## 4. 설치 및 실행 방법

### 4.1. 환경 변수 설정
프로젝트 루트 폴더에 `.env` 파일을 생성하고 다음 설정을 입력합니다. (`env` 파일 내용 참고)

```env
PORT=5000
MONGO_DB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4.2. 백엔드 실행
1. 루트 경로에서 패키지를 설치합니다.
   ```bash
   npm install
   ```
2. 개발 모드로 서버를 구동합니다. (Node.js 내장 watch 기능 활용)
   ```bash
   npm run dev
   ```
   * 백엔드는 기본적으로 `http://localhost:5000`에서 실행됩니다.

### 4.3. 프론트엔드 실행
1. `frontend` 디렉토리로 이동합니다.
   ```bash
   cd frontend
   ```
2. 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
   * 프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

---

## 5. 향후 개발 로드맵 (Roadmap)

### 프론트엔드 (Frontend) 고도화
- **라우팅**: `react-router-dom` 설치 및 페이지 전환(로그인/회원가입, 메인 채팅 화면) 구현
- **상태 관리**: `zustand`와 `AsyncStorage`를 도입하여 유저 세션 및 로그인 JWT 정보 영구 저장
- **컴포넌트/디자인**: Tailwind CSS v4를 활용하여 미려하고 동적인 채팅 UI 구성

### 실시간 채팅 기능 연동 (Socket.io)
- 백엔드 `message.controller.js` 내의 소켓 이벤트 발생 로직 구현
- 프론트엔드에 Socket.io-client를 연동하여 실시간 메시지 수신 기능 활성화
