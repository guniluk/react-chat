# 💬 React Chat - 실시간 크로스 플랫폼 채팅 애플리케이션 (Web & Mobile)

이 프로젝트는 **Node.js (Express) 백엔드**, **Vite + React 웹 프론트엔드**, 그리고 **Expo (React Native) 모바일 프론트엔드**로 구성된 풀스택 크로스 플랫폼 실시간 1:1 채팅 애플리케이션입니다.

`Socket.io`를 활용하여 웹과 모바일 플랫폼 간 실시간 메시지 전송 및 사용자 온라인 상태 동기화를 원활하게 제공하며, **Cloudinary**를 도입하여 이미지 업로드 및 실시간 이미지 전송 기능을 완벽히 지원합니다.

---

<a id="table-of-contents"></a>
## 📌 목차 
1. [📝 서비스 시나리오 (Service Scenario)](#section-1)
2. [📂 디렉토리 구조 (Directory Structure)](#section-2)
3. [🛠️ 기술 스택 (Tech Stack)](#section-3)
4. [🔑 핵심 크로스 플랫폼 아키텍처 및 구현 패턴 (Core Patterns)](#section-4)
5. [🔌 API 엔드포인트 목록 (API Reference)](#section-5)
6. [🚀 설치 및 로컬 실행 방법 (Quick Start)](#section-6)
7. [🌐 웹 빌드 및 배포 가이드 (Render.com Deployment)](#section-7)
8. [📦 모바일 빌드 및 배포 가이드 (Expo Build & Release)](#section-8)

---

<a id="section-1"></a>
## 1. 📝 서비스 시나리오 (Service Scenario)

이 애플리케이션의 핵심 사용자 흐름 및 서비스 시나리오는 다음과 같이 진행됩니다.

### 1.1. 회원가입 및 초기 설정 (User Onboarding)
* 사용자는 이름(`fullName`), 아이디(`username`), 비밀번호(`password`), 그리고 성별(`gender`)을 입력하여 회원가입을 완료합니다.
* 사용자가 지정한 성별 정보에 기초하여 시스템은 **Dicebear API**를 연동해 맞춤형 프로필 아바타 이미지를 자동으로 생성 및 매핑합니다.

### 1.2. 로그인 및 상태 유지 (Secure Session Authentication)
* 아이디와 비밀번호 검증에 성공하면 고유한 **JWT** 토큰이 발급됩니다.
* **웹 프론트엔드**: 브라우저 보안 규격을 따르기 위해 `httpOnly` 속성이 부여된 쿠키 저장소에 JWT를 암호화 보관하여 CSRF 공격을 예방합니다.
* **모바일 프론트엔드**: 네이티브 보안 및 저장 표준에 맞게 `AsyncStorage` 장치에 Bearer 토큰 형태로 저장한 뒤, Zustand 상태 저장소와 동기화하여 앱 재시작 시에도 로그인 세션이 자동으로 유지됩니다.

### 1.3. 실시간 온라인 유저 트래킹 (Real-time Active Users)
* 사용자가 정상 접속하면 백엔드 서버와 **Socket.io** 커넥션이 체결됩니다.
* 서버는 즉시 신규 사용자의 온라인 진입 소식을 전체 접속자에게 실시간 브로드캐스트합니다.
* 웹과 모바일의 사이드바/친구 목록 UI 상에 실시간으로 접속 중인 사용자는 **초록색 활성 닷(Dot)**으로 시각화되며, 상대가 브라우저나 앱을 종료하면 즉시 오프라인 상태로 업데이트됩니다.

### 1.4. 1:1 대화방 개설 및 메시지 동기화 (Message Synchronization)
* 친구 목록에서 대화 상대를 터치하거나 클릭하면 개별 1:1 채팅창으로 전환됩니다.
* 채팅방 진입과 동시에 서버 데이터베이스(MongoDB)로부터 정렬된 이전 대화 히스토리를 즉각적으로 읽어와 화면에 렌더링합니다.
* 사용자가 대화창에 머물고 있는 동안 수신되는 상대의 모든 미읽음 메시지는 백엔드 이벤트 감지를 통해 즉시 읽음(`isRead: true`) 처리로 플래그가 업데이트됩니다.

### 1.5. 실시간 메시징 및 셰이크 애니메이션 (Real-time Chatting & Motion UI)
* 채팅창 하단 입력란에 메시지를 기재한 뒤 전송하면, 백엔드 라우터를 거침과 동시에 소켓 프로토콜로 상대방의 활성 소켓 채널에 다이렉트 전송됩니다.
* 신규 메시지가 로드되는 순간 사용자의 집중을 돕기 위해 **웹(CSS Keyframes 애니메이션)** 및 **모바일(React Native Native Driver Animated API)** 기법을 사용하여 말풍선이 좌우로 살짝 흔들리는 **셰이크 효과(Message Shake Effect)**를 동반하여 렌더링됩니다.

### 1.6. 고해상도 이미지 전송 및 Cloudinary CDN 연동 (Image Transfer with Size-Limit)
* 채팅창 우측 하단의 파일/이미지 피커 아이콘을 통해 디바이스에 보관된 이미지를 첨부할 수 있습니다.
* 데이터 업로드 대역폭 보호를 위해 프론트엔드(웹/모바일) 내부 로직으로 **1MB 파일 용량 상한선**을 우선 검증합니다.
* 검증을 마친 이미지 데이터는 **Base64 Data URI 문자열**로 직렬화되어 백엔드로 인계됩니다.
* 백엔드는 수신 즉시 **Cloudinary 클라우드 CDN**으로 무손실 고속 업로드를 처리하고, 획득한 고유 HTTPS 이미지 리소스를 데이터베이스에 기록한 뒤 소켓을 이용하여 대화방 사용자들에게 실시간 스트리밍합니다.

### 1.7. 안전한 세션 종료 (Graceful Logout)
* 로그아웃 요청 시 프론트엔드의 인증 토큰 및 쿠키가 완전히 무효화되며 소켓 연결을 명시적으로 해제(`disconnect`)합니다.
* 백엔드는 온라인 유저 매핑 리스트에서 세션을 삭제하고 다른 실시간 유저들에게 해당 사용자의 오프라인 전환 소식을 전송합니다.

---

<a id="section-2"></a>
## [2. 📂 디렉토리 구조 (Directory Structure)](#table-of-contents)

프로젝트 루트에서 백엔드 의존성 및 통합 빌드를 관리하며, 웹과 모바일 프론트엔드는 각각 `frontend/`, `mobile/` 하위 디렉토리에서 독자적인 패키지로 격리되어 관리됩니다.

```
react-chat/
 ├─ backend/             # Express.js 백엔드 소스 코드
 │   ├─ controllers/     # API 비즈니스 로직 (auth, message, user)
 │   ├─ db/              # 데이터베이스 연결 설정 (Mongoose)
 │   ├─ lib/             # JWT 생성, Cloudinary 설정 등 공통 라이브러리
 │   ├─ middleware/      # protectRoute 미들웨어 (Cookie 및 Bearer 인증 동시 지원)
 │   ├─ models/          # Mongoose 스키마 (User, Message, Conversation)
 │   ├─ routes/          # API 라우터 (auth, message, user)
 │   ├─ socket/          # Socket.io 서버 로직 및 온라인 유저 매핑
 │   └─ server.js        # 백엔드 Entry Point (포트 설정, DB 연결, 소켓 서버 가동)
 ├─ frontend/            # 웹 프론트엔드 (React)
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
 │   │   ├─ store/       # Zustand 모바일 상태 저장소 (AuthToken, Session 관리)
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

<a id="section-3"></a>
## [3. 🛠️ 기술 스택 (Tech Stack)](#table-of-contents)

### 💻 백엔드 (Backend)
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), `bcryptjs` 비밀번호 해시
- **File Management**: Cloudinary (프로필 이미지 및 채팅 내 전송 이미지 호스팅)
- **Real-time Communication**: `Socket.io` (실시간 소켓 이벤트 및 온라인 유저 트래킹)
- **Middleware**: `cookie-parser`, `cors`, `express.json` (용량 제한 설정 포함)

### 🌐 웹 프론트엔드 (Web Frontend)
- **Build Tool & Framework**: Vite, React & React-DOM
- **Routing**: React Router (`react-router-dom` v7)
- **State Management**: Zustand (로컬스토리지 연동 세션 관리)
- **Styling**: Tailwind CSS v4.0 (`@tailwindcss/vite` 연동)
- **Socket Client**: `socket.io-client`

### 📱 모바일 프론트엔드 (Mobile Frontend)
- **Framework**: Expo (React Native) with TypeScript
- **Routing**: Expo Router (파일 기반 라우팅)
- **State Management**: Zustand & `@react-native-async-storage/async-storage` (세션 및 Bearer 토큰 영구 저장)
- **Image handling**: `expo-image`, `expo-image-picker`
- **Styling**: NativeWind (Tailwind CSS)
- **Socket Client**: `socket.io-client`

---

<a id="section-4"></a>
## [4. 🔑 핵심 크로스 플랫폼 아키텍처 및 구현 패턴 (Core Patterns)](#table-of-contents)

이 프로젝트는 웹과 모바일을 동시에 서빙하는 풀스택 앱에서 요구되는 **표준 아키텍처 모범 사례**를 적용하였습니다. 다른 풀스택 프로젝트 개발 시에도 동일하게 이식하여 사용할 수 있습니다.

### 3.1. 크로스 플랫폼 이중 인증 패턴 (Dual-Auth Pattern)
웹 브라우저와 모바일 네이티브 앱은 인증 정보를 처리하는 방식이 다릅니다. 
- **웹**: 브라우저의 보안 기능인 `httpOnly` 쿠키를 활용하여 CSRF 공격을 예방합니다.
- **모바일**: 모바일 앱 환경에서는 표준 쿠키 관리가 불가능하므로, `Authorization: Bearer <Token>` 헤더 방식을 사용합니다.

백엔드의 [protectRoute.js](file://backend/middleware/protectRoute.js) 미들웨어는 이 두 가지를 동시에 파싱하도록 설계되어 단일 백엔드로 두 플랫폼을 모두 수용합니다:
```javascript
let token = req.cookies.jwt;

// 모바일 클라이언트에서 헤더에 Bearer 토큰을 실어 보낸 경우 추출
if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  token = req.headers.authorization.split(' ')[1];
}
```

### 3.2. Zustand 세션 영구 저장 & 분기 처리
로그인 세션 정보 유지를 위해 프론트엔드는 디바이스 환경에 최적화된 스토리지를 선택합니다.
- **웹**: 브라우저의 내장 객체인 `localStorage`를 활용하여 사용자 정보를 동기화합니다.
- **모바일**: 네이티브 비동기 스토리지 라이브러리인 `@react-native-async-storage/async-storage`와 Zustand의 `persist` 미들웨어를 연동하여 영구 저장소에 자동 직렬화 및 역직렬화를 적용합니다:
  ```typescript
  persist(
    (set, get) => ({ ... }),
    {
      name: "chat-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ authUser: state.authUser, token: state.token }),
    }
  )
  ```

### 3.3. Expo 개발 환경 호스트 IP 자동 감지 유틸리티
모바일 실기기(Expo Go)나 에뮬레이터에서 로컬 백엔드 서버(`localhost:3000`)에 직접 접근하려고 하면 루프백 주소 한계로 인해 통신에 실패합니다. 
이 프로젝트는 Metro 개발 서버의 호스트 IP를 동적으로 분석하여 자동으로 API 엔드포인트를 할당해 주는 [config.js](file://mobile/src/config.js)를 채택했습니다:
```javascript
import Constants from 'expo-constants';

const getBackendUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`; // 로컬 PC의 내부 IP 주소를 자동 할당
  }
  return 'http://localhost:3000';
};
```

### 3.4. Cloudinary 기반 이미지 업로드 및 용량 제한 (1MB Limit)
네트워크 리소스를 보존하고 클라우드 스토리지 비용을 효율적으로 통제하기 위해, 모든 이미지는 **최대 1MB 이하**로 제한되며 **Base64 Data URI** 형식으로 직렬화되어 백엔드로 인계됩니다.

* **웹 (React)**:
  `FileReader`를 통해 사용자가 선택한 파일을 로컬 단에서 직렬화하고 파일 사이즈 제한을 검사합니다:
  ```javascript
  if (file.size > 1024 * 1024) {
    toast.error("이미지 크기는 1MB를 초과할 수 없습니다.");
    return;
  }
  ```
* **모바일 (Expo)**:
  `expo-image-picker`를 활용하여 이미지를 선택합니다. 네이티브 환경에서 `fileSize` 속성이 정의되지 않은 경우에는 Base64 문자열 길이를 이용해 간접적으로 실제 바이트 수를 근사 계산하여 사용자 피드백을 제공합니다:
  ```typescript
  // Base64 문자열의 길이당 대략 0.75배를 적용하여 실제 파일 크기를 유추
  const approxSize = asset.base64.length * 0.75;
  if (approxSize > 1024 * 1024) {
    Alert.alert("알림", "이미지 크기는 1MB를 초과할 수 없습니다.");
    return;
  }
  ```
* **백엔드 (Express & Cloudinary)**:
  컨트롤러에서 Base64 이미지를 수신하는 즉시 **Cloudinary** CDN으로 안전하게 업로드하고 가볍고 빠른 보안 URL(`secure_url`)을 획득하여 DB에 저장합니다.
  > [!IMPORTANT]
  > 백엔드 서버의 JSON 바디 파싱 리밋(`limit: "1mb"`)이 `express.json` 미들웨어에 설정되어 있어, Base64 직렬화된 이미지 데이터가 누락되거나 거부되지 않도록 설계되었습니다.

### 3.5. 실시간 메시지 수신 셰이크 애니메이션 (Message Shake Effect)
신규 메시지가 수신될 때 사용자의 인지 반응을 극대화하기 위해 웹과 모바일 플랫폼 특성에 최적화된 기법으로 셰이크 효과를 제공합니다.
- **웹**: CSS Keyframes(`animate-shake`)와 리액트 `ref` 기반 렌더링 검사(`isFirstLoad`, `prevLength`)를 병합하여 신규 유입 건에만 2초간 셰이크 CSS 클래스를 삽입합니다.
- **모바일**: React Native의 고성능 `Animated` API(`Animated.sequence`, `Animated.timing`)를 구동해 UI 메인 스레드 점유 없이 부드러운 좌우 흔들림 효과(`translateX`)를 실시간으로 발생시킵니다.

---

<a id="section-5"></a>
## [5. 🔌 API 엔드포인트 목록 (API Reference)](#table-of-contents)

### 🔐 인증 (Authentication) - `/api/auth`
| 메서드 | 엔드포인트 | 설명 | 주요 처리 사항 |
| :--- | :--- | :--- | :--- |
| **POST** | `/signup` | 신규 회원가입 | `fullName`, `username`, `password`, `gender` 유효성 검사. 비밀번호 해싱 및 Dicebear 기본 아바타 프로필 자동 맵핑. 웹 클라이언트용 JWT 쿠키 세팅 및 JSON 응답 반환. |
| **POST** | `/login` | 로그인 | `username`과 `password` 매칭 후 JWT 발급. |
| **POST** | `/logout` | 로그아웃 | 인증 토큰 및 백엔드 쿠키 제거. |

### 💬 메시지 및 유저 (Messages & Users)
| 메서드 | 엔드포인트 | 설명 | 주요 처리 사항 |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/messages/send/:id` | 메시지 및 이미지 전송 | 상대방 유저ID(`:id`)로 텍스트 또는 **Base64 이미지** 전송. Cloudinary 업로드 후 이미지 URL 저장. 상대방에게 소켓 실시간 전송. |
| **GET** | `/api/messages/:id` | 1:1 대화 내역 조회 | 두 유저 간의 정렬된 대화 내역 전체 조회. 입장 시 대상 메시지 일괄 읽음(`isRead: true`) 처리 및 읽음 확인 이벤트 소켓 브로드캐스트. |
| **GET** | `/api/users` | 사이드바 사용자 목록 | 로그인된 사용자를 제외하고 가입한 전체 사용자를 소켓 온라인 유저 목록 정보와 매핑하여 전달. |

---

<a id="section-6"></a>
## [6. 🚀 설치 및 로컬 실행 방법 (Quick Start)](#table-of-contents)

### Step 1. 환경 변수 설정 (.env)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 형식을 채워줍니다.
```env
PORT=3000
MONGO_DB_URI=mongodb+srv://<id>:<pw>@cluster...mongodb.net/chat
JWT_SECRET=your_jwt_signature_secret_string
NODE_ENV=development

# Cloudinary 인증 정보
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 2. 루트 레벨 통합 설치 및 웹 프론트 빌드
루트 디렉토리의 `package.json`은 백엔드 실행과 동시에 프론트엔드 모듈 설치/빌드 스크립트를 통합 관리합니다.
```bash
# 전체 모듈 설치 및 웹 리소스 빌드 한번에 수행
npm install
npm run build
```

### Step 3. 백엔드 개발 서버 실행
```bash
npm run dev
```
* 백엔드는 `nodemon`을 통해 리로딩되며 `http://localhost:3000`에서 가동됩니다.

### Step 4. 웹 프론트엔드 (React) 실행
`frontend/` 디렉토리로 진입하여 Vite 개발 서버를 구동합니다:
```bash
cd frontend
npm install
npm run dev
```
* 기본 구동 주소: `http://localhost:5173`

### Step 5. 모바일 프론트엔드 (Expo) 실행
`mobile/` 디렉토리로 이동하여 Expo Metro 개발 환경을 가동합니다.
```bash
cd mobile
npm install
npx expo start
```
* **동작 방법**: 
  - 모바일 실기기의 카메라나 Expo Go 앱을 사용해 터미널에 노출된 QR 코드를 스캔합니다.
  - 혹은 터미널에서 `i`(iOS 시뮬레이터), `a`(Android 에뮬레이터) 키를 입력해 테스트를 진행합니다.

---

<a id="section-7"></a>
## [7. 🌐 웹 빌드 및 배포 가이드 (Render.com Deployment)](#table-of-contents)

이 가이드는 클라우드 플랫폼인 Render.com을 사용하여 웹 애플리케이션을 무료로 배포하고 전 세계에서 접속할 수 있는 실서비스로 만드는 방법을 단계별로 설명합니다.

이 프로젝트는 백엔드(Node.js)가 웹 프론트엔드(React)의 빌드 결과물(정적 파일)을 함께 배포하고 서비스하는 **통합 서빙 방식**을 사용하므로, 백엔드 서버 1개만 배포하면 되기 때문에 매우 경제적이고 관리하기 쉽습니다.

---

### 7.1. 배포 전 소스 코드 수정 (웹 서빙 활성화)
Render에 배포하기 전에 백엔드가 React 정적 빌드 파일을 서빙할 수 있도록 설정해야 합니다.

1. [backend/server.js](file://backend/server.js) 파일을 엽니다.
2. 파일의 최하단에 있는 아래 배포용 서빙 코드 영역의 주석(`//`)을 제거하여 코드를 활성화합니다:

**[수정 전]**
```javascript
// //! build for web deployment
// import path from 'path';
// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, '/frontend/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
// });
```

**[수정 후]**
```javascript
//! build for web deployment
import path from 'path';
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});
```
3. 수정 사항을 저장하고 깃허브(GitHub) 리포지토리에 커밋 후 푸시합니다.

---

### 7.2. Render.com 계정 가입 및 서비스 생성
1. [Render 공식 사이트](https://render.com)에 접속하여 **GitHub 계정**으로 가입/로그인합니다.
2. Render 대시보드 우측 상단의 **[New +]** 파란색 버튼을 클릭한 뒤, **[Web Service]**를 선택합니다.
3. 내 GitHub 계정과 연동한 뒤, 배포할 이 프로젝트의 리포지토리(Repository) 옆에 있는 **[Connect]** 버튼을 클릭합니다.

---

### 7.3. 웹 서비스 기본 정보 설정
연결이 완료되면 상세 정보를 입력하는 화면이 나옵니다. 초보자분들은 아래 규칙에 맞춰 기입해 주세요.

* **Name**: 프로젝트의 고유 이름을 기입합니다 (예: `my-react-chat-app`). 이 이름은 웹 사이트 주소(`https://my-react-chat-app.onrender.com`)로도 사용됩니다.
* **Region**: 사용자와 가까운 지역을 선택합니다 (예: `Singapore` 또는 `Oregon`).
* **Branch**: 배포할 기준 브랜치를 지정합니다 (일반적으로 `main` 또는 `master`).
* **Root Directory**: 빈칸으로 비워둡니다 (프로젝트 전체 루트 디렉토리 기준).
* **Runtime**: `Node`를 선택합니다.
* **Build Command**: 프로젝트를 배포 서버에서 빌드하기 위한 명령어입니다. 다음 명령어를 기입합니다:
  ```bash
  npm run build
  ```
  *(💡 설명: 이 명령어는 백엔드와 프론트엔드의 패키지를 설치하고, React 웹 리소스를 빌드하여 `frontend/dist` 디렉토리에 빌드 파일을 컴파일해 줍니다.)*
* **Start Command**: 서버를 구동하기 위한 명령어입니다. 다음 명령어를 기입합니다:
  ```bash
  npm start
  ```
* **Instance Type**: 가장 아래에 있는 **Free** 플랜을 선택하여 비용이 발생하지 않도록 합니다.

---

### 7.4. 환경 변수 (Environment Variables) 추가
데이터베이스 연결과 파일 업로드 등을 처리하기 위한 중요 정보들을 서버에 등록해야 합니다.

1. 설정 페이지 내의 **[Advanced]** 버튼을 누르거나, 메뉴 중 **[Variables]** 탭을 클릭합니다.
2. 로컬 실행 시 `.env` 파일에 기록했던 정보들을 **[Add Environment Variable]**을 눌러 하나씩 동일하게 입력합니다.

| Key (이름) | Value (값) | 설명 |
| :--- | :--- | :--- |
| `PORT` | `3000` | 서버 포트 번호 |
| `NODE_ENV` | `production` | 프로덕션 배포 모드로 지정 |
| `MONGO_DB_URI` | `mongodb+srv://...` | MongoDB 커넥션 스트링 |
| `JWT_SECRET` | `내_비밀_jwt_시그니처_문자열` | 사용자 토큰 서명용 키 |
| `CLOUDINARY_CLOUD_NAME` | `내_클라우디너리_이름` | Cloudinary 클라우드 이름 |
| `CLOUDINARY_API_KEY` | `내_클라우디너리_API_키` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `내_클라우디너리_비밀키` | Cloudinary API Secret |

---

### 7.5. 최종 배포 및 확인
1. 모든 설정을 마쳤다면 가장 하단의 **[Create Web Service]** 버튼을 클릭합니다.
2. 자동으로 실시간 빌드 및 배포 과정(Logs)이 시작됩니다.
3. 약 2~5분 정도 소요되며, 화면에 `Build successful`과 `Common log: Web service is running` 로그가 찍히면 배포 성공입니다!
4. 화면 좌측 상단에 노출된 고유 URL 주소(예: `https://my-react-chat-app.onrender.com`)를 클릭하면 전 세계 어디서나 실시간으로 웹 채팅 앱에 접속할 수 있습니다.

---

<a id="section-8"></a>
## [8. 📦 모바일 빌드 및 배포 가이드 (Expo Build & Release)](#table-of-contents)

이 가이드는 Expo Application Services(EAS)를 사용하여 모바일 애플리케이션을 빌드하고 배포하는 전체 과정을 설명합니다. EAS는 복잡한 로컬 네이티브 환경(Xcode 및 Android Studio) 설치 없이 클라우드 서버에서 모바일 앱을 빌드할 수 있게 도와주는 최고의 도구입니다.

---

### 8.1. 사전 준비 사항 (Prerequisites)
EAS 빌드를 사용하려면 다음 준비물이 필요합니다.
1. **Expo 회원가입**: [Expo 공식 홈페이지](https://expo.dev)에서 계정을 만드세요.
2. **Node.js 설치**: 이미 로컬 실행 단계에서 설치했다면 준비 완료입니다.

---

### 8.2. EAS CLI 도구 설치 및 로그인
컴퓨터에 Expo 빌드용 명령줄 도구(EAS CLI)를 설치하고 가입한 계정으로 로그인해야 합니다.

1. **EAS CLI 전역(Global) 설치** (터미널에서 실행):
   ```bash
   npm install -g eas-cli
   ```
2. **Expo 계정 로그인**:
   ```bash
   eas login
   ```
   * 터미널에 사용자 이름(Username) 또는 이메일과 비밀번호를 입력하라는 메시지가 나타납니다. 가입한 Expo 정보를 입력해 로그인합니다.

---

### 8.3. 모바일 프로젝트 EAS 설정 초기화
모바일 코드가 있는 `mobile/` 폴더 안으로 이동하여 설정을 수행합니다.

1. **모바일 폴더로 이동**:
   ```bash
   cd mobile
   ```
2. **EAS 프로젝트 초기화**:
   ```bash
   eas project:init
   ```
   * 이 명령어는 Expo 계정 대시보드와 내 컴퓨터의 로컬 프로젝트를 연동해 줍니다.
3. **EAS 빌드 구성 생성**:
   ```bash
   eas build:configure
   ```
   * 이 단계를 거치면 프로젝트 루트에 `eas.json` 파일이 자동 생성됩니다. 이 파일은 앱이 빌드되는 방식(개발용, 테스트용, 출시용)을 정의합니다.

---

### 8.4. 초보자를 위한 eas.json 팁: iOS 테스트용 빌드 설정 (시뮬레이터 vs 실기기)
iOS 앱을 테스트하는 방법은 크게 두 가지가 있습니다. macOS의 시뮬레이터에서 실행하는 방법과 내 실제 아이폰(실기기)에 직접 설치해서 테스트하는 방법입니다.
`mobile/eas.json` 파일을 열고 `"preview_simulator"`와 `"preview_device"` 프로필 설정을 다음과 같이 구성해 주세요.

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview_simulator": {
      "distribution": "internal",
      "ios": {
        "simulator": true  // 💡 중요: iOS 시뮬레이터(Mac)에서 바로 실행 가능한 전용 빌드를 생성하도록 설정!
      }
    },
    "preview_device": {
      "distribution": "internal"  // 💡 중요: 실제 아이폰(실기기)에 ad-hoc으로 직접 다운로드하여 설치할 빌드 설정!
    },
    "production": {}
  }
}
```

> [!NOTE]
> iOS 실기기 테스트용 빌드(`preview_device`)를 진행하려면 애플 유료 개발자 계정($99/년)이 연동되어 있어야 합니다. 빌드 진행 중 EAS가 애플 개발자 계정 로그인을 요구하며 인증서와 프로비저닝 프로파일을 클라우드에서 자동으로 생성해 줍니다.

---

### 8.5. EAS 클라우드 빌드 시작하기
다음 명령어 중 원하는 플랫폼과 용도에 맞춰 터미널에 입력합니다. (반드시 `mobile/` 디렉토리 내에서 실행해야 합니다.)

#### 📱 Android 테스트용 (APK 파일로 설치하기)
실기기 Android 폰에 다운로드 링크를 통해 바로 설치하고자 할 때 유용합니다.
```bash
eas build --platform android --profile preview
```
* **빌드 완료 후**: 빌드가 완료되면 터미널과 Expo 대시보드에 **QR 코드**와 **다운로드 링크**가 제공됩니다. 스마트폰 카메라로 QR 코드를 스캔하여 바로 설치하세요.

#### 📱 Android 구글 플레이 스토어 배포용 (AAB 파일)
실제 플레이 스토어 출시를 준비할 때 사용하는 파일 형태입니다.
```bash
eas build --platform android --profile production
```

#### 🍏 iOS 시뮬레이터 테스트용 (Mac용)
macOS 컴퓨터에서 가동되는 iOS 시뮬레이터에 설치하기 위한 빌드입니다.
```bash
eas build --platform ios --profile preview_simulator
```

#### 🍏 iOS 실기기 테스트용 (Ad-Hoc 파일로 아이폰에 설치하기)
내 실제 아이폰에 설치 링크나 QR 코드를 통해 직접 설치하여 테스트하고자 할 때 사용합니다.
```bash
eas build --platform ios --profile preview_device
```
* **빌드 완료 후**: 빌드가 완료되면 터미널에 표시되는 QR 코드를 **내 아이폰 카메라**로 스캔하여 다운로드 페이지로 접속하고 앱을 직접 기기에 설치할 수 있습니다. (기기 등록 과정이 자동으로 연동됨)

#### 🍏 iOS 앱스토어 배포용 (IPA 파일)
실제 애플 앱스토어 제출을 위한 빌드입니다. (애플 개발자 프로그램 유료 계정 가입 필요)
```bash
eas build --platform ios --profile production
```

> [!NOTE]
> * 빌드를 시작하면 Expo의 클라우드 서버 대기열에 진입하고 컴파일이 원격으로 진행됩니다. 
> * 진행 중에 구글/애플 인증서(Credentials) 자동 생성 여부를 묻는 질문이 나오면, 엔터(Yes)를 눌러 Expo가 안전하게 처리하도록 권장합니다.

---

### 8.6. 앱스토어 제출하기 (EAS Submit)
빌드가 완벽하게 끝나 완료된 빌드 번호가 생성되었다면, 스토어 대시보드로 수동 업로드할 필요 없이 터미널 명령어 하나로 즉시 앱을 마켓에 제출(원격 전송)할 수 있습니다.

* **Android (Google Play Console 제출)**:
  ```bash
  eas submit --platform android
  ```
* **iOS (App Store Connect 제출)**:
  ```bash
  eas submit --platform ios
  ```

> [!IMPORTANT]
> 실제 스토어 배포 전, `mobile/app.json` 파일의 `android.package` 및 `ios.bundleIdentifier`가 고유한 패키지 이름(예: `com.username.reactchat`)으로 지정되어 있는지 확인하세요. 그렇지 않으면 스토어 제출 단계에서 중복 오류가 발생합니다.

### 8.7. 제출 이후의 진행 과정 (App Store Release Lifecycle)
EAS CLI를 통해 업로드가 완료된 후 스토어에 최종 출시되기까지의 과정은 다음과 같이 진행됩니다.

1. **업로드 직후: Apple의 자동 검증 (`Processing`)**
   * 전송 명령을 입력하자마자 즉시 심사가 시작되는 것은 아닙니다.
   * **검증 과정**: Apple 서버가 빌드 파일을 수신하면 압축을 풀고, 내부적으로 코드 서명(Code Signing), 앱 권한(Entitlements), `Info.plist` 설정의 올바름 여부를 자동으로 검사합니다.
   * **대시보드 표시**: 이 검증이 진행되는 동안 [App Store Connect](https://appstoreconnect.apple.com) 대시보드상에는 빌드 상태가 **'처리 중(Processing)'**으로 표기됩니다. (이 단계에서는 심사 신청을 할 수 없습니다.)

2. **빌드 준비 완료 (`Build Available`)**
   * 약 10분~30분 뒤 Apple의 자동 검증이 완료되면 '처리 중' 상태가 사라지고 **'빌드 선택'** 버튼이 활성화됩니다.
   * 이제 준비된 빌드 버전을 현재 출시 예정인 스토어 버전에 연결할 수 있습니다.

3. **스토어 메타데이터 작성 및 심사 제출 (`Submit for Review`)**
   * 명령어로 빌드 파일을 '업로드'한 단계는 파일만 올려둔 상태입니다. 반드시 스토어 웹페이지에서 **'제출'**을 수동으로 해주어야 합니다.
   * **정보 입력**: 마케팅 문구, 스크린샷, 개인정보 처리방침 URL, 연락처 및 심사관용 테스트 로그인 계정 정보를 작성합니다.
   * **심사 요청**: 모든 정보 기재가 완료되면 우측 상단의 **'심사 대기 중(Submit for Review)'** 버튼을 클릭하여 Apple에 심사를 정식으로 위임합니다.

4. **심사 대기 및 진행 (`In Review`)**
   * **심사 대기 중 (Waiting for Review)**: 심사관의 배정을 기다리는 대기열 상태입니다.
   * **심사 중 (In Review)**: Apple 심사관이 앱을 기기에 다운로드해 직접 실행하며 가이드라인 준수 여부를 테스트하는 단계입니다.

5. **최종 결과 확인 (`Approved` 또는 `Rejected`)**
   * **승인 (Approved)**: 심사를 통과하여 배포 가능한 상태입니다. '자동 배포'를 설정해 두었다면 즉시 마켓에 노출되고, 그렇지 않은 경우 수동으로 '출시' 버튼을 누르면 스토어에 업로드됩니다.
   * **거절 (Rejected)**: 가이드라인 위반 사항이나 버그 발견 시 거절 메일이 발송됩니다. App Store Connect의 해결 센터(Resolution Center)를 통해 거절 사유(예: 권한 설명 부족, 테스트 계정 로그인 실패 등)를 확인한 뒤 소스 코드를 수정하여 새로운 빌드를 올려 재심사를 요청해야 합니다.

---

### 💡 기억해 두어야 할 체크 포인트
* **성공 메일 확인**: 빌드가 클라우드 자동 검증을 통과하여 준비가 완료되면 Apple 계정 메일로 `"Successfully uploaded"` 안내 메일이 오게 됩니다. 만약 메일이 오지 않는다면 터미널 로그의 오류 메시지를 다시 점검하십시오.
* **활동(Activity) 탭 활용**: [App Store Connect](https://appstoreconnect.apple.com)의 **'활동'** 메뉴에서 업로드된 역대 모든 빌드의 처리 상태를 실시간으로 확인할 수 있습니다.
* **심사 자동화(Advanced)**: 빌드 업로드부터 메타데이터 입력, 심사 제출 버튼 클릭 과정까지 모두 자동화하고 싶다면 **Fastlane** 도구(`fastlane deliver` 또는 `fastlane supply`)의 도입을 장기적으로 검토해 보십시오.

--- END OF FILE ---