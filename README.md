# React Chat - 풀스택 실시간 채팅 애플리케이션 (Web & Mobile)

이 프로젝트는 **Node.js (Express) 백엔드**, **Vite + React 웹 프론트엔드**, 그리고 **Expo (React Native) 모바일 프론트엔드**로 구성된 크로스 플랫폼 실시간 1:1 채팅 애플리케이션입니다.

Socket.io를 통해 웹과 모바일 플랫폼 간 실시간 메시지 전송 및 실시간 상태 동기화가 제공됩니다.

---

## 1. 기술 스택 (Tech Stack)

### 💻 백엔드 (Backend)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` 비밀번호 해시
- **Real-time**: `socket.io` (실시간 소켓 이벤트 통신 및 온라인 유저 추적)
- **Middleware**: `cookie-parser`, `cors`

### 🌐 웹 프론트엔드 (Web Frontend)
- **Build Tool**: Vite
- **Framework**: React & React-DOM
- **Routing**: React Router (`react-router-dom` v7)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4.0 (`@tailwindcss/vite` 연동)
- **Real-time**: `socket.io-client`

### 📱 모바일 프론트엔드 (Mobile Frontend)
- **Framework**: Expo (React Native) with TypeScript
- **Routing**: Expo Router (파일 기반 라우팅)
- **State Management**: Zustand + `@react-native-async-storage/async-storage` (세션 영구 저장)
- **Styling**: NativeWind (Tailwind CSS)
- **Real-time**: `socket.io-client`

---

## 2. 디렉토리 구조 (Directory Structure)

프로젝트 루트에서 백엔드 의존성을 관리하며, 웹과 모바일 프론트엔드는 각각 `frontend/`, `mobile/` 하위 디렉토리에서 독자적인 패키지로 격리되어 관리됩니다.

```
react-chat/
 ├─ backend/             # 백엔드 소스 코드
 │   ├─ controllers/     # API 비즈니스 로직 (auth, message, user)
 │   ├─ db/              # 데이터베이스 연결 설정 (Mongoose)
 │   ├─ lib/             # JWT 생성 및 쿠키 설정 유틸
 │   ├─ middleware/      # protectRoute 미들웨어 (JWT 검증 및 인증 보호)
 │   ├─ models/          # Mongoose 스키마 (User, Message, Conversation)
 │   ├─ routes/          # API 라우터 (auth, message, user)
 │   ├─ socket/          # Socket.io 서버 로직 및 온라인 유저 매핑
 │   └─ server.js        # 백엔드 Entry Point (포트 설정, DB 연결, 소켓 서버 가동)
 ├─ frontend/            # 웹 프론트엔드 (React)
 │   ├─ public/          # 정적 리소스
 │   ├─ src/             # React 소스 코드
 │   │   ├─ components/  # 공통 컴포넌트 (채팅창, 사이드바, 테마 버튼 등)
 │   │   ├─ pages/       # 페이지 컴포넌트 (Home, Login, Signup)
 │   │   ├─ store/       # Zustand 상태 저장소 (useAuthStore, useConversationStore, useThemeStore)
 │   │   ├─ index.css    # Tailwind CSS v4 스타일시트
 │   │   ├─ App.jsx      # 라우팅 및 테마 토글 등 메인 레이아웃 컴포넌트
 │   │   └─ main.jsx     # 웹 Entry Point
 │   ├─ vite.config.js   # Vite 및 Tailwind v4 설정
 │   └─ package.json     # 웹 프론트엔드 의존성 및 스크립트
 ├─ mobile/              # 모바일 프론트엔드 (Expo)
 │   ├─ src/             # 모바일 React Native 소스 코드
 │   │   ├─ app/         # Expo Router 파일 기반 화면 라우팅 (index, login, signup, home, chat, explore)
 │   │   ├─ components/  # 모바일 UI 컴포넌트
 │   │   ├─ store/       # Zustand 모바일 상태 저장소
 │   │   ├─ constants/   # 공통 상수 정의
 │   │   ├─ hooks/       # 커스텀 훅
 │   │   └─ global.css   # NativeWind 글로벌 스타일시트
 │   ├─ app.json         # Expo 환경 및 메타데이터 설정
 │   ├─ tailwind.config.js # Tailwind CSS 설정 (NativeWind 연동)
 │   └─ package.json     # 모바일 의존성 및 Expo 스크립트
 ├─ .env                 # 백엔드 환경 변수 (사용자 직접 생성 필요)
 ├─ package.json         # 백엔드 의존성 및 스크립트 관리 (루트 수준)
 └─ README.md            # 본 프로젝트 문서
```

