# React Chat 프로젝트 분석 및 아키텍처 가이드

이 문서에서는 현재 프로젝트의 상태를 분석하고, 개발 규칙(User Rules)에 따른 웹 풀스택 프로젝트 구축 방향과 디렉토리 구조를 정리합니다.

---

## 1. 현재 프로젝트 상태 분석

현재 프로젝트 폴더(`react-chat/`)의 구조는 다음과 같습니다.

```
react-chat/
 ├─ backend/       # 현재 빈 디렉토리
 └─ frontend/      # Vite + React 기반으로 초기화된 상태
```

### Frontend 분석 (`frontend/`):
- **빌드 도구**: Vite (v8.0.12)
- **프레임워크**: React (v19.2.6) & React-DOM (v19.2.6)
- **주요 파일 구성**:
  - `index.html`: Entry point HTML 파일.
  - `src/main.jsx`: `App.jsx`를 마운트하는 진입점 JavaScript 파일.
  - `src/App.jsx`: "Hello world!!"를 렌더링하는 기본 컴포넌트.
  - `src/index.css`: 현재 비어 있는 CSS 파일.
  - `package.json` 및 `eslint.config.js`, `vite.config.js` 설정 파일들.

### Backend 분석 (`backend/`):
- 현재 폴더만 생성되어 있고, 소스 파일 및 패키지 설정이 존재하지 않는 비어 있는 상태입니다.

---

## 2. 권장 기술 스택 (Technical Stack)

글로벌 개발 원칙에 따라 본 프로젝트는 아래의 기술 스택을 기반으로 웹 풀스택 애플리케이션으로 구축되어야 합니다.

### Backend
- **Runtime**: Node.js (ES Modules 사용)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) 및 `bcryptjs` 비밀번호 해싱
- **Environment Variables**: `dotenv`
- **File Management**: Cloudinary (프로필/이미지 업로드 및 호스팅)
- **Development Tool**: `nodemon` (핫 리로드 지원)

### Frontend
- **Framework**: React (함수형 컴포넌트 & Hooks 사용)
- **Routing**: React Router
- **State Management**: Zustand + AsyncStorage (JWT 및 유저 정보 영구 저장)
- **Network**: Fetch API
- **Styling**: Tailwind CSS

---

## 3. 권장 디렉토리 구조 (Directory Structure)

본 프로젝트는 아래 구조를 표준으로 유지해야 합니다. 
- **루트 디렉토리**는 백엔드 패키지(`package.json`)를 관리하며, 백엔드 소스 파일은 모두 `backend/` 폴더 내에서 관리됩니다.
- **frontend/` 디렉토리**는 프론트엔드 패키지(`package.json`)를 관리하며, 모든 프론트엔드 소스 파일은 `frontend/src/` 내부에서 관리됩니다.

```
react-chat/
 ├─ backend/             # 백엔드 모든 소스 파일
 │   ├─ controllers/     # API 요청 처리 비즈니스 로직
 │   ├─ routes/          # API 엔드포인트 라우트 정의
 │   ├─ models/          # Mongoose 스키마 및 모델
 │   ├─ lib/             # DB 연결, Cloudinary 설정, 토큰 생성 등 라이브러리 및 유틸
 │   ├─ middleware/      # 인증 및 기타 미들웨어 정의
 │   └─ server.js        # 백엔드 Entry Point (미들웨어, 환경 설정, 서버 실행)
 ├─ frontend/            # 프론트엔드 패키지 관리 디렉토리
 │   ├─ public/          # 정적 에셋
 │   ├─ src/             # 프론트엔드 소스 코드
 │   │   ├─ components/  # 재사용 가능한 UI 컴포넌트
 │   │   ├─ pages/       # 페이지 단위 컴포넌트 (Auth, Home 등)
 │   │   ├─ store/       # Zustand를 활용한 전역 상태 관리
 │   │   ├─ App.jsx      # 메인 레이아웃 및 라우팅 설정
 │   │   ├─ index.css    # 메인 스타일 (Tailwind CSS 포함)
 │   │   └─ main.jsx     # 프론트엔드 Entry Point
 │   ├─ index.html       # entry HTML
 │   └─ package.json     # 프론트엔드 의존성 관리
 ├─ .env                 # Backend 환경 변수 (PORT, MONGO_URI, JWT_SECRET, Cloudinary 등)
 └─ package.json         # 백엔드 의존성 관리 (루트 수준)
```

---

## 4. 향후 구현 단계 (Roadmap)

1. **Backend 초기화**:
   - 루트 경로(`react-chat/`)에서 `npm init`을 수행하여 백엔드용 `package.json`을 생성하고 `"type": "module"` 설정을 추가합니다.
   - `express`, `mongoose`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `cloudinary` 등을 설치하고 개발용으로 `nodemon`을 추가합니다.
   - 루트 경로에 `.env` 파일을 구성하여 필요한 인증 키 및 포트 설정을 준비합니다.
   - `backend/server.js` 및 라우트/컨트롤러/모델 구조를 설계합니다.

2. **Frontend 고도화**:
   - `frontend` 폴더 내에 Tailwind CSS 설정을 추가합니다.
   - `react-router-dom`을 추가하여 페이지 라우팅 구조를 설계합니다.
   - `zustand`를 이용하여 인증 및 사용자 상태를 영구 저장(localStorage/AsyncStorage 등)할 수 있는 스토어를 구현합니다.
   - 실시간 채팅 기능을 위한 소켓 통신 혹은 API 통신 설정을 추가합니다.
