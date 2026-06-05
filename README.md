# 💬 React Chat - 실시간 크로스 플랫폼 채팅 애플리케이션 (Web & Mobile)

이 프로젝트는 **Node.js (Express) 백엔드**, **Vite + React 웹 프론트엔드**, 그리고 **Expo (React Native) 모바일 프론트엔드**로 구성된 크로스 플랫폼 실시간 1:1 채팅 애플리케이션입니다.

`Socket.io`를 활용하여 웹과 모바일 플랫폼 간 실시간 메시지 전송 및 사용자 온라인 상태 동기화를 끊김 없이 제공합니다.

---
<a id="table-of-contents"></a>
## 📌 목차 
1. [📂 디렉토리 구조 (Directory Structure)](#directory-structure)
2. [🛠️ 기술 스택 (Tech Stack)](#tech-stack)
3. [✨ 핵심 기능 및 특징 (Key Features)](#key-features)
4. [🔌 API 엔드포인트 목록 (API Reference)](#api-reference)
5. [🚀 설치 및 로컬 실행 방법 (Quick Start)](#quick-start)
6. [🌐 웹 빌드 및 배포 가이드 (Render.com Deployment)](#web-build-release)
7. [📦 모바일 빌드 및 배포 가이드 (Expo Build & Release)](#expo-build-release)
8. [🗺️ 향후 개발 로드맵 (Roadmap)](#roadmap)

---

<a id="directory-structure"></a>
## 1. 📂 디렉토리 구조 (Directory Structure)

프로젝트 루트에서 백엔드 의존성 및 통합 빌드를 관리하며, 웹과 모바일 프론트엔드는 각각 `frontend/`, `mobile/` 하위 디렉토리에서 독자적인 패키지로 격리되어 관리됩니다.

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
 │   │   ├─ hooks/       # React 커스텀 훅
 │   │   ├─ pages/       # 페이지 컴포넌트 (Home, Login, Signup)
 │   │   ├─ store/       # Zustand 상태 저장소 (auth, conversation, theme)
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
 │   │   ├─ config.js    # API 서버 URL 등 모바일 전용 환경 설정
 │   │   └─ global.css   # NativeWind 글로벌 스타일시트
 │   ├─ app.json         # Expo 환경 및 메타데이터 설정
 │   ├─ tailwind.config.js # Tailwind CSS 설정 (NativeWind 연동)
 │   └─ package.json     # 모바일 의존성 및 Expo 스크립트
 ├─ .env                 # 백엔드 환경 변수 (사용자 직접 생성 필요)
 ├─ package.json         # 백엔드 의존성 및 통합 빌드 스크립트 관리 (루트 수준)
 └─ README.md            # 프로젝트 안내 문서
```

---

<a id="tech-stack"></a>
## [2. 🛠️ 기술 스택 (Tech Stack)](#table-of-contents)

### 💻 백엔드 (Backend)
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), `bcryptjs` 비밀번호 해시
- **Real-time Communication**: `Socket.io` (실시간 소켓 이벤트 및 온라인 유저 트래킹)
- **Middleware**: `cookie-parser`, `cors`

### 🌐 웹 프론트엔드 (Web Frontend)
- **Build Tool & Framework**: Vite, React & React-DOM
- **Routing**: React Router (`react-router-dom` v7)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4.0 (`@tailwindcss/vite` 연동)
- **Socket Client**: `socket.io-client`

### 📱 모바일 프론트엔드 (Mobile Frontend)
- **Framework**: Expo (React Native) with TypeScript
- **Routing**: Expo Router (파일 기반 라우팅)
- **State Management**: Zustand & `@react-native-async-storage/async-storage` (세션 및 유저 정보 영구 저장)
- **Styling**: NativeWind (Tailwind CSS)
- **Socket Client**: `socket.io-client`

---

<a id="key-features"></a>
## 3. [✨ 핵심 기능 및 특징 (Key Features)](#table-of-contents)

### 1️⃣ 실시간 메시지 수신 셰이크 애니메이션 (Message Shake Effect)
* **개요**: 채팅방에서 새로운 메시지가 수신되면 해당 메시지 버블이 **2초 동안** 흔들리는 애니메이션이 동작하여 사용자 집중도와 인지 효과를 높입니다.
* **플랫폼별 구현 세부사항**:
  * **웹 프론트엔드 (React)**: [ChatContainer.jsx](file:///Users/guniluk/Desktop/CLI/react-chat/frontend/src/components/ChatContainer.jsx)에서 `messages` 배열의 변화를 감지하고, 수신된 마지막 메시지에 대해 `.animate-shake` CSS 애니메이션을 2초간 동적으로 입힙니다. 최초 데이터 로딩(초기 대화 내용 조회) 시에는 흔들림이 발동하지 않도록 `prevLength`와 `isFirstLoad` 참조 변수로 정교하게 제어합니다. 관련 키프레임은 [index.css](file:///Users/guniluk/Desktop/CLI/react-chat/frontend/src/index.css)에 선언되어 있습니다.
  * **모바일 프론트엔드 (Expo)**: [chat.tsx](file:///Users/guniluk/Desktop/CLI/react-chat/mobile/src/app/chat.tsx)에서 React Native의 `Animated` API (`Animated.sequence` 및 `Animated.timing`)를 사용해 수신된 메시지에 좌우 흔들림 효과(`translateX`)를 부여합니다. 웹과 마찬가지로 대화방 첫 진입 시 오동작 방지 예외 처리가 반영되어 있습니다.

### 2️⃣ 통합 빌드 및 프로더션 배포 준비
* **루트 통합 빌드 스크립트**: 루트 [package.json](file:///Users/guniluk/Desktop/CLI/react-chat/package.json)에 `"build"` 스크립트를 통합하여, 하나의 명령어로 전체 프로젝트의 의존성 설치 및 웹 프론트엔드 빌드를 완료할 수 있습니다.
  ```bash
  npm run build
  ```
* **백엔드 정적 파일 호스팅**: [server.js](file:///Users/guniluk/Desktop/CLI/react-chat/backend/server.js)에 프로덕션 환경 배포 시 React 웹 빌드 본(`frontend/dist`)을 서버에서 직접 서빙하기 위한 라우팅 설정 코드(배포 시 활성화할 수 있도록 주석 처리됨)가 포함되어 있습니다.
* **소켓 배포 URL 설정**: 웹의 [useAuthStore.js](file:///Users/guniluk/Desktop/CLI/react-chat/frontend/src/store/useAuthStore.js) 내에 배포 환경에 맞춰 Socket URL 주소를 쉽게 분기 처리할 수 있는 `SOCKET_URL` 가이드라인이 명시되어 있습니다.

### 3️⃣ 실시간 상태 및 테마 동기화
* **실시간 소켓 연동**: Socket.io를 기반으로 로그인한 사용자의 온라인/오프라인 상태를 실시간으로 추적하여 사이드바에 표시합니다.
* **다크/라이트 테마 모드**: 웹 프론트엔드는 라이트(Light)/다크(Dark) 테마 간 토글이 가능하며, 사용자 설정은 로컬 스토리지에 동기화되어 유지됩니다.

---

<a id="api-reference"></a>
## 4. [🔌 API 엔드포인트 목록 (API Reference)](#table-of-contents)

### 🔐 인증 (Authentication) - `/api/auth`
| 메서드 | 엔드포인트 | 설명 | 주요 처리 사항 |
| :--- | :--- | :--- | :--- |
| **POST** | `/signup` | 신규 회원가입 | `fullName`, `username`, `password`, `confirmPassword`, `gender` 유효성 검사 및 `bcryptjs` 암호 해싱. 가입 시 성별 정보 기반 Dicebear Avatar 프로필 이미지 매핑. 완료 후 JWT 쿠키 발급. |
| **POST** | `/login` | 로그인 | `username`과 `password` 확인 후 JWT 쿠키(`jwt`)를 httpOnly 형태로 발급. |
| **POST** | `/logout` | 로그아웃 | `jwt` 인증 쿠키 만료 처리 및 세션 정리. |

### 💬 메시지 및 유저 (Messages & Users)
| 메서드 | 엔드포인트 | 설명 | 주요 처리 사항 |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/messages/send/:id` | 메시지 전송 | 상대방 유저ID(`:id`)로 메시지를 송신 및 MongoDB 저장. Socket.io 커넥션이 활성화되어 있다면 즉시 대상에게 실시간 소켓 메시지 푸시. |
| **GET** | `/api/messages/:id` | 1:1 대화 조회 | 로그인한 유저와 특정 상대방(`:id`) 간의 이전 1:1 대화 내역 전체 조회. |
| **GET** | `/api/users` | 사이드바 유저 목록 | 자신을 제외한 시스템의 모든 가입 유저 목록 조회 (실시간 온라인 상태 결합 목적). |

---

<a id="quick-start"></a>
## 5. [🚀 설치 및 로컬 실행 방법 (Quick Start)](#table-of-contents)

### Step 1. 환경 변수 설정
프로젝트 루트 경로에 `.env` 파일을 생성하고 아래 양식에 맞추어 환경 변수를 설정합니다.
```env
PORT=5000
MONGO_DB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Step 2. 전체 의존성 설치 및 웹 빌드 (통합 빌드)
루트 디렉토리에서 다음 명령어로 전체 모듈 설치 및 웹 리소스 빌드를 실행합니다:
```bash
npm install
npm run build
```

### Step 3. 백엔드 서버 구동
루트 디렉토리에서 개발 모드로 Node.js 백엔드 서버를 작동시킵니다:
```bash
npm run dev
```
* 백엔드는 기본 포트 `http://localhost:3000`에서 소켓 서버와 함께 가동됩니다.

### Step 4. 웹 프론트엔드 (React) 실행
`frontend` 디렉토리로 이동하여 개발 서버를 실행합니다:
```bash
cd frontend
npm install
npm run dev
```
* 웹 프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### Step 5. 모바일 프론트엔드 (Expo) 실행
`mobile` 디렉토리로 이동하여 Expo Metro 번들러를 작동시킵니다:
```bash
cd mobile
npm install
npx expo start
```
* **실행 안내**: 
  * 터미널에 나타나는 QR 코드를 기기(Expo Go 앱 필요)로 스캔하거나, 터미널 상에서 `i` (iOS 시뮬레이터), `a` (Android 에뮬레이터) 키를 입력해 실행합니다.
  * 모바일 실기기 또는 에뮬레이터에서 로컬 백엔드 서버로 접속하기 위해서는 `mobile/src/config.js` 등에서 백엔드 API URL(IP 주소 기반 등)을 현재 네트워크 환경에 맞게 적절히 지정해야 합니다.

---

<a id="web-build-release"></a>
## 6. [🌐 웹 빌드 및 배포 가이드 (Render.com Deployment)](#table-of-contents)

이 프로젝트는 백엔드가 빌드된 웹 프론트엔드 정적 파일(`frontend/dist`)을 직접 호스팅할 수 있도록 통합 설계되었습니다. **Render.com**을 사용하여 풀스택 웹 서비스를 무료로 빌드하고 배포하는 상세 가이드입니다.

### 6.1. 배포 전 코드 준비
배포를 시작하기 전에 백엔드가 웹 프론트엔드의 정적 빌드 파일을 서빙할 수 있도록 백엔드 코드를 활성화해야 합니다.

1. [backend/server.js](file:///Users/guniluk/Desktop/CLI/react-chat/backend/server.js) 파일을 열고 아래 주석 처리된 배포용 서빙 코드를 찾아 주석(`//`)을 해제합니다.
   ```javascript
   // 주석 해제 전:
   // //! build for web deployment
   // import path from 'path';
   // const __dirname = path.resolve();
   // app.use(express.static(path.join(__dirname, '/frontend/dist')));
   // app.get('*', (req, res) => {
   //   res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
   // });

   // 주석 해제 후:
   //! build for web deployment
   import path from 'path';
   const __dirname = path.resolve();
   app.use(express.static(path.join(__dirname, '/frontend/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
   });
   ```
2. 수정한 코드를 저장한 후 GitHub 등 원격 저장소에 Push합니다.

### 6.2. Render.com 서비스 생성 및 연결
1. [Render.com](https://render.com)에 로그인한 후 대시보드 우측 상단의 **New +** 버튼을 클릭하고 **Web Service**를 선택합니다.
2. 프로젝트 코드가 업로드된 **GitHub 저장소**를 연결합니다.

### 6.3. 웹 서비스 세부 설정
연결 후 생성 페이지에서 아래와 같이 배포 설정을 입력합니다:

* **Name**: 서비스 식별을 위한 고유 이름 입력 (예: `react-chat-app`)
* **Region**: 사용자와 가장 가까운 리전 선택 (예: `Singapore`)
* **Branch**: 배포를 진행할 대상 브랜치 (예: `main`)
* **Root Directory**: 빈칸으로 유지 (루트 디렉토리 기준 빌드 및 실행)
* **Runtime**: `Node`
* **Build Command**: `npm run build`
  > [!NOTE]
  > 루트 `package.json`에 정의된 `build` 스크립트가 실행되어 백엔드 모듈 설치, 프론트엔드 패키지 설치 및 Vite 빌드(`frontend/dist` 생성)를 자동으로 연속 수행합니다.
* **Start Command**: `npm start`
* **Instance Type**: **Free** 플랜 선택

### 6.4. 환경 변수 (Environment Variables) 구성
하단의 **Advanced** 영역을 클릭하거나 배포 생성 후 **Environment** 탭으로 이동하여 프로젝트 가동에 필요한 환경 변수를 지정합니다:

| Key | Value | 설명 |
| :--- | :--- | :--- |
| **PORT** | `3000` | Render에서 내부적으로 포워딩 및 백엔드가 실행될 포트 번호 |
| **MONGO_DB_URI** | `mongodb+srv://...` | MongoDB Atlas 커넥션 String 주소 |
| **JWT_SECRET** | `your_secret_key` | 로그인 세션 인증 토큰 암호화 키 |
| **NODE_ENV** | `production` | 프로덕션 모드 활성화 환경 변수 |

설정 완료 후 **Create Web Service** (또는 배포 저장) 버튼을 클릭하면 클라우드 상에서 자동으로 빌드 및 배포 프로세스가 구동됩니다.

### 6.5. 배포 완료 확인 및 소켓 URL 연동
1. 빌드가 완료되면 상단에 부여된 URL 주소 (예: `https://react-chat-app.onrender.com`)로 접속하여 브라우저에서 웹 서비스가 정상 작동하는지 확인합니다.
2. 웹 프론트엔드가 소켓 및 API 요청을 정상적으로 처리하려면 로컬 URL 대신 Render에서 발급받은 실제 배포 도메인을 향하도록 소켓 설정([useAuthStore.js](file:///Users/guniluk/Desktop/CLI/react-chat/frontend/src/store/useAuthStore.js))의 접속 주소를 적절히 분기 처리해야 함을 명심하세요.
   * `NODE_ENV === "production"`일 때는 별도의 포트 번호 없이 본인의 Render 배포 도메인을 소켓 서버 주소로 사용하도록 코드 내 분기 처리가 기본 적용되어 있습니다.

---

<a id="expo-build-release"></a>
## 7. [📦 모바일 빌드 및 배포 가이드 (Expo Build & Release)](#table-of-contents)

모바일 클라이언트는 **Expo** 기반으로 빌드되어 있으므로, **EAS (Expo Application Services)**를 사용하여 빠르고 표준화된 빌드 및 배포 파이프라인을 구축할 수 있습니다.

### 7.1. 사전 준비 사항
* **Expo 계정 생성**: [Expo 공식 홈페이지](https://expo.dev)에서 개발자 계정을 생성합니다.
* **스토어 개발자 계정 등록 (선택)**:
  * Android 배포: Google Play Console 개발자 등록 필요 (일회성 등록비 $25)
  * iOS 배포: Apple Developer Program 멤버십 구독 필요 (연간 $99)
* **EAS CLI 설치 및 로그인**:
  ```bash
  npm install -g eas-cli
  eas login
  ```

### 7.2. EAS 프로젝트 초기화
`mobile` 디렉토리로 이동하여 EAS 프로젝트를 초기화하고 연동합니다.
```bash
cd mobile
eas project:init
```
* 터미널 프롬프트에서 자신의 Expo 계정과 연동할 프로젝트명을 생성하거나 선택합니다.

### 7.3. 빌드 구성 파일 생성 (`eas.json`)
빌드 프로필 설정을 위해 아래 명령을 실행합니다:
```bash
eas build:configure
```
이 과정을 거치면 `mobile/eas.json` 파일이 자동 생성되며, `development`, `preview`, `production` 프로필이 포함됩니다.

### 7.4. 모바일 빌드 실행
EAS 클라우드 서버에서 빌드가 수행되므로 로컬 머신에 Xcode나 Android Studio가 구성되어 있지 않아도 손쉽게 빌드할 수 있습니다.

* **Android 빌드**:
  * **AAB (Play Store 배포용)**:
    ```bash
    eas build --platform android --profile production
    ```
  * **APK (기기 직접 설치 및 테스트용)**:
    `eas.json`의 `preview` 프로필 등에 `"buildType": "apk"` 설정을 확인한 뒤 아래 명령어를 실행합니다.
    ```bash
    eas build --platform android --profile preview
    ```

* **iOS 빌드**:
  * **IPA (App Store 배포용)**:
    ```bash
    eas build --platform ios --profile production
    ```
  * **시뮬레이터용 빌드 (로컬 테스트용)**:
    ```bash
    eas build --platform ios --profile preview
    ```

* **전체 플랫폼 통합 빌드**:
  ```bash
  eas build --platform all --profile production
  ```

### 7.5. 앱 스토어 배포 (EAS Submit)
빌드가 최종 완료된 후 생성된 바이너리(AAB 또는 IPA)를 각 스토어로 전송합니다.

* **Android (Google Play Store) 제출**:
  ```bash
  eas submit --platform android
  ```
* **iOS (App Store Connect) 제출**:
  ```bash
  eas submit --platform ios
  ```
* **자동 빌드 및 제출**: 빌드가 끝나자마자 자동으로 제출까지 수행하려면 `--auto-submit` 플래그를 붙여 실행합니다.
  ```bash
  eas build --platform all --profile production --auto-submit
  ```

---

<a id="roadmap"></a>
## 8. [🗺️ 향후 개발 로드맵 (Roadmap)](#table-of-contents)

- [ ] **메시지 내 파일/이미지 전송 지원**: Cloudinary 혹은 AWS S3 연동을 통하여 단순 텍스트 외에 이미지, 파일 업로드 전송 기능 추가
- [ ] **소켓 재연결 및 오프라인 메시지 큐 관리**: 모바일 백그라운드 상태나 네트워크 유실 상황에서의 끊김 없는 메시지 송수신 보장
- [ ] **다인원 그룹 채팅**: 1:1 대화를 넘어선 다중 유저 참여형 단체방 및 채널 생성 기능
- [ ] **Expo 푸시 알림 (Push Notifications)**: 앱 미구동 시에도 실시간 새 메시지 푸시 알림 알람 발송
- [ ] **메시지 읽음 표시 (Read Receipts)**: 상대방이 메시지를 읽었는지 상태 트래킹을 통한 확인 기능