---

## 3. 구현된 API 및 주요 기능

### 3.1. 인증 (Authentication) - `/api/auth`
- **회원가입 (`POST /signup`)**:
  - `fullName`, `username`, `password`, `confirmPassword`, `gender` 검증
  - `bcryptjs` 암호 해싱 및 `gender`에 따른 Dicebear Avatar 자동 프로필 이미지 매핑
  - 성공 시 JWT 토큰 생성 및 httpOnly 쿠키(`jwt`) 설정
- **로그인 (`POST /login`)**:
  - `username`, `password` 인증 후 JWT 쿠키 발급
- **로그아웃 (`POST /logout`)**:
  - `jwt` 쿠키 만료 처리

### 3.2. 메시지 및 유저 통신 - `/api/messages` & `/api/users`
- **메시지 전송 (`POST /api/messages/send/:id`)**:
  - 특정 유저(`:id`)에게 메시지 전송 및 데이터베이스 저장
  - 활성화된 Socket.io 커넥션을 통해 수신 유저에게 실시간 메시지 발송
- **메시지 조회 (`GET /api/messages/:id`)**:
  - 나와 특정 상대방(`:id`)의 1:1 대화 내역 전체 조회
- **유저 목록 조회 (`GET /api/users`)**:
  - 메인 채팅 사이드바 또는 모바일 목록에 표시할 전체 가입 유저 목록 조회 (본인 제외)

### 3.3. 실시간 및 UI 부가 기능
- **실시간 소켓 연동**: Socket.io를 통하여 로그인한 유저들의 온라인 상태를 실시간 트래킹(Online Users 표시) 및 메시지 즉각 수신
- **테마 모드**: 웹 프론트엔드는 라이트(Light)/다크(Dark) 테마 토글이 가능하며 로컬 스토리지에 동기화
- **반응형 웹 및 모바일**: 데스크톱 크기의 웹 환경뿐만 아니라 iOS/Android 모바일 애플리케이션(Expo)에서도 원활히 동작하는 1:1 실시간 모바일 채팅 제공

---

## 4. 설치 및 실행 방법

### 4.1. 환경 변수 설정
프로젝트 루트 폴더에 `.env` 파일을 생성하고 다음 설정을 입력합니다.

```env
PORT=5000
MONGO_DB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4.2. 백엔드 실행 (서버 구동)
1. 루트 경로에서 패키지를 설치합니다.
   ```bash
   npm install
   ```
2. 개발 모드로 서버를 실행합니다.
   ```bash
   npm run dev
   ```
   - 백엔드는 기본적으로 `http://localhost:5000`에서 가동되며, Socket.io 서버도 동일한 포트에서 대기합니다.

### 4.3. 웹 프론트엔드 (React) 실행
1. `frontend` 디렉토리로 이동하여 패키지를 설치합니다.
   ```bash
   cd frontend
   npm install
   ```
2. 웹 개발 서버를 구동합니다.
   ```bash
   npm run dev
   ```
   - 웹은 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 4.4. 모바일 프론트엔드 (Expo) 실행
1. `mobile` 디렉토리로 이동하여 패키지를 설치합니다.
   ```bash
   cd mobile
   npm install
   ```
2. Expo 개발용 Metro 번들러를 시작합니다.
   ```bash
   npx expo start
   ```
   - 터미널에 표시되는 QR 코드를 모바일 기기(Expo Go 앱 설치 필요)로 스캔하거나 iOS 시뮬레이터(`i`), Android 에뮬레이터(`a`) 키를 눌러 모바일 앱을 실행할 수 있습니다.
   - 모바일 에뮬레이터 또는 실기기에서 로컬 서버 접속을 위해 `mobile/src/config.js` 파일 등에서 백엔드 API URL(예: IP 주소 기반 설정)을 환경에 맞추어 적절히 구성해야 할 수 있습니다.



## 5. 향후 개발 로드맵 (Roadmap)

